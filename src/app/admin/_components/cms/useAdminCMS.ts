'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Level {
  id: string; code: string; name: string; order: number; subject: string;
}

export interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

export interface Lesson {
  id: string; categoryId: string; title: string; description: string | null;
  type: string; status?: ContentStatus; order: number; requiredTier?: string;
  _count: { items: number };
  category: { name: string; skill: string; level: { code: string } };
}

export interface ContentMeaning { id: string; language: string; meaning: string }
export interface ContentExample {
  id: string; exampleText: string; translation: string | null;
  language: string; translationLanguage: string | null;
}

export interface LearningItem {
  id: string; lessonId: string; type: string; language: string;
  term: string; pronunciation: string | null;
  meanings: ContentMeaning[]; examples: ContentExample[];
  audioUrl: string | null; imageUrl: string | null; order: number;
}

// ─── Form defaults ────────────────────────────────────────────────────────────

export const CAT_BLANK = { levelId: '', skill: 'vocab', name: '', description: '', icon: '', order: 0 };
export const LES_BLANK = { title: '', description: '', type: 'vocab', order: 0, requiredTier: 'free' };
export const ITEM_BLANK = {
  type: 'vocab', term: '', pronunciation: '', language: 'ja',
  meaning: '', example: '', exampleMeaning: '', order: 0,
};

