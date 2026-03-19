import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FaArrowLeft, FaPlay, FaChevronRight } from 'react-icons/fa6';
import LevelPostsSection, { type LevelPostData } from '@/components/LevelPostsSection';

interface Props { params: { lang: string; level: string } }

// Tối ưu type cho examSets props
interface ExamSet {
  id: string;
  title: string;
  description: string;
  skill: string;
  timeLimit: number;
  questionCount: number;
  progress: {
    bestScore: number | null;
    attempts: number;
    completed: boolean;
  } | null;
}

// ─── Level visual meta ────────────────────────────────────────────────────────

const LEVEL_META: Record<string, { heroGrad: string; accent: string; desc: string }> = {
  N5:   { heroGrad: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', accent: '#059669', desc: 'Sơ cấp' },
  N4:   { heroGrad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', accent: '#2563EB', desc: 'Sơ trung cấp' },
  N3:   { heroGrad: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', accent: '#D97706', desc: 'Trung cấp' },
  N2:   { heroGrad: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)', accent: '#EA580C', desc: 'Trung cao cấp' },
  N1:   { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)', accent: '#DC2626', desc: 'Cao cấp' },
  HSK1: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)', accent: '#DC2626', desc: '入门级' },
  HSK2: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)', accent: '#DC2626', desc: '初级' },
  HSK3: { heroGrad: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', accent: '#D97706', desc: '中级' },
  HSK4: { heroGrad: 'linear-gradient(135deg, #92400E 0%, #C2410C 100%)', accent: '#C2410C', desc: '高级初阶' },
  HSK5: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)', accent: '#B91C1C', desc: '高级' },
  HSK6: { heroGrad: 'linear-gradient(135deg, #111827 0%, #7F1D1D 100%)', accent: '#991B1B', desc: '精通级' },
};

const SKILL_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  nghe:    { label: 'Nghe',     icon: '🎧', color: '#2563EB', bg: '#EFF6FF' },
  doc:     { label: 'Đọc',     icon: '📖', color: '#D97706', bg: '#FFFBEB' },
  viet:    { label: 'Viết',    icon: '✏️', color: '#7C3AED', bg: '#F5F3FF' },
  noi:     { label: 'Nói',     icon: '🎤', color: '#059669', bg: '#F0FDF4' },
  vocab:   { label: 'Từ vựng', icon: '📝', color: '#DC2626', bg: '#FFF1F2' },
  grammar: { label: 'Ngữ pháp',icon: '📐', color: '#0891B2', bg: '#ECFEFF' },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const getCachedLevel = unstable_cache(
  (code: string) =>
    prisma.level.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        examSets: {
          include: { _count: { select: { questions: true } } },
          orderBy: [{ skill: 'asc' }, { createdAt: 'asc' }],
        },
      },
    }),
  ['level-exam-structure'],
  { revalidate: 3600, tags: ['level-exam-structure'] },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lv = params.level?.toUpperCase();
  const meta = LEVEL_META[lv];
  return {
    title: `Luyện thi ${lv}`,
    description: `Luyện thi JLPT ${lv}${meta?.desc ? ` (${meta.desc})` : ''} với bộ đề thi phân chia theo kỹ năng: nghe, đọc, viết.`,
  };
}

