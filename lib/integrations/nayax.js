// Nayax Lynx connector. Pulls an operator's machines + planogram (+ optional sales) from
// the Lynx Management API and emits the same NormalizedCatalog shape as the CSV connector,
// so it flows through commitCatalog unchanged. Endpoints/fields verified against
// devzone.nayax.com (2026-06-15). Auth = operator-self-issued static Bearer token.

export const NAYAX_BASE = {
  production: 'https://lynx.nayax.com/operational',
  qa: 'https://qa-lynx.nayax.com/operational',
};

// --- Pure field mappers (unit-testable, no network) ---

export function mapNayaxMachine(m) {
  return {
    externalId: String(m.MachineID),
    name: m.MachineName || m.MachineNumber || `Machine ${m.MachineID}`,
    building: m.GeoAddress || m.GeoCity || m.InstituteLocationName || undefined,
    latitude: m.GeoLatitude ?? m.Latitude,
    longitude: m.GeoLongitude ?? m.Longitude,
    // MachineStatusBit semantics aren't documented; default to active so machines surface.
    status: 'active',
  };
}

// A planogram entry → { productName, price, available } or null if it has no usable name.
export function mapNayaxMachineProduct(mp) {
  const productName = (mp.DEXProductName || '').trim();
  if (!productName) return null; // unnamed slot — useless for a discovery app
  const price = mp.MachinePrice ?? mp.CashPrice ?? mp.RetailPrice ?? undefined;
  return { productName, price: price == null ? undefined : Number(price), available: true };
}

export function mapNayaxSale(s) {
  return {
    productName: (s.ProductName || '').trim(),
    quantity: s.Quantity != null ? Number(s.Quantity) : undefined,
    price: s.SettlementValue ?? s.AuthorizationValue,
    soldAt: s.AuthorizationDateTimeGMT || s.SettlementDateTimeGMT || undefined,
  };
}

// Nayax responses may be a bare array or an envelope ({Items|items|Machines|...}). Be defensive.
export function asArray(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const arr = Object.values(data).find(v => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
}

// --- Orchestration (injectable fetch for tests) ---

export async function loadCatalogFromNayax({ token, env = 'production', includeSales = false, fetchImpl = fetch } = {}) {
  const base = NAYAX_BASE[env] || NAYAX_BASE.production;
  if (!token) return { machines: [], products: [], inventory: [], sales: [], errors: [{ row: 0, reason: 'Missing Nayax token' }] };

  const getJson = async (path) => {
    const res = await fetchImpl(`${base}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Nayax API ${res.status} on ${path}`);
    return res.json();
  };

  const errors = [];

  // 1) All machines (paged).
  const rawMachines = [];
  const LIMIT = 100;
  let offset = 0;
  for (let page = 0; page < 200; page++) { // hard cap: 20k machines
    let batch;
    try {
      batch = asArray(await getJson(`/v1/machines?ResultsLimit=${LIMIT}&ResultsOffset=${offset}`));
    } catch (e) {
      errors.push({ row: 0, reason: e.message });
      break;
    }
    rawMachines.push(...batch);
    if (batch.length < LIMIT) break;
    offset += LIMIT;
  }

  const machines = rawMachines.map(mapNayaxMachine);
  const productNames = new Set();
  const inventory = [];
  const sales = [];

  // 2) Per-machine planogram (+ optional sales).
  for (const m of rawMachines) {
    const ref = String(m.MachineID);
    try {
      const prods = asArray(await getJson(`/v1/machines/${m.MachineID}/machineProducts`));
      for (const mp of prods) {
        const item = mapNayaxMachineProduct(mp);
        if (!item) continue;
        productNames.add(item.productName);
        inventory.push({ machineRef: ref, productName: item.productName, available: item.available, price: item.price });
      }
    } catch (e) {
      errors.push({ row: 0, reason: `Products for machine ${ref}: ${e.message}` });
    }

    if (includeSales) {
      try {
        const txns = asArray(await getJson(`/v1/machines/${m.MachineID}/lastSales`));
        for (const t of txns) {
          const sale = mapNayaxSale(t);
          if (sale.productName) { productNames.add(sale.productName); sales.push({ machineRef: ref, ...sale }); }
        }
      } catch (e) {
        errors.push({ row: 0, reason: `Sales for machine ${ref}: ${e.message}` });
      }
    }
  }

  return {
    machines,
    products: Array.from(productNames).sort().map(name => ({ name })),
    inventory,
    sales,
    errors,
  };
}

export const nayaxConnector = {
  id: 'nayax',
  label: 'Nayax (Lynx API)',
  loadCatalog: loadCatalogFromNayax,
};
