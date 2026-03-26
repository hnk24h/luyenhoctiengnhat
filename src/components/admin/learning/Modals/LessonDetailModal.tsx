import React, { useState, useMemo } from 'react';
import { FaTimes, FaEdit, FaTrash, FaPlus, FaSearch, FaClone } from 'react-icons/fa';

// Schema: Lesson gồm các trường: id, title, description, type, requiredTier, _count.items
// CRUD: Sửa, Xóa, Thêm mục con (item), Search, Pagination


// Local copy of Lesson and LearningItem interfaces to avoid cross-app-directory import issues
interface Lesson {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  order: number;
  requiredTier?: string;
  _count: { items: number };
  category: { name: string; skill: string; level: { code: string } };
}
interface ContentMeaning { id: string; language: string; meaning: string }
interface ContentExample { id: string; exampleText: string; translation: string | null; language: string; translationLanguage: string | null }
interface LearningItem {
  id: string;
  lessonId: string;
  type: string;
  language: string;
  term: string;
  pronunciation: string | null;
  meanings: ContentMeaning[];
  examples: ContentExample[];
  audioUrl: string | null;
  imageUrl: string | null;
  order: number;
}

interface LessonDetailModalProps {
  lesson: Lesson;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  items?: LearningItem[];
  onAddItem: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
}

