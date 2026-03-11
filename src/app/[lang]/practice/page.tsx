'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // ── Tab ──────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<'srs' | 'quick'>('srs');

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
    if (tab === 'quick') loadQuick(quickLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, quickLevel]);

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
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 btn-ghost"
        style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={11} /> Trang chủ
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <FaLayerGroup size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-base)' }}>Flashcard</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Học từ vựng theo phương pháp lặp lại có khoảng cách (Spaced Repetition)
          </p>
        </div>
        {tab === 'srs' && status === 'authenticated' && (
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 shrink-0">
            <FaPlus size={13} /> Tạo bộ thẻ
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-8 w-fit" style={{ background: 'var(--bg-muted)' }}>
        {([
          { key: 'srs',   label: 'Bộ thẻ SRS',  icon: <FaLayerGroup size={13} /> },
          { key: 'quick', label: 'Luyện nhanh',  icon: <FaBookOpen   size={13} /> },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.key
              ? { background: 'var(--bg-surface)', color: 'var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: 'var(--text-muted)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── SRS Tab ────────────────────────────────────────────────────────── */}
      {tab === 'srs' && (
        <>
          {/* Auth loading */}
          {status === 'loading' || (status === 'authenticated' && loading) ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>

          /* Not logged in */
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

          /* Authenticated: deck list */
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

              {/* New deck modal */}
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

              {/* Deck list */}
              {decks.length === 0 ? (
                <div className="card text-center py-16">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'var(--primary-light)' }}>
                    <FaLayerGroup size={28} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-base)' }}>
                    Chưa có bộ thẻ nào
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    Tạo bộ thẻ đầu tiên để bắt đầu học theo phương pháp Anki
                  </p>
                  <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-2">
                    <FaPlus size={13} /> Tạo bộ thẻ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {decks.map(deck => (
                    <div key={deck.id} className="card group relative" style={{ borderTop: `3px solid ${deck.color}` }}>
                      <button onClick={() => deleteDeck(deck.id)} disabled={deleting === deck.id}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-1.5"
                        style={{ color: '#EF4444' }}>
                        <FaTrash size={12} />
                      </button>
                      <Link href={`/flashcards/${deck.id}`} className="block">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: deck.color + '20', color: deck.color }}>
                            <FaLayerGroup size={16} />
                          </div>
                          <div className="min-w-0 flex-1 pr-6">
                            <h3 className="font-bold truncate" style={{ color: 'var(--text-base)' }}>{deck.title}</h3>
                            {deck.description && (
                              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{deck.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-xs">
                            <span style={{ color: 'var(--text-muted)' }}>
                              <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{deck._count.cards}</span> thẻ
                            </span>
                            {deck.dueCount > 0 && (
                              <span className="flex items-center gap-1" style={{ color: '#D97706' }}>
                                <FaBolt size={10} />
                                <span className="font-semibold">{deck.dueCount}</span> cần ôn
                              </span>
                            )}
                            {deck.dueCount === 0 && deck._count.cards > 0 && (
                              <span className="flex items-center gap-1" style={{ color: '#059669' }}>
                                <FaCircleCheck size={10} /> Đã ôn xong
                              </span>
                            )}
                          </div>
                          {deck._count.cards > 0 && (
                            <Link href={`/flashcards/${deck.id}/study`} onClick={e => e.stopPropagation()}
                              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                              style={{ background: deck.color }}>
                              <FaBolt size={10} /> Ôn tập
                            </Link>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* SRS tip */}
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

      {/* ── Quick Study Tab ──────────────────────────────────────────────── */}
      {tab === 'quick' && (
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

          {quickLoading ? (
            <div className="rounded-3xl border h-64 animate-pulse"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
          ) : quickCards.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu từ vựng.</p>
            </div>
          ) : quickFinished ? (
            /* Finished screen */
            <div className="card rounded-3xl p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-base)' }}>Hoàn thành!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Bạn đã ôn tập {quickTotal} từ vựng {quickLevel}
              </p>
              <div className="flex gap-6 justify-center mb-6">
                <div className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: '#48BB78' }}>{quickKnown.size}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Đã thuộc</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: '#F56565' }}>{quickUnknown.size}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cần ôn thêm</div>
                </div>
              </div>
              <button onClick={restartQuick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: quickColor }}>
                <FaRotate size={13} /> Làm lại
              </button>
            </div>
          ) : (
            <div>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${(quickIndex / quickTotal) * 100}%`, background: quickColor }} />
                </div>
                <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {quickIndex + 1} / {quickTotal}
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4 mb-4">
                <span className="text-xs px-2 py-1 rounded-xl font-bold"
                  style={{ background: '#48BB7820', color: '#48BB78' }}>{quickKnown.size} đã thuộc</span>
                <span className="text-xs px-2 py-1 rounded-xl font-bold"
                  style={{ background: '#F5656520', color: '#F56565' }}>{quickUnknown.size} cần ôn</span>
              </div>

              {/* Flip card */}
              <button onClick={() => setQuickFlipped(f => !f)}
                className="w-full rounded-3xl border p-10 text-center transition-all hover:shadow-lg cursor-pointer"
                style={{
                  background: quickFlipped ? `${quickColor}12` : 'var(--bg-surface)',
                  borderColor: quickFlipped ? quickColor : 'var(--border)',
                  minHeight: '220px',
                }}>
                {!quickFlipped ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-5xl font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: langCfg.font }}>
                      {currentCard.front}
                    </span>
                    {currentCard.pronunciation && (
                      <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                        {currentCard.pronunciation}
                      </span>
                    )}
                    <span className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: quickColor }}>{currentCard.back}</span>
                    <span className="text-lg mt-1" style={{ color: 'var(--text-secondary)', fontFamily: langCfg.font }}>
                      {currentCard.front}
                    </span>
                    {currentCard.pronunciation && (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{currentCard.pronunciation}</span>
                    )}
                  </div>
                )}
              </button>

              {/* Action buttons */}
              {quickFlipped ? (
                <div className="flex gap-3 mt-4">
                  <button onClick={markUnknown}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all"
                    style={{ borderColor: '#F56565', color: '#F56565' }}>
                    <FaXmark size={13} /> Chưa thuộc
                  </button>
                  <button onClick={markKnown}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                    style={{ background: '#48BB78' }}>
                    <FaCheck size={13} /> Đã thuộc
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-4">
                  <button onClick={quickPrev} disabled={quickIndex === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', opacity: quickIndex === 0 ? 0.4 : 1 }}>
                    <FaChevronLeft size={12} /> Trước
                  </button>
                  <button onClick={quickNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                    style={{ background: quickColor }}>
                    Tiếp <FaChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function FlashcardsPage() {
  return <FlashcardsContent />;
}

