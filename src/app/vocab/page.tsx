'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaBookmark, FaTrash, FaPlus, FaArrowLeft, FaLayerGroup,
  FaMagnifyingGlass, FaXmark, FaCheck, FaFolder, FaCircleXmark,
  FaEllipsisVertical, FaPen, FaSliders,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColInfo { id: string; name: string; color: string; }

interface Word {
  id:          string;
  japanese:    string;
  reading:     string | null;
  meaning:     string;
  context:     string | null;
  createdAt:   string;
  collections: ColInfo[];
}

interface Collection {
  id:        string;
  name:      string;
  color:     string;
  wordCount: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  '#4F46E5','#0EA5E9','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1',
];

// ─── CollectionSidebar ────────────────────────────────────────────────────────

function CollectionSidebar({
  collections, activeId, totalCount,
  onSelect, onCreate, onRename, onDelete,
}: {
  collections:  Collection[];
  activeId:     string | null;
  totalCount:   number;
  onSelect:     (id: string | null) => void;
  onCreate:     (name: string, color: string) => void;
  onRename:     (id: string, name: string) => void;
  onDelete:     (id: string) => void;
}) {
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newColor,   setNewColor]   = useState(PALETTE[0]);
  const [menuId,     setMenuId]     = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal,  setRenameVal]  = useState('');

  function submitCreate() {
    if (!newName.trim()) return;
    onCreate(newName.trim(), newColor);
    setNewName(''); setNewColor(PALETTE[0]); setCreating(false);
  }

  function startRename(col: Collection) {
    setRenamingId(col.id); setRenameVal(col.name); setMenuId(null);
  }

  function submitRename(id: string) {
    if (renameVal.trim()) onRename(id, renameVal.trim());
    setRenamingId(null);
  }

  return (
    <aside className="flex flex-col gap-1">
      {/* All words */}
      <button
        onClick={() => onSelect(null)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all w-full text-left"
        style={activeId === null
          ? { background: 'var(--primary)', color: 'white' }
          : { background: 'transparent', color: 'var(--text-base)' }}>
        <FaBookmark size={12} />
        <span className="flex-1">Tất cả từ</span>
        <span className="text-xs opacity-60">{totalCount}</span>
      </button>

      <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

      {/* Collection list */}
      {collections.map(col => (
        <div key={col.id} className="relative group">
          {renamingId === col.id ? (
            <div className="flex items-center gap-1 px-2">
              <input
                autoFocus value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitRename(col.id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                onBlur={() => submitRename(col.id)}
                className="flex-1 text-sm px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor: col.color, color: 'var(--text-base)', background: 'white' }}
              />
            </div>
          ) : (
            <button onClick={() => onSelect(col.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all w-full text-left"
              style={activeId === col.id
                ? { background: `${col.color}22`, color: col.color, fontWeight: 700 }
                : { color: 'var(--text-base)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.color }} />
              <span className="flex-1 truncate">{col.name}</span>
              <span className="text-xs opacity-50">{col.wordCount}</span>
              <span role="button"
                onClick={e => { e.stopPropagation(); setMenuId(menuId === col.id ? null : col.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity">
                <FaEllipsisVertical size={10} />
              </span>
            </button>
          )}
          {menuId === col.id && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-lg border py-1"
              style={{ background: 'white', borderColor: 'var(--border)', minWidth: 130 }}>
              <button onClick={() => startRename(col)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-gray-50 text-left">
                <FaPen size={10} /> Đổi tên
              </button>
              <button onClick={() => { onDelete(col.id); setMenuId(null); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs w-full hover:bg-red-50 text-left"
                style={{ color: '#EF4444' }}>
                <FaTrash size={10} /> Xóa chủ đề
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Create new */}
      {creating ? (
        <div className="mt-1 p-2 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Tên chủ đề..." className="w-full text-sm px-2 py-1 rounded-lg border outline-none mb-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text-base)', background: 'white' }} />
          <div className="flex flex-wrap gap-1 mb-2">
            {PALETTE.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                  transform: newColor === c ? 'scale(1.25)' : 'scale(1)' }} />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={submitCreate} className="flex-1 text-xs py-1 rounded-lg font-semibold"
              style={{ background: newColor, color: 'white' }}>Tạo</button>
            <button onClick={() => setCreating(false)} className="px-2 text-xs py-1 rounded-lg"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>Huỷ</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all w-full text-left mt-1"
          style={{ color: 'var(--text-muted)' }}>
          <FaPlus size={11} /> Tạo chủ đề mới
        </button>
      )}

      {menuId && <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />}
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VocabPage() {
  const { status } = useSession();
  const router = useRouter();

  const [words,        setWords]        = useState<Word[]>([]);
  const [collections,  setCollections]  = useState<Collection[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [activeColId,  setActiveColId]  = useState<string | null>(null);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [exporting,    setExporting]    = useState(false);
  const [exportDone,   setExportDone]   = useState(false);
  const [sheetOpen,    setSheetOpen]    = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const loadAll = useCallback(async () => {
    const [wRes, cRes] = await Promise.all([
      fetch('/api/words'),
      fetch('/api/collections'),
    ]);
    if (wRes.ok) setWords(await wRes.json());
    if (cRes.ok) setCollections(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadAll();
  }, [status, loadAll]);

  // ── Collection CRUD ──────────────────────────────────────────────────────────

  async function createCollection(name: string, color: string) {
    const res = await fetch('/api/collections', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const col: Collection = await res.json();
      setCollections(prev => [...prev, col]);
    }
  }

  async function renameCollection(id: string, name: string) {
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }

  async function deleteCollection(id: string) {
    if (!confirm('Xóa chủ đề này? Các từ trong đó sẽ không bị xóa.')) return;
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id));
      setWords(prev => prev.map(w => ({ ...w, collections: w.collections.filter(c => c.id !== id) })));
      if (activeColId === id) setActiveColId(null);
    }
  }

  // ── Remove word from a collection ────────────────────────────────────────────

  async function removeFromCollection(wordId: string, colId: string) {
    await fetch(`/api/collections/${colId}/words`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId }),
    });
    setWords(prev => prev.map(w =>
      w.id === wordId ? { ...w, collections: w.collections.filter(c => c.id !== colId) } : w
    ));
    setCollections(prev => prev.map(c =>
      c.id === colId ? { ...c, wordCount: Math.max(0, c.wordCount - 1) } : c
    ));
  }

  // ── Delete word ───────────────────────────────────────────────────────────────

  async function deleteWord(id: string) {
    if (!confirm('Xóa từ này?')) return;
    await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => w.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  async function deleteSelected() {
    if (!confirm(`Xóa ${selected.size} từ đã chọn?`)) return;
    for (const id of selected) await fetch(`/api/words/${id}`, { method: 'DELETE' });
    setWords(prev => prev.filter(w => !selected.has(w.id)));
    setSelected(new Set());
  }

  // ── Flashcard export ──────────────────────────────────────────────────────────

  async function exportToFlashcards() {
    const toExport = filtered.filter(w => selected.size === 0 || selected.has(w.id));
    if (!toExport.length) return;
    setExporting(true);
    const deckRes = await fetch('/api/flashcards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Từ vựng${activeColId ? ` - ${collections.find(c => c.id === activeColId)?.name}` : ''} (${new Date().toLocaleDateString('vi-VN')})`,
        description: `${toExport.length} từ từ bộ sưu tập`, color: '#7C3AED',
      }),
    });
    if (!deckRes.ok) { setExporting(false); return; }
    const deck = await deckRes.json();
    await fetch(`/api/flashcards/${deck.id}/import`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: toExport.map(w => ({ front: w.japanese, back: w.meaning, reading: w.reading || undefined, example: w.context || undefined })) }),
    });
    setExporting(false); setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  // ── Filtering ─────────────────────────────────────────────────────────────────

  const filtered = words.filter(w => {
    if (activeColId && !w.collections.some(c => c.id === activeColId)) return false;
    if (search && !w.japanese.includes(search) && !w.reading?.includes(search) &&
        !w.meaning.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(w => selected.has(w.id));
  function toggleAll() {
    if (allSelected) setSelected(prev => { const s = new Set(prev); filtered.forEach(w => s.delete(w.id)); return s; });
    else setSelected(prev => new Set([...prev, ...filtered.map(w => w.id)]));
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  const activeCol = collections.find(c => c.id === activeColId) ?? null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">

      {/* Back */}
      <Link href="/reading" className="inline-flex items-center gap-1.5 text-sm mb-5 btn-ghost"
        style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={11} /> Bài đọc
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>
            BỘ SƯU TẬP TỪ VỰNG
          </div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-base)' }}>
            {activeCol
              ? <><span className="w-4 h-4 rounded-full inline-block shrink-0" style={{ background: activeCol.color }} /> {activeCol.name}</>
              : <><FaBookmark size={16} style={{ color: 'var(--primary)' }} /> Tất cả từ</>}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} từ{activeCol ? ` trong "${activeCol.name}"` : ''}
          </p>
        </div>
        <button onClick={exportToFlashcards} disabled={exporting}
          className="btn-primary flex items-center gap-2 text-sm shrink-0" style={{ background: '#7C3AED' }}>
          {exportDone
            ? <><FaCheck size={12} /> Đã tạo!</>
            : exporting
              ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang tạo...</>
              : <><FaLayerGroup size={12} />
                  <span className="hidden sm:inline">Tạo </span>Flashcard{selected.size > 0 ? ` (${selected.size})` : ''}
                </>}
        </button>
      </div>

      {/* ── Mobile: horizontal collection chips ── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto flex gap-2 pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveColId(null)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={activeColId === null
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FaBookmark size={9} /> Tất cả <span className="opacity-60">({words.length})</span>
            </button>
            {collections.map(col => (
              <button key={col.id}
                onClick={() => setActiveColId(col.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={activeColId === col.id
                  ? { background: col.color, color: 'white' }
                  : { background: `${col.color}22`, color: col.color }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {col.name} <span className="opacity-60">({col.wordCount})</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'white' }}>
            <FaSliders size={11} />
          </button>
        </div>
      </div>

      {/* ── Mobile: bottom sheet for collection management ── */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative rounded-t-2xl overflow-y-auto p-4"
            style={{ background: 'var(--bg-base)', maxHeight: '72vh', zIndex: 51 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-base)' }}>Quản lý chủ đề</h3>
              <button onClick={() => setSheetOpen(false)} className="btn-ghost p-1.5">
                <FaXmark size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <CollectionSidebar
              collections={collections}
              activeId={activeColId}
              totalCount={words.length}
              onSelect={id => { setActiveColId(id); setSheetOpen(false); }}
              onCreate={createCollection}
              onRename={renameCollection}
              onDelete={deleteCollection}
            />
          </div>
        </div>
      )}

      {/* ── Desktop 2-col layout ── */}
      <div className="flex gap-6 items-start">

        {/* ─ Sidebar (desktop only) ─ */}
        <div className="hidden md:block w-52 shrink-0">
          <CollectionSidebar
            collections={collections}
            activeId={activeColId}
            totalCount={words.length}
            onSelect={setActiveColId}
            onCreate={createCollection}
            onRename={renameCollection}
            onDelete={deleteCollection}
          />
        </div>

        {/* ─ Main ─ */}
        <div className="flex-1 min-w-0">

          {/* Search + bulk delete */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-44">
              <input className="input w-full pl-8" placeholder="Tìm từ..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5">
                  <FaXmark size={11} />
                </button>
              )}
            </div>
            {selected.size > 0 && (
              <button onClick={deleteSelected} className="btn-secondary flex items-center gap-1.5 text-sm"
                style={{ color: '#EF4444' }}>
                <FaTrash size={11} /> Xóa {selected.size}
              </button>
            )}
          </div>

          {/* Column header */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1 text-xs font-semibold"
              style={{ color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded" />
              <span className="w-24">Từ</span>
              <span className="hidden sm:block w-24">Cách đọc</span>
              <span className="flex-1">Nghĩa / Chủ đề</span>
            </div>
          )}

          {/* Word list */}
          {filtered.length === 0 ? (
            <div className="card text-center py-14">
              <div className="text-5xl mb-3 opacity-30">📚</div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                {search ? 'Không tìm thấy từ nào' : activeColId ? 'Chủ đề này chưa có từ nào' : 'Chưa có từ nào được lưu'}
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                {search ? 'Thử từ khóa khác' : 'Đọc bài và click vào từ để lưu'}
              </p>
              {!search && !activeColId && (
                <Link href="/reading" className="btn-primary inline-flex items-center gap-2">
                  <FaBookmark size={12} /> Đi đọc bài
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(w => (
                <div key={w.id}
                  className="card group flex items-start gap-3"
                  style={{ borderLeft: `3px solid ${selected.has(w.id) ? 'var(--primary)' : 'var(--border)'}` }}>
                  <input type="checkbox" checked={selected.has(w.id)}
                    onChange={e => setSelected(prev => {
                      const s = new Set(prev);
                      e.target.checked ? s.add(w.id) : s.delete(w.id);
                      return s;
                    })}
                    className="w-3.5 h-3.5 rounded mt-1 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base"
                        style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--primary)' }}>
                        {w.japanese}
                      </span>
                      {w.reading && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                          ({w.reading})
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--text-base)' }}>{w.meaning}</div>
                    {w.context && (
                      <div className="text-xs mt-1.5 italic px-2 py-1.5 rounded"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontFamily: '"Noto Sans JP", serif', lineHeight: 1.7 }}>
                        {w.context}
                      </div>
                    )}
                    {/* Collection chips */}
                    {w.collections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {w.collections.map(col => (
                          <span key={col.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: `${col.color}22`, color: col.color }}>
                            <FaFolder size={9} /> {col.name}
                            {activeColId === col.id && (
                              <button onClick={() => removeFromCollection(w.id, col.id)}
                                className="ml-0.5 hover:opacity-70 transition-opacity">
                                <FaCircleXmark size={10} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <button onClick={() => deleteWord(w.id)}
                    className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                    style={{ color: '#EF4444' }}>
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
