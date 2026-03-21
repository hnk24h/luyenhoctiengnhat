import React, { useState, useRef } from 'react';
import { FaListUl, FaPlus, FaMagnifyingGlass, FaTrash, FaLock, FaChevronLeft, FaChevronRight, FaRegEye, FaTimes } from 'react-icons/fa6';
import { FaCog, FaArrowsAlt } from 'react-icons/fa';
import LessonDetailModal from '@/components/admin/learning/Modals/LessonDetailModal';

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
}) {
    // Pagination state
    // Context menu state
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, lesson: null });
    const [lessonDetail, setLessonDetail] = useState(null); // lesson object or null
    const [lessonItems, setLessonItems] = useState([]); // items of lesson
    const menuRef = useRef(null);

    // Hide context menu on click outside
    React.useEffect(() => {
        if (!contextMenu.visible) return;
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setContextMenu({ ...contextMenu, visible: false });
        }
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, [contextMenu]);

    function handleContextMenu(e, lesson) {
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


    function handleSetting() {
        alert('Tính năng Setting cho bài học này sẽ sớm có!');
        setContextMenu({ ...contextMenu, visible: false });
    }

    function handleMove() {
        alert('Tính năng Move (di chuyển) bài học sẽ sớm có!');
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
            {/* Lesson detail modal */}
            {lessonDetail && (
                <LessonDetailModal
                    lesson={lessonDetail}
                    items={lessonItems}
                    onClose={() => setLessonDetail(null)}
                    onEdit={() => alert('Sửa bài học')}
                    onDelete={() => alert('Xóa bài học')}
                    onAddItem={() => alert('Thêm mục mới')}
                    onEditItem={item => alert('Sửa mục: ' + item.term)}
                    onDeleteItem={item => alert('Xóa mục: ' + item.term)}
                />
            )}
            {!activeCatId ? (
                <div className="text-center text-sm text-muted py-8">Chọn chủ đề để xem danh sách bài học.</div>
            ) : (
                <>
                    <div className="flex justify-start mb-2 gap-2">
                        <h2 className="font-bold text-base flex items-center gap-2">
                            <FaListUl className="inline" size={15} style={{ color: 'var(--primary)' }} />
                            <span>Bài học ({lessons.length})</span>
                        </h2>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <input className="input w-64 text-sm py-1.5" placeholder="Tìm bài học..." value={lesSearch} onChange={e => setLesSearch(e.target.value)} />
                                <button onClick={openLesCreate} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
                                    <FaPlus size={10} /> Thêm
                                </button>
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
                                        className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all w-4 h-4 accent-blue-600 hover:shadow-sm"
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
                                    <div className="px-1 py-2 flex items-center justify-center min-w-0 w-8">
                                        <input type="checkbox" />
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
                            {/* Context menu */}
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
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition"
                                        onClick={handleSetting}
                                    >
                                        <FaCog className="text-gray-500" />
                                        Cài đặt
                                    </button>
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition"
                                        onClick={handleMove}
                                    >
                                        <FaArrowsAlt className="text-green-500" />
                                        Di chuyển
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
