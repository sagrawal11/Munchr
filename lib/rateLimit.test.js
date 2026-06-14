import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, clientIp, _resetRateLimiter } from './rateLimit.js';

const headers = (map) => ({ get: k => map[k] ?? null });

describe('clientIp (anti-spoofing)', () => {
  it('prefers the trusted x-real-ip over client-supplied x-forwarded-for', () => {
    expect(clientIp(headers({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9, evil' }))).toBe('1.2.3.4');
  });
  it('falls back to first x-forwarded-for only when x-real-ip is absent', () => {
    expect(clientIp(headers({ 'x-forwarded-for': '5.6.7.8, 1.1.1.1' }))).toBe('5.6.7.8');
  });
  it('returns "unknown" when no IP headers present', () => {
    expect(clientIp(headers({}))).toBe('unknown');
  });
});

const OPTS = { limit: 3, windowMs: 1000 };

beforeEach(() => _resetRateLimiter());

describe('rateLimit (fixed window)', () => {
  it('allows up to the limit within a window', () => {
    expect(rateLimit('ip', OPTS, 0).allowed).toBe(true); // 1
    expect(rateLimit('ip', OPTS, 100).allowed).toBe(true); // 2
    expect(rateLimit('ip', OPTS, 200).allowed).toBe(true); // 3
  });

  it('blocks once the limit is exceeded and reports retry-after', () => {
    rateLimit('ip', OPTS, 0);
    rateLimit('ip', OPTS, 0);
    rateLimit('ip', OPTS, 0);
    const blocked = rateLimit('ip', OPTS, 500);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBe(500); // resetAt(1000) - now(500)
  });

  it('resets after the window elapses', () => {
    rateLimit('ip', OPTS, 0);
    rateLimit('ip', OPTS, 0);
    rateLimit('ip', OPTS, 0);
    expect(rateLimit('ip', OPTS, 999).allowed).toBe(false);
    expect(rateLimit('ip', OPTS, 1000).allowed).toBe(true); // new window
  });

  it('tracks distinct keys independently', () => {
    rateLimit('a', OPTS, 0);
    rateLimit('a', OPTS, 0);
    rateLimit('a', OPTS, 0);
    expect(rateLimit('a', OPTS, 0).allowed).toBe(false);
    expect(rateLimit('b', OPTS, 0).allowed).toBe(true); // separate bucket
  });

  it('decrements remaining as requests are consumed', () => {
    expect(rateLimit('ip', OPTS, 0).remaining).toBe(2);
    expect(rateLimit('ip', OPTS, 0).remaining).toBe(1);
    expect(rateLimit('ip', OPTS, 0).remaining).toBe(0);
  });
});
