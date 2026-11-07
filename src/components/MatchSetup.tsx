import { useState } from 'react';
import { Bot, Users } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import SegmentedControl from '@/components/SegmentedControl';
import { useSettings } from '@/hooks/useSettings';
import { difficultyOptions } from '@/lib/difficultyOptions';
import type { MatchConfig } from '@/games/matchConfig';

type Opponent = 'computer' | 'two-player';
type Order = 'first' | 'second';

const opponentOptions = [
  { value: 'computer' as const, label: 'vs Computer' },
  { value: 'two-player' as const, label: '2 Players' },
];

const orderOptions = [
  { value: 'first' as const, label: 'Go first' },
  { value: 'second' as const, label: 'Go second' },
];

export default function MatchSetup({ onStart }: { onStart: (config: MatchConfig) => void }) {
  const { settings } = useSettings();
  const [opponent, setOpponent] = useState<Opponent>('computer');
  const [order, setOrder] = useState<Order>('first');
  const [difficulty, setDifficulty] = useState(settings.difficulty);

  const start = () => {
    if (opponent === 'two-player') {
      onStart({ mode: 'two-player' });
      return;
    }
    onStart({ mode: 'computer', humanFirst: order === 'first', difficulty });
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card className="grid gap-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-subtle">
            <Users className="h-4 w-4" aria-hidden="true" />
            Players
          </p>
          <SegmentedControl
            label="Players"
            options={opponentOptions}
            value={opponent}
            onChange={setOpponent}
          />
        </div>

        {opponent === 'computer' && (
          <>
            <div>
              <p className="mb-2 text-sm font-semibold text-subtle">Who goes first</p>
              <SegmentedControl
                label="Who goes first"
                options={orderOptions}
                value={order}
                onChange={setOrder}
              />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-subtle">
                <Bot className="h-4 w-4" aria-hidden="true" />
                Computer difficulty
              </p>
              <SegmentedControl
                label="Computer difficulty"
                options={difficultyOptions}
                value={difficulty}
                onChange={setDifficulty}
              />
            </div>
          </>
        )}
      </Card>

      <Button className="mt-auto" onClick={start}>
        Start game
      </Button>
    </div>
  );
}
