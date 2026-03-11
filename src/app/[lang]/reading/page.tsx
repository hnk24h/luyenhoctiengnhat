'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaNewspaper, FaAlignLeft, FaAlignJustify,
  FaClock, FaBookmark, FaBook, FaGraduationCap,
  FaListUl, FaArrowUpRightFromSquare, FaChevronRight,
} from 'react-icons/fa6';
import { JapaneseText } from '@/components/JapaneseText';

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

function ReadingDetail({ passage, lang, savedWords, onWordSaved, savedCount }: {
  passage: PassageDetail; lang: string;
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
              <Link href={`/${lang}/vocab`}
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
  const isChinese    = lang === 'zh';
  const searchParams = useSearchParams();
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

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ── Left sidebar: passage list ── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r overflow-hidden"
        style={{
          borderColor: 'var(--border)', background: 'var(--bg-surface)',
          position: 'sticky', top: '56px', height: 'calc(100vh - 64px)',
        }}>

        {/* Sidebar header + filters */}
        <div className="px-4 pt-4 pb-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--primary)' }}>
            {isChinese ? 'Đọc tiếng Trung' : 'Đọc hiểu tiếng Nhật'}
          </div>

          {/* Level filter */}
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => { setLevel(''); setSelectedId(null); }}
              className="text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all"
              style={level === ''
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              Tất cả
            </button>
            {levelOptions.map(lv => {
              const lm = LEVEL_META[lv];
              return (
                <button key={lv} onClick={() => { setLevel(lv); setSelectedId(null); }}
                  className="text-[11px] px-2 py-0.5 rounded-lg font-bold transition-all"
                  style={level === lv
                    ? { background: lm.color, color: 'white' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lv}
                </button>
              );
            })}
          </div>

          {/* Type filter (JLPT only) */}
          {!isChinese && (
            <div className="flex gap-1 flex-wrap">
              {(['', 'short', 'long', 'news'] as const).map(tp => (
                <button key={tp} onClick={() => { setType(tp); setSelectedId(null); }}
                  className="text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all"
                  style={type === tp
                    ? { background: 'var(--primary)', color: 'white' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {tp === '' ? 'Tất cả' : TYPE_META[tp]?.label}
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          {!listLoading && (
            <div className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {passages.length} bài đọc
            </div>
          )}
        </div>

        {/* Passage list */}
        <div className="flex-1 overflow-y-auto py-2">
          {listLoading ? (
            <div className="flex flex-col gap-1.5 px-3 pt-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
              ))}
            </div>
          ) : passages.length === 0 ? (
            <div className="text-center py-12 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Không có bài đọc nào
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 px-2">
              {passages.map((p, idx) => {
                const lm  = LEVEL_META[p.level] ?? LEVEL_META.N5;
                const tm  = TYPE_META[p.type];
                const sel = selectedId === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedId(p.id)}
                    className="flex flex-col gap-1 px-3 py-2.5 rounded-xl text-left w-full transition-all border"
                    style={sel
                      ? { background: 'var(--primary-light)', borderColor: 'var(--primary)' }
                      : { background: 'transparent', borderColor: 'transparent' }}>

                    {/* Top row: badges + time */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded shrink-0"
                        style={{ background: lm.bg, color: lm.color }}>{idx + 1}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: lm.bg, color: lm.color }}>{p.level}</span>
                      {tm && !isChinese && (
                        <span className="text-[10px] font-medium px-1 py-0.5 rounded shrink-0 flex items-center gap-0.5"
                          style={{ background: tm.bg, color: tm.color }}>
                          {tm.icon}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] flex items-center gap-0.5 shrink-0"
                        style={{ color: 'var(--text-muted)' }}>
                        <FaClock size={8} />{readTime(p.charCount)}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-xs font-semibold leading-snug line-clamp-2"
                      style={{ color: sel ? 'var(--primary)' : 'var(--text-base)',
                        fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                      {p.title}
                    </div>
                    {p.titleVi && (
                      <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {p.titleVi}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile: horizontal scroll tabs ── */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-10 border-b overflow-x-auto"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex gap-1.5 px-3 py-2 min-w-max">
          {/* Level filter on mobile */}
          <div className="flex gap-1 mr-2 shrink-0">
            {levelOptions.map(lv => {
              const lm = LEVEL_META[lv];
              return (
                <button key={lv} onClick={() => { setLevel(prev => prev === lv ? '' : lv); setSelectedId(null); }}
                  className="text-[10px] px-2 py-1 rounded-lg font-bold transition-all"
                  style={level === lv
                    ? { background: lm.color, color: 'white' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lv}
                </button>
              );
            })}
          </div>
          {/* Passage list */}
          {passages.map((p, idx) => {
            const lm  = LEVEL_META[p.level] ?? LEVEL_META.N5;
            const sel = selectedId === p.id;
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                style={sel
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                <span className="text-[9px] font-bold"
                  style={sel ? { opacity: 0.75 } : { color: lm.color }}>
                  {idx + 1}
                </span>
                <span className="max-w-[100px] truncate">{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content panel ── */}
      <div ref={detailRef} className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        {detailLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 rounded-full border-4 animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : !loadedPassage ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="text-5xl opacity-30">📖</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {listLoading ? 'Đang tải danh sách...' : 'Chọn một bài đọc từ danh sách'}
            </p>
          </div>
        ) : (
          <ReadingDetail
            key={loadedPassage.id}
            passage={loadedPassage}
            lang={lang}
            savedWords={savedWords}
            onWordSaved={handleWordSaved}
            savedCount={savedCount}
          />
        )}
      </div>
    </div>
  );
}

import {
  FaBook, FaNewspaper, FaAlignLeft, FaAlignJustify,
  FaFilter, FaChevronRight, FaClock, FaBolt,
} from 'react-icons/fa6';

interface Passage {
  id:        string;
  title:     string;
  titleVi:   string | null;
  summary:   string | null;
  level:     string;
  type:      string;
  source:    string | null;
  tags:      string | null;
  charCount: number;
  createdAt: string;
}

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

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
  short: { icon: <FaAlignLeft  size={12} />, label: 'Đoạn ngắn', bg: '#EFF6FF', color: '#2563EB' },
  long:  { icon: <FaAlignJustify size={12} />, label: 'Bài dài',  bg: '#F5F3FF', color: '#7C3AED' },
  news:  { icon: <FaNewspaper size={12} />, label: 'Tin tức',   bg: '#FFF7ED', color: '#EA580C' },
};

function readTime(chars: number) {
  const mins = Math.ceil(chars / 400);
  return `${mins} phút`;
}

export default function ReadingPage() {
  return (
    <Suspense fallback={<ReadingPageFallback />}>
      <ReadingPageContent />
    </Suspense>
  );
}

function ReadingPageContent() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const searchParams = useSearchParams();
  const queryLevel = searchParams.get('level') ?? '';
  const queryType = searchParams.get('type') ?? '';
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [level,    setLevel]    = useState(queryLevel);
  const [type,     setType]     = useState(queryType);

  useEffect(() => {
    setLevel(queryLevel);
    setType(queryType);
  }, [queryLevel, queryType]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (type && lang !== 'zh') params.set('type', type);
    params.set('lang', lang);
    const res = await fetch(`/api/reading?${params}`);
    if (res.ok) setPassages(await res.json());
    setLoading(false);
  }, [level, type, lang]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-5 btn-ghost"
        style={{ color: 'var(--text-muted)' }}>
        <FaBook size={11} /> Trang chủ
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>
          KỸ NĂNG ĐỌC HIỂU
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-base)' }}>
          {lang === 'zh' ? 'Đọc tiếng Trung' : 'Đọc tiếng Nhật'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {lang === 'zh' ? 'Luyện đọc theo cấp độ HSK.' : 'Click vào từ bất kỳ để tra nghĩa và lưu vào bộ sưu tập từ vựng.'}
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <FaFilter size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Lọc:</span>
        </div>

        {/* Level filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['', ...(lang === 'zh' ? ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] : ['N5', 'N4', 'N3', 'N2', 'N1'])]).map(lv => (
            <button key={lv} onClick={() => setLevel(lv)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={level === lv
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {lv || 'Tất cả cấp'}
            </button>
          ))}
        </div>

        {lang !== 'zh' && (
        <>
        <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--border)' }} />

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['', 'short', 'long', 'news'].map(tp => (
            <button key={tp} onClick={() => setType(tp)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={type === tp
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {tp ? TYPE_META[tp]?.label : 'Tất cả loại'}
            </button>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Passages grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ height: 160, background: 'var(--border)' }} />
          ))}
        </div>
      ) : passages.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4 opacity-30">📖</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Chưa có bài đọc nào</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Thử chọn bộ lọc khác</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {passages.map(p => {
            const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
            const tm = TYPE_META[p.type]   ?? TYPE_META.short;
            const tags: string[] = p.tags ? (p.tags as unknown as string[]) : [];
            return (
              <Link key={p.id} href={`/${lang}/reading/${p.id}`}
                className="card card-hover group flex flex-col gap-3 no-underline"
                style={{ textDecoration: 'none' }}>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: lm.bg, color: lm.color }}>{p.level}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: tm.bg, color: tm.color }}>
                      {tm.icon}{tm.label}
                    </span>
                  </div>
                  <FaChevronRight size={12} className="shrink-0 mt-0.5 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--text-muted)' }} />
                </div>

                <div>
                  <div className="font-bold text-base mb-1"
                    style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif', lineHeight: 1.5 }}>
                    {p.title}
                  </div>
                  {p.titleVi && (
                    <div className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{p.titleVi}</div>
                  )}
                </div>

                {p.summary && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.summary}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <FaClock size={10} /> {readTime(p.charCount)}
                    </span>
                    {p.source && <span>📰 {p.source}</span>}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {tags.slice(0, 3).map(t => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>#{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

function ReadingPageFallback() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--border)' }} />
        <div className="h-10 w-72 rounded-xl mb-3" style={{ background: 'var(--border)' }} />
        <div className="h-5 w-full max-w-xl rounded" style={{ background: 'var(--border)' }} />
      </div>
      <div className="rounded-3xl p-6 mb-6 animate-pulse" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="h-6 w-48 rounded" style={{ background: 'var(--border)' }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-3xl h-40" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    </main>
  );
}
