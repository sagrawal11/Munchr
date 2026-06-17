// Generate the illustrative sample dataset that powers the public /demo page.
//
//   node scripts/generate-demo-dataset.mjs
//
// Writes lib/demo/sampleDemandData.js — a synthetic, clearly-labeled set of
// analytics_events that demonstrates what Munchr's demand intelligence looks like.
//
// IMPORTANT: this is NOT real measured analytics and is NEVER inserted into the
// production analytics_events table. It exists only so the /demo page can render a
// realistic-feeling dashboard for outreach. It is deterministic (seeded PRNG) so
// re-running produces the same fixture.
//
// Event rows match the analytics_events schema (supabase/migrations/...initial_schema.sql)
// and the event-type allowlist in app/api/track/route.js.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeDemandReport } from '../lib/demandReport.js';
import { vendingMachines } from '../src/data/vendingMachines.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'lib', 'demo');
const OUT_FILE = join(OUT_DIR, 'sampleDemandData.js');

// Scale multiplier — the demo shows what a fully-deployed fleet looks like, so we blow the
// base volumes up to convey magnitude. Override on the CLI: `node scripts/...mjs 50`.
const SCALE = Math.max(1, Number(process.argv[2]) || 100);

// Demand-lost assumptions for the DEMO ONLY (passed as opts to computeDemandReport, so the
// real /operator dashboard keeps its own conservative defaults). Here every unmet search is
// valued as a missed sale at vend price — counting all unmet demand in full.
const DEMO_OPTS = { avgVendPrice: 2.5, conversionRate: 1.0 };

// ---- Deterministic PRNG (mulberry32) ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x4d554e43); // "MUNC"

const rand = () => rng();
const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pad = n => String(n).padStart(2, '0');

