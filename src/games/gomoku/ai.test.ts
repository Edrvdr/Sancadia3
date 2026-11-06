import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseMove } from '@/games/gomoku/ai';
import { SIZE, gomoku, type Cell } from '@/games/gomoku/rules';

describe('Gomoku AI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('takes an available five-in-a-row win', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const board: Cell[][] = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
    for (let col = 4; col < 8; col++) board[7][col] = 0;

    const move = chooseMove({ board, turn: 0 }, 'beginner');
    if (move === null) throw new Error('AI did not return a legal move');
    const next = gomoku.applyMove({ board, turn: 0 }, move);
    expect(gomoku.winner(next)).toBe(0);
  });
});
