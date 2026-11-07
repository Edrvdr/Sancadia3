import Card from '@/components/Card';
import ScreenHeader from '@/components/ScreenHeader';
import DifficultyPicker from '@/components/settings/DifficultyPicker';
import ResetDataCard from '@/components/settings/ResetDataCard';
import ThemePicker from '@/components/settings/ThemePicker';
import ToggleRow from '@/components/settings/ToggleRow';
import InstallAppButton from '@/components/settings/InstallAppButton';
import { useSettings } from '@/hooks/useSettings';
import { supportsVibration } from '@/hooks/useFeedback';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <ScreenHeader title="Settings" backTo="/" />
      <div className="grid gap-4 pb-4">
        <Card>
          <h2 className="mb-4 text-lg font-bold">Theme</h2>
          <ThemePicker />
        </Card>

        <Card className="grid gap-5">
          <h2 className="text-lg font-bold">Gameplay</h2>
          <div>
            <p className="mb-2 text-sm font-semibold text-subtle">Default difficulty</p>
            <DifficultyPicker />
          </div>
          <div className="grid gap-4 border-t border-border pt-5">
            <ToggleRow
              label="Sound"
              description="Play sound effects during games"
              checked={settings.soundEnabled}
              onChange={(soundEnabled) => updateSettings({ soundEnabled })}
            />
            {supportsVibration() ? (
              <ToggleRow
                label="Vibration"
                description="Feel a buzz on taps and wins"
                checked={settings.vibrationEnabled}
                onChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
              />
            ) : (
              <p className="text-sm text-subtle">Vibration is not supported by this browser.</p>
            )}
            <label className="grid gap-2 text-sm font-medium">
              <span className="flex justify-between">
                <span>Master volume</span>
                <span aria-live="polite">{Math.round(settings.volume * 100)}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                aria-label="Master volume"
                onChange={(event) => updateSettings({ volume: Number(event.currentTarget.value) })}
                className="w-full accent-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              />
            </label>
          </div>
        </Card>

        <InstallAppButton />
        <ResetDataCard />
      </div>
    </>
  );
}
