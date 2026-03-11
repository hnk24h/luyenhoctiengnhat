'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SKILLS, formatDuration } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import {
  FaArrowLeft, FaClock, FaCheck, FaPlay, FaRotateRight,
  FaListCheck, FaLock, FaTrophy, FaBolt, FaCircleCheck,
  FaChevronDown, FaChevronUp, FaHeadphones, FaChevronLeft,
  FaChevronRight, FaMap, FaXmark,
} from 'react-icons/fa6';

/*  Shared types  */

export interface ExamSetSummary {
  id: string;
  title: string;
  description: string | null;
  skill: string;
  timeLimit: number | null;
  questionCount: number;
  progress: {
    bestScore: number | null;
    attempts: number;
    completed: boolean;
  } | null;
}

interface Question {
  id: string;
  type: string;
  content: string;
  options: string[] | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

// Prisma stores options as Json? — normalize to string[] regardless of wire format
function parseOptions(raw: unknown): string[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed.map(String) : null; } catch { return null; }
  }
  return null;
}

interface LoadedExam {
  id: string;
  title: string;
  skill: string;
  timeLimit: number | null;
  levelCode: string;
  questions: Question[];
}

interface Props {
  lang: string;
  level: { code: string; name: string; description: string | null };
  examSets: ExamSetSummary[];
  isLoggedIn: boolean;
}

/*  Helpers  */

