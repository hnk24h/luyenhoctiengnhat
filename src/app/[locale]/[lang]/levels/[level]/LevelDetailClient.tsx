'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SKILLS, formatDuration } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import { AudioPlayer } from '@/components/AudioPlayer';
import {
  FaArrowLeft, FaClock, FaCheck, FaPlay,
  FaListCheck, FaTrophy, FaCircleCheck,
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
  locale: string;
  lang: string;
  level: { code: string; name: string; description: string | null };
  examSets: ExamSetSummary[];
  isLoggedIn: boolean;
}

/*  Helpers  */

function scoreColor(s: number) { return s >= 80 ? '#16A34A' : s >= 60 ? '#D97706' : '#DC2626'; }
function scoreBg(s: number)    { return s >= 80 ? '#DCFCE7' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/*  Real exam session (thi thật)  */

function RealExamSession({
  exam, levelCode, onClose,
}: {
  exam: LoadedExam;
  levelCode: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft]     = useState(exam.timeLimit ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const qRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const answeredCount = Object.keys(answers).length;
  const timerRed    = !!exam.timeLimit && timeLeft < 60;
  const timerYellow = !!exam.timeLimit && timeLeft < 300 && !timerRed;

  function setAnswer(qId: string, val: string) {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }

  function scrollToQ(idx: number) {
    const id = exam.questions[idx]?.id;
    if (id && qRefs.current[id]) {
      qRefs.current[id]!.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
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
    if (!exam.timeLimit) return;
    if (timeLeft <= 0) { void handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, exam.timeLimit, handleSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 shrink-0"
        style={{ background: 'var(--bg-surface)', boxShadow: '0 1px 0 var(--border)' }}>
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
          <FaXmark size={10} /> Thoát
        </button>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {levelCode} · 🎯 Thi thật
          </div>
          <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {exam.title}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {answeredCount}/{exam.questions.length}
          </span>
          {exam.timeLimit ? (
            <span className="font-mono text-sm font-bold px-3 py-1.5 rounded-xl min-w-[76px] text-center"
              style={timerRed
                ? { background: '#FEE2E2', color: '#DC2626' }
                : timerYellow
                ? { background: '#FEF3C7', color: '#D97706' }
                : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
              <FaClock size={10} className="inline mr-1" />{formatDuration(timeLeft)}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              Không giới hạn
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 shrink-0" style={{ background: 'var(--bg-muted)' }}>
        <div className="h-0.5 transition-all duration-300"
          style={{ width: `${exam.questions.length > 0 ? (answeredCount / exam.questions.length) * 100 : 0}%`, background: 'var(--primary)' }} />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Questions scroll area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {exam.questions.map((q, idx) => {
              const sel = answers[q.id];
              const rqColor = (q.type === 'nghe' || q.type === 'nghe_audio' || !!q.audioUrl) ? '#C2410C' : q.type === 'dien_tu' ? '#15803D' : '#4338CA';
              const rqColorLight = (q.type === 'nghe' || q.type === 'nghe_audio' || !!q.audioUrl) ? '#FFF7ED' : q.type === 'dien_tu' ? '#F0FDF4' : '#EEF2FF';
              return (
                <div key={q.id}
                  ref={(el) => { qRefs.current[q.id] = el; }}
                  className="card overflow-hidden" style={{ scrollMarginTop: '16px', borderTop: `3px solid ${rqColor}` }}>
                  {/* Q header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white shrink-0 transition-colors"
                      style={{ background: sel ? '#059669' : rqColor }}>
                      {idx + 1}
                    </span>
                    {(q.type === 'nghe' || q.type === 'nghe_audio' || q.audioUrl) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FFF7ED', color: '#C2410C' }}>🎧 Nghe</span>
                    ) : q.type === 'dien_tu' ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>✏️ Điền từ</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#EEF2FF', color: '#4338CA' }}>Trắc nghiệm</span>
                    )}
                    {sel && <FaCircleCheck size={12} className="ml-auto" style={{ color: '#059669' }} />}
                  </div>

                  {/* Audio */}
                  {q.audioUrl && (
                    <div className="mb-4">
                      <AudioPlayer src={q.audioUrl} />
                    </div>
                  )}

                  {/* Image */}
                  {q.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={q.imageUrl} alt="Hình câu hỏi" className="w-full max-h-56 object-contain"
                        style={{ background: 'var(--bg-muted)' }} />
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-[16px] font-medium leading-[1.85] whitespace-pre-wrap mb-5"
                    style={{ color: 'var(--text-primary)' }}>
                    {q.content}
                  </p>

                  {/* Options */}
                  {(q.type === 'tracnghiem' || q.type === 'nghe' || q.type === 'nghe_audio') && q.options && (
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, i) => {
                        const optSel = answers[q.id] === opt;
                        return (
                          <button key={i} onClick={() => setAnswer(q.id, opt)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full"
                            style={{
                              transition: 'all 180ms cubic-bezier(.4,0,.2,1)',
                              borderLeft: `3px solid ${optSel ? rqColor : 'transparent'}`,
                              transform: optSel ? 'scale(1.005)' : 'scale(1)',
                              background: optSel ? rqColorLight : 'var(--bg-surface)',
                              boxShadow: optSel
                                ? `0 2px 10px ${rqColor}22, 0 0 0 1.5px ${rqColor}`
                                : '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                            }}>
                            <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 transition-all"
                              style={optSel
                                ? { background: rqColor, color: '#fff', boxShadow: `0 3px 8px ${rqColor}40` }
                                : { background: '#F1F5F9', color: '#64748B' }}>
                              {LETTERS[i] ?? i + 1}
                            </span>
                            <span className="text-sm font-medium flex-1 leading-relaxed"
                              style={{ color: optSel ? rqColor : 'var(--text-primary)' }}>
                              {opt}
                            </span>
                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                              style={optSel
                                ? { background: rqColor, opacity: 1 }
                                : { background: 'transparent', opacity: 0 }}>
                              <FaCheck size={9} style={{ color: '#fff' }} />
                            </span>
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
                </div>
              );
            })}

            {/* End card – submit */}
            <div className="card flex flex-col items-center py-7 gap-3 mb-8">
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Đã trả lời{' '}
                <strong style={{ fontSize: '17px', color: answeredCount === exam.questions.length ? '#059669' : 'var(--text-primary)' }}>
                  {answeredCount}
                </strong>
                {' '}/ {exam.questions.length} câu
              </div>
              {answeredCount < exam.questions.length && (
                <div className="text-xs" style={{ color: '#DC2626' }}>
                  Còn {exam.questions.length - answeredCount} câu chưa trả lời
                </div>
              )}
              <button onClick={() => setShowConfirm(true)} disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity mt-1"
                style={{ background: answeredCount === exam.questions.length ? '#059669' : '#1E293B' }}>
                <FaCircleCheck size={14} />
                {submitting ? 'Đang nộp…' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>

        {/* Answer sheet – right sticky panel */}
        <div className="hidden lg:flex flex-col w-56 shrink-0 overflow-y-auto py-5 px-4 border-l"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-secondary)' }}>
            Phiếu trả lời
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {exam.questions.map((qItem, idx) => (
              <button key={qItem.id} onClick={() => scrollToQ(idx)}
                title={`Câu ${idx + 1}`}
                className="h-8 text-xs rounded-lg font-bold transition-all hover:opacity-80"
                style={answers[qItem.id]
                  ? { background: '#DCFCE7', color: '#16A34A' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }} />
              <span style={{ color: 'var(--text-muted)' }}>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: 'var(--bg-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Chưa ({exam.questions.length - answeredCount})</span>
            </div>
          </div>
          <div className="pt-3 mt-auto border-t" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setShowConfirm(true)} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: answeredCount === exam.questions.length ? '#059669' : '#1E293B' }}>
              <FaCircleCheck size={12} />
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowConfirm(false)}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Xác nhận nộp bài?
            </div>
            <div className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {answeredCount < exam.questions.length
                ? `Còn ${exam.questions.length - answeredCount} câu chưa có đáp án. Sau khi nộp không thể sửa thêm.`
                : `Bạn đã hoàn thành tất cả ${exam.questions.length} câu. Sau khi nộp không thể sửa thêm.`}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                Tiếp tục làm
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{ background: '#059669' }}>
                {submitting ? 'Đang nộp…' : 'Nộp ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Inline exam  */

function InlineExam({
  exam, levelCode, examSummary,
}: {
  exam: LoadedExam;
  levelCode: string;
  examSummary: ExamSetSummary;
}) {
  const router         = useRouter();
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [current, setCurrent]       = useState(0);
  const [timeLeft, setTimeLeft]     = useState(exam.timeLimit ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted]       = useState(false);
  const [realMode, setRealMode]     = useState(false);
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
    setRealMode(false);
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

            <div className="flex flex-col gap-2.5">
              <button onClick={() => setStarted(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all"
                style={{ background: done ? '#059669' : 'var(--primary)' }}>
                <FaPlay size={13} />
                {done ? 'Luyện tập lại' : 'Luyện tập'}
              </button>
              <button onClick={() => { setRealMode(true); setStarted(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all"
                style={{ background: '#1E293B' }}>
                🎯 Thi thật
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*  Real exam mode  */
  if (realMode) {
    return (
      <RealExamSession
        exam={exam}
        levelCode={levelCode}
        onClose={() => { setStarted(false); setRealMode(false); }}
      />
    );
  }

  /*  Exam view  */
  const q           = exam.questions[current];
  const timerRed    = !!exam.timeLimit && timeLeft < 60;
  const timerYellow = !!exam.timeLimit && timeLeft < 300 && !timerRed;
  const qColor      = (q.type === 'nghe' || q.type === 'nghe_audio' || !!q.audioUrl) ? '#C2410C' : q.type === 'dien_tu' ? '#15803D' : '#4338CA';
  const qColorLight = (q.type === 'nghe' || q.type === 'nghe_audio' || !!q.audioUrl) ? '#FFF7ED' : q.type === 'dien_tu' ? '#F0FDF4' : '#EEF2FF';

  return (
    <div className="flex flex-col h-full">
      {/* Mini sticky exam header */}
      <div className="sticky top-0 z-20 px-5 py-3 flex items-center justify-between gap-3"
        style={{ background: 'var(--bg-surface)', boxShadow: '0 1px 0 var(--border), 0 4px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
            {skillInfo?.icon} {skillInfo?.label}
          </span>
          <span className="text-sm font-medium truncate hidden sm:block"
            style={{ color: 'var(--text-primary)' }}>
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <FaCircleCheck size={10} style={{ color: '#059669' }} />
            <span><strong className="text-sm" style={{ color: 'var(--text-primary)' }}>{answeredCount}</strong>/{exam.questions.length}</span>
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
        </div>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 items-start p-4 lg:py-6 lg:pl-6 lg:pr-4">
          {/* Question card */}
          <div className="flex-1 min-w-0 card overflow-hidden" style={{ borderTop: `3px solid ${qColor}` }}>
            {/* Q header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                  style={{ background: qColor }}>
                  {current + 1}
                </span>
                <div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Câu</span>
                  <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>/ {exam.questions.length}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(q.type === 'nghe' || q.type === 'nghe_audio' || q.audioUrl) ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#FFF7ED', color: '#C2410C' }}>🎧 Nghe</span>
                ) : q.type === 'dien_tu' ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D' }}>✏️ Điền từ</span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#EEF2FF', color: '#4338CA' }}>Trắc nghiệm</span>
                )}
              </div>
            </div>

            {/* Audio */}
            {q.audioUrl && (
              <div className="mb-4">
                <AudioPlayer src={q.audioUrl} />
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
            <p className="text-[17px] font-medium leading-[1.85] whitespace-pre-wrap mb-6"
              style={{ color: 'var(--text-primary)' }}>
              {q.content}
            </p>

            {/* Options */}
            {(q.type === 'tracnghiem' || q.type === 'nghe' || q.type === 'nghe_audio') && q.options && (
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={i} onClick={() => setAnswer(q.id, opt)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left w-full"
                      style={{
                        transition: 'all 180ms cubic-bezier(.4,0,.2,1)',
                        borderLeft: `4px solid ${selected ? qColor : 'transparent'}`,
                        transform: selected ? 'scale(1.01)' : 'scale(1)',
                        background: selected ? qColorLight : 'var(--bg-surface)',
                        boxShadow: selected
                          ? `0 2px 12px ${qColor}22, 0 0 0 1.5px ${qColor}`
                          : '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
                      }}>
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 transition-all"
                        style={selected
                          ? { background: qColor, color: '#fff', boxShadow: `0 4px 10px ${qColor}40` }
                          : { background: '#F1F5F9', color: '#64748B' }}>
                        {LETTERS[i] ?? i + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 text-left leading-relaxed"
                        style={{ color: selected ? qColor : 'var(--text-primary)' }}>
                        {opt}
                      </span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={selected
                          ? { background: qColor, opacity: 1 }
                          : { background: 'var(--bg-muted)', opacity: 0 }}>
                        <FaCheck size={9} style={{ color: '#fff' }} />
                      </span>
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
            <div className="flex justify-between items-center mt-8 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => goTo(current - 1)} disabled={current === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-25 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}>
                <FaChevronLeft size={10} /> Trước
              </button>
              {current < exam.questions.length - 1 ? (
                <button onClick={() => goTo(current + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--primary)' }}>
                  Tiếp <FaChevronRight size={10} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{ background: '#059669' }}>
                  <FaCircleCheck size={12} />
                  {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              )}
            </div>
          </div>

          {/* Desktop navigator */}
          <div className="hidden lg:flex flex-col gap-2 w-52 shrink-0 sticky top-5">
            <div className="card p-4 overflow-hidden">
              {/* Circular progress ring */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                    <circle cx={36} cy={36} r={28} fill="none" stroke="var(--bg-muted)" strokeWidth={6} />
                    <circle cx={36} cy={36} r={28} fill="none"
                      stroke={answeredCount === exam.questions.length ? '#059669' : answeredCount > 0 ? qColor : 'var(--bg-muted)'}
                      strokeWidth={6} strokeLinecap="round"
                      strokeDasharray={`${exam.questions.length > 0 ? (answeredCount / exam.questions.length) * 175.9 : 0} 175.9`}
                      style={{ transition: 'stroke-dasharray 400ms ease, stroke 400ms ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold leading-none"
                      style={{ color: answeredCount === exam.questions.length ? '#059669' : 'var(--text-primary)' }}>
                      {answeredCount}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>/{exam.questions.length}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-[11px]">
                  <span className="flex items-center gap-1" style={{ color: '#16A34A' }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#16A34A' }} />
                    Đã làm
                  </span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#CBD5E1' }} />
                    Còn lại
                  </span>
                </div>
              </div>
              {/* Question grid */}
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {exam.questions.map((qItem, idx) => (
                  <button key={qItem.id} onClick={() => goTo(idx)}
                    title={`Câu ${idx + 1}`}
                    className="h-8 text-xs rounded-lg font-bold transition-all"
                    style={current === idx
                      ? { background: qColor, color: '#fff', boxShadow: `0 2px 8px ${qColor}40` }
                      : answers[qItem.id]
                      ? { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: answeredCount === exam.questions.length
                      ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                    boxShadow: answeredCount === exam.questions.length
                      ? '0 4px 14px rgba(5,150,105,0.35)' : 'none',
                  }}>
                  <FaCircleCheck size={13} />
                  {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              </div>
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
  PMP: '#3D3A8C',
};

const SKILL_META: Record<string, { color: string; bg: string }> = {
  nghe:    { color: '#2563EB', bg: '#EFF6FF' },
  doc:     { color: '#D97706', bg: '#FFFBEB' },
  viet:    { color: '#7C3AED', bg: '#F5F3FF' },
  noi:     { color: '#059669', bg: '#F0FDF4' },
  vocab:   { color: '#DC2626', bg: '#FFF1F2' },
  grammar: { color: '#0891B2', bg: '#ECFEFF' },
};


export default function LevelDetailClient({ locale, lang, level, examSets, isLoggedIn }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadedExam, setLoadedExam] = useState<LoadedExam | null>(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const levelColor = LEVEL_COLOR[level.code] ?? 'var(--primary)';

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

  const filteredSets = activeSkill
    ? examSets.filter(s => s.skill === activeSkill)
    : examSets;

  const totalDone = examSets.filter(s => (s.progress?.attempts ?? 0) > 0).length;
  const totalSets = examSets.length;
  const totalPct  = totalSets > 0 ? Math.round((totalDone / totalSets) * 100) : 0;
  const selectedSummary = examSets.find(s => s.id === selectedId) ?? null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)', background: 'var(--bg-base)' }}>

      {/* ══ MOBILE-ONLY TOP BAR (desktop: sidebar handles everything) ══ */}
      <div className="lg:hidden shrink-0 border-b px-4 flex items-center gap-2.5 h-10"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <a href={`/${locale}/${lang}/levels`}
          className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity shrink-0"
          style={{ color: 'var(--text-secondary)' }}>
          <FaArrowLeft size={11} /> Cấp độ
        </a>
        <FaChevronRight size={8} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
        <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white"
          style={{ background: levelColor }}>
          {level.code}
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: levelColor, color: '#fff' }}
          onClick={() => setSidebarOpen(v => !v)}>
          <FaListCheck size={11} /> Đề thi
        </button>
      </div>

      {/* ══ SECTIONS 2+3: SIDEBAR + CENTER ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SECTION 2: LEFT SIDEBAR (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>
          <SidebarContent
            locale={locale}
            lang={lang}
            level={level} levelColor={levelColor}
            totalDone={totalDone} totalSets={totalSets} totalPct={totalPct}
            skillsWithData={skillsWithData} filteredSets={filteredSets}
            activeSkill={activeSkill} setActiveSkill={setActiveSkill}
            selectedId={selectedId} setSelectedId={setSelectedId}
            setSidebarOpen={setSidebarOpen} isLoggedIn={isLoggedIn}
          />
        </aside>

        {/* Mobile sidebar drawer (slide in from right) */}
        {sidebarOpen && (
          <aside className="lg:hidden fixed right-0 top-0 bottom-0 z-40 flex flex-col w-80 shadow-2xl"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}>
            <SidebarContent
              locale={locale}
              lang={lang}
              level={level} levelColor={levelColor}
              totalDone={totalDone} totalSets={totalSets} totalPct={totalPct}
              skillsWithData={skillsWithData} filteredSets={filteredSets}
              activeSkill={activeSkill} setActiveSkill={setActiveSkill}
              selectedId={selectedId}
              setSelectedId={(id) => { setSelectedId(id); setSidebarOpen(false); }}
              setSidebarOpen={setSidebarOpen} isLoggedIn={isLoggedIn}
            />
          </aside>
        )}

        {/* ── SECTION 3: CENTER / EXAM AREA ── */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
          {!selectedId ? (
            /* ── Level overview screen ── */
            <div className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-full">

              {/* Gradient header */}
              <div className="relative overflow-hidden px-6 pt-7 pb-6"
                style={{ background: `linear-gradient(135deg, ${levelColor} 0%, ${levelColor}BB 100%)` }}>
                {/* Faint decorative code */}
                <span className="absolute right-5 top-2 select-none pointer-events-none font-black"
                  style={{ fontSize: 96, color: 'rgba(255,255,255,0.07)', lineHeight: 1 }}>
                  {level.code}
                </span>

                <div className="relative z-10 flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-base font-black text-white"
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)' }}>
                        {level.code}
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-white leading-tight">{level.name}</h2>
                        {level.description && (
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {level.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white"
                        style={{ background: 'rgba(255,255,255,0.18)' }}>
                        {totalSets} đề thi
                      </span>
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white"
                        style={{ background: 'rgba(255,255,255,0.18)' }}>
                        {skillsWithData.length} kỹ năng
                      </span>
                      {isLoggedIn && totalDone > 0 && (
                        <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background: 'rgba(255,255,255,0.95)', color: levelColor }}>
                          {totalDone}/{totalSets} hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress ring (logged in only) */}
                  {isLoggedIn && (
                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                      <svg width="72" height="72" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="34" fill="none" strokeWidth="6"
                          stroke="rgba(255,255,255,0.25)" />
                        <circle cx="44" cy="44" r="34" fill="none" strokeWidth="6"
                          stroke="white"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - totalPct / 100)}
                          strokeLinecap="round" transform="rotate(-90 44 44)"
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                        <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
                          fill="white" fontSize="15" fontWeight="800">{totalPct}%</text>
                      </svg>
                      <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        tiến độ
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {isLoggedIn && totalSets > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${totalPct}%`, background: 'white' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Skills grid */}
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)' }}>Kỹ năng luyện thi</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skillsWithData.map(sk => {
                    const sm  = SKILL_META[sk.key];
                    const pct = sk.sets.length > 0
                      ? Math.round((sk.done / sk.sets.length) * 100) : 0;
                    return (
                      <button key={sk.key}
                        onClick={() => setActiveSkill(sk.key)}
                        className="text-left flex items-start gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.99]"
                        style={{
                          background: sm?.bg ?? 'var(--bg-muted)',
                          border: `1.5px solid ${sm?.color ?? levelColor}2E`,
                          boxShadow: `0 2px 8px ${sm?.color ?? levelColor}14`,
                        }}>
                        <span className="text-2xl shrink-0 mt-0.5">{sk.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold" style={{ color: sm?.color ?? levelColor }}>
                              {sk.label}
                            </span>
                            <span className="text-xs font-bold tabular-nums"
                              style={{ color: sm?.color ?? levelColor }}>
                              {sk.done}/{sk.sets.length}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'rgba(0,0,0,0.08)' }}>
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: sm?.color ?? levelColor }} />
                          </div>
                          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                            {sk.sets.length} đề · Nhấn để xem
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Start CTA */}
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    Chọn một đề thi từ danh sách bên trái hoặc nhấn vào kỹ năng bên trên để lọc đề.
                  </p>
                  {skillsWithData.length > 0 && (
                    <button
                      onClick={() => {
                        const first = skillsWithData[0].sets[0];
                        if (first) setSelectedId(first.id);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                      style={{ background: levelColor, boxShadow: `0 4px 14px ${levelColor}55` }}>
                      <FaPlay size={11} /> Bắt đầu luyện thi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : loadingExam ? (
            <div className="flex items-center justify-center py-32">
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
            <div className="flex items-center justify-center py-32 text-sm"
              style={{ color: 'var(--text-muted)' }}>
              Không tải được đề thi
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar content (shared: desktop aside + mobile drawer) ── */
interface SidebarProps {
  locale: string;
  lang: string;
  level: { code: string; name: string; description: string | null };
  levelColor: string;
  totalDone: number;
  totalSets: number;
  totalPct: number;
  skillsWithData: {
    key: string; icon: string; label: string;
    sets: ExamSetSummary[]; done: number; avgScore: number | null;
  }[];
  filteredSets: ExamSetSummary[];
  activeSkill: string | null;
  setActiveSkill: (skill: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  isLoggedIn: boolean;
}

function SidebarContent({
  locale, lang, level, levelColor, totalDone, totalSets, totalPct,
  skillsWithData, filteredSets, activeSkill, setActiveSkill,
  selectedId, setSelectedId, setSidebarOpen, isLoggedIn,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sidebar header with gradient */}
      <div className="shrink-0 px-5 pt-4 pb-4 relative"
        style={{ background: `linear-gradient(135deg, ${levelColor} 0%, ${levelColor}CC 100%)` }}>
        {/* Desktop back link */}
        <a href={`/${locale}/${lang}/levels`}
          className="hidden lg:flex items-center gap-1 mb-3 text-xs font-semibold w-fit hover:opacity-100 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.65)' }}>
          <FaArrowLeft size={9} /> Cấp độ
        </a>
        {/* Mobile close button */}
        <button className="lg:hidden absolute top-3 right-3 text-white opacity-80 hover:opacity-100"
          onClick={() => setSidebarOpen(false)}>
          <FaXmark size={16} />
        </button>
        <div className="flex items-center justify-between gap-3 pr-6 lg:pr-0">
          <div className="min-w-0">
            <div className="text-white font-extrabold text-xl leading-none">{level.code}</div>
            <div className="text-white text-xs opacity-80 mt-1 line-clamp-1">{level.name}</div>
          </div>
          {/* Circular progress ring */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
              <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={5} />
              <circle cx={28} cy={28} r={22} fill="none" stroke="#fff" strokeWidth={5}
                strokeDasharray={`${(totalPct / 100) * 138.2} 138.2`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-extrabold text-sm leading-none">{totalPct}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {totalDone}/{totalSets} đề hoàn thành
        </div>
      </div>

      {/* Skill filter chips */}
      <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ boxShadow: '0 1px 0 var(--border)' }}>
        <button
          onClick={() => setActiveSkill(null)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={activeSkill === null
            ? { background: levelColor, color: '#fff' }
            : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
          Tất cả
        </button>
        {skillsWithData.map(sk => {
          const sm = SKILL_META[sk.key];
          const isActive = activeSkill === sk.key;
          return (
            <button key={sk.key}
              onClick={() => setActiveSkill(isActive ? null : sk.key)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={isActive
                ? { background: sm?.color ?? levelColor, color: '#fff' }
                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              {sk.icon}
              <span className="opacity-70">({sk.sets.length})</span>
            </button>
          );
        })}
      </div>

      {/* Exam list */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredSets.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <div className="text-3xl">📭</div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có đề thi</p>
          </div>
        ) : (
          filteredSets.map(s => {
            const sm        = SKILL_META[s.skill];
            const skillInfo = SKILLS.find(sk => sk.key === s.skill);
            const attempted = (s.progress?.attempts ?? 0) > 0;
            const score     = s.progress?.bestScore;
            const mins      = s.timeLimit ? Math.round(s.timeLimit / 60) : null;
            const isSelected = selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="w-full text-left transition-all"
                style={{
                  background: isSelected ? (sm?.bg ?? 'var(--primary-light)') : 'transparent',
                  borderLeft: `3px solid ${isSelected ? (sm?.color ?? levelColor) : 'transparent'}`,
                  padding: isSelected ? '12px 16px 12px 13px' : '12px 16px',
                }}>
                  <div className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 text-sm">{skillInfo?.icon ?? '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: isSelected ? (sm?.color ?? levelColor) : 'var(--text-primary)' }}>
                      {s.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {s.questionCount} câu{mins != null ? ` · ${mins} phút` : ''}
                      </span>
                      {attempted && score != null && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: scoreBg(score), color: scoreColor(score) }}>
                          {score.toFixed(0)}%
                        </span>
                      )}
                      {attempted && score == null && (
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                          style={{ background: '#DCFCE7', color: '#16A34A' }}>✓ Xong</span>
                      )}
                      {!attempted && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>Mới</span>
                      )}
                    </div>
                    {attempted && score != null && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                        <div className="h-1 rounded-full transition-all duration-500"
                          style={{ width: `${score}%`, background: scoreColor(score) }} />
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <FaChevronRight size={9} className="shrink-0 mt-1"
                      style={{ color: sm?.color ?? levelColor }} />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Guest login CTA */}
      {!isLoggedIn && (
        <div className="shrink-0 m-3 rounded-xl p-4"
          style={{ background: 'var(--primary-light)', boxShadow: '0 0 0 1px var(--primary)33' }}>
          <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--primary)' }}>
            Đăng nhập để lưu tiến trình
          </p>
          <a href="/auth/login"
            className="block text-center py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ background: 'var(--primary)' }}>
            Đăng nhập
          </a>
        </div>
      )}
    </div>
  );
}