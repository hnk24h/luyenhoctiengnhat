import React, { useState, useRef } from 'react';
import { FaListUl, FaPlus, FaTrash, FaChevronLeft, FaChevronRight, FaRegEye } from 'react-icons/fa6';
import LessonDetailModal from '@/components/admin/learning/Modals/LessonDetailModal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';

import type { Lesson } from '@/types/lesson';

interface Category {
    id: string; levelId: string; skill: string; name: string;
    description: string | null; icon: string | null; order: number;
    level: { code: string; name: string };
    _count: { lessons: number };
}
interface LessonTableProps {
    lessons: Lesson[];
    activeCatId: string | null;
    categories: Category[];
    lesSearch: string;
    setLesSearch: (s: string) => void;
    openLesCreate: () => void;
    setActiveLesId: (id: string) => void;
    loadItems: (lessonId: string) => void;
    deleteLes: (id: string) => void;
    bulkDeleteLes?: (ids: string[]) => void;
}

export default function LessonTable({
        lessons,
        activeCatId,
        categories,
        lesSearch,
        setLesSearch,
        openLesCreate,
        setActiveLesId,
        loadItems,
        deleteLes,
        bulkDeleteLes,
}: LessonTableProps) {
    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    // Context menu state
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; lesson: Lesson | null }>({ visible: false, x: 0, y: 0, lesson: null });
    const [lessonDetail, setLessonDetail] = useState<Lesson | null>(null);
    const [lessonItems, setLessonItems] = useState([]);
    const menuRef = useRef<HTMLDivElement>(null);

    // Reset selection when lessons list changes
    React.useEffect(() => { setSelectedIds(new Set()); }, [lessons]);

    function toggleSelect(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSelectAll(checked: boolean) {
        setSelectedIds(checked ? new Set(pagedLessons.map(l => l.id)) : new Set());
    }

    function handleBulkDelete() {
        if (selectedIds.size === 0) return;
        setConfirmBulkDelete(true);
    }

    function executeBulkDelete() {
        const ids = Array.from(selectedIds);
        if (bulkDeleteLes) bulkDeleteLes(ids);
        else ids.forEach(id => deleteLes(id));
        setSelectedIds(new Set());
        setConfirmBulkDelete(false);
    }

    // Hide context menu on click outside
    React.useEffect(() => {
        if (!contextMenu.visible) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu({ ...contextMenu, visible: false });
        }
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, [contextMenu]);

    function handleContextMenu(e: React.MouseEvent, lesson: Lesson) {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, lesson });
    }

    async function handleShowDetail() {
        if (contextMenu.lesson) {
            try {
                const res = await fetch(`/api/learning/lessons/${contextMenu.lesson.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setLessonItems(data.items ?? []);
                } else {
                    setLessonItems([]);
                }
            } catch {
                setLessonItems([]);
            }
            setLessonDetail(contextMenu.lesson);
        }
        setContextMenu({ ...contextMenu, visible: false });
    }

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(lessons.length / pageSize));
    const pagedLessons = lessons.slice((page - 1) * pageSize, page * pageSize);

    const handlePrev = () => setPage(p => Math.max(1, p - 1));
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

    // Reset to page 1 if lessons change
    React.useEffect(() => { setPage(1); }, [lessons]);

    return (
        <div className="card p-4 mt-4">
            {/* Confirm bulk delete */}
            <ConfirmDialog
                open={confirmBulkDelete}
                title={`Xoá ${selectedIds.size} bài học?`}
                description="Hành động này không thể hoàn tác. Tất cả mục học trong các bài học này cũng sẽ bị xoá."
                confirmLabel="Xoá tất cả"
                danger
                onConfirm={executeBulkDelete}
                onCancel={() => setConfirmBulkDelete(false)}
            />

            {/* Lesson detail modal */}
            {lessonDetail && (
                <LessonDetailModal
                    lesson={lessonDetail}
                    items={lessonItems}
                    onClose={() => setLessonDetail(null)}
                    onEdit={() => alert('Sửa bài học')}
                    onDelete={() => alert('Xóa bài học')}
                    onAddItem={() => alert('Thêm mục mới')}
                    onEditItem={(item: any) => alert('Sửa mục: ' + item.term)}
                    onDeleteItem={(item: any) => alert('Xóa mục: ' + item.term)}
                />
            )}
            {!activeCatId ? (
                <div className="text-center text-sm text-muted py-8">Chọn chủ đề để xem danh sách bài học.</div>
            ) : (
                <>
                    <div className="flex justify-start mb-2 gap-2 flex-wrap">
                        <h2 className="font-bold text-base flex items-center gap-2">
                            <FaListUl className="inline" size={15} style={{ color: 'var(--primary)' }} />
                            <span>Bài học ({lessons.length})</span>
                        </h2>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <input className="input w-64 text-sm py-1.5" placeholder="Tìm bài học..." value={lesSearch} onChange={e => setLesSearch(e.target.value)} />
                                <button onClick={openLesCreate} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
                                    <FaPlus size={10} /> Thêm
                                </button>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold"
                                        style={{ background: '#fee2e2', color: '#dc2626' }}>
                                        <FaTrash size={10} /> Xoá {selectedIds.size} mục đã chọn
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Pagination controls */}
                        {lessons.length > pageSize && (
                            <div className="flex justify-center items-center gap-2 py-3">
                                <button onClick={handlePrev} disabled={page === 1} className="p-1 rounded border bg-white disabled:opacity-50 flex items-center justify-center">
                                    <FaChevronLeft size={16} />
                                </button>
                                <span className="text-sm">{page} / {totalPages}</span>
                                <button onClick={handleNext} disabled={page === totalPages} className="p-1 rounded border bg-white disabled:opacity-50 flex items-center justify-center">
                                    <FaChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-full text-sm">
                            {/* Header row */}
                            <div className="sticky top-0 z-10 grid grid-cols-[32px_48px_1.5fr_0.8fr_0.8fr_1.2fr_0.7fr_0.8fr] bg-gray-50 rounded-t-xl border-b">
                                <div className="px-1 py-2 flex items-center justify-center min-w-0 w-8">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all w-4 h-4 accent-blue-600"
                                        checked={pagedLessons.length > 0 && pagedLessons.every(l => selectedIds.has(l.id))}
                                        onChange={e => toggleSelectAll(e.target.checked)}
                                    />
                                </div>
                                <div className="px-1 py-2 font-semibold min-w-0 w-12 text-center">Thứ tự</div>
                                <div className="px-1 py-2 font-semibold">Tên bài học</div>
                                <div className="px-1 py-2 font-semibold">Loại</div>
                                <div className="px-1 py-2 font-semibold">Gói</div>
                                <div className="px-1 py-2 font-semibold">Mô tả</div>
                                <div className="px-1 py-2 font-semibold text-center">Số mục</div>
                                <div className="px-1 py-2 font-semibold text-center">Hành động</div>
                            </div>
                            {/* Data rows */}
                            {lessons.length === 0 ? (
                                <div className="py-6 text-center text-muted border-b rounded-b-xl">Chưa có bài học nào</div>
                            ) : pagedLessons.map(les => (
                                <div
                                    key={les.id}
                                    className="group grid grid-cols-[32px_48px_1.5fr_0.8fr_0.8fr_1.2fr_0.7fr_0.8fr] items-center border-b hover:bg-blue-50 transition rounded cursor-pointer"
                                    style={selectedIds.has(les.id) ? { background: '#eff6ff' } : {}}
                                    onContextMenu={e => handleContextMenu(e, les)}
                                    onDoubleClick={async () => {
                                        try {
                                            const res = await fetch(`/api/learning/lessons/${les.id}`);
                                            if (res.ok) {
                                                const data = await res.json();
                                                setLessonItems(data.items ?? []);
                                            } else {
                                                setLessonItems([]);
                                            }
                                        } catch {
                                            setLessonItems([]);
                                        }
                                        setLessonDetail(les);
                                    }}
                                >
                                    <div className="px-1 py-2 flex items-center justify-center min-w-0 w-8" onClick={e => { e.stopPropagation(); toggleSelect(les.id); }}>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-blue-600"
                                            checked={selectedIds.has(les.id)}
                                            onChange={() => toggleSelect(les.id)}
                                        />
                                    </div>
                                    <div className="px-1 py-2 text-center min-w-0 w-12">
                                        <span>{les.order}</span>
                                    </div>
                                    <div className="px-1 py-2 min-w-[120px]">
                                        <span>{les.title}</span>
                                    </div>
                                    <div className="px-1 py-2 min-w-[80px]">
                                        <span>{les.type}</span>
                                    </div>
                                    <div className="px-1 py-2 min-w-[80px]">
                                        <span>{les.requiredTier === 'basic' ? 'Cơ bản' : les.requiredTier === 'premium' ? 'Nâng cao' : 'Miễn phí'}</span>
                                    </div>
                                    <div className="px-1 py-2 min-w-[120px]">
                                        <span>{les.description}</span>
                                    </div>
                                    <div className="px-1 py-2 text-center min-w-[60px]">
                                        {les._count.items}
                                    </div>
                                    <div className="px-1 py-2 flex items-center justify-center">
                                        <button onClick={e => { e.stopPropagation(); deleteLes(les.id); }}
                                            className="p-1 rounded hover:bg-red-100">
                                            <FaTrash size={10} style={{ color: '#EF4444' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Context menu — only "Xem chi tiết" */}
                            {contextMenu.visible && (
                                <div
                                    ref={menuRef}
                                    style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 50, minWidth: 180 }}
                                    className="bg-white border rounded-lg shadow-lg py-1 animate-fade-in"
                                >
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition"
                                        onClick={handleShowDetail}
                                    >
                                        <FaRegEye className="text-blue-500" />
                                        Xem chi tiết
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
