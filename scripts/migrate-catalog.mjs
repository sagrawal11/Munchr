// Migrate the static vending catalog (src/data/vendingMachines.js) into Supabase.
// Idempotent: re-running upserts the same rows. Run AFTER applying the
// 20260614000000_catalog_schema.sql migration in Supabase.
//
//   node scripts/migrate-catalog.mjs --dry-run   # validate derivation, no DB writes
//   node scripts/migrate-catalog.mjs             # upsert into Supabase (uses service role)
//
// Reads SUPABASE creds from .env.local (no dependency on dotenv).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { vendingMachines } from '../src/data/vendingMachines.js';
import { categorizeProduct, getProductLabel } from '../src/data/productCategories.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Campus derivation — mirrors getMachineCampus in app/page.js.
const campusBuildings = {
  west: ['LSRC', 'Physics', 'Teer', 'Wilkinson', 'Rueben Cooke', 'Social Sciences', 'Allen', 'Perkins', 'Wu', 'BC', 'Flowers', 'Few', 'Wilson Recreation Center', 'Craven', 'Wannamaker', 'Crowell', 'Kilgo', 'Fitzpatrick', 'Keohane', 'Arts Annex', 'Rubenstein Arts Center'],
  east: ['Pegram', 'Bassett', 'Brown', 'Alspaugh', 'Giles', 'Wilson Residence', 'West House', 'Eastern Union', 'West Duke', 'Brodie', 'Blackwell', 'Randolph', 'Bell Tower', 'Trinity', 'Southgate', 'Gilbert Addoms', 'Classroom', 'Biddle', 'Friedl'],
};
function deriveCampus(building) {
  if (campusBuildings.west.some(b => building.includes(b))) return 'west';
  if (campusBuildings.east.some(b => building.includes(b))) return 'east';
  return 'west';
}

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    /* fall through to process.env */
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

// ---- Derive the three tables from the static data ----
function deriveRows() {
  const machineRows = vendingMachines.map(m => ({
    id: m.id,
    name: m.name,
    building: m.building,
    floor: m.floor || null,
    notes: m.notes || null,
    latitude: m.location[0],
    longitude: m.location[1],
    campus: deriveCampus(m.building),
    credit_card_only: !!m.creditCardOnly,
  }));

  // Unique products across all machines, with computed category + label.
  const productNames = new Set();
  vendingMachines.forEach(m => (m.products || []).forEach(p => productNames.add(p)));
  const productRows = [...productNames].sort().map(name => ({
    name,
    category: categorizeProduct(name),
    label: getProductLabel(name),
  }));

  // Inventory pairs (machine name → product name); product_id resolved after insert.
  const inventoryPairs = [];
  vendingMachines.forEach(m => {
    (m.products || []).forEach(name => inventoryPairs.push({ machine_id: m.id, productName: name }));
  });

  return { machineRows, productRows, inventoryPairs };
}

async function main() {
  const { machineRows, productRows, inventoryPairs } = deriveRows();

  console.log('── Catalog derivation ──');
  console.log(`machines:          ${machineRows.length}`);
  console.log(`unique products:   ${productRows.length}`);
  console.log(`inventory rows:    ${inventoryPairs.length}`);
  console.log('\nsample machine:', JSON.stringify(machineRows[0]));
  console.log('sample products:', productRows.slice(0, 5).map(p => `${p.name} [${p.label}]`).join(', '));
  const campusCounts = machineRows.reduce((a, m) => ((a[m.campus] = (a[m.campus] || 0) + 1), a), {});
  console.log('campus split:', JSON.stringify(campusCounts));

  if (DRY_RUN) {
    console.log('\n[dry-run] No DB writes performed.');
    return;
  }

  const { url, serviceKey } = loadEnv();
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL / SERVICE_ROLE_KEY. Aborting.');
    process.exit(1);
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1) machines
  let res = await supabase.from('machines').upsert(machineRows, { onConflict: 'id' });
  if (res.error) throw new Error(`machines upsert: ${res.error.message}`);
  console.log(`\n✓ upserted ${machineRows.length} machines`);

  // 2) products — upsert by name, select back to map name → id
  res = await supabase.from('products').upsert(productRows, { onConflict: 'name' }).select('id,name');
  if (res.error) throw new Error(`products upsert: ${res.error.message}`);
  const idByName = new Map(res.data.map(r => [r.name, r.id]));
  console.log(`✓ upserted ${productRows.length} products`);

  // 3) inventory — resolve product ids, dedupe (some machines list a product twice),
  //    then upsert in chunks.
  const seen = new Set();
  const inventoryRows = inventoryPairs
    .map(p => ({ machine_id: p.machine_id, product_id: idByName.get(p.productName) }))
    .filter(r => {
      if (r.product_id == null) return false;
      const key = `${r.machine_id}:${r.product_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const CHUNK = 500;
  for (let i = 0; i < inventoryRows.length; i += CHUNK) {
    const chunk = inventoryRows.slice(i, i + CHUNK);
    res = await supabase.from('machine_inventory').upsert(chunk, { onConflict: 'machine_id,product_id' });
    if (res.error) throw new Error(`inventory upsert (chunk ${i}): ${res.error.message}`);
  }
  console.log(`✓ upserted ${inventoryRows.length} inventory rows`);
  console.log('\nDone. Catalog migrated to Supabase.');
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
