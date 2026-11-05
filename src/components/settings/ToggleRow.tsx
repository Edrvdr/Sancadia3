interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 rounded-xl"
    >
      <span>
        <span className="block font-semibold text-foreground">{label}</span>
        <span className="block text-sm text-subtle">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-subtle'
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-primary-foreground shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </span>
    </button>
  );
}
