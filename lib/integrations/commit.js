// Plan + apply a NormalizedCatalog (from any connector) against the existing DB catalog.
// planCommit is PURE (testable): it decides which machines/products are new vs. matched.
// commitCatalog executes the plan via Supabase (needs the 20260615 integrations migration).

import { buildProductRow } from '../catalogAdmin.js';
import { nextMachineId } from '../catalogAdmin.js';

const norm = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

// Decide matches without touching the DB. Match machines by external_id, else by name;
// products by name. Returns the plan + a summary count for the preview UI.
export function planCommit(catalog, existingMachines = [], existingProducts = []) {
  const byExt = new Map(existingMachines.filter(m => m.external_id).map(m => [m.external_id, m]));
  const byName = new Map(existingMachines.map(m => [norm(m.name), m]));

  const matchedMachines = [];
  const newMachines = [];
  for (const m of catalog.machines) {
    const hit = (m.externalId && byExt.get(m.externalId)) || byName.get(norm(m.name));
    if (hit) matchedMachines.push({ ref: m.externalId || m.name, id: hit.id, machine: m });
    else newMachines.push(m);
  }

  const prodByName = new Map(existingProducts.map(p => [norm(p.name), p]));
  const matchedProducts = [];
  const newProducts = [];
  for (const p of catalog.products) {
    const hit = prodByName.get(norm(p.name));
    if (hit) matchedProducts.push({ name: p.name, id: hit.id });
    else newProducts.push(p);
  }

  return {
    machines: { matched: matchedMachines, new: newMachines },
    products: { matched: matchedProducts, new: newProducts },
    counts: {
      machinesMatched: matchedMachines.length,
      machinesNew: newMachines.length,
      productsMatched: matchedProducts.length,
      productsNew: newProducts.length,
      inventoryRows: catalog.inventory.length,
      salesRows: catalog.sales.length,
      errors: catalog.errors.length,
    },
  };
}

// Execute the plan. Inserts new machines/products, upserts inventory (availability+price),
// inserts sales, and records an import-history row. Requires the integrations migration.
export async function commitCatalog(supabase, catalog, orgId = null) {
  // Multi-tenant: when an orgId is provided (post-cutover), every written row is stamped with it
  // so RLS scopes it to this operator's org. When null (pre-cutover), behavior is unchanged.
  const withOrg = (row) => (orgId != null ? { ...row, org_id: orgId } : row);
  const [{ data: existingMachines }, { data: existingProducts }] = await Promise.all([
    supabase.from('machines').select('id,name,external_id'),
    supabase.from('products').select('id,name'),
  ]);
  const plan = planCommit(catalog, existingMachines || [], existingProducts || []);

  // 1) New machines — assign ids (machines.id is not auto-generated).
  let nextId = nextMachineId(existingMachines || []);
  const machineIdByRef = new Map(plan.machines.matched.map(m => [norm(m.machine.name), m.id]));
  plan.machines.matched.forEach(m => { if (m.machine.externalId) machineIdByRef.set(m.machine.externalId, m.id); });

  const machineRows = plan.machines.new.map(m => {
    const id = nextId++;
    machineIdByRef.set(norm(m.name), id);
    if (m.externalId) machineIdByRef.set(m.externalId, id);
    return withOrg({
      id, name: m.name, building: m.building || 'Unknown', floor: m.floor || null,
      latitude: m.latitude ?? 0, longitude: m.longitude ?? 0,
      credit_card_only: !!m.creditCardOnly, status: m.status || 'active', external_id: m.externalId || null,
    });
  });
  if (machineRows.length) {
    const r = await supabase.from('machines').upsert(machineRows, { onConflict: 'id' });
    if (r.error) return { error: r.error };
  }

  // 2) New products.
  if (plan.products.new.length) {
    const r = await supabase.from('products').upsert(plan.products.new.map(p => buildProductRow(p.name)), { onConflict: 'name' });
    if (r.error) return { error: r.error };
  }
  const { data: allProducts } = await supabase.from('products').select('id,name');
  const productIdByName = new Map((allProducts || []).map(p => [norm(p.name), p.id]));

  const refToMachineId = (ref) => machineIdByRef.get(ref) ?? machineIdByRef.get(norm(ref));

  // 3) Inventory upsert.
  const invRows = catalog.inventory
    .map(i => withOrg({ machine_id: refToMachineId(i.machineRef), product_id: productIdByName.get(norm(i.productName)), available: i.available, price: i.price ?? null, updated_at: new Date().toISOString() }))
    .filter(r => r.machine_id != null && r.product_id != null);
  // Dedupe (machine_id, product_id) — a machine may list a product twice in the export.
  const seen = new Set();
  const dedupInv = invRows.filter(r => { const k = `${r.machine_id}:${r.product_id}`; if (seen.has(k)) return false; seen.add(k); return true; });
  for (let i = 0; i < dedupInv.length; i += 500) {
    const r = await supabase.from('machine_inventory').upsert(dedupInv.slice(i, i + 500), { onConflict: 'machine_id,product_id' });
    if (r.error) return { error: r.error };
  }

  // 4) Sales insert (append-only).
  const saleRows = catalog.sales
    .map(s => withOrg({ machine_id: refToMachineId(s.machineRef), product_id: productIdByName.get(norm(s.productName)), quantity: s.quantity ?? null, price: s.price ?? null, sold_at: s.soldAt || null, source: 'csv' }))
    .filter(r => r.machine_id != null);
  for (let i = 0; i < saleRows.length; i += 500) {
    const r = await supabase.from('sales').insert(saleRows.slice(i, i + 500));
    if (r.error) return { error: r.error };
  }

  // 5) Import-history audit row.
  await supabase.from('imports').insert(withOrg({
    source: 'csv',
    machines_new: plan.counts.machinesNew, machines_matched: plan.counts.machinesMatched,
    products_new: plan.counts.productsNew, inventory_rows: dedupInv.length,
    sales_rows: saleRows.length, errors: plan.counts.errors,
  }));

  return { plan, applied: { machines: machineRows.length, inventory: dedupInv.length, sales: saleRows.length } };
}
