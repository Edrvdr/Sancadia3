import { describe, expect, it } from 'vitest';
import { emptyStats, parseStats, recordGameResult, type GameResult } from '@/lib/stats';

const win: GameResult = {
  resultId: 'match-1',
  gameId: 'connect-4',
  mode: 'computer',
  difficulty: 'beginner',
  outcome: 'win',
};

describe('stats', () => {
  it('records wins, points and streaks by game and difficulty', () => {
    const first = recordGameResult(emptyStats(), win);
    const second = recordGameResult(first.stats, { ...win, resultId: 'match-2' });
    const record = second.stats.games['connect-4'].computer.beginner;

    expect(first.pointsEarned).toBe(15);
    expect(second.pointsEarned).toBe(20);
    expect(record).toMatchObject({ played: 2, wins: 2, currentWinStreak: 2, bestWinStreak: 2 });
    expect(second.stats.totalPoints).toBe(35);
  });

  it('deduplicates a result ID to prevent double counting', () => {
    const first = recordGameResult(emptyStats(), win);
    const repeated = recordGameResult(first.stats, win);
    expect(repeated.stats).toBe(first.stats);
    expect(repeated.pointsEarned).toBe(0);
    expect(repeated.stats.games['connect-4'].computer.beginner.played).toBe(1);
  });

  it('resets the current streak after a draw or loss but preserves the best', () => {
    const first = recordGameResult(emptyStats(), win);
    const second = recordGameResult(first.stats, { ...win, resultId: 'match-2' });
    const third = recordGameResult(second.stats, { ...win, resultId: 'match-3', outcome: 'draw' });
    const record = third.stats.games['connect-4'].computer.beginner;
    expect(record).toMatchObject({ currentWinStreak: 0, bestWinStreak: 2, draws: 1 });
  });

  it('counts two-player games without difficulty stats or points', () => {
    const result = recordGameResult(emptyStats(), {
      resultId: 'local-match',
      gameId: 'gomoku',
      mode: 'two-player',
      outcome: 'win',
    });
    expect(result.stats.games.gomoku.twoPlayerPlayed).toBe(1);
    expect(result.stats.totalPoints).toBe(0);
    expect(result.pointsEarned).toBe(0);
  });

  it('safely parses corrupt, malformed and older-version storage', () => {
    expect(parseStats(null)).toEqual(emptyStats());
    expect(parseStats({ version: 0, points: 999 })).toEqual(emptyStats());
    expect(parseStats({ version: 1, totalPoints: -4, games: [], appliedResultIds: 'broken' })).toEqual(emptyStats());
    expect(parseStats({ version: 1, totalPoints: 12, games: { game: { computer: { beginner: { wins: 2 } } } } }))
      .toMatchObject({
        version: 1,
        totalPoints: 12,
        games: { game: { computer: { beginner: { wins: 2, played: 0 } }, twoPlayerPlayed: 0 } },
      });
  });
});