// Weighted pick: items is [{...,w}], optional multiplier fn(item) -> number
function pickWeighted(items, multFn) {
  let total = 0;
  const weights = items.map(it => {
    const w = it.w * (multFn ? multFn(it) : 1);
    total += w;
    return w;
  });
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ---- Eastern-time offset (so the hour-of-day histogram reads correctly for an
//      Eastern viewer). US DST: 2nd Sun Mar → 1st Sun Nov. ----
const dst = [
  [Date.UTC(2025, 2, 9), Date.UTC(2025, 10, 2)],
  [Date.UTC(2026, 2, 8), Date.UTC(2026, 10, 1)],
];
function easternOffset(Y, M, D) {
  const t = Date.UTC(Y, M - 1, D);
  const isDST = dst.some(([s, e]) => t >= s && t < e);
  return isDST ? '-04:00' : '-05:00';
}

// ---- Academic-calendar segments (intensity-weighted). Spring is weighted a bit
//      heavier — that's the window the outreach story leans on. ----
const SEGMENTS = [
  { start: '2025-08-25', end: '2025-10-05', w: 1.0, finals: false },
  { start: '2025-10-06', end: '2025-10-24', w: 1.4, finals: false }, // fall midterms
  { start: '2025-10-25', end: '2025-11-21', w: 1.0, finals: false },
  { start: '2025-11-22', end: '2025-11-30', w: 0.2, finals: false }, // thanksgiving
  { start: '2025-12-01', end: '2025-12-13', w: 2.0, finals: true },  // fall finals
  { start: '2026-01-08', end: '2026-02-15', w: 1.2, finals: false }, // spring ramp
  { start: '2026-02-16', end: '2026-03-06', w: 1.5, finals: false }, // spring midterms
  { start: '2026-03-07', end: '2026-03-15', w: 0.2, finals: false }, // spring break
  { start: '2026-03-16', end: '2026-04-15', w: 1.4, finals: false },
  { start: '2026-04-16', end: '2026-05-01', w: 2.3, finals: true },  // spring finals
];
const dayMs = 86400000;
function segmentDays(seg) {
  const s = new Date(seg.start + 'T00:00:00Z').getTime();
  const e = new Date(seg.end + 'T00:00:00Z').getTime();
  return Math.round((e - s) / dayMs);
}

// Pick a calendar date + hour. Returns {Y,M,D,hour,min,month0,iso}.
function sampleTimestamp() {
  const seg = pickWeighted(SEGMENTS);
  const offsetDays = randInt(0, segmentDays(seg));
  const d = new Date(new Date(seg.start + 'T00:00:00Z').getTime() + offsetDays * dayMs);
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  let hour;
  // Demand skews afternoon/evening; finals weeks pull a chunk into late-night.
  if (seg.finals && rand() < 0.35) {
    hour = [22, 23, 0, 1, 2][randInt(0, 4)];
  } else {
    hour = pickWeighted(HOUR_WEIGHTS).h;
  }
  const min = randInt(0, 59);
  const iso = `${Y}-${pad(M)}-${pad(D)}T${pad(hour)}:${pad(min)}:00${easternOffset(Y, M, D)}`;
  return { month0: d.getUTCMonth(), iso };
}

// Hour-of-day weights (0–23): low overnight, climb through the day, evening peak.
const HOUR_WEIGHTS = [
  0.4, 0.3, 0.2, 0.1, 0.1, 0.2, 0.5, 1.0, 1.6, 1.8, 2.0, 2.4,
  2.6, 2.3, 2.2, 2.4, 2.6, 2.8, 3.0, 2.8, 2.4, 1.8, 1.2, 0.7,
].map((w, h) => ({ h, w }));

// ---- Seasonal product-mix profiles (multiplier by 0-indexed month) ----
// Energy demand climbs at midterms and spikes hard at finals (Dec, late Apr/May).
const ENERGY = { 7: 0.7, 8: 0.9, 9: 1.4, 10: 1.0, 11: 1.9, 0: 0.8, 1: 1.0, 2: 1.4, 3: 1.6, 4: 2.0 };
// Sports/hydration drinks rise through the spring.
const SPORTS = { 7: 1.0, 8: 1.1, 9: 0.9, 10: 0.8, 11: 0.7, 0: 0.7, 1: 0.9, 2: 1.3, 3: 1.6, 4: 1.7 };
// Everyday snacks: roughly flat.
const FLAT = { 7: 0.85, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 0: 0.9, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0 };

// ---- Search intents ----
// type 'found'  → fires search_performed (product is stocked somewhere)
// type 'unmet'  → fires no_results_returned (genuinely off-catalog; verified absent
//                 from src/data/vendingMachines.js so machinesStocking resolves to 0)
const INTENTS = [
  // Energy (stocked)
  { q: 'Celsius', w: 14, type: 'found', season: ENERGY },
  { q: 'Monster', w: 5, type: 'found', season: ENERGY },
  // Sports / hydration (stocked)
  { q: 'Gatorade', w: 10, type: 'found', season: SPORTS },
  { q: 'Powerade', w: 6, type: 'found', season: SPORTS },
  { q: 'Body Armor', w: 4, type: 'found', season: SPORTS },
  // Everyday (stocked)
  { q: 'Doritos', w: 12, type: 'found', season: FLAT },
  { q: 'Water', w: 9, type: 'found', season: FLAT },
  { q: 'Coca Cola', w: 8, type: 'found', season: FLAT },
  { q: 'Cheez It', w: 7, type: 'found', season: FLAT },
  { q: 'Snickers', w: 6, type: 'found', season: FLAT },
  { q: 'Starbucks', w: 5, type: 'found', season: ENERGY }, // cold-brew demand tracks finals
  { q: 'Pop Tarts', w: 4, type: 'found', season: FLAT },
  { q: 'Goldfish', w: 3, type: 'found', season: FLAT },
  { q: 'Gushers', w: 3, type: 'found', season: FLAT },
  // Popular everyday extras (stocked, widely available)
  { q: 'Pringles', w: 4, type: 'found', season: FLAT },
  { q: 'Sour Patch Kids', w: 3, type: 'found', season: FLAT },
  // Thinly stocked (stocked in only ~2 machines → drives "wider placement" recs)
  { q: 'Bubly', w: 6, type: 'found', season: FLAT },
  { q: 'Sunkist', w: 5, type: 'found', season: FLAT },
  // Unmet (off-catalog) — the headline "wanted but couldn't find" list
  { q: 'Prime', w: 6, type: 'unmet', season: ENERGY },
  { q: 'Alani', w: 5, type: 'unmet', season: ENERGY },
  { q: 'Red Bull', w: 4, type: 'unmet', season: ENERGY },
  { q: 'Takis', w: 4, type: 'unmet', season: FLAT },
  { q: 'Liquid Death', w: 3, type: 'unmet', season: SPORTS },
  { q: 'Muscle Milk', w: 2, type: 'unmet', season: SPORTS },
  { q: 'Kombucha', w: 2, type: 'unmet', season: FLAT },
];

// ---- Buildings (study-heavy weighting) + campus ----
const BUILDINGS = [
  { b: 'Perkins Library', w: 14, campus: 'west' },
  { b: 'Levine Science Research Center', w: 12, campus: 'west' },
  { b: 'Bryan Center', w: 10, campus: 'west' },
  { b: 'Broadhead Center', w: 9, campus: 'west' },
  { b: 'Physics Building', w: 7, campus: 'west' },
  { b: 'Nello L. Teer Building', w: 6, campus: 'west' },
  { b: 'Social Sciences Building', w: 5, campus: 'west' },
  { b: 'Wilson Recreation Center', w: 5, campus: 'west' },
  { b: 'Few Quad', w: 5, campus: 'west' },
  { b: 'Allen Building', w: 3, campus: 'west' },
  { b: 'Bell Tower Residence Hall', w: 6, campus: 'east' },
  { b: 'Randolph Residence Hall', w: 6, campus: 'east' },
  { b: 'Bassett Residence Hall', w: 4, campus: 'east' },
  { b: 'Trinity Residence Hall', w: 4, campus: 'east' },
  { b: 'Brodie Recreation Center', w: 4, campus: 'east' },
  { b: 'Gilbert Addoms Residence Hall', w: 3, campus: 'east' },
  { b: 'West Duke Building', w: 3, campus: 'east' },
  { b: 'Southgate Residence Hall', w: 3, campus: 'east' },
  { b: 'Blackwell Residence Hall', w: 3, campus: 'east' },
];

// ---- Session pool (deterministic pseudo-UUIDs) ----
function makeUuid() {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) s += '-';
    s += hex[Math.floor(rand() * 16)];
  }
  return s;
}
// ~1 unique session per ~8 searches, scaled up.
const SESSION_COUNT = Math.max(30, Math.round((220 * SCALE) / 8));
const SESSIONS = Array.from({ length: SESSION_COUNT }, makeUuid);
const pickSession = () => SESSIONS[randInt(0, SESSIONS.length - 1)];
const pickDevice = () => (rand() < 0.8 ? 'mobile' : 'desktop');

