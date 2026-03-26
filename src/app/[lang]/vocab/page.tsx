"use client";

import { AnkiStudyTab } from '@/components/AnkiStudyTab';
import { FlashcardsTab } from '@/components/FlashcardsTab';
import { PracticeTab } from './components/PracticeTab';
import { FavoritesTab } from './components/FavoritesTab';
import { ReviewMistakesTab } from './components/ReviewMistakesTab';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaBookmark, FaTrash, FaPlus, FaArrowLeft,
  FaMagnifyingGlass, FaXmark, FaCheck, FaFolder, FaCircleXmark,
  FaEllipsisVertical, FaPen, FaSliders, FaBookOpen, FaLayerGroup,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColInfo { id: string; name: string; color: string; }

interface SavedWordContent {
  id: string; term: string; pronunciation: string | null;
  meanings: { language: string; meaning: string }[];
  examples: { exampleText: string; translation: string | null }[];
}

interface Word {
  id:          string;
  contentId:   string;
  content:     SavedWordContent;
  context:     string | null;
  createdAt:   string;
  collections: ColInfo[];
}

interface Collection {
  id:        string;
  name:      string;
  color:     string;
  wordCount: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  '#4F46E5','#0EA5E9','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1',
];

// ─── Per-language vocab config ───────────────────────────────────────────────

type VocabLangConfig = {
  levels: string[];
  levelColors: Record<string, string>;
  levelLabels: Record<string, string>;
  apiUrl: (level: string) => string;
  font: string;
  meaningIcon: string;
  defaultLevel: string;
};

const VOCAB_LANG_CONFIG: Record<string, VocabLangConfig> = {
  ja: {
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    levelColors: { N5: '#48BB78', N4: '#4299E1', N3: '#ECC94B', N2: '#ED8936', N1: '#F56565' },
    levelLabels: { N5: 'Sơ cấp', N4: 'Sơ trung cấp', N3: 'Trung cấp', N2: 'Trung cao cấp', N1: 'Cao cấp' },
    apiUrl:  (level) => `/api/jlpt/vocab?level=${level}`,
    font: 'Noto Serif JP, serif',
    meaningIcon: '意',
    defaultLevel: 'N5',
  },
  zh: {
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    levelColors: { HSK1: '#48BB78', HSK2: '#4299E1', HSK3: '#9F7AEA', HSK4: '#ED8936', HSK5: '#F56565', HSK6: '#D53F8C' },
    levelLabels: { HSK1: 'Nhập môn', HSK2: 'Cơ bản', HSK3: 'Sơ trung cấp', HSK4: 'Trung cấp', HSK5: 'Trung cao cấp', HSK6: 'Cao cấp' },
    apiUrl: (level) => `/api/chinese/vocab?level=${level}`,
    font: 'Noto Serif SC, serif',
    meaningIcon: '义',
    defaultLevel: 'HSK1',
  },
};

type VocabRefContentMeaning = { id: string; language: string; meaning: string };
type VocabRefContentExample = { id: string; exampleText: string; translation: string | null; language: string; translationLanguage: string | null };
type VocabRefItem = {
  id: string; term: string; pronunciation: string | null;
  meanings: VocabRefContentMeaning[];
  examples?: VocabRefContentExample[];
};

function CardSkeleton() {
  return (
    <div className="rounded-2xl border animate-pulse"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', minHeight: '9rem' }} />
  );
}

