import type { LucideIcon } from 'lucide-react';
import { Frown, Minus, Trophy } from 'lucide-react';
import Button from '@/components/Button';
import Dialog from '@/components/Dialog';

export type GameOutcome = 'win' | 'lose' | 'draw';

interface GameOverDialogProps {
  open: boolean;
  outcome: GameOutcome;
  headline: string;
  message: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onClose: () => void;
}

const icons: Record<GameOutcome, LucideIcon> = { win: Trophy, lose: Frown, draw: Minus };

const tones: Record<GameOutcome, string> = {
  win: 'bg-primary-soft text-primary',
  lose: 'bg-danger/10 text-danger',
  draw: 'bg-border text-subtle',
};

export default function GameOverDialog({
  open,
  outcome,
  headline,
  message,
  onPlayAgain,
  onBackToMenu,
  onClose,
}: GameOverDialogProps) {
  const Icon = icons[outcome];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={headline}
      description={message}
      icon={
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[outcome]}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      }
    >
      <div className="grid gap-3">
        <Button onClick={onPlayAgain}>Play again</Button>
        <Button variant="secondary" onClick={onBackToMenu}>
          Back to menu
        </Button>
      </div>
    </Dialog>
  );
}
