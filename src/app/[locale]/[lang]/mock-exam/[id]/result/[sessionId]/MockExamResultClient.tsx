'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaCircleCheck, FaCircleXmark, FaClock, FaLayerGroup,
  FaChartBar, FaBookOpen, FaBook, FaHeadphones,
  FaClipboardList, FaChevronDown, FaChevronUp, FaGraduationCap,
  FaRotate, FaArrowLeft,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionResult {
  id: string;
  content: string;
  options: string[] | null;
  correctAnswer: string;
  explain: string | null;
  partLabel: string | null;
  userAnswer: string | null;
  isCorrect: boolean;
}

interface SectionStat {
  id: string;
  title: string;
  titleVi: string | null;
  skill: string;
  total: number;
  correct: number;
  score: number;
  timeUsed: number;
  questions: QuestionResult[];
}

interface Props {
  exam: { id: string; title: string; subject: string; levelCode: string; totalTime: number };
  session: { id: string; score: number; correctQ: number; totalQ: number; startedAt: string; finishedAt: string | null };
  sectionStats: SectionStat[];
  lang: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5', grammar_reading: '#059669', listening: '#D97706',
  reading: '#0891B2', integrated: '#7C3AED',
};

const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={14} />, grammar_reading: <FaBook size={14} />,
  listening: <FaHeadphones size={14} />, reading: <FaBook size={14} />,
  integrated: <FaLayerGroup size={14} />,
};

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getGrade(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Xuất sắc', color: '#059669', bg: '#DCFCE7' };
  if (score >= 70) return { label: 'Tốt', color: '#2563EB', bg: '#DBEAFE' };
  if (score >= 50) return { label: 'Trung bình', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Cần cải thiện', color: '#DC2626', bg: '#FEE2E2' };
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MockExamResultClient({ exam, session, sectionStats, lang }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const grade = getGrade(session.score);
  const totalTime = session.finishedAt
    ? Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href={`/${lang}/mock-exam`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}>
          <FaArrowLeft size={10} /> Danh sách đề thi
        </Link>

        {/* ── Score hero ─────────────────────────────────────────── */}
        <div className="card text-center mb-6">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: grade.bg, color: grade.color }}>
            <FaGraduationCap size={24} />
          </div>
          <div className="text-[11px] px-3 py-1 rounded-full font-bold inline-block mb-2"
            style={{ background: grade.bg, color: grade.color }}>
            {grade.label}
          </div>
          <div className="text-4xl font-extrabold mb-1" style={{ color: grade.color }}>
            {session.score}%
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            {session.correctQ}/{session.totalQ} câu đúng · {exam.subject} {exam.levelCode}
          </div>
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{exam.title}</div>
          {totalTime > 0 && (
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Thời gian: {formatTime(totalTime)} / {formatTime(exam.totalTime)}
            </div>
          )}
        </div>

        {/* ── Section breakdown ──────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Kết quả từng phần</h2>
          <div className="space-y-3">
            {sectionStats.map((sec, i) => {
              const isExpanded = expandedSection === sec.id;
              const secGrade = getGrade(sec.score);
              return (
                <div key={sec.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  {/* Section header */}
                  <button onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                    className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.02]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: (SKILL_COLOR[sec.skill] ?? '#4F46E5') + '15', color: SKILL_COLOR[sec.skill] ?? '#4F46E5' }}>
                      {SKILL_ICON[sec.skill] ?? <FaClipboardList size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        Phần {i + 1}: {sec.titleVi ?? sec.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <FaCircleCheck size={8} style={{ color: '#059669' }} /> {sec.correct}/{sec.total}
                        </span>
                        {sec.timeUsed > 0 && (
                          <span className="flex items-center gap-1">
                            <FaClock size={8} /> {formatTime(sec.timeUsed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold" style={{ color: secGrade.color }}>{sec.score}%</span>
                      {isExpanded ? <FaChevronUp size={10} style={{ color: 'var(--text-muted)' }} /> : <FaChevronDown size={10} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </button>

                  {/* Expanded: question details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                      {sec.questions.map((q, qi) => (
                        <div key={q.id} className="rounded-xl p-3" style={{ background: 'var(--bg-muted)' }}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                              style={q.isCorrect
                                ? { background: '#DCFCE7', color: '#16A34A' }
                                : q.userAnswer
                                ? { background: '#FEE2E2', color: '#DC2626' }
                                : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                              {qi + 1}
                            </span>
                            <p className="text-xs font-medium leading-relaxed flex-1" style={{ color: 'var(--text-base)' }}>
                              {q.content}
                            </p>
                          </div>

                          {/* Options with correct/wrong highlights */}
                          {Array.isArray(q.options) && (
                            <div className="ml-7 flex flex-col gap-1">
                              {q.options.map((opt, oi) => {
                                const letter = LETTERS[oi] ?? String(oi + 1);
                                const isCorrect = opt === q.correctAnswer;
                                const isUserPick = opt === q.userAnswer;
                                return (
                                  <div key={oi} className="flex items-center gap-2 text-[11px] py-0.5 px-2 rounded-lg"
                                    style={{
                                      background: isCorrect ? '#DCFCE720' : isUserPick && !q.isCorrect ? '#FEE2E220' : 'transparent',
                                      fontWeight: isCorrect || isUserPick ? 600 : 400,
                                      color: isCorrect ? '#16A34A' : isUserPick && !q.isCorrect ? '#DC2626' : 'var(--text-secondary)',
                                    }}>
                                    <span className="font-bold">{letter}.</span>
                                    <span>{opt}</span>
                                    {isCorrect && <FaCircleCheck size={9} className="ml-auto" style={{ color: '#16A34A' }} />}
                                    {isUserPick && !isCorrect && <FaCircleXmark size={9} className="ml-auto" style={{ color: '#DC2626' }} />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.explain && (
                            <div className="ml-7 mt-2 text-[10px] p-2 rounded-lg leading-relaxed"
                              style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                              <span className="font-semibold">Giải thích: </span>{q.explain}
                            </div>
                          )}

                          {!q.userAnswer && (
                            <div className="ml-7 mt-1 text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                              Chưa trả lời
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Link href={`/${lang}/mock-exam/${exam.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <FaRotate size={12} /> Thi lại
          </Link>
          <Link href={`/${lang}/mock-exam`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
            <FaClipboardList size={12} /> Đề thi khác
          </Link>
        </div>
      </div>
    </div>
  );
}
