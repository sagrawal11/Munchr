import { describe, it, expect } from 'vitest';
import {
  buildProductRow,
  nextMachineId,
  updateMachine,
  setProductAvailability,
  removeInventoryItem,
  addProductToMachine,
} from './catalogAdmin.js';

// Minimal chainable Supabase mock. Records the chain; terminal ops (eq/single)
// resolve a canned response keyed by table name.
function mockClient(byTable = {}) {
  const calls = [];
  function builder() {
    const b = { table: null };
    const resolve = () => Promise.resolve(byTable[b.table] ?? { data: {}, error: null });
    b.from = t => { b.table = t; calls.push(['from', t]); return b; };
    b.update = p => { calls.push(['update', p]); return b; };
    b.insert = p => { calls.push(['insert', p]); return b; };
    b.upsert = (p, o) => { calls.push(['upsert', p, o]); return b; };
    b.delete = () => { calls.push(['delete']); return b; };
    b.select = c => { calls.push(['select', c]); return b; };
    b.eq = (col, val) => { calls.push(['eq', col, val]); return resolve(); };
    b.single = () => { calls.push(['single']); return resolve(); };
    return b;
  }
  return { client: { from: t => builder().from(t) }, calls };
}

describe('buildProductRow', () => {
  it('computes category and label and trims the name', () => {
    expect(buildProductRow('  Celsius ')).toEqual({
      name: 'Celsius',
      category: 'Energy/Electrolyte Drinks',
      label: 'Energy Drink',
    });
  });
});

describe('nextMachineId', () => {
  it('returns max id + 1', () => {
    expect(nextMachineId([{ id: 1 }, { id: 5 }, { id: 3 }])).toBe(6);
  });
  it('starts at 1 for an empty catalog', () => {
    expect(nextMachineId([])).toBe(1);
  });
});

describe('updateMachine', () => {
  it('updates the machines table by id', async () => {
    const { client, calls } = mockClient();
    await updateMachine(client, 7, { name: 'New Name' });
    expect(calls).toContainEqual(['from', 'machines']);
    expect(calls.find(c => c[0] === 'update')[1]).toMatchObject({ name: 'New Name' });
    expect(calls).toContainEqual(['eq', 'id', 7]);
  });
});

describe('setProductAvailability', () => {
  it('updates availability on an inventory row by id', async () => {
    const { client, calls } = mockClient();
    await setProductAvailability(client, 42, false);
    expect(calls).toContainEqual(['from', 'machine_inventory']);
    expect(calls.find(c => c[0] === 'update')[1]).toMatchObject({ available: false });
    expect(calls).toContainEqual(['eq', 'id', 42]);
  });
});

describe('removeInventoryItem', () => {
  it('deletes an inventory row by id', async () => {
    const { client, calls } = mockClient();
    await removeInventoryItem(client, 99);
    expect(calls).toContainEqual(['from', 'machine_inventory']);
    expect(calls).toContainEqual(['delete']);
    expect(calls).toContainEqual(['eq', 'id', 99]);
  });
});

describe('addProductToMachine', () => {
  it('rejects an empty product name without touching the DB', async () => {
    const { client, calls } = mockClient();
    const res = await addProductToMachine(client, 1, '   ');
    expect(res.error).toBeTruthy();
    expect(calls).toEqual([]);
  });

  it('upserts the product then links it to the machine', async () => {
    const { client, calls } = mockClient({
      products: { data: { id: 200, name: 'Celsius', label: 'Energy Drink' }, error: null },
      machine_inventory: { data: { id: 5, available: true, products: { id: 200, name: 'Celsius' } }, error: null },
    });
    const res = await addProductToMachine(client, 1, 'Celsius');
    expect(res.error).toBeFalsy();
    expect(res.data).toMatchObject({ id: 5, available: true });
    expect(calls).toContainEqual(['from', 'products']);
    expect(calls).toContainEqual(['from', 'machine_inventory']);
  });

  it('stops and returns the error if the product upsert fails', async () => {
    const { client, calls } = mockClient({
      products: { data: null, error: { message: 'boom' } },
    });
    const res = await addProductToMachine(client, 1, 'Celsius');
    expect(res.error).toEqual({ message: 'boom' });
    expect(calls).not.toContainEqual(['from', 'machine_inventory']);
  });
});
