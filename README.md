# Munchr

**Campus vending search + demand intelligence.** Munchr helps Duke students find snacks and drinks across campus vending machines, and turns their search behavior into demand analytics for vending operators.

> The core insight: sales data shows what people *bought*. Munchr shows what people *wanted but couldn't find*.

Munchr is a two-sided product:

- **Student app** (`/`) — a mobile-first map + search experience for finding vending machines and products.
- **Operator console** (`/operator`) — an analytics dashboard and a printable **Demand Report** that quantifies product demand, unmet demand, and stocking recommendations.

---

## Architecture

| Layer | Tech | Where |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | `app/` |
| Map | Leaflet + react-leaflet | `src/components/VendingMap.js` (dynamic import, client-only) |
| Database / Auth | Supabase (Postgres + Auth + RLS) | `lib/supabase.js`, `supabase/migrations/` |
| Styling | Plain CSS modules per component + `app/globals.css` | — |
| Tests | Vitest | `*.test.js` (node env) |
| Hosting | Vercel | — |

### Routes

- `app/page.js` — student app (search, map, nearest machine, campus filter).
- `app/operator/page.js` — operator analytics dashboard (auth-gated).
- `app/operator/report/page.js` — the **Demand Report** (printable one-pager).
- `app/operator/inventory/page.js` — the **inventory editor** (auth-gated CRUD: edit machines, add/remove products, toggle availability, add new machines).
- `app/operator/login/page.js` — Supabase email/password login.
- `app/api/track/route.js` — receives analytics events (service-role insert).
- `app/api/machines/route.js` — public catalog read for the student app.

---

## Data model (Supabase)

Two migrations, both in `supabase/migrations/`. Apply them in the Supabase **SQL Editor** (the CLI is not required).

**`20260609000109_initial_schema.sql` — analytics**
- `analytics_events` — every tracked student action. RLS: anon insert, authenticated (operator) read. See [docs/analytics-events.md](docs/analytics-events.md).

**`20260614000000_catalog_schema.sql` — catalog**
- `machines` — vending machines (id, name, building, floor, lat/lng, campus, credit_card_only, status).
- `products` — master product catalog, deduped by name, with `category` (broad bucket) and `label` (concise type, e.g. "Energy Drink").
- `machine_inventory` — which products are in which machine (`available`, `updated_at`). RLS on all three: public read, authenticated write.

The catalog is the **source of truth**; `src/data/vendingMachines.js` is now only an offline **fallback** used if the DB read fails. Operators edit it live via the inventory editor (`/operator/inventory`); writes go through the session-authenticated client (RLS authenticated-write). Products toggled `available = false` are hidden from the student app (`mapMachineRow` filters them).

### Seeding / migrating the catalog

`scripts/migrate-catalog.mjs` loads the static catalog into Supabase (idempotent upserts, computes `category`/`label`).

```bash
node scripts/migrate-catalog.mjs --dry-run   # validate derivation, no DB writes
node scripts/migrate-catalog.mjs             # upsert into Supabase (uses SERVICE_ROLE_KEY)
```

⚠️ **Do not re-run the seed after editing inventory in the DB** — its upserts overwrite edits and do not delete removed rows. It is a one-time initial load.

---

## Analytics & the Demand Report

Student actions are tracked client-side via `lib/analytics.js` (`track.*`) → `POST /api/track` → `analytics_events`. Tracking **never throws** — a failed event is swallowed so it can't break the app. (Corollary: if the table is missing, tracking fails silently — verify the table exists.)

The Demand Report (`lib/demandReport.js`) reads `analytics_events` + the catalog and computes:
- Top searched products, unmet ("searched but not found") demand, and a transparent **estimated lost revenue** figure.
- Building-level demand, by-hour demand, and rule-based stocking recommendations.

Tunable assumptions (avg vend price, conversion rate) live in `REPORT_DEFAULTS` in `lib/demandReport.js`.

Full event catalog: **[docs/analytics-events.md](docs/analytics-events.md)**.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # run the Vitest suite once
npm run test:watch # watch mode
```

### Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>      # client + public reads
SUPABASE_SERVICE_ROLE_KEY=<service role key>  # server-only (API routes, seed script)
```

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is used only in API routes and the seed script.

---

## Testing

Vitest, node environment, pure-logic focused (no DB or browser needed):

- `lib/demandReport.test.js` — report math (demand totals, unmet rate, lost-revenue estimate, recommendations, by-hour).
- `src/data/productCategories.test.js` — `getProductLabel`, `categorizeProduct`, `groupProductsByCategory`.
- `lib/catalog.test.js` — DB row → app machine shape mapping.
- `lib/analytics.test.js` — `track.*` payloads (globals stubbed via `vi.stubGlobal`).

---

## Key conventions

- **Don't run `npm run build` while `npm run dev` is running** — both write to `.next` and corrupt it. Stop dev first.
- The catalog read path falls back to the static file, so the student app keeps working even if Supabase is unreachable.
- Decisions of record live in [docs/adr/](docs/adr/).
