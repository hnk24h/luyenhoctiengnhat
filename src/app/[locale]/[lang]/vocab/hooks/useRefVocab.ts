"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { VocabRefItem } from '@/types/vocab';

export function useRefVocab(apiUrl: ((level: string) => string) | null, selectedLevel: string) {
  const [refItems, setRefItems] = useState<VocabRefItem[]>([]);
  const [refSearch, setRefSearch] = useState('');
  const [refLoading, setRefLoading] = useState(false);
  const [refFlipped, setRefFlipped] = useState<Set<string>>(new Set());

  const fetchRefVocab = useCallback(async (level: string) => {
    if (!apiUrl) return;
    setRefLoading(true);
    try {
      const url = apiUrl(level);
      const res = await fetch(url);
      if (res.ok) setRefItems(await res.json());
    } catch { setRefItems([]); }
    finally { setRefLoading(false); }
  }, [apiUrl]);

  useEffect(() => {
    fetchRefVocab(selectedLevel);
  }, [selectedLevel, fetchRefVocab]);

  const refFiltered = useMemo(() =>
    refSearch
      ? refItems.filter(item =>
          item.term?.includes(refSearch) ||
          item.pronunciation?.includes(refSearch) ||
          (item.meanings?.[0]?.meaning ?? '').toLowerCase().includes(refSearch.toLowerCase())
        )
      : refItems,
    [refItems, refSearch]
  );

  const allRefFlipped = useMemo(() =>
    refFiltered.length > 0 && refFiltered.every(item => refFlipped.has(item.id)),
    [refFiltered, refFlipped]
  );

  const toggleRefFlip = useCallback((id: string) => {
    setRefFlipped(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const flipAllRef = useCallback(() => {
    if (allRefFlipped) setRefFlipped(new Set());
    else setRefFlipped(new Set(refFiltered.map(i => i.id)));
  }, [allRefFlipped, refFiltered]);

  return {
    refItems, refSearch, setRefSearch,
    refLoading, refFlipped, setRefFlipped,
    refFiltered, allRefFlipped,
    toggleRefFlip, flipAllRef,
    fetchRefVocab,
  };
}
