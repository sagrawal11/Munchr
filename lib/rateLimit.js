// Fixed-window, in-memory rate limiter for API routes.
//
// Scope/limits: this protects against a single client hammering an endpoint within a
// warm server instance. On serverless (Vercel) each instance has its own memory, so this
// is BEST-EFFORT, not globally exact — see SECURITY.md for the distributed upgrade
// (Vercel KV / Upstash) which would slot in behind this same `rateLimit()` signature.
//
// `now` is injectable so the window logic is deterministically unit-testable.

const buckets = new Map(); // key -> { count, resetAt }

function sweep(now) {
  for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
}

/**
 * @param {string} key   identity to limit (e.g. `track:<ip>`)
 * @param {{limit:number, windowMs:number}} opts
 * @returns {{allowed:boolean, remaining:number, resetAt:number, retryAfterMs:number}}
 */
export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  // Bound memory: occasionally drop expired buckets.
  if (buckets.size > 5000) sweep(now);

  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt, retryAfterMs: 0 };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt, retryAfterMs: 0 };
}

// Resolve the client IP for rate-limiting. SECURITY: do NOT trust the client-supplied
// left-most `x-forwarded-for` entry (an attacker rotates it to dodge limits). Vercel sets
// `x-real-ip` to the true client IP at the edge, so prefer it. The XFF fallback is only for
// local/non-proxied environments where spoofing isn't a meaningful threat; the global
// backstop in the route covers residual rotation risk regardless.
export function clientIp(headers) {
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}

// Test-only: reset internal state between cases.
export function _resetRateLimiter() {
  buckets.clear();
}
