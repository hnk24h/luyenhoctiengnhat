import React from 'react';
import { FaPencil, FaTrash } from 'react-icons/fa6';

function SkillBadge({ skill }) {
  const colors = {
    doc: '#0EA5E9', nghe: '#10B981', ngu_phap: '#F59E0B', tu_vung: '#8B5CF6',
  };
  const labels = {
    doc: 'Đọc', nghe: 'Nghe', ngu_phap: 'Ngữ pháp', tu_vung: 'Từ vựng',
  };
  const c = colors[skill] ?? '#6B7280';
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${c}22`, color: c }}>
      {labels[skill] ?? skill}
    </span>
  );
}

export default function CategoryDetailCard({ cat, onEdit, onDelete }) {
  if (!cat) {
    return <div className="card text-center text-sm text-muted py-8">Chọn một chủ đề để xem chi tiết và quản lý bài học.</div>;
  }
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-xl flex items-center gap-2 text-blue-700">
          {cat.name}
        </span>
        <SkillBadge skill={cat.skill || ''} />
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
          {cat._count.lessons ?? 0} bài học
        </span>
        {/* Placeholder: lesson package/tier and difficulty */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
          Gói: Miễn phí
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-100">
          Độ khó: Dễ
        </span>
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-blue-50 ml-2 text-blue-700 border border-blue-100" title="Sửa chủ đề">
          <FaPencil size={13} />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 text-red-600 border border-red-100" title="Xóa chủ đề">
          <FaTrash size={13} />
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-1">{cat.description}</div>
    </div>
  );
}