// ---- Generate ----
const TARGETS = { search: 220 * SCALE, machine: 80 * SCALE, directions: 28 * SCALE, app: 30 * SCALE, request: 12 * SCALE };

// What people explicitly request (via the on-machine QR) — skews to trendy off-catalog items.
const REQUEST_ITEMS = [
  { q: 'Prime', w: 8 }, { q: 'Alani', w: 7 }, { q: 'Takis', w: 5 }, { q: 'Red Bull', w: 4 },
  { q: 'Liquid Death', w: 3 }, { q: 'Muscle Milk', w: 3 }, { q: 'Celsius', w: 4 },
  { q: 'Gatorade', w: 3 }, { q: 'Kombucha', w: 2 }, { q: 'Bubly', w: 2 },
];
const events = [];

for (let i = 0; i < TARGETS.search; i++) {
  const { month0, iso } = sampleTimestamp();
  const intent = pickWeighted(INTENTS, it => it.season[month0] ?? 1);
  const base = {
    session_id: pickSession(),
    query: intent.q,
    normalized_query: intent.q.toLowerCase(),
    product_id: null,
    machine_id: null,
    building_id: null,
    campus: rand() < 0.6 ? 'west' : 'east',
    result_count: null,
    device_type: pickDevice(),
    timestamp: iso,
  };
  if (intent.type === 'unmet') {
    events.push({ ...base, event_type: 'no_results_returned', result_count: 0 });
  } else {
    const loc = pickWeighted(BUILDINGS);
    events.push({
      ...base,
      event_type: 'search_performed',
      result_count: randInt(1, 6),
      building_id: loc.b,
      campus: loc.campus,
    });
  }
}

