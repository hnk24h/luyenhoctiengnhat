'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  FaFire, FaChartSimple, FaCalendarDays, FaFilter, FaBook,
  FaAlignLeft, FaAlignJustify, FaNewspaper, FaClock, FaEye,
  FaChevronLeft, FaChevronRight, FaGraduationCap, FaPlay,
  FaPause, FaVolumeHigh, FaQuestion, FaCheck, FaXmark,
  FaTrophy, FaLightbulb, FaHighlighter, FaBookOpen,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';

import type { PassageSummary, PassageDetail, ReadingStats, GrammarMatch } from './types';
import { LEVEL_META, TYPE_META, GRAMMAR_LEVEL_META } from './constants';
import {
  thumbGradient, thumbIcon, readTime,
  getReadingStats, analyzeGrammar, generateComprehensionQuestions,
} from './helpers';

// ─── ExampleHighlight ─────────────────────────────────────────────────────────

export function ExampleHighlight({ sentence, keyword }: { sentence: string; keyword: string }) {
  const idx = sentence.indexOf(keyword);
  if (idx === -1) return <span>{sentence}</span>;
  return (
    <>
      <span>{sentence.substring(0, idx)}</span>
      <mark style={{ background: '#FDE68A', color: '#92400E', borderRadius: 3, padding: '0 2px' }}>{keyword}</mark>
      <span>{sentence.substring(idx + keyword.length)}</span>
    </>
  );
}

// ─── GrammarPanel ─────────────────────────────────────────────────────────────

