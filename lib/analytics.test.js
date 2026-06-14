import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { track } from './analytics.js';

// analytics.js reads window/sessionStorage/crypto/fetch as globals at call time,
// so we stub them per-test (node environment has none of these). vi.stubGlobal is
// required because some of these (e.g. crypto) are read-only getters in Node.
let lastBody;
let viewport;

beforeEach(() => {
  const store = {};
  viewport = { innerWidth: 1024 };
  vi.stubGlobal('window', viewport);
  vi.stubGlobal('sessionStorage', {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
  });
  vi.stubGlobal('crypto', { randomUUID: () => 'uuid-123' });
  vi.stubGlobal('fetch', vi.fn((url, opts) => {
    lastBody = JSON.parse(opts.body);
    return Promise.resolve({ ok: true });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('track wrappers', () => {
  it('posts search_performed with building zone context', async () => {
    await track.search('celsius', 'celsius', 3, 'west', 'Bryan Center');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/track', expect.objectContaining({ method: 'POST' }));
    expect(lastBody).toMatchObject({
      event_type: 'search_performed',
      query: 'celsius',
      normalized_query: 'celsius',
      result_count: 3,
      campus: 'west',
      building_id: 'Bryan Center',
      session_id: 'uuid-123',
      device_type: 'desktop',
    });
  });

  it('defaults building_id to null when omitted', async () => {
    await track.search('water', 'water', 5, 'both');
    expect(lastBody.building_id).toBeNull();
  });

  it('emits product_clicked with the product name', async () => {
    await track.productClicked('Doritos Nacho Cheese', 'east');
    expect(lastBody).toMatchObject({
      event_type: 'product_clicked',
      query: 'Doritos Nacho Cheese',
      campus: 'east',
    });
  });

  it('emits no_results_returned', async () => {
    await track.noResults('red bull', 'west');
    expect(lastBody).toMatchObject({ event_type: 'no_results_returned', query: 'red bull', campus: 'west' });
  });

  it('tags device_type as mobile on narrow viewports', async () => {
    globalThis.window.innerWidth = 500;
    await track.machineClicked('1', 'Bryan Center', 'west');
    expect(lastBody.device_type).toBe('mobile');
  });

  it('reuses one session id across events', async () => {
    await track.search('a', 'a', 1, 'both');
    const first = lastBody.session_id;
    await track.noResults('b', 'both');
    expect(lastBody.session_id).toBe(first);
  });
});
