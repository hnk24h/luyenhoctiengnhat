import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Subject } from '@prisma/client';
import {
  FaBookOpen, FaRuler,
  FaGraduationCap, FaArrowLeft, FaChevronRight,
} from 'react-icons/fa6';
import LevelPostsSection, { type LevelPostData } from '@/components/LevelPostsSection';
import LearningPathMap, { type PathLesson } from '@/components/LearningPathMap';

interface Props {
  params: { lang: string; level: string };
  searchParams: { tab?: string };
}

// ─── Static metadata ─────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  N5: 'N5 Sơ cấp', N4: 'N4 Sơ trung cấp', N3: 'N3 Trung cấp',
  N2: 'N2 Trung cao cấp', N1: 'N1 Cao cấp',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lv = params.level?.toUpperCase();
  const label = LEVEL_LABEL[lv] ?? lv;
  return {
    title: `Học Tiếng Nhật ${label}`,
    description: `Từ vựng và ngữ pháp tiếng Nhật cấp độ ${label} theo giáo trình chuẩn JLPT.`,
    alternates: { canonical: `https://e-learn.ikagi.site/learn/${lv}` },
    openGraph: {
      title: `Học Tiếng Nhật ${label} | IkagiLearn`,
      description: `Từ vựng & ngữ pháp ${label} theo giáo trình chuẩn. Luyện tập và ôn thi JLPT ngay hôm nay.`,
      url: `https://e-learn.ikagi.site/learn/${lv}`,
    },
  };
}

// ─── Level styling config ─────────────────────────────────────────────────────

type LevelMeta = {
  desc: string;
  heroGrad: string;          // CSS gradient string
  accent: string;            // hex colour
  accentRgb: string;         // "r, g, b" for rgba()
  quote: string;
  quoteRomaji: string;
  quoteVi: string;
  decors: { char: string; x: string; y: string; rot: string; size: string }[];
};

const JLPT_META: Record<string, LevelMeta> = {
  N5: {
    desc: 'Sơ cấp',
    heroGrad: 'linear-gradient(135deg, #065F46 0%, #059669 45%, #0F766E 100%)',
    accent: '#059669', accentRgb: '5,150,105',
    quote: '千里の道も一歩から',
    quoteRomaji: 'Senri no michi mo ippo kara',
    quoteVi: 'Vạn dặm đường bắt đầu từ một bước chân',
    decors: [
      { char: '始', x: '4%',  y: '6%',  rot: '-14deg', size: '88px' },
      { char: '道', x: '72%', y: '4%',  rot: '16deg',  size: '110px' },
      { char: '歩', x: '84%', y: '54%', rot: '-8deg',  size: '80px' },
      { char: '春', x: '46%', y: '62%', rot: '10deg',  size: '96px' },
    ],
  },
  N4: {
    desc: 'Sơ trung cấp',
    heroGrad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 45%, #4338CA 100%)',
    accent: '#2563EB', accentRgb: '37,99,235',
    quote: '継続は力なり',
    quoteRomaji: 'Keizoku wa chikara nari',
    quoteVi: 'Kiên trì chính là sức mạnh',
    decors: [
      { char: '継', x: '4%',  y: '8%',  rot: '-10deg', size: '84px' },
      { char: '続', x: '74%', y: '5%',  rot: '14deg',  size: '100px' },
      { char: '力', x: '86%', y: '56%', rot: '-6deg',  size: '96px' },
      { char: '秋', x: '48%', y: '65%', rot: '8deg',   size: '84px' },
    ],
  },
  N3: {
    desc: 'Trung cấp',
    heroGrad: 'linear-gradient(135deg, #92400E 0%, #D97706 45%, #C2410C 100%)',
    accent: '#D97706', accentRgb: '217,119,6',
    quote: '七転び八起き',
    quoteRomaji: 'Nana korobi ya oki',
    quoteVi: 'Ngã bảy lần, đứng dậy tám lần',
    decors: [
      { char: '転', x: '5%',  y: '8%',  rot: '-16deg', size: '82px' },
      { char: '起', x: '76%', y: '5%',  rot: '18deg',  size: '94px' },
      { char: '根', x: '85%', y: '55%', rot: '-10deg', size: '76px' },
      { char: '炎', x: '44%', y: '64%', rot: '6deg',   size: '100px' },
    ],
  },
  N2: {
    desc: 'Trung cao cấp',
    heroGrad: 'linear-gradient(135deg, #9A3412 0%, #EA580C 45%, #B91C1C 100%)',
    accent: '#EA580C', accentRgb: '234,88,12',
    quote: '努力は裏切らない',
    quoteRomaji: 'Doryoku wa uragira nai',
    quoteVi: 'Nỗ lực sẽ không bao giờ phản bội bạn',
    decors: [
      { char: '努', x: '4%',  y: '7%',  rot: '-12deg', size: '88px' },
      { char: '力', x: '73%', y: '4%',  rot: '14deg',  size: '100px' },
      { char: '誠', x: '86%', y: '54%', rot: '-9deg',  size: '80px' },
      { char: '冬', x: '46%', y: '62%', rot: '8deg',   size: '92px' },
    ],
  },
  N1: {
    desc: 'Cao cấp',
    heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 45%, #991B1B 100%)',
    accent: '#DC2626', accentRgb: '220,38,38',
    quote: '為せば成る',
    quoteRomaji: 'Naseba naru',
    quoteVi: 'Quyết tâm làm, ắt sẽ thành công',
    decors: [
      { char: '頂', x: '4%',  y: '6%',  rot: '-10deg', size: '92px' },
      { char: '極', x: '72%', y: '4%',  rot: '15deg',  size: '104px' },
      { char: '覇', x: '85%', y: '55%', rot: '-8deg',  size: '84px' },
      { char: '志', x: '44%', y: '63%', rot: '6deg',   size: '96px' },
    ],
  },
};

