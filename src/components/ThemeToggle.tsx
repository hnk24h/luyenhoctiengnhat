import { FaSun, FaMoon } from 'react-icons/fa6';


import type { AppearanceMode } from '@/context/ThemeContext';

interface ThemeToggleProps {
  appearance: AppearanceMode;
  resolvedAppearance: 'light' | 'dark';
  setAppearance: (mode: AppearanceMode) => void;
}

export function ThemeToggle({ appearance, resolvedAppearance, setAppearance }: ThemeToggleProps) {
  return (
    <div className="hidden md:block relative">
      <button
        onClick={() => setAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-[var(--bg-muted)]"
        style={{ color: 'var(--primary)' }}
        aria-label="Đổi giao diện"
      >
        {resolvedAppearance === 'dark' ? <FaSun size={15} /> : <FaMoon size={15} />}
      </button>
    </div>
  );
}
