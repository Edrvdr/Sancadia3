import type { Difficulty } from '@/engine/difficulty';
import type { GameOutcome } from '@/components/GameOverDialog';

const WIN_POINTS: Record<Difficulty, number> = {
  beginner: 10,
  professional: 20,
  expert: 40,
};

export function calculatePoints(
  outcome: GameOutcome,
  difficulty: Difficulty,
  winStreak = 0,
): number {
  if (outcome === 'draw') return 5;
  if (outcome === 'lose') return 1;
  return WIN_POINTS[difficulty] + Math.min(winStreak * 5, 25);
}
