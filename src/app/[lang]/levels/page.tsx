export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Thi Thử JLPT',
  description: 'Làm đề thi thử JLPT N5~N1 sát format thật. Kiểm tra trình độ tiếng Nhật với các bài thi nghe, đọc và ngữ pháp.',
  alternates: { canonical: 'https://e-learn.ikagi.site/levels' },
  openGraph: {
    title: 'Thi Thử JLPT N5~N1 | IkagiLearn',
    description: 'Đề thi thử JLPT sát format thật. Nghe, đọc, ngữ pháp — đầy đủ 5 cấp độ N5 đến N1.',
    url: 'https://e-learn.ikagi.site/levels',
  },
};

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { ExamDeadlinePlanner } from '@/components/ExamDeadlinePlanner';
import {
  FaHeadphones, FaBookOpen, FaPencil, FaComments,
  FaCalendarDays, FaLightbulb, FaBullseye, FaRepeat,
  FaChartBar, FaStopwatch, FaFont, FaFileLines,
} from 'react-icons/fa6';

const LEVEL_META: Record<string, {
  desc: string; color: string; light: string;
  vocab: string; kanji: string; tip: string;
}> = {
  N5: { desc: 'Sơ cấp',        color: '#16A34A', light: '#F0FDF4', vocab: '~800 từ',   kanji: '100 Kanji',  tip: 'Phù hợp người mới bắt đầu' },
  N4: { desc: 'Sơ trung cấp',  color: '#2563EB', light: '#EFF6FF', vocab: '~1500 từ',  kanji: '300 Kanji',  tip: 'Giao tiếp cơ bản hàng ngày' },
  N3: { desc: 'Trung cấp',     color: '#D97706', light: '#FFFBEB', vocab: '~3750 từ',  kanji: '650 Kanji',  tip: 'Đọc báo, xem phim đơn giản' },
  N2: { desc: 'Trung cao cấp', color: '#EA580C', light: '#FFF7ED', vocab: '~6000 từ',  kanji: '1000 Kanji', tip: 'Yêu cầu nhiều doanh nghiệp Nhật' },
  N1: { desc: 'Cao cấp',       color: '#DC2626', light: '#FFF1F2', vocab: '~10000 từ', kanji: '2000 Kanji', tip: 'Trình độ gần như người bản xứ' },
};

const SKILL_META: Record<string, { label: string; icon: ReactNode; color: string }> = {
  nghe: { label: 'Nghe',    icon: <FaHeadphones size={10}/>, color: '#2563EB' },
  doc:  { label: 'Đọc',     icon: <FaBookOpen   size={10}/>, color: '#D97706' },
  viet: { label: 'Ngữ pháp', icon: <FaPencil    size={10}/>, color: '#7C3AED' },
  noi:  { label: 'Từ vựng', icon: <FaComments   size={10}/>, color: '#059669' },
};

