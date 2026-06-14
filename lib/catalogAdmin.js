// Write operations for the operator inventory editor. Each takes the caller's
// (session-authenticated) Supabase client so RLS sees an authenticated operator.
// Pure helpers are separated out so they can be unit-tested without a DB.

import { categorizeProduct, getProductLabel } from '../src/data/productCategories.js';

// Build the products-table row for a name, computing its category + label.
export function buildProductRow(name) {
  const clean = (name || '').trim();
  return { name: clean, category: categorizeProduct(clean), label: getProductLabel(clean) };
}

export async function updateMachine(supabase, id, fields) {
  return supabase.from('machines').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function addMachine(supabase, machine) {
  return supabase.from('machines').insert(machine).select().single();
}

export async function setProductAvailability(supabase, inventoryId, available) {
  return supabase
    .from('machine_inventory')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('id', inventoryId);
}

export async function removeInventoryItem(supabase, inventoryId) {
  return supabase.from('machine_inventory').delete().eq('id', inventoryId);
}

// Add a product to a machine: find-or-create the product by name, then link it.
// Returns { error } on the first failure, or { data: inventoryRow }.
export async function addProductToMachine(supabase, machineId, productName) {
  const name = (productName || '').trim();
  if (!name) return { error: { message: 'Product name is required' } };

  const prod = await supabase
    .from('products')
    .upsert(buildProductRow(name), { onConflict: 'name' })
    .select('id,name,label')
    .single();
  if (prod.error) return { error: prod.error };

  const inv = await supabase
    .from('machine_inventory')
    .upsert(
      { machine_id: machineId, product_id: prod.data.id, available: true, updated_at: new Date().toISOString() },
      { onConflict: 'machine_id,product_id' }
    )
    .select('id, available, products(id,name,label)')
    .single();
  return inv;
}

// Next machine id, since machines.id is not auto-generated (we preserved numeric ids).
export function nextMachineId(machines) {
  return machines.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
}
