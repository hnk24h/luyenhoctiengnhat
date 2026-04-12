import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaPlus, FaClone } from 'react-icons/fa';
import { AdminModal, AdminButton, AdminSearchInput, AdminFormField, AdminEmptyState, ConfirmDialog } from '@/components/admin/ui';

// Schema: Lesson gồm các trường: id, title, description, type, requiredTier, _count.items
// CRUD: Sửa, Xóa, Thêm mục con (item), Search, Pagination

import type { Lesson, LearningItem, ContentMeaning, ContentExample } from '@/types/lesson';

interface LessonDetailModalProps {
  lesson: Lesson;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  items?: LearningItem[];
  onAddItem: (item: AddEditData) => void;
  onEditItem: (item: LearningItem | null) => void;
  onDeleteItem: (item: LearningItem) => void;
}

interface AddEditData {
  term: string;
  pronunciation: string;
  meanings: string;
  type: string;
}

export default function LessonDetailModal({ lesson, onClose, onEdit, onDelete, items = [], onAddItem, onEditItem, onDeleteItem }: LessonDetailModalProps) {
  const [addingRow, setAddingRow] = useState(false);
  const [addData, setAddData] = useState<AddEditData>({ term: '', pronunciation: '', meanings: '', type: '' });
  // Clone row logic
  const handleCloneRow = (item: LearningItem) => {
    setAddingRow(true);
    setAddData({
      term: item.term || '',
      pronunciation: item.pronunciation || '',
      meanings: item.meanings?.map(m => m.meaning).join(', ') || '',
      type: item.type || '',
    });
    setEditingId(null);
  };

  const handleAddRow = () => {
    setAddingRow(true);
    setAddData({ term: '', pronunciation: '', meanings: '', type: '' });
    setEditingId(null); // Không cho edit row khác khi đang add
  };

  const handleAddChange = (field: keyof AddEditData, value: string) => {
    setAddData(prev => ({ ...prev, [field]: value }));
  };
  // Lấy lại dữ liệu mới nhất từ API
  const getLatestLesson = async () => {
    const getRes = await fetch(`/api/learning/lessons/${lesson.id}`);
    if (!getRes.ok) throw new Error('Không lấy được dữ liệu mới');
    return await getRes.json();
  };

  const handleAddSave = async () => {
    console.log(addData);
    // Validate bắt buộc
    if (!addData.type || !addData.term || !addData.pronunciation) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Loại, Nghĩa');
      return;
    }
    const newItem: AddEditData = {
      term: addData.term,
      pronunciation: addData.pronunciation,
      meanings: addData.meanings,
      type: addData.type,
    };
    onAddItem(newItem);
    setAddingRow(false);
    setAddData({ term: '', pronunciation: '', meanings: '', type: '' });
    
    const newLesson = {
      ...lesson,
      ...newItem,
    };
    try {
      const res = await fetch(`/api/learning/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      onEdit();
      setEditingHeader(false);
      setHeaderData({ term: '', type: '', requiredTier: '', meaning: '' });
    } catch (err) {
      alert('Lưu thất bại');
    }
  };

  const handleAddCancel = () => {
    setAddingRow(false);
    setAddData({ term: '', pronunciation: '', meanings: '', type: '' });
  };
  const [editingHeader, setEditingHeader] = useState(false);
  interface HeaderData {
    term: string;
    type: string;
    requiredTier: string;
    meaning: string;
  }
  const [headerData, setHeaderData] = useState<HeaderData>({
    term: '',
    type: '',
    requiredTier: '',
    meaning: '',
  });

  const handleHeaderEditClick = async () => {
    const latestLesson = await getLatestLesson();
    setEditingHeader(true);
    setHeaderData({
      term: latestLesson.term || lesson.title || '',
      type: latestLesson.type || lesson.type || '',
      requiredTier: latestLesson.requiredTier || lesson.requiredTier || '',
      meaning: latestLesson.meaning || lesson.description || '',
    });
  };

  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeaderSave = async () => {
    console.log(headerData);
    // Validate bắt buộc
    if (!headerData.type || !headerData.term || !headerData.meaning) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Loại, Nghĩa');
      return;
    }
    const newLesson = {
      ...lesson,
      type: headerData.type,
      requiredTier: headerData.requiredTier,
      term: headerData.term,
      meaning: headerData.meaning,
    };
    try {
      const res = await fetch(`/api/learning/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      const latestLesson = await getLatestLesson();
      const data = await latestLesson.json();
      items = data.items.map((item: any) => ({ ...item })); // Cập nhật lại items nếu cần
      onEdit();
      setEditingHeader(false);
      setHeaderData({ term: '', type: '', requiredTier: '', meaning: '' });
    } catch (err) {
      alert('Lưu thất bại');
    }
  };
  // Xóa item khỏi DB và reload lại danh sách
  const [deleteTarget, setDeleteTarget] = useState<LearningItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteItem = async (item: LearningItem) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/learning/items/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      // Sau khi xóa, reload lại danh sách items mới nhất
      const lessonId = lesson.id;
      const getRes = await fetch(`/api/learning/lessons/${lessonId}`);
      if (getRes.ok) {
        const data = await getRes.json();
        if (typeof onEditItem === 'function') onEditItem(null); // clear edit state nếu có
        if (typeof onDeleteItem === 'function') onDeleteItem(item); // callback nếu cha cần
        if (Array.isArray(data.items)) {
          // Nếu có prop setItems thì gọi, còn không thì reload lại trang cha
          if (typeof window !== 'undefined') {
            // Nếu có thể, trigger reload UI bằng cách gọi sự kiện hoặc callback
            // (ở đây chỉ cập nhật state nếu có prop setItems, nếu không thì reload toàn trang)
          }
        }
      }
    } catch (err) {
      alert('Xóa mục thất bại!');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleHeaderCancel = () => {
    setEditingHeader(false);
    setHeaderData({ term: '', type: '', requiredTier: '', meaning: '' });
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<AddEditData>({ term: '', pronunciation: '', meanings: '', type: '' });

  const handleEditClick = (item: LearningItem) => {
    setEditingId(item.id);
    setEditData({
      term: item.term || '',
      pronunciation: item.pronunciation || '',
      meanings: item.meanings?.map((m: ContentMeaning) => m.meaning).join(', ') || '',
      type: item.type || '',
    });
  };

  const handleEditChange = (field: keyof AddEditData, value: string) => {
    setEditData((prev: AddEditData) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = (item: LearningItem) => {
    const newItem: LearningItem = {
      ...item,
      term: editData.term,
      pronunciation: editData.pronunciation,
      meanings: editData.meanings.split(',').map((m: string) => ({ meaning: m.trim(), id: '', language: '' })).filter((m: { meaning: string }) => m.meaning),
      type: editData.type,
      // giữ lại các trường khác của item
      examples: item.examples,
      audioUrl: item.audioUrl,
      imageUrl: item.imageUrl,
      order: item.order,
      lessonId: item.lessonId,
      language: item.language,
      id: item.id,
    };
    onEditItem(newItem);
    setEditingId(null);
    setEditData({ term: '', pronunciation: '', meanings: '', type: '' });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({ term: '', pronunciation: '', meanings: '', type: '' });
  };
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredItems = useMemo(() =>
    items.filter((item: LearningItem) =>
      item.term?.toLowerCase().includes(search.toLowerCase()) ||
      item.meanings?.some((m: ContentMeaning) => m.meaning?.toLowerCase().includes(search.toLowerCase()))
    ), [items, search]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  React.useEffect(() => { setPage(1); }, [search, items]);
  return (
    <AdminModal open onClose={onClose} title="Chi tiết bài học" size="xl">
        <div className="card mb-2">
          <div className="flex items-center justify-end mb-2">
            <div className="flex gap-2">
              {editingHeader ? (
                <>
                  <AdminButton variant="primary" size="sm" onClick={handleHeaderSave}>Lưu</AdminButton>
                  <AdminButton variant="secondary" size="sm" onClick={handleHeaderCancel}>Hủy</AdminButton>
                </>
              ) : (
                <>
                  <AdminButton variant="ghost" size="sm" icon={<FaEdit />} onClick={handleHeaderEditClick}>Sửa</AdminButton>
                  <AdminButton variant="danger" size="sm" icon={<FaTrash />} onClick={onDelete}>Xóa</AdminButton>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {editingHeader ? (
              <>
                <div className="col-span-2">
                  <AdminFormField label="Tên (term)" required>
                    <textarea
                      className="input w-full resize-y min-h-[32px] max-h-40 text-sm"
                      value={headerData.term}
                      onChange={e => handleHeaderChange('term', e.target.value)}
                      rows={2}
                      placeholder="Nhập tên bài học (term)"
                    />
                  </AdminFormField>
                </div>
                <div className="col-span-2">
                  <AdminFormField label="Nghĩa (meaning)" required>
                    <textarea
                      className="input w-full resize-y min-h-[32px] max-h-40 text-sm"
                      value={headerData.meaning}
                      onChange={e => handleHeaderChange('meaning', e.target.value)}
                      rows={2}
                      placeholder="Nghĩa bài học (meaning)"
                    />
                  </AdminFormField>
                </div>
                <div>
                  <AdminFormField label="Loại (type)">
                    <input
                      className="input text-sm w-32"
                      value={headerData.type}
                      onChange={e => handleHeaderChange('type', e.target.value)}
                    />
                  </AdminFormField>
                </div>
                <div>
                  <AdminFormField label="Gói">
                    <select
                      className="input text-sm w-32"
                      value={headerData.requiredTier}
                      onChange={e => handleHeaderChange('requiredTier', e.target.value)}
                    >
                      <option value="free">Miễn phí</option>
                      <option value="basic">Cơ bản</option>
                      <option value="premium">Nâng cao</option>
                    </select>
                  </AdminFormField>
                </div>
              </>
            ) : (
              <>
                <div><span className="font-semibold">Tên:</span> {lesson.title}</div>
                <div><span className="font-semibold">Loại:</span> {lesson.type}</div>
                <div><span className="font-semibold">Gói:</span> {lesson.requiredTier === 'basic' ? 'Cơ bản' : lesson.requiredTier === 'premium' ? 'Nâng cao' : 'Miễn phí'}</div>
                <div><span className="font-semibold">Số mục:</span> {lesson._count?.items ?? 0}</div>
                <div className="col-span-2"><span className="font-semibold">Mô tả:</span> {lesson.description || <span className="italic text-gray-400">(Không có)</span>}</div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm mục từ, nghĩa..."
            className="w-64"
          />
          <AdminButton variant="primary" size="sm" icon={<FaPlus size={10} />} className="ml-auto" onClick={handleAddRow} disabled={addingRow}>
            Thêm mục
          </AdminButton>
        </div>
        <div className="overflow-x-auto rounded border">
          <div className="grid grid-cols-5 bg-gray-50 font-semibold text-xs border-b">
            <div className="px-2 py-2">Từ/Mục</div>
            <div className="px-2 py-2">Đọc</div>
            <div className="px-2 py-2">Nghĩa</div>
            <div className="px-2 py-2">Loại</div>
            <div className="px-2 py-2 text-center">Hành động</div>
          </div>
          {addingRow && (
            <div className="grid grid-cols-5 items-center border-b bg-yellow-50 animate-pulse text-sm">
              <input
                className="px-2 py-2 border rounded bg-white text-sm"
                value={addData.term}
                onChange={e => handleAddChange('term', e.target.value)}
                placeholder="Từ/Mục"
                autoFocus
              />
              <input
                className="px-2 py-2 border rounded bg-white text-sm"
                value={addData.pronunciation}
                onChange={e => handleAddChange('pronunciation', e.target.value)}
                placeholder="Đọc"
              />
              <input
                className="px-2 py-2 border rounded bg-white text-sm"
                value={addData.meanings}
                onChange={e => handleAddChange('meanings', e.target.value)}
                placeholder="Nghĩa (phẩy)"
              />
              <input
                className="px-2 py-2 border rounded bg-white text-sm"
                value={addData.type}
                onChange={e => handleAddChange('type', e.target.value)}
                placeholder="Loại"
              />
              <div className="flex gap-2 justify-center">
                <AdminButton variant="primary" size="sm" onClick={handleAddSave}>Lưu</AdminButton>
                <AdminButton variant="secondary" size="sm" onClick={handleAddCancel}>Hủy</AdminButton>
              </div>
            </div>
          )}
          {pagedItems.length === 0 && !addingRow ? (
            <AdminEmptyState title="Không có mục nào" />
          ) : pagedItems.map(item => (
            <div key={item.id} className="grid grid-cols-5 items-center border-b hover:bg-blue-50 transition text-sm">
              {editingId === item.id ? (
                <>
                  <input
                    className="px-2 py-2 border rounded bg-white text-sm"
                    value={editData.term}
                    onChange={e => handleEditChange('term', e.target.value)}
                  />
                  <input
                    className="px-2 py-2 border rounded bg-white text-sm"
                    value={editData.pronunciation}
                    onChange={e => handleEditChange('pronunciation', e.target.value)}
                  />
                  <input
                    className="px-2 py-2 border rounded bg-white text-sm"
                    value={editData.meanings}
                    onChange={e => handleEditChange('meanings', e.target.value)}
                    placeholder="Cách nhau bởi dấu phẩy"
                  />
                  <input
                    className="px-2 py-2 border rounded bg-white text-sm"
                    value={editData.type}
                    onChange={e => handleEditChange('type', e.target.value)}
                  />
                  <div className="flex gap-2 justify-center">
                    <AdminButton variant="primary" size="sm" onClick={() => handleEditSave(item)}>Lưu</AdminButton>
                    <AdminButton variant="secondary" size="sm" onClick={handleEditCancel}>Hủy</AdminButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-2 py-2 truncate" title={item.term}>{item.term}</div>
                  <div className="px-2 py-2">{item.pronunciation}</div>
                  <div className="px-2 py-2 truncate" title={item.meanings?.map(m => m.meaning).join(', ')}>{item.meanings?.map(m => m.meaning).join(', ')}</div>
                  <div className="px-2 py-2">{item.type}</div>
                  <div className="px-2 py-2 flex gap-2 justify-center">
                    <AdminButton variant="ghost" size="sm" icon={<FaEdit size={13} />} onClick={() => handleEditClick(item)} />
                    <AdminButton variant="ghost" size="sm" icon={<FaClone size={13} />} onClick={() => handleCloneRow(item)} />
                    <AdminButton variant="danger" size="sm" icon={<FaTrash size={13} />} onClick={() => setDeleteTarget(item)} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Pagination */}
        {pagedItems.length > 0 && filteredItems.length > pageSize && (
          <div className="flex justify-center items-center gap-2 py-3">
            <AdminButton variant="secondary" size="sm" onClick={handlePrev} disabled={page === 1}>Trước</AdminButton>
            <span className="text-sm">{page} / {totalPages}</span>
            <AdminButton variant="secondary" size="sm" onClick={handleNext} disabled={page === totalPages}>Sau</AdminButton>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          title="Xóa mục"
          message={`Bạn có chắc muốn xóa mục "${deleteTarget?.term}"?`}
          onConfirm={() => deleteTarget && handleDeleteItem(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          danger
          loading={deleting}
        />
    </AdminModal>
  );
}
