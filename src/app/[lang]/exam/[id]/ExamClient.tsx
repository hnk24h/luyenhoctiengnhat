'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SKILLS, formatDuration } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import {
  FaHeadphones, FaCircleCheck, FaClock, FaPlay, FaChevronLeft,
  FaChevronRight, FaMap, FaXmark, FaPencil, FaFileLines,
} from 'react-icons/fa6';

interface Question {
  id: string;
  type: string;
  content: string;
  options: string[] | null;
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

interface Props {
  examSetId: string;
  title: string;
  skill: string;
  level: string;
  timeLimit: number | null;
  questions: Question[];
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ── Start screen ─────────────────────────────────────────────────────────────
function StartScreen({
  title, skill, level, questions, timeLimit, onStart,
}: {
  title: string; skill: string; level: string;
  questions: Question[]; timeLimit: number | null;
  onStart: () => void;
}) {
  const skillInfo = SKILLS.find(s => s.key === skill);
  const mcCount   = questions.filter(q => q.type === 'tracnghiem').length;
  const fillCount = questions.filter(q => q.type === 'dien_tu').length;
  const lisCount  = questions.filter(q => q.audioUrl).length;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg">
        {/* Skill icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <SkillIcon skill={skill} size={36} />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Cấp độ {level}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {skillInfo?.icon} {skillInfo?.label ?? skill}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-5 leading-snug"
          style={{ color: 'var(--text-base)' }}>
          {title}
        </h1>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Số câu', value: questions.length, color: 'var(--primary)' },
            { label: 'Thời gian', value: timeLimit ? `${Math.round(timeLimit / 60)} phút` : 'Không giới hạn', color: '#D97706' },
            { label: 'Kỹ năng', value: skillInfo?.label ?? skill, color: '#059669' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'var(--bg-muted)' }}>
              <div className="font-bold text-sm mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Question type breakdown */}
        {(mcCount > 0 || fillCount > 0 || lisCount > 0) && (
          <div className="flex gap-3 mb-6 flex-wrap justify-center">
            {mcCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: '#EEF2FF', color: '#4338CA' }}>
                📝 {mcCount} trắc nghiệm
              </span>
            )}
            {fillCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                style={{ background: '#F0FDF4', color: '#15803D' }}>
                <FaPencil size={10}/> {fillCount} điền từ
              </span>
            )}
            {lisCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                style={{ background: '#FFF7ED', color: '#C2410C' }}>
                <FaHeadphones size={10}/> {lisCount} nghe
              </span>
            )}
          </div>
        )}

        {/* Instruction */}
        <div className="rounded-2xl p-4 mb-6 text-sm leading-relaxed"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-base)' }}>Lưu ý: </span>
          {timeLimit
            ? `Bài thi có ${Math.round(timeLimit / 60)} phút. Bài sẽ tự nộp khi hết giờ.`
            : 'Không giới hạn thời gian. Nộp bài khi bạn hoàn thành.'}
          {' '}Sau khi bắt đầu, không thể tạm dừng.
        </div>

        <button onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <FaPlay size={14} /> Bắt đầu làm bài
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExamClient({ examSetId, title, skill, level, timeLimit, questions }: Props) {
  const router     = useRouter();
  const audioRef   = useRef<HTMLAudioElement>(null);
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [current, setCurrent]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted]   = useState(false);
  const [navOpen, setNavOpen]   = useState(false);

  const skillInfo    = SKILLS.find(s => s.key === skill);
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examSetId, answers }),
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
  }, [submitting, examSetId, answers, router]);

  useEffect(() => {
    if (!started || !timeLimit) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, timeLimit, handleSubmit]);

  function setAnswer(questionId: string, val: string) {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  }

  function goTo(idx: number) {
    setCurrent(Math.max(0, Math.min(questions.length - 1, idx)));
    setNavOpen(false);
  }

  if (!started) {
    return (
      <StartScreen
        title={title} skill={skill} level={level}
        questions={questions} timeLimit={timeLimit}
        onStart={() => setStarted(true)}
      />
    );
  }

  const q           = questions[current];
  const timerRed    = timeLimit && timeLeft < 60;
  const timerYellow = timeLimit && timeLeft < 300 && !timerRed;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Left: badge + title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm px-2 py-0.5 rounded-lg font-bold hidden sm:block shrink-0"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {level}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-base)' }}>
              {title}
            </span>
          </div>

          {/* Right: progress + timer + submit */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-muted)' }}>
              <FaCircleCheck size={11} style={{ color: '#059669' }} />
              <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{answeredCount}</span>
              /{questions.length}
            </div>

            {/* Timer */}
            {timeLimit ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-sm font-bold"
                style={timerRed
                  ? { background: '#FEE2E2', color: '#DC2626' }
                  : timerYellow
                  ? { background: '#FEF3C7', color: '#D97706' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-base)' }}>
                <FaClock size={12} />
                {formatDuration(timeLeft)}
              </div>
            ) : null}

            {/* Mobile nav toggle */}
            <button onClick={() => setNavOpen(o => !o)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              <FaMap size={11} />
            </button>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--primary)' }}>
              <FaCircleCheck size={12} />
              <span className="hidden sm:inline">{submitting ? 'Đang nộp…' : 'Nộp bài'}</span>
              <span className="sm:hidden">{submitting ? '…' : 'Nộp'}</span>
            </button>
          </div>
        </div>

        {/* Progress bar strip */}
        <div className="h-0.5" style={{ background: 'var(--bg-muted)' }}>
          <div className="h-0.5 transition-all duration-300"
            style={{
              width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
              background: 'var(--primary)',
            }} />
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-5 items-start">

        {/* Main question card */}
        <div className="flex-1 min-w-0">
          <div className="card">
            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                  style={{ background: 'var(--primary)' }}>
                  {current + 1}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  / {questions.length} câu
                </span>
              </div>
              <div className="flex items-center gap-2">
                {q.type === 'nghe' || q.audioUrl ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                    style={{ background: '#FFF7ED', color: '#C2410C' }}>
                    <FaHeadphones size={10}/> Nghe
                  </span>
                ) : q.type === 'dien_tu' ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                    style={{ background: '#F0FDF4', color: '#15803D' }}>
                    <FaPencil size={10}/> Điền từ
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                    style={{ background: '#EEF2FF', color: '#4338CA' }}>
                    <FaFileLines size={10}/> Trắc nghiệm
                  </span>
                )}
                {answers[q.id] && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    ✓ Đã trả lời
                  </span>
                )}
              </div>
            </div>

            {/* Audio player */}
            {q.audioUrl && (
              <div className="mb-5 p-4 rounded-2xl flex items-center gap-3"
                style={{ background: '#FFF7ED' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FED7AA', color: '#C2410C' }}>
                  <FaHeadphones size={16} />
                </div>
                <audio ref={audioRef} controls src={q.audioUrl} className="flex-1 h-8 min-w-0" />
              </div>
            )}

            {/* Image */}
            {q.imageUrl && (
              <div className="mb-5 rounded-2xl overflow-hidden border"
                style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.imageUrl} alt="Hình câu hỏi"
                  className="w-full max-h-64 object-contain"
                  style={{ background: 'var(--bg-muted)' }} />
              </div>
            )}

            {/* Question content */}
            <p className="text-base font-semibold leading-relaxed whitespace-pre-wrap mb-6"
              style={{ color: 'var(--text-base)' }}>
              {q.content}
            </p>

            {/* ── Multiple choice options (trắc nghiệm) ── */}
            {(q.type === 'tracnghiem' || q.type === 'nghe') && q.options && (
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt, i) => {
                  const letter   = LETTERS[i] ?? String(i + 1);
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={i} onClick={() => setAnswer(q.id, opt)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all w-full"
                      style={selected
                        ? { borderColor: 'var(--primary)', background: 'var(--primary-light)' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 transition-all"
                        style={selected
                          ? { background: 'var(--primary)', color: '#fff' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                        {letter}
                      </span>
                      <span className="text-sm font-medium flex-1 leading-snug"
                        style={{ color: selected ? 'var(--primary)' : 'var(--text-base)' }}>
                        {opt}
                      </span>
                      {selected && (
                        <FaCircleCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Fill in blank (điền từ) ── */}
            {q.type === 'dien_tu' && (
              <div>
                <input type="text"
                  className="input w-full max-w-sm text-base"
                  placeholder="Nhập câu trả lời..."
                  value={answers[q.id] ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                />
              </div>
            )}

            {/* ── Prev / Next ── */}
            <div className="flex justify-between mt-8 pt-5 border-t"
              style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => goTo(current - 1)} disabled={current === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-30"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                <FaChevronLeft size={11} /> Câu trước
              </button>

              {current < questions.length - 1 ? (
                <button onClick={() => goTo(current + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--primary)' }}>
                  Câu tiếp <FaChevronRight size={11} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#059669' }}>
                  <FaCircleCheck size={13} />
                  {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop question navigator ─────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-3 w-52 shrink-0 sticky top-[76px]">
          <div className="card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.13em] mb-3"
              style={{ color: 'var(--text-muted)' }}>
              Điều hướng câu hỏi
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3 text-[11px]">
              {[
                { bg: 'var(--primary)', label: 'Đang làm', textColor: '#fff' },
                { bg: '#DCFCE7', label: 'Đã trả lời', textColor: '#16A34A' },
                { bg: 'var(--bg-muted)', label: 'Chưa làm', textColor: 'var(--text-muted)' },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.bg }} />
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-1">
              {questions.map((qItem, idx) => {
                const isCurrent  = current === idx;
                const isAnswered = !!answers[qItem.id];
                return (
                  <button key={qItem.id} onClick={() => goTo(idx)}
                    title={`Câu ${idx + 1}`}
                    className="h-8 w-8 text-xs rounded-lg font-bold transition-all"
                    style={isCurrent
                      ? { background: 'var(--primary)', color: '#fff' }
                      : isAnswered
                      ? { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t flex justify-between text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span>Đã làm: <strong style={{ color: '#16A34A' }}>{answeredCount}</strong></span>
              <span>Còn: <strong style={{ color: '#DC2626' }}>{questions.length - answeredCount}</strong></span>
            </div>

            {/* Submit from nav */}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: answeredCount === questions.length ? '#059669' : 'var(--primary)' }}>
              <FaCircleCheck size={12} />
              {submitting ? 'Đang nộp…' : 'Nộp bài'}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Mobile question navigator overlay ─────────────────── */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setNavOpen(false)}>
          <div className="rounded-t-3xl p-5 pb-8"
            style={{ background: 'var(--bg-surface)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
                Điều hướng câu hỏi
              </div>
              <button onClick={() => setNavOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                <FaXmark size={12} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {questions.map((qItem, idx) => {
                const isCurrent  = current === idx;
                const isAnswered = !!answers[qItem.id];
                return (
                  <button key={qItem.id} onClick={() => goTo(idx)}
                    className="h-9 text-xs rounded-xl font-bold transition-all"
                    style={isCurrent
                      ? { background: 'var(--primary)', color: '#fff' }
                      : isAnswered
                      ? { background: '#DCFCE7', color: '#16A34A' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs mb-4"
              style={{ color: 'var(--text-muted)' }}>
              <span>Đã làm: <strong style={{ color: '#16A34A' }}>{answeredCount}</strong> / {questions.length}</span>
              <span>Chưa làm: <strong style={{ color: '#DC2626' }}>{questions.length - answeredCount}</strong></span>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold text-white"
              style={{ background: 'var(--primary)' }}>
              <FaCircleCheck size={14} />
              {submitting ? 'Đang nộp…' : 'Nộp bài ngay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

