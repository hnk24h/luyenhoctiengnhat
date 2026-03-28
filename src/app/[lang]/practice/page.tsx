"use client";

export const dynamic = 'force-dynamic';
import { FlashcardsTab } from '@/components/FlashcardsTab';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnSidebar } from '@/components/LearnSidebar';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaLayerGroup, FaPlus, FaXmark, FaCheck, FaBolt,
  FaCircleCheck, FaClockRotateLeft, FaTrash, FaArrowLeft,
  FaRotate, FaChevronLeft, FaChevronRight, FaBookOpen, FaLock,
} from 'react-icons/fa6';

// ─── Per-language config ──────────────────────────────────────────────────────

type PracticeLangConfig = {
  levels: string[];
  levelColors: Record<string, string>;
  apiUrl: (level: string) => string;
  font: string;
  defaultLevel: string;
};

const PRACTICE_LANG_CONFIG: Record<string, PracticeLangConfig> = {
  ja: {
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    levelColors: { N5: '#48BB78', N4: '#4299E1', N3: '#ECC94B', N2: '#ED8936', N1: '#F56565' },
    apiUrl: (level) => `/api/jlpt/vocab?level=${level}`,
    font: 'Noto Serif JP, serif',
    defaultLevel: 'N5',
  },
  zh: {
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    levelColors: { HSK1: '#48BB78', HSK2: '#4299E1', HSK3: '#9F7AEA', HSK4: '#ED8936', HSK5: '#F56565', HSK6: '#D53F8C' },
    apiUrl: (level) => `/api/chinese/vocab?level=${level}`,
    font: 'Noto Serif SC, serif',
    defaultLevel: 'HSK1',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Deck {
  id: string;
  title: string;
  description: string | null;
  color: string;
  _count: { cards: number };
  dueCount: number;
  updatedAt: string;
}

type QuickCard = { id: string; front: string; back: string; pronunciation: string };

type ApiItem = {
  id: string;
  term: string;
  pronunciation: string;
  meanings: { id: string; language: string; meaning: string }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0891B2', '#374151',
];

// ─── Unified component ────────────────────────────────────────────────────────

function FlashcardsContent() {
  const { data: session, status } = useSession();
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const langCfg = useMemo(
    () => PRACTICE_LANG_CONFIG[lang] ?? PRACTICE_LANG_CONFIG.ja,
    [lang],
  );

  // Sidebar đồng nhất: levels, skills, selectedLevel, selectedSkill
  const levels = langCfg.levels.map(lvl => ({
    code: lvl,
    label: lvl,
    desc: '',
    percent: undefined,
    status: undefined,
  }));
  const skills = [
    { key: 'srs', label: 'Lặp lại ngắt quãng (SRS)', icon: <FaLayerGroup size={18} /> },
    { key: 'quick', label: 'Luyện ghi nhớ thường', icon: <FaBookOpen size={18} /> },
  ];
  const [selectedLevel, setSelectedLevel] = useState(levels[0]?.code || '');
  const [selectedSkill, setSelectedSkill] = useState<'srs' | 'quick'>('srs');

  // ── SRS state ────────────────────────────────────────────────────────────────
  const [decks,   setDecks]   = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [newColor, setNewColor] = useState('#4F46E5');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Quick-study state ─────────────────────────────────────────────────────
  const [quickLevel,    setQuickLevel]    = useState(() => langCfg.defaultLevel);
  const [quickCards,    setQuickCards]    = useState<QuickCard[]>([]);
  const [quickLoading,  setQuickLoading]  = useState(false);
  const [quickIndex,    setQuickIndex]    = useState(0);
  const [quickFlipped,  setQuickFlipped]  = useState(false);
  const [quickKnown,    setQuickKnown]    = useState<Set<string>>(new Set());
  const [quickUnknown,  setQuickUnknown]  = useState<Set<string>>(new Set());
  const [quickFinished, setQuickFinished] = useState(false);

  // ── Load SRS decks ────────────────────────────────────────────────────────
  const loadDecks = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/flashcards');
    if (res.ok) setDecks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadDecks();
  }, [status, loadDecks]);

  // ── Load quick-study vocab ────────────────────────────────────────────────
  const loadQuick = useCallback(async (level: string) => {
    setQuickLoading(true);
    setQuickIndex(0); setQuickFlipped(false);
    setQuickKnown(new Set()); setQuickUnknown(new Set()); setQuickFinished(false);
    try {
      const res = await fetch(langCfg.apiUrl(level));
      const data: ApiItem[] = await res.json();
      setQuickCards(data.map(d => ({
        id: d.id,
        front: d.term,
        pronunciation: d.pronunciation ?? '',
        back: d.meanings?.[0]?.meaning ?? '',
      })));
    } catch { setQuickCards([]); }
    finally { setQuickLoading(false); }
  }, [langCfg]);

  useEffect(() => {
    if (selectedSkill === 'quick') loadQuick(quickLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, quickLevel]);

  // ── Quick helpers ─────────────────────────────────────────────────────────
  const quickTotal   = quickCards.length;
  const quickColor   = langCfg.levelColors[quickLevel] ?? '#4F46E5';
  const currentCard  = quickCards[quickIndex];

  function quickNext() {
    if (quickIndex + 1 >= quickTotal) { setQuickFinished(true); return; }
    setQuickIndex(i => i + 1); setQuickFlipped(false);
  }
  function quickPrev() {
    if (quickIndex > 0) { setQuickIndex(i => i - 1); setQuickFlipped(false); }
  }
  function markKnown() {
    setQuickKnown(s => new Set([...s, currentCard.id]));
    quickNext();
  }
  function markUnknown() {
    setQuickUnknown(s => new Set([...s, currentCard.id]));
    quickNext();
  }
  function restartQuick() {
    setQuickIndex(0); setQuickFlipped(false);
    setQuickKnown(new Set()); setQuickUnknown(new Set()); setQuickFinished(false);
  }

  // ── SRS deck actions ──────────────────────────────────────────────────────
  async function createDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, color: newColor }),
    });
    if (res.ok) {
      setNewTitle(''); setNewDesc(''); setNewColor('#4F46E5');
      setShowNew(false);
      await loadDecks();
    }
    setCreating(false);
  }

  async function deleteDeck(id: string) {
    if (!confirm('Xóa bộ thẻ này? Tất cả thẻ sẽ bị xóa.')) return;
    setDeleting(id);
    await fetch(`/api/flashcards/${id}`, { method: 'DELETE' });
    setDecks(d => d.filter(x => x.id !== id));
    setDeleting(null);
  }

  const totalCards = decks.reduce((s, d) => s + d._count.cards, 0);
  const totalDue   = decks.reduce((s, d) => s + d.dueCount, 0);

  // ── Render ────────────────────────────────────────────────────────────────
    // Gamification demo state (localStorage, simple)
    const [streak, setStreak] = useState(3); // demo
    const [xp, setXp] = useState(120); // demo
    const [badge, setBadge] = useState('🔥'); // demo

    return (
      <LearnLayout
        sidebarProps={{
          mode: 'skill',
          setMode: () => {},
          selectedLevel,
          setSelectedLevel,
          selectedSkill,
          setSelectedSkill,
          levels,
          skills,
          title: 'Luyện Flashcard',
        }}
        bottomBarProps={{}}
      >
        {/* Header lớn, động lực */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-blue-400 shadow-lg">
            <FaLayerGroup size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Luyện tập Flashcard</h1>
            <p className="text-base text-gray-500">Học từ vựng hiệu quả với lặp lại ngắt quãng (SRS) & luyện ghi nhớ thường.</p>
          </div>
          <div className="flex-1" />
          {selectedSkill === 'srs' && status === 'authenticated' && (
            <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 px-5 py-2 rounded-xl text-base font-semibold shadow-md">
              <FaPlus size={16} /> Tạo bộ thẻ
            </button>
          )}
        </div>
        {/* Nội dung theo skill */}
        {selectedSkill === 'srs' && (
          <>
          {status === 'loading' || (status === 'authenticated' && loading) ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : status === 'unauthenticated' ? (
            <div className="card text-center py-16 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--primary-light)' }}>
                <FaLock size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-base)' }}>
                Đăng nhập để dùng SRS
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Tạo và quản lý bộ thẻ cá nhân, theo dõi tiến độ học tập theo phương pháp Spaced Repetition.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              {decks.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                  {[
                    { label: 'Bộ thẻ',   value: decks.length, icon: <FaLayerGroup  size={14} />, color: 'var(--primary)' },
                    { label: 'Tổng thẻ', value: totalCards,   icon: <FaCircleCheck size={14} />, color: '#059669' },
                    { label: 'Cần ôn',   value: totalDue,     icon: <FaBolt        size={14} />, color: '#D97706' },
                  ].map(s => (
                    <div key={s.label} className="card flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-3 sm:p-4 text-center sm:text-left">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: s.color + '15', color: s.color }}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-bold leading-none" style={{ color: 'var(--text-base)' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                  onClick={() => setShowNew(false)}>
                  <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Tạo bộ thẻ mới</h2>
                      <button onClick={() => setShowNew(false)} className="btn-ghost p-1.5">
                        <FaXmark size={14} />
                      </button>
                    </div>
                    <form onSubmit={createDeck} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                          Tên bộ thẻ *
                        </label>
                        <input className="input w-full"
                          placeholder="Ví dụ: N5 Từ vựng, Động từ nhóm 1..."
                          value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                          Mô tả (tùy chọn)
                        </label>
                        <textarea className="input w-full resize-none" rows={2}
                          placeholder="Ghi chú về bộ thẻ này..."
                          value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
                          Màu sắc
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {PRESET_COLORS.map(c => (
                            <button key={c} type="button" onClick={() => setNewColor(c)}
                              className="w-7 h-7 rounded-full transition-all"
                              style={{
                                background: c,
                                outline: newColor === c ? `3px solid ${c}` : 'none',
                                outlineOffset: '2px',
                                opacity: newColor === c ? 1 : 0.65,
                              }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex-1">
                          Hủy
                        </button>
                        <button type="submit" disabled={!newTitle.trim() || creating}
                          className="btn-primary flex-1 flex items-center justify-center gap-2">
                          {creating
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <FaCheck size={12} />}
                          Tạo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {decks.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-inner">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-blue-400 shadow-lg">
                    <FaLayerGroup size={36} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold mb-2 text-gray-800">Chưa có bộ thẻ nào</h2>
                  <p className="text-base mb-7 text-gray-500">Tạo bộ thẻ đầu tiên để bắt đầu học hiệu quả với SRS.</p>
                  <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-2 px-6 py-2 rounded-xl text-lg font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-150">
                    <FaPlus size={18} /> Tạo bộ thẻ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {decks.map(deck => (
                    <div key={deck.id} className="group relative rounded-3xl border-2 border-blue-100 bg-white shadow-lg hover:scale-[1.025] hover:shadow-2xl transition-transform duration-200" style={{ borderTop: `4px solid ${deck.color}` }}>
                      <button onClick={() => deleteDeck(deck.id)} disabled={deleting === deck.id} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-2 bg-white rounded-full shadow-md hover:scale-110" style={{ color: '#EF4444' }}>
                        <FaTrash size={14} />
                      </button>
                      <Link href={`/flashcards/${deck.id}`} className="block p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: deck.color + '22', color: deck.color }}>
                            <FaLayerGroup size={20} />
                          </div>
                          <div className="min-w-0 flex-1 pr-6">
                            <h3 className="font-bold text-lg truncate text-gray-900">{deck.title}</h3>
                            {deck.description && (
                              <p className="text-sm mt-1 truncate text-gray-500">{deck.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-400">
                              <span className="font-semibold text-gray-900">{deck._count.cards}</span> thẻ
                            </span>
                            {deck.dueCount > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                                <FaBolt size={12} /> {deck.dueCount} cần ôn
                              </span>
                            )}
                            {deck.dueCount === 0 && deck._count.cards > 0 && (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <FaCircleCheck size={12} /> Đã ôn xong
                              </span>
                            )}
                          </div>
                          {deck._count.cards > 0 && (
                            <Link href={`/flashcards/${deck.id}/study`} onClick={e => e.stopPropagation()} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-150" style={{ background: deck.color }}>
                              <FaBolt size={12} /> Ôn tập
                            </Link>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <div className="card mt-8" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                <div className="flex items-start gap-3">
                  <FaClockRotateLeft size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>
                      Phương pháp Spaced Repetition
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--primary)' }}>
                      Hệ thống sẽ tự động nhắc bạn ôn đúng lúc bạn sắp quên — thẻ khó xuất hiện thường xuyên hơn,
                      thẻ dễ xuất hiện thưa hơn. Ôn đều đặn mỗi ngày để đạt hiệu quả tốt nhất.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          </>
        )}
        {selectedSkill === 'quick' && (
          <div className="max-w-2xl mx-auto">
            {/* Level picker */}
            <div className="flex gap-1.5 flex-wrap mb-6">
              {langCfg.levels.map(lvl => (
                <button key={lvl} onClick={() => setQuickLevel(lvl)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={quickLevel === lvl
                    ? { background: langCfg.levelColors[lvl], color: '#fff' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lvl}
                </button>
              ))}
            </div>
            {/* Use shared FlashcardsTab component for quick-study */}
            <FlashcardsTab
              items={quickCards.map(card => ({
                id: card.id,
                term: card.front,
                pronunciation: card.pronunciation,
                meanings: [{ id: card.id, language: lang, meaning: card.back }],
                examples: [],
              }))}
              color={quickColor}
              font={langCfg.font}
            />
          </div>
        )}
      </LearnLayout>
    );
}

export default function FlashcardsPage() {
  return <FlashcardsContent />;
}

