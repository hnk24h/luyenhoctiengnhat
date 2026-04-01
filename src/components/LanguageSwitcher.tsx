const LOCALES = [
  { code: 'vi', flag: '🇻🇳', alt: 'Tiếng Việt' },
  { code: 'en', flag: '🇬🇧', alt: 'English' },
];

interface LanguageSwitcherProps {
  currentLocale: string;
  onSwitch: (locale: string) => void;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, onSwitch, className }: LanguageSwitcherProps) {
  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => onSwitch(l.code)}
          className={`px-1.5 py-0.5 rounded text-lg leading-none ${currentLocale === l.code ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
          aria-label={l.alt}
          title={l.alt}
          type="button"
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
