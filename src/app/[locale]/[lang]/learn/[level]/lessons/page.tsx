import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FaArrowLeft, FaGraduationCap } from 'react-icons/fa6';
import LearnLevelClient, { type CategoryData } from '../LearnLevelClient';

interface Props {
  params: Promise<{ locale: string; lang: string; level: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const LEVEL_ACCENT: Record<string, { color: string; rgb: string }> = {
  N5:   { color: '#059669', rgb: '5,150,105' },
  N4:   { color: '#2563EB', rgb: '37,99,235' },
  N3:   { color: '#D97706', rgb: '217,119,6' },
  N2:   { color: '#EA580C', rgb: '234,88,12' },
  N1:   { color: '#DC2626', rgb: '220,38,38' },
  HSK1: { color: '#DC2626', rgb: '220,38,38' },
  HSK2: { color: '#DC2626', rgb: '220,38,38' },
  HSK3: { color: '#D97706', rgb: '217,119,6' },
  HSK4: { color: '#C2410C', rgb: '194,65,12' },
  HSK5: { color: '#B91C1C', rgb: '185,28,28' },
  HSK6: { color: '#991B1B', rgb: '153,27,27' },
};

const TEXTBOOK_META: Record<string, { vocab: string; grammar: string }> = {
  N5: { vocab: 'Minna no Nihongo I (Bài 1~25)',   grammar: 'Minna no Nihongo I — Ngữ pháp' },
  N4: { vocab: 'Minna no Nihongo II (Bài 26~50)', grammar: 'Minna no Nihongo II — Ngữ pháp' },
  N3: { vocab: 'Mimikara Oboeru N3 Goi',          grammar: 'Shin Kanzen Master N3' },
  N2: { vocab: 'Mimikara Oboeru N2 Goi',          grammar: 'Shin Kanzen Master N2' },
  N1: { vocab: 'Mimikara Oboeru N1 Goi',          grammar: 'Shin Kanzen Master N1' },
};

const getCachedLevelStructure = unstable_cache(
  (code: string) =>
    prisma.level.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        learningCategories: {
          include: { lessons: { orderBy: { order: 'asc' }, include: { _count: { select: { items: true } } } } },
          orderBy: [{ skill: 'asc' }, { order: 'asc' }],
        },
      },
    }),
  ['level-structure'],
  { revalidate: 3600, tags: ['level-structure'] },
);

export const dynamic = 'force-dynamic';

export default async function LearnLessonsPage({ params: rawParams, searchParams: rawSearchParams }: Props) {
  const params = await rawParams;
  const searchParams = await rawSearchParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const level = await getCachedLevelStructure(params.level);
  if (!level) notFound();

  const allLessonIds = level.learningCategories.flatMap(c => c.lessons.map(l => l.id));
  const progressRows = userId && allLessonIds.length > 0
    ? await prisma.lessonProgress.findMany({
        where: { userId, lessonId: { in: allLessonIds } },
        select: { lessonId: true, completed: true },
      })
    : [];
  const completedSet = new Set(progressRows.filter(p => p.completed).map(p => p.lessonId));

  const accent = LEVEL_ACCENT[level.code] ?? { color: '#2563EB', rgb: '37,99,235' };
  const textbook = TEXTBOOK_META[level.code as keyof typeof TEXTBOOK_META];
  const activeTab = searchParams?.tab === 'grammar' ? 'grammar' : 'vocab';

  const vocabCats   = level.learningCategories.filter(c => c.skill === 'vocab');
  const grammarCats = level.learningCategories.filter(c => c.skill === 'grammar');
  const legacyCats  = level.learningCategories.filter(c => !['vocab', 'grammar'].includes(c.skill));
  const hasNewContent = vocabCats.length > 0 || grammarCats.length > 0;

  function toClientCats(cats: typeof vocabCats): CategoryData[] {
    return cats.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      skill: cat.skill,
      icon: cat.icon ?? null,
      lessons: cat.lessons.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        type: l.type,
        order: l.order,
        itemCount: l._count.items,
        isCompleted: completedSet.has(l.id),
        requiredTier: l.requiredTier ?? 'free',
      })),
    }));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Breadcrumb back to level top page */}
      <div
        className="sticky top-14 z-10 px-4 sm:px-6 h-10 border-b flex items-center gap-2"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <Link
          href={`/${params.locale}/${params.lang}/learn/${level.code}`}
          className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <FaArrowLeft size={9} /> {level.code}
        </Link>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ Bài học</span>
      </div>

      <LearnLevelClient
        vocabCats={toClientCats(vocabCats)}
        grammarCats={toClientCats(grammarCats)}
        defaultTab={activeTab}
        accentColor={accent.color}
        accentRgb={accent.rgb}
        lang={params.lang}
        levelCode={level.code}
        userId={userId}
      />

      {textbook && (
        <div className="px-4 sm:px-6 pb-6" style={{ marginLeft: 272 }}>
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
          >
            <FaGraduationCap size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'vocab' ? textbook.vocab : textbook.grammar}
            </span>
          </div>
        </div>
      )}

      {!hasNewContent && legacyCats.length > 0 && (
        <div className="px-4 sm:px-6 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Kỹ năng khác</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {legacyCats.map(cat => (
              <Link
                key={cat.id}
                href={`/${params.locale}/${params.lang}/learn/${level.code}/${cat.skill}/${cat.id}`}
                className="card-hover border flex items-center gap-4"
              >
                <div className="text-3xl flex-shrink-0">{cat.icon ?? '📂'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-0.5">{cat.name}</div>
                  {cat.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
                  )}
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{cat.lessons.length} bài học</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
