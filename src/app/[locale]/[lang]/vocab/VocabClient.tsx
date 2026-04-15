"use client";

import { AnkiStudyTab } from '@/components/AnkiStudyTab';
import { FlashcardsTab } from '@/components/FlashcardsTab';
import { PracticeTab } from './components/PracticeTab';
import { FavoritesTab } from './components/FavoritesTab';
import { ReviewMistakesTab } from './components/ReviewMistakesTab';

import { useState, useEffect } from 'react';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { useSession } from 'next-auth/react';
import { useVocabWords } from './hooks/useVocabWords';
import { useRefVocab } from './hooks/useRefVocab';
import { useParams, useSearchParams } from 'next/navigation';
import {
  FaBookmark, FaTrash, FaPlus, FaArrowLeft,
  FaMagnifyingGlass, FaXmark, FaCheck, FaFolder, FaCircleXmark,
  FaEllipsisVertical, FaPen, FaSliders, FaBookOpen, FaLayerGroup,
} from 'react-icons/fa6';

// Types are now in hooks/useVocabWords.ts — import for local component use
import type { Word, Collection } from './hooks/useVocabWords';

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

import type { VocabRefItem } from '@/types/vocab';

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
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const langCfg = VOCAB_LANG_CONFIG[lang] ?? VOCAB_LANG_CONFIG.ja;

  // ── UI state (layout only) ───────────────────────────────────────────────────
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const lvl = searchParams.get('level');
    return lvl && langCfg.levels.includes(lvl) ? lvl : langCfg.defaultLevel;
  });
  // Sync level when ?level= param changes (e.g. navbar dropdown click on same page)
  useEffect(() => {
    const lvl = searchParams.get('level');
    if (lvl && langCfg.levels.includes(lvl)) setSelectedLevel(lvl);
  }, [searchParams, langCfg.levels]);
  const [selectedFunc,  setSelectedFunc]  = useState('flashcard');
  const [tier, setTier] = useState<'free' | 'basic' | 'premium'>('free');

  const LEVELS_OBJ = langCfg.levels.map(lv => ({ code: lv, label: lv, desc: langCfg.levelLabels[lv] }));
  const SKILLS = [
    { key: 'flashcard', label: 'Học Flashcard', icon: <FaLayerGroup /> },
    { key: 'srs',       label: 'Học SRS',        icon: <FaLayerGroup /> },
    { key: 'topics',    label: 'Theo chủ đề',    icon: <FaLayerGroup /> },
    { key: 'mine',      label: 'Từ của tôi',      icon: <FaLayerGroup /> },
  ];

  // ── Data hooks ───────────────────────────────────────────────────────────────
  const {
    words, collections, loading,
    search, setSearch,
    activeColId, setActiveColId,
    selected, setSelected,
    exporting, exportDone,
    sheetOpen, setSheetOpen,
    filtered, allSelected,
    toggleAll,
    createCollection, renameCollection, deleteCollection,
    removeFromCollection, deleteWord, deleteSelected,
    exportToFlashcards,
  } = useVocabWords(status);

  const {
    refItems, refSearch, setRefSearch,
    refLoading, refFlipped,
    refFiltered, allRefFlipped,
    toggleRefFlip, flipAllRef,
  } = useRefVocab(langCfg.apiUrl, selectedLevel);

  const refColor = langCfg.levelColors[selectedLevel] ?? '#6C5CE7';

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

export default function VocabClient() {
  return <VocabContent />;
}
