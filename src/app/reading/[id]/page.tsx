'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaArrowLeft, FaBookmark, FaNewspaper, FaAlignLeft,
  FaAlignJustify, FaArrowUpRightFromSquare, FaBook,
  FaGraduationCap, FaListUl,
} from 'react-icons/fa6';
import { JapaneseText } from '@/components/JapaneseText';

interface Passage {
  id: string; title: string; titleVi: string | null;
  content: string; summary: string | null; level: string;
  type: string; source: string | null; sourceUrl: string | null;
  tags: string | null; createdAt: string;
}

const LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' },
  N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  short: <FaAlignLeft size={13} />,
  long:  <FaAlignJustify size={13} />,
  news:  <FaNewspaper size={13} />,
};

// ─── Grammar Analysis ─────────────────────────────────────────────────────────

interface GrammarPoint {
  id: string;
  name: string;
  meaning: string;
  pattern: RegExp;
  highlight: string;
}

interface GrammarMatch {
  id: string;
  name: string;
  meaning: string;
  level: string;
  highlight: string;
  example: string;
}

const GRAMMAR_DB: Record<string, GrammarPoint[]> = {
  N5: [
    { id: 'wa',   name: '〜は〜',       meaning: 'Trợ từ chủ đề — đánh dấu chủ đề của câu',                    pattern: /は/,                       highlight: 'は' },
    { id: 'ga',   name: '〜が〜',       meaning: 'Trợ từ chủ ngữ — nhấn mạnh chủ thể hành động',               pattern: /が/,                       highlight: 'が' },
    { id: 'wo',   name: '〜を〜',       meaning: 'Trợ từ tân ngữ — đánh dấu đối tượng trực tiếp của động từ',  pattern: /を/,                       highlight: 'を' },
    { id: 'de',   name: '〜で〜',       meaning: 'Nơi diễn ra hành động / phương tiện được sử dụng',            pattern: /[^\s]で[^\s]/,            highlight: 'で' },
    { id: 'ni',   name: '〜に〜',       meaning: 'Điểm đến / thời điểm / mục đích / đối tượng tác động',       pattern: /[^\s]に[^\s]/,            highlight: 'に' },
    { id: 'nai',  name: '〜ない',       meaning: 'Phủ định của động từ dạng thông thường (không làm ~)',        pattern: /ない[でですがをにもから]/,   highlight: 'ない' },
    { id: 'te',   name: '〜て〜',       meaning: 'Liên kết hành động xảy ra liên tiếp (て形)',                   pattern: /[くがみりっ]て[いなくもお]/,  highlight: 'て' },
    { id: 'kara', name: '〜から',       meaning: 'Từ ~ / vì ~ (nguồn gốc hoặc nguyên nhân)',                   pattern: /[^\s]から/,                highlight: 'から' },
    { id: 'desu', name: 'です／ます',   meaning: 'Thể lịch sự — dùng trong văn phong trang trọng',             pattern: /[ですけりかよ]ます|[ないきてで]です/, highlight: 'です' },
  ],
  N4: [
    { id: 'tekara',       name: '〜てから',       meaning: 'Sau khi làm ~, rồi mới làm ~',                            pattern: /てから/,                      highlight: 'てから' },
    { id: 'nagara',       name: '〜ながら',       meaning: 'Trong khi làm ~ (hai hành động diễn ra cùng lúc)',        pattern: /ながら/,                      highlight: 'ながら' },
    { id: 'teshimau',     name: '〜てしまう',     meaning: 'Lỡ làm ~ / hoàn toàn đã làm ~ (thường hàm ý tiếc)',     pattern: /てしまう|てしまい|でしまう/,   highlight: 'てしまう' },
    { id: 'tame',         name: '〜ために',       meaning: 'Vì mục đích ~ / bởi vì lý do ~',                         pattern: /ために/,                      highlight: 'ために' },
    { id: 'youni',        name: '〜ように',       meaning: 'Để có thể ~ / dần dần trở nên ~',                        pattern: /ように[するなっ]/,             highlight: 'ように' },
    { id: 'bakari',       name: '〜ばかり',       meaning: 'Vừa mới ~ / chỉ toàn ~',                                 pattern: /ばかり/,                      highlight: 'ばかり' },
    { id: 'toki',         name: '〜とき',         meaning: 'Khi ~ (chỉ thời điểm xảy ra sự việc)',                   pattern: /とき[、。\nに]/,               highlight: 'とき' },
    { id: 'kamoshirenai', name: '〜かもしれない', meaning: 'Có thể là ~ (không chắc chắn)',                          pattern: /かもしれない|かもしれません/,   highlight: 'かもしれない' },
    { id: 'souda',        name: '〜そうだ',       meaning: 'Trông có vẻ ~ / nghe nói rằng ~',                        pattern: /そうだ|そうです|そうな|そうに/, highlight: 'そうだ' },
    { id: 'rashii',       name: '〜らしい',       meaning: 'Có vẻ ~ / mang đặc tính của ~',                          pattern: /らしい|らしく/,               highlight: 'らしい' },
  ],
  N3: [
    { id: 'niyotte',  name: '〜によって',     meaning: 'Tùy theo ~ / được thực hiện bởi ~ / do ~ gây ra',     pattern: /によって|による/,         highlight: 'によって' },
    { id: 'toiu',     name: '〜という',       meaning: 'Được gọi là ~ / ý kiến rằng ~',                       pattern: /という/,                  highlight: 'という' },
    { id: 'dakede',   name: '〜だけでなく',   meaning: 'Không chỉ ~ mà còn ~',                                pattern: /だけでなく/,               highlight: 'だけでなく' },
    { id: 'hazu',     name: '〜はずだ',       meaning: 'Đáng lẽ phải ~ / chắc chắn là ~ (dựa vào logic)',    pattern: /はずだ|はずです|はずが/,   highlight: 'はず' },
    { id: 'noni',     name: '〜のに',         meaning: 'Mặc dù ~ (diễn đạt sự thất vọng / trái kỳ vọng)',    pattern: /[^\s]のに[、。\n]/,        highlight: 'のに' },
    { id: 'youda',    name: '〜ようだ',       meaning: 'Trông giống như ~ / có vẻ như ~',                     pattern: /ようだ|ようです|ような/,   highlight: 'ようだ' },
    { id: 'kotoga',   name: '〜ことができる', meaning: 'Có thể làm ~ (diễn đạt khả năng)',                   pattern: /ことができ/,               highlight: 'ことができ' },
    { id: 'tabi',     name: '〜たびに',       meaning: 'Mỗi lần ~ / khi nào ~ thì ~',                        pattern: /たびに/,                   highlight: 'たびに' },
    { id: 'sokode',   name: 'そこで〜',       meaning: 'Vì vậy / do đó (kết quả tất yếu từ tình huống)',     pattern: /そこで/,                   highlight: 'そこで' },
    { id: 'tsumori',  name: '〜つもりだ',     meaning: 'Có dự định làm ~ / coi như là ~',                    pattern: /つもり/,                   highlight: 'つもり' },
  ],
  N2: [
    { id: 'niokite',  name: '〜において',       meaning: 'Trong lĩnh vực ~ / tại địa điểm ~ (văn phong trang trọng)', pattern: /において|における/,      highlight: 'において' },
    { id: 'nitaish',  name: '〜に対して',       meaning: 'Đối với ~ / phản ứng lại ~ / nhắm vào ~',                  pattern: /に対して|に対する/,      highlight: 'に対して' },
    { id: 'nitotte',  name: '〜にとって',       meaning: 'Đối với ai đó / từ góc nhìn của ~',                        pattern: /にとって/,               highlight: 'にとって' },
    { id: 'toshite',  name: '〜として',         meaning: 'Với tư cách là ~ / trong vai trò ~',                       pattern: /として/,                 highlight: 'として' },
    { id: 'niyoruto', name: '〜によると',       meaning: 'Theo nguồn ~ / dựa theo thông tin từ ~',                   pattern: /によると|によれば/,      highlight: 'によると' },
    { id: 'nimotoka', name: '〜にもかかわらず', meaning: 'Dù cho ~ (trái với kỳ vọng, văn phong trang trọng)',       pattern: /にもかかわらず/,         highlight: 'にもかかわらず' },
    { id: 'womajime', name: '〜をはじめ',       meaning: 'Đứng đầu danh sách ~ / bao gồm ~',                        pattern: /をはじめ/,               highlight: 'をはじめ' },
    { id: 'uede',     name: '〜うえで',         meaning: 'Trên cơ sở ~ / sau khi làm ~',                            pattern: /うえで|うえに/,          highlight: 'うえで' },
    { id: 'sarani',   name: 'さらに〜',         meaning: 'Hơn nữa / thêm vào đó (ý nghĩa tăng tiến)',               pattern: /さらに/,                 highlight: 'さらに' },
    { id: 'tooshite', name: '〜を通して',       meaning: 'Thông qua ~ / suốt quá trình ~',                          pattern: /を通して|を通じて|をとおして/, highlight: 'を通して' },
  ],
  N1: [
    { id: 'womotte',   name: '〜をもって',     meaning: 'Bằng phương tiện ~ / kể từ ~ (rất trang trọng)',          pattern: /をもって/,                highlight: 'をもって' },
    { id: 'womegute',  name: '〜をめぐって',   meaning: 'Xoay quanh vấn đề ~ / liên quan đến tranh luận ~',       pattern: /をめぐって|をめぐる/,     highlight: 'をめぐって' },
    { id: 'nisaishi',  name: '〜に際して',     meaning: 'Nhân dịp ~ / vào lúc quan trọng ~ (rất trang trọng)',    pattern: /に際して|に際し/,         highlight: 'に際して' },
    { id: 'karasite',  name: '〜からして',     meaning: 'Ngay cả ~ đã / xét từ bản thân ~',                       pattern: /からして/,                highlight: 'からして' },
    { id: 'bekida',    name: '〜べきだ',       meaning: 'Nên làm ~ / có nghĩa vụ / lẽ ra phải làm ~',             pattern: /べきだ|べきで|べき[^\s]/, highlight: 'べき' },
    { id: 'kagiri',    name: '〜かぎり',       meaning: 'Trong giới hạn ~ / chừng nào còn ~ / hễ ~',              pattern: /かぎり|限り/,             highlight: 'かぎり' },
    { id: 'monoda',    name: '〜ものだ',       meaning: 'Đó là điều đương nhiên / bản chất / hồi tưởng nhớ về ~', pattern: /ものだ|ものです|ものがある/, highlight: 'ものだ' },
    { id: 'nishitemo', name: '〜にしても',     meaning: 'Dù là ~ đi nữa / ngay cả khi ~ (thừa nhận rồi phản bác)', pattern: /にしても/,               highlight: 'にしても' },
    { id: 'koso',      name: '〜こそ',         meaning: 'Chính ~ (nhấn mạnh đặc biệt chủ thể hoặc điều kiện)',    pattern: /こそ/,                    highlight: 'こそ' },
    { id: 'taritomo',  name: '〜たりとも',     meaning: 'Dù chỉ một ~ cũng không (phủ định tuyệt đối)',           pattern: /たりとも/,                highlight: 'たりとも' },
  ],
};

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

