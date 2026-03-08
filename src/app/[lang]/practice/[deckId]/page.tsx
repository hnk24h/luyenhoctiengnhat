'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowLeft, FaPlus, FaXmark, FaCheck, FaBolt,
  FaLayerGroup, FaTrash, FaPencil, FaCircleCheck,
  FaClockRotateLeft, FaEllipsisVertical, FaImage,
  FaDownload, FaUpload, FaFileArrowDown, FaFileCsv,
} from 'react-icons/fa6';

interface Progress {
  interval: number; repetitions: number; easeFactor: number;
  dueAt: string; lastReview: string | null; totalReviews: number;
}
interface Card {
  id: string; front: string; back: string;
  reading: string | null; example: string | null;
  imageUrl: string | null;
  progress: Progress | null;
}
interface Deck {
  id: string; title: string; description: string | null;
  color: string; cards: Card[];
}

const PRESET_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0891B2', '#374151',
];

function isDue(card: Card): boolean {
  if (!card.progress) return true;
  return new Date(card.progress.dueAt) <= new Date();
}

function CardItem({
  card, deckColor, onEdit, onDelete,
}: {
  card: Card;
  deckColor: string;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const due = isDue(card);

  return (
    <div className="card group relative" style={{ borderLeft: `3px solid ${deckColor}` }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {card.imageUrl && (
            <div className="mb-2">
              <Image src={card.imageUrl} alt={card.front} width={72} height={72}
                className="rounded-lg object-cover" style={{ maxHeight: 72 }} />
            </div>
          )}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-bold text-base" style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {card.front}
            </span>
            {card.reading && (
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>({card.reading})</span>
            )}
            {due && (
              <span className="badge text-xs shrink-0" style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '1px 7px', borderRadius: 12, fontWeight: 600 }}>
                Cần ôn
              </span>
            )}
            {!due && card.progress && (
              <span className="badge text-xs shrink-0" style={{ background: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0', padding: '1px 7px', borderRadius: 12, fontWeight: 600 }}>
                <FaCircleCheck size={9} style={{ display: 'inline', marginRight: 3 }} />
                {card.progress.interval}d
              </span>
            )}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{card.back}</div>
          {card.example && (
            <div className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              {card.example}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative shrink-0">
          <button onClick={() => setOpen(o => !o)} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <FaEllipsisVertical size={13} />
          </button>
          {open && (
            <div className="absolute right-0 top-8 z-20 card shadow-lg min-w-28 p-1"
              style={{ background: 'var(--bg-base)' }}
              onBlur={() => setOpen(false)}>
              <button
                onClick={() => { onEdit(card); setOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--text-base)' }}>
                <FaPencil size={11} /> Sửa
              </button>
              <button
                onClick={() => { onDelete(card.id); setOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-red-50 transition-colors"
                style={{ color: '#EF4444' }}>
                <FaTrash size={11} /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeckPage({ params }: { params: { lang: string; deckId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deck,    setDeck]    = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [form,     setForm]     = useState({ front: '', back: '', reading: '', example: '', imageUrl: '' });
  const [saving,   setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit deck
  const [editingDeck,  setEditingDeck]  = useState(false);
  const [deckTitle,    setDeckTitle]    = useState('');
  const [deckDesc,     setDeckDesc]     = useState('');
  const [deckColor,    setDeckColor]    = useState('#4F46E5');

  // Import state
  const [showImport,   setShowImport]   = useState(false);
  const [importText,   setImportText]   = useState('');
  const [importFmt,    setImportFmt]    = useState<'json' | 'csv'>('json');
  const [importParsed, setImportParsed] = useState<{ front: string; back: string; reading?: string; example?: string }[] | null>(null);
  const [importError,  setImportError]  = useState('');
  const [importing,    setImporting]    = useState(false);

  const loadDeck = useCallback(async () => {
    const res = await fetch(`/api/flashcards/${params.deckId}`);
    if (res.ok) {
      const data = await res.json();
      setDeck(data);
      setDeckTitle(data.title);
      setDeckDesc(data.description ?? '');
      setDeckColor(data.color);
    }
    setLoading(false);
  }, [params.deckId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') loadDeck();
  }, [status, loadDeck, router]);

  function openNew() {
    setEditCard(null);
    setForm({ front: '', back: '', reading: '', example: '', imageUrl: '' });
    setShowForm(true);
  }
  function openEdit(card: Card) {
    setEditCard(card);
    setForm({ front: card.front, back: card.back, reading: card.reading ?? '', example: card.example ?? '', imageUrl: card.imageUrl ?? '' });
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/flashcards/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setForm(f => ({ ...f, imageUrl: url }));
    }
    setUploading(false);
    e.target.value = '';
  }

  async function saveCard(e: React.FormEvent) {
    e.preventDefault();
    if (!form.front.trim() || !form.back.trim()) return;
    setSaving(true);

    const body = JSON.stringify(form);
    const url  = editCard
      ? `/api/flashcards/cards/${editCard.id}`
      : `/api/flashcards/${params.deckId}/cards`;
    const method = editCard ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
    if (res.ok) {
      setShowForm(false);
      setForm({ front: '', back: '', reading: '', example: '', imageUrl: '' });
      await loadDeck();
    }
    setSaving(false);
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportJSON() {
    if (!deck) return;
    const data = deck.cards.map(c => ({
      front: c.front, back: c.back,
      ...(c.reading  ? { reading:  c.reading  } : {}),
      ...(c.example  ? { example:  c.example  } : {}),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${deck.title}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  function exportCSV() {
    if (!deck) return;
    const escape = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['front', 'back', 'reading', 'example'].join(','),
      ...deck.cards.map(c => [c.front, c.back, c.reading ?? '', c.example ?? ''].map(escape).join(',')),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${deck.title}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── Import parse ──────────────────────────────────────────────────────────
  function parseImportText(text: string, fmt: 'json' | 'csv') {
    setImportError(''); setImportParsed(null);
    if (!text.trim()) return;
    try {
      if (fmt === 'json') {
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('Phải là một mảng JSON');
        const cards = arr.filter((c: any) => c.front?.trim() && c.back?.trim());
        if (cards.length === 0) throw new Error('Không tìm thấy thẻ hợp lệ (cần có front và back)');
        setImportParsed(cards);
      } else {
        // CSV — first row is header
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) throw new Error('CSV cần ít nhất 1 dòng dữ liệu sau header');
        const parseCsvRow = (row: string) => {
          const result: string[] = [];
          let cur = ''; let inq = false;
          for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            if (ch === '"') { if (inq && row[i+1] === '"') { cur += '"'; i++; } else { inq = !inq; } }
            else if (ch === ',' && !inq) { result.push(cur); cur = ''; }
            else cur += ch;
          }
          result.push(cur);
          return result.map(s => s.trim());
        };
        const header = parseCsvRow(lines[0]).map(h => h.toLowerCase());
        const fi = header.indexOf('front'), bi = header.indexOf('back'),
              ri = header.indexOf('reading'), ei = header.indexOf('example');
        if (fi === -1 || bi === -1) throw new Error('CSV cần cột "front" và "back"');
        const cards = lines.slice(1).map(l => {
          const cols = parseCsvRow(l);
          return {
            front:   cols[fi] ?? '', back: cols[bi] ?? '',
            reading: ri !== -1 ? cols[ri] : undefined,
            example: ei !== -1 ? cols[ei] : undefined,
          };
        }).filter(c => c.front && c.back);
        if (cards.length === 0) throw new Error('Không có dòng dữ liệu hợp lệ');
        setImportParsed(cards);
      }
    } catch (e: any) {
      setImportError(e.message || 'Lỗi phân tích dữ liệu');
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const fmt: 'json' | 'csv' = file.name.endsWith('.csv') ? 'csv' : 'json';
    setImportFmt(fmt);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setImportText(text);
      parseImportText(text, fmt);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function doImport() {
    if (!importParsed?.length) return;
    setImporting(true);
    const res = await fetch(`/api/flashcards/${params.deckId}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: importParsed }),
    });
    if (res.ok) {
      setShowImport(false); setImportText(''); setImportParsed(null);
      await loadDeck();
    } else {
      const err = await res.json();
      setImportError(err.error || 'Import thất bại');
    }
    setImporting(false);
  }

  async function deleteCard(id: string) {
    if (!confirm('Xóa thẻ này?')) return;
    await fetch(`/api/flashcards/cards/${id}`, { method: 'DELETE' });
    setDeck(d => d ? { ...d, cards: d.cards.filter(c => c.id !== id) } : d);
  }

  async function saveDeckMeta(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/flashcards/${params.deckId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: deckTitle, description: deckDesc, color: deckColor }),
    });
    if (res.ok) {
      setEditingDeck(false);
      await loadDeck();
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!deck) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Không tìm thấy bộ thẻ.</div>;

  const dueCards = deck.cards.filter(isDue);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href={`/${params.lang}/practice`} className="inline-flex items-center gap-1.5 text-sm mb-6 btn-ghost" style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={11} /> Danh sách bộ thẻ
      </Link>

      {/* Deck header */}
      <div className="card mb-6" style={{ borderTop: `4px solid ${deck.color}` }}>
        {editingDeck ? (
          <form onSubmit={saveDeckMeta} className="space-y-3">
            <input className="input w-full" value={deckTitle} onChange={e => setDeckTitle(e.target.value)} placeholder="Tên bộ thẻ" />
            <textarea className="input w-full resize-none" rows={2} value={deckDesc} onChange={e => setDeckDesc(e.target.value)} placeholder="Mô tả..." />
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setDeckColor(c)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{ background: c, outline: deckColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px', opacity: deckColor === c ? 1 : 0.6 }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingDeck(false)} className="btn-secondary flex-1">Hủy</button>
              <button type="submit" className="btn-primary flex-1">Lưu</button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: deck.color + '20', color: deck.color }}>
                <FaLayerGroup size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-base)' }}>{deck.title}</h1>
                {deck.description && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{deck.description}</p>}
                <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span><strong style={{ color: 'var(--text-base)' }}>{deck.cards.length}</strong> thẻ</span>
                  {dueCards.length > 0 && (
                    <span style={{ color: '#D97706' }}><strong>{dueCards.length}</strong> cần ôn hôm nay</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
              <button onClick={() => setEditingDeck(true)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                <FaPencil size={11} /> Sửa
              </button>
              {/* Export dropdown */}
              <div className="relative group">
                <button className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                  <FaDownload size={11} /> Export
                </button>
                <div className="absolute right-0 top-full mt-1 z-20 card shadow-lg min-w-36 p-1 hidden group-hover:block"
                  style={{ background: 'var(--bg-base)' }}>
                  <button onClick={exportJSON}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: 'var(--text-base)' }}>
                    <FaFileArrowDown size={11} /> JSON
                  </button>
                  <button onClick={exportCSV}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                    style={{ color: 'var(--text-base)' }}>
                    <FaFileCsv size={11} /> CSV
                  </button>
                </div>
              </div>
              <button onClick={() => { setShowImport(true); setImportText(''); setImportParsed(null); setImportError(''); }}
                className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                <FaUpload size={11} /> Import
              </button>
              {deck.cards.length > 0 && (
                <Link href={`/${params.lang}/practice/${deck.id}/study`}
                  className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: deck.color }}>
                  <FaBolt size={11} /> Ôn tập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add card button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold" style={{ color: 'var(--text-base)' }}>
          Danh sách thẻ
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({deck.cards.length})</span>
        </h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm" style={{ background: deck.color }}>
          <FaPlus size={12} /> Thêm thẻ
        </button>
      </div>

      {/* Cards */}
      {deck.cards.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3 opacity-30">🃏</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Chưa có thẻ nào</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Thêm thẻ để bắt đầu học</p>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2" style={{ background: deck.color }}>
            <FaPlus size={12} /> Thêm thẻ đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {deck.cards.map(card => (
            <CardItem key={card.id} card={card} deckColor={deck.color} onEdit={openEdit} onDelete={deleteCard} />
          ))}
        </div>
      )}

      {/* Add/Edit card modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
                {editCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>
            <form onSubmit={saveCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                    Mặt trước (Tiếng Nhật) *
                  </label>
                  <input className="input w-full" style={{ fontFamily: '"Noto Sans JP", serif', fontSize: 16 }}
                    placeholder="食べる" value={form.front} onChange={e => setForm(f => ({ ...f, front: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                    Cách đọc (furigana)
                  </label>
                  <input className="input w-full" style={{ fontFamily: '"Noto Sans JP", serif' }}
                    placeholder="たべる" value={form.reading} onChange={e => setForm(f => ({ ...f, reading: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                  Mặt sau (Nghĩa tiếng Việt) *
                </label>
                <input className="input w-full" placeholder="ăn" value={form.back}
                  onChange={e => setForm(f => ({ ...f, back: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                  Câu ví dụ (tùy chọn)
                </label>
                <textarea className="input w-full resize-none" rows={2}
                  style={{ fontFamily: '"Noto Sans JP", serif' }}
                  placeholder="毎日ご飯を食べます。— Tôi ăn cơm mỗi ngày."
                  value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))} />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-base)' }}>
                  Hình ảnh (tùy chọn)
                </label>
                <div className="flex items-start gap-3">
                  {form.imageUrl ? (
                    <div className="relative shrink-0">
                      <Image src={form.imageUrl} alt="preview" width={80} height={80}
                        className="rounded-lg object-cover border"
                        style={{ borderColor: 'var(--border)', width: 80, height: 80 }} />
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ background: '#EF4444' }}>
                        <FaXmark size={9} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <FaImage size={22} />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2"
                      style={{ opacity: uploading ? 0.6 : 1 }}>
                      {uploading ? (
                        <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Đang tải...</>
                      ) : (
                        <><FaImage size={12} /> Chọn ảnh</>
                      )}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageUpload} />
                    </label>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>JPG, PNG, GIF, WEBP · tối đa 5 MB</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Hủy</button>
                <button type="submit" disabled={!form.front.trim() || !form.back.trim() || saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  style={{ background: deck.color }}>
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <FaCheck size={12} />}
                  {editCard ? 'Lưu thay đổi' : 'Thêm thẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Import modal ── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowImport(false)}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Import thẻ</h2>
              <button onClick={() => setShowImport(false)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
            </div>

            {/* Format tabs */}
            <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: 'var(--border)' }}>
              {(['json', 'csv'] as const).map(fmt => (
                <button key={fmt} onClick={() => { setImportFmt(fmt); setImportParsed(null); setImportError(''); if (importText) parseImportText(importText, fmt); }}
                  className="flex-1 py-1.5 rounded-md text-sm font-medium transition-all"
                  style={importFmt === fmt
                    ? { background: 'white', color: 'var(--primary)', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: 'var(--text-muted)' }}>
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Format hint */}
            <div className="rounded-lg p-3 mb-4 text-xs font-mono overflow-x-auto"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {importFmt === 'json' ? (
                <pre style={{ margin: 0 }}>{`[\n  { "front": "食べる", "back": "ăn", "reading": "たべる", "example": "..." },\n  { "front": "飲む",   "back": "uống" }\n]`}</pre>
              ) : (
                <pre style={{ margin: 0 }}>{`front,back,reading,example\n食べる,ăn,たべる,毎日ご飯を食べます\n飲む,uống,,`}</pre>
              )}
            </div>

            {/* File upload */}
            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2 mb-3">
              <FaUpload size={11} /> Chọn file (.{importFmt})
              <input type="file" accept={importFmt === 'json' ? '.json,application/json' : '.csv,text/csv'}
                className="hidden" onChange={handleImportFile} />
            </label>

            {/* Text area */}
            <textarea
              className="input w-full resize-y font-mono text-xs"
              rows={7}
              placeholder={importFmt === 'json' ? '[{"front":"...","back":"..."}]' : 'front,back,reading,example\n...'}
              value={importText}
              onChange={e => { setImportText(e.target.value); parseImportText(e.target.value, importFmt); }}
            />

            {/* Parse result */}
            {importParsed && (
              <div className="mt-3 flex items-center gap-2 text-sm rounded-lg px-3 py-2"
                style={{ background: '#DCFCE7', color: '#15803D' }}>
                <FaCheck size={12} />
                Tìm thấy <strong>{importParsed.length} thẻ</strong> hợp lệ — sẵn sàng import
              </div>
            )}
            {importError && (
              <div className="mt-3 text-sm rounded-lg px-3 py-2"
                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                ⚠ {importError}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowImport(false)} className="btn-secondary flex-1">Hủy</button>
              <button
                onClick={doImport}
                disabled={!importParsed?.length || importing}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                style={{ background: deck.color }}>
                {importing
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FaUpload size={12} />}
                Import {importParsed ? `${importParsed.length} thẻ` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due reminder */}
      {dueCards.length > 0 && deck.cards.length > 0 && (
        <div className="card mt-6 flex items-center justify-between gap-4"
          style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#92400E' }}>
            <FaClockRotateLeft size={14} />
            <span><strong>{dueCards.length} thẻ</strong> cần ôn hôm nay</span>
          </div>
          <Link href={`/${params.lang}/practice/${deck.id}/study`}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0"
            style={{ background: '#D97706' }}>
            <FaBolt size={11} /> Ôn ngay
          </Link>
        </div>
      )}
    </main>
  );
}
