import type { Difficulty } from '@/engine/difficulty';
import { themes, type ThemeId } from '@/theme/themes';

export interface Settings {
  themeId: ThemeId;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  volume: number;
  difficulty: Difficulty;
}

const STORAGE_KEY = 'classic-games-arcade:settings';

export const DEFAULT_SETTINGS: Settings = {
  themeId: 'classic',
  soundEnabled: true,
  vibrationEnabled: true,
  volume: 0.5,
  difficulty: 'beginner',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isThemeId(value: unknown): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'beginner' || value === 'professional' || value === 'expert';
}

export function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) return DEFAULT_SETTINGS;
  return {
    themeId: isThemeId(value.themeId) ? value.themeId : DEFAULT_SETTINGS.themeId,
    soundEnabled:
      typeof value.soundEnabled === 'boolean' ? value.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    vibrationEnabled:
      typeof value.vibrationEnabled === 'boolean'
        ? value.vibrationEnabled
        : DEFAULT_SETTINGS.vibrationEnabled,
    volume: typeof value.volume === 'number' && Number.isFinite(value.volume)
      ? Math.min(1, Math.max(0, value.volume))
      : DEFAULT_SETTINGS.volume,
    difficulty: isDifficulty(value.difficulty) ? value.difficulty : DEFAULT_SETTINGS.difficulty,
  };
}

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? DEFAULT_SETTINGS : parseSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode, quota); settings still apply for this visit.
  }
}

export function clearSettings() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
