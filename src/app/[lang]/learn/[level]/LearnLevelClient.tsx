'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FaCircleCheck, FaBookOpen, FaRuler, FaPlay,
  FaBars, FaVolumeHigh, FaStop, FaLock,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa6';

// ── Shared Types ──────────────────────────────────────────────────────────────

export interface LessonMeta {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  itemCount: number;
  isCompleted: boolean;
  requiredTier?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  skill: string;
  icon: string | null;
  lessons: LessonMeta[];
}

interface LessonItem {
  id: string;
  type: string;
  language: string;
  term: string;
  pronunciation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
  meanings: { id: string; language: string; meaning: string }[];
  examples: {
    id: string;
    exampleText: string;
    translation: string | null;
    language: string;
    translationLanguage: string | null;
  }[];
}

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  items: LessonItem[];
  isCompleted: boolean;
}

// ── Item type palette ─────────────────────────────────────────────────────────

const ITEM_PALETTE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  vocab:     { label: '単語',   color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  character: { label: '文字',   color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  grammar:   { label: '文法',   color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  example:   { label: '例文',   color: '#065F46', bg: '#F0FDF4', border: '#A7F3D0' },
  phrase:    { label: '表現',   color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  tone:      { label: '声調',   color: '#0891B2', bg: '#F0FDFA', border: '#99F6E4' },
  idiom:     { label: '慣用句', color: '#7C3AED', bg: '#FAF5FF', border: '#E9D5FF' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  vocabCats: CategoryData[];
  grammarCats: CategoryData[];
  defaultTab: 'vocab' | 'grammar';
  accentColor: string;
  accentRgb: string;
  lang: string;
  levelCode: string;
  userId?: string;
}

// ── Root component ────────────────────────────────────────────────────────────

export default function LearnLevelClient({
  vocabCats, grammarCats, defaultTab, accentColor, accentRgb, lang, userId,
}: Props) {
  const [activeTab, setActiveTab]         = useState<'vocab' | 'grammar'>(defaultTab);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [lessonData, setLessonData]       = useState<LessonDetail | null>(null);
  const [loading, setLoading]             = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [speaking, setSpeaking]           = useState<string | null>(null);
  const [flipped, setFlipped]             = useState<Record<string, boolean>>({});
  const [localDone, setLocalDone]         = useState<Set<string>>(new Set());

  const activeCats = activeTab === 'vocab' ? vocabCats : grammarCats;
  const allLessons = activeCats.flatMap(c => c.lessons);

  // Get user subscription tier (default free)
  const userTier = (typeof window !== 'undefined' && (window as any).__USER_TIER) || (sessionStorage.getItem('userTier') || 'free');
  // Helper: compare tier
  function tierRank(tier: string) {
    return tier === 'free' ? 0 : tier === 'basic' ? 1 : 2;
  }

  const isLessonCompleted = useCallback(
    (id: string) => localDone.has(id) || !!allLessons.find(l => l.id === id)?.isCompleted,
    [localDone, allLessons],
  );

  // Auto-select first incomplete (or first) lesson when tab changes
  useEffect(() => {
    const lessons = (activeTab === 'vocab' ? vocabCats : grammarCats).flatMap(c => c.lessons);
    if (lessons.length === 0) { setSelectedId(null); setLessonData(null); return; }
    const first = lessons.find(l => !l.isCompleted && !localDone.has(l.id)) ?? lessons[0];
    setSelectedId(first.id);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch lesson detail when selection changes
  useEffect(() => {
    if (!selectedId) return;
    const ctrl = new AbortController();
    setLoading(true);
    setFlipped({});
    fetch(`/api/learn/lesson/${selectedId}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLessonData(data); setLoading(false); })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [selectedId]);

  const speak = useCallback((text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking === id) { setSpeaking(null); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ja' ? 'ja-JP' : 'zh-CN';
    utter.rate = 0.85;
    const voice = window.speechSynthesis.getVoices()
      .find(v => v.lang.startsWith(lang === 'ja' ? 'ja' : 'zh'));
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(id);
    utter.onend   = () => setSpeaking(null);
    utter.onerror = () => setSpeaking(null);
    window.speechSynthesis.speak(utter);
  }, [speaking, lang]);

  async function markComplete() {
    if (!userId) { window.location.href = '/auth/login'; return; }
    const res = await fetch('/api/learn/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: selectedId, completed: true }),
    });
    if (res.ok && selectedId) {
      setLessonData(prev => prev ? { ...prev, isCompleted: true } : prev);
      setLocalDone(prev => new Set([...prev, selectedId]));
      // Auto-advance to next incomplete lesson after short delay
      const idx = allLessons.findIndex(l => l.id === selectedId);
      if (idx < allLessons.length - 1) {
        setTimeout(() => setSelectedId(allLessons[idx + 1].id), 500);
      }
    }
  }

  function selectLesson(id: string) {
    setSelectedId(id);
    setSidebarOpen(false);
  }

  const currentIdx = allLessons.findIndex(l => l.id === selectedId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // ── Sidebar content (shared between mobile+desktop) ──────────────────────
  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Tab switcher */}
        <div
          className="sticky top-0 z-10 p-3 pb-2"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-muted)' }}>
            {(['vocab', 'grammar'] as const).map(tab => {
              const count = (tab === 'vocab' ? vocabCats : grammarCats)
                .reduce((s, c) => s + c.lessons.length, 0);
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl transition-all"
                  style={active
                    ? { background: accentColor, color: '#fff', boxShadow: `0 3px 10px rgba(${accentRgb},.35)` }
                    : { color: 'var(--text-muted)' }}
                >
                  {tab === 'vocab' ? <FaBookOpen size={10} /> : <FaRuler size={10} />}
                  {tab === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category + lesson list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {activeCats.length === 0 && (
            <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>
              Chưa có nội dung
            </p>
          )}
          {activeCats.map(cat => {
            const catCompleted = cat.lessons.filter(l => isLessonCompleted(l.id)).length;
            const catPct = cat.lessons.length > 0
              ? Math.round((catCompleted / cat.lessons.length) * 100) : 0;

            return (
              <div key={cat.id}>

                {/* Category header */}
                <div className="flex items-center justify-between px-1.5 py-1 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: 'var(--text-muted)' }}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums"
                    style={{ color: catPct === 100 ? '#059669' : accentColor }}>
                    {catCompleted}/{cat.lessons.length}
                  </span>
                </div>

                {/* Gradient progress bar */}
                {userId && cat.lessons.length > 0 && (
                  <div className="h-1 mx-1.5 mb-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-muted)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${catPct}%`,
                        background: catPct === 100
                          ? '#10B981'
                          : `linear-gradient(90deg, ${accentColor}, rgba(${accentRgb},.55))`,
                      }}
                    />
                  </div>
                )}

                {/* Lesson items */}
                <div className="space-y-0.5">
                  {cat.lessons.map((lesson, idx) => {
                    const isSelected = selectedId === lesson.id;
                    const isDone     = isLessonCompleted(lesson.id);
                    const requiredTier = lesson.requiredTier || 'free';
                    const locked = tierRank(userTier) < tierRank(requiredTier);
                    const ref = isSelected ? (el => { if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }) : undefined;
                    return (
                      <button
                        key={lesson.id}
                        ref={ref}
                        onClick={() => selectLesson(lesson.id)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left transition-all"
                        style={isSelected
                          ? { background: `rgba(${accentRgb},.1)`, outline: `1.5px solid rgba(${accentRgb},.25)` }
                          : { background: 'transparent' }}
                        title={locked ? `Bài này chỉ dành cho gói ${requiredTier}` : undefined}
                      >
                        {/* Status dot or lock */}
                        <div
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={locked
                            ? { background: '#F3F4F6', color: '#A1A1AA' }
                            : isDone
                              ? { background: '#D1FAE5', color: '#065F46' }
                              : isSelected
                                ? { background: accentColor, color: '#fff' }
                                : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                        >
                          {locked
                            ? <FaLock size={9} />
                            : isDone
                              ? <FaCircleCheck size={9} />
                              : isSelected
                                ? <FaPlay size={6} style={{ marginLeft: 1 }} />
                                : <span style={{ fontSize: 7, fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</span>}
                        </div>

                        {/* Title */}
                        <span
                          className="flex-1 min-w-0 text-[12px] leading-snug truncate"
                          style={{
                            fontWeight: isSelected ? 600 : 400,
                            color: locked ? '#A1A1AA' : isDone ? '#059669' : isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {lesson.title}
                          {locked && (
                            <span className="ml-1 text-[10px] font-bold text-[#F59E0B]">[{requiredTier}] <FaLock style={{ display: 'inline', marginLeft: 2 }} size={10} /></span>
                          )}
                        </span>

                        {/* Count */}
                        {lesson.itemCount > 0 && (
                          <span className="text-[10px] tabular-nums shrink-0 font-medium"
                            style={{ color: locked ? '#A1A1AA' : isDone ? '#10B981' : 'var(--text-muted)' }}>
                            {lesson.itemCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-0 items-start">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,.45)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:sticky top-14 z-40 md:z-auto
          flex-shrink-0 flex flex-col
          w-[268px]
          ml-3 mt-3 mb-3
          h-[calc(100vh-80px)]
          rounded-2xl overflow-hidden
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}
          >
            <FaBars size={14} />
          </button>
          <p className="flex-1 min-w-0 text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {lessonData?.title ?? 'Chọn bài học'}
          </p>
          {lessonData && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `rgba(${accentRgb},.12)`, color: accentColor }}>
              {currentIdx + 1} / {allLessons.length}
            </span>
          )}
        </div>

        <div className="p-3 space-y-3 relative">
          {(() => {
            const selectedLesson = allLessons.find(l => l.id === selectedId);
            const requiredTier = selectedLesson?.requiredTier || 'free';
            const locked = tierRank(userTier) < tierRank(requiredTier);
            if (loading) {
              return <SkeletonLoader accentRgb={accentRgb} />;
            }
            if (!lessonData) {
              return (
                <div className="flex flex-col items-center justify-center py-28 gap-3 rounded-3xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 52, opacity: 0.25 }}>📖</span>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    Chọn một bài học từ danh sách
                  </p>
                </div>
              );
            }
            return (
              <div className="relative">
                <div className={locked ? "blur-sm pointer-events-none select-none" : ""}>
                  <LessonView
                    lesson={lessonData}
                    lessonIdx={currentIdx}
                    totalLessons={allLessons.length}
                    prevLesson={prevLesson}
                    nextLesson={nextLesson}
                    accentColor={accentColor}
                    accentRgb={accentRgb}
                    userId={userId}
                    speaking={speaking}
                    flipped={flipped}
                    onSpeak={speak}
                    onFlip={id => setFlipped(f => ({ ...f, [id]: !f[id] }))}
                    onMarkComplete={markComplete}
                    onNavToLesson={selectLesson}
                  />
                </div>
                {locked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl border border-dashed border-[#F59E0B]" style={{ minHeight: 320 }}>
                    <FaLock size={32} style={{ color: '#F59E0B', marginBottom: 12 }} />
                    <p className="text-lg font-bold mb-2" style={{ color: '#F59E0B' }}>Bài học này bị khóa</p>
                    <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>Bạn cần nâng cấp gói <span className="font-semibold text-[#F59E0B]">{requiredTier}</span> để truy cập.</p>
                    <Link href="/pricing" className="btn-primary px-5 py-2 rounded-xl text-white font-bold text-sm" style={{ background: '#F59E0B' }}>Nâng cấp gói</Link>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────

function SkeletonLoader({ accentRgb }: { accentRgb: string }) {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="h-1.5" style={{ background: `rgba(${accentRgb},.3)` }} />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 rounded-full" style={{ background: 'var(--bg-muted)' }} />
          <div className="h-4 w-16 rounded-full" style={{ background: 'var(--bg-muted)' }} />
        </div>
        <div className="h-8 w-3/4 rounded-xl" style={{ background: 'var(--bg-muted)' }} />
        <div className="h-4 w-full rounded-xl" style={{ background: 'var(--bg-muted)' }} />
        <div className="h-4 w-2/3 rounded-xl" style={{ background: 'var(--bg-muted)' }} />
      </div>
      <div className="px-5 pb-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--bg-muted)' }} />
        ))}
      </div>
    </div>
  );
}

// ── Lesson View ────────────────────────────────────────────────────────────────

interface LessonViewProps {
  lesson: LessonDetail;
  lessonIdx: number;
  totalLessons: number;
  prevLesson: LessonMeta | null;
  nextLesson: LessonMeta | null;
  accentColor: string;
  accentRgb: string;
  userId?: string;
  speaking: string | null;
  flipped: Record<string, boolean>;
  onSpeak: (text: string, id: string) => void;
  onFlip: (id: string) => void;
  onMarkComplete: () => Promise<void>;
  onNavToLesson: (id: string) => void;
}

function LessonView({
  lesson, lessonIdx, totalLessons, prevLesson, nextLesson,
  accentColor, accentRgb, userId,
  speaking, flipped, onSpeak, onFlip, onMarkComplete, onNavToLesson,
}: LessonViewProps) {
  const [marking, setMarking] = useState(false);
  const isCharLesson = lesson.items.length > 0 && lesson.items.every(i => i.type === 'character');

  return (
    <div className="space-y-3">

      {/* ── Lesson header ── */}
      <div className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {/* Accent top strip */}
        <div className="h-1.5"
          style={{ background: `linear-gradient(90deg, ${accentColor}, rgba(${accentRgb},.25))` }} />
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: `rgba(${accentRgb},.1)`, color: accentColor }}>
              {lesson.type === 'vocab' ? 'TỪ VỰNG'
                : lesson.type === 'grammar' ? 'NGỮ PHÁP'
                : lesson.type.toUpperCase()}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Bài {lessonIdx + 1} / {totalLessons}
            </span>
            {lesson.isCompleted && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ml-auto"
                style={{ background: '#D1FAE5', color: '#065F46' }}>
                <FaCircleCheck size={9} /> Đã học
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold leading-tight mb-1"
            style={{ color: 'var(--text-primary)' }}>
            {lesson.title}
          </h2>
          {lesson.description && (
            <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Items ── */}
      {lesson.items.length > 0 ? (
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>Nội dung</span>
            <span className="text-[10px] font-bold tabular-nums"
              style={{ color: 'var(--text-muted)' }}>{lesson.items.length} mục</span>
          </div>

          {isCharLesson ? (
            /* ── Character grid ── large tiles, 3→4→5→6 cols */
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {lesson.items.map(item => (
                <CharTile
                  key={item.id}
                  item={item}
                  isFlipped={!!flipped[item.id]}
                  isSpeaking={speaking === item.id}
                  accentColor={accentColor}
                  accentRgb={accentRgb}
                  onFlip={() => onFlip(item.id)}
                  onSpeak={() => item.audioUrl
                    ? new Audio(item.audioUrl).play()
                    : onSpeak(item.term, item.id)}
                />
              ))}
            </div>
          ) : (
            /* ── Vocab / grammar cards ── 2-col on xl */
            <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
              {lesson.items.map(item => (
                <VocabCard
                  key={item.id}
                  item={item}
                  isFlipped={!!flipped[item.id]}
                  isSpeaking={speaking === item.id}
                  speakingEx={speaking === item.id + '_ex'}
                  accentColor={accentColor}
                  accentRgb={accentRgb}
                  onFlip={() => onFlip(item.id)}
                  onSpeak={() => item.audioUrl
                    ? new Audio(item.audioUrl).play()
                    : onSpeak(item.term, item.id)}
                  onSpeakEx={() => item.examples[0] && onSpeak(item.examples[0].exampleText, item.id + '_ex')}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p className="text-sm">Bài học này chưa có nội dung</p>
        </div>
      )}

      {/* ── Navigation + Complete ── */}
      <div className="rounded-3xl flex items-center gap-2 px-3 py-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        {/* Previous */}
        <div className="flex-1 flex justify-start min-w-0">
          {prevLesson && (
            <button
              onClick={() => onNavToLesson(prevLesson.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-medium text-sm transition-all hover:bg-[var(--bg-muted)]"
              style={{ color: 'var(--text-secondary)' }}>
              <FaChevronLeft size={10} />
              <span className="hidden sm:inline truncate max-w-[100px]">
                {prevLesson.title.length > 18 ? prevLesson.title.slice(0, 18) + '…' : prevLesson.title}
              </span>
              <span className="sm:hidden text-xs">Trước</span>
            </button>
          )}
        </div>

        {/* Complete */}
        <button
          onClick={async () => {
            if (!lesson.isCompleted && !marking) {
              setMarking(true);
              await onMarkComplete();
              setMarking(false);
            }
          }}
          disabled={lesson.isCompleted || marking}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all"
          style={
            lesson.isCompleted
              ? { background: '#D1FAE5', color: '#059669' }
              : userId
                ? { background: accentColor, color: '#fff', boxShadow: `0 4px 14px rgba(${accentRgb},.35)` }
                : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
          }
        >
          {lesson.isCompleted
            ? <><FaCircleCheck size={12} /> Đã học xong</>
            : marking ? 'Đang lưu…'
            : userId
              ? <><FaCircleCheck size={12} /> Hoàn thành</>
              : <><FaLock size={12} /> Đăng nhập</>}
        </button>

        {/* Next */}
        <div className="flex-1 flex justify-end min-w-0">
          {nextLesson && (
            <button
              onClick={() => onNavToLesson(nextLesson.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-semibold text-sm transition-all"
              style={{ background: accentColor, color: '#fff', boxShadow: `0 3px 10px rgba(${accentRgb},.25)` }}>
              <span className="hidden sm:inline truncate max-w-[100px]">
                {nextLesson.title.length > 18 ? nextLesson.title.slice(0, 18) + '…' : nextLesson.title}
              </span>
              <span className="sm:hidden text-xs">Tiếp</span>
              <FaChevronRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Character Tile ─────────────────────────────────────────────────────────────

interface TileProps {
  item: LessonItem;
  isFlipped: boolean;
  isSpeaking: boolean;
  accentColor: string;
  accentRgb: string;
  onFlip: () => void;
  onSpeak: () => void;
}

function CharTile({ item, isFlipped, isSpeaking, accentColor, accentRgb, onFlip, onSpeak }: TileProps) {
  const ti = ITEM_PALETTE[item.type] ?? ITEM_PALETTE.character;
  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        border: `1.5px solid ${isFlipped ? ti.border : 'var(--border)'}`,
        background: isFlipped ? ti.bg : 'var(--bg-surface)',
        transition: 'border-color .2s, background .2s',
      }}
    >
      {/* TTS button — top-right */}
      <button
        onClick={e => { e.stopPropagation(); onSpeak(); }}
        className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition z-10"
        style={isSpeaking
          ? { background: accentColor, color: '#fff' }
          : { background: `rgba(${accentRgb},.12)`, color: accentColor }}
      >
        {isSpeaking ? <FaStop size={8} /> : <FaVolumeHigh size={8} />}
      </button>

      {/* Flip area */}
      <div className="cursor-pointer pt-2" onClick={onFlip}>
        {/* Character */}
        <div className="flex flex-col items-center px-2 pt-3 pb-2 gap-1.5">
          <span
            className="leading-none font-normal"
            style={{
              fontSize: 52,
              color: isFlipped ? ti.color : 'var(--text-primary)',
              fontFamily: '"Noto Sans JP","Noto Sans SC",sans-serif',
              transition: 'color .2s',
            }}
          >
            {item.term}
          </span>
          {item.pronunciation && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isFlipped ? `${ti.color}18` : 'var(--bg-muted)',
                color: isFlipped ? ti.color : 'var(--text-muted)',
              }}
            >
              [{item.pronunciation}]
            </span>
          )}
        </div>

        {/* Meaning (flipped) */}
        {isFlipped ? (
          <div className="px-2 pb-3 text-center" style={{ borderTop: `1px solid ${ti.border}` }}>
            {item.meanings[0] && (
              <p className="text-[11px] font-bold pt-2 leading-tight" style={{ color: ti.color }}>
                {item.meanings[0].meaning}
              </p>
            )}
            {item.examples[0] && (
              <p className="text-[9px] mt-0.5 leading-tight opacity-70" style={{ color: ti.color }}>
                {item.examples[0].exampleText}
              </p>
            )}
          </div>
        ) : (
          <div className="pb-3 flex justify-center">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
            >
              Xem nghĩa
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vocab Card ─────────────────────────────────────────────────────────────────

interface VocabCardProps {
  item: LessonItem;
  isFlipped: boolean;
  isSpeaking: boolean;
  speakingEx: boolean;
  accentColor: string;
  accentRgb: string;
  onFlip: () => void;
  onSpeak: () => void;
  onSpeakEx: () => void;
}

function VocabCard({
  item, isFlipped, isSpeaking, speakingEx, accentColor, accentRgb, onFlip, onSpeak, onSpeakEx,
}: VocabCardProps) {
  const ti = ITEM_PALETTE[item.type] ?? {
    label: item.type, color: '#6B7280', bg: 'var(--bg-muted)', border: 'var(--border)',
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: isFlipped ? ti.bg : 'var(--bg-surface)',
        borderColor: isFlipped ? ti.border : 'var(--border)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Type badge */}
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
          style={{ color: ti.color, borderColor: ti.color, background: `${ti.color}12` }}
        >
          {ti.label}
        </span>

        {/* Term + reading */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {item.term}
          </span>
          {item.pronunciation && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              【{item.pronunciation}】
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onSpeak}
            className="w-7 h-7 rounded-xl flex items-center justify-center transition"
            style={isSpeaking
              ? { background: accentColor, color: '#fff' }
              : { background: `rgba(${accentRgb},.1)`, color: accentColor }}
          >
            {isSpeaking ? <FaStop size={10} /> : <FaVolumeHigh size={10} />}
          </button>
          <button
            onClick={onFlip}
            className="h-7 px-2.5 rounded-xl text-[11px] font-bold transition"
            style={isFlipped
              ? { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
              : { background: `rgba(${accentRgb},.12)`, color: accentColor }}
          >
            {isFlipped ? 'Ẩn' : 'Nghĩa'}
          </button>
        </div>
      </div>

      {/* Expanded meaning */}
      {isFlipped ? (
        <div className="px-4 pb-4 pt-1 space-y-2" style={{ borderTop: `1px solid ${ti.border}` }}>
          {item.meanings[0] && (
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {item.meanings[0].meaning}
            </p>
          )}
          {item.examples[0] && (
            <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,.04)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>
                  {item.examples[0].exampleText}
                </span>
                <button
                  onClick={onSpeakEx}
                  className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center transition"
                  style={speakingEx
                    ? { background: '#059669', color: '#fff' }
                    : { background: '#D1FAE5', color: '#059669' }}
                >
                  {speakingEx ? <FaStop size={9} /> : <FaVolumeHigh size={9} />}
                </button>
              </div>
              {item.examples[0].translation && (
                <p className="text-[11px] italic mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {item.examples[0].translation}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 pb-3">
          <div
            className="rounded-xl px-3 py-2 border border-dashed flex items-center gap-1.5 text-[11px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
          >
            <span>👆</span>
            Nhấn &ldquo;Nghĩa&rdquo; để xem nghĩa
          </div>
        </div>
      )}
    </div>
  );
}
