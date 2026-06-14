# ADR 0001 — Move the vending catalog from a static file to Supabase

- **Status:** Accepted
- **Date:** 2026-06-14

## Context

The vending catalog (64 machines and their products) lived in a hardcoded JavaScript
file, `src/data/vendingMachines.js`. Every inventory change required a code edit and a
redeploy. This blocked two things Munchr needs:

1. **An editable catalog** — operators (or we) must update inventory without shipping code,
   which is a prerequisite for any operator pilot.
2. **Acquirer-grade infrastructure** — a real data model signals a product, not a hobby
   project, to a potential licensee/acquirer.

The student app and the Demand Report both read the catalog, so the change had to avoid
any regression to the live student experience.

## Decision

Introduce three Supabase tables — `machines`, `products`, `machine_inventory` — as the
source of truth (migration `20260614000000_catalog_schema.sql`). Seed them from the
existing static file via an idempotent script (`scripts/migrate-catalog.mjs`), which also
precomputes each product's broad `category` and concise `label`.

Reads go through a resilient layer (`lib/catalog.js` + `app/api/machines`) that maps DB
rows back into the exact shape the app already expected. The student app and report default
to the static file and swap in DB data once loaded — so **a DB outage or an un-migrated
environment degrades gracefully to the static fallback** rather than breaking.

RLS: public read on all three tables (the student app reads anonymously); authenticated
write (the forthcoming operator admin editor).

## Consequences

**Positive**
- Inventory is editable in the DB; the admin editor (next milestone) builds directly on this.
- Real infrastructure for demos/diligence.
- Zero-regression rollout via the static fallback.

**Negative / trade-offs**
- The static file is now only a fallback; editing it no longer changes what users see.
- The seed script must **not** be re-run after DB edits (its upserts would clobber edits and
  won't delete removed rows). It is a one-time initial load.
- Schema changes are applied via the Supabase SQL Editor (the CLI isn't installed); applying
  DDL triggers a PostgREST schema-cache reload that can lag for a few seconds.

## Alternatives considered

- **Keep the static file.** Rejected: blocks editing and a pilot, and reads as a toy project.
- **Server-component data fetch instead of an API route + client fallback.** Rejected for now:
  the student page is a client component; the API-route + fallback approach was the least
  invasive path with no regression risk.
