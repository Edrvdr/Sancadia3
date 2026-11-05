import type { Difficulty } from '@/engine/difficulty';
import { SIZE, type CellState, type Grid, type ShipPlacement } from '@/games/battleships/rules';

export interface AiState {
  readonly targetGrid: CellState[][];
  readonly ships: ShipPlacement[];
  readonly queue: readonly (readonly [number, number])[];
  readonly hits: readonly (readonly [number, number])[];
}

export function createAiState(ships: ShipPlacement[]): AiState {
  return { targetGrid: Array.from({ length: SIZE }, () => Array<CellState>(SIZE).fill('empty')), ships, queue: [], hits: [] };
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function neighbors(r: number, c: number): (readonly [number, number])[] {
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([nr, nc]) => inBounds(nr, nc));
}

function untriedCells(grid: CellState[][]): (readonly [number, number])[] {
  const cells: (readonly [number, number])[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 'empty') cells.push([r, c]);
    }
  }
  return cells;
}

export function chooseAiShot(state: AiState, difficulty: Difficulty): readonly [number, number] {
  const { targetGrid, queue, hits } = state;

  if (queue.length > 0) {
    return queue[0];
  }

  if (hits.length > 0 && difficulty !== 'beginner') {
    if (hits.length === 1) {
      const [hr, hc] = hits[0];
      const candidates = neighbors(hr, hc).filter(([r, c]) => targetGrid[r][c] === 'empty');
      if (candidates.length > 0) return candidates[0];
    } else {
      const sorted = [...hits].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first[0] === last[0]) {
        const r = first[0];
        const candidates = [[r, first[1] - 1], [r, last[1] + 1]].filter(([nr, nc]) => inBounds(nr, nc) && targetGrid[nr][nc] === 'empty');
        if (candidates.length > 0) return candidates[0];
      } else {
        const c = first[1];
        const candidates = [[first[0] - 1, c], [last[0] + 1, c]].filter(([nr, nc]) => inBounds(nr, nc) && targetGrid[nr][nc] === 'empty');
        if (candidates.length > 0) return candidates[0];
      }
    }
  }

  const cells = untriedCells(targetGrid);
  if (cells.length === 0) return [0, 0];

  if (difficulty === 'beginner') {
    return cells[Math.floor(Math.random() * cells.length)];
  }

  const parity = difficulty === 'expert' ? 2 : 3;
  const parityCells = cells.filter(([r, c]) => (r + c) % parity === 0);
  const pool = parityCells.length > 0 ? parityCells : cells;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function updateAiState(state: AiState, shot: readonly [number, number], result: 'hit' | 'miss', sunk: boolean): AiState {
  const targetGrid = state.targetGrid.map((r) => [...r]);
  targetGrid[shot[0]][shot[1]] = result;
  let queue = [...state.queue];
  let hits = [...state.hits];

  if (result === 'hit') {
    hits.push(shot);
    if (sunk) {
      hits = [];
      queue = [];
    } else {
      queue = [];
      if (hits.length === 1) {
        const [hr, hc] = shot;
        for (const [nr, nc] of neighbors(hr, hc)) {
          if (targetGrid[nr][nc] === 'empty') queue.push([nr, nc]);
        }
      } else {
        const sorted = [...hits].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (first[0] === last[0]) {
          const r = first[0];
          if (inBounds(r, first[1] - 1) && targetGrid[r][first[1] - 1] === 'empty') queue.push([r, first[1] - 1]);
          if (inBounds(r, last[1] + 1) && targetGrid[r][last[1] + 1] === 'empty') queue.push([r, last[1] + 1]);
        } else {
          const c = first[1];
          if (inBounds(first[0] - 1, c) && targetGrid[first[0] - 1][c] === 'empty') queue.push([first[0] - 1, c]);
          if (inBounds(last[0] + 1, c) && targetGrid[last[0] + 1][c] === 'empty') queue.push([last[0] + 1, c]);
        }
      }
    }
  } else {
    queue = queue.filter(([r, c]) => !(r === shot[0] && c === shot[1]));
  }

  return { targetGrid, ships: state.ships, queue, hits };
}

export type { Grid };
