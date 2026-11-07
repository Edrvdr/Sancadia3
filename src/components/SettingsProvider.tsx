import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { SettingsContext, type SettingsContextValue } from '@/hooks/settingsContext';
import {
  DEFAULT_SETTINGS,
  clearSettings,
  loadSettings,
  saveSettings,
  type Settings,
} from '@/lib/settings';
import { applyTheme, getTheme } from '@/theme/themes';

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useLayoutEffect(() => {
    applyTheme(getTheme(settings.themeId));
  }, [settings.themeId]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      saveSettings(next);
      setSettings(next);
    },
    [settings],
  );

  const resetSettings = useCallback(() => {
    clearSettings();
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