function VocabCard({ item, color, flipped, onFlip, font, meaningIcon }: {
  item: VocabRefItem; color: string; flipped: boolean; onFlip: () => void;
  font: string; meaningIcon: string;
}) {
  return (
    <button onClick={onFlip}
      className="rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-md w-full"
      style={{
        background: flipped ? `${color}10` : 'var(--bg-surface)',
        borderColor: flipped ? color : 'var(--border)',
        minHeight: '9rem', padding: '1rem',
      }}>
      {!flipped ? (
        <div className="flex flex-col items-center justify-center h-full gap-1.5 py-2">
          <span className="text-2xl font-bold leading-tight text-center"
            style={{ fontFamily: font, color: 'var(--text-primary)' }}>
            {item.term}
          </span>
          {item.pronunciation && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.pronunciation}</span>
          )}
          <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>nhấn để xem nghĩa</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex items-start gap-1.5">
            <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color }}>{meaningIcon}</span>
            <span className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{item.meanings?.[0]?.meaning ?? ''}</span>
          </div>
          {item.pronunciation && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.pronunciation}</div>}
          {item.examples?.[0] && (
            <div className="pt-2 border-t" style={{ borderColor: `${color}30` }}>
              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>{item.examples[0].exampleText}</p>
              {item.examples[0].translation && (
                <p className="text-xs mt-1 italic" style={{ color }}>{item.examples[0].translation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ─── CollectionSidebar ────────────────────────────────────────────────────────

function CollectionSidebar({
  collections, activeId, totalCount,
  onSelect, onCreate, onRename, onDelete,
}: {
  collections:  Collection[];
  activeId:     string | null;
  totalCount:   number;
  onSelect:     (id: string | null) => void;
  onCreate:     (name: string, color: string) => void;
  onRename:     (id: string, name: string) => void;
  onDelete:     (id: string) => void;
}) {
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newColor,   setNewColor]   = useState(PALETTE[0]);
  const [menuId,     setMenuId]     = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal,  setRenameVal]  = useState('');

  function submitCreate() {
    if (!newName.trim()) return;
    onCreate(newName.trim(), newColor);
    setNewName(''); setNewColor(PALETTE[0]); setCreating(false);
  }

  function startRename(col: Collection) {
    setRenamingId(col.id); setRenameVal(col.name); setMenuId(null);
  }

  function submitRename(id: string) {
    if (renameVal.trim()) onRename(id, renameVal.trim());
    setRenamingId(null);
  }

  return (
    <aside className="flex flex-col gap-1">
      {/* All words */}
      <button
        onClick={() => onSelect(null)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all w-full text-left"
        style={activeId === null
          ? { background: 'var(--primary)', color: 'white' }
          : { background: 'transparent', color: 'var(--text-base)' }}>
        <FaBookmark size={12} />
        <span className="flex-1">Tất cả từ</span>
        <span className="text-xs opacity-60">{totalCount}</span>
      </button>

      <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

      {/* Collection list */}
      {collections.map(col => (
        <div key={col.id} className="relative group">
          {renamingId === col.id ? (
            <div className="flex items-center gap-1 px-2">
              <input
                autoFocus value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitRename(col.id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                onBlur={() => submitRename(col.id)}
                className="flex-1 text-sm px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor: col.color, color: 'var(--text-base)', background: 'white' }}
              />
            </div>
          ) : (
            <button onClick={() => onSelect(col.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all w-full text-left"
              style={activeId === col.id
                ? { background: `${col.color}22`, color: col.color, fontWeight: 700 }
                : { color: 'var(--text-base)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.color }} />
              <span className="flex-1 truncate">{col.name}</span>
              <span className="text-xs opacity-50">{col.wordCount}</span>
              <span role="button"
                onClick={e => { e.stopPropagation(); setMenuId(menuId === col.id ? null : col.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity">
                <FaEllipsisVertical size={10} />
              </span>
            </button>
          )}
          {menuId === col.id && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-lg border py-1"
              style={{ background: 'white', borderColor: 'var(--border)', minWidth: 130 }}>
              <button onClick={() => startRename(col)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-gray-50 text-left">
                <FaPen size={10} /> Đổi tên
              </button>
              <button onClick={() => { onDelete(col.id); setMenuId(null); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-red-50 text-left"
                style={{ color: '#EF4444' }}>
                <FaTrash size={10} /> Xóa chủ đề
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Create new */}
      {creating ? (
        <div className="mt-1 p-2 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Tên chủ đề..." className="w-full text-sm px-2 py-1 rounded-lg border outline-none mb-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text-base)', background: 'white' }} />
          <div className="flex flex-wrap gap-1 mb-2">
            {PALETTE.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                  transform: newColor === c ? 'scale(1.25)' : 'scale(1)' }} />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={submitCreate} className="flex-1 text-xs py-1 rounded-lg font-semibold"
              style={{ background: newColor, color: 'white' }}>Tạo</button>
            <button onClick={() => setCreating(false)} className="px-2 text-xs py-1 rounded-lg"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>Huỷ</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all w-full text-left mt-1"
          style={{ color: 'var(--text-muted)' }}>
          <FaPlus size={11} /> Tạo chủ đề mới
        </button>
      )}

      {menuId && <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />}
    </aside>
  );
}
// ─── Main page ────────────────────────────────────────────────────────────────
function GamificationBar() {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [goal, setGoal] = useState(20);
  const [today, setToday] = useState(0);
  const [lastDate, setLastDate] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("vocab_gamify") || "{}") || {};
    setStreak(data.streak || 0);
    setXp(data.xp || 0);
    setGoal(data.goal || 20);
    setToday(data.today || 0);
    setLastDate(data.lastDate || "");
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "vocab_gamify",
      JSON.stringify({ streak, xp, goal, today, lastDate })
    );
  }, [streak, xp, goal, today, lastDate]);

  // Demo: simulate progress for today
  function addXp(amount = 2) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (lastDate !== todayStr) {
      setStreak(s => (lastDate ? s + 1 : 1));
      setToday(amount);
      setLastDate(todayStr);
    } else {
      setToday(t => t + amount);
    }
    setXp(x => x + amount);
  }

  // Progress bar width
  const percent = Math.min(100, Math.round((today / goal) * 100));

  return (
    <div className="w-full flex flex-col items-center gap-2 py-3 px-4 mb-4 rounded-2xl border bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 shadow-sm">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-lg">{streak}</span>
          <span className="text-xs text-gray-500 ml-1">ngày streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-2xl">★</span>
          <span className="font-bold text-lg">{xp}</span>
          <span className="text-xs text-gray-500 ml-1">XP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-2xl">🎯</span>
          <span className="font-bold text-lg">{today}/{goal}</span>
          <span className="text-xs text-gray-500 ml-1">mục tiêu hôm nay</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-purple-500" style={{ width: percent + "%" }} />
      </div>
      <button
        className="mt-1 px-3 py-1 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition"
        onClick={() => addXp(2)}
      >
        +2 XP (Demo)
      </button>
    </div>
  );
}

function VocabContent() {
  const { status } = useSession();
  const router = useRouter();
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const langCfg = VOCAB_LANG_CONFIG[lang] ?? VOCAB_LANG_CONFIG.ja;
  const searchParams = useSearchParams();

  // Sidebar state: Level & Function
  const [selectedLevel, setSelectedLevel] = useState(langCfg.defaultLevel);
  const [selectedFunc, setSelectedFunc] = useState('flashcard');

  // Sidebar/BottomBar config for LearnLayout
  const LEVELS_OBJ = langCfg.levels.map(lv => ({ code: lv, label: lv, desc: langCfg.levelLabels[lv] }));
  const SKILLS = [
    { key: 'flashcard', label: 'Học Flashcard', icon: <FaLayerGroup /> },
    { key: 'srs', label: 'Học SRS', icon: <FaLayerGroup /> },
    { key: 'topics', label: 'Theo chủ đề', icon: <FaLayerGroup /> },
    { key: 'mine', label: 'Từ của tôi', icon: <FaLayerGroup /> },
  ];
  // Simulate tier state (replace with real logic)
  const [tier, setTier] = useState<'free' | 'basic' | 'premium'>('free');

  // ── My vocab state ────────────────────────────────────────────────────────────
  const [words,        setWords]        = useState<Word[]>([]);
  const [collections,  setCollections]  = useState<Collection[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [activeColId,  setActiveColId]  = useState<string | null>(null);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [exporting,    setExporting]    = useState(false);
  const [exportDone,   setExportDone]   = useState(false);
  const [sheetOpen,    setSheetOpen]    = useState(false);

  // ── Reference vocab state ─────────────────────────────────────────────────────
  const [refSearch,  setRefSearch]  = useState('');
  const [refItems,   setRefItems]   = useState<VocabRefItem[]>([]);
  const [refLoading, setRefLoading] = useState(false);
  const [refFlipped, setRefFlipped] = useState<Set<string>>(new Set());

  const loadAll = useCallback(async () => {
    const [wRes, cRes] = await Promise.all([
      fetch('/api/words'),
      fetch('/api/collections'),
    ]);
    if (wRes.ok) setWords(await wRes.json());
    if (cRes.ok) setCollections(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadAll();
    else if (status === 'unauthenticated') setLoading(false);
  }, [status, loadAll]);

  // ── Collection CRUD ──────────────────────────────────────────────────────────

  async function createCollection(name: string, color: string) {
    const res = await fetch('/api/collections', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const col: Collection = await res.json();
      setCollections(prev => [...prev, col]);
    }
  }

  async function renameCollection(id: string, name: string) {
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }

  async function deleteCollection(id: string) {
    if (!confirm('Xóa chủ đề này? Các từ trong đó sẽ không bị xóa.')) return;
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id));
      setWords(prev => prev.map(w => ({ ...w, collections: w.collections.filter(c => c.id !== id) })));
      if (activeColId === id) setActiveColId(null);
    }
  }

  // ── Remove word from a collection ────────────────────────────────────────────

  async function removeFromCollection(wordId: string, colId: string) {
    await fetch(`/api/collections/${colId}/words`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId }),
    });
    setWords(prev => prev.map(w =>
      w.id === wordId ? { ...w, collections: w.collections.filter(c => c.id !== colId) } : w
    ));
    setCollections(prev => prev.map(c =>
      c.id === colId ? { ...c, wordCount: Math.max(0, c.wordCount - 1) } : c
    ));
  }

  // ── Delete word ───────────────────────────────────────────────────────────────

  async function deleteWord(id: string) {
    if (!confirm('Xóa từ này?')) return;
    await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => w.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  async function deleteSelected() {
    if (!confirm(`Xóa ${selected.size} từ đã chọn?`)) return;
    for (const id of selected) await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => !selected.has(w.id)));
    setSelected(new Set());
  }

  // ── Flashcard export ──────────────────────────────────────────────────────────

  async function exportToFlashcards() {
    const toExport = filtered.filter(w => selected.size === 0 || selected.has(w.id));
    if (!toExport.length) return;
    setExporting(true);
    const deckRes = await fetch('/api/flashcards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Từ vựng${activeColId ? ` - ${collections.find(c => c.id === activeColId)?.name}` : ''} (${new Date().toLocaleDateString('vi-VN')})`,
        description: `${toExport.length} từ từ bộ sưu tập`, color: '#7C3AED',
      }),
    });
    if (!deckRes.ok) { setExporting(false); return; }
    const deck = await deckRes.json();
    await fetch(`/api/flashcards/${deck.id}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: toExport.map(w => ({ front: w.content.term, back: w.content.meanings?.[0]?.meaning ?? '', reading: w.content.pronunciation || undefined, example: w.context || undefined })) }),
    });
    setExporting(false); setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  // ── Reference vocab fetch ─────────────────────────────────────────────────────

  const fetchRefVocab = useCallback(async (level: string) => {
    setRefLoading(true);
    try {
      const res = await fetch(langCfg.apiUrl(level));
      const data: VocabRefItem[] = await res.json();
      setRefItems(Array.isArray(data) ? data : []);
    } catch { setRefItems([]); }
    finally { setRefLoading(false); }
  }, [langCfg]);

  useEffect(() => {
    fetchRefVocab(selectedLevel);
    setRefFlipped(new Set());
    setRefSearch('');
  }, [selectedLevel, fetchRefVocab]);

  // ── Filtering ─────────────────────────────────────────────────────────────────

  const filtered = words.filter(w => {
    if (activeColId && !w.collections.some(c => c.id === activeColId)) return false;
    if (search && !w.content.term.includes(search) && !w.content.pronunciation?.includes(search) &&
        !(w.content.meanings?.[0]?.meaning ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(w => selected.has(w.id));
  function toggleAll() {
    if (allSelected) setSelected(prev => { const s = new Set(prev); filtered.forEach(w => s.delete(w.id)); return s; });
    else setSelected(prev => new Set([...prev, ...filtered.map(w => w.id)]));
  }

  // ── Reference tab computed values ─────────────────────────────────────────────

  const refFiltered = useMemo(() => {
    if (!refSearch.trim()) return refItems;
    const q = refSearch.toLowerCase();
    return refItems.filter(i =>
      i.term.includes(q) || (i.pronunciation ?? '').toLowerCase().includes(q) ||
      (i.meanings?.[0]?.meaning ?? '').toLowerCase().includes(q) || (i.examples?.[0]?.exampleText ?? '').includes(q)
    );
  }, [refItems, refSearch]);

  const refColor = langCfg.levelColors[selectedLevel] ?? '#6C5CE7';
  const allRefFlipped = refFiltered.length > 0 && refFlipped.size === refFiltered.length;

  function toggleRefFlip(id: string) {
    setRefFlipped(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function flipAllRef() {
    if (allRefFlipped) setRefFlipped(new Set());
    else setRefFlipped(new Set(refFiltered.map(i => i.id)));
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  const activeCol = collections.find(c => c.id === activeColId) ?? null;

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'level',
        setMode: () => {}, // Not used for vocab, but required by LearnSidebar
        selectedLevel,
        setSelectedLevel,
        selectedSkill: selectedFunc,
        setSelectedSkill: setSelectedFunc,
        levels: LEVELS_OBJ,
        skills: SKILLS,
        title: 'Học từ vựng',
      }}
      bottomBarProps={{
        levels: LEVELS_OBJ,
        selectedLevel,
        setSelectedLevel,
        skills: SKILLS,
        selectedSkill: selectedFunc,
        setSelectedSkill: setSelectedFunc,
      }}
    >
      {/* Gamification bar at the top */}
      <GamificationBar />
      <LearnHeader icon={<FaLayerGroup />} title="Từ vựng tiếng Nhật" subtitle="Từ vựng JLPT theo cấp độ" />
      {/* Main content switches by selectedFunc */}
      {selectedFunc === 'flashcard' && (
        <FlashcardsTab
          items={refFiltered}
          color={refColor}
          font={langCfg.font}
        />
      )}
      {selectedFunc === 'srs' && (
        <AnkiStudyTab
          items={refFiltered.map(item => ({
            id: item.id,
            front: item.term,
            back: item.meanings?.[0]?.meaning ?? '',
            reading: item.pronunciation ?? '',
            example: item.examples?.[0]?.exampleText ?? '',
          }))}
          tier={
            lang === 'ja' && selectedLevel === 'N1' ? 'premium' :
            lang === 'zh' && selectedLevel === 'HSK1' ? 'premium' :
            tier
          }
          font={langCfg.font}
        />
      )}
      {selectedFunc === 'topics' && (
        <>
          {/* ...existing code for topics tab... */}
        </>
      )}
      {selectedFunc === 'mine' && (
        <>
          {/* ...existing code for mine tab... */}
        </>
      )}
    </LearnLayout>
  );
}

export default function VocabPage() {
  return <VocabContent />;
}
