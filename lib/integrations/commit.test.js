import { describe, it, expect } from 'vitest';
import { planCommit } from './commit.js';

const catalog = {
  machines: [
    { name: 'BC Vending', building: 'Bryan Center' },          // matches existing by name
    { externalId: 'EXT-9', name: 'New Machine', building: 'X' }, // new
  ],
  products: [{ name: 'Celsius' }, { name: 'New Snack' }],
  inventory: [{ machineRef: 'BC Vending', productName: 'Celsius', available: true }],
  sales: [{ machineRef: 'BC Vending', productName: 'Celsius', quantity: 3 }],
  errors: [],
};
const existingMachines = [{ id: 1, name: 'BC Vending', external_id: null }];
const existingProducts = [{ id: 50, name: 'Celsius' }];

describe('planCommit', () => {
  const plan = planCommit(catalog, existingMachines, existingProducts);

  it('matches machines by name (case/space-insensitive) and flags new ones', () => {
    expect(plan.machines.matched).toHaveLength(1);
    expect(plan.machines.matched[0].id).toBe(1);
    expect(plan.machines.new).toHaveLength(1);
    expect(plan.machines.new[0].name).toBe('New Machine');
  });

  it('matches products by name and flags new ones', () => {
    expect(plan.products.matched).toEqual([{ name: 'Celsius', id: 50 }]);
    expect(plan.products.new).toEqual([{ name: 'New Snack' }]);
  });

  it('matches a machine by external_id when present', () => {
    const plan2 = planCommit(
      { machines: [{ externalId: 'EXT-9', name: 'Renamed' }], products: [], inventory: [], sales: [], errors: [] },
      [{ id: 7, name: 'Old Name', external_id: 'EXT-9' }],
      [],
    );
    expect(plan2.machines.matched[0].id).toBe(7); // matched by external_id despite name change
    expect(plan2.machines.new).toHaveLength(0);
  });

  it('summarizes counts for the preview', () => {
    expect(plan.counts).toMatchObject({
      machinesMatched: 1, machinesNew: 1, productsMatched: 1, productsNew: 1,
      inventoryRows: 1, salesRows: 1, errors: 0,
    });
  });
});
