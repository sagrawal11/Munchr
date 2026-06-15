# Munchr Integrations

Provider-agnostic ingestion of operator catalog + sales data into Munchr's canonical
schema (`machines` / `products` / `machine_inventory` / `sales`). Lets us onboard an
operator fast: they either upload an export (CSV) or paste an API token, and a per-provider
**connector** normalizes their data into the same shape, so the rest of the app never cares
where it came from.

## Connector interface

Every provider implements:

```
async loadCatalog(config) -> NormalizedCatalog
```

- **CSV** (`csv.js`, built first — universal, works with every operator incl. Canteen/Cantaloupe
  via export): `config = { csvText, mapping }`.
- **Nayax Lynx** (planned): `config = { token, env }` → REST pulls from `https://lynx.nayax.com/operational`
  (operator self-issues a Bearer token; see deep-research report).
- **Cantaloupe Seed / Parlevel** (planned, partner-gated): no public API — wire once a partner
  supplies credentials/endpoints.

## NormalizedCatalog shape

```
{
  machines:  [{ externalId?, name, building?, floor?, latitude?, longitude?, creditCardOnly?, status? }],
  products:  [{ name }],                                  // category/label computed on commit
  inventory: [{ machineRef, productName, available?, price? }],
  sales:     [{ machineRef, productName, quantity?, price?, soldAt? }],
  errors:    [{ row, reason }],
}
```

`machineRef` ties inventory/sales rows to a machine (externalId preferred, else name).
The **commit** step (separate) matches refs to existing `machines`/`products` and upserts.