export const dynamic = 'force-dynamic';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LevelTopPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const level = await getCachedLevel(params.level);
  if (!level) notFound();

  // User exam progress
  const progressMap: Record<string, { bestScore: number | null; attempts: number }> = {};
  if (userId) {
    const rows = await prisma.userProgress.findMany({
      where: { userId, examSetId: { in: level.examSets.map(s => s.id) } },
      select: { examSetId: true, bestScore: true, attempts: true },
    });
    for (const r of rows) progressMap[r.examSetId] = r;
  }

  const totalSets = level.examSets.length;
  const totalDone = level.examSets.filter(s => (progressMap[s.id]?.attempts ?? 0) > 0).length;
  const totalPct  = totalSets > 0 ? Math.round((totalDone / totalSets) * 100) : 0;

  // Group exam sets by skill
  const bySkill = level.examSets.reduce<Record<string, { count: number; done: number }>>((acc, s) => {
    const sk = s.skill as string;
    if (!acc[sk]) acc[sk] = { count: 0, done: 0 };
    acc[sk].count++;
    if ((progressMap[s.id]?.attempts ?? 0) > 0) acc[sk].done++;
    return acc;
  }, {});

  // Community posts
  const rawPosts = await prisma.levelPost.findMany({
    where: { levelCode: level.code },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });
  const posts: LevelPostData[] = rawPosts.map(p => ({
    id: p.id, content: p.content, userName: p.user.name,
    createdAt: p.createdAt.toISOString(),
  }));

  const meta = LEVEL_META[level.code] ?? {
    heroGrad: 'linear-gradient(135deg,#1E40AF,#2563EB)',
    accent: '#2563EB',
    desc: '',
  };
  const R    = 34;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - totalPct / 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden" style={{ background: meta.heroGrad }}>
        {/* Decorative level code watermark */}
        <span
          className="absolute right-6 top-4 select-none pointer-events-none font-black"
          style={{ fontSize: 128, color: 'rgba(255,255,255,0.055)', lineHeight: 1 }}
        >
          {level.code}
        </span>

        <div className="relative z-10 px-4 sm:px-8 py-10 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <Link
              href={`/${params.lang}/levels`}
              className="flex items-center gap-1 hover:text-white transition-colors font-medium"
            >
              <FaArrowLeft size={9} /> Luyện thi
            </Link>
            <FaChevronRight size={7} />
            <span className="text-white font-bold">{level.code}</span>
          </div>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left: info + CTAs */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.35)' }}
                >
                  {level.code}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{level.name}</h1>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {meta.desc}{level.description ? ` · ${level.description}` : ''}
                  </p>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white"
                  style={{ background: 'rgba(255,255,255,0.16)' }}>
                  {totalSets} đề thi
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white"
                  style={{ background: 'rgba(255,255,255,0.16)' }}>
                  {Object.keys(bySkill).length} kỹ năng
                </span>
                {userId && totalDone > 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.95)', color: meta.accent }}>
                    {totalDone}/{totalSets} hoàn thành
                  </span>
                )}
              </div>

              {/* CTA */}
              <div>
                <Link
                  href={`/${params.lang}/levels/${level.code}/exams`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ background: 'white', color: meta.accent, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                >
                  <FaPlay size={11} /> Bắt đầu luyện thi
                </Link>
              </div>
            </div>

            {/* Right: Progress ring (logged-in only) */}
            {userId && (
              <div className="shrink-0 flex flex-col items-center gap-2 self-start pt-2">
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r={R} fill="none" strokeWidth="6"
                    stroke="rgba(255,255,255,0.25)" />
                  <circle cx="44" cy="44" r={R} fill="none" strokeWidth="6"
                    stroke="white" strokeDasharray={circ} strokeDashoffset={dash}
                    strokeLinecap="round" transform="rotate(-90 44 44)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                  <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="14" fontWeight="800">{totalPct}%</text>
                </svg>
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  tiến độ
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {userId && totalSets > 0 && (
            <div className="mt-6 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${totalPct}%`, background: 'white' }} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* ══════════════ SKILL GRID ══════════════ */}
        {Object.entries(bySkill).length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-muted)' }}>Kỹ năng luyện thi</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(bySkill).map(([skill, { count, done }]) => {
                const info = SKILL_INFO[skill];
                const pct  = count > 0 ? Math.round((done / count) * 100) : 0;
                return (
                  <Link
                    key={skill}
                    href={`/${params.lang}/levels/${level.code}/exams`}
                    className="flex flex-col gap-2.5 p-4 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{
                      background: info?.bg ?? 'var(--bg-muted)',
                      border: `1.5px solid ${info?.color ?? 'var(--border)'}22`,
                      boxShadow: `0 2px 8px ${info?.color ?? '#000'}0D`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{info?.icon ?? '📋'}</span>
                      <span className="text-[10px] font-bold tabular-nums"
                        style={{ color: info?.color ?? 'var(--text-muted)' }}>
                        {done}/{count}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: info?.color ?? 'var(--text-primary)' }}>
                        {info?.label ?? skill}
                      </p>
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <div className="h-1 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: info?.color ?? 'var(--primary)' }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════ COMMUNITY POSTS ══════════════ */}
        <LevelPostsSection
          levelCode={level.code}
          initialPosts={posts}
          userId={userId}
          userName={(session?.user as { name?: string } | undefined)?.name ?? undefined}
        />
      </div>
    </div>
  );
}