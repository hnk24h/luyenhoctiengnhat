"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types (re-exported for consumers) ────────────────────────────────────────

export interface ColInfo { id: string; name: string; color: string }

export interface SavedWordContent {
  id: string; term: string; pronunciation: string | null;
  meanings: { language: string; meaning: string }[];
  examples: { exampleText: string; translation: string | null }[];
}

export interface Word {
  id: string; contentId: string; content: SavedWordContent;
  context: string | null; createdAt: string; collections: ColInfo[];
}

export interface Collection {
  id: string; name: string; color: string; wordCount: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVocabWords(status: 'authenticated' | 'unauthenticated' | 'loading') {
  const [words,       setWords]       = useState<Word[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [exporting,   setExporting]   = useState(false);
  const [exportDone,  setExportDone]  = useState(false);
  const [sheetOpen,   setSheetOpen]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [wRes, cRes] = await Promise.all([fetch('/api/words'), fetch('/api/collections')]);
    if (wRes.ok) setWords(await wRes.json());
    if (cRes.ok) setCollections(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadAll();
    else if (status === 'unauthenticated') setLoading(false);
  }, [status, loadAll]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => words.filter(w => {
    if (activeColId && !w.collections.some(c => c.id === activeColId)) return false;
    if (search && !w.content.term.includes(search) &&
        !w.content.pronunciation?.includes(search) &&
        !(w.content.meanings?.[0]?.meaning ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [words, search, activeColId]);

  const allSelected = filtered.length > 0 && filtered.every(w => selected.has(w.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(w => s.delete(w.id)); return s; });
    } else {
      setSelected(prev => new Set([...prev, ...filtered.map(w => w.id)]));
    }
  }, [allSelected, filtered]);

  // ── Collection CRUD ────────────────────────────────────────────────────────

  const createCollection = useCallback(async (name: string, color: string) => {
    const res = await fetch('/api/collections', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const col: Collection = await res.json();
      setCollections(prev => [...prev, col]);
    }
  }, []);

  const renameCollection = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    if (!confirm('Xóa chủ đề này? Các từ trong đó sẽ không bị xóa.')) return;
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id));
      setWords(prev => prev.map(w => ({ ...w, collections: w.collections.filter(c => c.id !== id) })));
      setActiveColId(prev => (prev === id ? null : prev));
    }
  }, []);

  // ── Word CRUD ──────────────────────────────────────────────────────────────

  const removeFromCollection = useCallback(async (wordId: string, colId: string) => {
    await fetch(`/api/collections/${colId}/words`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId }),
    });
    setWords(prev => prev.map(w =>
      w.id === wordId ? { ...w, collections: w.collections.filter(c => c.id !== colId) } : w,
    ));
    setCollections(prev => prev.map(c =>
      c.id === colId ? { ...c, wordCount: Math.max(0, c.wordCount - 1) } : c,
    ));
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    if (!confirm('Xóa từ này?')) return;
    await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => w.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const deleteSelected = useCallback(async (toDelete: Set<string>) => {
    if (!confirm(`Xóa ${toDelete.size} từ đã chọn?`)) return;
    for (const id of toDelete) await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => !toDelete.has(w.id)));
    setSelected(new Set());
  }, []);

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportToFlashcards = useCallback(async () => {
    const toExport = filtered.filter(w => selected.size === 0 || selected.has(w.id));
    if (!toExport.length) return;
    setExporting(true);
    const activeCol = collections.find(c => c.id === activeColId);
    const deckRes = await fetch('/api/flashcards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Từ vựng${activeCol ? ` - ${activeCol.name}` : ''} (${new Date().toLocaleDateString('vi-VN')})`,
        description: `${toExport.length} từ từ bộ sưu tập`,
        color: '#7C3AED',
      }),
    });
    if (!deckRes.ok) { setExporting(false); return; }
    const deck = await deckRes.json();
    await fetch(`/api/flashcards/${deck.id}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cards: toExport.map(w => ({
          front: w.content.term,
          back: w.content.meanings?.[0]?.meaning ?? '',
          reading: w.content.pronunciation ?? undefined,
          example: w.context ?? undefined,
        })),
      }),
    });
    setExporting(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }, [filtered, selected, activeColId, collections]);

  return {
    // state
    words, setWords,
    collections, setCollections,
    loading,
    search, setSearch,
    activeColId, setActiveColId,
    selected, setSelected,
    exporting, exportDone,
    sheetOpen, setSheetOpen,
    // derived
    filtered, allSelected,
    // actions
    loadAll,
    toggleAll,
    createCollection,
    renameCollection,
    deleteCollection,
    removeFromCollection,
    deleteWord,
    deleteSelected,
    exportToFlashcards,
  };
}
