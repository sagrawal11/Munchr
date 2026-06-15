import { describe, it, expect } from 'vitest';
import { parseCsv, buildCatalogFromCsv, guessMapping, normBool, normPrice, normNum, normStr } from './csv.js';

describe('guessMapping', () => {
  it('maps common header names to canonical fields without reusing a header', () => {
    const m = guessMapping(['Machine ID', 'Machine Name', 'Building', 'Product', 'Price', 'Status', 'Units Sold']);
    expect(m.machineExternalId).toBe('Machine ID');
    expect(m.machineName).toBe('Machine Name');
    expect(m.building).toBe('Building');
    expect(m.productName).toBe('Product');
    expect(m.price).toBe('Price');
    expect(m.available).toBe('Status');
    expect(m.quantity).toBe('Units Sold');
  });
  it('handles a minimal machine+product export', () => {
    const m = guessMapping(['Machine', 'Product']);
    expect(m.machineName).toBe('Machine');
    expect(m.productName).toBe('Product');
  });
});

describe('field normalizers', () => {
  it('normPrice strips currency symbols', () => {
    expect(normPrice('$2.50')).toBe(2.5);
    expect(normPrice('3')).toBe(3);
    expect(normPrice('')).toBeUndefined();
    expect(normPrice('n/a')).toBeUndefined();
  });
  it('normNum parses integers', () => {
    expect(normNum('12')).toBe(12);
    expect(normNum('qty: 5')).toBe(5);
    expect(normNum('')).toBeUndefined();
  });
  it('normBool maps availability words', () => {
    expect(normBool('in stock')).toBe(true);
    expect(normBool('YES')).toBe(true);
    expect(normBool('sold out')).toBe(false);
    expect(normBool('0')).toBe(false);
    expect(normBool('maybe')).toBeUndefined();
    expect(normBool('')).toBeUndefined();
  });
  it('normStr trims and empties', () => {
    expect(normStr('  hi ')).toBe('hi');
    expect(normStr('   ')).toBeUndefined();
  });
});

describe('parseCsv', () => {
  it('parses headers + rows', () => {
    const { headers, rows } = parseCsv('Machine,Product\nBC,Celsius\nWu,Pepsi');
    expect(headers).toEqual(['Machine', 'Product']);
    expect(rows).toEqual([{ Machine: 'BC', Product: 'Celsius' }, { Machine: 'Wu', Product: 'Pepsi' }]);
  });
  it('handles quoted fields with embedded commas and quotes', () => {
    const { rows } = parseCsv('Name,Note\n"Reese\'s, Cups","He said ""hi"""');
    expect(rows[0]).toEqual({ Name: "Reese's, Cups", Note: 'He said "hi"' });
  });
  it('handles embedded newlines inside quotes', () => {
    const { rows } = parseCsv('A,B\n"line1\nline2",x');
    expect(rows[0].A).toBe('line1\nline2');
  });
  it('skips blank lines and tolerates a trailing newline', () => {
    const { rows } = parseCsv('Machine,Product\nBC,Celsius\n\n');
    expect(rows).toHaveLength(1);
  });
  it('returns empty for empty input', () => {
    expect(parseCsv('')).toEqual({ headers: [], rows: [] });
  });
});

describe('buildCatalogFromCsv', () => {
  const mapping = {
    machineName: 'Machine', building: 'Building', productName: 'Product',
    price: 'Price', available: 'Status', quantity: 'Sold',
  };
  const csv = [
    'Machine,Building,Product,Price,Status,Sold',
    'BC Vending,Bryan Center,Celsius,$2.50,in stock,4',
    'BC Vending,Bryan Center,Doritos,1.75,sold out,0',
    'Wu Vending,Broadhead,Pepsi,2.00,yes,',
  ].join('\n');

  const cat = buildCatalogFromCsv(csv, mapping);

  it('dedupes machines by ref and merges metadata', () => {
    expect(cat.machines).toHaveLength(2);
    const bc = cat.machines.find(m => m.name === 'BC Vending');
    expect(bc.building).toBe('Bryan Center');
  });
  it('collects unique sorted products', () => {
    expect(cat.products.map(p => p.name)).toEqual(['Celsius', 'Doritos', 'Pepsi']);
  });
  it('builds inventory with availability + price', () => {
    expect(cat.inventory).toHaveLength(3);
    const doritos = cat.inventory.find(i => i.productName === 'Doritos');
    expect(doritos).toMatchObject({ machineRef: 'BC Vending', available: false, price: 1.75 });
  });
  it('emits sales rows only when sales columns are present', () => {
    // "4" and "0" are present (quantity), the Pepsi row has blank Sold → no sale
    expect(cat.sales).toHaveLength(2);
    expect(cat.sales[0]).toMatchObject({ productName: 'Celsius', quantity: 4 });
  });
  it('records errors for rows missing machine or product', () => {
    const bad = buildCatalogFromCsv('Machine,Product\n,Celsius\nBC,', { machineName: 'Machine', productName: 'Product' });
    expect(bad.errors).toHaveLength(2);
    expect(bad.errors[0]).toMatchObject({ row: 2, reason: 'Missing machine name/id' });
  });
  it('defaults availability to true when no status column is mapped', () => {
    const c = buildCatalogFromCsv('M,P\nBC,Water', { machineName: 'M', productName: 'P' });
    expect(c.inventory[0].available).toBe(true);
  });
});
