'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaNewspaper, FaAlignLeft, FaAlignJustify,
  FaClock, FaBookmark, FaBook, FaGraduationCap,
  FaListUl, FaArrowUpRightFromSquare, FaChevronRight,
  FaFilter, FaBolt,
} from 'react-icons/fa6';
import { JapaneseText } from '@/components/JapaneseText';
import { LearnSidebar } from '@/components/LearnSidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PassageSummary {
  id: string; title: string; titleVi: string | null;
  summary: string | null; level: string; type: string;
  source: string | null; tags: string | null;
  charCount: number; createdAt: string;
}

interface PassageDetail extends PassageSummary {
  content: string; sourceUrl: string | null;
  pinyin?: string | null; translation?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5:   { bg: '#DCFCE7', color: '#15803D' },
  N4:   { bg: '#DBEAFE', color: '#1D4ED8' },
  N3:   { bg: '#FEF9C3', color: '#92400E' },
  N2:   { bg: '#FFEDD5', color: '#C2410C' },
  N1:   { bg: '#FFE4E6', color: '#BE123C' },
  HSK1: { bg: '#DCFCE7', color: '#15803D' },
  HSK2: { bg: '#DBEAFE', color: '#1D4ED8' },
  HSK3: { bg: '#FEF9C3', color: '#92400E' },
  HSK4: { bg: '#FFEDD5', color: '#C2410C' },
  HSK5: { bg: '#F3E8FF', color: '#6B21A8' },
  HSK6: { bg: '#FFE4E6', color: '#BE123C' },
};

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  short: { label: 'Đoạn ngắn', icon: <FaAlignLeft  size={10} />, bg: '#EFF6FF', color: '#2563EB' },
  long:  { label: 'Bài dài',   icon: <FaAlignJustify size={10} />, bg: '#F5F3FF', color: '#7C3AED' },
  news:  { label: 'Tin tức',   icon: <FaNewspaper size={10} />,  bg: '#FFF7ED', color: '#EA580C' },
};

function readTime(chars: number) { return `${Math.ceil(chars / 400)} phút`; }

// ─── Grammar analysis (JLPT only) ─────────────────────────────────────────────

interface GrammarPoint { id: string; name: string; meaning: string; pattern: RegExp; highlight: string; }
interface GrammarMatch { id: string; name: string; meaning: string; level: string; highlight: string; example: string; }

