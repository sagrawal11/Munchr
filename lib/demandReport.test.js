import { describe, it, expect } from 'vitest';
import { computeDemandReport, REPORT_DEFAULTS } from './demandReport.js';

// Minimal catalog: Celsius stocked in 1 machine, Coke in 1, nothing else.
const machines = [
  { id: 1, building: 'Bryan Center', products: ['Celsius', 'Doritos Nacho Cheese', 'Water'] },
  { id: 2, building: 'Perkins Library', products: ['Coca Cola', 'Lays Classic'] },
];

const T = '2026-06-14T14:30:00';

function ev(overrides) {
  return { session_id: 's1', timestamp: T, ...overrides };
}

describe('computeDemandReport', () => {
  const events = [
    // found searches
    ev({ event_type: 'search_performed', query: 'celsius', result_count: 1, session_id: 'a' }),
    ev({ event_type: 'search_performed', query: 'celsius', result_count: 1, session_id: 'b' }),
    ev({ event_type: 'search_performed', query: 'doritos', result_count: 1, session_id: 'a' }),
    // unmet (zero-result) searches — fired as no_results_returned
    ev({ event_type: 'no_results_returned', query: 'red bull', session_id: 'c' }),
    ev({ event_type: 'no_results_returned', query: 'red bull', session_id: 'd' }),
    ev({ event_type: 'no_results_returned', query: 'red bull', session_id: 'e' }),
    ev({ event_type: 'no_results_returned', query: 'monster', session_id: 'a' }),
    // engagement
    ev({ event_type: 'machine_clicked', building_id: 'Bryan Center', session_id: 'a' }),
    ev({ event_type: 'machine_clicked', building_id: 'Bryan Center', session_id: 'b' }),
    ev({ event_type: 'directions_clicked', building_id: 'Bryan Center', session_id: 'a' }),
  ];

  const report = computeDemandReport(events, machines);

  it('counts total demand as found + unmet searches (disjoint streams)', () => {
    // 3 search_performed + 4 no_results_returned = 7
    expect(report.headline.totalSearches).toBe(7);
    expect(report.headline.totalUnmetSearches).toBe(4);
  });

  it('computes no-result rate against the full denominator', () => {
    expect(report.headline.noResultRate).toBeCloseTo(4 / 7, 5);
  });

  it('estimates lost revenue transparently from defaults', () => {
    const expected = Math.round(4 * REPORT_DEFAULTS.avgVendPrice * REPORT_DEFAULTS.conversionRate);
    expect(report.headline.estimatedLostRevenue).toBe(expected);
  });

  it('ranks unmet products and flags catalog coverage', () => {
    const top = report.unmetProducts[0];
    expect(top.product).toBe('red bull');
    expect(top.count).toBe(3);
    expect(top.machinesStocking).toBe(0); // not in catalog
  });

  it('recommends adding the most-searched unstocked product', () => {
    const rec = report.recommendations[0];
    expect(rec.type).toBe('add_product');
    expect(rec.text).toContain('red bull');
  });

  it('aggregates building demand from machine clicks', () => {
    expect(report.topBuildings[0]).toEqual({ building: 'Bryan Center', count: 2 });
  });

  it('computes the view→directions conversion rate', () => {
    // 2 machine_clicked, 1 directions_clicked → 0.5
    expect(report.headline.viewToDirectionsRate).toBeCloseTo(0.5, 5);
  });

  it('buckets demand by local hour across both search streams', () => {
    // 3 found + 4 unmet searches all at 14:30 local
    expect(report.byHour[14].count).toBe(7);
  });

  it('returns zeros and no crash on empty input', () => {
    const empty = computeDemandReport([], machines);
    expect(empty.headline.totalSearches).toBe(0);
    expect(empty.headline.noResultRate).toBe(0);
    expect(empty.headline.estimatedLostRevenue).toBe(0);
    expect(empty.recommendations).toEqual([]);
  });
});
