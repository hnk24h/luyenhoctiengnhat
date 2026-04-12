'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlay, FaClock, FaCircleCheck, FaChevronLeft, FaChevronRight,
  FaMap, FaHeadphones, FaBookOpen, FaBook, FaLayerGroup,
  FaClipboardList, FaBolt, FaXmark, FaArrowRight, FaPencil,
  FaFileLines, FaGraduationCap,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockQuestion {
  id: string;
  sectionId: string;
  partLabel: string | null;
  partTitle: string | null;
  passageText: string | null;
  passageAudio: string | null;
  passageImage: string | null;
  content: string;
  options: string[] | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

interface MockSection {
  id: string;
  title: string;
  titleVi: string | null;
  skill: string;
  timeLimit: number;
  order: number;
  questions: MockQuestion[];
}

interface MockExamData {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  levelCode: string;
  totalTime: number;
  sections: MockSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={14} />,
  grammar_reading: <FaBook size={14} />,
  listening: <FaHeadphones size={14} />,
  reading: <FaBook size={14} />,
  integrated: <FaLayerGroup size={14} />,
};

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5',
  grammar_reading: '#059669',
  listening: '#D97706',
  reading: '#0891B2',
  integrated: '#7C3AED',
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ─── Start Screen ─────────────────────────────────────────────────────────────

function StartScreen({ exam, onStart }: { exam: MockExamData; onStart: () => void }) {
  const totalQ = exam.sections.reduce((a, s) => a + s.questions.length, 0);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FaGraduationCap size={36} />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            {exam.subject} {exam.levelCode}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Đề thi thử đầy đủ
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-center mb-2 leading-snug"
          style={{ color: 'var(--text-base)' }}>
          {exam.title}
        </h1>
        {exam.description && (
          <p className="text-xs text-center mb-4" style={{ color: 'var(--text-muted)' }}>{exam.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Tổng câu', value: totalQ, color: 'var(--primary)' },
            { label: 'Thời gian', value: `${Math.round(exam.totalTime / 60)} phút`, color: '#D97706' },
            { label: 'Số phần', value: exam.sections.length, color: '#059669' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'var(--bg-muted)' }}>
              <div className="font-bold text-sm mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section breakdown */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Cấu trúc đề thi:</div>
          {exam.sections.map((sec, i) => (
            <div key={sec.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: (SKILL_COLOR[sec.skill] ?? '#4F46E5') + '18', color: SKILL_COLOR[sec.skill] ?? '#4F46E5' }}>
                {SKILL_ICON[sec.skill] ?? <FaClipboardList size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  Phần {i + 1}: {sec.titleVi ?? sec.title}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {sec.questions.length} câu · {Math.round(sec.timeLimit / 60)} phút
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-4 mb-6 text-xs leading-relaxed"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-base)' }}>Lưu ý: </span>
          Mỗi phần thi có giới hạn thời gian riêng. Khi hết giờ phần hiện tại sẽ tự động chuyển sang phần tiếp theo.
          Bạn không thể quay lại phần đã hoàn thành. Sau khi hoàn tất tất cả các phần, kết quả sẽ được tính tổng hợp.
        </div>

        <button onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <FaPlay size={14} /> Bắt đầu thi thử
        </button>
      </div>
    </div>
  );
}

// ─── Section Transition ───────────────────────────────────────────────────────

function SectionTransition({
  section,
  sectionIndex,
  totalSections,
  answeredInSection,
  onContinue,
}: {
  section: MockSection;
  sectionIndex: number;
  totalSections: number;
  answeredInSection: number;
  onContinue: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: '#DCFCE7', color: '#16A34A' }}>
          <FaCircleCheck size={24} />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Hoàn thành phần {sectionIndex}!
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Đã trả lời {answeredInSection} câu
        </p>

        {sectionIndex < totalSections && (
          <>
            <div className="rounded-xl p-3 mb-5" style={{ background: 'var(--bg-muted)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Phần tiếp theo:</div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {section.titleVi ?? section.title}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {section.questions.length} câu · {Math.round(section.timeLimit / 60)} phút
              </div>
            </div>

            <button onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              Bắt đầu phần tiếp <FaArrowRight size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Mock Exam Client ────────────────────────────────────────────────────

export default function MockExamClient({ exam }: { exam: MockExamData }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Exam state
  const [started, setStarted] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [sectionTransition, setSectionTransition] = useState(false);

  const section = exam.sections[currentSectionIdx];
  const questions = section?.questions ?? [];
  const q = questions[currentQIdx];
  const totalQuestions = exam.sections.reduce((a, s) => a + s.questions.length, 0);
  const totalAnswered = Object.keys(answers).length;

  // Section-level answered count
  const sectionAnswered = useMemo(() => {
    if (!section) return 0;
    return section.questions.filter(qq => answers[qq.id]).length;
  }, [section, answers]);

  // Timer
  useEffect(() => {
    if (!started || sectionTransition || !section) return;
    setTimeLeft(section.timeLimit);
  }, [started, currentSectionIdx, sectionTransition, section]);

  useEffect(() => {
    if (!started || sectionTransition || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time's up for this section
          clearInterval(timer);
          handleNextSection();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, sectionTransition, currentSectionIdx]);

  // Track time spent per section
  const sectionStartRef = useRef<number>(0);
  useEffect(() => {
    if (started && !sectionTransition && section) {
      sectionStartRef.current = Date.now();
    }
  }, [started, sectionTransition, section]);

  function recordSectionTime() {
    if (!section) return;
    const elapsed = Math.round((Date.now() - sectionStartRef.current) / 1000);
    setSectionTimes(prev => ({ ...prev, [section.id]: (prev[section.id] ?? 0) + elapsed }));
  }

  function handleNextSection() {
    recordSectionTime();
    if (currentSectionIdx + 1 >= exam.sections.length) {
      handleSubmit();
      return;
    }
    setSectionTransition(true);
  }

  function startNextSection() {
    setCurrentSectionIdx(i => i + 1);
    setCurrentQIdx(0);
    setSectionTransition(false);
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    recordSectionTime();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mock-exam/${exam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, sectionTimes }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/mock-exam/${exam.id}/result/${data.sessionId}`);
      } else {
        alert(data.error || 'Có lỗi xảy ra, thử lại nhé!');
        setSubmitting(false);
      }
    } catch {
      alert('Mất kết nối. Kiểm tra mạng và thử lại.');
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, exam.id, answers, sectionTimes, router]);

  function setAnswer(questionId: string, val: string) {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  }

  function goTo(idx: number) {
    setCurrentQIdx(Math.max(0, Math.min(questions.length - 1, idx)));
    setNavOpen(false);
  }

  // ── Helper: group questions by partLabel (must be before any early returns) ──
  const partGroups = useMemo(() => {
    const groups: { label: string; title: string | null; startIdx: number; count: number }[] = [];
    let lastLabel = '';
    for (let i = 0; i < questions.length; i++) {
      const pl = questions[i].partLabel ?? '';
      if (pl !== lastLabel) {
        groups.push({ label: pl, title: questions[i].partTitle, startIdx: i, count: 1 });
        lastLabel = pl;
      } else {
        groups[groups.length - 1].count++;
      }
    }
    return groups;
  }, [questions]);

  // ── Not started yet ──────────────────────────────────────────────────────
  if (!started) {
    return <StartScreen exam={exam} onStart={() => setStarted(true)} />;
  }

  // ── Section transition screen ────────────────────────────────────────────
  if (sectionTransition) {
    const nextSection = exam.sections[currentSectionIdx + 1];
    return (
      <SectionTransition
        section={nextSection}
        sectionIndex={currentSectionIdx + 1}
        totalSections={exam.sections.length}
        answeredInSection={sectionAnswered}
        onContinue={startNextSection}
      />
    );
  }

  if (!section || !q) return null;

  const timerRed = timeLeft < 60;
  const timerYellow = timeLeft < 300 && !timerRed;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ── Sticky header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: section info */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold shrink-0"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              {exam.levelCode}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: (SKILL_COLOR[section.skill] ?? '#4F46E5') + '18', color: SKILL_COLOR[section.skill] ?? '#4F46E5' }}>
              {SKILL_ICON[section.skill] ?? <FaClipboardList size={12} />}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-base)' }}>
                Phần {currentSectionIdx + 1}/{exam.sections.length}: {section.titleVi ?? section.title}
              </div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Câu {currentQIdx + 1}/{questions.length} · Tổng: {totalAnswered}/{totalQuestions}
              </div>
            </div>
          </div>

          {/* Right: timer + nav + submit */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold"
              style={timerRed
                ? { background: '#FEE2E2', color: '#DC2626' }
                : timerYellow
                ? { background: '#FEF3C7', color: '#D97706' }
                : { background: 'var(--bg-muted)', color: 'var(--text-base)' }}>
              <FaClock size={10} />
              {formatDuration(timeLeft)}
            </div>

            {/* Nav toggle */}
            <button onClick={() => setNavOpen(o => !o)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              <FaMap size={10} />
            </button>

            {/* Submit section / final submit */}
            {currentSectionIdx + 1 >= exam.sections.length ? (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--primary)' }}>
                <FaCircleCheck size={10} />
                <span className="hidden sm:inline">{submitting ? 'Đang nộp…' : 'Nộp bài'}</span>
              </button>
            ) : (
              <button onClick={handleNextSection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: SKILL_COLOR[section.skill] ?? 'var(--primary)' }}>
                Phần tiếp <FaArrowRight size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bars — section + overall */}
        <div className="h-1 flex">
          {exam.sections.map((sec, i) => {
            const secAnswered = sec.questions.filter(qq => answers[qq.id]).length;
            const pct = sec.questions.length > 0 ? (secAnswered / sec.questions.length) * 100 : 0;
            const isActive = i === currentSectionIdx;
            return (
              <div key={sec.id} className="flex-1 relative" style={{ background: 'var(--bg-muted)' }}>
                <div className="h-1 transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    background: isActive ? (SKILL_COLOR[sec.skill] ?? 'var(--primary)') : '#94A3B8',
                    opacity: i < currentSectionIdx ? 0.5 : 1,
                  }} />
              </div>
            );
          })}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-5 items-start">
        {/* Main question card */}
        <div className="flex-1 min-w-0">
          <div className="card">
            {/* Part label */}
            {q.partLabel && (
              <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold"
                  style={{ background: (SKILL_COLOR[section.skill] ?? '#4F46E5') + '15', color: SKILL_COLOR[section.skill] ?? '#4F46E5' }}>
                  {q.partLabel}
                </span>
                {q.partTitle && (
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{q.partTitle}</span>
                )}
              </div>
            )}

            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                  style={{ background: SKILL_COLOR[section.skill] ?? 'var(--primary)' }}>
                  {currentQIdx + 1}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/ {questions.length} câu</span>
              </div>
              {answers[q.id] && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  ✓ Đã trả lời
                </span>
              )}
            </div>

            {/* Passage (shared reading context) */}
            {q.passageText && (
              <div className="mb-5 p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-base)', borderLeft: `3px solid ${SKILL_COLOR[section.skill] ?? 'var(--primary)'}` }}>
                {q.passageText}
              </div>
            )}

            {/* Passage audio */}
            {q.passageAudio && (
              <div className="mb-4 p-3 rounded-2xl flex items-center gap-3" style={{ background: '#FFF7ED' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FED7AA', color: '#C2410C' }}>
                  <FaHeadphones size={14} />
                </div>
                <audio controls src={q.passageAudio} className="flex-1 h-8 min-w-0" />
              </div>
            )}

            {/* Question audio */}
            {q.audioUrl && !q.passageAudio && (
              <div className="mb-4 p-3 rounded-2xl flex items-center gap-3" style={{ background: '#FFF7ED' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FED7AA', color: '#C2410C' }}>
                  <FaHeadphones size={14} />
                </div>
                <audio ref={audioRef} controls src={q.audioUrl} className="flex-1 h-8 min-w-0" />
              </div>
            )}

            {/* Passage/question image */}
            {(q.passageImage || q.imageUrl) && (
              <div className="mb-4 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.passageImage || q.imageUrl || ''} alt="Hình minh họa"
                  className="w-full max-h-64 object-contain" style={{ background: 'var(--bg-muted)' }} />
              </div>
            )}

            {/* Question content */}
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap mb-5"
              style={{ color: 'var(--text-base)' }}>
              {q.content}
            </p>

            {/* Multiple choice options */}
            {Array.isArray(q.options) && (
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const letter = LETTERS[i] ?? String(i + 1);
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={i} onClick={() => setAnswer(q.id, opt)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all w-full"
                      style={selected
                        ? { borderColor: SKILL_COLOR[section.skill] ?? 'var(--primary)', background: (SKILL_COLOR[section.skill] ?? 'var(--primary)') + '10' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 transition-all"
                        style={selected
                          ? { background: SKILL_COLOR[section.skill] ?? 'var(--primary)', color: '#fff' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                        {letter}
                      </span>
                      <span className="text-sm font-medium flex-1 leading-snug"
                        style={{ color: selected ? (SKILL_COLOR[section.skill] ?? 'var(--primary)') : 'var(--text-base)' }}>
                        {opt}
                      </span>
                      {selected && <FaCircleCheck size={12} style={{ color: SKILL_COLOR[section.skill] ?? 'var(--primary)', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text input (for fill-in questions without options) */}
            {!q.options && (
              <input type="text"
                className="input w-full max-w-sm text-sm"
                placeholder="Nhập câu trả lời..."
                value={answers[q.id] ?? ''}
                onChange={e => setAnswer(q.id, e.target.value)}
              />
            )}

            {/* Prev / Next */}
            <div className="flex justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => goTo(currentQIdx - 1)} disabled={currentQIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                <FaChevronLeft size={10} /> Câu trước
              </button>

              {currentQIdx < questions.length - 1 ? (
                <button onClick={() => goTo(currentQIdx + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: SKILL_COLOR[section.skill] ?? 'var(--primary)' }}>
                  Câu tiếp <FaChevronRight size={10} />
                </button>
              ) : currentSectionIdx + 1 < exam.sections.length ? (
                <button onClick={handleNextSection}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: SKILL_COLOR[section.skill] ?? 'var(--primary)' }}>
                  Kết thúc phần <FaArrowRight size={10} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--primary)' }}>
                  <FaCircleCheck size={10} /> {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Question navigator panel ─────────────────────────────── */}
        <div className={`${navOpen ? 'fixed inset-0 z-40 bg-black/30 lg:static lg:bg-transparent' : 'hidden lg:block'}`} onClick={() => setNavOpen(false)}>
          <div className={`${navOpen ? 'fixed right-0 top-0 h-full w-72 z-50' : 'w-56'} rounded-2xl overflow-hidden`}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            {/* Nav header */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border)', background: (SKILL_COLOR[section.skill] ?? 'var(--primary)') }}>
              <div className="flex items-center gap-2">
                <FaMap size={11} className="text-white/80" />
                <span className="text-xs font-bold text-white">Bản đồ câu hỏi</span>
              </div>
              <button onClick={() => setNavOpen(false)} className="lg:hidden text-white/70 hover:text-white">
                <FaXmark size={14} />
              </button>
            </div>

            {/* Section tabs */}
            <div className="px-3 pt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
              {exam.sections.map((sec, i) => (
                <button key={sec.id}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  style={i === currentSectionIdx
                    ? { background: SKILL_COLOR[sec.skill] ?? 'var(--primary)', color: '#fff' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                  disabled={i !== currentSectionIdx}>
                  P{i + 1}
                </button>
              ))}
            </div>

            {/* Question grid */}
            <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {partGroups.map(group => (
                <div key={group.label + group.startIdx} className="mb-3">
                  {group.label && (
                    <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5 px-0.5" style={{ color: 'var(--text-muted)' }}>
                      {group.label}
                    </div>
                  )}
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: group.count }, (_, j) => {
                      const idx = group.startIdx + j;
                      const qq = questions[idx];
                      const isAnswered = !!answers[qq.id];
                      const isCurrent = idx === currentQIdx;
                      return (
                        <button key={qq.id} onClick={() => goTo(idx)}
                          className="w-8 h-8 rounded-lg text-[10px] font-bold transition-all"
                          style={isCurrent
                            ? { background: SKILL_COLOR[section.skill] ?? 'var(--primary)', color: '#fff', boxShadow: `0 0 0 2px ${SKILL_COLOR[section.skill] ?? 'var(--primary)'}40` }
                            : isAnswered
                            ? { background: '#DCFCE7', color: '#16A34A' }
                            : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Section progress */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Tiến độ phần này
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                    <div className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${questions.length > 0 ? (sectionAnswered / questions.length) * 100 : 0}%`, background: SKILL_COLOR[section.skill] ?? 'var(--primary)' }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    {sectionAnswered}/{questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
