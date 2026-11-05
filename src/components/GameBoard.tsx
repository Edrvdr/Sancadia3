import type { ReactNode } from 'react';

interface GameBoardProps {
  label: string;
  rows: number;
  cols: number;
  renderCell: (row: number, col: number) => ReactNode;
  onCellTap: (row: number, col: number) => void;
  onCellEnter?: (row: number, col: number) => void;
  onBoardLeave?: () => void;
  disabled?: boolean;
}

export default function GameBoard({
  label,
  rows,
  cols,
  renderCell,
  onCellTap,
  onCellEnter,
  onBoardLeave,
  disabled = false,
}: GameBoardProps) {
  return (
    <div
      role="group"
      aria-label={label}
      onPointerLeave={onBoardLeave}
      className="grid gap-2 rounded-3xl bg-board-line p-2 shadow-lg"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onCellTap(row, col)}
            onPointerEnter={onCellEnter ? () => onCellEnter(row, col) : undefined}
            className="relative flex aspect-square min-h-11 items-center justify-center rounded-2xl bg-board-light text-5xl font-bold transition duration-200 hover:bg-board-dark/40 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:hover:bg-board-light disabled:active:scale-100"
          >
            {renderCell(row, col)}
          </button>
        );
      })}
    </div>
  );
}
