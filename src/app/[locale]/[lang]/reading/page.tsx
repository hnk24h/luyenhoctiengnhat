'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaNewspaper, FaAlignLeft, FaAlignJustify,
  FaClock, FaBookmark, FaBook, FaGraduationCap,
  FaListUl, FaArrowUpRightFromSquare, FaChevronRight,
  FaChevronLeft, FaBookOpen, FaStar, FaFire,
  FaArrowRight, FaHeadphones, FaPenNib, FaRocket,
  FaLightbulb, FaCircleCheck, FaBolt, FaEye,
} from 'react-icons/fa6';
import { JapaneseText } from '@/components/JapaneseText';
import { LearnLayout } from '@/components/learn/LearnLayout';

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

const LEVEL_META: Record<string, { bg: string; color: string; gradient: string }> = {
  N5:   { bg: '#DCFCE7', color: '#15803D', gradient: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)' },
  N4:   { bg: '#DBEAFE', color: '#1D4ED8', gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' },
  N3:   { bg: '#FEF9C3', color: '#92400E', gradient: 'linear-gradient(135deg, #FEF9C3, #FDE68A)' },
  N2:   { bg: '#FFEDD5', color: '#C2410C', gradient: 'linear-gradient(135deg, #FFEDD5, #FED7AA)' },
  N1:   { bg: '#FFE4E6', color: '#BE123C', gradient: 'linear-gradient(135deg, #FFE4E6, #FECDD3)' },
  HSK1: { bg: '#DCFCE7', color: '#15803D', gradient: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)' },
  HSK2: { bg: '#DBEAFE', color: '#1D4ED8', gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' },
  HSK3: { bg: '#FEF9C3', color: '#92400E', gradient: 'linear-gradient(135deg, #FEF9C3, #FDE68A)' },
  HSK4: { bg: '#FFEDD5', color: '#C2410C', gradient: 'linear-gradient(135deg, #FFEDD5, #FED7AA)' },
  HSK5: { bg: '#F3E8FF', color: '#6B21A8', gradient: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)' },
  HSK6: { bg: '#FFE4E6', color: '#BE123C', gradient: 'linear-gradient(135deg, #FFE4E6, #FECDD3)' },
};

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  short: { label: 'Đoạn ngắn', icon: <FaAlignLeft  size={10} />, bg: '#EFF6FF', color: '#2563EB' },
  long:  { label: 'Bài dài',   icon: <FaAlignJustify size={10} />, bg: '#F5F3FF', color: '#7C3AED' },
  news:  { label: 'Tin tức',   icon: <FaNewspaper size={10} />,  bg: '#FFF7ED', color: '#EA580C' },
};

function readTime(chars: number) { return `${Math.max(1, Math.ceil(chars / 400))} phút`; }

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
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
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

// ─── Horizontal passage cards (Netflix-style scroller) ────────────────────────

function PassageScroller({ passages, selectedId, onSelect, loading, isChinese }: {
  passages: PassageSummary[]; selectedId: string | null;
  onSelect: (id: string) => void; loading: boolean; isChinese: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-56 shrink-0 rounded-2xl p-4 animate-pulse"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', height: 120 }}>
            <div className="h-3 w-3/4 rounded" style={{ background: 'var(--border)' }} />
            <div className="h-2 w-1/2 rounded mt-3" style={{ background: 'var(--border)' }} />
          </div>
        ))}
      </div>
    );
  }
  if (passages.length === 0) return null;

  return (
    <div className="relative group/scroller">
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
        {passages.map((p, i) => {
          const active = p.id === selectedId;
          const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
          const tm = TYPE_META[p.type];
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className="w-60 shrink-0 text-left rounded-2xl p-4 transition-all snap-start hover:scale-[1.02] active:scale-[0.98]"
              style={active
                ? { background: lm.gradient, border: `2px solid ${lm.color}55`, boxShadow: `0 4px 20px ${lm.color}20` }
                : { background: 'var(--bg-surface)', border: '1.5px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={active ? { background: lm.color, color: '#fff' } : { background: lm.bg, color: lm.color }}>
                  {p.level}
                </span>
                {tm && (
                  <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: tm.color }}>
                    {tm.icon} {tm.label}
                  </span>
                )}
                <span className="text-[10px] flex items-center gap-1 ml-auto" style={{ color: 'var(--text-muted)' }}>
                  <FaClock size={8} /> {readTime(p.charCount)}
                </span>
              </div>
              <h4 className="text-[13px] font-bold leading-snug line-clamp-2 mb-1"
                style={{ color: active ? '#1a1a2e' : 'var(--text-primary)',
                  fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                {p.title}
              </h4>
              {p.titleVi && (
                <p className="text-[11px] line-clamp-1" style={{ color: active ? lm.color : 'var(--text-muted)' }}>
                  {p.titleVi}
                </p>
              )}
              {active && (
                <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold"
                  style={{ color: lm.color }}>
                  <FaEye size={9} /> Đang đọc
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Scroll arrows */}
      {passages.length > 3 && (
        <>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: 'var(--text-primary)' }}>
            <FaChevronLeft size={10} />
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: 'var(--text-primary)' }}>
            <FaChevronRight size={10} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Reading progress bar ─────────────────────────────────────────────────────

function ReadingProgressBar({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const total = el.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentRef]);
  if (progress < 1) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'var(--border)' }}>
      <div className="h-full transition-[width] duration-150"
        style={{ width: `${progress}%`, background: 'var(--primary)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)' }} />
    </div>
  );
}

// ─── CTA cards after reading ──────────────────────────────────────────────────

function AfterReadingCTA({ locale, lang, level, passageTitle }: {
  locale: string; lang: string; level: string; passageTitle: string;
}) {
  const motivations = [
    '🎉 Tuyệt vời! Bạn đã đọc xong bài này!',
    '📚 Đọc thêm bài mới để nâng cao trình độ!',
    '💪 Mỗi bài đọc đưa bạn gần hơn đến mục tiêu!',
    '🌟 Kiến thức tích lũy mỗi ngày sẽ tạo nên sự khác biệt!',
  ];
  const msg = motivations[Math.floor(Math.random() * motivations.length)];

  const ctaItems = [
    { href: `/${locale}/${lang}/grammar`, icon: <FaGraduationCap size={20} />, label: 'Ngữ pháp', desc: `Ôn ngữ pháp ${level}`, color: '#7C3AED', bg: '#F5F3FF' },
    { href: `/${locale}/${lang}/vocab`, icon: <FaBook size={20} />, label: 'Từ vựng', desc: 'Xem từ đã lưu', color: '#2563EB', bg: '#EFF6FF' },
    { href: `/${locale}/${lang}/practice`, icon: <FaPenNib size={20} />, label: 'Luyện tập', desc: 'Làm bài tập', color: '#EA580C', bg: '#FFF7ED' },
    { href: `/${locale}/${lang}/listening`, icon: <FaHeadphones size={20} />, label: 'Nghe hiểu', desc: 'Rèn kỹ năng nghe', color: '#0D9488', bg: '#F0FDFA' },
  ];

  return (
    <div className="mt-8 rounded-2xl p-5 sm:p-6"
      style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 8%, var(--bg-surface)))',
        border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <FaCircleCheck size={18} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{msg}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tiếp tục hành trình học tập của bạn</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ctaItems.map(c => (
          <Link key={c.href} href={c.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: c.bg, border: `1px solid ${c.color}20` }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
            <span className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>{c.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Full-width article view (reading-focused) ───────────────────────────────

function ReadingDetail({ passage, lang, locale, savedWords, onWordSaved, savedCount }: {
  passage: PassageDetail; lang: string; locale: string;
  savedWords: string[]; onWordSaved: (w: { term: string; contentId: string }) => void;
  savedCount: number;
}) {
  const { data: session } = useSession();
  const isChinese = lang === 'zh';
  const [fontSize, setFontSize] = useState(18);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lm   = LEVEL_META[passage.level] ?? LEVEL_META.N5;
  const tags: string[] = passage.tags ? (passage.tags as unknown as string[]) : [];
  const tm   = TYPE_META[passage.type];

  return (
    <>
      <ReadingProgressBar contentRef={contentRef} />
      <article className="max-w-3xl mx-auto" ref={contentRef}>
        {/* Hero banner */}
        <div className="rounded-2xl p-5 sm:p-7 mb-6 relative overflow-hidden"
          style={{ background: lm.gradient, border: `1px solid ${lm.color}22` }}>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: lm.color, color: '#fff' }}>{passage.level}</span>
              {tm && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.7)', color: tm.color }}>
                  {tm.icon} {tm.label}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs ml-auto"
                style={{ color: lm.color, opacity: 0.8 }}>
                <FaClock size={10} /> {readTime(passage.charCount)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-1"
              style={{ color: '#1a1a2e', fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
              {passage.title}
            </h1>
            {passage.titleVi && (
              <p className="text-base font-medium mt-1" style={{ color: lm.color }}>{passage.titleVi}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.6)', color: lm.color }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: lm.color }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10"
            style={{ background: lm.color }} />
        </div>

        {/* Summary */}
        {passage.summary && (
          <div className="rounded-xl p-4 mb-5 flex items-start gap-3"
            style={{ background: 'var(--primary-light)', border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)' }}>
            <FaLightbulb size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--primary)' }}>{passage.summary}</p>
          </div>
        )}

        {/* Source */}
        {passage.source && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <FaNewspaper size={10} />
            <span>Nguồn:</span>
            {passage.sourceUrl ? (
              <a href={passage.sourceUrl} target="_blank" rel="noreferrer"
                className="underline flex items-center gap-1 hover:opacity-80">
                {passage.source} <FaArrowUpRightFromSquare size={8} />
              </a>
            ) : <span>{passage.source}</span>}
          </div>
        )}

        {/* Toolbar: font size + tip */}
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

        {/* Article body (full-width, reading-focused) */}
        <div className="rounded-2xl p-5 sm:p-8"
          style={{
            fontSize, lineHeight: 2.2,
            fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
          {isChinese
            ? passage.content.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="mb-4 last:mb-0" style={{ color: 'var(--text-base)' }}>{para}</p>
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
          <div className="rounded-xl p-4 mt-4 flex items-center justify-between gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
              <FaBookmark size={13} style={{ color: 'var(--primary)' }} />
              Đã lưu <strong>{savedCount}</strong> từ mới trong bài này
            </div>
            <Link href={`/${locale}/${lang}/vocab`}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0 rounded-lg">
              <FaBook size={11} /> Từ vựng
            </Link>
          </div>
        )}

        {/* Grammar & saved words — collapsible section */}
        {!isChinese && (
          <div className="mt-5">
            <button onClick={() => setShowGrammar(g => !g)}
              className="w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <div className="flex items-center gap-2">
                <FaGraduationCap size={15} style={{ color: 'var(--primary)' }} />
                Ngữ pháp & từ vựng trong bài
              </div>
              <FaChevronRight size={11}
                className={`transition-transform ${showGrammar ? 'rotate-90' : ''}`}
                style={{ color: 'var(--text-muted)' }} />
            </button>
            {showGrammar && (
              <div className="mt-3 flex flex-col gap-4">
                <GrammarPanel passage={passage} />
                {savedWords.length > 0 && (
                  <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
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
              </div>
            )}
          </div>
        )}

        {/* After reading CTA */}
        <AfterReadingCTA locale={locale} lang={lang} level={passage.level} passageTitle={passage.title} />
      </article>
    </>
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
  const [initialized, setInitialized] = useState(false);

  // ── Sidebar config (matching grammar page pattern) ─────────────────────────
  const JA_LEVELS = [
    { code: 'N5', label: 'N5', desc: 'Sơ cấp' },
    { code: 'N4', label: 'N4', desc: 'Sơ trung cấp' },
    { code: 'N3', label: 'N3', desc: 'Trung cấp' },
    { code: 'N2', label: 'N2', desc: 'Trung cao cấp' },
    { code: 'N1', label: 'N1', desc: 'Cao cấp' },
  ];
  const ZH_LEVELS = [
    { code: 'HSK1', label: 'HSK1' }, { code: 'HSK2', label: 'HSK2' },
    { code: 'HSK3', label: 'HSK3' }, { code: 'HSK4', label: 'HSK4' },
    { code: 'HSK5', label: 'HSK5' }, { code: 'HSK6', label: 'HSK6' },
  ];
  const READING_SKILLS = [
    { key: 'all',   label: 'Tất cả', icon: <FaBook /> },
    { key: 'short', label: 'Đoạn ngắn', icon: <FaAlignLeft /> },
    { key: 'long',  label: 'Bài dài', icon: <FaAlignJustify /> },
    { key: 'news',  label: 'Tin tức', icon: <FaNewspaper /> },
  ];
  const ZH_SKILLS = [{ key: 'all', label: 'Tất cả', icon: <FaBook /> }];
  const DEFAULT_LEVELS_JA = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const DEFAULT_LEVELS_ZH = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];

  const sidebarLevels = isChinese ? ZH_LEVELS : JA_LEVELS;
  const sidebarSkills = isChinese ? ZH_SKILLS : READING_SKILLS;
  const selectedLevel = level;
  const setSelectedLevel = (lv: string) => { setLevel(lv); setSelectedId(null); setLoadedPassage(null); };
  const selectedSkill = type || 'all';
  const setSelectedSkill = (sk: string) => { setType(sk === 'all' ? '' : sk); setSelectedId(null); setLoadedPassage(null); };

  // ── Auto-detect user level on first load ───────────────────────────────────
  useEffect(() => {
    if (initialized || searchParams.get('level')) {
      if (!initialized) setInitialized(true);
      return;
    }
    const defaults = isChinese ? DEFAULT_LEVELS_ZH : DEFAULT_LEVELS_JA;
    if (session?.user?.id) {
      fetch('/api/study-profile')
        .then(r => r.ok ? r.json() : null)
        .then(() => {
          if (!initialized) setLevel(defaults[0]);
          setInitialized(true);
        })
        .catch(() => { setLevel(defaults[0]); setInitialized(true); });
    } else {
      setLevel(defaults[0]);
      setInitialized(true);
    }
  }, [session, isChinese, initialized, searchParams]);

  // ── Load passage list ──────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    setListLoading(true);
    const p = new URLSearchParams();
    if (level) p.set('level', level);
    if (type && !isChinese) p.set('type', type);
    p.set('lang', lang);
    const res = await fetch(`/api/reading?${p}`);
    if (res.ok) {
      const data = await res.json();
      setPassages(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    }
    setListLoading(false);
  }, [level, type, lang, isChinese, selectedId]);

  useEffect(() => { if (level) loadList(); }, [level, type, loadList]);

  // ── Load passage detail ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    setLoadedPassage(null);
    setDetailLoading(true);
    setSavedCount(0);
    fetch(`/api/reading/${selectedId}?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: PassageDetail | null) => { setLoadedPassage(d); setDetailLoading(false); });
  }, [selectedId, lang]);

  // ── Load saved words (JLPT only) ──────────────────────────────────────────
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

  // ── URL persistence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams(window.location.search);
    if (level) params.set('level', level); else params.delete('level');
    if (type && !isChinese) params.set('type', type); else params.delete('type');
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [level, type, initialized, isChinese, router]);

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'level' as const,
        setMode: () => {},
        selectedLevel,
        setSelectedLevel,
        selectedSkill,
        setSelectedSkill,
        levels: sidebarLevels,
        skills: sidebarSkills,
        title: isChinese ? 'Đọc tiếng Trung' : 'Đọc hiểu',
      }}
      bottomBarProps={{
        levels: sidebarLevels,
        selectedLevel,
        setSelectedLevel,
        skills: sidebarSkills,
        selectedSkill,
        setSelectedSkill,
      }}
    >
      {/* Header — vibrant & motivational */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            <FaBookOpen size={20} style={{ color: '#fff' }} />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: '#FBBF24', color: '#78350F' }}>
              <FaBolt size={8} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {isChinese ? '📖 Đọc hiểu tiếng Trung' : '📖 Đọc hiểu tiếng Nhật'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {passages.length > 0
                ? <><FaFire size={9} className="inline mr-1" style={{ color: '#EF4444' }} />{passages.length} bài đọc{level && ` · ${level}`} · Chọn bài và bắt đầu luyện đọc!</>
                : 'Chọn cấp độ để khám phá bài đọc thú vị'}
            </p>
          </div>
        </div>
      </div>

      {/* Passage scroller — horizontal cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaNewspaper size={12} style={{ color: 'var(--primary)' }} />
            Bài đọc
            {!listLoading && passages.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{passages.length}</span>
            )}
          </h2>
        </div>
        <PassageScroller passages={passages} selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)} loading={listLoading} isChinese={isChinese} />
      </div>

      {/* Article area — full width */}
      <div className="min-w-0">
        {detailLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Đang tải bài đọc...</p>
            </div>
          </div>
        ) : !loadedPassage ? (
          /* ── Fun, youthful empty state ── */
          <div className="flex flex-col items-center justify-center min-h-[45vh] gap-5 px-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 12%, var(--bg-surface)))' }}>
                <span className="text-5xl">📚</span>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#FEF9C3', border: '2px solid #FDE68A' }}>
                <FaRocket size={16} style={{ color: '#D97706' }} />
              </div>
            </div>
            <div className="text-center max-w-sm">
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {listLoading ? 'Đang tải bài đọc...' : 'Sẵn sàng luyện đọc chưa? 🎯'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {listLoading
                  ? 'Chờ một chút nhé, đang tìm bài phù hợp với bạn...'
                  : 'Chọn cấp độ bên dưới và bắt đầu hành trình chinh phục kỹ năng đọc hiểu!'}
              </p>
            </div>
            {!level && !listLoading && (
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                {(isChinese ? DEFAULT_LEVELS_ZH.slice(0, 4) : DEFAULT_LEVELS_JA).map(lv => {
                  const lm = LEVEL_META[lv];
                  return (
                    <button key={lv} onClick={() => setSelectedLevel(lv)}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                      style={{ background: lm.gradient, color: lm.color, border: `2px solid ${lm.color}33`,
                        boxShadow: `0 4px 12px ${lm.color}15` }}>
                      <FaRocket size={13} /> {lv}
                    </button>
                  );
                })}
              </div>
            )}
            {!listLoading && passages.length === 0 && level && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Chưa có bài đọc cho cấp {level}. Thử cấp khác nhé!
                </p>
                <div className="flex gap-2">
                  {(isChinese ? DEFAULT_LEVELS_ZH : DEFAULT_LEVELS_JA).filter(l => l !== level).slice(0, 3).map(lv => {
                    const lm = LEVEL_META[lv];
                    return (
                      <button key={lv} onClick={() => setSelectedLevel(lv)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: lm.bg, color: lm.color }}>
                        {lv}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <ReadingDetail
              key={loadedPassage.id}
              passage={loadedPassage}
              lang={lang}
              locale={locale}
              savedWords={savedWords}
              onWordSaved={handleWordSaved}
              savedCount={savedCount}
            />
            {/* Prev / Next navigation */}
            {passages.length > 1 && (() => {
              const idx = passages.findIndex(p => p.id === selectedId);
              const prev = idx > 0 ? passages[idx - 1] : null;
              const next = idx < passages.length - 1 ? passages[idx + 1] : null;
              return (
                <div className="flex items-center justify-between mt-6 pt-4 max-w-3xl mx-auto"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  {prev ? (
                    <button onClick={() => setSelectedId(prev.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      <FaChevronLeft size={10} />
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">{prev.title}</span>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => setSelectedId(next.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">{next.title}</span>
                      <FaChevronRight size={10} />
                    </button>
                  ) : <div />}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </LearnLayout>
  );
}