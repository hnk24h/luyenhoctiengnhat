import React, { useState, useRef, useCallback } from 'react';
import {
  FaListUl, FaPlus, FaTrash, FaChevronLeft, FaChevronRight,
  FaRegEye, FaPencil, FaGripVertical, FaCircle,
  FaArrowUp, FaArrowDown, FaCheck,
} from 'react-icons/fa6';
import LessonDetailModal from '@/components/admin/learning/Modals/LessonDetailModal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import type { Lesson, ContentStatus } from '@/types/lesson';

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Nháp',        color: '#F59E0B', bg: '#FEF3C7' },
  published: { label: 'Xuất bản',    color: '#10B981', bg: '#D1FAE5' },
  archived:  { label: 'Lưu trữ',    color: '#6B7280', bg: '#F3F4F6' },
};

function StatusBadge({ status, onClick }: { status: string; onClick?: (e: React.MouseEvent) => void }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-all hover:opacity-80"
      style={{ background: cfg.bg, color: cfg.color }}
      title="Nhấn để đổi trạng thái"
    >
      <FaCircle size={5} />
      {cfg.label}
    </button>
  );
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free', basic: 'Basic', premium: 'Pro',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

interface LessonTableProps {
  lessons: Lesson[];
  activeCatId: string | null;
  activeLesId: string | null;
  categories: Category[];
  lesSearch: string;
  setLesSearch: (s: string) => void;
  openLesCreate: () => void;
  openLesEdit?: (les: Lesson) => void;
  setActiveLesId: (id: string) => void;
  loadItems: (lessonId: string) => void;
  deleteLes: (id: string) => void;
  bulkDeleteLes?: (ids: string[]) => void;
  updateLessonStatus?: (id: string, status: ContentStatus) => void;
  bulkUpdateStatus?: (ids: string[], status: ContentStatus) => void;
  reorderLessons?: (orderedIds: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonTable({
  lessons, activeCatId, activeLesId, categories,
  lesSearch, setLesSearch,
  openLesCreate, openLesEdit, setActiveLesId, loadItems,
  deleteLes, bulkDeleteLes,
  updateLessonStatus, bulkUpdateStatus, reorderLessons,
}: LessonTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; lesson: Lesson | null }>({ visible: false, x: 0, y: 0, lesson: null });
  const [lessonDetail, setLessonDetail] = useState<Lesson | null>(null);
  const [lessonItems, setLessonItems] = useState([]);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  React.useEffect(() => { setSelectedIds(new Set()); }, [lessons]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(pagedLessons.map(l => l.id)) : new Set());
  }
  function executeBulkDelete() {
    const ids = Array.from(selectedIds);
    if (bulkDeleteLes) bulkDeleteLes(ids); else ids.forEach(id => deleteLes(id));
    setSelectedIds(new Set()); setConfirmBulkDelete(false);
  }

