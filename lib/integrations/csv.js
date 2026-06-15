// CSV connector: parse a (possibly messy) operator export into Munchr's NormalizedCatalog.
// Pure + dependency-free so it's fully unit-testable. See README.md for the shapes.

// ---- Field normalizers ----
export function normStr(v) {
  const s = (v ?? '').toString().trim();
  return s.length ? s : undefined;
}

export function normPrice(v) {
  if (v == null || v === '') return undefined;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); // strip $, spaces, etc.
  return Number.isFinite(n) ? n : undefined;
}

export function normNum(v) {
  if (v == null || v === '') return undefined;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

const TRUE_WORDS = new Set(['yes', 'y', 'true', '1', 'available', 'in stock', 'instock', 'stocked', 'active']);
const FALSE_WORDS = new Set(['no', 'n', 'false', '0', 'out', 'out of stock', 'sold out', 'soldout', 'unavailable', 'empty', 'inactive']);
// Returns true/false, or undefined when the value doesn't clearly indicate availability.
export function normBool(v) {
  const s = (v ?? '').toString().trim().toLowerCase();
  if (!s) return undefined;
  if (TRUE_WORDS.has(s)) return true;
  if (FALSE_WORDS.has(s)) return false;
  return undefined;
}

// ---- RFC-4180-ish CSV parser (quotes, embedded commas/newlines, "" escapes) ----
export function parseCsv(text) {
  const s = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const records = [];
  let field = '';
  let record = [];
  let inQuotes = false;
  let sawAny = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true; sawAny = true;
    } else if (c === ',') {
      record.push(field); field = ''; sawAny = true;
    } else if (c === '\n') {
      record.push(field); records.push(record); record = []; field = ''; sawAny = false;
    } else {
      field += c; sawAny = true;
    }
  }
  if (sawAny || field.length) { record.push(field); records.push(record); }

  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map(h => h.trim());
  const rows = records.slice(1)
    .filter(r => r.some(c => c.trim() !== '')) // drop blank lines
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
      return obj;
    });
  return { headers, rows };
}

// ---- Build a NormalizedCatalog from parsed rows + a column mapping ----
// mapping maps canonical fields → the operator's CSV header names. Only `machineName`
// (or `machineExternalId`) and `productName` are required to produce inventory rows.
export function buildCatalogFromCsv(csvText, mapping = {}) {
  const { rows } = parseCsv(csvText);
  const machinesByRef = new Map();
  const productNames = new Set();
  const inventory = [];
  const sales = [];
  const errors = [];

  const get = (row, field) => (mapping[field] ? row[mapping[field]] : undefined);

  rows.forEach((row, idx) => {
    const externalId = normStr(get(row, 'machineExternalId'));
    const name = normStr(get(row, 'machineName'));
    const ref = externalId || name;
    const productName = normStr(get(row, 'productName'));

    if (!ref) { errors.push({ row: idx + 2, reason: 'Missing machine name/id' }); return; }
    if (!productName) { errors.push({ row: idx + 2, reason: 'Missing product name' }); return; }

    // Merge machine metadata across its rows (last non-empty wins).
    const existing = machinesByRef.get(ref) || { externalId, name: name || ref };
    const merged = {
      ...existing,
      externalId: existing.externalId || externalId,
      name: existing.name || name || ref,
      building: normStr(get(row, 'building')) ?? existing.building,
      floor: normStr(get(row, 'floor')) ?? existing.floor,
      latitude: normPrice(get(row, 'latitude')) ?? existing.latitude,
      longitude: normPrice(get(row, 'longitude')) ?? existing.longitude,
      creditCardOnly: normBool(get(row, 'creditCardOnly')) ?? existing.creditCardOnly,
      status: normStr(get(row, 'status')) ?? existing.status,
    };
    machinesByRef.set(ref, merged);

    productNames.add(productName);

    const available = normBool(get(row, 'available'));
    inventory.push({
      machineRef: ref,
      productName,
      available: available === undefined ? true : available,
      price: normPrice(get(row, 'price')),
    });

    // A sales row only when sales-ish columns are mapped + present.
    const quantity = normNum(get(row, 'quantity'));
    const soldAt = normStr(get(row, 'soldAt'));
    if (quantity !== undefined || soldAt) {
      sales.push({ machineRef: ref, productName, quantity, price: normPrice(get(row, 'price')), soldAt });
    }
  });

  return {
    machines: Array.from(machinesByRef.values()),
    products: Array.from(productNames).sort().map(name => ({ name })),
    inventory,
    sales,
    errors,
  };
}

// Canonical fields the CSV mapping understands (order = display order in the UI).
export const CSV_FIELDS = [
  { key: 'machineName', label: 'Machine name', required: true },
  { key: 'machineExternalId', label: 'Machine ID / serial' },
  { key: 'building', label: 'Building / location' },
  { key: 'floor', label: 'Floor' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'creditCardOnly', label: 'Credit-card only' },
  { key: 'productName', label: 'Product name', required: true },
  { key: 'price', label: 'Price' },
  { key: 'available', label: 'Availability / status' },
  { key: 'quantity', label: 'Units sold (qty)' },
  { key: 'soldAt', label: 'Sold-at timestamp' },
];

// Best-effort auto-map of CSV headers → canonical fields by header name. The operator can
// correct it in the UI; each header is used at most once.
export function guessMapping(headers = []) {
  const m = {};
  const used = new Set();
  const find = (re) => headers.find(h => !used.has(h) && re.test(h.toLowerCase()));
  const set = (field, re) => { const h = find(re); if (h) { m[field] = h; used.add(h); } };
  set('machineExternalId', /(machine|device).*(id|serial)|^serial|external/);
  set('machineName', /machine|vending|asset|location name/);
  set('building', /building|location|site/);
  set('floor', /floor/);
  set('latitude', /\blat\b|latitude/);
  set('longitude', /\blong\b|\blng\b|\blon\b|longitude/);
  set('creditCardOnly', /credit/);
  set('productName', /product|item|snack|sku/);
  set('price', /price|cost/);
  set('available', /status|avail|in.?stock/);
  set('quantity', /sold|\bqty\b|quantity|units|sales/);
  set('soldAt', /sold.?at|date|time|timestamp/);
  return m;
}

// Connector descriptor — uniform shape across providers (see README).
export const csvConnector = {
  id: 'csv',
  label: 'CSV / spreadsheet export',
  loadCatalog: ({ csvText, mapping }) => buildCatalogFromCsv(csvText, mapping),
};