// Always scan from N5 up through the passage's level so that
// basic patterns (は・が・を) are found even in advanced-level passages.
function getLevelsToScan(passageLevel: string): string[] {
  const idx = LEVEL_ORDER.indexOf(passageLevel);
  if (idx === -1) return ['N5'];
  // e.g. N3 → ['N3','N4','N5'] — passage level first, then lower levels
  return LEVEL_ORDER.slice(0, idx + 1).reverse();
}

function analyzeGrammar(content: string, passageLevel: string): GrammarMatch[] {
  const sentences = content
    .split(/[。！？\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const levelsToScan = getLevelsToScan(passageLevel);
  const results: GrammarMatch[] = [];
  const seenIds = new Set<string>();

  for (const levelKey of levelsToScan) {
    const patterns = GRAMMAR_DB[levelKey] ?? [];
    for (const gram of patterns) {
      if (seenIds.has(gram.id)) continue;
      const exSentence = sentences.find(s => gram.pattern.test(s));
      if (exSentence) {
        results.push({
          id: gram.id,
          name: gram.name,
          meaning: gram.meaning,
          level: levelKey,
          highlight: gram.highlight,
          example: exSentence + '。',
        });
        seenIds.add(gram.id);
      }
      if (results.length >= 9) break;
    }
    if (results.length >= 9) break;
  }

  return results.sort((a, b) => {
    if (a.level === passageLevel && b.level !== passageLevel) return -1;
    if (a.level !== passageLevel && b.level === passageLevel) return 1;
    return 0;
  });
}

const GRAMMAR_LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' },
  N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

function ExampleHighlight({ sentence, keyword }: { sentence: string; keyword: string }) {
  const idx = sentence.indexOf(keyword);
  if (idx === -1) return <span>{sentence}</span>;
  return (
    <>
      <span>{sentence.substring(0, idx)}</span>
      <mark style={{ background: '#FDE68A', color: '#92400E', borderRadius: 3, padding: '0 2px' }}>
        {keyword}
      </mark>
      <span>{sentence.substring(idx + keyword.length)}</span>
    </>
  );
}

function GrammarAnalysisSection({ passage, layout = 'grid' }: { passage: Passage; layout?: 'grid' | 'sidebar' }) {
  const matches = analyzeGrammar(passage.content, passage.level);
  if (matches.length === 0) return null;

  if (layout === 'sidebar') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FaGraduationCap size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>Ngữ pháp trong bài</span>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {matches.length}
          </span>
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
                  <span className="font-bold text-xs" style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
                    {m.name}
                  </span>
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

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary)', color: 'white' }}>
          <FaGraduationCap size={16} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-base)' }}>
            Phân tích ngữ pháp trong bài
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {matches.length} điểm ngữ pháp nhận diện được · cấp độ {passage.level}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map(m => {
          const lc = GRAMMAR_LEVEL_META[m.level] ?? GRAMMAR_LEVEL_META.N5;
          return (
            <div key={m.id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: lc.bg, color: lc.color }}>
                  {m.level}
                </span>
                <span className="font-bold text-sm"
                  style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
                  {m.name}
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {m.meaning}
              </p>

              <div className="rounded-xl px-3 py-2.5 mt-auto"
                style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--primary)' }}>
                  Ví dụ trong bài
                </div>
                <div className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
                  <ExampleHighlight sentence={m.example} keyword={m.highlight} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ReadingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [passage,    setPassage]    = useState<Passage | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [fontSize,   setFontSize]   = useState(18); // px

  // Load passage
  useEffect(() => {
    fetch(`/api/reading/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setPassage(d); setLoading(false); });
  }, [params.id]);

  // Load user's saved words (to highlight already-saved)
  useEffect(() => {
    if (!session) return;
    fetch('/api/words')
      .then(r => r.ok ? r.json() : [])
      .then((words: { japanese: string }[]) =>
        setSavedWords(words.map(w => w.japanese))
      );
  }, [session]);

  const handleWordSaved = useCallback((w: { japanese: string }) => {
    setSavedWords(prev => [...prev, w.japanese]);
    setSavedCount(n => n + 1);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!passage) return (
    <div className="p-8 text-center">
      <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài đọc.</p>
      <Link href="/reading" className="btn-primary inline-flex mt-4 items-center gap-2">
        <FaArrowLeft size={12} /> Quay lại
      </Link>
    </div>
  );

  const lm   = LEVEL_META[passage.level] ?? LEVEL_META.N5;
  const tags: string[] = passage.tags ? JSON.parse(passage.tags) : [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Back */}
      <Link href="/reading"
        className="inline-flex items-center gap-1.5 text-sm mb-6 btn-ghost"
        style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={11} /> Danh sách bài đọc
      </Link>

      {/* Passage header — full width */}
      <div className="card mb-6" style={{ borderTop: `4px solid ${lm.color}` }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: lm.bg, color: lm.color }}>{passage.level}</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {TYPE_ICON[passage.type]} {passage.type === 'news' ? 'Tin tức' : passage.type === 'long' ? 'Bài dài' : 'Đoạn ngắn'}
          </span>
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

        <h1 className="text-2xl font-bold mb-1 leading-snug"
          style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
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

      {/* ── 2-column layout ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT: Article ── */}
        <div className="flex-1 min-w-0">

          {/* Reading controls */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
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

          {/* Article body */}
          <div className="card"
            style={{ fontSize, lineHeight: 2.1, fontFamily: '"Noto Sans JP", serif' }}>
            <JapaneseText
              content={passage.content}
              passageId={passage.id}
              savedWords={savedWords}
              onWordSaved={handleWordSaved}
            />
          </div>

          {/* Saved words banner */}
          {savedCount > 0 && (
            <div className="card mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
                <FaBookmark size={13} style={{ color: 'var(--primary)' }} />
                Đã lưu <strong>{savedCount}</strong> từ mới trong bài này
              </div>
              <Link href="/vocab"
                className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0">
                <FaBook size={11} /> Xem từ vựng
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">

          {/* Saved words count pill */}
          {savedCount > 0 && (
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'var(--primary)', color: 'white' }}>
              <FaBookmark size={14} />
              <span className="text-sm font-semibold">
                {savedCount} từ đã lưu phiên này
              </span>
              <Link href="/vocab" className="ml-auto text-xs underline opacity-80 hover:opacity-100">
                Xem →
              </Link>
            </div>
          )}

          {/* Grammar analysis */}
          <div className="card">
            <GrammarAnalysisSection passage={passage} layout="sidebar" />
          </div>

          {/* Vocabulary hint — session saved words */}
          {savedWords.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <FaListUl size={13} style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>
                  Từ đã lưu từ trước
                </span>
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {savedWords.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {savedWords.slice(0, 20).map(w => (
                  <span key={w} className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ background: 'var(--bg-base)', color: 'var(--text-base)',
                      border: '1px solid var(--border)', fontFamily: '"Noto Sans JP", serif' }}>
                    {w}
                  </span>
                ))}
                {savedWords.length > 20 && (
                  <span className="text-xs px-2 py-1 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}>
                    +{savedWords.length - 20} từ khác
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tip card */}
          <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-base)' }}>Mẹo:</strong> Click vào bất kỳ từ nào trong bài để
            tra nghĩa, xem cách đọc và lưu vào bộ sưu tập của bạn.
          </div>
        </div>
      </div>
    </main>
  );
}