function scoreColor(s: number) { return s >= 80 ? '#16A34A' : s >= 60 ? '#D97706' : '#DC2626'; }
function scoreBg(s: number)    { return s >= 80 ? '#DCFCE7' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/*  Inline exam  */

function InlineExam({
  exam, levelCode, examSummary,
}: {
  exam: LoadedExam;
  levelCode: string;
  examSummary: ExamSetSummary;
}) {
  const router         = useRouter();
  const audioRef       = useRef<HTMLAudioElement>(null);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [current, setCurrent]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(exam.timeLimit ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted]       = useState(false);
  const [navOpen, setNavOpen]       = useState(false);

  const skillInfo      = SKILLS.find(s => s.key === exam.skill);
  const answeredCount  = Object.keys(answers).length;
  const done           = (examSummary.progress?.attempts ?? 0) > 0;
  const bestScore      = examSummary.progress?.bestScore ?? null;

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examSetId: exam.id, answers }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/results/${data.sessionId}`);
      } else {
        alert(data.message || 'Có lỗi xảy ra, thử lại nhé!');
        setSubmitting(false);
      }
    } catch {
      alert('Mất kết nối. Kiểm tra mạng và thử lại.');
      setSubmitting(false);
    }
  }, [submitting, exam.id, answers, router]);

  useEffect(() => {
    if (!started || !exam.timeLimit) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, exam.timeLimit, handleSubmit]);

  // Reset state when exam changes
  useEffect(() => {
    setAnswers({});
    setCurrent(0);
    setTimeLeft(exam.timeLimit ?? 0);
    setStarted(false);
    setNavOpen(false);
    setSubmitting(false);
  }, [exam.id, exam.timeLimit]);

  function setAnswer(qId: string, val: string) {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }
  function goTo(idx: number) {
    setCurrent(Math.max(0, Math.min(exam.questions.length - 1, idx)));
    setNavOpen(false);
  }

  /*  Start screen  */
  if (!started) {
    const mcCount   = exam.questions.filter(q => q.type === 'tracnghiem').length;
    const fillCount = exam.questions.filter(q => q.type === 'dien_tu').length;
    const lisCount  = exam.questions.filter(q => q.audioUrl).length;

    return (
      <div className="flex flex-col items-center justify-center h-full py-10 px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <SkillIcon skill={exam.skill} size={30} />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                {levelCode}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {skillInfo?.icon} {skillInfo?.label ?? exam.skill}
              </span>
              {done && bestScore != null && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: scoreBg(bestScore), color: scoreColor(bestScore) }}>
                  Cao nhất: {bestScore.toFixed(0)}%
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-center mb-4 leading-snug"
              style={{ color: 'var(--text-base)' }}>
              {exam.title}
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Số câu', value: exam.questions.length, color: 'var(--primary)' },
                { label: 'Thời gian', value: exam.timeLimit ? `${Math.round(exam.timeLimit / 60)} phút` : '', color: '#D97706' },
                { label: 'Đã làm', value: `${examSummary.progress?.attempts ?? 0} lần`, color: '#059669' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-2.5 text-center"
                  style={{ background: 'var(--bg-muted)' }}>
                  <div className="font-bold text-sm mb-0.5" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {(mcCount > 0 || fillCount > 0 || lisCount > 0) && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {mcCount   > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#4338CA' }}> {mcCount} trắc nghiệm</span>}
                {fillCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#15803D' }}> {fillCount} điền từ</span>}
                {lisCount  > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF7ED', color: '#C2410C' }}> {lisCount} nghe</span>}
              </div>
            )}

            <div className="rounded-xl p-3 mb-5 text-xs leading-relaxed"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              {exam.timeLimit
                ? ` Bài thi có ${Math.round(exam.timeLimit / 60)} phút  sẽ tự nộp khi hết giờ.`
                : 'Không giới hạn thời gian. Nộp bài khi hoàn thành.'}
            </div>

            <button onClick={() => setStarted(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all"
              style={{ background: done ? '#059669' : 'var(--primary)' }}>
              <FaPlay size={13} />
              {done ? 'Làm lại bài thi' : 'Bắt đầu làm bài'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*  Exam view  */
  const q           = exam.questions[current];
  const timerRed    = !!exam.timeLimit && timeLeft < 60;
  const timerYellow = !!exam.timeLimit && timeLeft < 300 && !timerRed;

  return (
    <div className="flex flex-col h-full">
      {/* Mini sticky exam header */}
      <div className="sticky top-0 z-20 border-b px-4 py-2 flex items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold shrink-0"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {skillInfo?.icon} {skillInfo?.label}
          </span>
          <span className="text-xs font-semibold truncate hidden sm:block"
            style={{ color: 'var(--text-muted)' }}>
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <FaCircleCheck size={10} style={{ color: '#059669' }} />
            <strong style={{ color: 'var(--text-base)' }}>{answeredCount}</strong>/{exam.questions.length}
          </span>
          {exam.timeLimit && (
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
              style={timerRed ? { background: '#FEE2E2', color: '#DC2626' } : timerYellow ? { background: '#FEF3C7', color: '#D97706' } : { background: 'var(--bg-muted)', color: 'var(--text-base)' }}>
              <FaClock size={10} className="inline mr-1" />{formatDuration(timeLeft)}
            </span>
          )}
          <button onClick={() => setNavOpen(o => !o)}
            className="lg:hidden p-1.5 rounded-lg"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
            <FaMap size={11} />
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--primary)' }}>
            <FaCircleCheck size={10} />
            {submitting ? 'Nộp' : 'Nộp bài'}
          </button>
        </div>

        {/* Progress strip */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--bg-muted)' }}>
          <div className="h-0.5 transition-all duration-300"
            style={{ width: `${exam.questions.length > 0 ? (answeredCount / exam.questions.length) * 100 : 0}%`, background: 'var(--primary)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex gap-4 items-start">
          {/* Question card */}
          <div className="flex-1 min-w-0 card">
            {/* Q header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                  style={{ background: 'var(--primary)' }}>
                  {current + 1}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ {exam.questions.length}</span>
              </div>
              <div className="flex gap-1.5">
                {(q.type === 'nghe' || q.audioUrl) ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FFF7ED', color: '#C2410C' }}> Nghe</span>
                ) : q.type === 'dien_tu' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}> Điền từ</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#EEF2FF', color: '#4338CA' }}> Trắc nghiệm</span>
                )}
                {answers[q.id] && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}> Đã trả lời</span>
                )}
              </div>
            </div>

            {/* Audio */}
            {q.audioUrl && (
              <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: '#FFF7ED' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FED7AA', color: '#C2410C' }}>
                  <FaHeadphones size={14} />
                </div>
                <audio ref={audioRef} controls src={q.audioUrl} className="flex-1 h-8 min-w-0" />
              </div>
            )}

            {/* Image */}
            {q.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.imageUrl} alt="Hình câu hỏi" className="w-full max-h-56 object-contain" style={{ background: 'var(--bg-muted)' }} />
              </div>
            )}

            {/* Content */}
            <p className="text-base font-semibold leading-relaxed whitespace-pre-wrap mb-5"
              style={{ color: 'var(--text-base)' }}>
              {q.content}
            </p>

            {/* Options */}
            {(q.type === 'tracnghiem' || q.type === 'nghe') && q.options && (
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={i} onClick={() => setAnswer(q.id, opt)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all w-full"
                      style={selected
                        ? { borderColor: 'var(--primary)', background: 'var(--primary-light)' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                        style={selected ? { background: 'var(--primary)', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                        {LETTERS[i] ?? i + 1}
                      </span>
                      <span className="text-sm font-medium"
                        style={{ color: selected ? 'var(--primary)' : 'var(--text-base)' }}>
                        {opt}
                      </span>
                      {selected && <FaCircleCheck size={12} style={{ color: 'var(--primary)', marginLeft: 'auto', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill in */}
            {q.type === 'dien_tu' && (
              <input type="text" className="input w-full max-w-sm"
                placeholder="Nhập câu trả lời..."
                value={answers[q.id] ?? ''}
                onChange={e => setAnswer(q.id, e.target.value)} />
            )}

            {/* Prev/Next */}
            <div className="flex justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => goTo(current - 1)} disabled={current === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                <FaChevronLeft size={10} /> Trước
              </button>
              {current < exam.questions.length - 1 ? (
                <button onClick={() => goTo(current + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90"
                  style={{ background: 'var(--primary)' }}>
                  Tiếp <FaChevronRight size={10} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#059669' }}>
                  <FaCircleCheck size={12} />
                  {submitting ? 'Đang nộp' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>

          {/* Desktop navigator */}
          <div className="hidden lg:flex flex-col gap-2 w-44 shrink-0 sticky top-4">
            <div className="card p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}>
                Câu hỏi
              </div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {exam.questions.map((qItem, idx) => (
                  <button key={qItem.id} onClick={() => goTo(idx)}
                    title={`Câu ${idx + 1}`}
                    className="h-7 text-xs rounded-lg font-bold transition-all"
                    style={current === idx
                      ? { background: 'var(--primary)', color: '#fff' }
                      : answers[qItem.id]
                      ? { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                <span>Đã làm: <strong style={{ color: '#16A34A' }}>{answeredCount}</strong></span>
                <span>Còn: <strong style={{ color: '#DC2626' }}>{exam.questions.length - answeredCount}</strong></span>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                style={{ background: answeredCount === exam.questions.length ? '#059669' : 'var(--primary)' }}>
                <FaCircleCheck size={10} />
                {submitting ? 'Nộp' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setNavOpen(false)}>
          <div className="rounded-t-3xl p-5 pb-8" style={{ background: 'var(--bg-surface)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>Điều hướng câu hỏi</span>
              <button onClick={() => setNavOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                <FaXmark size={12} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {exam.questions.map((qItem, idx) => (
                <button key={qItem.id} onClick={() => goTo(idx)}
                  className="h-9 text-xs rounded-xl font-bold"
                  style={current === idx
                    ? { background: 'var(--primary)', color: '#fff' }
                    : answers[qItem.id]
                    ? { background: '#DCFCE7', color: '#16A34A' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  {idx + 1}
                </button>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'var(--primary)' }}>
              <FaCircleCheck size={13} />
              {submitting ? 'Đang nộp' : 'Nộp bài ngay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Main component  */

const LEVEL_COLOR: Record<string, string> = {
  N5: '#16A34A', N4: '#2563EB', N3: '#D97706', N2: '#EA580C', N1: '#DC2626',
  HSK1: '#16A34A', HSK2: '#2563EB', HSK3: '#D97706', HSK4: '#EA580C', HSK5: '#C026D3', HSK6: '#DC2626',
};

const SKILL_COLOR: Record<string, string> = {
  nghe: '#2563EB', doc: '#D97706', viet: '#7C3AED', noi: '#059669',
};

interface SkillWithData {
  key: string; icon: string; label: string;
  sets: ExamSetSummary[]; done: number; avgScore: number | null;
}

interface SidebarContentProps {
  lang: string;
  levelColor: string;
  levelCode: string;
  levelName: string;
  totalDone: number;
  totalSets: number;
  totalPct: number;
  activeSkill: string | null;
  setActiveSkill: React.Dispatch<React.SetStateAction<string | null>>;
  skillsWithData: SkillWithData[];
  filteredSkills: SkillWithData[];
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  isLoggedIn: boolean;
}

function SidebarContent({
  lang, levelColor, levelCode, levelName,
  totalDone, totalSets, totalPct,
  activeSkill, setActiveSkill,
  skillsWithData, filteredSkills,
  selectedId, setSelectedId,
  isLoggedIn,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col gap-0 p-4 pb-6">
      {/* Breadcrumb */}
      <a href={`/${lang}/levels`}
        className="inline-flex items-center gap-1.5 text-xs mb-5 hover:opacity-70 w-fit"
        style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={9} /> Tất cả cấp độ
      </a>

      {/* Level header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
          style={{ background: levelColor }}>
          {levelCode}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{levelName}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{totalDone}/{totalSets} đề đã làm</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] mb-1">
          <span style={{ color: 'var(--text-muted)' }}>Tiến độ</span>
          <span className="font-bold" style={{ color: levelColor }}>{totalPct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
          <div className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalPct}%`, background: levelColor }} />
        </div>
      </div>

      {/* Skill filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setActiveSkill(null)}
          className="text-xs px-2.5 py-1 rounded-xl font-semibold transition-all"
          style={activeSkill === null
            ? { background: levelColor, color: '#fff' }
            : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
          Tất cả
        </button>
        {skillsWithData.map(sk => (
          <button key={sk.key}
            onClick={() => setActiveSkill(prev => prev === sk.key ? null : sk.key)}
            className="text-xs px-2.5 py-1 rounded-xl font-semibold transition-all"
            style={activeSkill === sk.key
              ? { background: SKILL_COLOR[sk.key] ?? levelColor, color: '#fff' }
              : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
            {sk.icon} {sk.label}
          </button>
        ))}
      </div>

      {/* Exam list grouped by skill */}
      <div className="flex flex-col gap-5">
        {filteredSkills.map(sk => {
          const skillClr = SKILL_COLOR[sk.key] ?? levelColor;
          return (
            <div key={sk.key}>
              {/* Skill section header */}
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs"
                  style={{ background: `${skillClr}18`, color: skillClr }}>
                  {sk.icon}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{sk.label}</span>
                <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-lg"
                  style={{ background: `${skillClr}18`, color: skillClr }}>
                  {sk.done}/{sk.sets.length}
                </span>
              </div>

              {/* Exam rows */}
              <div className="flex flex-col gap-1">
                {sk.sets.map(s => {
                  const attempted = (s.progress?.attempts ?? 0) > 0;
                  const score     = s.progress?.bestScore;
                  const sel       = selectedId === s.id;
                  const mins      = s.timeLimit ? Math.round(s.timeLimit / 60) : null;

                  return (
                    <button key={s.id} onClick={() => setSelectedId(s.id)}
                      className="flex flex-col gap-1 px-3 py-2.5 rounded-xl text-left w-full transition-all border"
                      style={sel
                        ? { background: `${skillClr}12`, borderColor: skillClr, color: 'var(--text-primary)' }
                        : { background: 'transparent', borderColor: 'transparent', color: 'var(--text-primary)' }}>
                      {/* Title row */}
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-0.5"
                          style={{ background: attempted ? (score != null && score >= 60 ? '#16A34A' : '#D97706') : 'var(--border)' }} />
                        <span className="flex-1 text-xs font-semibold leading-snug line-clamp-1">{s.title}</span>
                        {attempted && score != null ? (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                            style={{ background: scoreBg(score), color: scoreColor(score) }}>
                            {score.toFixed(0)}%
                          </span>
                        ) : attempted ? (
                          <FaCheck size={9} style={{ color: '#16A34A', flexShrink: 0 }} />
                        ) : (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-lg font-medium"
                            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            Mới
                          </span>
                        )}
                      </div>
                      {/* Meta chips */}
                      <div className="flex items-center gap-2 pl-3.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>📝 {s.questionCount} câu</span>
                        {mins != null && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>⏱ {mins} phút</span>
                        )}
                        {s.progress?.attempts != null && s.progress.attempts > 0 && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>×{s.progress.attempts}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest CTA */}
      {!isLoggedIn && (
        <div className="mt-5 rounded-xl p-3 flex items-start gap-2"
          style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
          <FaLock size={11} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
          <div className="text-xs leading-relaxed" style={{ color: 'var(--primary)' }}>
            <a href="/auth/login" className="font-semibold underline">Đăng nhập</a> để lưu tiến trình & xem kết quả
          </div>
        </div>
      )}
    </div>
  );
}

export default function LevelDetailClient({ lang, level, examSets, isLoggedIn }: Props) {
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [loadedExam, setLoadedExam]         = useState<LoadedExam | null>(null);
  const [loadingExam, setLoadingExam]       = useState(false);
  const [activeSkill, setActiveSkill]       = useState<string | null>(null);

  const levelColor = LEVEL_COLOR[level.code] ?? 'var(--primary)';

  // Default selection: first unfinished exam
  useEffect(() => {
    if (examSets.length === 0) return;
    const unfinished = examSets.find(s => (s.progress?.attempts ?? 0) === 0);
    setSelectedId((unfinished ?? examSets[0]).id);
  }, [examSets]);

  // Fetch full exam when selection changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadedExam(null);
    setLoadingExam(true);
    fetch(`/api/exam/${selectedId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: LoadedExam | null) => {
        if (data && Array.isArray(data.questions)) {
          setLoadedExam({
            ...data,
            questions: data.questions.map(q => ({ ...q, options: parseOptions(q.options) })),
          });
        }
        setLoadingExam(false);
      })
      .catch(() => setLoadingExam(false));
  }, [selectedId]);

  const skillsWithData = useMemo(
    () =>
      SKILLS.map(skill => {
        const sets   = examSets.filter(s => s.skill === skill.key);
        const done   = sets.filter(s => (s.progress?.attempts ?? 0) > 0).length;
        const scored = sets.filter(s => s.progress?.bestScore != null);
        const avgScore = scored.length > 0
          ? scored.reduce((sum, s) => sum + (s.progress!.bestScore ?? 0), 0) / scored.length
          : null;
        return { ...skill, sets, done, avgScore };
      }).filter(sk => sk.sets.length > 0),
    [examSets],
  );

  const filteredSkills = activeSkill
    ? skillsWithData.filter(sk => sk.key === activeSkill)
    : skillsWithData;

  const totalDone = examSets.filter(s => (s.progress?.attempts ?? 0) > 0).length;
  const totalSets = examSets.length;
  const totalPct  = totalSets > 0 ? Math.round((totalDone / totalSets) * 100) : 0;
  const selectedSummary = examSets.find(s => s.id === selectedId) ?? null;

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg-base)' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r overflow-y-auto"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-surface)',
          position: 'sticky',
          top: '56px',
          height: 'calc(100vh - 64px)',
        }}>
        <SidebarContent
          lang={lang}
          levelColor={levelColor}
          levelCode={level.code}
          levelName={level.name}
          totalDone={totalDone}
          totalSets={totalSets}
          totalPct={totalPct}
          activeSkill={activeSkill}
          setActiveSkill={setActiveSkill}
          skillsWithData={skillsWithData}
          filteredSkills={filteredSkills}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          isLoggedIn={isLoggedIn}
        />
      </aside>

      {/* ── Mobile: horizontal pill tabs at top ── */}
      <div className="lg:hidden w-full flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="sticky top-0 z-10 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            <a href={`/${lang}/levels`}
              className="flex items-center gap-1 text-xs shrink-0 hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={10} />
              <span className="font-bold" style={{ color: levelColor }}>{level.code}</span>
            </a>
            <div className="flex-1 min-w-0 overflow-x-auto flex gap-1.5">
              {examSets.map(s => {
                const score = s.progress?.bestScore;
                const sel   = selectedId === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedId(s.id)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all"
                    style={sel
                      ? { background: levelColor, color: '#fff' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                    {s.title}
                    {score != null && (
                      <span style={sel ? { opacity: 0.85 } : { color: scoreColor(score) }}>
                        {score.toFixed(0)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loadingExam ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
                style={{ borderColor: levelColor, borderTopColor: 'transparent' }} />
            </div>
          ) : loadedExam && selectedSummary ? (
            <InlineExam exam={loadedExam} levelCode={level.code} examSummary={selectedSummary} />
          ) : (
            <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>
              Chọn một đề thi để bắt đầu
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop main content ── */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        {loadingExam ? (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-[3px] animate-spin"
                style={{ borderColor: levelColor, borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải đề thi…</p>
            </div>
          </div>
        ) : loadedExam && selectedSummary ? (
          <InlineExam
            key={loadedExam.id}
            exam={loadedExam}
            levelCode={level.code}
            examSummary={selectedSummary}
          />
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Chọn một đề thi từ danh sách bên trái
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}