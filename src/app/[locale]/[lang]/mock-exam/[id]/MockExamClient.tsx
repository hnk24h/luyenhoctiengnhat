'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FaPlay, FaClock, FaCircleCheck, FaMap, FaHeadphones,
  FaBookOpen, FaBook, FaLayerGroup, FaClipboardList, FaXmark,
  FaArrowRight, FaGraduationCap,
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
  const totalMin = Math.round(exam.totalTime / 60);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Gradient header */}
          <div style={{ padding: '20px 24px 18px', background: 'linear-gradient(135deg, var(--primary) 0%, #5B5EA6 100%)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <FaGraduationCap size={26} style={{ color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, fontWeight: 700, background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                {exam.subject} {exam.levelCode}
              </span>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                Đề thi thử đầy đủ
              </span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>{exam.title}</h1>
            {exam.description && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6, marginBottom: 0 }}>{exam.description}</p>
            )}
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Tổng câu', value: totalQ, color: '#4F46E5' },
                { label: 'Thời gian', value: `${totalMin}p`, color: '#D97706' },
                { label: 'Số phần', value: exam.sections.length, color: '#059669' },
              ].map(s => (
                <div key={s.label} style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', background: 'var(--bg-muted)' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Section breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {exam.sections.map((sec, i) => (
                <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-muted)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: (SKILL_COLOR[sec.skill] ?? '#4F46E5') + '18', color: SKILL_COLOR[sec.skill] ?? '#4F46E5' }}>
                    {SKILL_ICON[sec.skill] ?? <FaClipboardList size={12} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Phần {i + 1}: {sec.titleVi ?? sec.title}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {sec.questions.length}Q · {Math.round(sec.timeLimit / 60)}p
                  </span>
                </div>
              ))}
            </div>

            {/* Notice */}
            <div style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, lineHeight: 1.6, background: '#FEF3C7', color: '#92400E' }}>
              <strong>Lưu ý:</strong> Mỗi phần có giới hạn thời gian riêng. Hết giờ sẽ tự chuyển sang phần tiếp theo.
              Không thể quay lại phần đã hoàn thành.
            </div>

            <button onClick={onStart}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 800, color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer' }}>
              <FaPlay size={13} /> Bắt đầu thi thử
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Transition ───────────────────────────────────────────────────────

