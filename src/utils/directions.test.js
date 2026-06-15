import { describe, it, expect } from 'vitest';
import { directionsUrl } from './directions.js';

describe('directionsUrl', () => {
  it('builds a Google Maps directions URL from the machine location', () => {
    expect(directionsUrl({ location: [36.001057, -78.940978] }))
      .toBe('https://www.google.com/maps/dir/?api=1&destination=36.001057,-78.940978');
  });
});
