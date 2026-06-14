// Demand Report computation — the flagship "what students wanted but couldn't find" artifact.
//
// Pure, framework-agnostic functions. Given raw analytics_events (see lib/analytics.js
// for the event shapes) and the machine catalog (src/data/vendingMachines.js), this
// produces the quantified report that leads every operator conversation.
//
// Design note: we deliberately rely on each search event's own `result_count` and the
// explicit `no_results_returned` events to measure unmet demand, rather than re-deriving
// coverage. That keeps the numbers consistent with what students actually experienced.

// Conservative, transparent defaults. These are shown in the report so the figures are
// never a black box. avgVendPrice = typical campus vend price; conversionRate = the
// fraction of unmet searches we assume would have converted to a sale if stocked nearby.
export const REPORT_DEFAULTS = {
  avgVendPrice: 2.0,
  conversionRate: 0.15,
  minSearchesForRec: 3,
  thinStockThreshold: 2, // stocked in this many machines or fewer = "thinly stocked"
};

function normalize(str) {
  return (str || '').toString().toLowerCase().trim();
}

// A search query "matches" a stocked product if either name contains the other.
// e.g. "doritos" matches "Doritos Nacho Cheese"; "celsius" matches "Celsius".
function queryMatchesProduct(query, product) {
  const q = normalize(query);
  const p = normalize(product);
  if (!q || !p) return false;
  return p.includes(q) || q.includes(p);
}

// Build an index of the catalog: how many machines stock each (searched) product,
// and which buildings carry it.
function buildStockIndex(machines) {
  return {
    machineCountForQuery(query) {
      let count = 0;
      for (const m of machines) {
        if ((m.products || []).some(prod => queryMatchesProduct(query, prod))) count += 1;
      }
      return count;
    },
    buildingsForQuery(query) {
      const buildings = new Set();
      for (const m of machines) {
        if ((m.products || []).some(prod => queryMatchesProduct(query, prod))) {
          if (m.building) buildings.add(m.building);
        }
      }
      return Array.from(buildings);
    },
  };
}

function tallyBy(items, keyFn) {
  const counts = {};
  for (const it of items) {
    const key = keyFn(it);
    if (key === null || key === undefined || key === '') continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function topN(counts, n, labelKey = 'label') {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ [labelKey]: label, count }));
}

/**
 * @param {Array} events  rows from analytics_events
 * @param {Array} machines  vending machine catalog
 * @param {Object} opts  overrides for REPORT_DEFAULTS
 * @returns structured report object ready to render
 */
export function computeDemandReport(events, machines, opts = {}) {
  const cfg = { ...REPORT_DEFAULTS, ...opts };
  const stock = buildStockIndex(machines);

  const searches = events.filter(e => e.event_type === 'search_performed');
  const noResults = events.filter(e => e.event_type === 'no_results_returned');
  const machineClicks = events.filter(e => e.event_type === 'machine_clicked');
  const directionsClicks = events.filter(e => e.event_type === 'directions_clicked');

  // --- Headline demand signal ---
  const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;

  // --- Top searched products (demand) ---
  const queryCounts = tallyBy(searches, e => e.query);
  const topSearches = topN(queryCounts, 10, 'product');

  // --- Unmet demand: zero-result searches ---
  // Combine explicit no_results_returned events with searches whose result_count was 0.
  // We treat the explicit no_results_returned stream as authoritative (every zero-result
  // search fires one), so we count from it rather than re-deriving from result_count.
  const zeroResultByQuery = {};
  for (const e of noResults) {
    if (e.query) zeroResultByQuery[e.query] = (zeroResultByQuery[e.query] || 0) + 1;
  }
  const totalUnmetSearches = Object.values(zeroResultByQuery).reduce((a, b) => a + b, 0);
  const unmetProducts = topN(zeroResultByQuery, 10, 'product').map(item => ({
    ...item,
    machinesStocking: stock.machineCountForQuery(item.product),
  }));

  // --- Thinly-stocked high-demand: searched a lot, stocked in very few machines ---
  const thinlyStocked = Object.entries(queryCounts)
    .map(([product, count]) => ({
      product,
      count,
      machinesStocking: stock.machineCountForQuery(product),
    }))
    .filter(it => it.count >= cfg.minSearchesForRec && it.machinesStocking > 0 && it.machinesStocking <= cfg.thinStockThreshold)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // --- Where students look for machines (high-intent building demand) ---
  const buildingClicks = tallyBy(machineClicks, e => e.building_id);
  const topBuildings = topN(buildingClicks, 10, 'building');
  const directionsByBuilding = tallyBy(directionsClicks, e => e.building_id);
  const topDirections = topN(directionsByBuilding, 5, 'building');

  // Total search demand = searches that found something + searches that found nothing.
  // Note: the app fires `no_results_returned` INSTEAD of `search_performed` for a
  // zero-result search (see app/page.js), so the two streams are disjoint and additive.
  const totalSearchAttempts = searches.length + totalUnmetSearches;

  // --- Searches by hour of day (timing of demand) — include both streams ---
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const e of [...searches, ...noResults]) {
    if (!e.timestamp) continue;
    const d = new Date(e.timestamp);
    const h = d.getHours();
    if (h >= 0 && h < 24) byHour[h].count += 1;
  }

  // --- Estimated lost revenue (transparent, conservative) ---
  const estimatedLostRevenue = Math.round(
    totalUnmetSearches * cfg.avgVendPrice * cfg.conversionRate
  );

  // --- Rule-based recommendations (simple, explainable — no AI) ---
  const recommendations = [];
  for (const item of unmetProducts) {
    if (item.count < cfg.minSearchesForRec) continue;
    if (item.machinesStocking === 0) {
      recommendations.push({
        type: 'add_product',
        priority: item.count,
        text: `Add "${item.product}" to the catalog — searched ${item.count} time${item.count !== 1 ? 's' : ''} with no in-stock result anywhere on campus.`,
      });
    } else {
      recommendations.push({
        type: 'expand_availability',
        priority: item.count,
        text: `Expand "${item.product}" — ${item.count} searches returned no nearby result, though it's stocked in ${item.machinesStocking} machine${item.machinesStocking !== 1 ? 's' : ''}. Add it to higher-traffic machines.`,
      });
    }
  }
  for (const item of thinlyStocked) {
    recommendations.push({
      type: 'thinly_stocked',
      priority: item.count,
      text: `"${item.product}" is searched ${item.count} times but stocked in only ${item.machinesStocking} machine${item.machinesStocking !== 1 ? 's' : ''}. Consider wider placement.`,
    });
  }
  recommendations.sort((a, b) => b.priority - a.priority);

  return {
    config: cfg,
    headline: {
      totalSearches: totalSearchAttempts,
      uniqueSessions,
      machineViews: machineClicks.length,
      directionsClicks: directionsClicks.length,
      totalUnmetSearches,
      noResultRate: totalSearchAttempts > 0 ? totalUnmetSearches / totalSearchAttempts : 0,
      estimatedLostRevenue,
    },
    topSearches,
    unmetProducts,
    thinlyStocked,
    topBuildings,
    topDirections,
    byHour,
    recommendations: recommendations.slice(0, 8),
  };
}