export default function LessonDetailModal({ lesson, onClose, onEdit, onDelete, items = [], onAddItem, onEditItem, onDeleteItem }: LessonDetailModalProps) {
  const [addingRow, setAddingRow] = useState(false);
  const [addData, setAddData] = useState({ term: '', pronunciation: '', meanings: '', type: '' });

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

  const handleAddChange = (field: string, value: any) => {
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
    const newItem = {
      term: addData.term,
      pronunciation: addData.pronunciation,
      meaning: addData.meanings,//.split(',').map(m => ({ meaning: m.trim() })).filter(m => m.meaning),
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
      setHeaderData({});
    } catch (err) {
      alert('Lưu bài học thất bại!');
    }
  };

  const handleAddCancel = () => {
    setAddingRow(false);
    setAddData({ term: '', pronunciation: '', meanings: '', type: '' });
  };
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerData, setHeaderData] = useState({});

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

  const handleHeaderChange = (field, value) => {
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
      items = data.items.map(item => ({ ...item })); // Cập nhật lại items nếu cần
      onEdit(data);
      setEditingHeader(false);
      setHeaderData({});
    } catch (err) {
      alert('Lưu bài học thất bại!');
    }
  };
  // Xóa item khỏi DB và reload lại danh sách
  const handleDeleteItem = async (item) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục này?')) return;
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
    }
  };

  const handleHeaderCancel = () => {
    setEditingHeader(false);
    setHeaderData({});
  };
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditData({
      term: item.term || '',
      pronunciation: item.pronunciation || '',
      meanings: item.meanings?.map(m => m.meaning).join(', ') || '',
      type: item.type || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = (item) => {
    const newItem = {
      ...item,
      term: editData.term,
      pronunciation: editData.pronunciation,
      meanings: editData.meanings.split(',').map(m => ({ meaning: m.trim() })).filter(m => m.meaning),
      type: editData.type,
    };
    onEditItem(newItem);
    setEditingId(null);
    setEditData({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.term?.toLowerCase().includes(search.toLowerCase()) ||
      item.meanings?.some(m => m.meaning?.toLowerCase().includes(search.toLowerCase()))
    ), [items, search]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  React.useEffect(() => { setPage(1); }, [search, items]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="bg-white rounded-xl shadow-2xl p-6 min-w-[340px] max-w-[98vw] w-full sm:w-[500px] md:w-[600px] lg:w-[00px] xl:w-[800px] 2xl:w-[1200px] relative animate-fade-in"
        style={{ maxWidth: '98vw' }}
      >
        <button
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 text-gray-500"
          onClick={onClose}
          title="Đóng"
        >
          <FaTimes size={18} />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2">Chi tiết bài học</h3>
        </div>
        <div className="card mb-2">
          <div className="flex items-center justify-end mb-2">
            <div className="flex gap-2">
              {editingHeader ? (
                <>
                  <button className="p-2 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={handleHeaderSave} title="Lưu">Lưu</button>
                  <button className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleHeaderCancel} title="Hủy">Hủy</button>
                </>
              ) : (
                <>
                  <button className="p-2 rounded hover:bg-blue-50 text-blue-600" onClick={handleHeaderEditClick} title="Sửa bài học"><FaEdit /></button>
                  <button className="p-2 rounded hover:bg-red-50 text-red-600" onClick={onDelete} title="Xóa bài học"><FaTrash /></button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {editingHeader ? (
              <>
                <div className="col-span-2">
                  <span className="font-semibold">Tên (term):</span>
                  <textarea
                    className="ml-2 px-2 py-1 border rounded text-sm w-full resize-y min-h-[32px] max-h-40"
                    value={headerData.term}
                    onChange={e => handleHeaderChange('term', e.target.value)}
                    rows={2}
                    placeholder="Nhập tên bài học (term)"
                  />
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Nghĩa (meaning):</span>
                  <textarea
                    className="ml-2 px-2 py-1 border rounded text-sm w-full resize-y min-h-[32px] max-h-40"
                    value={headerData.meaning}
                    onChange={e => handleHeaderChange('meaning', e.target.value)}
                    rows={2}
                    placeholder="Nghĩa bài học (meaning)"
                  />
                </div>
                <div>
                  <span className="font-semibold">Loại (type):</span>
                  <input
                    className="ml-2 px-2 py-1 border rounded text-sm w-32"
                    value={headerData.type}
                    onChange={e => handleHeaderChange('type', e.target.value)}
                  />
                </div>
                <div>
                  <span className="font-semibold">Gói:</span>
                  <select
                    className="ml-2 px-2 py-1 border rounded text-sm w-32"
                    value={headerData.requiredTier}
                    onChange={e => handleHeaderChange('requiredTier', e.target.value)}
                  >
                    <option value="free">Miễn phí</option>
                    <option value="basic">Cơ bản</option>
                    <option value="premium">Nâng cao</option>
                  </select>
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
          <input
            className="input w-64 text-sm py-1.5"
            placeholder="Tìm mục từ, nghĩa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold btn-primary text-xs" onClick={handleAddRow} disabled={addingRow}>
            <FaPlus size={10} /> Thêm mục
          </button>
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
                <button className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={handleAddSave} title="Lưu">Lưu</button>
                <button className="p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleAddCancel} title="Hủy">Hủy</button>
              </div>
            </div>
          )}
          {pagedItems.length === 0 && !addingRow ? (
            <div className="py-4 text-center text-muted">Không có mục nào</div>
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
                    <button className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleEditSave(item)} title="Lưu">Lưu</button>
                    <button className="p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={handleEditCancel} title="Hủy">Hủy</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-2 py-2 truncate" title={item.term}>{item.term}</div>
                  <div className="px-2 py-2">{item.pronunciation}</div>
                  <div className="px-2 py-2 truncate" title={item.meanings?.map(m => m.meaning).join(', ')}>{item.meanings?.map(m => m.meaning).join(', ')}</div>
                  <div className="px-2 py-2">{item.type}</div>
                  <div className="px-2 py-2 flex gap-2 justify-center">
                    <button className="p-1 rounded hover:bg-blue-100 text-blue-600" onClick={() => handleEditClick(item)} title="Sửa"><FaEdit size={13} /></button>
                    <button className="p-1 rounded hover:bg-green-100 text-green-700" onClick={() => handleCloneRow(item)} title="Clone"><FaClone size={13} /></button>
                    <button className="p-1 rounded hover:bg-red-100 text-red-600" onClick={() => handleDeleteItem(item)} title="Xóa"><FaTrash size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Pagination */}
        {pagedItems.length > 0 && filteredItems.length > pageSize && (
          <div className="flex justify-center items-center gap-2 py-3">
            <button onClick={handlePrev} disabled={page === 1} className="p-1 rounded border bg-white disabled:opacity-50">Trước</button>
            <span className="text-sm">{page} / {totalPages}</span>
            <button onClick={handleNext} disabled={page === totalPages} className="p-1 rounded border bg-white disabled:opacity-50">Sau</button>
          </div>
        )}
      </div>
    </div>
  );
}
