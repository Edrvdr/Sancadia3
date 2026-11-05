import { useState, type CSSProperties } from 'react';
import { Crosshair, RotateCcw, Shuffle, Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import GameOverDialog from '@/components/GameOverDialog';
import Scoreboard from '@/components/Scoreboard';
import ThinkingDots from '@/components/ThinkingDots';
import type { MatchConfig } from '@/games/matchConfig';
import { describeResult, scoreEntries, statusText } from '@/games/matchOutcome';
import { useSettings } from '@/hooks/useSettings';
import { vibrate, HAPTICS } from '@/lib/haptics';
import {
  SHIP_SIZES,
  SIZE,
  allShipsSunk,
  canPlace,
  emptyGrid,
  placeShip,
  randomPlacement,
  shoot,
  shipsRemaining,
  type CellState,
  type Orientation,
  type ShipPlacement,
} from '@/games/battleships/rules';
import { createAiState, chooseAiShot, updateAiState, type AiState } from '@/games/battleships/ai';

type Phase = 'setup' | 'play';
type Player = 0 | 1;

const cellColor = (cell: CellState, showShips: boolean): string => {
  if (cell === 'hit') return 'bg-danger text-danger-foreground';
  if (cell === 'miss') return 'bg-foreground/10';
  if (cell === 'ship' && showShips) return 'bg-primary';
  return 'bg-board-light';
};

function Grid2D({
  grid,
  showShips,
  onCellTap,
  disabled,
  highlight,
  label,
}: {
  grid: CellState[][];
  showShips: boolean;
  onCellTap?: (row: number, col: number) => void;
  disabled?: boolean;
  highlight?: readonly [number, number] | null;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-1 rounded-2xl bg-board-line p-1.5 shadow-lg"
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` } as CSSProperties}
    >
      {Array.from({ length: SIZE * SIZE }, (_, index) => {
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const cell = grid[row][col];
        const isHighlight = highlight && highlight[0] === row && highlight[1] === col;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={onCellTap ? () => onCellTap(row, col) : undefined}
            className={`relative flex aspect-square min-h-8 items-center justify-center rounded transition duration-150 ${cellColor(
              cell,
              showShips
            )} ${isHighlight ? 'ring-2 ring-primary' : ''} ${
              !disabled && onCellTap && cell === 'empty' ? 'cursor-pointer hover:brightness-110' : ''
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
          >
            {cell === 'hit' && <Crosshair className="h-3/5 w-3/5 text-danger-foreground" aria-hidden="true" />}
            {cell === 'miss' && <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

export default function BattleshipsMatch({ config }: { config: MatchConfig }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const vibrationEnabled = settings.vibrationEnabled;

  const [phase, setPhase] = useState<Phase>('setup');
  const [playerGrid, setPlayerGrid] = useState<CellState[][]>(emptyGrid);
  const [playerShips, setPlayerShips] = useState<ShipPlacement[]>([]);
  const [enemyGrid, setEnemyGrid] = useState<CellState[][]>(emptyGrid);
  const [enemyShips, setEnemyShips] = useState<ShipPlacement[]>([]);
  const [aiState, setAiState] = useState<AiState | null>(null);
  const [turn, setTurn] = useState<Player>(0);
  const [result, setResult] = useState<Player | 'draw' | null>(null);
  const [scores, setScores] = useState({ 0: 0, 1: 0, draws: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);

  const [placingIndex, setPlacingIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);

  const isComputer = config.mode === 'computer';
  const humanSide: Player = isComputer && !config.humanFirst ? 1 : 0;
  const computerSide: Player = humanSide === 0 ? 1 : 0;

  const over = result !== null;
  const computerTurn = isComputer && !over && turn === computerSide;

  const restart = () => {
    setPhase('setup');
    setPlayerGrid(emptyGrid());
    setPlayerShips([]);
    setEnemyGrid(emptyGrid());
    setEnemyShips([]);
    setAiState(null);
    setTurn(0);
    setResult(null);
    setPlacingIndex(0);
    setOrientation('horizontal');
    setHoverCell(null);
    setDialogOpen(false);
  };

  const randomize = () => {
    const { grid, ships } = randomPlacement();
    setPlayerGrid(grid);
    setPlayerShips(ships);
    setPlacingIndex(SHIP_SIZES.length);
  };

  const startGame = () => {
    const enemy = randomPlacement();
    setEnemyGrid(enemy.grid);
    setEnemyShips(enemy.ships);
    if (isComputer) {
      setAiState(createAiState(enemy.ships));
    }
    setPhase('play');
    setTurn(0);
    vibrate(vibrationEnabled, HAPTICS.move);
  };

  const handleSetupCellTap = (row: number, col: number) => {
    if (placingIndex >= SHIP_SIZES.length) return;
    const size = SHIP_SIZES[placingIndex];
    if (!canPlace(playerGrid, row, col, size, orientation === 'horizontal')) return;
    const next = placeShip(playerGrid, row, col, size, orientation === 'horizontal');
    setPlayerGrid(next);
    setPlayerShips([...playerShips, { row, col, size, horizontal: orientation === 'horizontal' }]);
    setPlacingIndex((i) => i + 1);
  };

  const handleAttack = (row: number, col: number) => {
    if (over || computerTurn) return;
    if (enemyGrid[row][col] === 'hit' || enemyGrid[row][col] === 'miss') return;

    const { grid, result: shotResult } = shoot(enemyGrid, enemyShips, row, col);
    setEnemyGrid(grid);
    vibrate(vibrationEnabled, shotResult.hit ? HAPTICS.gameEnd : HAPTICS.move);

    if (allShipsSunk(grid)) {
      setResult(humanSide);
      setScores((s) => ({ ...s, [humanSide]: s[humanSide] + 1 }));
      setDialogOpen(true);
      return;
    }

    const nextTurn: Player = turn === 0 ? 1 : 0;
    setTurn(nextTurn);
  };

  // AI shooting
  const handleAiShot = () => {
    if (!aiState || !isComputer) return;
    const shot = chooseAiShot(aiState, config.difficulty);
    const { grid, result: shotResult } = shoot(playerGrid, playerShips, shot[0], shot[1]);
    setPlayerGrid(grid);
    const sunk = shotResult.sunk;
    const nextAi = updateAiState(aiState, shot, shotResult.hit ? 'hit' : 'miss', sunk);
    setAiState(nextAi);
    vibrate(vibrationEnabled, shotResult.hit ? HAPTICS.gameEnd : HAPTICS.move);

    if (allShipsSunk(grid)) {
      setResult(computerSide);
      setScores((s) => ({ ...s, [computerSide]: s[computerSide] + 1 }));
      setDialogOpen(true);
      return;
    }
    setTurn(humanSide);
  };

  // trigger AI shot
  if (computerTurn) {
    setTimeout(() => {
      if (phase === 'play' && !over && turn === computerSide) {
        handleAiShot();
      }
    }, 600 + Math.random() * 400);
  }

  const summary = result === null ? null : describeResult(result, config, humanSide);
  const allPlaced = placingIndex >= SHIP_SIZES.length;
  const canStart = allPlaced || playerShips.length === SHIP_SIZES.length;

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Place your fleet</h2>
          <button
            type="button"
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary transition hover:brightness-95 active:scale-95"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Random
          </button>
        </div>

        <p className="text-sm text-subtle">
          {allPlaced
            ? 'Fleet ready! Tap Start to battle.'
            : `Placing ${['Carrier (5)', 'Battleship (4)', 'Cruiser (3)', 'Submarine (3)', 'Destroyer (2)'][placingIndex]}`}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrientation('horizontal')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              orientation === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-surface ring-1 ring-border'
            }`}
          >
            Horizontal
          </button>
          <button
            type="button"
            onClick={() => setOrientation('vertical')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              orientation === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-surface ring-1 ring-border'
            }`}
          >
            Vertical
          </button>
        </div>

        <div
          className="flex justify-center"
          onPointerLeave={() => setHoverCell(null)}
        >
          <div
            className="grid gap-1 rounded-2xl bg-board-line p-1.5 shadow-lg"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` } as CSSProperties}
          >
            {Array.from({ length: SIZE * SIZE }, (_, index) => {
              const row = Math.floor(index / SIZE);
              const col = index % SIZE;
              const cell = playerGrid[row][col];
              const isHover = hoverCell && hoverCell[0] === row && hoverCell[1] === col;
              const size = allPlaced ? 0 : SHIP_SIZES[placingIndex];
              const canFit = !allPlaced && canPlace(playerGrid, row, col, size, orientation === 'horizontal');
              const previewCells = new Set<string>();
              if (isHover && !allPlaced && canFit) {
                for (let i = 0; i < size; i++) {
                  const r = orientation === 'horizontal' ? row : row + i;
                  const c = orientation === 'horizontal' ? col + i : col;
                  previewCells.add(`${r},${c}`);
                }
              }
              return (
                <button
                  key={index}
                  type="button"
                  disabled={allPlaced}
                  onClick={() => handleSetupCellTap(row, col)}
                  onPointerEnter={() => setHoverCell([row, col])}
                  className={`relative flex aspect-square min-h-8 items-center justify-center rounded transition ${
                    cell === 'ship' ? 'bg-primary' : 'bg-board-light'
                  } ${previewCells.has(`${row},${col}`) ? 'bg-primary/40' : ''} ${
                    isHover && !canFit && !allPlaced ? 'bg-danger/20' : ''
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                >
                  {cell === 'ship' && <Anchor className="h-1/2 w-1/2 text-primary-foreground" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <Button disabled={!canStart} onClick={startGame} className="mt-auto">
          Start battle
        </Button>
      </div>
    );
  }

  // PLAY PHASE
  const myShipsLeft = shipsRemaining(playerGrid, playerShips);
  const enemyShipsLeft = shipsRemaining(enemyGrid, enemyShips);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Scoreboard entries={scoreEntries(config, humanSide, scores)} />

      <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-2.5 shadow-sm ring-1 ring-border">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Anchor className="h-4 w-4 text-primary" aria-hidden="true" />
          Your fleet: {myShipsLeft}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          Enemy: {enemyShipsLeft}
          <Anchor className="h-4 w-4 text-accent" aria-hidden="true" />
        </span>
      </div>

      <div role="status" aria-live="polite" className="flex min-h-11 items-center justify-center gap-3">
        <p className="font-semibold">{statusText(result, turn, config, humanSide)}</p>
        {computerTurn && <ThinkingDots />}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-center text-sm font-semibold text-subtle">Enemy waters — tap to fire</p>
        <Grid2D
          grid={enemyGrid}
          showShips={false}
          onCellTap={handleAttack}
          disabled={computerTurn || over}
          label="Enemy waters"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-center text-sm font-semibold text-subtle">Your fleet</p>
        <Grid2D grid={playerGrid} showShips label="Your fleet" disabled />
      </div>

      <Button variant="secondary" onClick={restart}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Restart
      </Button>

      {summary && (
        <GameOverDialog
          open={dialogOpen}
          outcome={summary.outcome}
          headline={summary.headline}
          message={summary.message}
          onPlayAgain={restart}
          onBackToMenu={() => navigate('/games')}
          onClose={match_closeDialog(setDialogOpen)}
        />
      )}
    </div>
  );
}

function match_closeDialog(setDialogOpen: (v: boolean) => void) {
  return () => setDialogOpen(false);
}
