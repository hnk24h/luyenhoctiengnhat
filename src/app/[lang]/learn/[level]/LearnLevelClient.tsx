'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaCircleCheck, FaBookOpen, FaRuler, FaLayerGroup, FaPlay,
  FaChevronRight, FaBars, FaVolumeHigh, FaStop,
  FaHandPointer, FaLock,
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
      <>
        {/* Tab switcher */}
        <div
          className="sticky top-0 z-10 px-3 pt-3 pb-2"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
            {(['vocab', 'grammar'] as const).map(tab => {
              const count = (tab === 'vocab' ? vocabCats : grammarCats)
                .reduce((s, c) => s + c.lessons.length, 0);
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={active
                    ? { background: accentColor, color: '#fff', boxShadow: `0 2px 8px rgba(${accentRgb},.3)` }
                    : { color: 'var(--text-muted)' }}
                >
                  {tab === 'vocab' ? <FaBookOpen size={10} /> : <FaRuler size={10} />}
                  {tab === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'}
                  <span className="text-[9px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category + lesson list */}
        <div className="flex-1 px-2.5 py-3 space-y-3">
          {activeCats.length === 0 && (
            <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>
              Chưa có nội dung
            </p>
          )}
          {activeCats.map(cat => {
            const catCompleted = cat.lessons.filter(l => isLessonCompleted(l.id)).length;
            const catPct = cat.lessons.length > 0
              ? Math.round((catCompleted / cat.lessons.length) * 100)
              : 0;

            return (
              <div key={cat.id}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
              >
                {/* Category header */}
                <div className="flex items-center justify-between px-3 py-2"
                  style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </span>
                  {cat.lessons.length > 0 && (
                    <span className="text-[10px] font-bold tabular-nums shrink-0 ml-2"
                      style={{ color: catPct === 100 ? '#059669' : accentColor }}
                    >
                      {catCompleted}/{cat.lessons.length}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {userId && cat.lessons.length > 0 && (
                  <div className="h-0.5 w-full" style={{ background: 'var(--bg-muted)' }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${catPct}%`, background: catPct === 100 ? '#10B981' : accentColor }}
                    />
                  </div>
                )}

                {/* Lesson buttons */}
                {cat.lessons.map((lesson, idx) => {
                  const isSelected = selectedId === lesson.id;
                  const isDone     = isLessonCompleted(lesson.id);
                  const isLast     = idx === cat.lessons.length - 1;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(lesson.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                      style={{
                        background: isSelected ? `rgba(${accentRgb},.09)` : 'transparent',
                        borderLeft: `3px solid ${
                          isSelected ? accentColor : isDone ? '#10B981' : 'transparent'
                        }`,
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {/* Step dot */}
                      <div
                        className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                        style={
                          isDone
                            ? { background: '#D1FAE5', color: '#065F46' }
                            : isSelected
                              ? { background: accentColor, color: '#fff' }
                              : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                        }
                      >
                        {isDone
                          ? <FaCircleCheck size={10} />
                          : isSelected
                            ? <FaPlay size={7} style={{ marginLeft: 1 }} />
                            : <span style={{ fontSize: 8, fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</span>
                        }
                      </div>

                      {/* Title */}
                      <span
                        className="flex-1 min-w-0 text-[12px] leading-snug truncate"
                        style={{
                          fontWeight: isSelected ? 600 : 400,
                          color: isDone ? '#059669' : isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {lesson.title}
                      </span>

                      {/* Item count */}
                      {lesson.itemCount > 0 && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                          style={{
                            background: isDone ? 'rgba(16,185,129,.1)' : `rgba(${accentRgb},.08)`,
                            color: isDone ? '#059669' : accentColor,
                          }}>
                          {lesson.itemCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="flex gap-0 items-start">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,.45)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:sticky top-14 z-40 md:z-auto
          flex-shrink-0 flex flex-col
          w-[272px]
          ml-3 mt-3 mb-3
          h-[calc(100vh-80px)]
          overflow-y-auto rounded-2xl overflow-hidden
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}
          >
            <FaBars size={13} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {lessonData?.title ?? 'Chọn bài học'}
            </p>
          </div>
          {lessonData && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `rgba(${accentRgb},.12)`, color: accentColor }}
            >
              {currentIdx + 1}/{allLessons.length}
            </span>
          )}
        </div>

        <div className="mx-3 mt-3 mb-3">
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
          <div className="p-4 sm:p-5 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div
                className="w-9 h-9 rounded-full border-2 animate-spin"
                style={{
                  borderColor: `rgba(${accentRgb},.25)`,
                  borderTopColor: accentColor,
                }}
              />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải bài học…</p>
            </div>
          ) : !lessonData ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <div className="mb-2 opacity-40"><FaBookOpen size={44} style={{ color: 'var(--text-muted)' }}/></div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Chọn một bài học từ danh sách bên trái
              </p>
            </div>
          ) : (
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
          )}
          </div>
          </div>
        </div>
      </main>
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

  return (
    <div className="space-y-4">
      {/* ── Lesson header ── */}
      <div
        className="rounded-2xl px-5 py-4"
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{ background: `rgba(${accentRgb},.1)`, color: accentColor }}
          >
            {lesson.type === 'vocab' ? 'Từ vựng'
              : lesson.type === 'grammar' ? 'Ngữ pháp'
              : lesson.type}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Bài {lessonIdx + 1} / {totalLessons}
          </span>
          {lesson.isCompleted && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: '#D1FAE5', color: '#065F46' }}
            >
              <FaCircleCheck size={8} /> Đã học
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>
            {lesson.description}
          </p>
        )}
      </div>

      {/* ── Items ── */}
      {lesson.items.length > 0 ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Section header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Nội dung
            </span>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {lesson.items.length} mục
            </span>
          </div>
          <div className="p-3 grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            {lesson.items.map(item => {
              const ti = ITEM_PALETTE[item.type] ?? {
                label: item.type, color: '#6B7280',
                bg: 'var(--bg-muted)', border: 'var(--border)',
              };
              const isFlipped = flipped[item.id];

              return (
                <div
                  key={item.id}
                  className="rounded-xl border p-3 transition-shadow hover:shadow-sm"
                  style={{ background: ti.bg, borderColor: ti.border }}
                >
                  <div className="flex items-start gap-2">
                    {/* Type badge */}
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5"
                      style={{ color: ti.color, borderColor: ti.color }}
                    >
                      {ti.label}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Term + reading + buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xl font-bold"
                          style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
                        >
                          {item.term}
                        </span>
                        {item.pronunciation && (
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            【{item.pronunciation}】
                          </span>
                        )}

                        {/* TTS */}
                        <button
                          className="p-1 rounded transition"
                          style={
                            speaking === item.id
                              ? { background: accentColor, color: '#fff' }
                              : { background: `rgba(${accentRgb},.1)`, color: accentColor }
                          }
                          title="Nghe phát âm"
                          onClick={() =>
                            item.audioUrl
                              ? new Audio(item.audioUrl).play()
                              : onSpeak(item.term, item.id)
                          }
                        >
                          {speaking === item.id ? <FaStop size={10} /> : <FaVolumeHigh size={10} />}
                        </button>

                        {/* Show/hide meaning */}
                        <button
                          className="text-[10px] px-2 py-0.5 rounded font-semibold transition"
                          style={
                            isFlipped
                              ? { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                              : { background: `rgba(${accentRgb},.12)`, color: accentColor }
                          }
                          onClick={() => onFlip(item.id)}
                        >
                          {isFlipped ? 'Ẩn' : 'Xem nghĩa'}
                        </button>
                      </div>

                      {/* Meaning / placeholder */}
                      {isFlipped ? (
                        <div className="mt-1.5 space-y-1.5">
                          {item.meanings[0] && (
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {item.meanings[0].meaning}
                            </p>
                          )}
                          {/* Example */}
                          {item.examples[0] && (
                            <div
                              className="pt-1.5 mt-1.5"
                              style={{ borderTop: `1px solid ${ti.border}` }}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {item.examples[0].exampleText}
                                </span>
                                <button
                                  className="p-0.5 rounded transition"
                                  style={
                                    speaking === item.id + '_ex'
                                      ? { background: '#059669', color: '#fff' }
                                      : { background: '#D1FAE5', color: '#059669' }
                                  }
                                  onClick={() => onSpeak(item.examples[0].exampleText, item.id + '_ex')}
                                >
                                  {speaking === item.id + '_ex'
                                    ? <FaStop size={9} />
                                    : <FaVolumeHigh size={9} />}
                                </button>
                              </div>
                              {item.examples[0].translation && (
                                <p className="text-[11px] italic mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  {item.examples[0].translation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="mt-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-[11px] flex items-center gap-1"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-surface)',
                          }}
                        >
                          <FaHandPointer size={9} />
                          Nhấn "Xem nghĩa" để hiển thị
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="text-center py-14 rounded-2xl"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <p className="text-sm">Bài học này chưa có nội dung</p>
        </div>
      )}

      {/* ── Navigation + Complete ── */}
      <div
        className="rounded-2xl flex items-center gap-3 flex-wrap px-4 py-3"
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
      >
        {prevLesson ? (
          <button
            onClick={() => onNavToLesson(prevLesson.id)}
            className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}
          >
            ← {prevLesson.title.length > 20 ? prevLesson.title.slice(0, 20) + '…' : prevLesson.title}
          </button>
        ) : <div />}

        <button
          onClick={async () => {
            if (!lesson.isCompleted && !marking) {
              setMarking(true);
              await onMarkComplete();
              setMarking(false);
            }
          }}
          disabled={lesson.isCompleted || marking}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold text-sm transition-all mx-auto"
          style={
            lesson.isCompleted
              ? { background: '#D1FAE5', color: '#059669', cursor: 'default' }
              : userId
                ? { background: accentColor, color: '#fff', boxShadow: `0 2px 10px rgba(${accentRgb},.35)` }
                : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
          }
        >
          {lesson.isCompleted
            ? <><FaCircleCheck size={11} /> Đã học xong</>
            : marking ? 'Đang lưu…'
            : userId
              ? <><FaCircleCheck size={11} /> Hoàn thành</>
              : <><FaLock size={11} /> Đăng nhập để lưu</>
          }
        </button>

        {nextLesson ? (
          <button
            onClick={() => onNavToLesson(nextLesson.id)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold transition-all"
            style={{
              background: accentColor,
              color: '#fff',
              boxShadow: `0 2px 8px rgba(${accentRgb},.2)`,
            }}
          >
            {nextLesson.title.length > 22 ? nextLesson.title.slice(0, 22) + '…' : nextLesson.title} →
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