function SectionTransition({
  section, sectionIndex, totalSections, answeredInSection, onContinue,
}: {
  section: MockSection; sectionIndex: number; totalSections: number;
  answeredInSection: number; onContinue: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '0 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, textAlign: 'center', padding: '28px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DCFCE7' }}>
          <FaCircleCheck size={26} style={{ color: '#16A34A' }} />
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Hoàn thành phần {sectionIndex}!
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Đã trả lời {answeredInSection} câu
        </p>
        {sectionIndex < totalSections && section && (
          <>
            <div style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 16, background: 'var(--bg-muted)', textAlign: 'left' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Phần tiếp theo:</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{section.titleVi ?? section.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                {section.questions.length} câu · {Math.round(section.timeLimit / 60)} phút
              </div>
            </div>
            <button onClick={onContinue}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer' }}>
              Bắt đầu phần tiếp <FaArrowRight size={11} />
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
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const lang = (params?.lang as string) ?? 'ja';

  const [started, setStarted] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [sectionTransition, setSectionTransition] = useState(false);

  const section = exam.sections[currentSectionIdx];
  const questions = section?.questions ?? [];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = exam.sections.reduce((a, s) => a + s.questions.length, 0);

  const sectionAnswered = useMemo(() => {
    if (!section) return 0;
    return section.questions.filter(qq => answers[qq.id]).length;
  }, [section, answers]);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionStartRef = useRef<number>(0);

  // Group questions by partLabel
  const partGroups = useMemo(() => {
    type Group = {
      label: string; title: string | null;
      passage: string | null; passageAudio: string | null; passageImage: string | null;
      items: { q: MockQuestion; idx: number }[];
    };
    const groups: Group[] = [];
    let lastLabel = '';
    for (let i = 0; i < questions.length; i++) {
      const pl = questions[i].partLabel ?? '';
      if (pl !== lastLabel) {
        groups.push({ label: pl, title: questions[i].partTitle, passage: questions[i].passageText, passageAudio: questions[i].passageAudio, passageImage: questions[i].passageImage, items: [{ q: questions[i], idx: i }] });
        lastLabel = pl;
      } else {
        groups[groups.length - 1].items.push({ q: questions[i], idx: i });
      }
    }
    return groups;
  }, [questions]);

  // Reset on section change
  useEffect(() => {
    if (!started || sectionTransition || !section) return;
    setTimeLeft(section.timeLimit);
    questionRefs.current = {};
    setActiveQIdx(0);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [started, currentSectionIdx, sectionTransition, section]);

  // Timer countdown
  useEffect(() => {
    if (!started || sectionTransition || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleNextSection(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, sectionTransition, currentSectionIdx]);

  useEffect(() => {
    if (started && !sectionTransition && section) sectionStartRef.current = Date.now();
  }, [started, sectionTransition, section]);

  // IntersectionObserver for active question tracking
  useEffect(() => {
    if (!started || sectionTransition) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b);
          setActiveQIdx(parseInt(topmost.target.getAttribute('data-q-idx') ?? '0', 10));
        }
      },
      { root: container, rootMargin: '-20% 0px -40% 0px', threshold: 0.1 }
    );
    Object.values(questionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [started, sectionTransition, questions]);

  function recordSectionTime() {
    if (!section) return;
    const elapsed = Math.round((Date.now() - sectionStartRef.current) / 1000);
    setSectionTimes(prev => ({ ...prev, [section.id]: (prev[section.id] ?? 0) + elapsed }));
  }

  function handleNextSection() {
    recordSectionTime();
    if (currentSectionIdx + 1 >= exam.sections.length) { handleSubmit(); return; }
    setSectionTransition(true);
  }

  function startNextSection() {
    setCurrentSectionIdx(i => i + 1);
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
        router.push(`/${locale}/${lang}/mock-exam/${exam.id}/result/${data.sessionId}`);
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

  function scrollToQuestion(idx: number) {
    const qId = questions[idx]?.id;
    if (!qId) return;
    const el = questionRefs.current[qId];
    const container = scrollContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollBy({ top: elRect.top - containerRect.top - 80, behavior: 'smooth' });
    }
    setActiveQIdx(idx);
    setNavOpen(false);
  }

  // ── Pre-start screens ──────────────────────────────────────────────────────
  if (!started) return <StartScreen exam={exam} onStart={() => setStarted(true)} />;

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

  if (!section) return null;

  const skillColor = SKILL_COLOR[section.skill] ?? '#4F46E5';
  const timerRed = timeLeft < 60;
  const timerYellow = timeLeft < 300 && !timerRed;

  // ── Exam: fixed full-screen, no page scroll ────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header style={{ flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 7, fontWeight: 800, background: 'var(--primary)', color: '#fff', flexShrink: 0 }}>
              {exam.levelCode}
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: skillColor + '18', color: skillColor }}>
              {SKILL_ICON[section.skill] ?? <FaClipboardList size={12} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {section.titleVi ?? section.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Phần {currentSectionIdx + 1}/{exam.sections.length} · {sectionAnswered}/{questions.length} câu · Tổng {totalAnswered}/{totalQuestions}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8,
              fontFamily: 'monospace', fontSize: 14, fontWeight: 800, transition: 'all 0.3s',
              background: timerRed ? '#FEE2E2' : timerYellow ? '#FEF3C7' : 'var(--bg-muted)',
              color: timerRed ? '#DC2626' : timerYellow ? '#D97706' : 'var(--text-base)',
            }}>
              <FaClock size={11} />
              {formatDuration(timeLeft)}
            </div>

            <button onClick={() => setNavOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
              className="lg:hidden">
              <FaMap size={12} />
            </button>

            {currentSectionIdx + 1 >= exam.sections.length ? (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--primary)', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                <FaCircleCheck size={10} />
                {submitting ? 'Đang nộp…' : 'Nộp bài'}
              </button>
            ) : (
              <button onClick={handleNextSection}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', background: skillColor, border: 'none', cursor: 'pointer' }}>
                Phần tiếp <FaArrowRight size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Multi-section progress bar: full-width */}
        <div style={{ height: 3, display: 'flex' }}>
          {exam.sections.map((sec, i) => {
            const secAns = sec.questions.filter(qq => answers[qq.id]).length;
            const pct = sec.questions.length > 0 ? (secAns / sec.questions.length) * 100 : 0;
            return (
              <div key={sec.id} style={{ flex: 1, background: 'var(--bg-muted)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`,
                  background: i === currentSectionIdx ? (SKILL_COLOR[sec.skill] ?? 'var(--primary)') : '#94A3B8',
                  opacity: i < currentSectionIdx ? 0.5 : 1, transition: 'width 0.3s',
                }} />
              </div>
            );
          })}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Questions scroll area */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {partGroups.map((group, gIdx) => (
              <div key={`${group.label}-${gIdx}`} style={{ marginTop: gIdx > 0 ? 36 : 0 }}>

                {/* Part header: full-width accent bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  borderRadius: 12, marginBottom: 16, background: skillColor + '0e',
                  borderLeft: `4px solid ${skillColor}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {group.label && (
                      <span style={{ fontSize: 13, fontWeight: 800, color: skillColor }}>{group.label}</span>
                    )}
                    {group.title && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: group.label ? 8 : 0 }}>{group.title}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {group.items.length} câu
                  </span>
                </div>

                {/* Shared passage */}
                {group.passage && (
                  <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 12, fontSize: 13, lineHeight: 1.85, whiteSpace: 'pre-wrap', background: 'var(--bg-muted)', color: 'var(--text-base)' }}>
                    {group.passage}
                  </div>
                )}
                {group.passageAudio && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, background: '#FFF7ED' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FED7AA', color: '#C2410C', flexShrink: 0 }}>
                      <FaHeadphones size={13} />
                    </div>
                    <audio controls src={group.passageAudio} style={{ flex: 1, height: 32 }} />
                  </div>
                )}

                {/* Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.items.map(({ q, idx }) => {
                    const isAnswered = !!answers[q.id];
                    const isActive = activeQIdx === idx;
                    return (
                      <div
                        key={q.id}
                        ref={el => { questionRefs.current[q.id] = el; }}
                        data-q-idx={String(idx)}
                        style={{
                          borderRadius: 14, padding: '16px 18px',
                          background: 'var(--bg-surface)',
                          border: `1.5px solid ${isActive ? skillColor : isAnswered ? skillColor + '40' : 'var(--border)'}`,
                          boxShadow: isActive ? `0 0 0 3px ${skillColor}12` : 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                      >
                        {/* Number badge + status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, flexShrink: 0,
                            background: isAnswered ? '#DCFCE7' : skillColor,
                            color: isAnswered ? '#16A34A' : '#fff',
                          }}>
                            {idx + 1}
                          </span>
                          {isAnswered && (
                            <span style={{ fontSize: 10, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                              <FaCircleCheck size={9} /> Đã trả lời
                            </span>
                          )}
                        </div>

                        {/* Per-question audio */}
                        {q.audioUrl && !group.passageAudio && (
                          <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, background: '#FFF7ED' }}>
                            <div style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FED7AA', color: '#C2410C', flexShrink: 0 }}>
                              <FaHeadphones size={11} />
                            </div>
                            <audio controls src={q.audioUrl} style={{ flex: 1, height: 28 }} />
                          </div>
                        )}

                        {/* Image */}
                        {q.imageUrl && (
                          <div style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={q.imageUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', background: 'var(--bg-muted)' }} />
                          </div>
                        )}

                        {/* Per-question passage (different from part passage) */}
                        {q.passageText && q.passageText !== group.passage && (
                          <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap', background: 'var(--bg-muted)', color: 'var(--text-base)' }}>
                            {q.passageText}
                          </div>
                        )}

                        {/* Content */}
                        <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.75, color: 'var(--text-base)', marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                          {q.content}
                        </p>

                        {/* Options */}
                        {Array.isArray(q.options) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {q.options.map((opt, i) => {
                              const letter = LETTERS[i] ?? String(i + 1);
                              const selected = answers[q.id] === opt;
                              return (
                                <button key={i} onClick={() => setAnswer(q.id, opt)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10,
                                    border: `1.5px solid ${selected ? skillColor : 'var(--border)'}`,
                                    background: selected ? skillColor + '0f' : 'var(--bg-base)',
                                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                                  }}>
                                  <span style={{
                                    width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 800, flexShrink: 0, transition: 'all 0.15s',
                                    background: selected ? skillColor : 'var(--bg-muted)',
                                    color: selected ? '#fff' : 'var(--text-muted)',
                                  }}>
                                    {letter}
                                  </span>
                                  <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, flex: 1, lineHeight: 1.5, color: selected ? skillColor : 'var(--text-base)' }}>
                                    {opt}
                                  </span>
                                  {selected && <FaCircleCheck size={11} style={{ color: skillColor, flexShrink: 0 }} />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Text input fallback */}
                        {!q.options && (
                          <input type="text" className="input"
                            placeholder="Nhập câu trả lời..."
                            style={{ maxWidth: 340, fontSize: 13 }}
                            value={answers[q.id] ?? ''}
                            onChange={e => setAnswer(q.id, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Section end action */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {sectionAnswered}/{questions.length} câu đã trả lời
              </span>
              {currentSectionIdx + 1 >= exam.sections.length ? (
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--primary)', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  <FaCircleCheck size={12} /> {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              ) : (
                <button onClick={handleNextSection}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: skillColor, border: 'none', cursor: 'pointer' }}>
                  Kết thúc phần → Sang phần tiếp <FaArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Navigator sidebar ───────────────────────────────────────────── */}
        {navOpen && (
          <div className="lg:hidden" onClick={() => setNavOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.4)' }} />
        )}
        <aside
          style={{ width: 216, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
          className={navOpen ? 'fixed right-0 top-0 h-full z-50 shadow-2xl flex flex-col' : 'hidden lg:flex lg:flex-col'}
        >
          <div style={{ padding: '12px 14px', background: skillColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaMap size={11} style={{ color: 'rgba(255,255,255,0.8)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Danh sách câu hỏi</span>
            </div>
            <button onClick={() => setNavOpen(false)} className="lg:hidden"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}>
              <FaXmark size={14} />
            </button>
          </div>

          {exam.sections.length > 1 && (
            <div style={{ padding: '8px 10px', display: 'flex', gap: 5, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              {exam.sections.map((sec, i) => (
                <button key={sec.id}
                  style={{
                    flex: 1, padding: '4px', borderRadius: 7, fontSize: 10, fontWeight: 700, border: 'none',
                    cursor: i === currentSectionIdx ? 'default' : 'not-allowed',
                    background: i === currentSectionIdx ? (SKILL_COLOR[sec.skill] ?? 'var(--primary)') : 'var(--bg-muted)',
                    color: i === currentSectionIdx ? '#fff' : 'var(--text-muted)',
                    opacity: i < currentSectionIdx ? 0.5 : 1,
                  }}
                  disabled={i !== currentSectionIdx}>
                  P{i + 1}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {partGroups.map((group, gIdx) => (
              <div key={`nav-${group.label}-${gIdx}`} style={{ marginBottom: 12 }}>
                {group.label && (
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 5, padding: '0 2px' }}>
                    {group.label}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
                  {group.items.map(({ q, idx }) => {
                    const isAnswered = !!answers[q.id];
                    const isActive = activeQIdx === idx;
                    return (
                      <button key={q.id} onClick={() => scrollToQuestion(idx)}
                        style={{
                          height: 30, borderRadius: 7, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                          background: isActive ? skillColor : isAnswered ? '#DCFCE7' : 'var(--bg-muted)',
                          color: isActive ? '#fff' : isAnswered ? '#16A34A' : 'var(--text-muted)',
                          boxShadow: isActive ? `0 0 0 2px ${skillColor}50` : 'none',
                        }}>
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Tiến độ phần này</div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: skillColor, transition: 'width 0.3s',
                  width: `${questions.length > 0 ? (sectionAnswered / questions.length) * 100 : 0}%`,
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                {sectionAnswered}/{questions.length} câu
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
