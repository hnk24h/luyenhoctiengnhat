import React from 'react';
import { FaLayerGroup, FaPlus, FaChevronRight, FaPencil, FaTrash, FaFilter } from 'react-icons/fa6';

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

interface Level { id: string; code: string; name: string; }
interface Category {
  id: string; levelId: string; skill: string; name: string;
  description: string | null; icon: string | null; order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}
interface CategoryPanelProps {
  levels: Level[];
  categories: Category[];
  activeLevel: string;
  setActiveLevel: (level: string) => void;
  activeSkill: string;
  setActiveSkill: (skill: string) => void;
  catSearch: string;
  setCatSearch: (s: string) => void;
  activeCatId: string | null;
  setActiveCatId: (id: string) => void;
  loadLessons: (catId: string) => void;
  openCatCreate: () => void;
  openCatEdit: (cat: Category) => void;
  deleteCat: (id: string) => void;
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
}: CategoryPanelProps) {
  const filtered = categories.filter(c =>
    !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Level filter tabs */}
      {levels.length > 0 && (
        <div className="card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <FaFilter size={10} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Cấp độ</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {levels.map(lv => (
              <button
                key={lv.code}
                onClick={() => setActiveLevel(lv.code)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border"
                style={activeLevel === lv.code
                  ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                }
              >
                {lv.code}
              </button>
            ))}
          </div>
          {/* Skill filter */}
          <div className="flex items-center gap-1.5 mt-3 mb-2">
            <FaFilter size={10} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Kỹ năng</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveSkill('')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border"
              style={!activeSkill
                ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
            >
              Tất cả
            </button>
            {Object.entries(SKILL_MAP).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveSkill(key)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border"
                style={activeSkill === key
                  ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="card p-4 flex flex-col gap-2">
        <div className="flex justify-between gap-2 mb-2">
          <h2 className="font-bold text-base flex items-center gap-2">
            <FaLayerGroup className="inline" size={16} style={{ color: 'var(--primary)' }} />
            Chủ đề
            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
          </h2>
          <button onClick={openCatCreate} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary ml-2">
            <FaPlus size={10} /> Thêm
          </button>
        </div>
        <div>
          <input className="input w-full text-sm py-1.5" placeholder="Tìm chủ đề..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 mt-2 max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Chưa có chủ đề nào</div>
          ) : filtered.map(cat => (
            <div
              key={cat.id}
              className="group flex items-center px-3 py-2 rounded-lg border text-sm transition-all cursor-pointer"
              style={{
                minHeight: 44,
                borderColor: activeCatId === cat.id ? 'var(--primary)' : 'var(--border)',
                background: activeCatId === cat.id ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--bg-surface)',
                boxShadow: activeCatId === cat.id ? '0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)' : 'none',
              }}
              onClick={() => { setActiveCatId(cat.id); loadLessons(cat.id); }}
              title={cat.name}
            >
              {cat.icon && <span className="mr-2 text-base">{cat.icon}</span>}
              <span className="truncate flex-1 text-left font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{cat._count.lessons} bài</span>
              <SkillBadge skill={cat.skill} />
              <button
                className="ml-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--primary)' }}
                onClick={e => { e.stopPropagation(); openCatEdit(cat); }}
                title="Sửa"
              >
                <FaPencil size={12} />
              </button>
              <button
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: '#EF4444' }}
                onClick={e => { e.stopPropagation(); deleteCat(cat.id); }}
                title="Xóa"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
