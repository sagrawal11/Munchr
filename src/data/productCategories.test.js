import { describe, it, expect } from 'vitest';
import { categorizeProduct, getProductLabel, groupProductsByCategory } from './productCategories.js';

describe('getProductLabel', () => {
  const cases = [
    ['Coke Zero', 'Diet Soda'],
    ['Pepsi Zero Sugar', 'Diet Soda'],
    ['Diet Mountain Dew', 'Diet Soda'],
    ['Celsius', 'Energy Drink'],
    ['Monster', 'Energy Drink'],
    ['Gatorade', 'Sports Drink'],
    ['Propel', 'Sports Drink'],
    ['Fairlife Core Power', 'Protein Shake'],
    ['Starbucks Cold Brew', 'Coffee'],
    ['Pure Leaf Sweet Tea', 'Tea'],
    ['Apple Juice', 'Juice'],
    ['Water', 'Water'],
    ['Topo Chico', 'Water'],
    ['Coca Cola', 'Soda'],
    ['Mountain Dew', 'Soda'],
    ['Cheerwine', 'Soda'],
    ['Sunkist Orange', 'Soda'],
    ['Doritos Nacho Cheese', 'Chips'],
    ['Lays Classic', 'Chips'],
    ['Smartfood White Cheddar Popcorn', 'Popcorn'],
    ['Mini Pretzels', 'Pretzels'],
    ['Cheez It', 'Crackers'],
    ['Peanut Butter Crackers', 'Crackers'], // "peanut" must not win over crackers
    ['Oreos', 'Cookies'],
    ['Haribo Gummy Bears', 'Gummies'],
    ["Reese's Peanut Butter Cups", 'Chocolate'], // chocolate beats nuts
    ['Snickers', 'Chocolate'],
    ['Gatorade Protein Bar', 'Protein Bar'], // bar beats the "gatorade" drink rule
    ['Clif Bar Chocolate Chip', 'Protein Bar'], // bar beats "chocolate"
    ['Nature Valley Granola Bar', 'Granola Bar'],
    ['Cashews', 'Nuts'],
    ['Slim Jim', 'Jerky'],
    ['Big Honey Bun', 'Pastry'],
    ['Tuna Salad', 'Snack'], // graceful fallback
  ];

  it.each(cases)('labels %s as %s', (product, expected) => {
    expect(getProductLabel(product)).toBe(expected);
  });

  it('never throws on empty/garbage input', () => {
    expect(getProductLabel('')).toBe('Snack');
    expect(getProductLabel(null)).toBe('Snack');
    expect(getProductLabel(undefined)).toBe('Snack');
  });
});

describe('categorizeProduct', () => {
  it('maps products to the five broad buckets used for grouping', () => {
    expect(categorizeProduct('Celsius')).toBe('Energy/Electrolyte Drinks');
    expect(categorizeProduct('Coca Cola')).toBe('Sodas & Drinks');
    expect(categorizeProduct('Doritos Nacho Cheese')).toBe('Chips & Savory Snacks');
    expect(categorizeProduct('Snickers')).toBe('Candy & Sweets');
    expect(categorizeProduct('Trail Mix')).toBe('Healthy Snacks');
  });
});

describe('groupProductsByCategory', () => {
  it('groups a product list into category buckets', () => {
    const grouped = groupProductsByCategory(['Coca Cola', 'Doritos Nacho Cheese', 'Sprite']);
    expect(grouped['Sodas & Drinks']).toContain('Coca Cola');
    expect(grouped['Sodas & Drinks']).toContain('Sprite');
    expect(grouped['Chips & Savory Snacks']).toContain('Doritos Nacho Cheese');
  });
});