const HSK_META: Record<string, LevelMeta> = {
  HSK1: {
    desc: '入门级',
    heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 45%, #92400E 100%)',
    accent: '#DC2626', accentRgb: '220,38,38',
    quote: '千里之行，始於足下',
    quoteRomaji: 'Qiān lǐ zhī xíng, shǐ yú zú xià',
    quoteVi: 'Hành trình vạn dặm bắt đầu từ bước chân đầu tiên',
    decors: [
      { char: '开', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '始', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '福', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '喜', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
  HSK2: {
    desc: '初级',
    heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 45%, #B45309 100%)',
    accent: '#DC2626', accentRgb: '220,38,38',
    quote: '學而時習之',
    quoteRomaji: 'Xué ér shí xí zhī',
    quoteVi: 'Học và thường xuyên ôn luyện',
    decors: [
      { char: '学', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '習', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '进', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '步', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
  HSK3: {
    desc: '中级',
    heroGrad: 'linear-gradient(135deg, #92400E 0%, #B45309 45%, #B91C1C 100%)',
    accent: '#D97706', accentRgb: '217,119,6',
    quote: '書山有路勤為徑',
    quoteRomaji: 'Shū shān yǒu lù qín wèi jìng',
    quoteVi: 'Con đường lên núi sách cần sự chăm chỉ',
    decors: [
      { char: '勤', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '学', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '书', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '路', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
  HSK4: {
    desc: '高级初阶',
    heroGrad: 'linear-gradient(135deg, #92400E 0%, #C2410C 45%, #7F1D1D 100%)',
    accent: '#C2410C', accentRgb: '194,65,12',
    quote: '不積跬步，無以至千里',
    quoteRomaji: 'Bù jī kuǐ bù, wú yǐ zhì qiān lǐ',
    quoteVi: 'Không tích tiểu bộ, không đến ngàn dặm',
    decors: [
      { char: '积', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '步', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '千', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '里', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
  HSK5: {
    desc: '高级',
    heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 45%, #78350F 100%)',
    accent: '#B91C1C', accentRgb: '185,28,28',
    quote: '博學而篤志',
    quoteRomaji: 'Bó xué ér dǔ zhì',
    quoteVi: 'Học rộng biết sâu, chí hướng vững chắc',
    decors: [
      { char: '博', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '学', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '志', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '智', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
  HSK6: {
    desc: '精通级',
    heroGrad: 'linear-gradient(135deg, #111827 0%, #7F1D1D 45%, #1E3A8A 100%)',
    accent: '#991B1B', accentRgb: '153,27,27',
    quote: '學如逆水行舟，不進則退',
    quoteRomaji: 'Xué rú nì shuǐ xíng zhōu',
    quoteVi: 'Học như chèo thuyền ngược nước, không tiến tức lùi',
    decors: [
      { char: '逆', x: '4%',  y: '8%',  rot: '-12deg', size: '84px' },
      { char: '水', x: '74%', y: '5%',  rot: '16deg',  size: '96px' },
      { char: '精', x: '85%', y: '54%', rot: '-8deg',  size: '88px' },
      { char: '通', x: '46%', y: '63%', rot: '10deg',  size: '80px' },
    ],
  },
};

const TEXTBOOK_META: Record<string, { vocab: string; grammar: string }> = {
  N5: { vocab: 'Minna no Nihongo I (Bài 1~25)',   grammar: 'Minna no Nihongo I — Ngữ pháp' },
  N4: { vocab: 'Minna no Nihongo II (Bài 26~50)', grammar: 'Minna no Nihongo II — Ngữ pháp' },
  N3: { vocab: 'Mimikara Oboeru N3 Goi',           grammar: 'Shin Kanzen Master N3' },
  N2: { vocab: 'Mimikara Oboeru N2 Goi',           grammar: 'Shin Kanzen Master N2' },
  N1: { vocab: 'Mimikara Oboeru N1 Goi',           grammar: 'Shin Kanzen Master N1' },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

/** ✅ S1: Structural level data — cached 1 hour, same for all users.
 *  Progress is fetched separately as a lightweight user-specific query. */
const getCachedLevelStructure = unstable_cache(
  (code: string) =>
    prisma.level.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        learningCategories: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { items: true } } },
              // No progress here — fetched separately per user
            },
          },
          orderBy: [{ skill: 'asc' }, { order: 'asc' }],
        },
      },
    }),
  ['level-structure'],
  { revalidate: 3600, tags: ['level-structure'] },
);

export const dynamic = 'force-dynamic';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LearnLevelPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userId  = (session?.user as any)?.id as string | undefined;

  // ✅ S1: Structural data from cache — fast, shared across all users
  const level = await getCachedLevelStructure(params.level);
  if (!level) notFound();

  // ✅ S1: Progress — lightweight per-user query (only completed lesson IDs)
  const allLessonIds = level.learningCategories.flatMap(c => c.lessons.map(l => l.id));
  const progressRows = userId && allLessonIds.length > 0
    ? await prisma.lessonProgress.findMany({
        where: { userId, lessonId: { in: allLessonIds } },
        select: { lessonId: true, completed: true },
      })
    : [];
  const completedSet = new Set(progressRows.filter(p => p.completed).map(p => p.lessonId));

  const isJapanese = level.subject === Subject.JLPT;
  const isChinese  = level.subject === Subject.HSK;

  const metaMap = isChinese ? HSK_META : JLPT_META;
  const meta = metaMap[level.code] ?? {
    desc: '',
    heroGrad: 'linear-gradient(135deg,#1E3A8A,#2563EB)',
    accent: '#2563EB', accentRgb: '37,99,235',
    quote: '学習は続く', quoteRomaji: '', quoteVi: 'Hành trình học tập vẫn tiếp diễn',
    decors: [],
  };

  const textbook  = TEXTBOOK_META[level.code as keyof typeof TEXTBOOK_META];

  const vocabCats   = level.learningCategories.filter(c => c.skill === 'vocab');
  const grammarCats = level.learningCategories.filter(c => c.skill === 'grammar');

  // Compute progress across all lessons (both tabs) for the hero
  const allLessons       = [...vocabCats, ...grammarCats].flatMap(cat => cat.lessons);
  const totalLessons     = allLessons.length;
  const completedLessons = allLessons.filter(l => completedSet.has(l.id)).length;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // SVG circular progress ring constants
  const R    = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ - (progressPct / 100) * circ;

  const vocabLessonCount   = vocabCats.flatMap(c => c.lessons).length;
  const grammarLessonCount = grammarCats.flatMap(c => c.lessons).length;

  // Flat lesson list for the learning path map
  const roadmapLessons: PathLesson[] = [
    ...vocabCats.flatMap(cat => cat.lessons.map(l => ({
      id: l.id, title: l.title, description: l.description,
      type: 'vocab', itemCount: l._count.items, isCompleted: completedSet.has(l.id),
    }))),
    ...grammarCats.flatMap(cat => cat.lessons.map(l => ({
      id: l.id, title: l.title, description: l.description,
      type: 'grammar', itemCount: l._count.items, isCompleted: completedSet.has(l.id),
    }))),
  ];

  // Community posts for this level
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ══════════════ HERO OVERVIEW ══════════════ */}
      <div className="relative overflow-hidden" style={{ background: meta.heroGrad }}>
        {/* Decorative kanji */}
        {meta.decors.map((d, i) => (
          <span key={i} className="absolute select-none pointer-events-none font-black"
            style={{ left: d.x, top: d.y, transform: `rotate(${d.rot})`, fontSize: d.size,
                     color: 'rgba(255,255,255,0.055)', lineHeight: 1, zIndex: 0 }}>
            {d.char}
          </span>
        ))}

        <div className="relative z-10 px-4 sm:px-8 py-8 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-5 text-xs font-medium"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <Link href={`/${params.lang}/learn`}
              className="flex items-center gap-1 hover:text-white transition-colors">
              <FaArrowLeft size={9} /> Học
            </Link>
            <FaChevronRight size={7} />
            <span className="text-white font-bold">{level.code}</span>
          </div>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left: level info */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.3)',
                           boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  {level.code}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {level.name}
                  </h1>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {meta.desc}
                  </p>
                  {level.description && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {level.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Quote */}
              <div className="pl-4 border-l-2 border-white/30">
                <p className="text-base sm:text-lg font-bold text-white italic leading-snug">
                  {meta.quote}
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {meta.quoteRomaji}
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {meta.quoteVi}
                </p>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2">
                {vocabLessonCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.16)' }}>
                    <FaBookOpen size={10} /> {vocabLessonCount} bài từ vựng
                  </span>
                )}
                {grammarLessonCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.16)' }}>
                    <FaRuler size={10} /> {grammarLessonCount} bài ngữ pháp
                  </span>
                )}
                {textbook && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.16)' }}>
                    <FaGraduationCap size={10} /> {textbook.vocab}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex gap-2.5 flex-wrap">
                <Link href={`/${params.lang}/learn/${level.code}/lessons?tab=vocab`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ background: 'white', color: meta.accent,
                           boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                  <FaBookOpen size={12} /> Học Từ Vựng
                </Link>
                <Link href={`/${params.lang}/learn/${level.code}/lessons?tab=grammar`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 border"
                  style={{ borderColor: 'rgba(255,255,255,0.35)',
                           background: 'rgba(255,255,255,0.14)', color: 'white' }}>
                  <FaRuler size={12} /> Ngữ Pháp
                </Link>
              </div>
            </div>

            {/* Right: Progress ring (only if logged in) */}
            {userId && (
              <div className="shrink-0 flex flex-col items-center gap-2 self-start">
                <div className="relative w-28 h-28">
                  <svg width="112" height="112" viewBox="0 0 96 96"
                    style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r={R} fill="none" strokeWidth="7"
                      stroke="rgba(255,255,255,0.2)" />
                    <circle cx="48" cy="48" r={R} fill="none" strokeWidth="7"
                      stroke="white" strokeDasharray={circ} strokeDashoffset={dash}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-2xl font-black text-white">{progressPct}%</span>
                    <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      hoàn thành
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{completedLessons}/{totalLessons}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>bài học</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ STATS + 2-COL CONTENT ══════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {/* Vocab lessons */}
          <div className="rounded-2xl p-4 flex flex-col gap-1.5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${meta.accentRgb},.12)` }}>
              <FaBookOpen size={13} style={{ color: meta.accent }} />
            </div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {vocabLessonCount}
            </p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Bài từ vựng
            </p>
          </div>

          {/* Grammar lessons */}
          <div className="rounded-2xl p-4 flex flex-col gap-1.5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${meta.accentRgb},.12)` }}>
              <FaRuler size={13} style={{ color: meta.accent }} />
            </div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {grammarLessonCount}
            </p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Bài ngữ pháp
            </p>
          </div>

          {/* Textbook */}
          {textbook && (
            <div className="rounded-2xl p-4 flex flex-col gap-1.5 col-span-2 sm:col-span-1"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${meta.accentRgb},.12)` }}>
                <FaGraduationCap size={13} style={{ color: meta.accent }} />
              </div>
              <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                {textbook.vocab}
              </p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Giáo trình
              </p>
            </div>
          )}

          {/* Progress */}
          {userId && (
            <div className="rounded-2xl p-4 flex flex-col gap-1.5"
              style={{ background: `rgba(${meta.accentRgb},.07)`, border: `1px solid rgba(${meta.accentRgb},.2)` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${meta.accentRgb},.18)` }}>
                <span className="text-sm">🎯</span>
              </div>
              <p className="text-xl font-black" style={{ color: meta.accent }}>
                {progressPct}%
              </p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Hoàn thành
              </p>
            </div>
          )}
        </div>

        {/* 2-column: posts (left) + map (right) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Posts section */}
          <div className="flex-1 min-w-0">
            <LevelPostsSection
              levelCode={level.code}
              initialPosts={posts}
              userId={userId}
              userName={(session?.user as { name?: string } | undefined)?.name ?? undefined}
            />
          </div>

          {/* Learning path map */}
          {roadmapLessons.length > 0 && (
            <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-20">
              <LearningPathMap
                lessons={roadmapLessons}
                accentColor={meta.accent}
                accentRgb={meta.accentRgb}
                lessonsHref={`/${params.lang}/learn/${level.code}/lessons`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

