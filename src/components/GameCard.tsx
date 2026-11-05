import { Link } from 'react-router-dom';
import type { GameInfo } from '@/games/registry';

interface GameCardProps {
  game: GameInfo;
}

const cardBase =
  'flex min-h-11 items-center gap-4 rounded-3xl bg-surface p-4 text-left shadow-sm ring-1 ring-border';

function formatPlayers(min: number, max: number) {
  return min === max ? `${min} players` : `${min}–${max} players`;
}

export default function GameCard({ game }: GameCardProps) {
  const isAvailable = game.status === 'available';

  const content = (
    <>
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-3xl"
        aria-hidden="true"
      >
        {game.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-lg font-bold">{game.name}</span>
          {!isAvailable && (
            <span className="shrink-0 rounded-full bg-border px-2 py-0.5 text-xs font-semibold text-subtle">
              Coming soon
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-subtle">{game.description}</span>
        <span className="mt-2 block text-xs font-semibold text-subtle">
          {formatPlayers(game.minPlayers, game.maxPlayers)}
        </span>
      </span>
    </>
  );

  if (!isAvailable) {
    return (
      <div aria-disabled="true" className={`${cardBase} cursor-not-allowed opacity-60 grayscale`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/games/${game.id}`}
      className={`${cardBase} transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-[0.98]`}
    >
      {content}
    </Link>
  );
}
