import React from 'react';

interface LevelFilterBarProps {
  levels: string[];
  selected: string;
  onSelect: (level: string) => void;
  allLabel?: string;
  colorMap?: Record<string, { bg: string; color: string; activeColor?: string }>;
  accent?: string;
}

export const LevelFilterBar: React.FC<LevelFilterBarProps> = ({
  levels,
  selected,
  onSelect,
  allLabel = 'Tất cả',
  colorMap = {},
  accent = '#6C5CE7',
}) => (
  <div className="flex gap-1.5 flex-wrap">
    <button
      onClick={() => onSelect('ALL')}
      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
      style={selected === 'ALL' ? { background: accent, color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
    >
      {allLabel}
    </button>
    {levels.map(lvl => {
      const m = colorMap[lvl] || {};
      return (
        <button
          key={lvl}
          onClick={() => onSelect(lvl)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={selected === lvl
            ? { background: m.activeColor || m.color || accent, color: '#fff', boxShadow: `0 2px 8px ${(m.activeColor || m.color || accent)}60` }
            : { background: m.bg || 'var(--bg-muted)', color: m.color || 'var(--text-secondary)' }}
        >
          {lvl}
        </button>
      );
    })}
  </div>
);
