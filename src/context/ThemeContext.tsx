'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'default' | 'sakura' | 'matcha' | 'ocean' | 'sunset' | 'midnight';

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
    description: 'Giao diện tối ban đêm',
    preview: { primary: '#7C6AF7', bg: '#0F0F1A', surface: '#1A1A2E', accent: '#F472B6' },
  },
];

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'default', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app-theme') as ThemeId | null;
    if (stored && THEMES.find(t => t.id === stored)) {
      applyTheme(stored);
      setThemeState(stored);
    }
  }, []);

  const setTheme = (id: ThemeId) => {
    localStorage.setItem('app-theme', id);
    applyTheme(id);
    setThemeState(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  // Remove all existing theme attrs
  root.removeAttribute('data-theme');
  if (id !== 'default') {
    root.setAttribute('data-theme', id);
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}