  // Click-outside for context menu
  React.useEffect(() => {
    if (!contextMenu.visible) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(m => ({ ...m, visible: false })); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [contextMenu.visible]);

  // Click-outside for bulk status
  React.useEffect(() => {
    if (!bulkStatusOpen) return;
    const h = (e: MouseEvent) => { if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setBulkStatusOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [bulkStatusOpen]);

  function handleContextMenu(e: React.MouseEvent, lesson: Lesson) {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, lesson });
  }

  async function handleShowDetail() {
    if (contextMenu.lesson) {
      try {
        const res = await fetch(`/api/learning/lessons/${contextMenu.lesson.id}`);
        if (res.ok) { const data = await res.json(); setLessonItems(data.items ?? []); }
        else setLessonItems([]);
      } catch { setLessonItems([]); }
      setLessonDetail(contextMenu.lesson);
    }
    setContextMenu(m => ({ ...m, visible: false }));
  }

  function cycleStatus(lesId: string, current: string) {
    const order: ContentStatus[] = ['draft', 'published', 'archived'];
    const next = order[(order.indexOf(current as ContentStatus) + 1) % order.length];
    updateLessonStatus?.(lesId, next);
  }

  // Drag-and-drop
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(id);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const ids = lessons.map(l => l.id);
    const from = ids.indexOf(dragId), to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1); ids.splice(to, 0, dragId);
    reorderLessons?.(ids);
    setDragId(null); setDragOverId(null);
  }, [dragId, lessons, reorderLessons]);

  function moveLesson(id: string, dir: 'up' | 'down') {
    const ids = lessons.map(l => l.id);
    const i = ids.indexOf(id);
    if (dir === 'up' && i > 0) { [ids[i], ids[i - 1]] = [ids[i - 1], ids[i]]; }
    else if (dir === 'down' && i < ids.length - 1) { [ids[i], ids[i + 1]] = [ids[i + 1], ids[i]]; }
    else return;
    reorderLessons?.(ids);
  }

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(lessons.length / pageSize));
  const pagedLessons = lessons.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => { setPage(1); }, [lessons]);

  return (
    <div className="card p-3">
      <ConfirmDialog open={confirmBulkDelete} title={`Xoá ${selectedIds.size} bài học?`}
        description="Hành động này không thể hoàn tác." confirmLabel="Xoá tất cả" danger
        onConfirm={executeBulkDelete} onCancel={() => setConfirmBulkDelete(false)} />
      {lessonDetail && (
        <LessonDetailModal lesson={lessonDetail} items={lessonItems}
          onClose={() => setLessonDetail(null)} onEdit={() => {}} onDelete={() => {}}
          onAddItem={() => {}} onEditItem={() => {}} onDeleteItem={() => {}} />
      )}

      {!activeCatId ? (
        <div className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Chọn chủ đề để xem danh sách bài học.</div>
      ) : (
        <>
          {/* ── Toolbar ── */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="font-bold text-sm flex items-center gap-1.5 shrink-0">
              <FaListUl size={13} style={{ color: 'var(--primary)' }} />
              Bài học ({lessons.length})
            </h2>
            <input className="input text-xs py-1 px-2 w-40" placeholder="Tìm bài học..."
              value={lesSearch} onChange={e => setLesSearch(e.target.value)} />
            <button onClick={openLesCreate} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold btn-primary">
              <FaPlus size={9} /> Thêm
            </button>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1 ml-auto relative" ref={bulkRef}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{selectedIds.size} chọn</span>
                <button onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                  className="text-xs px-2 py-1 rounded-lg font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Trạng thái ▾
                </button>
                {bulkStatusOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[130px]">
                    {(['draft', 'published', 'archived'] as ContentStatus[]).map(s => (
                      <button key={s} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-blue-50"
                        onClick={() => { bulkUpdateStatus?.(Array.from(selectedIds), s); setBulkStatusOpen(false); setSelectedIds(new Set()); }}>
                        <FaCircle size={5} style={{ color: STATUS_CONFIG[s].color }} /> {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setConfirmBulkDelete(true)} className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <FaTrash size={9} />
                </button>
              </div>
            )}

            {lessons.length > pageSize && (
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-0.5 rounded border bg-white disabled:opacity-40"><FaChevronLeft size={12} /></button>
                <span className="text-xs tabular-nums">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-0.5 rounded border bg-white disabled:opacity-40"><FaChevronRight size={12} /></button>
              </div>
            )}
          </div>

          {/* ── Compact table ── */}
          <div className="overflow-x-auto text-xs">
            <div className="grid grid-cols-[28px_20px_1.5fr_68px_50px_40px_60px] bg-gray-50/80 rounded-t-lg border-b font-semibold" style={{ color: 'var(--text-muted)' }}>
              <div className="px-1 py-1.5 flex items-center justify-center">
                <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600"
                  checked={pagedLessons.length > 0 && pagedLessons.every(l => selectedIds.has(l.id))}
                  onChange={e => toggleSelectAll(e.target.checked)} />
              </div>
              <div className="py-1.5" />
              <div className="px-1 py-1.5">Tên bài học</div>
              <div className="px-1 py-1.5 text-center">Trạng thái</div>
              <div className="px-1 py-1.5 text-center">Gói</div>
              <div className="px-1 py-1.5 text-center">Mục</div>
              <div className="px-1 py-1.5 text-center">⚙</div>
            </div>

            {lessons.length === 0 ? (
              <div className="py-6 text-center border-b rounded-b-lg" style={{ color: 'var(--text-muted)' }}>Chưa có bài học nào</div>
            ) : pagedLessons.map(les => (
              <div key={les.id} draggable
                onDragStart={e => handleDragStart(e, les.id)}
                onDragOver={e => handleDragOver(e, les.id)}
                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                onDrop={e => handleDrop(e, les.id)}
                className={`group grid grid-cols-[28px_20px_1.5fr_68px_50px_40px_60px] items-center border-b transition-all cursor-pointer ${
                  activeLesId === les.id ? 'bg-blue-50 border-l-2 border-l-blue-500' :
                  dragOverId === les.id ? 'bg-yellow-50 border-l-2 border-l-yellow-400' :
                  selectedIds.has(les.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                onClick={() => { setActiveLesId(les.id); loadItems(les.id); }}
                onContextMenu={e => handleContextMenu(e, les)}
              >
                <div className="px-1 py-1.5 flex items-center justify-center" onClick={e => { e.stopPropagation(); toggleSelect(les.id); }}>
                  <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" checked={selectedIds.has(les.id)} onChange={() => toggleSelect(les.id)} />
                </div>
                <div className="py-1.5 flex items-center justify-center opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing"
                  onMouseDown={e => e.stopPropagation()}>
                  <FaGripVertical size={9} />
                </div>
                <div className="px-1 py-1.5 min-w-0 flex items-center gap-1.5">
                  <span className="truncate font-medium" style={{ color: activeLesId === les.id ? 'var(--primary)' : 'var(--text-base)' }}>{les.title}</span>
                  <span className="shrink-0 px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{les.type}</span>
                </div>
                <div className="px-1 py-1.5 text-center" onClick={e => e.stopPropagation()}>
                  <StatusBadge status={les.status ?? 'draft'} onClick={(e) => { e.stopPropagation(); cycleStatus(les.id, les.status ?? 'draft'); }} />
                </div>
                <div className="px-1 py-1.5 text-center">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{TIER_LABELS[les.requiredTier ?? 'free']}</span>
                </div>
                <div className="px-1 py-1.5 text-center tabular-nums" style={{ color: 'var(--text-muted)' }}>{les._count.items}</div>
                <div className="px-1 py-1.5 flex items-center justify-center gap-0.5" onClick={e => e.stopPropagation()}>
                  {openLesEdit && <button onClick={() => openLesEdit(les)} className="p-1 rounded hover:bg-blue-100" title="Sửa"><FaPencil size={9} style={{ color: 'var(--primary)' }} /></button>}
                  <button onClick={() => moveLesson(les.id, 'up')} className="p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-60" title="Lên"><FaArrowUp size={8} /></button>
                  <button onClick={() => moveLesson(les.id, 'down')} className="p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-60" title="Xuống"><FaArrowDown size={8} /></button>
                  <button onClick={() => deleteLes(les.id)} className="p-1 rounded hover:bg-red-100" title="Xóa"><FaTrash size={9} style={{ color: '#EF4444' }} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Context menu */}
          {contextMenu.visible && (
            <div ref={menuRef} style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 50, minWidth: 150 }}
              className="bg-white border rounded-lg shadow-lg py-1 text-xs">
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50" onClick={handleShowDetail}>
                <FaRegEye className="text-blue-500" size={10} /> Xem chi tiết
              </button>
              {openLesEdit && contextMenu.lesson && (
                <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50"
                  onClick={() => { if (contextMenu.lesson) openLesEdit(contextMenu.lesson); setContextMenu(m => ({ ...m, visible: false })); }}>
                  <FaPencil size={9} style={{ color: 'var(--primary)' }} /> Sửa
                </button>
              )}
              <hr className="my-1" />
              {(['draft', 'published', 'archived'] as ContentStatus[]).map(s => (
                <button key={s} className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50"
                  onClick={() => { if (contextMenu.lesson) updateLessonStatus?.(contextMenu.lesson.id, s); setContextMenu(m => ({ ...m, visible: false })); }}>
                  <FaCircle size={5} style={{ color: STATUS_CONFIG[s].color }} /> {STATUS_CONFIG[s].label}
                  {contextMenu.lesson?.status === s && <FaCheck size={8} className="ml-auto text-green-500" />}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
