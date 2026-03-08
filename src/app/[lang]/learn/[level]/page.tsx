import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Subject } from '@prisma/client';
import {
  FaCircleCheck, FaBookOpen, FaRuler, FaArrowRight,
  FaGraduationCap, FaLayerGroup,
} from 'react-icons/fa6';

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LearnLevelPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userId  = (session?.user as any)?.id as string | undefined;

  const level = await getLevelData(params.level, userId);
  if (!level) notFound();

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
  const activeTab = searchParams?.tab === 'grammar' ? 'grammar' : 'vocab';

  const vocabCats   = level.learningCategories.filter(c => c.skill === 'vocab');
  const grammarCats = level.learningCategories.filter(c => c.skill === 'grammar');
  const legacyCats  = level.learningCategories.filter(c => !['vocab', 'grammar'].includes(c.skill));
  const hasNewContent = vocabCats.length > 0 || grammarCats.length > 0;
  const activeCats    = activeTab === 'grammar' ? grammarCats : vocabCats;

  const allLessons = activeCats.flatMap(cat =>
    cat.lessons.map(l => ({ ...l, catId: cat.id, catSkill: cat.skill }))
  );
  const totalLessons     = allLessons.length;
  const completedLessons = userId
    ? allLessons.filter(l => (l.progress as any[])?.some((p: any) => p.completed)).length
    : 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // SVG circular progress
  const R    = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ - (progressPct / 100) * circ;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden" style={{ background: meta.heroGrad, minHeight: 280 }}>

        {/* Kanji / Hanzi decorative watermarks */}
        {meta.decors.map(({ char, x, y, rot, size }, i) => (
          <span key={i} aria-hidden className="absolute select-none pointer-events-none"
            style={{ left: x, top: y, transform: `rotate(${rot})`, fontSize: size,
              opacity: 0.09, color: '#fff', fontWeight: 900, lineHeight: 1 }}>
            {char}
          </span>
        ))}

        {/* Japanese: Mt. Fuji + wave silhouette */}
        {isJapanese && (
          <svg aria-hidden className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ height: 72, opacity: 0.09 }} viewBox="0 0 1400 72"
            preserveAspectRatio="xMidYMax slice">
            {/* rolling wave */}
            <path d="M0,72 L0,42 Q175,14 350,42 Q525,70 700,42 Q875,14 1050,42 Q1225,70 1400,42 L1400,72Z" fill="white"/>
            {/* mountain silhouette */}
            <path d="M530,72 L700,10 L870,72Z" fill="white"/>
            {/* snow cap */}
            <path d="M672,28 L700,10 L728,28 Q700,34 672,28Z" fill="white" opacity="0.7"/>
          </svg>
        )}

        {/* Chinese: cloud band at bottom */}
        {isChinese && (
          <svg aria-hidden className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ height: 64, opacity: 0.09 }} viewBox="0 0 1400 64"
            preserveAspectRatio="xMidYMax slice">
            <path d="M0,64 L0,38 Q100,18 200,30 Q300,44 400,28 Q500,12 600,28 Q700,44 800,28 Q900,12 1000,28 Q1100,44 1200,30 Q1300,18 1400,38 L1400,64Z" fill="white"/>
            {/* decorative cloud bumps */}
            <ellipse cx="200" cy="30" rx="40" ry="18" fill="white" opacity="0.5"/>
            <ellipse cx="600" cy="26" rx="50" ry="20" fill="white" opacity="0.5"/>
            <ellipse cx="1000" cy="26" rx="45" ry="18" fill="white" opacity="0.5"/>
          </svg>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: 36, paddingBottom: 48 }}>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-8"
            style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href={`/${params.lang}/learn`} className="hover:text-white transition-colors">Học</Link>
            <span className="opacity-50">›</span>
            <span style={{ color: 'rgba(255,255,255,.95)', fontWeight: 600 }}>{level.code}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Level badge + info */}
            <div className="flex items-start gap-5 flex-1 min-w-0">
              {/* Big level badge */}
              <div className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black"
                style={{ width: 84, height: 84, minWidth: 84,
                  background: 'rgba(255,255,255,.16)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,.32)',
                  color: '#fff',
                  fontSize: level.code.length > 3 ? 20 : 28,
                  letterSpacing: '-1px',
                  boxShadow: '0 8px 28px rgba(0,0,0,.22)',
                }}>
                {level.code}
              </div>

              <div className="min-w-0">
                {/* Subject + level tag */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.95)', letterSpacing: '0.04em' }}>
                    {isChinese ? 'HSK' : 'JLPT'} · {meta.desc}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-white mb-3" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                  {isJapanese ? '日本語' : isChinese ? '中文' : level.name}
                  <span className="ml-2 opacity-70" style={{ fontWeight: 400, fontSize: '1.4rem' }}>{level.code}</span>
                </h1>

                {/* Cultural quote card */}
                <div className="inline-flex flex-col gap-1 px-3.5 py-2.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,.22)', backdropFilter: 'blur(6px)', maxWidth: 460 }}>
                  <span className="text-base font-bold" style={{ color: '#fff', fontStyle: 'normal', letterSpacing: '0.03em' }}>
                    「{meta.quote}」
                  </span>
                  {meta.quoteRomaji && (
                    <span className="text-xs italic" style={{ color: 'rgba(255,255,255,.72)' }}>
                      {meta.quoteRomaji}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,.82)' }}>
                    — {meta.quoteVi}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular progress ring (logged-in only) */}
            {userId && totalLessons > 0 && (
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <svg width={96} height={96} viewBox="0 0 96 96">
                  {/* Background track */}
                  <circle cx="48" cy="48" r={R} fill="none"
                    stroke="rgba(255,255,255,.2)" strokeWidth="5.5"/>
                  {/* Progress fill */}
                  <circle cx="48" cy="48" r={R} fill="none"
                    stroke="rgba(255,255,255,.92)" strokeWidth="5.5"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                    strokeLinecap="round"
                    transform="rotate(-90 48 48)"/>
                  {/* Center label */}
                  <text x="48" y="44" textAnchor="middle" fill="white"
                    fontWeight="bold" fontSize="17">{progressPct}%</text>
                  <text x="48" y="58" textAnchor="middle" fill="rgba(255,255,255,.75)"
                    fontSize="8.5">hoàn thành</text>
                </svg>
                <div className="text-center text-xs font-medium" style={{ color: 'rgba(255,255,255,.8)' }}>
                  {completedLessons}/{totalLessons} bài
                </div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {vocabCats.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.92)' }}>
                <FaBookOpen size={13}/>
                <span>{vocabCats.reduce((s, c) => s + c.lessons.length, 0)} bài từ vựng</span>
              </div>
            )}
            {grammarCats.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.92)' }}>
                <FaRuler size={13}/>
                <span>{grammarCats.reduce((s, c) => s + c.lessons.length, 0)} bài ngữ pháp</span>
              </div>
            )}
            {textbook && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,.10)', color: 'rgba(255,255,255,.80)' }}>
                <FaGraduationCap size={13}/>
                <span className="hidden sm:inline">
                  {activeTab === 'vocab' ? textbook.vocab : textbook.grammar}
                </span>
                <span className="sm:hidden">Giáo trình</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7 pb-14">

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 mb-7 p-1 rounded-2xl"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
          {(['vocab', 'grammar'] as const).map(tab => {
            const count = tab === 'vocab'
              ? vocabCats.reduce((s, c) => s + c.lessons.length, 0)
              : grammarCats.reduce((s, c) => s + c.lessons.length, 0);
            const active = activeTab === tab;
            return (
              <Link key={tab}
                href={`/${params.lang}/learn/${level.code}?tab=${tab}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all"
                style={active
                  ? { background: meta.accent, color: '#fff', boxShadow: `0 2px 12px rgba(${meta.accentRgb},.35)` }
                  : { color: 'var(--text-secondary)' }}>
                {tab === 'vocab' ? <FaBookOpen size={13}/> : <FaRuler size={13}/>}
                {tab === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'}
                {count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={active
                      ? { background: 'rgba(255,255,255,.24)', color: '#fff' }
                      : { background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Category sections ── */}
        {activeCats.length > 0 ? (
          <div className="space-y-9">
            {activeCats.map((cat) => {
              const catTotal     = cat.lessons.length;
              const catCompleted = userId
                ? cat.lessons.filter(l => (l.progress as any[])?.some((p: any) => p.completed)).length
                : 0;
              const catPct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

              return (
                <div key={cat.id}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 font-bold"
                      style={{
                        background: `rgba(${meta.accentRgb},.1)`,
                        color: meta.accent,
                        border: `1.5px solid rgba(${meta.accentRgb},.18)`,
                      }}>
                      {cat.icon ? cat.icon : <FaLayerGroup size={17}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                    {/* Per-category progress */}
                    {userId && catTotal > 0 && (
                      <div className="flex-shrink-0 flex items-center gap-2 hidden sm:flex">
                        <div className="h-1.5 w-24 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-muted)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${catPct}%`,
                              background: catPct === 100
                                ? '#10B981'
                                : `linear-gradient(90deg, ${meta.accent}, rgba(${meta.accentRgb},.6))`,
                            }}/>
                        </div>
                        <span className="text-xs font-bold tabular-nums"
                          style={{ color: catPct === 100 ? '#059669' : meta.accent, minWidth: 34 }}>
                          {catPct}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Accent rule under header */}
                  <div className="h-px mb-3 rounded-full"
                    style={{ background: `linear-gradient(90deg, rgba(${meta.accentRgb},.35) 0%, transparent 70%)` }}/>

                  {/* Lesson list */}
                  <div className="space-y-2">
                    {cat.lessons.map((lesson, idx) => {
                      const isCompleted  = userId && (lesson.progress as any[])?.some((p: any) => p.completed);
                      const hasProgress  = userId && !!( (lesson.progress as any[])?.length > 0);
                      const isInProgress = hasProgress && !isCompleted;
                      const href = `/${params.lang}/learn/${level.code}/${cat.skill}/${cat.id}/${lesson.id}`;

                      return (
                        <Link key={lesson.id} href={href}
                          className="group flex items-center gap-3 rounded-xl transition-all hover:shadow-sm"
                          style={{
                            padding: '12px 16px',
                            background: isCompleted
                              ? `rgba(16,185,129,.07)`
                              : isInProgress
                                ? `rgba(${meta.accentRgb},.05)`
                                : 'var(--bg-surface)',
                            border: `1.5px solid ${
                              isCompleted  ? 'rgba(16,185,129,.25)' :
                              isInProgress ? `rgba(${meta.accentRgb},.22)` :
                              'var(--border)'
                            }`,
                          }}>

                          {/* Step indicator */}
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                            style={
                              isCompleted  ? { background: '#D1FAE5', color: '#065F46' } :
                              isInProgress ? { background: `rgba(${meta.accentRgb},.15)`, color: meta.accent } :
                              { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                            }>
                            {isCompleted
                              ? <FaCircleCheck size={16}/>
                              : <span style={{ fontSize: 11, fontWeight: 700 }}>
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                            }
                          </div>

                          {/* Title + Description */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm leading-snug"
                              style={{ color: isCompleted ? '#065F46' : 'var(--text-primary)' }}>
                              {lesson.title}
                            </div>
                            {lesson.description && (
                              <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                                {lesson.description}
                              </div>
                            )}
                          </div>

                          {/* Item count badge */}
                          {lesson._count.items > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{
                                background: isCompleted
                                  ? 'rgba(16,185,129,.14)'
                                  : `rgba(${meta.accentRgb},.12)`,
                                color: isCompleted ? '#059669' : meta.accent,
                              }}>
                              {lesson._count.items} mục
                            </span>
                          )}

                          {/* Arrow */}
                          <FaArrowRight size={12} className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                            style={{
                              color: isCompleted ? '#10B981' : meta.accent,
                              opacity: isCompleted ? 0.7 : 0.4,
                            }}/>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-4">{activeTab === 'vocab' ? '📖' : '📐'}</div>
            <div className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Chưa có nội dung {activeTab === 'vocab' ? 'từ vựng' : 'ngữ pháp'} cho {level.code}
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Chạy seed để tạo nội dung học tập.
            </p>
            <Link href="/admin/seed" className="text-sm underline font-medium"
              style={{ color: meta.accent }}>
              Admin → Seed →
            </Link>
          </div>
        )}

        {/* ── Legacy skill-based content (nghe/noi/doc/viet) ── */}
        {!hasNewContent && legacyCats.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-muted)' }}>
              Kỹ năng khác
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {legacyCats.map(cat => (
                <Link key={cat.id}
                  href={`/${params.lang}/learn/${level.code}/${cat.skill}/${cat.id}`}
                  className="card-hover border flex items-center gap-4">
                  <div className="text-3xl flex-shrink-0">{cat.icon ?? '📂'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5">{cat.name}</div>
                    {cat.description && (
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {cat.description}
                      </p>
                    )}
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {cat.lessons.length} bài học
                    </div>
                  </div>
                  <FaArrowRight size={13} style={{ opacity: 0.4, flexShrink: 0 }}/>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

