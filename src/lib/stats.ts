import type { Difficulty } from '@/engine/difficulty';
import type { GameOutcome } from '@/components/GameOverDialog';
import { calculatePoints } from '@/lib/points';

export const STATS_VERSION = 1;
export const STATS_STORAGE_KEY = 'classic-games-arcade:stats';
const MAX_RECORDED_RESULTS = 500;

export interface DifficultyStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

export interface GameStats {
  computer: Record<Difficulty, DifficultyStats>;
  twoPlayerPlayed: number;
}

export interface StatsData {
  version: typeof STATS_VERSION;
  totalPoints: number;
  games: Record<string, GameStats>;
  appliedResultIds: string[];
}

export interface GameResult {
  resultId: string;
  gameId: string;
  mode: 'computer' | 'two-player';
  difficulty?: Difficulty;
  outcome: GameOutcome;
}

export interface RecordedResult {
  stats: StatsData;
  pointsEarned: number;
}

function emptyDifficultyStats(): DifficultyStats {
  return { played: 0, wins: 0, losses: 0, draws: 0, currentWinStreak: 0, bestWinStreak: 0 };
}

export function emptyStats(): StatsData {
  return { version: STATS_VERSION, totalPoints: 0, games: {}, appliedResultIds: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function parseDifficultyStats(value: unknown): DifficultyStats {
  if (!isRecord(value)) return emptyDifficultyStats();
  return {
    played: nonNegativeInteger(value.played),
    wins: nonNegativeInteger(value.wins),
    losses: nonNegativeInteger(value.losses),
    draws: nonNegativeInteger(value.draws),
    currentWinStreak: nonNegativeInteger(value.currentWinStreak),
    bestWinStreak: nonNegativeInteger(value.bestWinStreak),
  };
}

function parseGameStats(value: unknown): GameStats {
  const record = isRecord(value) ? value : {};
  const computer = isRecord(record.computer) ? record.computer : {};
  return {
    computer: {
      beginner: parseDifficultyStats(computer.beginner),
      professional: parseDifficultyStats(computer.professional),
      expert: parseDifficultyStats(computer.expert),
    },
    twoPlayerPlayed: nonNegativeInteger(record.twoPlayerPlayed),
  };
}

export function migrateStats(value: unknown): StatsData {
  if (!isRecord(value)) return emptyStats();
  if (value.version === STATS_VERSION) {
    const rawGames = isRecord(value.games) ? value.games : {};
    const games: Record<string, GameStats> = {};
    for (const [gameId, game] of Object.entries(rawGames)) games[gameId] = parseGameStats(game);
    const appliedResultIds = Array.isArray(value.appliedResultIds)
      ? value.appliedResultIds.filter((id): id is string => typeof id === 'string').slice(-MAX_RECORDED_RESULTS)
      : [];
    return {
      version: STATS_VERSION,
      totalPoints: nonNegativeInteger(value.totalPoints),
      games,
      appliedResultIds,
    };
  }
  if (value.version === 0) return emptyStats();
  return emptyStats();
}

export function parseStats(value: unknown): StatsData {
  return migrateStats(value);
}

function gameStatsFor(stats: StatsData, gameId: string): GameStats {
  return stats.games[gameId] ?? {
    computer: {
      beginner: emptyDifficultyStats(),
      professional: emptyDifficultyStats(),
      expert: emptyDifficultyStats(),
    },
    twoPlayerPlayed: 0,
  };
}

export function recordGameResult(stats: StatsData, result: GameResult): RecordedResult {
  if (stats.appliedResultIds.includes(result.resultId)) return { stats, pointsEarned: 0 };

  const next = migrateStats(stats);
  const game = gameStatsFor(next, result.gameId);
  let pointsEarned = 0;

  if (result.mode === 'two-player') {
    game.twoPlayerPlayed++;
  } else {
    const difficulty = result.difficulty ?? 'beginner';
    const record = game.computer[difficulty];
    record.played++;
    record[result.outcome === 'win' ? 'wins' : result.outcome === 'lose' ? 'losses' : 'draws']++;

    if (result.outcome === 'win') {
      record.currentWinStreak++;
      record.bestWinStreak = Math.max(record.bestWinStreak, record.currentWinStreak);
    } else {
      record.currentWinStreak = 0;
    }

    pointsEarned = calculatePoints(result.outcome, difficulty, record.currentWinStreak);
    next.totalPoints += pointsEarned;
  }

  next.games[result.gameId] = game;
  next.appliedResultIds = [...next.appliedResultIds, result.resultId].slice(-MAX_RECORDED_RESULTS);
  return { stats: next, pointsEarned };
}
