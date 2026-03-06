'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaLayerGroup, FaPlus, FaXmark, FaCheck, FaBolt,
  FaCircleCheck, FaClockRotateLeft, FaTrash,
} from 'react-icons/fa6';

interface Deck {
  id: string;
  title: string;
  description: string | null;
  color: string;
  _count: { cards: number };
  dueCount: number;
  updatedAt: string;
}

const PRESET_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0891B2', '#374151',
];

export default function FlashcardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [decks,   setDecks]   = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const [newTitle, setNewTitle]   = useState('');
  const [newDesc,  setNewDesc]    = useState('');
  const [newColor, setNewColor]   = useState('#4F46E5');
  const [creating, setCreating]   = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    const res = await fetch('/api/flashcards');
    if (res.ok) setDecks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') loadDecks();
  }, [status, loadDecks, router]);

  async function createDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, color: newColor }),
    });
    if (res.ok) {
      setNewTitle(''); setNewDesc(''); setNewColor('#4F46E5');
      setShowNew(false);
      await loadDecks();
    }
    setCreating(false);
  }

  async function deleteDeck(id: string) {
    if (!confirm('Xóa bộ thẻ này? Tất cả thẻ sẽ bị xóa.')) return;
    setDeleting(id);
    await fetch(`/api/flashcards/${id}`, { method: 'DELETE' });
    setDecks(d => d.filter(x => x.id !== id));
    setDeleting(null);
  }

  const totalCards = decks.reduce((s, d) => s + d._count.cards, 0);
  const totalDue   = decks.reduce((s, d) => s + d.dueCount, 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <FaLayerGroup size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-base)' }}>Flashcard</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Học từ vựng theo phương pháp lặp lại có khoảng cách (Spaced Repetition)
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <FaPlus size={13} /> Tạo bộ thẻ
        </button>
      </div>

      {/* Stats row */}
      {decks.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {[
            { label: 'Bộ thẻ', value: decks.length, icon: <FaLayerGroup size={14} />, color: 'var(--primary)' },
            { label: 'Tổng thẻ', value: totalCards, icon: <FaCircleCheck size={14} />, color: '#059669' },
            { label: 'Cần ôn', value: totalDue, icon: <FaBolt size={14} />, color: '#D97706' },
          ].map(s => (
            <div key={s.label} className="card flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 p-3 sm:p-4 text-center sm:text-left">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: s.color + '15', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold leading-none" style={{ color: 'var(--text-base)' }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New deck modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNew(false)}>
          <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Tạo bộ thẻ mới</h2>
              <button onClick={() => setShowNew(false)} className="btn-ghost p-1.5">
                <FaXmark size={14} />
              </button>
            </div>
            <form onSubmit={createDeck} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                  Tên bộ thẻ *
                </label>
                <input
                  className="input w-full"
                  placeholder="Ví dụ: N5 Từ vựng, Động từ nhóm 1..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  className="input w-full resize-none"
                  rows={2}
                  placeholder="Ghi chú về bộ thẻ này..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-base)' }}>
                  Màu sắc
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setNewColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        outline: newColor === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                        opacity: newColor === c ? 1 : 0.65,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex-1">
                  Hủy
                </button>
                <button type="submit" disabled={!newTitle.trim() || creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaCheck size={12} />}
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deck list */}
      {decks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--primary-light)' }}>
            <FaLayerGroup size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-base)' }}>
            Chưa có bộ thẻ nào
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Tạo bộ thẻ đầu tiên để bắt đầu học theo phương pháp Anki
          </p>
          <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-2">
            <FaPlus size={13} /> Tạo bộ thẻ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="card group relative" style={{ borderTop: `3px solid ${deck.color}` }}>
              {/* Delete button */}
              <button
                onClick={() => deleteDeck(deck.id)}
                disabled={deleting === deck.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-1.5"
                style={{ color: '#EF4444' }}
              >
                <FaTrash size={12} />
              </button>

              <Link href={`/flashcards/${deck.id}`} className="block">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: deck.color + '20', color: deck.color }}>
                    <FaLayerGroup size={16} />
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <h3 className="font-bold truncate" style={{ color: 'var(--text-base)' }}>
                      {deck.title}
                    </h3>
                    {deck.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {deck.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-base)' }}>{deck._count.cards}</span> thẻ
                    </span>
                    {deck.dueCount > 0 && (
                      <span className="flex items-center gap-1" style={{ color: '#D97706' }}>
                        <FaBolt size={10} />
                        <span className="font-semibold">{deck.dueCount}</span> cần ôn
                      </span>
                    )}
                    {deck.dueCount === 0 && deck._count.cards > 0 && (
                      <span className="flex items-center gap-1" style={{ color: '#059669' }}>
                        <FaCircleCheck size={10} /> Đã ôn xong
                      </span>
                    )}
                  </div>
                  {deck._count.cards > 0 && (
                    <Link
                      href={`/flashcards/${deck.id}/study`}
                      onClick={e => e.stopPropagation()}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                      style={{ background: deck.color }}
                    >
                      <FaBolt size={10} /> Ôn tập
                    </Link>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="card mt-8" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
        <div className="flex items-start gap-3">
          <FaClockRotateLeft size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>
              Phương pháp Spaced Repetition
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--primary)' }}>
              Hệ thống sẽ tự động nhắc bạn ôn đúng lúc bạn sắp quên — thẻ khó xuất hiện thường xuyên hơn,
              thẻ dễ xuất hiện thưa hơn. Ôn đều đặn mỗi ngày để đạt hiệu quả tốt nhất.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
