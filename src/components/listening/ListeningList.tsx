import React from 'react';
import { FaClock, FaHeadphones } from 'react-icons/fa6';

interface ListeningListProps {
  items: Array<{
    id: string;
    title: string;
    titleVi?: string | null;
    level: string;
    category: string;
    situation: string;
    durationSec: number;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  levelMeta: Record<string, { badgeBg: string; badgeText: string }>;
  heroBg: string;
  accent: string;
}

export const ListeningList: React.FC<ListeningListProps> = ({
  items,
  selectedId,
  onSelect,
  levelMeta,
  heroBg,
  accent,
}) => {
  if (!items.length) {
    return (
      <div className="flex  items-center justify-center min-h-[40vh] gap-4 px-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${accent} 12%, var(--bg-base))` }}>
          <FaHeadphones size={24} style={{ color: accent, opacity: 0.7 }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-base)' }}>Không có bài nghe nào phù hợp</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Thay đổi bộ lọc hoặc thử từ khóa khác</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map(p => {
        const m = levelMeta[p.level];
        return (
          <div key={p.id} className={`rounded-xl border flex items-center gap-3 p-3 transition-all cursor-pointer ${selectedId === p.id ? 'ring-2 ring-primary' : ''}`}
            style={{ borderColor: m?.badgeBg, background: selectedId === p.id ? 'var(--bg-muted)' : 'var(--bg-surface)' }}
            onClick={() => onSelect(p.id)}
          >
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: m?.badgeBg, color: m?.badgeText }}>{p.level}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                {p.titleVi && <span className="text-xs ml-2" style={{ color: accent }}>{p.titleVi}</span>}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.situation}</div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: heroBg, color: accent }}>{p.category}</span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><FaClock size={8} />{Math.floor(p.durationSec/60)}:{(p.durationSec%60).toString().padStart(2,'0')}</span>
          </div>
        );
      })}
    </div>
  );
};
