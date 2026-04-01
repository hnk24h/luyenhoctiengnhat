'use client';

import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';

const LOCALES = [
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

interface LanguageSwitcherProps {
  currentLocale: string;
  onSwitch: (locale: string) => void;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, onSwitch, className }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find(l => l.code === currentLocale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Ngôn ngữ: ${current.label}`}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="text-[18px] leading-none">{current.flag}</span>
        <FaChevronDown
          size={9}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl border p-1.5 z-50"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          {LOCALES.map(l => {
            const isActive = l.code === currentLocale;
            return (
              <button
                key={l.code}
                role="option"
                type="button"
                aria-selected={isActive}
                onClick={() => { onSwitch(l.code); setOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--bg-muted)]"
                style={
                  isActive
                    ? { color: 'var(--primary)', fontWeight: 600, background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                <span className="text-xl leading-none">{l.flag}</span>
                <span className="flex-1 text-left text-[13px]">{l.label}</span>
                {isActive && <FaCheck size={10} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
