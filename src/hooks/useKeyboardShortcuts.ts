'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Hook for global keyboard shortcuts in admin CMS.
 * Keys format: 'ctrl+n', 'shift+delete', 'escape', 'n' (single key — only fires when no input focused)
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    const combo = parts.join('+');

    // For single-key shortcuts (no modifier), skip when user is typing in an input
    const hasModifier = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
    if (!hasModifier && isInput) return;

    const action = shortcuts[combo];
    if (action) {
      e.preventDefault();
      e.stopPropagation();
      action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
