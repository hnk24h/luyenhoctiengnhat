'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowLeft, FaRotate, FaBolt, FaCheck,
  FaXmark, FaFaceGrinBeam, FaFaceMeh, FaFaceFrown, FaFaceGrin,
  FaTrophy, FaLayerGroup, FaShuffle, FaSliders, FaPlay,
  FaClockRotateLeft, FaInfinity,
} from 'react-icons/fa6';

interface Card {
  id: string; front: string; back: string;
  reading: string | null; example: string | null;
  imageUrl: string | null;
  progress: {
    interval: number; repetitions: number;
    easeFactor: number; dueAt: string;
  } | null;
}
interface Deck {
  id: string; title: string; color: string;
  cards: Card[];
}

function isDue(card: Card): boolean {
  if (!card.progress) return true;
  return new Date(card.progress.dueAt) <= new Date();
}

type Rating = 0 | 1 | 2 | 3;

const STUDY_SETUP_STORAGE_KEY = 'flashcard-study-setup';

const RATING_CONFIG: {
  rating: Rating;
  label: string;
  hint: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
}[] = [
  { rating: 0, label: 'Lại',    hint: '< 1 ngày',  icon: <FaFaceFrown size={16} />,   bg: '#FEE2E2', color: '#DC2626' },
  { rating: 1, label: 'Khó',    hint: '+ 1 ngày',   icon: <FaFaceMeh size={16} />,     bg: '#FEF3C7', color: '#D97706' },
  { rating: 2, label: 'Tốt',    hint: 'bình thường',icon: <FaFaceGrin size={16} />,    bg: '#DCFCE7', color: '#16A34A' },
  { rating: 3, label: 'Dễ',     hint: 'lâu hơn',    icon: <FaFaceGrinBeam size={16} />,bg: '#EFF6FF', color: '#2563EB' },
];

