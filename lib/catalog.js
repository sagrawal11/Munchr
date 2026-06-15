// Read the vending catalog from Supabase, shaped exactly like the static
// src/data/vendingMachines.js entries so the rest of the app needs no changes:
//   { id, name, location:[lat,lng], building, floor, notes, creditCardOnly, products:[names] }
//
// Resilient by design: if the DB isn't migrated yet (tables missing) or anything
// errors, this returns [] and callers fall back to the static file. No regression.

import { createClient } from '@supabase/supabase-js';

export function mapMachineRow(row) {
  const items = (row.machine_inventory || [])
    .filter(inv => inv.available !== false); // hide products an operator marked unavailable
  const products = items.map(inv => inv.products?.name).filter(Boolean).sort();
  // Freshness = most recent inventory update among available items. ISO strings compare
  // lexicographically, so a string max is a valid "latest". null when no timestamps.
  const timestamps = items.map(inv => inv.updated_at).filter(Boolean);
  const lastUpdated = timestamps.length ? timestamps.reduce((a, b) => (a > b ? a : b)) : null;
  return {
    id: row.id,
    name: row.name,
    location: [row.latitude, row.longitude],
    building: row.building,
    floor: row.floor || '',
    notes: row.notes || '',
    creditCardOnly: !!row.credit_card_only,
    products,
    lastUpdated,
  };
}

export async function fetchMachinesFromDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('machines')
      .select('id,name,building,floor,notes,latitude,longitude,credit_card_only, machine_inventory(available, updated_at, products(name))')
      .order('id');
    if (error || !data) return [];
    return data.map(mapMachineRow);
  } catch {
    return [];
  }
}
