import React from 'react';
import { FaLayerGroup, FaPlus, FaChevronRight, FaPencil } from 'react-icons/fa6';
import CategoryDetailCard from './CategoryDetailCard';

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

export default function CategoryPanel({
  levels,
  categories,
  activeLevel,
  setActiveLevel,
  activeSkill,
  setActiveSkill,
  catSearch,
  setCatSearch,
  activeCatId,
  setActiveCatId,
  loadLessons,
  openCatCreate,
  openCatEdit,
  deleteCat,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Category selection/search */}
      <div className="card p-4 flex flex-col gap-2">
        <div className="flex justify-between gap-2 mb-2">
          <h2 className="font-bold text-base flex items-center gap-2">
            <FaLayerGroup className="inline" size={16} style={{ color: 'var(--primary)' }} />
            Chủ đề
          </h2>
          <button onClick={openCatCreate} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary ml-2">
            <FaPlus size={10} /> Thêm
          </button>
        </div>
        <div>
          <input className="input w-full text-sm py-1.5" placeholder="Tìm chủ đề..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {categories.length === 0 ? (
            <div className="text-sm text-muted">Chưa có chủ đề nào</div>
          ) : categories.map(cat => (
            <div
              key={cat.id}
              className={`group flex items-center px-3 py-2 rounded-lg border bg-white text-sm font-semibold transition-all cursor-pointer hover:bg-blue-50 ${activeCatId === cat.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}
              style={{ minHeight: 44 }}
              onClick={() => { setActiveCatId(cat.id); loadLessons(cat.id); }}
              title={cat.name}
            >
              <span className="truncate flex-1 text-left font-medium text-gray-900">{cat.name}</span>
              <span className="ml-2 text-xs text-gray-500 font-normal">{cat._count.lessons} bài</span>
              {activeCatId !== cat.id && <SkillBadge skill={cat.skill} />}
              <button
                className="ml-2 p-1 rounded hover:bg-blue-100 text-blue-700 transition-all opacity-80 group-hover:opacity-100"
                onClick={e => { e.stopPropagation(); openCatEdit(cat); }}
                title="Sửa chủ đề"
                tabIndex={0}
              >
                <FaPencil size={14} />
              </button>
              <FaChevronRight className="ml-2 text-gray-400 group-hover:text-blue-600 transition-all" size={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
