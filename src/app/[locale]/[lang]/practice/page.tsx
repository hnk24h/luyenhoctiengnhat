"use client";

export const dynamic = 'force-dynamic';
import { FlashcardsTab } from '@/components/FlashcardsTab';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnSidebar } from '@/components/LearnSidebar';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaLayerGroup, FaPlus, FaXmark, FaCheck, FaBolt,
  FaCircleCheck, FaClockRotateLeft, FaTrash, FaArrowLeft,
  FaRotate, FaChevronLeft, FaChevronRight, FaBookOpen, FaLock,
  FaClock, FaHeadphones, FaGraduationCap,
  FaShareNodes, FaGlobe, FaUserGroup, FaLockOpen, FaUsers,
  FaEnvelope, FaMagnifyingGlass, FaChevronDown,
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
  shareMode: 'private' | 'public' | 'specific';
  _count: { cards: number };
  dueCount: number;
  updatedAt: string;
}

interface SharedDeck {
  id: string;
  title: string;
  description: string | null;
  color: string;
  shareMode: string;
  user: { id: string; name: string | null; image: string | null };
  _count: { cards: number };
}

interface ShareTarget {
  id: string;
  target: { id: string; name: string | null; email: string; image: string | null };
  createdAt: string;
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

// ─── Right Panel: Flashcard Deck List ─────────────────────────────────────────

function FlashcardListPanel({
  decks,
  loading,
  selectedSkill,
  status,
  lang,
  locale,
}: {
  decks: Deck[];
  loading: boolean;
  selectedSkill: string;
  status: string;
  lang: string;
  locale: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = decks.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="sticky top-4 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #8B5CF6))' }}>
        <div className="flex items-center gap-2 mb-2">
          <FaLayerGroup size={13} className="text-white/80" />
          <span className="text-[13px] font-bold text-white">Bộ thẻ của bạn</span>
        </div>
        {selectedSkill === 'srs' && status === 'authenticated' && (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bộ thẻ..."
              className="w-full text-xs py-1.5 pl-3 pr-8 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin p-3 space-y-2">
        {selectedSkill !== 'srs' ? (
          <div className="text-center py-6">
            <FaBookOpen size={20} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Chọn &quot;SRS&quot; để xem bộ thẻ</p>
          </div>
        ) : status !== 'authenticated' ? (
          <div className="text-center py-6">
            <FaLock size={16} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Đăng nhập để xem bộ thẻ</p>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-muted)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Không tìm thấy bộ thẻ' : 'Chưa có bộ thẻ nào'}
            </p>
          </div>
        ) : (
          filtered.map(deck => (
            <Link
              key={deck.id}
              href={`/${locale}/${lang}/practice/${deck.id}`}
              className="flex items-center gap-2.5 p-2.5 rounded-xl transition-colors hover:scale-[1.01]"
              style={{ background: 'var(--bg-muted)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: deck.color + '18', color: deck.color }}>
                <FaLayerGroup size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{deck.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{deck._count.cards} thẻ</span>
                  {deck.dueCount > 0 && (
                    <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: '#D97706' }}>
                      <FaBolt size={8} /> {deck.dueCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Share Dialog ─────────────────────────────────────────────────────────────

function ShareDialog({
  deck,
  onClose,
  onUpdate,
}: {
  deck: Deck;
  onClose: () => void;
  onUpdate: (d: Deck) => void;
}) {
  const [mode, setMode] = useState<'private' | 'public' | 'specific'>(deck.shareMode);
  const [shares, setShares] = useState<ShareTarget[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Load current shares
  useEffect(() => {
    fetch(`/api/flashcards/${deck.id}/share`).then(r => r.json()).then(data => {
      setShares(data.shares ?? []);
      setMode(data.shareMode ?? 'private');
    });
  }, [deck.id]);

  async function saveMode(newMode: 'private' | 'public' | 'specific') {
    setLoading(true); setError('');
    const res = await fetch(`/api/flashcards/${deck.id}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareMode: newMode }),
    });
    if (res.ok) {
      setMode(newMode);
      if (newMode === 'private') setShares([]);
      onUpdate({ ...deck, shareMode: newMode });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  async function addShare() {
    if (!email.trim()) return;
    setLoading(true); setError('');
    const res = await fetch(`/api/flashcards/${deck.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: email.split(',').map(e => e.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      const data = await res.json();
      setShares(data.shares ?? []);
      setMode(data.shareMode ?? mode);
      onUpdate({ ...deck, shareMode: data.shareMode ?? mode });
      setEmail(''); setSaved(true); setTimeout(() => setSaved(false), 2000);
    } else {
      const d = await res.json();
      setError(d.message || 'Không tìm thấy user');
    }
    setLoading(false);
  }

  async function removeShare(shareId: string) {
    await fetch(`/api/flashcards/${deck.id}/share`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareIds: [shareId] }),
    });
    setShares(s => s.filter(x => x.id !== shareId));
  }

  const MODES = [
    { key: 'private' as const, icon: <FaLock size={13} />, label: 'Riêng tư', desc: 'Chỉ bạn xem được' },
    { key: 'public' as const, icon: <FaGlobe size={13} />, label: 'Công khai', desc: 'Tất cả user đều thấy' },
    { key: 'specific' as const, icon: <FaUserGroup size={13} />, label: 'Chỉ định', desc: 'Chia sẻ cho user cụ thể' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaShareNodes size={16} style={{ color: 'var(--primary)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Chia sẻ: {deck.title}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-4">
          {MODES.map(m => (
            <button key={m.key} onClick={() => saveMode(m.key)} disabled={loading}
              className="flex-1 p-3 rounded-xl text-left transition-all"
              style={{
                background: mode === m.key ? 'var(--primary-light)' : 'var(--bg-muted)',
                border: mode === m.key ? '2px solid var(--primary)' : '2px solid transparent',
              }}>
              <div className="flex items-center gap-2 mb-1"
                style={{ color: mode === m.key ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {m.icon}
                <span className="text-xs font-bold">{m.label}</span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Add user (for specific mode) */}
        {(mode === 'specific' || mode === 'public') && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Thêm user bằng email
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaEnvelope size={11} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
                  <input className="input w-full pl-8" type="email"
                    placeholder="user@email.com (phân cách bằng dấu phẩy)"
                    value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addShare())} />
                </div>
                <button onClick={addShare} disabled={loading || !email.trim()}
                  className="btn-primary px-4 text-xs flex items-center gap-1.5">
                  <FaPlus size={10} /> Thêm
                </button>
              </div>
              {error && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{error}</p>}
              {saved && <p className="text-xs mt-1.5" style={{ color: '#16a34a' }}>✓ Đã lưu</p>}
            </div>

            {/* Shared users list */}
            {shares.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: 1 }}>
                  Đang chia sẻ với ({shares.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {shares.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg"
                      style={{ background: 'var(--bg-muted)' }}>
                      <div className="flex items-center gap-2.5">
                        {s.target.image ? (
                          <img src={s.target.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {(s.target.name ?? s.target.email)?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {s.target.name || s.target.email}
                          </div>
                          {s.target.name && (
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.target.email}</div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeShare(s.id)}
                        className="p-1.5 rounded-md transition-colors hover:bg-red-50"
                        style={{ color: '#ef4444' }}>
                        <FaXmark size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Unified component ────────────────────────────────────────────────────────

function FlashcardsContent() {
  const { data: session, status } = useSession();
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const locale = (routeParams?.locale as string) ?? 'vi';
  const langCfg = useMemo(
    () => PRACTICE_LANG_CONFIG[lang] ?? PRACTICE_LANG_CONFIG.ja,
    [lang],
  );

  // Sidebar đồng nhất: levels, skills, selectedLevel, selectedSkill
  const JA_DESCS: Record<string, string> = { N5: 'Sơ cấp', N4: 'Sơ trung cấp', N3: 'Trung cấp', N2: 'Trung cao cấp', N1: 'Cao cấp' };
  const ZH_DESCS: Record<string, string> = { HSK1: 'Nhập môn', HSK2: 'Sơ cấp', HSK3: 'Trung cấp', HSK4: 'Trên trung cấp', HSK5: 'Cao cấp', HSK6: 'Thành thạo' };
  const descMap = lang === 'zh' ? ZH_DESCS : JA_DESCS;
  const levels = langCfg.levels.map(lvl => ({
    code: lvl,
    label: lvl,
    desc: descMap[lvl] ?? '',
    percent: undefined,
    status: undefined,
  }));
  const skills = [
    { key: 'srs', label: 'Lặp lại ngắt quãng (SRS)', icon: <FaLayerGroup size={14} /> },
    { key: 'quick', label: 'Luyện ghi nhớ thường', icon: <FaBookOpen size={14} /> },
  ];
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const lvl = searchParams.get('level');
    return lvl && levels.some(l => l.code === lvl) ? lvl : (levels[0]?.code || '');
  });
  // Sync level when ?level= param changes (e.g. navbar dropdown click on same page)
  useEffect(() => {
    const lvl = searchParams.get('level');
    if (lvl && levels.some(l => l.code === lvl)) setSelectedLevel(lvl);
  }, [searchParams, levels]);
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
  const [sharingDeck, setSharingDeck] = useState<Deck | null>(null);
  const [sharedDecks, setSharedDecks] = useState<SharedDeck[]>([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [showShared, setShowShared] = useState(false);

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

  const loadSharedDecks = useCallback(async () => {
    setSharedLoading(true);
    const res = await fetch('/api/flashcards/shared');
    if (res.ok) setSharedDecks(await res.json());
    setSharedLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      loadDecks();
      loadSharedDecks();
    }
  }, [status, loadDecks, loadSharedDecks]);

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
        bottomBarProps={{
          levels,
          selectedLevel,
          setSelectedLevel,
          skills,
          selectedSkill,
          setSelectedSkill,
        }}
        rightPanel={
          <FlashcardListPanel
            decks={decks}
            loading={loading}
            selectedSkill={selectedSkill}
            status={status}
            lang={lang}
            locale={locale}
          />
        }
      >
        {/* Hero section (matching reading/listening pages) */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                <FaLayerGroup size={20} style={{ color: '#fff' }} />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: '#FBBF24', color: '#78350F' }}>
                  <FaBolt size={8} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Luyện tập Flashcard</h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Học từ vựng hiệu quả với SRS & luyện ghi nhớ thường
                </p>
              </div>
            </div>
            {selectedSkill === 'srs' && status === 'authenticated' && (
              <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md">
                <FaPlus size={12} /> Tạo bộ thẻ
              </button>
            )}
          </div>
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
            <div className="card text-center py-12 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--primary-light)' }}>
                <FaLock size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-base)' }}>
                Đăng nhập để dùng SRS
              </h2>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                Tạo và quản lý bộ thẻ cá nhân, theo dõi tiến độ học tập theo phương pháp Spaced Repetition.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 text-sm">
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              {decks.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {[
                    { label: 'Bộ thẻ',   value: decks.length, icon: <FaLayerGroup  size={12} />, color: 'var(--primary)' },
                    { label: 'Tổng thẻ', value: totalCards,   icon: <FaCircleCheck size={12} />, color: '#059669' },
                    { label: 'Cần ôn',   value: totalDue,     icon: <FaBolt        size={12} />, color: '#D97706' },
                  ].map(s => (
                    <div key={s.label} className="card flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2.5 sm:p-3 text-center sm:text-left">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: s.color + '15', color: s.color }}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-base font-bold leading-none" style={{ color: 'var(--text-base)' }}>{s.value}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
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
                <div className="text-center py-14 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 12%, var(--bg-surface)))' }}>
                    <FaLayerGroup size={24} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h2 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Chưa có bộ thẻ nào</h2>
                  <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Tạo bộ thẻ đầu tiên để bắt đầu học hiệu quả với SRS.</p>
                  <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-150">
                    <FaPlus size={12} /> Tạo bộ thẻ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {decks.map(deck => (
                    <div key={deck.id} className="group relative rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ border: '1.5px solid var(--border)', background: 'var(--bg-surface)', boxShadow: `inset 0 3px 0 0 ${deck.color}` }}>
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSharingDeck(deck)} title="Chia sẻ"
                          className="p-1.5 rounded-lg"
                          style={{ background: 'var(--bg-muted)', color: 'var(--primary)' }}>
                          <FaShareNodes size={10} />
                        </button>
                        <button onClick={() => deleteDeck(deck.id)} disabled={deleting === deck.id}
                          className="p-1.5 rounded-lg"
                          style={{ background: 'var(--bg-muted)', color: '#EF4444' }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                      <Link href={`/${locale}/${lang}/practice/${deck.id}`} className="block p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: deck.color + '18', color: deck.color }}>
                            <FaLayerGroup size={14} />
                          </div>
                          <div className="min-w-0 flex-1 pr-12">
                            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {deck.title}
                              {deck.shareMode === 'public' && (
                                <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                                  style={{ background: 'rgba(34,197,94,.12)', color: '#16a34a' }}>
                                  <FaGlobe size={7} /> Public
                                </span>
                              )}
                              {deck.shareMode === 'specific' && (
                                <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                                  style={{ background: 'rgba(59,130,246,.12)', color: '#2563eb' }}>
                                  <FaUsers size={7} /> Shared
                                </span>
                              )}
                            </h3>
                            {deck.description && (
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{deck.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-xs">
                            <span style={{ color: 'var(--text-muted)' }}>
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deck._count.cards}</span> thẻ
                            </span>
                            {deck.dueCount > 0 && (
                              <span className="flex items-center gap-1 font-semibold" style={{ color: '#D97706' }}>
                                <FaBolt size={10} /> {deck.dueCount} cần ôn
                              </span>
                            )}
                            {deck.dueCount === 0 && deck._count.cards > 0 && (
                              <span className="flex items-center gap-1 font-semibold" style={{ color: '#059669' }}>
                                <FaCircleCheck size={10} /> Đã ôn xong
                              </span>
                            )}
                          </div>
                          {deck._count.cards > 0 && (
                            <button onClick={e => { e.stopPropagation(); e.preventDefault(); window.location.href = `/${locale}/${lang}/practice/${deck.id}/study`; }}
                              className="text-[11px] px-3 py-1.5 flex items-center gap-1.5 rounded-lg font-semibold transition-all hover:scale-105"
                              style={{ background: deck.color, color: '#fff' }}>
                              <FaBolt size={9} /> Ôn tập
                            </button>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-xl mt-6 p-3" style={{ background: 'var(--primary-light)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
                <div className="flex items-start gap-2.5">
                  <FaClockRotateLeft size={12} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--primary)' }}>
                      Phương pháp Spaced Repetition
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--primary)' }}>
                      Hệ thống tự nhắc ôn đúng lúc sắp quên — thẻ khó xuất hiện thường hơn, thẻ dễ thưa hơn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shared decks section */}
              <div className="mt-8">
                <button onClick={() => setShowShared(!showShared)}
                  className="flex items-center gap-2 mb-4 text-sm font-bold transition-colors"
                  style={{ color: 'var(--text-primary)' }}>
                  <FaUsers size={14} style={{ color: 'var(--primary)' }} />
                  Bộ thẻ được chia sẻ
                  {sharedDecks.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {sharedDecks.length}
                    </span>
                  )}
                  <FaChevronDown size={10} className={`transition-transform ${showShared ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }} />
                </button>
                {showShared && (
                  sharedLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    </div>
                  ) : sharedDecks.length === 0 ? (
                    <div className="text-center py-8 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px dashed var(--border)' }}>
                      <FaGlobe size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có bộ thẻ nào được chia sẻ với bạn</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sharedDecks.map(deck => (
                        <div key={deck.id} className="relative rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
                          style={{ border: '1.5px solid var(--border)', background: 'var(--bg-surface)', boxShadow: `inset 0 3px 0 0 ${deck.color}` }}>
                          <Link href={`/${locale}/${lang}/practice/${deck.id}`} className="block p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: deck.color + '18', color: deck.color }}>
                                <FaLayerGroup size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                  {deck.title}
                                  {deck.shareMode === 'public' ? (
                                    <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                                      style={{ background: 'rgba(34,197,94,.12)', color: '#16a34a' }}>
                                      <FaGlobe size={7} /> Public
                                    </span>
                                  ) : (
                                    <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                                      style={{ background: 'rgba(59,130,246,.12)', color: '#2563eb' }}>
                                      <FaUsers size={7} /> Shared
                                    </span>
                                  )}
                                </h3>
                                {deck.description && (
                                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{deck.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                  {deck.user.image ? (
                                    <img src={deck.user.image} alt="" className="w-4 h-4 rounded-full" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                      {deck.user.name?.[0] || '?'}
                                    </div>
                                  )}
                                  <span className="truncate max-w-[80px]" style={{ color: 'var(--text-muted)' }}>{deck.user.name || 'User'}</span>
                                </div>
                                <span style={{ color: 'var(--text-muted)' }}>
                                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deck._count.cards}</span> thẻ
                                </span>
                              </div>
                              {deck._count.cards > 0 && (
                                <button onClick={e => { e.stopPropagation(); e.preventDefault(); window.location.href = `/${locale}/${lang}/practice/${deck.id}/study`; }}
                                  className="text-[11px] px-3 py-1.5 flex items-center gap-1.5 rounded-lg font-semibold transition-all hover:scale-105"
                                  style={{ background: deck.color, color: '#fff' }}>
                                  <FaBolt size={9} /> Học
                                </button>
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* ShareDialog */}
              {sharingDeck && (
                <ShareDialog
                  deck={sharingDeck}
                  onClose={() => setSharingDeck(null)}
                  onUpdate={() => { loadDecks(); loadSharedDecks(); }}
                />
              )}
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