export default function StudyPage({ params }: { params: { deckId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deck,       setDeck]       = useState<Deck | null>(null);
  const [allDue,     setAllDue]     = useState<Card[]>([]);   // due cards pool
  const [allCards,   setAllCards]   = useState<Card[]>([]);   // entire deck pool
  const [queue,      setQueue]      = useState<Card[]>([]);
  const [idx,        setIdx]        = useState(0);
  const [flipped,    setFlipped]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Setup screen state ────────────────────────────────────────────────────
  const [showSetup,    setShowSetup]    = useState(true);
  const [shuffle,      setShuffle]      = useState(true);
  const [cardSource,   setCardSource]   = useState<'due' | 'all'>('due');
  const [limitPreset,  setLimitPreset]  = useState<10 | 20 | 50 | 0>(10); // 0 = custom / all
  const [customCount,  setCustomCount]  = useState('');
  const [useCustom,    setUseCustom]    = useState(false);
  const [savedSetupLoaded, setSavedSetupLoaded] = useState(false);

  // Session stats
  const [sessionDone,  setSessionDone]  = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);
  const [finished,     setFinished]     = useState(false);

  const loadDeck = useCallback(async () => {
    const res = await fetch(`/api/flashcards/${params.deckId}`);
    if (res.ok) {
      const data: Deck = await res.json();
      setDeck(data);
      const due = data.cards.filter(isDue);
      setAllDue(due);
      setAllCards(data.cards);
    }
    setLoading(false);
  }, [params.deckId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') loadDeck();
  }, [status, loadDeck, router]);

  useEffect(() => {
    if (savedSetupLoaded || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STUDY_SETUP_STORAGE_KEY);
      if (!raw) {
        setSavedSetupLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as {
        shuffle?: boolean;
        cardSource?: 'due' | 'all';
        limitPreset?: 10 | 20 | 50 | 0;
        customCount?: string;
        useCustom?: boolean;
      };

      if (typeof parsed.shuffle === 'boolean') setShuffle(parsed.shuffle);
      if (parsed.cardSource === 'due' || parsed.cardSource === 'all') setCardSource(parsed.cardSource);
      if (parsed.limitPreset === 10 || parsed.limitPreset === 20 || parsed.limitPreset === 50 || parsed.limitPreset === 0) {
        setLimitPreset(parsed.limitPreset);
      }
      if (typeof parsed.customCount === 'string') setCustomCount(parsed.customCount);
      if (typeof parsed.useCustom === 'boolean') setUseCustom(parsed.useCustom);
    } catch {
      // Ignore invalid localStorage payloads.
    }

    setSavedSetupLoaded(true);
  }, [savedSetupLoaded]);

  // ── Build queue and start ─────────────────────────────────────────────────
  function startSession() {
    const pool = cardSource === 'due' ? allDue : allCards;
    const ordered = shuffle ? [...pool].sort(() => Math.random() - 0.5) : [...pool];

    const n = useCustom
      ? Math.max(1, parseInt(customCount) || pool.length)
      : limitPreset === 0 ? pool.length : limitPreset;

    const finalQueue = ordered.slice(0, Math.min(n, ordered.length));

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STUDY_SETUP_STORAGE_KEY, JSON.stringify({
        shuffle,
        cardSource,
        limitPreset,
        customCount,
        useCustom,
      }));
    }

    setQueue(finalQueue);
    setIdx(0);
    setFlipped(false);
    setSessionDone(0);
    setSessionAgain(0);
    setFinished(finalQueue.length === 0);
    setShowSetup(false);
  }

  const currentCard = queue[idx] ?? null;
  const progress = idx / (queue.length || 1);

  async function rate(rating: Rating) {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    await fetch(`/api/flashcards/cards/${currentCard.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    if (rating === 0) {
      // "Again" – put card back at end of queue
      setQueue(q => [...q.slice(0, idx + 1), ...q.slice(idx + 1), currentCard]);
      setSessionAgain(n => n + 1);
    }

    setSessionDone(n => n + 1);
    const nextIdx = idx + 1;
    if (nextIdx >= queue.length || (rating === 0 && nextIdx >= queue.length)) {
      // Check if any "again" cards remain
      if (rating !== 0 && nextIdx >= queue.length) {
        setFinished(true);
      } else if (rating === 0) {
        setIdx(nextIdx);
        setFlipped(false);
      } else {
        setFinished(true);
      }
    } else {
      setIdx(nextIdx);
      setFlipped(false);
    }

    setSubmitting(false);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped(f => !f);
      }
      if (flipped && !submitting) {
        if (e.key === '1') rate(0);
        if (e.key === '2') rate(1);
        if (e.key === '3') rate(2);
        if (e.key === '4') rate(3);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, submitting, currentCard, idx, queue]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!deck) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Không tìm thấy bộ thẻ.</div>;
  // ── Setup screen ───────────────────────────────────────────────────────────
  if (showSetup) {
    const pool = cardSource === 'due' ? allDue : allCards;
    const effectiveLimit = useCustom
      ? Math.min(Math.max(1, parseInt(customCount) || 0), pool.length)
      : limitPreset === 0 ? pool.length : Math.min(limitPreset, pool.length);
    const PRESETS: { label: string; value: 10 | 20 | 50 | 0; icon?: React.ReactNode }[] = [
      { label: '10',  value: 10 },
      { label: '20',  value: 20 },
      { label: '50',  value: 50 },
      { label: 'Tất cả', value: 0, icon: <FaInfinity size={11} /> },
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="card w-full max-w-md">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/flashcards/${deck.id}`} className="btn-ghost p-1.5" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={14} />
            </Link>
            <div className="flex-1">
              <h1 className="font-bold text-lg" style={{ color: 'var(--text-base)' }}>{deck.title}</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {allDue.length} thẻ cần ôn · {allCards.length} thẻ tổng cộng
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: deck.color + '20', color: deck.color }}>
              <FaSliders size={15} />
            </div>
          </div>

          {/* Card source */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
              Nguồn thẻ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([['due', <FaClockRotateLeft key="d" size={13} />, 'Thẻ cần ôn', `${allDue.length} thẻ`],
                 ['all', <FaLayerGroup key="a" size={13} />, 'Tất cả thẻ', `${allCards.length} thẻ`]] as const).map(([val, icon, lbl, cnt]) => (
                <button key={val} onClick={() => setCardSource(val)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: cardSource === val ? deck.color : 'var(--border)',
                    background:  cardSource === val ? deck.color + '10' : 'transparent',
                    color: 'var(--text-base)',
                  }}>
                  <span style={{ color: cardSource === val ? deck.color : 'var(--text-muted)' }}>{icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{lbl}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{cnt}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Count presets */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
              Số thẻ mỗi buổi
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESETS.map(p => (
                <button key={p.value}
                  onClick={() => { setLimitPreset(p.value); setUseCustom(false); }}
                  className="py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: !useCustom && limitPreset === p.value ? deck.color : 'var(--primary-light)',
                    color:      !useCustom && limitPreset === p.value ? '#fff' : 'var(--primary)',
                  }}>
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
            {/* Custom row */}
            <div className="flex items-center gap-2">
              <button onClick={() => setUseCustom(true)}
                className="py-2 px-3 rounded-xl text-sm font-semibold transition-all flex-1 text-left"
                style={{
                  background: useCustom ? deck.color : 'var(--primary-light)',
                  color:      useCustom ? '#fff' : 'var(--primary)',
                }}>
                Tự nhập số...
              </button>
              {useCustom && (
                <input
                  type="number" min={1} max={pool.length}
                  className="input w-24 text-center"
                  placeholder={`1–${pool.length}`}
                  value={customCount}
                  onChange={e => setCustomCount(e.target.value)}
                  autoFocus
                />
              )}
            </div>
            {pool.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Sẽ ôn <strong style={{ color: deck.color }}>{effectiveLimit || '?'}</strong> / {pool.length} thẻ
              </p>
            )}
            {useCustom && customCount && Number(customCount) > pool.length ? (
              <p className="text-xs mt-1" style={{ color: '#B45309' }}>
                Số bạn nhập lớn hơn lượng thẻ hiện có, hệ thống sẽ tự lấy tối đa {pool.length} thẻ.
              </p>
            ) : null}
          </div>

          {/* Shuffle toggle */}
          <div className="mb-6">
            <button onClick={() => setShuffle(s => !s)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all"
              style={{
                borderColor: shuffle ? deck.color : 'var(--border)',
                background:  shuffle ? deck.color + '10' : 'transparent',
              }}>
              <div className="flex items-center gap-3">
                <FaShuffle size={14} style={{ color: shuffle ? deck.color : 'var(--text-muted)' }} />
                <div className="text-left">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Trộn thẻ ngẫu nhiên</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Xáo trộn thứ tự các thẻ</div>
                </div>
              </div>
              {/* Toggle pill */}
              <div className="w-10 h-5 rounded-full relative shrink-0 transition-colors"
                style={{ background: shuffle ? deck.color : 'var(--border)' }}>
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                  style={{ left: shuffle ? 'calc(100% - 18px)' : '2px' }} />
              </div>
            </button>
          </div>

          {/* Start button */}
          {pool.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-sm mb-4 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                {cardSource === 'due' ? <><FaCheck size={12} style={{ color: '#16A34A' }}/> Không có thẻ nào cần ôn hôm nay</> : 'Bộ thẻ chưa có thẻ nào'}
              </p>
              <Link href={`/flashcards/${deck.id}`} className="btn-secondary inline-flex items-center gap-2">
                <FaArrowLeft size={12} /> Quay lại
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={startSession}
                disabled={useCustom && (!customCount || parseInt(customCount) < 1)}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base font-bold disabled:opacity-50"
                style={{ background: deck.color }}>
                <FaPlay size={14} /> Bắt đầu ôn tập
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Cấu hình buổi ôn sẽ được nhớ cho lần tiếp theo trên thiết bị này.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  // ── Finished screen ────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="card text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: deck.color + '20', color: deck.color }}>
            <FaTrophy size={28} />
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-base)' }}>Xong rồi! 🎉</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Bạn đã ôn xong <strong>{queue.length}</strong> thẻ hôm nay
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-3" style={{ background: '#DCFCE7' }}>
              <div className="text-2xl font-bold" style={{ color: '#16A34A' }}>{sessionDone - sessionAgain}</div>
              <div className="text-xs" style={{ color: '#15803D' }}>Ghi nhớ</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#FEE2E2' }}>
              <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>{sessionAgain}</div>
              <div className="text-xs" style={{ color: '#DC2626' }}>Cần ôn lại</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/flashcards/${deck.id}`} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
              <FaLayerGroup size={12} /> Bộ thẻ
            </Link>
            <button onClick={() => { setFinished(false); setShowSetup(true); }}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5"
              style={{ background: deck.color }}>
              <FaSliders size={12} /> Ôn lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Study screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href={`/flashcards/${deck.id}`} className="btn-ghost p-1.5" style={{ color: 'var(--text-muted)' }}>
          <FaArrowLeft size={14} />
        </Link>
        <div className="flex-1">
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-base)' }}>{deck.title}</div>
          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%`, background: deck.color }} />
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
              {idx + 1} / {queue.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <FaBolt size={11} style={{ color: '#D97706' }} />
          {queue.length - idx} còn lại
        </div>
        <button onClick={() => setShowSetup(true)} className="btn-ghost p-1.5" title="Cài đặt phiên ôn"
          style={{ color: 'var(--text-muted)' }}>
          <FaSliders size={14} />
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Flashcard */}
        <div
          className="w-full max-w-xl cursor-pointer select-none"
          onClick={() => setFlipped(f => !f)}
          style={{ perspective: '1200px' }}
        >
          {/*
            Use CSS Grid single-cell stacking (gridArea 1/1) so both faces share
            the same slot — the taller face determines the container height,
            while the 3-D flip animation still works perfectly.
          */}
          <div style={{
            display: 'grid',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* Front face */}
            <div className="card flex flex-col items-center justify-center p-6 sm:p-8"
              style={{
                gridArea: '1 / 1',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderTop: `4px solid ${deck.color}`,
                minHeight: 240,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}>
              <div className="text-xs font-semibold mb-4 px-3 py-1 rounded-full shrink-0"
                style={{ background: deck.color + '15', color: deck.color }}>
                Mặt trước
              </div>
              {currentCard?.imageUrl && (
                <div className="mb-4 shrink-0">
                  <Image src={currentCard.imageUrl} alt={currentCard.front}
                    width={160} height={120}
                    className="rounded-xl object-cover mx-auto"
                    style={{ maxWidth: 160, maxHeight: 120 }} />
                </div>
              )}
              <div className="text-center font-bold w-full"
                style={{
                  color: 'var(--text-base)',
                  fontFamily: '"Noto Sans JP", serif',
                  lineHeight: 1.4,
                  fontSize: 'clamp(1.25rem, 5vw, 2.25rem)',
                }}>
                {currentCard?.front}
              </div>
              {currentCard?.reading && (
                <div className="mt-3 text-base sm:text-lg text-center w-full"
                  style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif', wordBreak: 'break-word' }}>
                  {currentCard.reading}
                </div>
              )}
              <div className="mt-6 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                Nhấn <kbd className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>Space</kbd> hoặc click để lật thẻ
              </div>
            </div>

            {/* Back face */}
            <div className="card flex flex-col items-center justify-center p-6 sm:p-8"
              style={{
                gridArea: '1 / 1',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderTop: `4px solid ${deck.color}`,
                minHeight: 240,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}>
              <div className="text-xs font-semibold mb-4 px-3 py-1 rounded-full shrink-0"
                style={{ background: '#DCFCE7', color: '#16A34A' }}>
                Mặt sau
              </div>
              <div className="text-center font-bold mb-2 w-full"
                style={{
                  color: 'var(--text-base)',
                  fontSize: 'clamp(1.1rem, 4.5vw, 1.875rem)',
                  lineHeight: 1.4,
                }}>
                {currentCard?.back}
              </div>
              {currentCard?.reading && (
                <div className="text-sm sm:text-base text-center w-full mt-1"
                  style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif', wordBreak: 'break-word' }}>
                  {currentCard.reading}
                </div>
              )}
              {currentCard?.example && (
                <div className="mt-4 p-3 rounded-lg text-sm text-center w-full"
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontFamily: '"Noto Sans JP", serif',
                    lineHeight: 1.7,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                  }}>
                  {currentCard.example}
                </div>
              )}
              {currentCard?.progress && (
                <div className="mt-4 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  Đã ôn {currentCard.progress.repetitions} lần · Khoảng cách: {currentCard.progress.interval} ngày
                </div>
              )}
              <div className="mt-5 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                Nhấn <kbd className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>Space</kbd> để lật lại mặt trước
              </div>
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        {flipped ? (
          <div className="mt-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bạn nhớ từ này như thế nào?</p>
              <button onClick={() => setFlipped(false)}
                className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)', background: 'var(--primary-light)' }}>
                <FaRotate size={10} /> Lật lại
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RATING_CONFIG.map(({ rating, label, hint, icon, bg, color }) => (
                <button
                  key={rating}
                  onClick={() => rate(rating)}
                  disabled={submitting}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: bg, color }}>
                  {icon}
                  <span className="text-sm font-bold">{label}</span>
                  <span className="text-xs opacity-70">{hint}</span>
                  <span className="text-xs opacity-50 font-mono">[{rating + 1}]</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="mt-6 btn-primary flex items-center gap-2 px-8 py-3 text-base"
            style={{ background: deck.color }}>
            <FaRotate size={14} /> Lật thẻ
          </button>
        )}
      </div>
    </div>
  );
}
