'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaCircleCheck, FaCircleXmark, FaClock, FaLayerGroup,
  FaChartBar, FaBookOpen, FaBook, FaHeadphones,
  FaClipboardList, FaChevronDown, FaChevronUp, FaGraduationCap,
  FaRotate, FaArrowLeft, FaHouse, FaChevronRight, FaTrophy,
  FaCalendarDays, FaFire, FaLightbulb, FaArrowTrendUp,
  FaCircleExclamation, FaCircleInfo,
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

interface HistoryItem {
  id: string;
  score: number;
  correctQ: number;
  totalQ: number;
  finishedAt: string;
  isCurrent: boolean;
}

interface Props {
  exam: { id: string; title: string; subject: string; levelCode: string; totalTime: number };
  session: { id: string; score: number; correctQ: number; totalQ: number; startedAt: string; finishedAt: string | null };
  sectionStats: SectionStat[];
  history: HistoryItem[];
  locale: string;
  lang: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5', grammar_reading: '#059669', listening: '#D97706',
  reading: '#0891B2', integrated: '#7C3AED',
};

const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={13} />, grammar_reading: <FaBook size={13} />,
  listening: <FaHeadphones size={13} />, reading: <FaBook size={13} />,
  integrated: <FaLayerGroup size={13} />,
};

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getGrade(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Xuất sắc', color: '#059669', bg: '#DCFCE7' };
  if (score >= 70) return { label: 'Tốt', color: '#2563EB', bg: '#DBEAFE' };
  if (score >= 50) return { label: 'Trung bình', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Cần cải thiện', color: '#DC2626', bg: '#FEE2E2' };
}

// Radial progress ring
function ScoreRing({ score, color, size = 100 }: { score: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ─── Skill-specific improvement tips ─────────────────────────────────────────

const SKILL_TIP: Record<string, { short: string; detail: string }> = {
  vocab: {
    short: 'Từ vựng yếu',
    detail: 'Học từ vựng qua SRS flashcard mỗi ngày — ưu tiên nhóm từ hay xuất hiện trong bài thi.',
  },
  grammar_reading: {
    short: 'Ngữ pháp & đọc hiểu',
    detail: 'Ôn lại các mẫu câu theo cấu trúc, luyện điền chỗ trống và đọc văn bản ngắn hằng ngày.',
  },
  listening: {
    short: 'Kỹ năng nghe',
    detail: 'Nghe audio JLPT mỗi ngày, chú ý tốc độ nói và luyện ghi chú từ khóa khi nghe.',
  },
  reading: {
    short: 'Đọc hiểu',
    detail: 'Luyện đọc đoạn văn dài, xác định ý chính và các từ khóa — tăng tốc độ đọc dần dần.',
  },
  integrated: {
    short: 'Kỹ năng tổng hợp',
    detail: 'Luyện đề thi thử toàn bộ thường xuyên để quen với áp lực thời gian và format tổng thể.',
  },
};

interface ImprovementTip {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

function getImprovementTips(
  sectionStats: SectionStat[],
  session: { score: number; correctQ: number; totalQ: number; startedAt: string; finishedAt: string | null },
  exam: { totalTime: number },
): ImprovementTip[] {
  const tips: ImprovementTip[] = [];

  // 1. Weakest section
  const sorted = [...sectionStats].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  if (weakest && weakest.score < 80) {
    const skillTip = SKILL_TIP[weakest.skill];
    const severity = weakest.score < 50;
    tips.push({
      icon: severity ? <FaCircleExclamation size={11} /> : <FaArrowTrendUp size={11} />,
      title: skillTip?.short ?? (weakest.titleVi ?? weakest.title),
      desc: skillTip?.detail ?? `Phần này chỉ đạt ${weakest.score}% — cần ôn lại kỹ hơn.`,
      color: severity ? '#DC2626' : '#D97706',
      bg: severity ? '#FEE2E2' : '#FEF3C7',
    });
  }

  // 2. Second weakest (different skill from weakest)
  const second = sorted.find(s => s.id !== weakest?.id && s.score < 75);
  if (second) {
    const skillTip = SKILL_TIP[second.skill];
    tips.push({
      icon: <FaArrowTrendUp size={11} />,
      title: skillTip?.short ?? (second.titleVi ?? second.title),
      desc: skillTip?.detail ?? `Điểm phần này còn ${second.score}% — tập trung ôn thêm.`,
      color: '#D97706',
      bg: '#FEF3C7',
    });
  }

  // 3. Unanswered questions
  const skipped = sectionStats.reduce((n, s) => n + s.questions.filter(q => !q.userAnswer).length, 0);
  if (skipped > 0) {
    tips.push({
      icon: <FaCircleInfo size={11} />,
      title: `Còn ${skipped} câu bỏ trống`,
      desc: 'Trong thi thật, đoán đáp án cũng tốt hơn bỏ trống — hãy luôn chọn phương án dù chưa chắc.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    });
  }

  // 4. Time management — used > 90% of allowed time
  if (session.finishedAt) {
    const usedSec = Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000);
    const allowedSec = exam.totalTime * 60;
    if (allowedSec > 0 && usedSec / allowedSec > 0.9 && tips.length < 3) {
      tips.push({
        icon: <FaClock size={11} />,
        title: 'Quản lý thời gian',
        desc: 'Bạn dùng hơn 90% thời gian — luyện làm nhanh hơn ở phần bạn tự tin để dành thời gian cho phần khó.',
        color: '#0891B2',
        bg: '#E0F2FE',
      });
    }
  }

  // 5. Fallback: overall score low
  if (tips.length === 0 && session.score < 70) {
    tips.push({
      icon: <FaCircleExclamation size={11} />,
      title: 'Chưa đạt ngưỡng đỗ',
      desc: 'Cần đạt 70% để qua — hãy ôn tập đều đặn và thi lại sau khi ôn kỹ các phần yếu.',
      color: '#DC2626',
      bg: '#FEE2E2',
    });
  }

  // Clamp to 3
  return tips.slice(0, 3);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MockExamResultClient({ exam, session, sectionStats, history, locale, lang }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const grade = getGrade(session.score);
  const improvementTips = getImprovementTips(sectionStats, session, exam);
  const totalTime = session.finishedAt
    ? Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
    : 0;

  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : session.score;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length * 10) / 10
    : session.score;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 'var(--page-max-w)', margin: '0 auto', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Breadcrumb card */}
        <div className="card" style={{ padding: '10px 16px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <Link href={`/${locale}/${lang}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--primary)] transition-colors">
              <FaHouse size={10} /> Trang chủ
            </Link>
            <FaChevronRight size={8} />
            <Link href={`/${locale}/${lang}/mock-exam`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--primary)] transition-colors">
              Đề thi thử
            </Link>
            <FaChevronRight size={8} />
            <Link href={`/${locale}/${lang}/mock-exam/${exam.id}`}
              style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit', textDecoration: 'none' }}
              className="hover:text-[var(--primary)] transition-colors">
              {exam.title}
            </Link>
            <FaChevronRight size={8} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Kết quả</span>
          </nav>
        </div>

        {/* Main 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── Left column ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score hero */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${grade.color}15 0%, ${grade.bg}80 100%)`, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ScoreRing score={session.score} color={grade.color} size={100} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{session.score}%</span>
                    <span style={{ fontSize: 9, color: grade.color, fontWeight: 600, marginTop: 1 }}>{grade.label}</span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontWeight: 700, background: 'var(--primary)', color: '#fff', fontSize: 10 }}>
                      {exam.subject} {exam.levelCode}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: grade.bg, color: grade.color, fontSize: 10 }}>
                      {grade.label}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
                    {exam.title}
                  </h1>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[
                      { label: 'Đúng', value: `${session.correctQ}/${session.totalQ}`, color: '#059669', bg: '#DCFCE7' },
                      { label: 'Thời gian', value: totalTime > 0 ? formatTime(totalTime) : '--', color: '#D97706', bg: '#FEF3C7' },
                      { label: 'Cần đạt', value: '70%', color: session.score >= 70 ? '#059669' : '#DC2626', bg: session.score >= 70 ? '#DCFCE7' : '#FEE2E2' },
                    ].map(s => (
                      <div key={s.label} style={{ borderRadius: 10, padding: '8px 10px', background: s.bg, textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 9, color: s.color, opacity: 0.8, marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div style={{ padding: '12px 20px', display: 'flex', gap: 10 }}>
              <Link href={`/${locale}/${lang}/mock-exam/${exam.id}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--primary)', textDecoration: 'none' }}>
                <FaRotate size={11} /> Thi lại
              </Link>
              <Link href={`/${locale}/${lang}/mock-exam`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-muted)', textDecoration: 'none' }}>
                <FaClipboardList size={11} /> Đề khác
              </Link>
            </div>
          </div>

          {/* Section breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <FaChartBar size={13} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Chi tiết từng phần</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sectionStats.map((sec, i) => {
                const isExpanded = expandedSection === sec.id;
                const secGrade = getGrade(sec.score);
                const skillColor = SKILL_COLOR[sec.skill] ?? '#4F46E5';
                return (
                  <div key={sec.id} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                    <button onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover:bg-black/[0.02]">
                      {/* Part score ring */}
                      <div style={{ position: 'relative', flexShrink: 0, width: 44, height: 44 }}>
                        <ScoreRing score={sec.score} color={skillColor} size={44} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: skillColor }}>
                          {sec.score}%
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: skillColor + '15', color: skillColor }}>
                            {SKILL_ICON[sec.skill] ?? <FaClipboardList size={11} />}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Phần {i + 1}: {sec.titleVi ?? sec.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FaCircleCheck size={8} style={{ color: '#059669' }} /> {sec.correct}/{sec.total} câu đúng
                          </span>
                          {sec.timeUsed > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FaClock size={8} /> {formatTime(sec.timeUsed)}
                            </span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: skillColor, width: `${sec.score}%`, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: secGrade.color }}>{sec.score}%</span>
                        {isExpanded ? <FaChevronUp size={9} style={{ color: 'var(--text-muted)' }} /> : <FaChevronDown size={9} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>

                    {/* Expanded questions */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                          {sec.questions.map((q, qi) => (
                            <div key={q.id} style={{ borderRadius: 10, padding: '10px 12px', background: 'var(--bg-muted)' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                <span style={{
                                  width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 9, fontWeight: 700, flexShrink: 0,
                                  background: q.isCorrect ? '#DCFCE7' : q.userAnswer ? '#FEE2E2' : 'var(--bg-base)',
                                  color: q.isCorrect ? '#16A34A' : q.userAnswer ? '#DC2626' : 'var(--text-muted)',
                                }}>
                                  {qi + 1}
                                </span>
                                <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.6, color: 'var(--text-base)', flex: 1, margin: 0 }}>
                                  {q.partLabel && <span style={{ fontSize: 9, fontWeight: 700, color: skillColor, marginRight: 4 }}>[{q.partLabel}]</span>}
                                  {q.content}
                                </p>
                              </div>

                              {Array.isArray(q.options) && (
                                <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {q.options.map((opt, oi) => {
                                    const letter = LETTERS[oi] ?? String(oi + 1);
                                    const isCorrect = opt === q.correctAnswer;
                                    const isUserPick = opt === q.userAnswer;
                                    return (
                                      <div key={oi} style={{
                                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 6px', borderRadius: 6,
                                        background: isCorrect ? '#DCFCE730' : isUserPick && !q.isCorrect ? '#FEE2E230' : 'transparent',
                                        fontWeight: isCorrect || isUserPick ? 600 : 400,
                                        color: isCorrect ? '#16A34A' : isUserPick && !q.isCorrect ? '#DC2626' : 'var(--text-secondary)',
                                      }}>
                                        <span style={{ fontWeight: 700, minWidth: 14 }}>{letter}.</span>
                                        <span style={{ flex: 1 }}>{opt}</span>
                                        {isCorrect && <FaCircleCheck size={9} style={{ color: '#16A34A', flexShrink: 0 }} />}
                                        {isUserPick && !isCorrect && <FaCircleXmark size={9} style={{ color: '#DC2626', flexShrink: 0 }} />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {q.explain && (
                                <div style={{ marginLeft: 28, marginTop: 6, padding: '6px 10px', borderRadius: 8, fontSize: 10, lineHeight: 1.6, background: '#EFF6FF', color: '#1D4ED8' }}>
                                  <span style={{ fontWeight: 700 }}>💡 </span>{q.explain}
                                </div>
                              )}

                              {!q.userAnswer && (
                                <div style={{ marginLeft: 28, marginTop: 4, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
                                  — Chưa trả lời
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>

          {/* Overall progress panel */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <FaChartBar size={12} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Tiến độ lần này</span>
            </div>

            {/* Per-section accuracy bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sectionStats.map((sec, i) => {
                const skillColor = SKILL_COLOR[sec.skill] ?? '#4F46E5';
                return (
                  <div key={sec.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: skillColor, display: 'flex', alignItems: 'center' }}>
                          {SKILL_ICON[sec.skill] ?? <FaClipboardList size={11} />}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          P{i + 1}. {sec.titleVi?.split(' ')[0] ?? sec.skill}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: skillColor }}>
                        {sec.correct}/{sec.total}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: skillColor, width: `${sec.score}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 14 }}>
              {[
                { label: 'Tốt nhất', value: `${bestScore}%`, icon: <FaTrophy size={10} />, color: '#D97706' },
                { label: 'Trung bình', value: `${avgScore}%`, icon: <FaChartBar size={10} />, color: '#4F46E5' },
                { label: 'Số lần thi', value: history.length, icon: <FaFire size={10} />, color: '#DC2626' },
                { label: 'Thời gian', value: totalTime > 0 ? formatTime(totalTime) : '--', icon: <FaClock size={10} />, color: '#059669' },
              ].map(s => (
                <div key={s.label} style={{ borderRadius: 9, padding: '8px 10px', background: 'var(--bg-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2, color: s.color }}>
                    {s.icon}
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement tips panel */}
          {improvementTips.length > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <FaLightbulb size={12} style={{ color: '#D97706' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Điểm cần cải thiện</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {improvementTips.map((tip, i) => (
                  <div key={i} style={{
                    borderRadius: 10,
                    padding: '9px 11px',
                    background: tip.bg,
                    borderLeft: `3px solid ${tip.color}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, color: tip.color }}>
                      {tip.icon}
                      <span style={{ fontSize: 11, fontWeight: 700, color: tip.color }}>{tip.title}</span>
                    </div>
                    <p style={{ fontSize: 10, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History panel */}
          {history.length > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <FaCalendarDays size={12} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Lịch sử làm bài</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  {history.length} lần
                </span>
              </div>

              {/* Trend sparkline */}
              {history.length >= 2 && (() => {
                const sorted = [...history].reverse(); // oldest first
                const maxS = 100;
                const h = 36;
                const w = 240;
                const pts = sorted.map((item, i) => ({
                  x: (i / (sorted.length - 1)) * w,
                  y: h - (item.score / maxS) * h,
                }));
                const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                const fillPath = `${path} L${w},${h} L0,${h} Z`;
                const latestGrade = getGrade(sorted[sorted.length - 1].score);
                return (
                  <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-muted)' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Xu hướng điểm</div>
                    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 36, display: 'block' }}>
                      <path d={fillPath} fill={latestGrade.color + '18'} />
                      <path d={path} fill="none" stroke={latestGrade.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={sorted[i].isCurrent ? 3.5 : 2}
                          fill={sorted[i].isCurrent ? latestGrade.color : 'var(--bg-surface)'}
                          stroke={latestGrade.color} strokeWidth={1.5} />
                      ))}
                    </svg>
                  </div>
                );
              })()}

              {/* History list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {history.map((item, idx) => {
                  const hGrade = getGrade(item.score);
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 9,
                      background: item.isCurrent ? hGrade.bg : 'var(--bg-muted)',
                      border: item.isCurrent ? `1px solid ${hGrade.color}40` : '1px solid transparent',
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', minWidth: 14 }}>
                        #{idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {formatDate(item.finishedAt)}
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(0,0,0,0.08)', marginTop: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: hGrade.color, width: `${item.score}%` }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: hGrade.color }}>{item.score}%</span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{item.correctQ}/{item.totalQ}</span>
                      </div>
                      {item.isCurrent && (
                        <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: hGrade.color, color: '#fff', flexShrink: 0 }}>
                          MỚI
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
