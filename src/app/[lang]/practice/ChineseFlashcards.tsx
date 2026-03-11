'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaRotate, FaChevronLeft, FaChevronRight, FaCheck, FaXmark } from 'react-icons/fa6';

const HSK_LEVELS = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
const LEVEL_COLORS: Record<string, string> = {
  HSK1: '#48BB78', HSK2: '#4299E1', HSK3: '#9F7AEA', HSK4: '#ED8936', HSK5: '#F56565', HSK6: '#D53F8C',
};

type Card = { id: string; front: string; back: string; pinyin: string };

type ApiItem = {
  id: string;
  term: string;
  pronunciation: string;
  meanings: { id: string; language: string; meaning: string }[];
};

export function ChineseFlashcardsContent() {
  const [selectedLevel, setSelectedLevel] = useState('HSK1');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const load = useCallback(async (level: string) => {
    setLoading(true);
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setFinished(false);
    try {
      const res = await fetch(`/api/chinese/vocab?level=${level}`);
      const data: ApiItem[] = await res.json();
      setCards(data.map(d => ({ id: d.id, front: d.term, pinyin: d.pronunciation, back: d.meanings?.[0]?.meaning ?? '' })));
    } catch { setCards([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(selectedLevel); }, [selectedLevel, load]);

  const current = cards[index];
  const color = LEVEL_COLORS[selectedLevel] ?? '#6C5CE7';
  const total = cards.length;

  function next() {
    if (index + 1 >= total) { setFinished(true); return; }
    setIndex(i => i + 1); setFlipped(false);
  }
  function prev() { if (index > 0) { setIndex(i => i - 1); setFlipped(false); } }

  function markKnown() {
    setKnown(s => new Set([...s, current.id]));
    next();
  }
  function markUnknown() {
    setUnknown(s => new Set([...s, current.id]));
    next();
  }
  function restart() {
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setFinished(false);
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/zh" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> Tiếng Trung
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Flashcard</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Flashcard Tiếng Trung</h1>
            <div className="flex gap-1.5 flex-wrap">
              {HSK_LEVELS.map(lvl => (
                <button key={lvl} onClick={() => setSelectedLevel(lvl)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all"
                  style={selectedLevel === lvl ? { background: LEVEL_COLORS[lvl], color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="rounded-3xl border h-64 animate-pulse" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu từ vựng.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Chạy: <code>npx tsx prisma/seed-hsk.ts</code></p>
          </div>
        ) : finished ? (
          /* ── Finished Screen ── */
          <div className="card border rounded-3xl p-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Hoàn thành!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Bạn đã ôn tập {total} từ vựng {selectedLevel}</p>
            <div className="flex gap-4 justify-center mb-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold" style={{ color: '#48BB78' }}>{known.size}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Đã thuộc</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold" style={{ color: '#F56565' }}>{unknown.size}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cần ôn thêm</div>
              </div>
            </div>
            <button onClick={restart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: color }}>
              <FaRotate size={13} /> Làm lại
            </button>
          </div>
        ) : (
          /* ── Flashcard ── */
          <div>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${((index) / total) * 100}%`, background: color }} />
              </div>
              <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>{index + 1} / {total}</span>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-4">
              <span className="text-xs px-2 py-1 rounded-xl font-bold" style={{ background: '#48BB7820', color: '#48BB78' }}>{known.size} đã thuộc</span>
              <span className="text-xs px-2 py-1 rounded-xl font-bold" style={{ background: '#F5656520', color: '#F56565' }}>{unknown.size} cần ôn</span>
            </div>

            {/* Card */}
            <button
              onClick={() => setFlipped(f => !f)}
              className="w-full rounded-3xl border p-10 text-center transition-all hover:shadow-lg cursor-pointer"
              style={{
                background: flipped ? `${color}12` : 'var(--bg-surface)',
                borderColor: flipped ? color : 'var(--border)',
                minHeight: '220px',
              }}>
              {!flipped ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{current.front}</span>
                  <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{current.pinyin}</span>
                  <span className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl font-bold" style={{ color }}>{current.back}</span>
                  <span className="text-lg mt-1" style={{ color: 'var(--text-secondary)' }}>{current.front}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{current.pinyin}</span>
                </div>
              )}
            </button>

            {/* Actions */}
            {flipped ? (
              <div className="flex gap-3 mt-4">
                <button onClick={markUnknown}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 transition-all hover:bg-red-50"
                  style={{ borderColor: '#F56565', color: '#F56565' }}>
                  <FaXmark size={13} /> Chưa thuộc
                </button>
                <button onClick={markKnown}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ background: '#48BB78' }}>
                  <FaCheck size={13} /> Đã thuộc
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-4">
                <button onClick={prev} disabled={index === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', opacity: index === 0 ? 0.4 : 1 }}>
                  <FaChevronLeft size={12} /> Trước
                </button>
                <button onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ background: color }}>
                  Tiếp <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
