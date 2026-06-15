// Human-readable inventory freshness label. Time-based only — we have no per-slot
// quantity, so we never fake "low stock". Honest trust labels per the product vision.
// `now` is injectable for deterministic tests.
export function formatFreshness(timestamp, now = Date.now()) {
  if (!timestamp) return 'Inventory unknown';
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return 'Inventory unknown';
  const days = Math.floor((now - then) / 86400000);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
}
