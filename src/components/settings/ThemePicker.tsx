import { themes, type Theme } from '@/theme/themes';
import { useSettings } from '@/hooks/useSettings';

const swatchTokens: (keyof Theme['tokens'])[] = [
  'background',
  'surface',
  'primary',
  'accent',
  'board-light',
  'board-dark',
];

export default function ThemePicker() {
  const { settings, updateSettings } = useSettings();

  return (
    <div role="radiogroup" aria-label="Theme" className="grid gap-3">
      {themes.map((theme) => {
        const selected = theme.id === settings.themeId;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => updateSettings({ themeId: theme.id })}
            className={`flex min-h-11 items-center justify-between gap-4 rounded-2xl p-4 text-left transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
              selected
                ? 'bg-primary-soft ring-2 ring-primary'
                : 'bg-background ring-1 ring-border hover:ring-primary/50'
            }`}
          >
            <span className="font-semibold text-foreground">{theme.name}</span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {swatchTokens.map((token) => (
                <span
                  key={token}
                  className="h-5 w-5 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: theme.tokens[token] }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