export type CatForm = typeof CAT_BLANK;
export type LesForm = typeof LES_BLANK;
export type ItemForm = typeof ITEM_BLANK;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminCMS(subject: string) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [items, setItems] = useState<LearningItem[]>([]);

  const [activeLevel, setActiveLevel] = useState('');
  const [activeSkill, setActiveSkill] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeLesId, setActiveLesId] = useState<string | null>(null);

  const [loading, setLoading] = useState({ levels: true, cats: false, lessons: false, items: false });

  // ── Fetch levels ──
  useEffect(() => {
    setLoading(l => ({ ...l, levels: true }));
    fetch(`/api/admin/levels?subject=${subject}`)
      .then(r => r.json())
      .then(data => {
        setLevels(data);
        if (data.length > 0 && !activeLevel) setActiveLevel(data[0].code);
        setLoading(l => ({ ...l, levels: false }));
      })
      .catch(() => setLoading(l => ({ ...l, levels: false })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  // ── Fetch categories ──
  const loadCategories = useCallback(async () => {
    setLoading(l => ({ ...l, cats: true }));
    const params = new URLSearchParams({ subject });
    const level = levels.find(lv => lv.code === activeLevel);
    if (level) params.set('levelId', level.id);
    if (activeSkill) params.set('skill', activeSkill);
    const res = await fetch(`/api/learning/categories?${params}`);
    if (res.ok) setCategories(await res.json());
    setActiveCatId(null);
    setActiveLesId(null);
    setLessons([]);
    setItems([]);
    setLoading(l => ({ ...l, cats: false }));
  }, [subject, activeLevel, activeSkill, levels]);

  useEffect(() => {
    if (levels.length > 0 && activeLevel) loadCategories();
  }, [loadCategories, levels, activeLevel]);

  // ── Fetch lessons ──
  const loadLessons = useCallback(async (catId: string) => {
    setLoading(l => ({ ...l, lessons: true }));
    setActiveCatId(catId);
    setActiveLesId(null);
    setItems([]);
    const res = await fetch(`/api/learning/lessons?categoryId=${catId}`);
    if (res.ok) setLessons(await res.json());
    setLoading(l => ({ ...l, lessons: false }));
  }, []);

  // ── Fetch items ──
  const loadItems = useCallback(async (lesId: string) => {
    setLoading(l => ({ ...l, items: true }));
    setActiveLesId(lesId);
    const res = await fetch(`/api/learning/lessons/${lesId}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
    setLoading(l => ({ ...l, items: false }));
  }, []);

  // ── CRUD: Category ──
  const saveCategory = async (form: CatForm, editId?: string | null) => {
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/learning/categories/${editId}` : '/api/learning/categories';
    const body = editId
      ? { name: form.name, description: form.description, icon: form.icon, order: form.order, skill: form.skill }
      : { levelId: form.levelId, skill: form.skill, name: form.name, description: form.description, icon: form.icon, order: form.order };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Lưu thất bại');
    await loadCategories();
    return res.json();
  };

  const deleteCategory = async (id: string) => {
    await fetch(`/api/learning/categories/${id}`, { method: 'DELETE' });
    await loadCategories();
  };

  // ── CRUD: Lesson ──
  const saveLesson = async (form: LesForm, categoryId: string, editId?: string | null) => {
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/learning/lessons/${editId}` : '/api/learning/lessons';
    const body = editId
      ? { title: form.title, description: form.description, type: form.type, order: form.order, requiredTier: form.requiredTier }
      : { categoryId, title: form.title, description: form.description, type: form.type, order: form.order, requiredTier: form.requiredTier };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Lưu thất bại');
    if (activeCatId) await loadLessons(activeCatId);
    return res.json();
  };

  const deleteLesson = async (id: string) => {
    await fetch(`/api/learning/lessons/${id}`, { method: 'DELETE' });
    if (activeCatId) await loadLessons(activeCatId);
    if (activeLesId === id) { setActiveLesId(null); setItems([]); }
  };

  // ── CRUD: Item ──
  const saveItem = async (form: ItemForm, lessonId: string, editId?: string | null) => {
    if (editId) {
      const res = await fetch(`/api/learning/items/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Lưu thất bại');
    } else {
      const res = await fetch(`/api/learning/lessons/${lessonId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Lưu thất bại');
    }
    if (activeLesId) await loadItems(activeLesId);
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/learning/items/${id}`, { method: 'DELETE' });
    if (activeLesId) await loadItems(activeLesId);
  };

  // ── Import ──
  const importItems = async (lessonId: string, format: 'json' | 'csv', data: string) => {
    const res = await fetch(`/api/learning/lessons/${lessonId}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Import thất bại');
    }
    const result = await res.json();
    if (activeLesId === lessonId) await loadItems(lessonId);
    return result as { imported: number; skipped: number; errors: string[] };
  };

  // ── Status ──
  const updateLessonStatus = async (id: string, status: ContentStatus) => {
    const res = await fetch(`/api/learning/lessons/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
    // Optimistic update
    setLessons(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const bulkUpdateStatus = async (ids: string[], status: ContentStatus) => {
    const res = await fetch('/api/learning/lessons/bulk-status', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
    setLessons(prev => prev.map(l => ids.includes(l.id) ? { ...l, status } : l));
  };

  // ── Reorder ──
  const reorderLessons = async (orderedIds: string[]) => {
    // Optimistic update
    const reordered = orderedIds.map((id, i) => {
      const les = lessons.find(l => l.id === id);
      return les ? { ...les, order: i } : null;
    }).filter(Boolean) as Lesson[];
    setLessons(reordered);

    const res = await fetch('/api/learning/lessons/reorder', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      // Revert on failure
      if (activeCatId) await loadLessons(activeCatId);
    }
  };

  const reorderItems = async (orderedIds: string[]) => {
    // Optimistic update
    const reordered = orderedIds.map((id, i) => {
      const item = items.find(it => it.id === id);
      return item ? { ...item, order: i } : null;
    }).filter(Boolean) as LearningItem[];
    setItems(reordered);

    const res = await fetch('/api/learning/items/reorder', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      if (activeLesId) await loadItems(activeLesId);
    }
  };

  return {
    levels, categories, lessons, items, loading,
    activeLevel, setActiveLevel, activeSkill, setActiveSkill,
    activeCatId, setActiveCatId, activeLesId, setActiveLesId,
    loadCategories, loadLessons, loadItems,
    saveCategory, deleteCategory,
    saveLesson, deleteLesson,
    saveItem, deleteItem,
    importItems,
    updateLessonStatus, bulkUpdateStatus,
    reorderLessons, reorderItems,
  };
}
