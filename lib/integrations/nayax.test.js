import { describe, it, expect } from 'vitest';
import { mapNayaxMachine, mapNayaxMachineProduct, mapNayaxSale, asArray, loadCatalogFromNayax } from './nayax.js';

describe('Nayax field mappers', () => {
  it('maps a machine to normalized shape (externalId from MachineID)', () => {
    expect(mapNayaxMachine({ MachineID: 42, MachineName: 'BC Vending', GeoAddress: 'Bryan Center', GeoLatitude: 36.001, GeoLongitude: -78.94 }))
      .toMatchObject({ externalId: '42', name: 'BC Vending', building: 'Bryan Center', latitude: 36.001, longitude: -78.94, status: 'active' });
  });
  it('maps a planogram entry using DEXProductName + price fallback', () => {
    expect(mapNayaxMachineProduct({ DEXProductName: 'Celsius', MachinePrice: 2.5 }))
      .toEqual({ productName: 'Celsius', price: 2.5, available: true });
    expect(mapNayaxMachineProduct({ DEXProductName: 'Water', CashPrice: 1.25 }).price).toBe(1.25);
  });
  it('skips unnamed planogram slots', () => {
    expect(mapNayaxMachineProduct({ DEXProductName: '', MachinePrice: 2 })).toBeNull();
  });
  it('maps a sale (SettlementValue → price, Auth time → soldAt)', () => {
    expect(mapNayaxSale({ ProductName: 'Celsius', Quantity: 1, SettlementValue: 2.5, AuthorizationDateTimeGMT: '2026-06-14T10:00:00Z' }))
      .toEqual({ productName: 'Celsius', quantity: 1, price: 2.5, soldAt: '2026-06-14T10:00:00Z' });
  });
  it('asArray tolerates bare arrays and enveloped responses', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray({ Items: [{ a: 1 }] })).toEqual([{ a: 1 }]);
    expect(asArray({ nothing: 5 })).toEqual([]);
  });
});

describe('loadCatalogFromNayax (fake fetch)', () => {
  // Fake Lynx: 1 machine, 2 planogram products (one unnamed → skipped), 1 sale.
  const routes = {
    '/v1/machines?ResultsLimit=100&ResultsOffset=0': [{ MachineID: 1, MachineName: 'BC', GeoAddress: 'Bryan Center', GeoLatitude: 36, GeoLongitude: -78.9 }],
    '/v1/machines/1/machineProducts': [
      { DEXProductName: 'Celsius', MachinePrice: 2.5 },
      { DEXProductName: '', MachinePrice: 1 }, // unnamed → skipped
    ],
    '/v1/machines/1/lastSales': [{ ProductName: 'Celsius', Quantity: 2, SettlementValue: 5, AuthorizationDateTimeGMT: '2026-06-14T10:00:00Z' }],
  };
  const fakeFetch = async (url) => {
    const path = url.replace('https://lynx.nayax.com/operational', '');
    const body = routes[path];
    return { ok: body !== undefined, status: body === undefined ? 404 : 200, json: async () => body };
  };

  it('builds a NormalizedCatalog from machines + planogram (+ sales when requested)', async () => {
    const cat = await loadCatalogFromNayax({ token: 'tok', includeSales: true, fetchImpl: fakeFetch });
    expect(cat.machines).toHaveLength(1);
    expect(cat.machines[0]).toMatchObject({ externalId: '1', name: 'BC', building: 'Bryan Center' });
    expect(cat.products.map(p => p.name)).toEqual(['Celsius']); // unnamed slot skipped
    expect(cat.inventory).toEqual([{ machineRef: '1', productName: 'Celsius', available: true, price: 2.5 }]);
    expect(cat.sales).toEqual([{ machineRef: '1', productName: 'Celsius', quantity: 2, price: 5, soldAt: '2026-06-14T10:00:00Z' }]);
    expect(cat.errors).toEqual([]);
  });

  it('omits sales when includeSales is false', async () => {
    const cat = await loadCatalogFromNayax({ token: 'tok', includeSales: false, fetchImpl: fakeFetch });
    expect(cat.sales).toEqual([]);
    expect(cat.inventory).toHaveLength(1);
  });

  it('records an error and returns empties on a missing token', async () => {
    const cat = await loadCatalogFromNayax({ token: '', fetchImpl: fakeFetch });
    expect(cat.machines).toEqual([]);
    expect(cat.errors[0].reason).toMatch(/token/i);
  });
});
