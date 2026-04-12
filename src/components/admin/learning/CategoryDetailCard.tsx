import React from 'react';
import { FaPencil, FaTrash } from 'react-icons/fa6';

const SKILL_MAP: Record<string, { label: string; color: string }> = {
  vocab: { label: 'Từ vựng', color: '#8B5CF6' },
  grammar: { label: 'Ngữ pháp', color: '#F59E0B' },
  doc: { label: 'Đọc', color: '#0EA5E9' },
  nghe: { label: 'Nghe', color: '#10B981' },
  noi: { label: 'Nói', color: '#EC4899' },
  viet: { label: 'Viết', color: '#F97316' },
};

function SkillBadge({ skill }: { skill: string }) {
  const s = SKILL_MAP[skill];
  const c = s?.color ?? '#6B7280';
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${c}22`, color: c }}>
      {s?.label ?? skill}
    </span>
  );
}

interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

interface CategoryDetailCardProps {
  cat: Category | null | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CategoryDetailCard({ cat, onEdit, onDelete }: CategoryDetailCardProps) {
  if (!cat) {
    return <div className="card text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Chọn một chủ đề để xem chi tiết và quản lý bài học.</div>;
  }
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          {cat.icon && <span className="text-xl">{cat.icon}</span>}
          {cat.name}
        </span>
        <SkillBadge skill={cat.skill || ''} />
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
          {cat._count.lessons ?? 0} bài học
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Cấp: {cat.level.code}
        </span>
        <div className="flex gap-1 ml-auto">
          <button onClick={onEdit} className="p-2 rounded-lg transition-all" style={{ color: 'var(--primary)', border: '1px solid var(--border)' }} title="Sửa chủ đề">
            <FaPencil size={13} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 transition-all" style={{ color: '#EF4444', border: '1px solid var(--border)' }} title="Xóa chủ đề">
            <FaTrash size={13} />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-1">{cat.description}</div>
    </div>
  );
}
