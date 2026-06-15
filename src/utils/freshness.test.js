import { describe, it, expect } from 'vitest';
import { formatFreshness } from './freshness.js';

const NOW = new Date('2026-06-15T12:00:00Z').getTime();
const daysAgo = (n) => new Date(NOW - n * 86400000).toISOString();

describe('formatFreshness', () => {
  it('says "Updated today" for same-day timestamps', () => {
    expect(formatFreshness(daysAgo(0), NOW)).toBe('Updated today');
  });
  it('says "Updated yesterday" for ~1 day', () => {
    expect(formatFreshness(daysAgo(1), NOW)).toBe('Updated yesterday');
  });
  it('says "Updated N days ago" for older', () => {
    expect(formatFreshness(daysAgo(5), NOW)).toBe('Updated 5 days ago');
  });
  it('says "Inventory unknown" for null/invalid', () => {
    expect(formatFreshness(null, NOW)).toBe('Inventory unknown');
    expect(formatFreshness('not-a-date', NOW)).toBe('Inventory unknown');
  });
});