const GRAMMAR_DB: Record<string, GrammarPoint[]> = {
  N5: [
    { id:'wa',   name:'〜は〜',     meaning:'Trợ từ chủ đề câu',                            pattern:/は/,                                highlight:'は' },
    { id:'ga',   name:'〜が〜',     meaning:'Trợ từ chủ ngữ — nhấn mạnh chủ thể',           pattern:/が/,                                highlight:'が' },
    { id:'wo',   name:'〜を〜',     meaning:'Trợ từ tân ngữ trực tiếp',                     pattern:/を/,                                highlight:'を' },
    { id:'de',   name:'〜で〜',     meaning:'Nơi diễn ra hành động / phương tiện',          pattern:/[^\s]で[^\s]/,                      highlight:'で' },
    { id:'ni',   name:'〜に〜',     meaning:'Điểm đến / thời điểm / đối tượng',            pattern:/[^\s]に[^\s]/,                      highlight:'に' },
    { id:'nai',  name:'〜ない',     meaning:'Phủ định động từ thông thường',               pattern:/ない[でですがをにもから]/,           highlight:'ない' },
    { id:'te',   name:'〜て〜',     meaning:'Liên kết hành động liên tiếp (て形)',          pattern:/[くがみりっ]て[いなくもお]/,        highlight:'て' },
    { id:'kara', name:'〜から',     meaning:'Từ ~ / vì ~ (nguyên nhân / xuất phát)',       pattern:/[^\s]から/,                         highlight:'から' },
    { id:'desu', name:'です／ます', meaning:'Thể lịch sự trong văn phong trang trọng',    pattern:/[ですけりかよ]ます|[ないきてで]です/, highlight:'です' },
  ],
  N4: [
    { id:'tekara',       name:'〜てから',       meaning:'Sau khi làm ~, rồi mới ~',                  pattern:/てから/,                    highlight:'てから' },
    { id:'nagara',       name:'〜ながら',       meaning:'Hai hành động đồng thời',                   pattern:/ながら/,                    highlight:'ながら' },
    { id:'teshimau',     name:'〜てしまう',     meaning:'Lỡ làm ~ / hoàn toàn đã làm ~',            pattern:/てしまう|でしまう/,          highlight:'てしまう' },
    { id:'tame',         name:'〜ために',       meaning:'Vì mục đích ~ / bởi lý do ~',              pattern:/ために/,                    highlight:'ために' },
    { id:'youni',        name:'〜ように',       meaning:'Để có thể ~ / dần dần trở nên ~',          pattern:/ように[するなっ]/,           highlight:'ように' },
    { id:'bakari',       name:'〜ばかり',       meaning:'Vừa mới ~ / chỉ toàn ~',                   pattern:/ばかり/,                    highlight:'ばかり' },
    { id:'toki',         name:'〜とき',         meaning:'Khi ~ (thời điểm xảy ra)',                 pattern:/とき[、。\nに]/,             highlight:'とき' },
    { id:'kamoshirenai', name:'〜かもしれない', meaning:'Có thể là ~ (không chắc chắn)',            pattern:/かもしれない|かもしれません/,  highlight:'かもしれない' },
    { id:'souda',        name:'〜そうだ',       meaning:'Trông có vẻ ~ / nghe nói rằng ~',          pattern:/そうだ|そうです|そうな/,      highlight:'そうだ' },
    { id:'rashii',       name:'〜らしい',       meaning:'Có vẻ ~ / mang đặc tính của ~',            pattern:/らしい|らしく/,              highlight:'らしい' },
  ],
  N3: [
    { id:'niyotte',  name:'〜によって',     meaning:'Tùy theo ~ / được thực hiện bởi ~',      pattern:/によって|による/,          highlight:'によって' },
    { id:'toiu',     name:'〜という',       meaning:'Được gọi là ~ / ý kiến rằng ~',           pattern:/という/,                   highlight:'という' },
    { id:'dakede',   name:'〜だけでなく',   meaning:'Không chỉ ~ mà còn ~',                   pattern:/だけでなく/,                highlight:'だけでなく' },
    { id:'hazu',     name:'〜はずだ',       meaning:'Đáng lẽ phải ~ / chắc chắn là ~',        pattern:/はずだ|はずです|はずが/,    highlight:'はず' },
    { id:'noni',     name:'〜のに',         meaning:'Mặc dù ~ (thất vọng / trái kỳ vọng)',    pattern:/[^\s]のに[、。\n]/,         highlight:'のに' },
    { id:'youda',    name:'〜ようだ',       meaning:'Trông giống như ~ / có vẻ như ~',         pattern:/ようだ|ようです|ような/,    highlight:'ようだ' },
    { id:'kotoga',   name:'〜ことができる', meaning:'Có thể làm ~',                            pattern:/ことができ/,                highlight:'ことができ' },
    { id:'tabi',     name:'〜たびに',       meaning:'Mỗi lần ~ / khi nào ~ thì ~',            pattern:/たびに/,                    highlight:'たびに' },
    { id:'sokode',   name:'そこで〜',       meaning:'Vì vậy / do đó (kết quả tất yếu)',       pattern:/そこで/,                    highlight:'そこで' },
    { id:'tsumori',  name:'〜つもりだ',     meaning:'Có dự định làm ~',                       pattern:/つもり/,                    highlight:'つもり' },
  ],
  N2: [
    { id:'niokite',  name:'〜において',       meaning:'Trong lĩnh vực ~ (trang trọng)',           pattern:/において|における/,       highlight:'において' },
    { id:'nitaish',  name:'〜に対して',       meaning:'Đối với ~ / phản ứng lại ~',              pattern:/に対して|に対する/,       highlight:'に対して' },
    { id:'nitotte',  name:'〜にとって',       meaning:'Đối với ai / từ góc nhìn của ~',          pattern:/にとって/,                highlight:'にとって' },
    { id:'toshite',  name:'〜として',         meaning:'Với tư cách là ~ / trong vai trò ~',      pattern:/として/,                  highlight:'として' },
    { id:'niyoruto', name:'〜によると',       meaning:'Theo nguồn ~ / dựa theo ~',               pattern:/によると|によれば/,       highlight:'によると' },
    { id:'nimotoka', name:'〜にもかかわらず', meaning:'Dù cho ~ (trái kỳ vọng, trang trọng)',    pattern:/にもかかわらず/,          highlight:'にもかかわらず' },
    { id:'womajime', name:'〜をはじめ',       meaning:'Đứng đầu danh sách ~ / bao gồm ~',       pattern:/をはじめ/,                highlight:'をはじめ' },
    { id:'uede',     name:'〜うえで',         meaning:'Trên cơ sở ~ / sau khi làm ~',           pattern:/うえで|うえに/,           highlight:'うえで' },
    { id:'sarani',   name:'さらに〜',         meaning:'Hơn nữa / thêm vào đó',                  pattern:/さらに/,                  highlight:'さらに' },
    { id:'tooshite', name:'〜を通して',       meaning:'Thông qua ~ / suốt quá trình ~',         pattern:/を通して|を通じて/,       highlight:'を通して' },
  ],
  N1: [
    { id:'womotte',   name:'〜をもって',     meaning:'Bằng phương tiện ~ / kể từ ~ (rất trang trọng)', pattern:/をもって/,             highlight:'をもって' },
    { id:'womegute',  name:'〜をめぐって',   meaning:'Xoay quanh vấn đề ~',                           pattern:/をめぐって|をめぐる/,  highlight:'をめぐって' },
    { id:'nisaishi',  name:'〜に際して',     meaning:'Nhân dịp ~ / vào lúc quan trọng ~',             pattern:/に際して|に際し/,      highlight:'に際して' },
    { id:'karasite',  name:'〜からして',     meaning:'Ngay cả ~ đã / xét từ bản thân ~',             pattern:/からして/,             highlight:'からして' },
    { id:'bekida',    name:'〜べきだ',       meaning:'Nên làm ~ / có nghĩa vụ ~',                    pattern:/べきだ|べきで|べき[^\s]/,highlight:'べき' },
    { id:'kagiri',    name:'〜かぎり',       meaning:'Trong giới hạn ~ / chừng nào còn ~',           pattern:/かぎり|限り/,           highlight:'かぎり' },
    { id:'monoda',    name:'〜ものだ',       meaning:'Đương nhiên / bản chất / hồi tưởng',           pattern:/ものだ|ものです|ものがある/,highlight:'ものだ' },
    { id:'nishitemo', name:'〜にしても',     meaning:'Dù là ~ đi nữa / ngay cả khi ~',              pattern:/にしても/,             highlight:'にしても' },
    { id:'koso',      name:'〜こそ',         meaning:'Chính ~ (nhấn mạnh đặc biệt)',                 pattern:/こそ/,                 highlight:'こそ' },
    { id:'taritomo',  name:'〜たりとも',     meaning:'Dù chỉ một ~ cũng không (phủ định tuyệt đối)', pattern:/たりとも/,             highlight:'たりとも' },
  ],
};

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];
const GRAMMAR_LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' }, N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' }, N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

