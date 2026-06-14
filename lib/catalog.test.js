import { describe, it, expect } from 'vitest';
import { mapMachineRow } from './catalog.js';

describe('mapMachineRow', () => {
  it('maps a DB row (with embedded inventory) to the app machine shape', () => {
    const row = {
      id: 1,
      name: 'BC Vending Machine',
      building: 'Bryan Center',
      floor: 'Middle Floor',
      notes: 'Near McDonalds',
      latitude: 36.001057,
      longitude: -78.940978,
      credit_card_only: true,
      machine_inventory: [
        { products: { name: 'Celsius' } },
        { products: { name: 'Doritos Nacho Cheese' } },
      ],
    };
    expect(mapMachineRow(row)).toEqual({
      id: 1,
      name: 'BC Vending Machine',
      location: [36.001057, -78.940978],
      building: 'Bryan Center',
      floor: 'Middle Floor',
      notes: 'Near McDonalds',
      creditCardOnly: true,
      products: ['Celsius', 'Doritos Nacho Cheese'], // sorted
    });
  });

  it('sorts products and drops null/missing product joins', () => {
    const row = {
      id: 2,
      name: 'M',
      building: 'B',
      latitude: 1,
      longitude: 2,
      machine_inventory: [
        { products: { name: 'Zebra Cakes' } },
        { products: null },
        { products: { name: 'Apple Juice' } },
      ],
    };
    const mapped = mapMachineRow(row);
    expect(mapped.products).toEqual(['Apple Juice', 'Zebra Cakes']);
  });

  it('excludes products explicitly marked unavailable', () => {
    const row = {
      id: 4, name: 'M', building: 'B', latitude: 1, longitude: 2,
      machine_inventory: [
        { available: true, products: { name: 'Celsius' } },
        { available: false, products: { name: 'Monster' } },
        { products: { name: 'Water' } }, // missing available → treated as available
      ],
    };
    expect(mapMachineRow(row).products).toEqual(['Celsius', 'Water']);
  });

  it('defaults optional fields and handles empty inventory', () => {
    const mapped = mapMachineRow({ id: 3, name: 'M', building: 'B', latitude: 1, longitude: 2 });
    expect(mapped.floor).toBe('');
    expect(mapped.notes).toBe('');
    expect(mapped.creditCardOnly).toBe(false);
    expect(mapped.products).toEqual([]);
  });
});
