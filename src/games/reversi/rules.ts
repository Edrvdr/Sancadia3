import type { GameEngine, Player, Winner } from '@/engine/types';

export const SIZE = 8;

export type Cell = Player | null;
export type Board = readonly (readonly Cell[])[];

export interface ReversiState {
  readonly board: Board;
  readonly turn: Player;
  readonly passed: boolean;
}

export type ReversiMove = readonly [number, number];

const DIRS: readonly (readonly [number, number])[] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function flipsFor(board: Board, row: number, col: number, player: Player): ReversiMove[] {
  const opponent: Player = player === 0 ? 1 : 0;
  const flipped: ReversiMove[] = [];
  for (const [dr, dc] of DIRS) {
    const line: ReversiMove[] = [];
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[r][c] === opponent) {
      line.push([r, c]);
      r += dr;
      c += dc;
    }
    if (line.length > 0 && inBounds(r, c) && board[r][c] === player) {
      flipped.push(...line);
    }
  }
  return flipped;
}

export function flipsForMove(board: Board, move: ReversiMove, player: Player): ReversiMove[] {
  const [row, col] = move;
  if (!inBounds(row, col) || board[row][col] !== null) return [];
  return flipsFor(board, row, col, player);
}

export function legalMovesFor(state: ReversiState): ReversiMove[] {
  const moves: ReversiMove[] = [];
  if (resultOf(state) !== null) return moves;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (state.board[r][c] !== null) continue;
      if (flipsFor(state.board, r, c, state.turn).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function countDiscs(board: Board): [number, number] {
  let p0 = 0;
  let p1 = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) p0++;
      else if (board[r][c] === 1) p1++;
    }
  }
  return [p0, p1];
}

export function scoreOf(board: Board): readonly [number, number] {
  return countDiscs(board);
}

function resultOf(state: ReversiState): Winner {
  const moves = legalMovesFor(state);
  if (moves.length > 0) return null;
  if (!state.passed) return null;

  const [p0, p1] = countDiscs(state.board);
  if (p0 > p1) return 0;
  if (p1 > p0) return 1;
  return 'draw';
}

function applyMoveInternal(state: ReversiState, move: ReversiMove): ReversiState {
  const [row, col] = move;
  const flipped = flipsFor(state.board, row, col, state.turn);
  const board = state.board.map((cells) => [...cells]);
  board[row][col] = state.turn;
  for (const [r, c] of flipped) board[r][c] = state.turn;
  const nextTurn: Player = state.turn === 0 ? 1 : 0;
  return { board, turn: nextTurn, passed: false };
}

function passTurn(state: ReversiState): ReversiState {
  return { board: state.board, turn: state.turn === 0 ? 1 : 0, passed: true };
}

export const reversi: GameEngine<ReversiState, ReversiMove> = {
  id: 'reversi',
  initialState: () => {
    const board: Cell[][] = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
    const mid = SIZE / 2;
    board[mid - 1][mid - 1] = 0;
    board[mid][mid] = 0;
    board[mid - 1][mid] = 1;
    board[mid][mid - 1] = 1;
    return { board, turn: 0, passed: false };
  },
  currentPlayer: (state) => state.turn,
  legalMoves: legalMovesFor,
  applyMove: (state, move) => {
    const legal = legalMovesFor(state);
    if (!legal.some((m) => m[0] === move[0] && m[1] === move[1])) {
      throw new Error(`Illegal move: ${move}`);
    }
    return applyMoveInternal(state, move);
  },
  isTerminal: (state) => {
    if (legalMovesFor(state).length > 0) return false;
    const passState = passTurn(state);
    return legalMovesFor(passState).length === 0;
  },
  winner: (state) => {
    if (legalMovesFor(state).length > 0) return null;
    const passState = passTurn(state);
    if (legalMovesFor(passState).length > 0) return null;
    const [p0, p1] = countDiscs(state.board);
    if (p0 > p1) return 0;
    if (p1 > p0) return 1;
    return 'draw';
  },
};
