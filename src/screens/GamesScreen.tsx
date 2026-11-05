import ScreenHeader from '@/components/ScreenHeader';
import GameCard from '@/components/GameCard';
import { games } from '@/games/registry';

export default function GamesScreen() {
  return (
    <>
      <ScreenHeader title="Choose a game" backTo="/" />
      <div className="grid gap-3 pb-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </>
  );
}
