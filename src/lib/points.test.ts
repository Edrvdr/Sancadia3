import { describe, expect, it } from 'vitest';
import { calculatePoints } from '@/lib/points';

describe('calculatePoints', () => {
  it('awards difficulty-based win points', () => {
    expect(calculatePoints('win', 'beginner')).toBe(10);
    expect(calculatePoints('win', 'professional')).toBe(20);
    expect(calculatePoints('win', 'expert')).toBe(40);
  });

  it('adds a capped five-points-per-win streak bonus', () => {
    expect(calculatePoints('win', 'beginner', 1)).toBe(15);
    expect(calculatePoints('win', 'beginner', 10)).toBe(35);
  });

  it('awards fixed points for draws and losses', () => {
    expect(calculatePoints('draw', 'expert', 8)).toBe(5);
    expect(calculatePoints('lose', 'expert', 8)).toBe(1);
  });
});
