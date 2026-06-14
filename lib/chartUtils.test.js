import { describe, it, expect } from 'vitest';
import { pct, hourLabel } from './chartUtils.js';

describe('pct', () => {
  it('scales a value against the max', () => {
    expect(pct(50, 100)).toBe(50);
    expect(pct(100, 100)).toBe(100);
  });
  it('floors small non-zero values at the minimum visible width', () => {
    expect(pct(1, 1000)).toBe(2); // would round to 0; floored to 2
  });
  it('returns 0 for zero/empty/invalid input', () => {
    expect(pct(0, 100)).toBe(0);
    expect(pct(5, 0)).toBe(0);
    expect(pct(undefined, 100)).toBe(0);
  });
});

describe('hourLabel', () => {
  it('formats hours in 12h shorthand', () => {
    expect(hourLabel(0)).toBe('12a');
    expect(hourLabel(9)).toBe('9a');
    expect(hourLabel(12)).toBe('12p');
    expect(hourLabel(18)).toBe('6p');
    expect(hourLabel(23)).toBe('11p');
  });
});
