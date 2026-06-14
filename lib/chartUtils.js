// Pure helpers for the lightweight CSS charts on the operator dashboard.

// Bar size as a percentage of the largest value (0 when there's no data).
// Floors non-zero values at a small minimum so tiny bars stay visible.
export function pct(value, max, minVisible = 2) {
  if (!max || max <= 0 || !value || value <= 0) return 0;
  return Math.max(minVisible, Math.round((value / max) * 100));
}

// Short label for an hour-of-day (0–23): "12a", "9a", "12p", "6p".
export function hourLabel(h) {
  const period = h < 12 ? 'a' : 'p';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}