function getLevelsToScan(level: string): string[] {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === -1) return ['N5'];
  return LEVEL_ORDER.slice(0, idx + 1).reverse();
}

function analyzeGrammar(content: string, level: string): GrammarMatch[] {
  const sentences = content.split(/[。！？\n]+/).map(s => s.trim()).filter(s => s.length > 3);
  const results: GrammarMatch[] = [];
  const seen = new Set<string>();
  for (const lk of getLevelsToScan(level)) {
    for (const g of GRAMMAR_DB[lk] ?? []) {
      if (seen.has(g.id)) continue;
      const ex = sentences.find(s => g.pattern.test(s));
      if (ex) { results.push({ id: g.id, name: g.name, meaning: g.meaning, level: lk, highlight: g.highlight, example: ex + '。' }); seen.add(g.id); }
      if (results.length >= 9) break;
    }
    if (results.length >= 9) break;
  }
  return results.sort((a, b) => (a.level === level && b.level !== level) ? -1 : (b.level === level && a.level !== level) ? 1 : 0);
}

function ExampleHighlight({ sentence, keyword }: { sentence: string; keyword: string }) {
  const idx = sentence.indexOf(keyword);
  if (idx === -1) return <span>{sentence}</span>;
  return (
    <>
      <span>{sentence.substring(0, idx)}</span>
      <mark style={{ background: '#FDE68A', color: '#92400E', borderRadius: 3, padding: '0 2px' }}>{keyword}</mark>
      <span>{sentence.substring(idx + keyword.length)}</span>
    </>
  );
}

