import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FaCircleCheck, FaBookOpen, FaRuler, FaArrowRight } from 'react-icons/fa6';

interface Props {
  params: { level: string };
  searchParams: { tab?: string };
}

const LEVEL_META: Record<string, { desc: string; gradient: string }> = {
  N5: { desc: 'Sơ cấp',       gradient: 'from-emerald-500 to-green-600' },
  N4: { desc: 'Sơ trung cấp', gradient: 'from-blue-500 to-indigo-600'  },
  N3: { desc: 'Trung cấp',    gradient: 'from-amber-500 to-orange-500' },
  N2: { desc: 'Trung cao cấp',gradient: 'from-orange-500 to-red-500'   },
  N1: { desc: 'Cao cấp',      gradient: 'from-rose-600 to-red-700'     },
};

const TEXTBOOK_META: Record<string, { vocab: string; grammar: string }> = {
  N5: { vocab: 'Minna no Nihongo I (Bài 1~25)',  grammar: 'Minna no Nihongo I — Ngữ pháp' },
  N4: { vocab: 'Minna no Nihongo II (Bài 26~50)', grammar: 'Minna no Nihongo II — Ngữ pháp' },
  N3: { vocab: 'Mimikara Oboeru N3 Goi',          grammar: 'Shin Kanzen Master N3' },
  N2: { vocab: 'Mimikara Oboeru N2 Goi',          grammar: 'Shin Kanzen Master N2' },
  N1: { vocab: 'Mimikara Oboeru N1 Goi',          grammar: 'Shin Kanzen Master N1' },
};

async function getLevelData(code: string, userId?: string) {
  return prisma.level.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      learningCategories: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              _count: { select: { items: true } },
              progress: userId ? { where: { userId } } : false,
            },
          },
        },
        orderBy: [{ skill: 'asc' }, { order: 'asc' }],
      },
    },
  });
}

export const dynamic = 'force-dynamic';

