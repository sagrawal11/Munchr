# Analytics Events Reference

Every student action that matters is captured as a row in the Supabase `analytics_events`
table. Events are emitted client-side through `lib/analytics.js` (`track.*` wrappers) and
written via `POST /api/track`. Tracking is fire-and-forget — failures are swallowed so they
can never break the student experience.

## Table: `analytics_events`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key, auto |
| `event_type` | text | one of the events below |
| `session_id` | text | anonymous per-session UUID (sessionStorage), not a user id |
| `query` | text | search term / product name (event-dependent) |
| `normalized_query` | text | normalized search term (search only) |
| `product_id` | text | reserved (currently unused; products identified by name) |
| `machine_id` | text | machine id (machine/directions events) |
| `building_id` | text | building name — result zone (search) or clicked machine's building |
| `campus` | text | `west` \| `east` \| `both` |
| `result_count` | integer | number of results (search only) |
| `device_type` | text | `mobile` \| `desktop` (viewport < 768px → mobile) |
| `timestamp` | timestamptz | set server-side at insert |

RLS: anonymous **insert** (students), authenticated **select** (operators).

## Event types

| `event_type` | Fired when | Key fields | Wrapper |
|---|---|---|---|
| `search_performed` | A search returns ≥1 result | `query`, `normalized_query`, `result_count`, `campus`, `building_id` (top/nearest result's building) | `track.search(query, normalized, count, campus, building)` |
| `no_results_returned` | A search returns 0 results | `query`, `campus` | `track.noResults(query, campus)` |
| `product_clicked` | User picks a **product** from search autocomplete | `query` (product name), `campus` | `track.productClicked(name, campus)` |
| `machine_clicked` | User opens a machine's inventory | `machine_id`, `building_id`, `campus` | `track.machineClicked(id, building, campus)` |
| `directions_clicked` | (reserved) user requests directions | `machine_id`, `building_id` | `track.directionsClicked(id, building)` |
| `building_filter_used` | Campus filter changed | `campus` | `track.campusFilter(campus)` |
| `category_filter_used` | (reserved) category chip used | `query` (chip id), `campus` | `track.categoryFilter(chip, campus)` |
| `location_permission_enabled` | Geolocation granted | — | `track.locationEnabled()` |
| `location_permission_denied` | Geolocation denied | — | `track.locationDenied()` |

### Notes on disjoint search streams

A zero-result search fires **`no_results_returned` instead of `search_performed`** (see
`app/page.js`). The two streams are therefore disjoint and additive:

```
total search demand = count(search_performed) + count(no_results_returned)
no-result rate      = count(no_results_returned) / total search demand
```

`lib/demandReport.js` relies on this when computing demand totals and unmet-demand rate.

### Reserved / not-yet-wired

- `directions_clicked` and `category_filter_used` have wrappers but are not currently fired
  (no directions feature; category chips were removed). They remain defined for future use.
- `product_id` is unused — products are matched by name today.