export default async function LevelsPage({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const userId  = (session?.user as { id?: string } | undefined)?.id;

  const levels = await prisma.level.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { examSets: true } },
      examSets: { select: { skill: true } },
    },
  });

  // User progress: count of completed exam sets per level
  const progressByLevel: Record<string, { done: number; total: number; bestAvg: number | null }> = {};
  if (userId && levels.length) {
    const progressRows = await prisma.userProgress.findMany({
      where: {
        userId,
        examSet: { levelId: { in: levels.map(l => l.id) } },
      },
      select: { attempts: true, bestScore: true, examSet: { select: { levelId: true } } },
    });
    for (const l of levels) {
      const rows = progressRows.filter(r => r.examSet.levelId === l.id);
      const done = rows.filter(r => r.attempts > 0).length;
      const scored = rows.filter(r => r.bestScore != null);
      progressByLevel[l.id] = {
        done,
        total: l._count.examSets,
        bestAvg: scored.length ? scored.reduce((s, r) => s + r.bestScore!, 0) / scored.length : null,
      };
    }
  }

  const savedPlan = session?.user?.email
    ? await prisma.userExamPlan.findFirst({
        where: { user: { email: session.user.email } },
        select: {
          targetLevelCode: true,
          examDate: true,
          daysLeftAtSave: true,
          weeksLeftAtSave: true,
          examsPerWeek: true,
          studySessionsPerWeek: true,
          reviewDays: true,
          updatedAt: true,
        },
      })
    : null;

  const lang = params.lang ?? 'ja';

  return (
    <div className="px-4 py-8" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>🇯🇵</span>
          <span>JLPT N5 → N1</span>
          <span>·</span>
          <span>Đề thi thử</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Luyện thi JLPT
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Format sát đề thi thật · Có giải thích đáp án · Lưu tiến trình cá nhân
        </p>
      </div>

      {/* ── Level cards ── */}
      {levels.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Chưa có cấp độ nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-10">
          {levels.map(l => {
            const meta = LEVEL_META[l.code] ?? { desc: '', color: '#6B7280', light: '#F9FAFB', vocab: '', kanji: '', tip: '' };
            const prog = progressByLevel[l.id];
            const pct  = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;

            // Skill chips: unique skills with counts
            const skillCounts: Record<string, number> = {};
            for (const es of l.examSets) {
              skillCounts[es.skill] = (skillCounts[es.skill] ?? 0) + 1;
            }

            return (
              <Link key={l.id} href={`/${lang}/levels/${l.code}`}
                className="group flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>

                {/* Level badge */}
                <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-extrabold text-white text-xl"
                  style={{ background: meta.color }}>
                  {l.code}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{l.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: meta.light, color: meta.color }}>
                      {meta.desc}
                    </span>
                  </div>
                  <p className="text-xs mb-2 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{meta.tip}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <FaBookOpen size={10}/> {meta.vocab}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <FaFont size={10}/> {meta.kanji}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <FaFileLines size={10}/> {l._count.examSets} đề
                    </span>
                    {/* Skill chips */}
                    <div className="flex gap-1">
                      {Object.entries(skillCounts).map(([skill, count]) => {
                        const sm = SKILL_META[skill];
                        if (!sm) return null;
                        return (
                          <span key={skill} className="text-[11px] px-1.5 py-0.5 rounded-lg font-medium inline-flex items-center gap-1"
                            style={{ background: `${sm.color}18`, color: sm.color }}>
                            {sm.icon} {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress bar (logged in) */}
                  {prog && prog.total > 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <span className="text-[11px] font-semibold shrink-0" style={{ color: meta.color }}>
                        {prog.done}/{prog.total}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA arrow */}
                <div className="shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-all"
                  style={{ color: meta.color }}>
                  <span className="hidden sm:inline">Vào luyện thi</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Deadline planner ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarDays size={18} style={{ color: 'var(--text-muted)' }}/>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Kế hoạch luyện thi</h2>
        </div>
        <ExamDeadlinePlanner
          levels={levels.map((level) => ({
            code: level.code,
            name: level.name,
            description: level.description,
            examSetCount: level._count.examSets,
          }))}
          canSave={Boolean(session)}
          savedPlan={savedPlan ? {
            ...savedPlan,
            examDate: savedPlan.examDate.toISOString().slice(0, 10),
            updatedAt: savedPlan.updatedAt.toISOString(),
          } : null}
        />
      </div>

      {/* ── Tips ── */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}><FaLightbulb size={14}/> Mẹo luyện thi hiệu quả</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: <FaBullseye  size={18}/>, title: 'Bắt đầu từ cấp độ dễ', body: 'Dù đích là N2, hãy chạy thử N5 để quen format' },
            { icon: <FaRepeat    size={18}/>, title: 'Luyện mỗi ngày 20 phút', body: 'Đều đặn quan trọng hơn học cấp tập trước thi' },
            { icon: <FaChartBar  size={18}/>, title: 'Xem lại đáp án sai', body: 'Đọc giải thích để hiểu bản chất, không chỉ học thuộc' },
            { icon: <FaStopwatch size={18}/>, title: 'Làm đề có giới hạn thời gian', body: 'Luyện quản lý thời gian sát với điều kiện thi thật' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-3">
              <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{tip.icon}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tip.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tip.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
