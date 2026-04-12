import React, { useState, useRef } from 'react';
import {
  FaCirclePlus, FaFileArrowUp, FaPlus, FaPencil, FaTrash,
  FaMagnifyingGlass, FaGripVertical, FaCheck, FaXmark,
} from 'react-icons/fa6';

import type { Lesson, LearningItem } from '@/types/lesson';

// ─── Quick Add Form ──────────────────────────────────────────────────────────

interface QuickAddProps {
  onAdd: (data: { term: string; pronunciation: string; meaning: string; type: string }) => Promise<void>;
}

function QuickAddRow({ onAdd }: QuickAddProps) {
  const [term, setTerm] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [meaning, setMeaning] = useState('');
  const [saving, setSaving] = useState(false);
  const termRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!term.trim() || !meaning.trim()) return;
    setSaving(true);
    try {
      await onAdd({ term: term.trim(), pronunciation: pronunciation.trim(), meaning: meaning.trim(), type: 'vocab' });
      setTerm(''); setPronunciation(''); setMeaning('');
      termRef.current?.focus();
    } finally { setSaving(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') { setTerm(''); setPronunciation(''); setMeaning(''); }
  }

  return (
    <div className="flex items-center gap-1.5 p-2 rounded-lg border border-dashed transition-all"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
      <input ref={termRef} value={term} onChange={e => setTerm(e.target.value)} onKeyDown={handleKeyDown}
        className="input text-xs py-1 px-1.5 w-24 font-bold" placeholder="漢字" style={{ fontFamily: '"Noto Sans JP", serif' }} />
      <input value={pronunciation} onChange={e => setPronunciation(e.target.value)} onKeyDown={handleKeyDown}
        className="input text-xs py-1 px-1.5 w-24" placeholder="よみかた" style={{ fontFamily: '"Noto Sans JP", serif' }} />
      <input value={meaning} onChange={e => setMeaning(e.target.value)} onKeyDown={handleKeyDown}
        className="input text-xs py-1 px-1.5 flex-1" placeholder="Nghĩa..." />
      <button onClick={handleSubmit} disabled={saving || !term.trim() || !meaning.trim()}
        className="p-1 rounded bg-blue-500 text-white disabled:opacity-40 hover:bg-blue-600 transition shrink-0" title="Thêm (Enter)">
        {saving ? <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin block" /> : <FaPlus size={10} />}
      </button>
    </div>
  );
}

// ─── Inline Edit Row ─────────────────────────────────────────────────────────

interface InlineEditProps {
  item: LearningItem;
  onSave: (id: string, data: { term: string; pronunciation: string; meaning: string }) => Promise<void>;
  onCancel: () => void;
}

function InlineEditRow({ item, onSave, onCancel }: InlineEditProps) {
  const [term, setTerm] = useState(item.term);
  const [pronunciation, setPronunciation] = useState(item.pronunciation ?? '');
  const [meaning, setMeaning] = useState(item.meanings?.[0]?.meaning ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!term.trim() || !meaning.trim()) return;
    setSaving(true);
    try { await onSave(item.id, { term: term.trim(), pronunciation: pronunciation.trim(), meaning: meaning.trim() }); }
    finally { setSaving(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="rounded-xl px-3 py-2 border-2 border-blue-400 bg-blue-50/50">
      <div className="flex items-center gap-2">
        <input value={term} onChange={e => setTerm(e.target.value)} onKeyDown={handleKeyDown} autoFocus
          className="input text-sm py-0.5 px-1.5 w-28 font-bold" style={{ fontFamily: '"Noto Sans JP", serif' }} />
        <input value={pronunciation} onChange={e => setPronunciation(e.target.value)} onKeyDown={handleKeyDown}
          className="input text-xs py-0.5 px-1.5 w-28" placeholder="Phát âm" style={{ fontFamily: '"Noto Sans JP", serif' }} />
        <input value={meaning} onChange={e => setMeaning(e.target.value)} onKeyDown={handleKeyDown}
          className="input text-xs py-0.5 px-1.5 flex-1" placeholder="Nghĩa" />
        <button onClick={handleSave} disabled={saving} className="p-1 rounded hover:bg-green-100 text-green-600" title="Lưu (Enter)">
          <FaCheck size={11} />
        </button>
        <button onClick={onCancel} className="p-1 rounded hover:bg-gray-200" title="Hủy (Esc)">
          <FaXmark size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemPanelProps {
  items: LearningItem[];
  activeLesId: string | null;
  lessons: Lesson[];
  openItemCreate: () => void;
  openItemEdit: (item: LearningItem) => void;
  deleteItem: (id: string) => void;
  openImport: () => void;
  quickAddItem?: (data: { term: string; pronunciation: string; meaning: string; type: string }) => Promise<void>;
  inlineEditItem?: (id: string, data: { term: string; pronunciation: string; meaning: string }) => Promise<void>;
  reorderItems?: (orderedIds: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ItemPanel({
  items, activeLesId, lessons,
  openItemCreate, openItemEdit, deleteItem, openImport,
  quickAddItem, inlineEditItem, reorderItems,
}: ItemPanelProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const filtered = search
    ? items.filter(it =>
        it.term.toLowerCase().includes(search.toLowerCase()) ||
        (it.pronunciation ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (it.meanings?.[0]?.meaning ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : items;

  // DnD handlers
  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id); e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault(); setDragOverId(id);
  }
  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const ids = items.map(i => i.id);
    const from = ids.indexOf(dragId), to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1); ids.splice(to, 0, dragId);
    reorderItems?.(ids);
    setDragId(null); setDragOverId(null);
  }

  async function handleInlineSave(id: string, data: { term: string; pronunciation: string; meaning: string }) {
    await inlineEditItem?.(id, data);
    setEditingId(null);
  }

  return (
    <div className="card p-3 flex flex-col gap-2 sticky top-8 self-start" style={{ minHeight: 400, maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-sm shrink-0" style={{ color: 'var(--text-base)' }}>
          <FaCirclePlus className="inline mr-1.5" size={12} style={{ color: 'var(--primary)' }} />
          Mục ({items.length})
          {activeLesId && (
            <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              — {lessons.find(l => l.id === activeLesId)?.title}
            </span>
          )}
        </h2>
        {activeLesId && (
          <div className="flex gap-1">
            <button onClick={openImport}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-semibold border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <FaFileArrowUp size={9} /> Import
            </button>
            <button onClick={openItemCreate}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-semibold btn-primary">
              <FaPlus size={9} /> Thêm
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {activeLesId && items.length > 3 && (
        <div className="relative">
          <FaMagnifyingGlass size={10} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input text-xs py-1 pl-6 pr-2 w-full" placeholder="Tìm mục..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {/* Quick add */}
      {activeLesId && quickAddItem && (
        <QuickAddRow onAdd={quickAddItem} />
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto space-y-1.5" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {!activeLesId ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>← Chọn bài học để xem các mục</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Không tìm thấy mục nào' : 'Chưa có mục nào'}
          </div>
        ) : filtered.map(item => (
          editingId === item.id && inlineEditItem ? (
            <InlineEditRow key={item.id} item={item} onSave={handleInlineSave} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={item.id} draggable={!search}
              onDragStart={e => handleDragStart(e, item.id)}
              onDragOver={e => handleDragOver(e, item.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              onDrop={e => handleDrop(e, item.id)}
              className={`group rounded-lg px-2.5 py-2 border transition-all cursor-pointer ${
                dragOverId === item.id ? 'border-yellow-400 bg-yellow-50' : 'hover:border-blue-300'}`}
              style={{ borderColor: dragOverId === item.id ? undefined : 'var(--border)' }}
              onDoubleClick={() => setEditingId(item.id)}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-40 cursor-grab shrink-0 mt-0.5">
                  <FaGripVertical size={8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm" style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--primary)' }}>
                      {item.term}
                    </span>
                    {item.pronunciation && (
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                        ({item.pronunciation})
                      </span>
                    )}
                    <span className="px-1 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {item.type}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-base)' }}>{item.meanings?.[0]?.meaning ?? ''}</div>
                  {item.examples?.[0] && (
                    <div className="text-[11px] mt-0.5 italic" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                      {item.examples[0].exampleText}
                    </div>
                  )}
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {inlineEditItem && (
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(item.id); }} className="p-1 rounded hover:bg-blue-100" title="Sửa nhanh (Double-click)">
                      <FaPencil size={9} style={{ color: 'var(--primary)' }} />
                    </button>
                  )}
                  <button onClick={() => openItemEdit(item)} className="p-1 rounded hover:bg-black/10" title="Sửa đầy đủ">
                    <FaPencil size={9} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-red-100">
                    <FaTrash size={9} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
