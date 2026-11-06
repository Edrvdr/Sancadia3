import { describe, expect, it } from 'vitest';
import { createAiState, chooseAiShot, updateAiState } from '@/games/battleships/ai';
import { SIZE } from '@/games/battleships/rules';

describe('Battleships AI', () => {
  it('always chooses an untried cell', () => {
    const state = createAiState([]);
    const shot = chooseAiShot(state, 'professional');
    expect(shot).toHaveLength(2);
    expect(state.targetGrid[shot[0]][shot[1]]).toBe('empty');
  });

  it('targets adjacent cells after a hit and clears the target after a sunk ship', () => {
    const state = createAiState([]);
    const afterHit = updateAiState(state, [4, 4], 'hit', false);
    const nextShot = chooseAiShot(afterHit, 'professional');
    expect(Math.abs(nextShot[0] - 4) + Math.abs(nextShot[1] - 4)).toBe(1);

    const afterSunk = updateAiState(afterHit, nextShot, 'hit', true);
    expect(afterSunk.hits).toEqual([]);
    expect(afterSunk.queue).toEqual([]);
    expect(afterSunk.targetGrid[4][4]).toBe('hit');
    expect(afterSunk.targetGrid[nextShot[0]][nextShot[1]]).toBe('hit');
  });

  it('stays within board bounds at an edge', () => {
    const state = updateAiState(createAiState([]), [0, 0], 'hit', false);
    const shot = chooseAiShot(state, 'professional');
    expect(shot[0]).toBeGreaterThanOrEqual(0);
    expect(shot[1]).toBeGreaterThanOrEqual(0);
    expect(shot[0]).toBeLessThan(SIZE);
    expect(shot[1]).toBeLessThan(SIZE);
  });
});
