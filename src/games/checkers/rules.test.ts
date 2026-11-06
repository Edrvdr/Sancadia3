import { describe, expect, it } from 'vitest';
import type { Player } from '@/engine/types';
import {
  SIZE,
  checkers,
  legalMovesFor,
  type CheckersState,
  type Occupant,
} from '@/games/checkers/rules';

function emptyBoard(): Occupant[][] {
  return Array.from({ length: SIZE }, () => Array<Occupant>(SIZE).fill(null));
}

function stateWith(board: Occupant[][], turn: Player = 0): CheckersState {
  return { board, turn, mustContinueFrom: null };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe('legal moves', () => {
  it('starts with twelve pieces per side and seven opening moves', () => {
    const state = checkers.initialState();
    expect(state.board.flat().filter((piece) => piece?.player === 0)).toHaveLength(12);
    expect(state.board.flat().filter((piece) => piece?.player === 1)).toHaveLength(12);
    expect(legalMovesFor(state)).toHaveLength(7);
  });

  it('makes captures mandatory', () => {
    const board = emptyBoard();
    board[5][2] = { player: 0, type: 'man' };
    board[4][3] = { player: 1, type: 'man' };
    board[5][6] = { player: 0, type: 'man' };
    const moves = legalMovesFor(stateWith(board));
    expect(moves).toHaveLength(1);
    expect(moves[0].captures).toEqual([[4, 3]]);
    expect(moves[0].to).toEqual([3, 4]);
  });

  it('finds and applies a complete multi-jump sequence', () => {
    const board = emptyBoard();
    board[5][0] = { player: 0, type: 'man' };
    board[4][1] = { player: 1, type: 'man' };
    board[2][3] = { player: 1, type: 'man' };
    const state = stateWith(board);
    const move = legalMovesFor(state)[0];

    expect(move.captures).toEqual([[4, 1], [2, 3]]);
    expect(move.to).toEqual([1, 4]);

    const next = checkers.applyMove(state, move);
    expect(next.board[5][0]).toBeNull();
    expect(next.board[4][1]).toBeNull();
    expect(next.board[2][3]).toBeNull();
    expect(next.board[1][4]).toEqual({ player: 0, type: 'man' });
    expect(next.turn).toBe(1);
  });

  it('crowns a man that reaches the far row', () => {
    const board = emptyBoard();
    board[1][1] = { player: 0, type: 'man' };
    const next = checkers.applyMove(stateWith(board), {
      from: [1, 1],
      to: [0, 0],
      captures: [],
    });
    expect(next.board[0][0]).toEqual({ player: 0, type: 'king' });
  });

  it('reports a winner when the opponent has no pieces', () => {
    const board = emptyBoard();
    board[2][1] = { player: 0, type: 'man' };
    const state = stateWith(board, 1);
    expect(checkers.isTerminal(state)).toBe(true);
    expect(checkers.winner(state)).toBe(0);
  });

  it('does not mutate the source board', () => {
    const board = emptyBoard();
    board[5][2] = { player: 0, type: 'man' };
    board[4][3] = { player: 1, type: 'man' };
    const state = deepFreeze(stateWith(board));
    const next = checkers.applyMove(state, legalMovesFor(state)[0]);
    expect(state.board[5][2]).toEqual({ player: 0, type: 'man' });
    expect(state.board[4][3]).toEqual({ player: 1, type: 'man' });
    expect(next.board[3][4]).toEqual({ player: 0, type: 'man' });
  });
});