export function GrammarPanel({ passage }: { passage: PassageDetail }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const lang = (params?.lang as string) ?? 'ja';
  const matches = analyzeGrammar(passage.content, passage.level);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  if (matches.length === 0) return null;

  const levels = Array.from(new Set(matches.map(m => m.level)));
  const filtered = filterLevel ? matches.filter(m => m.level === filterLevel) : matches;

  return (
    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-surface)' }}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <FaGraduationCap size={13} style={{ color: 'var(--primary)' }} />
        <span className="text-[12px] font-bold" style={{ color: 'var(--text-base)' }}>Ngữ pháp trong bài</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{filtered.length}</span>
      </div>

      {/* Level filter chips */}
      {levels.length > 1 && (
        <div className="flex flex-wrap gap-1 px-1 mb-2">
          <button onClick={() => setFilterLevel(null)}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full transition-all"
            style={!filterLevel
              ? { background: 'var(--primary)', color: '#fff' }
              : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Tất cả
          </button>
          {levels.map(lv => {
            const lc = GRAMMAR_LEVEL_META[lv] ?? GRAMMAR_LEVEL_META.N5;
            const active = filterLevel === lv;
            return (
              <button key={lv} onClick={() => setFilterLevel(active ? null : lv)}
                className="text-[9px] font-bold px-2 py-0.5 rounded-full transition-all"
                style={active
                  ? { background: lc.color, color: '#fff' }
                  : { background: lc.bg, color: lc.color }}>
                {lv}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {filtered.map(m => {
          const lc = GRAMMAR_LEVEL_META[m.level] ?? GRAMMAR_LEVEL_META.N5;
          const grammarUrl = `/${locale}/${lang}/grammar?level=${m.level}&search=${encodeURIComponent(m.name)}`;
          return (
            <a key={m.id} href={grammarUrl}
              className="group/gitem w-full text-left rounded-xl p-2.5 flex flex-col gap-1 transition-all no-underline"
              style={{ background: 'transparent', cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${lc.color} 8%, transparent)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: lc.bg, color: lc.color }}>{m.level}</span>
                <span className="font-bold text-[11px]"
                  style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
                  {m.name}
                </span>
                <FaArrowUpRightFromSquare size={7} className="ml-auto shrink-0 opacity-0 group-hover/gitem:opacity-100 transition-opacity"
                  style={{ color: lc.color }} />
              </div>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>{m.meaning}</p>
              {/* Example inline */}
              <div className="text-[10px] leading-relaxed mt-0.5 pl-1"
                style={{ color: 'var(--text-secondary)', fontFamily: '"Noto Sans JP", serif', borderLeft: `2px solid ${lc.color}33` }}>
                <ExampleHighlight sentence={m.example} keyword={m.highlight} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── ReadingStatsBadge ────────────────────────────────────────────────────────

export function ReadingStatsBadge() {
  const [stats, setStats] = useState<ReadingStats>({ totalRead: 0, streakDays: 0, lastReadDate: '', readToday: 0, readIds: [] });
  useEffect(() => { setStats(getReadingStats()); }, []);

  if (stats.totalRead === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1.5">
        <FaFire size={14} style={{ color: stats.streakDays >= 3 ? '#EF4444' : '#F59E0B' }} />
        <div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stats.streakDays}</span>
          <span className="text-[10px] ml-0.5" style={{ color: 'var(--text-muted)' }}>ngày liên tiếp</span>
        </div>
      </div>
      <div className="w-px h-6" style={{ background: 'var(--border)' }} />
      <div className="flex items-center gap-1.5">
        <FaChartSimple size={12} style={{ color: 'var(--primary)' }} />
        <div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalRead}</span>
          <span className="text-[10px] ml-0.5" style={{ color: 'var(--text-muted)' }}>bài đã đọc</span>
        </div>
      </div>
      <div className="w-px h-6" style={{ background: 'var(--border)' }} />
      <div className="flex items-center gap-1.5">
        <FaCalendarDays size={12} style={{ color: '#0D9488' }} />
        <div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stats.readToday}</span>
          <span className="text-[10px] ml-0.5" style={{ color: 'var(--text-muted)' }}>hôm nay</span>
        </div>
      </div>
    </div>
  );
}

// ─── FilterChips ──────────────────────────────────────────────────────────────

export function FilterChips({ selectedType, onSelect, isChinese }: {
  selectedType: string; onSelect: (t: string) => void; isChinese: boolean;
}) {
  if (isChinese) return null;
  const chips = [
    { key: '', label: 'Tất cả', icon: <FaBook size={10} /> },
    { key: 'short', label: 'Đoạn ngắn', icon: <FaAlignLeft size={10} /> },
    { key: 'long', label: 'Bài dài', icon: <FaAlignJustify size={10} /> },
    { key: 'news', label: 'Tin tức', icon: <FaNewspaper size={10} /> },
  ];
  return (
    <div className="flex items-center gap-2">
      <FaFilter size={10} style={{ color: 'var(--text-muted)' }} />
      {chips.map(c => {
        const active = selectedType === c.key;
        return (
          <button key={c.key} onClick={() => onSelect(c.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
            style={active
              ? { background: 'var(--primary)', color: '#fff' }
              : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {c.icon} {c.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── PassageScroller (horizontal for mobile) ─────────────────────────────────

export function PassageScroller({ passages, selectedId, onSelect, loading, isChinese }: {
  passages: PassageSummary[]; selectedId: string | null;
  onSelect: (id: string) => void; loading: boolean; isChinese: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-56 shrink-0 rounded-2xl animate-pulse"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', height: 180 }}>
            <div className="h-16 rounded-t-2xl" style={{ background: 'var(--border)' }} />
            <div className="p-3">
              <div className="h-3 w-3/4 rounded" style={{ background: 'var(--border)' }} />
              <div className="h-2 w-1/2 rounded mt-3" style={{ background: 'var(--border)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (passages.length === 0) return null;

  return (
    <div className="relative group/scroller">
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
        {passages.map(p => {
          const active = p.id === selectedId;
          const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
          const tm = TYPE_META[p.type];
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className="w-60 shrink-0 text-left rounded-2xl transition-all snap-start hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={active
                ? { border: `2px solid ${lm.color}55`, boxShadow: `0 4px 20px ${lm.color}20`, background: 'var(--bg-surface)' }
                : { border: '1.5px solid var(--border)', background: 'var(--bg-surface)' }}>
              <div className="h-16 flex items-center justify-center relative overflow-hidden"
                style={{ background: thumbGradient(p.id) }}>
                <span className="text-2xl opacity-60">{thumbIcon(p.id)}</span>
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `${lm.color}33` }}>
                    <FaEye size={16} style={{ color: '#fff' }} />
                  </div>
                )}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: lm.color, color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                  <span>{lm.emoji}</span> {p.level}
                </div>
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                  <FaClock size={7} /> {readTime(p.charCount)}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {tm && (
                    <span className="text-[9px] flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: tm.bg, color: tm.color }}>
                      {tm.icon} {tm.label}
                    </span>
                  )}
                </div>
                <h4 className="text-[13px] font-bold leading-snug line-clamp-2 mb-1"
                  style={{ color: active ? lm.color : 'var(--text-primary)',
                    fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                  {p.title}
                </h4>
                {p.titleVi && (
                  <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {p.titleVi}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {passages.length > 3 && (
        <>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: 'var(--text-primary)' }}>
            <FaChevronLeft size={10} />
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: 'var(--text-primary)' }}>
            <FaChevronRight size={10} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── ReadingProgressBar ───────────────────────────────────────────────────────

export function ReadingProgressBar({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const total = el.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentRef]);
  if (progress < 1) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'var(--border)' }}>
      <div className="h-full transition-[width] duration-150"
        style={{ width: `${progress}%`, background: 'var(--primary)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)' }} />
    </div>
  );
}

// ─── TTSPlayer ────────────────────────────────────────────────────────────────

export function TTSPlayer({ text, lang }: { text: string; lang: string }) {
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.8);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechLang = lang === 'zh' ? 'zh-CN' : 'ja-JP';

  const handlePlay = () => {
    if (playing) {
      speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const chunks = text.split(/[。！？\n]+/).filter(s => s.trim().length > 0);
    const fullText = chunks.join('。');
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.lang = speechLang;
    utt.rate = rate;
    utt.onend = () => setPlaying(false);
    utt.onerror = () => setPlaying(false);
    synthRef.current = utt;
    speechSynthesis.speak(utt);
    setPlaying(true);
  };

  useEffect(() => () => { speechSynthesis.cancel(); }, []);

  return (
    <div className="flex items-center gap-2">
      <button onClick={handlePlay}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={playing
          ? { background: '#FEE2E2', color: '#DC2626' }
          : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
        {playing ? <FaPause size={10} /> : <FaPlay size={10} />}
        {playing ? 'Dừng' : 'Nghe bài'}
      </button>
      <div className="flex items-center gap-1">
        {[0.6, 0.8, 1.0].map(r => (
          <button key={r} onClick={() => { setRate(r); if (synthRef.current) synthRef.current.rate = r; }}
            className="w-6 h-6 rounded text-[10px] font-bold transition-all"
            style={rate === r
              ? { background: 'var(--primary)', color: '#fff' }
              : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            {r}x
          </button>
        ))}
      </div>
      <FaVolumeHigh size={10} style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}

// ─── ComprehensionQuiz ────────────────────────────────────────────────────────

export function ComprehensionQuiz({ passage, isChinese }: { passage: PassageDetail; isChinese: boolean }) {
  const questions = useMemo(() => generateComprehensionQuestions(passage, isChinese), [passage, isChinese]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  if (questions.length === 0) return null;

  const score = questions.reduce((s, q) => s + (answers[q.id] === q.correctIndex ? 1 : 0), 0);
  const q = questions[activeTab];
  const isCorrect = answers[q.id] === q.correctIndex;

  return (
    <div className="mt-6 rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderBottom: '1px solid var(--border)' }}>
        <FaQuestion size={14} style={{ color: '#2563EB' }} />
        <span className="text-sm font-bold" style={{ color: '#1E40AF' }}>Kiểm tra đọc hiểu</span>
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: '#DBEAFE', color: '#2563EB' }}>{Object.keys(answers).length}/{questions.length}</span>
      </div>

      {/* Question tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
        {questions.map((qt, i) => {
          const answered = answers[qt.id] !== undefined;
          const correct = showResults && answers[qt.id] === qt.correctIndex;
          const wrong = showResults && answered && answers[qt.id] !== qt.correctIndex;
          const isActive = i === activeTab;
          let bg = 'var(--bg-muted)';
          let color = 'var(--text-muted)';
          let border = '2px solid transparent';
          if (isActive) { bg = '#EFF6FF'; color = '#2563EB'; border = '2px solid #2563EB'; }
          else if (correct) { bg = '#DCFCE7'; color = '#15803D'; }
          else if (wrong) { bg = '#FEE2E2'; color = '#DC2626'; }
          else if (answered) { bg = 'var(--primary-light)'; color = 'var(--primary)'; }
          return (
            <button key={qt.id} onClick={() => setActiveTab(i)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0"
              style={{ background: bg, color, border }}>
              {correct && <FaCheck size={8} />}
              {wrong && <FaXmark size={8} />}
              Câu {i + 1}
            </button>
          );
        })}
      </div>

      {/* Active question */}
      <div className="p-5">
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2"
            style={{ background: '#EFF6FF', color: '#2563EB' }}>{activeTab + 1}</span>
          {q.question}
        </p>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, oi) => {
            const selected = answers[q.id] === oi;
            const isCorrectOpt = oi === q.correctIndex;
            let optStyle: React.CSSProperties = { background: 'var(--bg-base)', border: '1.5px solid var(--border)', color: 'var(--text-base)' };
            if (showResults && isCorrectOpt) optStyle = { background: '#DCFCE7', border: '1.5px solid #15803D', color: '#15803D' };
            else if (showResults && selected && !isCorrect) optStyle = { background: '#FEE2E2', border: '1.5px solid #DC2626', color: '#DC2626' };
            else if (selected) optStyle = { background: 'var(--primary-light)', border: '1.5px solid var(--primary)', color: 'var(--primary)' };

            return (
              <button key={oi}
                onClick={() => {
                  if (!showResults) {
                    setAnswers(a => ({ ...a, [q.id]: oi }));
                    // Auto-advance to next unanswered question
                    if (answers[q.id] === undefined && activeTab < questions.length - 1) {
                      setTimeout(() => setActiveTab(t => Math.min(t + 1, questions.length - 1)), 350);
                    }
                  }
                }}
                className="text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-2"
                style={optStyle}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: selected ? 'var(--primary)' : 'var(--border)', color: selected ? '#fff' : 'var(--text-muted)' }}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {showResults && isCorrectOpt && <FaCheck size={12} style={{ color: '#15803D' }} />}
                {showResults && selected && !isCorrect && <FaXmark size={12} style={{ color: '#DC2626' }} />}
              </button>
            );
          })}
        </div>

        {/* Navigation + submit */}
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setActiveTab(t => Math.max(0, t - 1))} disabled={activeTab === 0}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            <FaChevronLeft size={8} /> Trước
          </button>
          {activeTab < questions.length - 1 ? (
            <button onClick={() => setActiveTab(t => t + 1)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              Tiếp <FaChevronRight size={8} />
            </button>
          ) : !showResults ? (
            <button onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < questions.length}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              Xem kết quả
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: score === questions.length ? '#DCFCE7' : '#FEF9C3',
              border: `1px solid ${score === questions.length ? '#15803D' : '#D97706'}33` }}>
            <div className="flex items-center gap-2">
              {score === questions.length ? <FaTrophy size={20} style={{ color: '#15803D' }} /> : <FaLightbulb size={20} style={{ color: '#D97706' }} />}
              <div>
                <p className="text-sm font-bold" style={{ color: score === questions.length ? '#15803D' : '#92400E' }}>
                  {score === questions.length ? 'Xuất sắc! 🎉' : `${score}/${questions.length} câu đúng`}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {score === questions.length ? 'Bạn đã hiểu bài rất tốt!' : 'Đọc lại bài để cải thiện nhé!'}
                </p>
              </div>
            </div>
            <button onClick={() => { setAnswers({}); setShowResults(false); setActiveTab(0); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--bg-surface)', color: 'var(--primary)' }}>
              Làm lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── useHighlights hook ───────────────────────────────────────────────────────

export function useHighlights(passageId: string) {
  const key = `highlights-${passageId}`;
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setHighlights(JSON.parse(raw)); }
    catch { /* empty */ }
  }, [key]);

  const addHighlight = useCallback((text: string) => {
    setHighlights(prev => {
      const next = prev.includes(text) ? prev.filter(h => h !== text) : [...prev, text];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return { highlights, addHighlight };
}

export function HighlightToolbar({ onHighlight }: { onHighlight: () => void }) {
  return (
    <button onClick={onHighlight}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
      style={{ background: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A' }}>
      <FaHighlighter size={9} /> Highlight
    </button>
  );
}

// ─── RelatedPassages ──────────────────────────────────────────────────────────

export function RelatedPassages({ current, allPassages, onSelect, isChinese }: {
  current: PassageDetail; allPassages: PassageSummary[];
  onSelect: (id: string) => void; isChinese: boolean;
}) {
  const related = allPassages
    .filter(p => p.id !== current.id && (p.level === current.level || p.type === current.type))
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <FaBookOpen size={13} style={{ color: 'var(--primary)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Bài đọc liên quan</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map(p => {
          const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className="text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
              style={{ border: '1px solid var(--border)' }}>
              <div className="h-10 flex items-center justify-center"
                style={{ background: thumbGradient(p.id) }}>
                <span className="text-lg opacity-60">{thumbIcon(p.id)}</span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: lm.bg, color: lm.color }}>{p.level}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{readTime(p.charCount)}</span>
                </div>
                <h4 className="text-xs font-bold line-clamp-2" style={{
                  color: 'var(--text-primary)',
                  fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
                }}>{p.title}</h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
