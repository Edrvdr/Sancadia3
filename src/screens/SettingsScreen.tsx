import Card from '@/components/Card';
import ScreenHeader from '@/components/ScreenHeader';
import DifficultyPicker from '@/components/settings/DifficultyPicker';
import ResetDataCard from '@/components/settings/ResetDataCard';
import ThemePicker from '@/components/settings/ThemePicker';
import ToggleRow from '@/components/settings/ToggleRow';
import { useSettings } from '@/hooks/useSettings';

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
            <ToggleRow
              label="Vibration"
              description="Feel a buzz on taps and wins"
              checked={settings.vibrationEnabled}
              onChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
            />
          </div>
        </Card>

        <ResetDataCard />
      </div>
    </>
  );
}
