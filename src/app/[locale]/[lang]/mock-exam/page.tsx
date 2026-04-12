'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LearnLayout } from '@/components/learn/LearnLayout';
import {
  FaClipboardList, FaClock, FaLayerGroup, FaBolt,
  FaHeadphones, FaBookOpen, FaBook, FaChartBar,
  FaCircleCheck, FaBriefcase, FaGraduationCap,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionInfo {
  id: string;
  title: string;
  titleVi: string | null;
  skill: string;
  timeLimit: number;
  order: number;
  _count: { questions: number };
}

interface MockExam {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  levelCode: string;
  year: number | null;
  totalTime: number;
  published: boolean;
  sections: SectionInfo[];
  _count: { sessions: number };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const JA_LEVELS = [
  { code: 'N5', label: 'N5', desc: 'Sơ cấp' },
  { code: 'N4', label: 'N4', desc: 'Sơ trung cấp' },
  { code: 'N3', label: 'N3', desc: 'Trung cấp' },
  { code: 'N2', label: 'N2', desc: 'Trung cao cấp' },
  { code: 'N1', label: 'N1', desc: 'Cao cấp' },
];

const BJT_LEVELS = [
  { code: 'BJT', label: 'BJT', desc: 'Business Japanese Test' },
];

const JLPT_SKILLS = [
  { key: 'all', label: 'Tất cả', icon: <FaClipboardList size={14} /> },
  { key: 'vocab', label: 'Từ vựng', icon: <FaBookOpen size={14} /> },
  { key: 'grammar_reading', label: 'Ngữ pháp・Đọc', icon: <FaBook size={14} /> },
  { key: 'listening', label: 'Nghe', icon: <FaHeadphones size={14} /> },
];

const BJT_SKILLS = [
  { key: 'all', label: 'Tất cả', icon: <FaClipboardList size={14} /> },
];

const SKILL_ICON: Record<string, React.ReactNode> = {
  vocab: <FaBookOpen size={11} />,
  grammar_reading: <FaBook size={11} />,
  listening: <FaHeadphones size={11} />,
  reading: <FaBook size={11} />,
  integrated: <FaLayerGroup size={11} />,
};

const SKILL_COLOR: Record<string, string> = {
  vocab: '#4F46E5',
  grammar_reading: '#059669',
  listening: '#D97706',
  reading: '#0891B2',
  integrated: '#7C3AED',
};

function formatTime(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h${r}p` : `${h}h`;
  }
  return `${m} phút`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MockExamListPage() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const isBJT = lang === 'bjt';

  const levels = isBJT ? BJT_LEVELS : JA_LEVELS;
  const skills = isBJT ? BJT_SKILLS : JLPT_SKILLS;

  const [selectedLevel, setSelectedLevel] = useState(levels[0].code);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);

  const subject = isBJT ? 'BJT' : 'JLPT';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/mock-exam?subject=${subject}&level=${selectedLevel}`)
      .then(r => r.json())
      .then(data => { setExams(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [subject, selectedLevel]);

  const filtered = useMemo(() => {
    if (selectedSkill === 'all') return exams;
    return exams; // Skill filter applies to sections, not whole exams
  }, [exams, selectedSkill]);

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'skill',
        setMode: () => {},
        selectedLevel,
        setSelectedLevel,
        selectedSkill,
        setSelectedSkill,
        levels,
        skills,
        title: isBJT ? 'Thi thử BJT' : 'Thi thử JLPT',
      }}
      bottomBarProps={{
        levels,
        selectedLevel,
        setSelectedLevel,
        skills,
        selectedSkill,
        setSelectedSkill,
      }}
    >
      {/* Hero */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            {isBJT ? <FaBriefcase size={20} style={{ color: '#fff' }} /> : <FaGraduationCap size={20} style={{ color: '#fff' }} />}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: '#FBBF24', color: '#78350F' }}>
              <FaBolt size={8} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {isBJT ? 'Thi thử BJT' : `Thi thử JLPT ${selectedLevel}`}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isBJT
                ? 'Đề thi thử BJT đầy đủ theo cấu trúc chuẩn'
                : 'Đề thi thử đầy đủ theo cấu trúc chuẩn JLPT'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { label: 'Đề thi', value: exams.length, icon: <FaClipboardList size={12} />, color: 'var(--primary)' },
            { label: 'Tổng phần', value: exams.reduce((a, e) => a + e.sections.length, 0), icon: <FaLayerGroup size={12} />, color: '#059669' },
            { label: 'Lượt thi', value: exams.reduce((a, e) => a + e._count.sessions, 0), icon: <FaChartBar size={12} />, color: '#D97706' },
          ].map(s => (
            <div key={s.label} className="card flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2.5 sm:p-3 text-center sm:text-left">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: s.color + '15', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-base font-bold leading-none" style={{ color: 'var(--text-base)' }}>{s.value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--bg-muted)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 12%, var(--bg-surface)))' }}>
            <FaClipboardList size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Chưa có đề thi thử {selectedLevel}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Đề thi sẽ được cập nhật sớm. Hãy quay lại sau nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(exam => {
            const totalQ = exam.sections.reduce((a, s) => a + s._count.questions, 0);
            return (
              <Link key={exam.id} href={`/${lang}/mock-exam/${exam.id}`}
                className="block group">
                <div className="rounded-2xl overflow-hidden transition-all hover:scale-[1.005] active:scale-[0.995]"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-surface)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  {/* Exam header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FaClipboardList size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                            style={{ background: 'var(--primary)', color: '#fff' }}>
                            {exam.levelCode}
                          </span>
                          {exam.year && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                              {exam.year}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {exam.title}
                        </h3>
                        {exam.description && (
                          <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <FaClock size={10} /> {formatTime(exam.totalTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClipboardList size={10} /> {totalQ} câu
                      </span>
                      <span className="flex items-center gap-1">
                        <FaLayerGroup size={10} /> {exam.sections.length} phần
                      </span>
                      {exam._count.sessions > 0 && (
                        <span className="flex items-center gap-1">
                          <FaChartBar size={10} /> {exam._count.sessions} lượt
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sections preview */}
                  <div className="px-4 pb-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-none">
                      {exam.sections.map(sec => (
                        <div key={sec.id} className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                          style={{
                            background: (SKILL_COLOR[sec.skill] ?? '#4F46E5') + '12',
                            color: SKILL_COLOR[sec.skill] ?? '#4F46E5',
                          }}>
                          {SKILL_ICON[sec.skill] ?? <FaClipboardList size={10} />}
                          <span>{sec.titleVi ?? sec.title}</span>
                          <span className="opacity-60">({sec._count.questions})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="px-4 py-2.5 flex items-center justify-between"
                    style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
                      <FaCircleCheck size={10} />
                      Bắt đầu thi thử
                    </div>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-0.5"
                      style={{ background: 'var(--primary)', color: '#fff' }}>
                      <FaBolt size={10} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </LearnLayout>
  );
}
