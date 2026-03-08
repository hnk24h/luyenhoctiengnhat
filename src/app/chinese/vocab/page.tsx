'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FaBookmark, FaMagnifyingGlass, FaVolumeHigh, FaChevronDown, FaArrowLeft } from 'react-icons/fa6';

const HSK_LEVELS = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
const LEVEL_COLORS: Record<string, string> = {
  HSK1: '#48BB78', HSK2: '#4299E1', HSK3: '#9F7AEA', HSK4: '#ED8936', HSK5: '#F56565', HSK6: '#D53F8C',
};

type VocabItem = {
  id: string;
  term: string;
  pronunciation: string;
  meanings: { id: string; language: string; meaning: string }[];
};

type ApiItem = {
  id: string;
  term: string;
  pronunciation: string;
  meanings: { id: string; language: string; meaning: string }[];
};

export default function ChineseVocabPage() {
  const [selectedLevel, setSelectedLevel] = useState('HSK1');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  const fetchVocab = useCallback(async (level: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chinese/vocab?level=${level}`);
      const data: ApiItem[] = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVocab(selectedLevel); }, [selectedLevel, fetchVocab]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i =>
      i.term.includes(q) || i.pronunciation.toLowerCase().includes(q) || (i.meanings?.[0]?.meaning ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  function toggleFlip(id: string) {
    setFlipped(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const color = LEVEL_COLORS[selectedLevel] ?? '#6C5CE7';

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="border-b sticky top-16 z-30" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/chinese" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> Tiếng Trung
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Từ vựng</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Level tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {HSK_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => { setSelectedLevel(lvl); setSearch(''); setFlipped(new Set()); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={selectedLevel === lvl
                    ? { background: LEVEL_COLORS[lvl], color: '#fff' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <FaMagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm từ vựng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>
              Từ vựng{' '}
              <span className="px-2 py-0.5 rounded-lg text-sm" style={{ background: `${color}20`, color }}>
                {selectedLevel}
              </span>
            </h1>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} từ
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-4 animate-pulse h-28" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📭</div>
            <p style={{ color: 'var(--text-muted)' }}>Không có từ vựng nào{search ? ' phù hợp' : ''}.</p>
            {!search && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Hãy chạy seeder: <code className="px-2 py-0.5 rounded bg-black/10">npx tsx prisma/seed-hsk.ts</code>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(item => {
              const isFlipped = flipped.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: isFlipped ? `${color}12` : 'var(--bg-surface)',
                    borderColor: isFlipped ? color : 'var(--border)',
                    minHeight: '7rem',
                  }}>
                  {!isFlipped ? (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.term}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.pronunciation}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      <span className="text-sm font-bold text-center leading-snug" style={{ color }}>{item.meanings?.[0]?.meaning ?? ''}</span>
                      <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.term}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tip */}
      {!loading && filtered.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            💡 Nhấn vào thẻ để xem nghĩa tiếng Việt
          </p>
        </div>
      )}
    </main>
  );
}
