'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeId = 'default' | 'sakura' | 'matcha' | 'ocean' | 'sunset' | 'midnight';
export type AppearanceMode = 'system' | 'light' | 'dark';

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  preview: { primary: string; bg: string; surface: string; accent: string };
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Indigo (Mặc định)',
    emoji: '🟣',
    description: 'Màu tím indigo truyền thống',
    preview: { primary: '#3D3A8C', bg: '#F7F6F2', surface: '#FFFFFF', accent: '#C84B31' },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    emoji: '🌸',
    description: 'Hồng anh đào nhẹ nhàng',
    preview: { primary: '#D4507A', bg: '#FFF7F9', surface: '#FFFFFF', accent: '#8B5CF6' },
  },
  {
    id: 'matcha',
    name: 'Matcha',
    emoji: '🍵',
    description: 'Xanh trà matcha tươi mát',
    preview: { primary: '#2D6A4F', bg: '#F4F9F5', surface: '#FFFFFF', accent: '#D97706' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Xanh đại dương sâu thẳm',
    preview: { primary: '#0369A1', bg: '#F0F7FF', surface: '#FFFFFF', accent: '#0891B2' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    description: 'Cam hoàng hôn ấm áp',
    preview: { primary: '#EA580C', bg: '#FFFBF7', surface: '#FFFFFF', accent: '#D97706' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    description: 'Tím đêm hiện đại',
    preview: { primary: '#7C6AF7', bg: '#F6F4FF', surface: '#FFFFFF', accent: '#F472B6' },
  },
];

interface ThemeCtx {
  theme: ThemeId;
  appearance: AppearanceMode;
  resolvedAppearance: 'light' | 'dark';
  setTheme: (id: ThemeId) => void;
  setAppearance: (mode: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'default',
  appearance: 'system',
  resolvedAppearance: 'light',
  setTheme: () => {},
  setAppearance: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default');
  const [appearance, setAppearanceState] = useState<AppearanceMode>('system');
  const [systemAppearance, setSystemAppearance] = useState<'light' | 'dark'>('light');

  const resolvedAppearance = useMemo(
    () => (appearance === 'system' ? systemAppearance : appearance),
    [appearance, systemAppearance]
  );

  useEffect(() => {
    const stored = localStorage.getItem('app-theme') as ThemeId | null;
    const storedAppearance = localStorage.getItem('app-appearance') as AppearanceMode | null;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemAppearance = () => {
      setSystemAppearance(media.matches ? 'dark' : 'light');
    };

    syncSystemAppearance();
    media.addEventListener('change', syncSystemAppearance);

    if (stored && THEMES.find(t => t.id === stored)) {
      setThemeState(stored);
    }
    if (storedAppearance && ['system', 'light', 'dark'].includes(storedAppearance)) {
      setAppearanceState(storedAppearance);
    }

    return () => media.removeEventListener('change', syncSystemAppearance);
  }, []);

  useEffect(() => {
    applyPreferences(theme, resolvedAppearance);
  }, [theme, resolvedAppearance]);

  const setTheme = (id: ThemeId) => {
    localStorage.setItem('app-theme', id);
    setThemeState(id);
  };

  const setAppearance = (mode: AppearanceMode) => {
    localStorage.setItem('app-appearance', mode);
    setAppearanceState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, appearance, resolvedAppearance, setTheme, setAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyPreferences(themeId: ThemeId, appearance: 'light' | 'dark') {
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  if (themeId !== 'default') {
    root.setAttribute('data-theme', themeId);
  }
  root.setAttribute('data-appearance', appearance);
  root.style.colorScheme = appearance;
}

export function useTheme() {
  return useContext(ThemeContext);
}
