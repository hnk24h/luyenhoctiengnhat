'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaBook, FaChevronDown, FaMagnifyingGlass } from 'react-icons/fa6';

const HSK_LEVELS = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
const LEVEL_COLORS: Record<string, string> = {
  HSK1: '#48BB78', HSK2: '#4299E1', HSK3: '#9F7AEA', HSK4: '#ED8936', HSK5: '#F56565', HSK6: '#D53F8C',
};

type Passage = {
  id: string;
  title: string;
  titleVi: string | null;
  level: string;
  content: string;
  pinyin: string | null;
  translation: string | null;
  topic: string | null;
};

export default function ChineseReadingPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Passage | null>(null);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const fetchPassages = useCallback(async (level?: string) => {
    setLoading(true);
    try {
      const url = level ? `/api/chinese/passages?level=${level}` : '/api/chinese/passages';
      const res = await fetch(url);
      const data: Passage[] = await res.json();
      setPassages(data);
    } catch {
      setPassages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPassages(selectedLevel ?? undefined); }, [selectedLevel, fetchPassages]);

  if (selected) {
    const color = LEVEL_COLORS[selected.level] ?? '#6C5CE7';
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Back */}
          <button onClick={() => { setSelected(null); setShowPinyin(false); setShowTranslation(false); }}
            className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            <FaArrowLeft size={12} /> Danh sách bài đọc
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold text-white mb-3"
              style={{ background: color }}>
              {selected.level}
            </span>
            {selected.topic && (
              <span className="ml-2 text-xs px-2 py-1 rounded-xl" style={{ background: `${color}18`, color }}>
                {selected.topic}
              </span>
            )}
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>{selected.title}</h1>
            {selected.titleVi && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.titleVi}</p>}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowPinyin(p => !p)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={showPinyin
                ? { background: color, color: '#fff', borderColor: color }
                : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              拼音 Pinyin
            </button>
            <button
              onClick={() => setShowTranslation(p => !p)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={showTranslation
                ? { background: color, color: '#fff', borderColor: color }
                : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              🇻🇳 Dịch nghĩa
            </button>
          </div>

          {/* Passage */}
          <div className="card border rounded-3xl p-6 mb-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xl leading-loose" style={{ color: 'var(--text-primary)', fontFamily: 'Noto Serif SC, serif', lineHeight: 2.2 }}>
              {selected.content}
            </p>
          </div>

          {showPinyin && selected.pinyin && (
            <div className="card border rounded-3xl p-6 mb-4" style={{ background: `${color}08`, borderColor: `${color}30` }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color }}>Pinyin</div>
              <p className="text-sm leading-loose" style={{ color: 'var(--text-secondary)' }}>{selected.pinyin}</p>
            </div>
          )}

          {showTranslation && selected.translation && (
            <div className="card border rounded-3xl p-6" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Dịch nghĩa (Tiếng Việt)</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.translation}</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="border-b sticky top-16 z-30" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/chinese" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> Tiếng Trung
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Đọc hiểu</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Bài đọc Tiếng Trung</h1>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedLevel(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={!selectedLevel ? { background: '#666', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                Tất cả
              </button>
              {HSK_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={selectedLevel === lvl
                    ? { background: LEVEL_COLORS[lvl], color: '#fff' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border p-5 animate-pulse h-36" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
            ))}
          </div>
        ) : passages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📖</div>
            <p style={{ color: 'var(--text-muted)' }}>Chưa có bài đọc nào.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Chạy: <code className="px-2 py-0.5 rounded bg-black/10">npx tsx prisma/seed-hsk.ts</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {passages.map(p => {
              const color = LEVEL_COLORS[p.level] ?? '#6C5CE7';
              const preview = p.content.slice(0, 80) + (p.content.length > 80 ? '…' : '');
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="card border rounded-3xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md group"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xl text-xs font-bold text-white" style={{ background: color }}>{p.level}</span>
                      {p.topic && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.topic}</span>}
                    </div>
                    <FaArrowRight size={12} style={{ color: 'var(--text-muted)' }} className="mt-0.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-bold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                  {p.titleVi && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{p.titleVi}</p>}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Noto Serif SC, serif' }}>{preview}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