function GrammarPanel({ passage }: { passage: PassageDetail }) {
  const matches = analyzeGrammar(passage.content, passage.level);
  if (matches.length === 0) return null;
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <FaGraduationCap size={14} style={{ color: 'var(--primary)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>Ngữ pháp trong bài</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{matches.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {matches.map(m => {
          const lc = GRAMMAR_LEVEL_META[m.level] ?? GRAMMAR_LEVEL_META.N5;
          return (
            <div key={m.id} className="rounded-2xl p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: lc.bg, color: lc.color }}>{m.level}</span>
                <span className="font-bold text-xs" style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>{m.name}</span>
              </div>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{m.meaning}</p>
              <div className="rounded-lg px-2 py-1.5" style={{ background: '#FFFBEB' }}>
                <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#92400E' }}>Ví dụ</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
                  <ExampleHighlight sentence={m.example} keyword={m.highlight} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reading detail panel ─────────────────────────────────────────────────────

function ReadingDetail({ passage, lang, locale, savedWords, onWordSaved, savedCount }: {
  passage: PassageDetail; lang: string; locale: string;
  savedWords: string[]; onWordSaved: (w: { term: string; contentId: string }) => void;
  savedCount: number;
}) {
  const { data: session } = useSession();
  const isChinese = lang === 'zh';
  const [fontSize, setFontSize] = useState(18);
  const [showTranslation, setShowTranslation] = useState(false);
  const lm   = LEVEL_META[passage.level] ?? LEVEL_META.N5;
  const tags: string[] = passage.tags ? (passage.tags as unknown as string[]) : [];
  const tm   = TYPE_META[passage.type];

  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto">
      {/* Header card */}
      <div className="card mb-5" style={{ borderTop: `4px solid ${lm.color}` }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: lm.bg, color: lm.color }}>{passage.level}</span>
          {tm && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: tm.bg, color: tm.color }}>
              {tm.icon} {tm.label}
            </span>
          )}
          {tags.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>#{t}</span>
          ))}
          {passage.source && (
            <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <FaNewspaper size={10} />
              {passage.sourceUrl
                ? <a href={passage.sourceUrl} target="_blank" rel="noreferrer"
                    className="underline flex items-center gap-1">
                    {passage.source} <FaArrowUpRightFromSquare size={9} />
                  </a>
                : passage.source}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold mb-1 leading-snug"
          style={{ color: 'var(--text-base)', fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
          {passage.title}
        </h1>
        {passage.titleVi && (
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>{passage.titleVi}</p>
        )}
        {passage.summary && (
          <p className="text-sm mt-2 p-3 rounded-lg"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)', lineHeight: 1.7 }}>
            {passage.summary}
          </p>
        )}
      </div>

      {/* Two-column layout: article + right sidebar */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Article */}
        <div className="flex-1 min-w-0">
          {!isChinese && (
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cỡ chữ:</span>
                {[16, 18, 20, 22].map(sz => (
                  <button key={sz} onClick={() => setFontSize(sz)}
                    className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                    style={fontSize === sz
                      ? { background: 'var(--primary)', color: 'white' }
                      : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {sz === 16 ? 'S' : sz === 18 ? 'M' : sz === 20 ? 'L' : 'XL'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: '#FEF9C3', color: '#92400E' }}>
                💡 Click vào từ để tra nghĩa{session && ' và lưu'}
              </div>
            </div>
          )}

          <div className="card"
            style={{ fontSize, lineHeight: 2.1, fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
            {isChinese
              ? passage.content.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} style={{ marginBottom: '1em', color: 'var(--text-base)' }}>{para}</p>
                ))
              : <JapaneseText content={passage.content} passageId={passage.id}
                  savedWords={savedWords} onWordSaved={onWordSaved} />
            }
          </div>

          {/* Chinese translation toggle */}
          {isChinese && passage.translation && (
            <div className="mt-4 rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowTranslation(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                Bản dịch tiếng Việt
                <FaChevronRight size={11}
                  className={showTranslation ? 'rotate-90 transition-transform' : 'transition-transform'} />
              </button>
              {showTranslation && (
                <div className="px-4 pb-4 pt-2" style={{ background: 'var(--bg-surface)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{passage.translation}</p>
                </div>
              )}
            </div>
          )}

          {/* Saved words banner */}
          {!isChinese && savedCount > 0 && (
            <div className="card mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
                <FaBookmark size={13} style={{ color: 'var(--primary)' }} />
                Đã lưu <strong>{savedCount}</strong> từ mới trong bài này
              </div>
              <Link href={`/${locale}/${lang}/vocab`}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0">
                <FaBook size={11} /> Xem từ vựng
              </Link>
            </div>
          )}
        </div>

        {/* Right: grammar + saved words (JLPT only) */}
        {!isChinese && (
          <div className="w-full xl:w-80 shrink-0 flex flex-col gap-4">
            <GrammarPanel passage={passage} />
            {savedWords.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <FaListUl size={13} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>Từ đã lưu</span>
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{savedWords.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {savedWords.slice(0, 20).map(w => (
                    <span key={w} className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: 'var(--bg-base)', color: 'var(--text-base)',
                        border: '1px solid var(--border)', fontFamily: '"Noto Sans JP", serif' }}>{w}</span>
                  ))}
                  {savedWords.length > 20 && (
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                      +{savedWords.length - 20} từ khác
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-base)' }}>Mẹo:</strong> Click vào bất kỳ từ nào
              để tra nghĩa và lưu vào bộ sưu tập của bạn.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function ReadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ReadingPageContent />
    </Suspense>
  );
}

function ReadingPageContent() {
  const routeParams  = useParams();
  const lang         = (routeParams?.lang as string) ?? 'ja';
  const locale       = (routeParams?.locale as string) ?? 'vi';
  const isChinese    = lang === 'zh';
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session } = useSession();

  const [passages,      setPassages]      = useState<PassageSummary[]>([]);
  const [listLoading,   setListLoading]   = useState(true);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [loadedPassage, setLoadedPassage] = useState<PassageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [level,  setLevel]  = useState(searchParams.get('level') ?? '');
  const [type,   setType]   = useState(searchParams.get('type')  ?? '');
  const [savedWords,  setSavedWords]  = useState<string[]>([]);
  const [savedCount,  setSavedCount]  = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

  // Load passage list
  const loadList = useCallback(async () => {
    setListLoading(true);
    const p = new URLSearchParams();
    if (level) p.set('level', level);
    if (type && !isChinese) p.set('type', type);
    p.set('lang', lang);
    const res = await fetch(`/api/reading?${p}`);
    if (res.ok) setPassages(await res.json());
    setListLoading(false);
  }, [level, type, lang, isChinese]);

  useEffect(() => { loadList(); }, [loadList]);

  // Auto-select first passage on initial load
  useEffect(() => {
    if (passages.length > 0 && !selectedId) setSelectedId(passages[0].id);
  }, [passages, selectedId]);

  // Load full passage content when selection changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadedPassage(null);
    setDetailLoading(true);
    setSavedCount(0);
    fetch(`/api/reading/${selectedId}?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: PassageDetail | null) => { setLoadedPassage(d); setDetailLoading(false); });
    detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedId, lang]);

  // Load saved words (JLPT only)
  useEffect(() => {
    if (!session || isChinese) return;
    fetch('/api/words')
      .then(r => r.ok ? r.json() : [])
      .then((words: { content: { term: string } }[]) =>
        setSavedWords(words.map(w => w.content.term))
      );
  }, [session, isChinese]);

  const handleWordSaved = useCallback((w: { term: string; contentId: string }) => {
    setSavedWords(prev => [...prev, w.term]);
    setSavedCount(n => n + 1);
  }, []);

  const levelOptions = isChinese
    ? ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']
    : ['N5', 'N4', 'N3', 'N2', 'N1'];

  // Chuẩn hóa levels/skills cho LearnSidebar
  const sidebarLevels = levelOptions.map(lv => ({
    code: lv,
    label: lv,
    desc: isChinese ? undefined :
      lv === 'N5' ? 'Sơ cấp' : lv === 'N4' ? 'Sơ trung cấp' : lv === 'N3' ? 'Trung cấp' : lv === 'N2' ? 'Trung cao cấp' : 'Cao cấp',
  }));
  const sidebarSkills = [
    { key: 'all', label: 'Tất cả kỹ năng', icon: <FaBook /> },
    { key: 'short', label: 'Đoạn ngắn', icon: <FaAlignLeft /> },
    { key: 'long', label: 'Bài dài', icon: <FaAlignJustify /> },
    { key: 'news', label: 'Tin tức', icon: <FaNewspaper /> },
  ];
  const selectedLevel = level;
  const setSelectedLevel = (lv: string) => { setLevel(lv); setSelectedId(null); };
  const selectedSkill = type || 'all';
  const setSelectedSkill = (sk: string) => { setType(sk === 'all' ? '' : sk); setSelectedId(null); };

  // ── 10. URL persistence ────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (level) params.set('level', level); else params.delete('level');
    if (type && !isChinese) params.set('type', type); else params.delete('type');
    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [level, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const accentColor = isChinese ? '#DC2626' : '#3D3A8C';

  return (
    <div className="min-h-screen flex flex-row" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar trái giống grammar/vocab */}
      <div className="hidden md:block pl-6 pr-2">
        <LearnSidebar
          mode="level"
          setMode={() => {}}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          levels={sidebarLevels}
          skills={sidebarSkills}
          title={isChinese ? 'Đọc tiếng Trung' : 'Đọc hiểu tiếng Nhật'}
        />
      </div>
      {/* Main content */}
      <div ref={detailRef} className="flex-1 overflow-y-auto flex justify-center items-start py-8 px-2 sm:px-6">
        <div
          className="w-full max-w-[900px] rounded-2xl px-4 sm:px-8 py-8 min-h-[60vh]"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 20,
            border: '1.5px solid var(--border)',
            boxShadow: '0 4px 24px 0 rgba(61,58,140,0.07), 0 1.5px 6px 0 rgba(0,0,0,0.04)',
          }}
        >
          {detailLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-10 h-10 rounded-full border-4 animate-spin"
                style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
            </div>
          ) : !loadedPassage ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${accentColor} 10%, var(--bg-base))` }}>
                <FaNewspaper size={36} style={{ color: accentColor, opacity: 0.7 }} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-base)' }}>
                  {listLoading ? 'Đang tải danh sách...' : 'Chọn một bài đọc'}
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Lựa chọn cấp độ và loại bài phù hợp để bắt đầu đọc
                </p>
              </div>
            </div>
          ) : (
            <ReadingDetail
              key={loadedPassage.id}
              passage={loadedPassage}
              lang={lang}
              locale={locale}
              savedWords={savedWords}
              onWordSaved={handleWordSaved}
              savedCount={savedCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}