for (let i = 0; i < TARGETS.machine; i++) {
  const { iso } = sampleTimestamp();
  const loc = pickWeighted(BUILDINGS);
  events.push({
    event_type: 'machine_clicked',
    session_id: pickSession(),
    query: null,
    normalized_query: null,
    product_id: null,
    machine_id: `demo-${randInt(1, 37)}`,
    building_id: loc.b,
    campus: loc.campus,
    result_count: null,
    device_type: pickDevice(),
    timestamp: iso,
  });
}

for (let i = 0; i < TARGETS.directions; i++) {
  const { iso } = sampleTimestamp();
  const loc = pickWeighted(BUILDINGS);
  events.push({
    event_type: 'directions_clicked',
    session_id: pickSession(),
    query: null,
    normalized_query: null,
    product_id: null,
    machine_id: `demo-${randInt(1, 37)}`,
    building_id: loc.b,
    campus: loc.campus,
    result_count: null,
    device_type: pickDevice(),
    timestamp: iso,
  });
}

for (let i = 0; i < TARGETS.app; i++) {
  const { iso } = sampleTimestamp();
  events.push({
    event_type: 'app_opened',
    session_id: pickSession(),
    query: rand() < 0.3 ? 'flyer' : 'direct',
    normalized_query: null,
    product_id: null,
    machine_id: null,
    building_id: null,
    campus: null,
    result_count: null,
    device_type: pickDevice(),
    timestamp: iso,
  });
}

for (let i = 0; i < TARGETS.request; i++) {
  const { iso } = sampleTimestamp();
  const loc = pickWeighted(BUILDINGS);
  const item = pickWeighted(REQUEST_ITEMS);
  events.push({
    event_type: 'product_requested',
    session_id: pickSession(),
    query: item.q,
    normalized_query: item.q.toLowerCase(),
    product_id: null,
    machine_id: `demo-${randInt(1, 37)}`,
    building_id: loc.b,
    campus: loc.campus,
    result_count: null,
    device_type: pickDevice(),
    timestamp: iso,
  });
}

// Chronological order, like a real event stream.
events.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

// ---- Aggregate into the demand report at generation time ----
// We ship the small, precomputed report (NOT the raw events) so the /demo bundle stays tiny
// regardless of SCALE. DEMO_OPTS values every unmet search as a missed sale at vend price.
const searches = events.filter(e => e.event_type === 'search_performed');
const noResults = events.filter(e => e.event_type === 'no_results_returned');
const sessions = new Set(events.map(e => e.session_id)).size;
const report = computeDemandReport(events, vendingMachines, DEMO_OPTS);

const meta = {
  academicYear: '2025–26',
  label: 'Aug 2025 – May 2026',
  scale: SCALE,
  totalEvents: events.length,
  searchEvents: searches.length + noResults.length,
  uniqueSessions: sessions,
  note: 'Illustrative at-scale sample — synthetic, not real measured analytics.',
};

console.log('── Demo dataset ──');
console.log(`scale:            ${SCALE}x`);
console.log(`total events:     ${events.length.toLocaleString()}`);
console.log(`searches:         ${(searches.length + noResults.length).toLocaleString()} (found ${searches.length.toLocaleString()}, unmet ${noResults.length.toLocaleString()})`);
console.log(`unique sessions:  ${sessions.toLocaleString()}`);
console.log(`direct requests:  ${report.headline.totalRequests.toLocaleString()}`);
console.log(`est demand lost:  $${report.headline.estimatedLostRevenue.toLocaleString()}`);

const body =
  `// AUTO-GENERATED by scripts/generate-demo-dataset.mjs — do not edit by hand.\n` +
  `//\n` +
  `// Illustrative, at-scale sample for the public /demo page. This is SYNTHETIC and is NOT\n` +
  `// real measured analytics, and it is never written to the production database. It exists\n` +
  `// only to demonstrate what Munchr's demand intelligence looks like at a deployed-fleet scale.\n` +
  `// We store the precomputed report (not raw events) to keep the bundle small.\n` +
  `// Regenerate with: node scripts/generate-demo-dataset.mjs [scale]\n\n` +
  `export const sampleMeta = ${JSON.stringify(meta, null, 2)};\n\n` +
  `export const sampleReport = ${JSON.stringify(report, null, 2)};\n`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, body);
console.log(`\n✓ wrote ${OUT_FILE}`);
