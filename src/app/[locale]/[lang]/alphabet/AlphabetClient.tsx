'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { FaBookOpen } from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────
type CharItem = {
  id: string;
  term: string;
  pronunciation: string | null;
  order: number;
  meanings: { meaning: string }[];
  examples: { exampleText: string; translation: string | null }[];
};
type AlphabetLesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  items: CharItem[];
};

// ─── Script config ────────────────────────────────────────────────────────────
type Script = { key: string; label: string; labelJp: string; color: string; bg: string; border: string };

const JA_SCRIPTS: Script[] = [
  { key: 'hiragana', label: 'Hiragana', labelJp: 'ひらがな', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  { key: 'katakana', label: 'Katakana', labelJp: 'カタカナ', color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
];
const ZH_SCRIPTS: Script[] = [
  { key: 'pinyin', label: 'Bính âm Pinyin', labelJp: '拼音', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
];

// ─── Character card ───────────────────────────────────────────────────────────
function CharCard({ item, accent }: { item: CharItem; accent: { color: string; bg: string; border: string } }) {
  const [open, setOpen] = useState(false);
  const meaning = item.meanings[0]?.meaning ?? '';
  const ex = item.examples[0];
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="rounded-2xl border text-left transition-all w-full"
      style={{
        borderColor: open ? accent.border : 'var(--border)',
        background: open ? accent.bg : 'var(--bg-surface)',
      }}>
      <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
        <span
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: '"Noto Sans JP", "Noto Sans SC", sans-serif', color: open ? accent.color : 'var(--text-primary)' }}>
          {item.term}
        </span>
        {item.pronunciation && (
          <span className="text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-lg shrink-0"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            {item.pronunciation}
          </span>
        )}
      </div>
      {open && (
        <div className="px-3 pb-3 border-t mt-1" style={{ borderColor: accent.border }}>
          {meaning && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{meaning}</p>
          )}
          {ex && (
            <div className="mt-2 px-2 py-1.5 rounded-xl" style={{ background: 'var(--bg-muted)' }}>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Noto Sans JP", "Noto Sans SC", sans-serif', color: 'var(--text-primary)' }}>{ex.exampleText}</p>
              {ex.translation && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.translation}</p>}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────
function AlphabetPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = (params.lang as string) ?? 'ja';

  const scripts = lang === 'zh' ? ZH_SCRIPTS : JA_SCRIPTS;
  const defaultScript = scripts[0].key;
  const scriptKey = searchParams.get('script') ?? defaultScript;
  const activeScript = scripts.find(s => s.key === scriptKey) ?? scripts[0];

  const [lessons, setLessons] = useState<AlphabetLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/alphabet?lang=${lang}&script=${activeScript.key}`)
      .then(r => r.json())
      .then((data: AlphabetLesson[]) => { setLessons(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang, activeScript.key]);

  const totalChars = lessons.reduce((s, l) => s + l.items.length, 0);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header bar ── */}
      <div className="border-b sticky top-16 z-30" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: activeScript.bg, color: activeScript.color }}>
              <FaBookOpen size={12} />
              {lang === 'zh' ? 'Tiếng Trung' : 'Tiếng Nhật'} — Bảng chữ cái
            </div>
            <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {activeScript.label} <span className="font-normal text-base" style={{ color: 'var(--text-muted)' }}>({activeScript.labelJp})</span>
            </h1>
          </div>

          {/* Script tabs */}
          {scripts.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {scripts.map(s => (
                <button key={s.key}
                  onClick={() => router.replace(`/${lang}/alphabet?script=${s.key}`)}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
                  style={s.key === activeScript.key
                    ? { background: s.color, color: '#fff', boxShadow: `0 2px 10px ${s.color}50` }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {s.label}
                  <span className="ml-1.5 font-normal text-xs opacity-80">{s.labelJp}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Đang tải...' : `${lessons.length} nhóm · ${totalChars} ký tự`}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {loading ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-muted)' }}>Đang tải bảng chữ cái...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-3 opacity-40"><FaBookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} /></div>
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Không có dữ liệu.</p>
          </div>
        ) : (
          lessons.map(lesson => (
            <section key={lesson.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h2>
                  {lesson.description && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{lesson.items.length} ký tự</span>
              </div>
              <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {lesson.items.map(item => (
                  <CharCard key={item.id} item={item} accent={activeScript} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}

// ─── Default export with Suspense (required for useSearchParams) ──────────────
export default function AlphabetClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      </div>
    }>
      <AlphabetPageContent />
    </Suspense>
  );
}
