import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Subject } from '@prisma/client';
import {
  FaBookOpen, FaRuler,
  FaGraduationCap, FaFire,
} from 'react-icons/fa6';
import LearnLevelClient, { type CategoryData } from './LearnLevelClient';

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

  // Compute progress across all lessons (both tabs) for the hero
  const allLessons = [...vocabCats, ...grammarCats].flatMap(cat => cat.lessons);
  const totalLessons     = allLessons.length;
  const completedLessons = userId
    ? allLessons.filter(l => (l.progress as any[])?.some((p: any) => p.completed)).length
    : 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // SVG circular progress ring constants
  const R    = 36;
  const circ = 2 * Math.PI * R;
  const dash = circ - (progressPct / 100) * circ;

  // Build client-safe category data (no raw prisma progress arrays)
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
        isCompleted: userId
          ? (l.progress as any[])?.some((p: any) => p.completed)
          : false,
      })),
    }));
  }
  const clientVocabCats   = toClientCats(vocabCats);
  const clientGrammarCats = toClientCats(grammarCats);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden" style={{ background: meta.heroGrad, minHeight: 240 }}>

        {meta.decors.map(({ char, x, y, rot, size }, i) => (
          <span key={i} aria-hidden className="absolute select-none pointer-events-none"
            style={{ left: x, top: y, transform: `rotate(${rot})`, fontSize: size,
              opacity: 0.09, color: '#fff', fontWeight: 900, lineHeight: 1 }}>
            {char}
          </span>
        ))}

        {isJapanese && (
          <svg aria-hidden className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ height: 72, opacity: 0.09 }} viewBox="0 0 1400 72" preserveAspectRatio="xMidYMax slice">
            <path d="M0,72 L0,42 Q175,14 350,42 Q525,70 700,42 Q875,14 1050,42 Q1225,70 1400,42 L1400,72Z" fill="white"/>
            <path d="M530,72 L700,10 L870,72Z" fill="white"/>
            <path d="M672,28 L700,10 L728,28 Q700,34 672,28Z" fill="white" opacity="0.7"/>
          </svg>
        )}
        {isChinese && (
          <svg aria-hidden className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ height: 64, opacity: 0.09 }} viewBox="0 0 1400 64" preserveAspectRatio="xMidYMax slice">
            <path d="M0,64 L0,38 Q100,18 200,30 Q300,44 400,28 Q500,12 600,28 Q700,44 800,28 Q900,12 1000,28 Q1100,44 1200,30 Q1300,18 1400,38 L1400,64Z" fill="white"/>
            <ellipse cx="200" cy="30" rx="40" ry="18" fill="white" opacity="0.5"/>
            <ellipse cx="600" cy="26" rx="50" ry="20" fill="white" opacity="0.5"/>
            <ellipse cx="1000" cy="26" rx="45" ry="18" fill="white" opacity="0.5"/>
          </svg>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6" style={{ paddingTop: 28, paddingBottom: 40 }}>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href={`/${params.lang}/learn`} className="hover:text-white transition-colors">Học</Link>
            <span className="opacity-50">›</span>
            <span style={{ color: 'rgba(255,255,255,.95)', fontWeight: 600 }}>{level.code}</span>
          </nav>

          <div className="flex items-center gap-5">
            {/* Level badge */}
            <div className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black"
              style={{ width: 72, height: 72, minWidth: 72,
                background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,.32)', color: '#fff',
                fontSize: level.code.length > 3 ? 18 : 26, letterSpacing: '-1px',
                boxShadow: '0 8px 28px rgba(0,0,0,.22)' }}>
              {level.code}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.95)' }}>
                  {isChinese ? 'HSK' : 'JLPT'} · {meta.desc}
                </span>
                {userId && totalLessons > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.9)' }}>
                    <FaFire size={10} style={{ color: '#FCD34D' }} />
                    {completedLessons}/{totalLessons} bài · {progressPct}%
                  </span>
                )}
              </div>
              <div className="inline-flex flex-col gap-0.5 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(0,0,0,.2)', backdropFilter: 'blur(6px)' }}>
                <span className="text-sm font-bold" style={{ color: '#fff' }}>「{meta.quote}」</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,.75)' }}>— {meta.quoteVi}</span>
              </div>
            </div>

            {/* Circular progress */}
            {userId && totalLessons > 0 && (
              <div className="flex-shrink-0 hidden sm:block">
                <svg width={80} height={80} viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5.5"/>
                  <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="5.5"
                    strokeDasharray={circ} strokeDashoffset={dash}
                    strokeLinecap="round" transform="rotate(-90 48 48)"/>
                  <text x="48" y="44" textAnchor="middle" fill="white" fontWeight="bold" fontSize="17">{progressPct}%</text>
                  <text x="48" y="58" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="8">hoàn thành</text>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ SIDEBAR + CONTENT ══════════════ */}
      <LearnLevelClient
        vocabCats={clientVocabCats}
        grammarCats={clientGrammarCats}
        defaultTab={activeTab}
        accentColor={meta.accent}
        accentRgb={meta.accentRgb}
        lang={params.lang}
        levelCode={level.code}
        userId={userId}
      />

      {/* ── Textbook reference (server-rendered) ── */}
      {textbook && (
        <div className="px-4 sm:px-6 pb-6" style={{ marginLeft: 272 }}>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
            <FaGraduationCap size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'vocab' ? textbook.vocab : textbook.grammar}
            </span>
          </div>
        </div>
      )}

      {/* ── Legacy skill-based content ── */}
      {!hasNewContent && legacyCats.length > 0 && (
        <div className="px-4 sm:px-6 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Kỹ năng khác</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {legacyCats.map(cat => (
              <Link key={cat.id} href={`/${params.lang}/learn/${level.code}/${cat.skill}/${cat.id}`}
                className="card-hover border flex items-center gap-4">
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