export default async function LearnLevelPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const level = await getLevelData(params.level, userId);
  if (!level) notFound();

  const meta     = LEVEL_META[level.code]  ?? { desc: '', gradient: 'from-gray-500 to-gray-700' };
  const textbook = TEXTBOOK_META[level.code as keyof typeof TEXTBOOK_META];
  const activeTab = searchParams?.tab === 'grammar' ? 'grammar' : 'vocab';

  // New-style categories with skill='vocab' or skill='grammar'
  const vocabCats   = level.learningCategories.filter(c => c.skill === 'vocab');
  const grammarCats = level.learningCategories.filter(c => c.skill === 'grammar');
  const hasNewContent = vocabCats.length > 0 || grammarCats.length > 0;

  const activeCats = activeTab === 'grammar' ? grammarCats : vocabCats;
  const allLessons = activeCats.flatMap(cat =>
    cat.lessons.map(l => ({ ...l, catId: cat.id, catSkill: cat.skill }))
  );

  const totalLessons     = allLessons.length;
  const completedLessons = userId
    ? allLessons.filter(l => (l.progress as any[])?.some((p: any) => p.completed)).length
    : 0;

  // Legacy skill-based categories (nghe/noi/doc/viet) for fallback
  const legacyCats = level.learningCategories.filter(c => !['vocab', 'grammar'].includes(c.skill));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Học</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{level.code}</span>
      </div>

      {/* Level header */}
      <div className={`rounded-2xl bg-gradient-to-br ${meta.gradient} text-white px-8 py-7 mb-8 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm mb-1" style={{ color: 'rgba(255,255,255,.88)' }}>{meta.desc}</div>
            <h1 className="text-4xl font-bold mb-1">Học {level.code}</h1>
            <p style={{ color: 'rgba(255,255,255,.92)' }}>{level.name}</p>
          </div>
          <div className="text-5xl font-black opacity-20 select-none">{level.code}</div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 mb-6 p-1.5 rounded-2xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
        {(['vocab', 'grammar'] as const).map(tab => {
          const count = tab === 'vocab'
            ? vocabCats.reduce((s, c) => s + c.lessons.length, 0)
            : grammarCats.reduce((s, c) => s + c.lessons.length, 0);
          const active = activeTab === tab;
          return (
            <Link key={tab}
              href={`/learn/${level.code}?tab=${tab}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
              style={active
                ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(79,70,229,.35)' }
                : { color: 'var(--text-secondary)' }}>
              {tab === 'vocab' ? <FaBookOpen size={14}/> : <FaRuler size={14}/>}
              {tab === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'}
              {count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={active
                    ? { background: 'rgba(255,255,255,.25)', color: '#fff' }
                    : { background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Textbook attribution + progress */}
      {(textbook || (userId && totalLessons > 0)) && (
        <div className="flex items-center justify-between mb-4">
          {textbook && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium">📚 Giáo trình:</span>{' '}
              {activeTab === 'vocab' ? textbook.vocab : textbook.grammar}
            </p>
          )}
          {userId && totalLessons > 0 && (
            <span className="text-sm font-semibold shrink-0 ml-4" style={{ color: 'var(--primary)' }}>
              {completedLessons}/{totalLessons} bài
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {userId && totalLessons > 0 && (
        <div className="progress-track mb-6">
          <div className="progress-fill" style={{ width: `${Math.round((completedLessons / totalLessons) * 100)}%` }}/>
        </div>
      )}

      {/* ── New-style lesson list ───────────────────────────────────────── */}
      {allLessons.length > 0 && (
        <div className="space-y-2">
          {allLessons.map((lesson, idx) => {
            const isCompleted = userId && (lesson.progress as any[])?.some((p: any) => p.completed);
            const href = `/learn/${level.code}/${lesson.catSkill}/${lesson.catId}/${lesson.id}`;
            return (
              <Link key={lesson.id} href={href}
                className="card-hover flex items-center gap-4"
                style={{ padding: '14px 18px' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={isCompleted
                    ? { background: '#D1FAE5', color: '#065F46' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  {isCompleted ? <FaCircleCheck size={15}/> : String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {lesson.title}
                  </div>
                  {lesson.description && (
                    <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {lesson.description}
                    </div>
                  )}
                </div>
                <div className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {lesson._count.items > 0 ? `${lesson._count.items} mục` : ''}
                </div>
                <FaArrowRight size={13} style={{ color: 'var(--text-muted)', opacity: 0.5 }}/>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Empty state (no new-style content) ──────────────────────────── */}
      {hasNewContent && allLessons.length === 0 && (
        <div className="card text-center py-14" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">{activeTab === 'vocab' ? '📖' : '📐'}</div>
          <div className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Chưa có dữ liệu {activeTab === 'vocab' ? 'từ vựng' : 'ngữ pháp'}
          </div>
          <p className="text-sm">Hãy chạy seed Minna no Nihongo để tạo nội dung.</p>
        </div>
      )}

      {!hasNewContent && allLessons.length === 0 && (
        <div className="card text-center py-14" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">{activeTab === 'vocab' ? '📖' : '📐'}</div>
          <div className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Chưa có nội dung {activeTab === 'vocab' ? 'từ vựng' : 'ngữ pháp'} cho {level.code}
          </div>
          <p className="text-sm mb-4">
            Chạy lệnh: <code className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-muted)' }}>
              npx tsx prisma/seed-minna.ts
            </code>
          </p>
          <Link href="/admin/seed" style={{ color: 'var(--accent)' }} className="text-sm underline">
            Admin → Seed →
          </Link>
        </div>
      )}

      {/* ── Legacy skill-based content (nghe/noi/doc/viet) ───────────────
           Only shown if no new vocab/grammar content exists yet.            ── */}
      {!hasNewContent && legacyCats.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Nội dung kỹ năng khác
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {legacyCats.map(cat => (
              <Link key={cat.id}
                href={`/learn/${level.code}/${cat.skill}/${cat.id}`}
                className="card-hover border flex items-center gap-4">
                <div className="text-3xl shrink-0">{cat.icon ?? '📂'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-0.5">{cat.name}</div>
                  {cat.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
                  )}
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {cat.lessons.length} bài học
                  </div>
                </div>
                <FaArrowRight size={13} style={{ opacity: 0.4 }}/>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
