import { useSettings } from '@/hooks/useSettings';
import SegmentedControl from '@/components/SegmentedControl';
import { difficultyOptions } from '@/lib/difficultyOptions';

export default function DifficultyPicker() {
  const { settings, updateSettings } = useSettings();

  return (
    <SegmentedControl
      label="Default difficulty"
      options={difficultyOptions}
      value={settings.difficulty}
      onChange={(difficulty) => updateSettings({ difficulty })}
    />
  );
}
