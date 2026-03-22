import React, { useState } from 'react';
import { FaClock, FaHeadphones, FaChevronRight, FaPlay, FaPause, FaListUl } from 'react-icons/fa6';

interface ListeningListProps {
  items: Array<{
    id: string;
    title: string;
    titleVi?: string | null;
    level: string;
    category: string;
    situation: string;
    durationSec: number;
    listened?: boolean;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  onPlay?: (id: string) => void;
  isPlayingId?: string;
  levelMeta: Record<string, { badgeBg: string; badgeText: string }>;
  heroBg: string;
  accent: string;
  loading?: boolean;
  totalCount?: number;
  filterSortFn?: (items: ListeningListProps['items']) => ListeningListProps['items'];
}

export const ListeningList: React.FC<ListeningListProps> = ({
  items,
  selectedId,
  onSelect,
  onPlay,
  isPlayingId,
  levelMeta,
  heroBg,
  accent,
  loading = false,
  totalCount,
  filterSortFn,
}) => {
  if (loading) {
    // Loading skeleton
    return (
      <div className="space-y-2 px-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-[var(--bg-muted)] animate-pulse" />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-4 px-2">
        <div className="w-14 h-14 flex items-center justify-center"
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
  const [collapsed, setCollapsed] = useState(false);
  // Tách filter/sort nếu có
  const displayItems = filterSortFn ? filterSortFn(items) : items;
  return (
    <>
      <div
        className="flex items-center gap-2 mb-4 px-3 py-2 select-none cursor-pointer group"
        onClick={() => setCollapsed(v => !v)}
        tabIndex={0}
      >
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-md"
          style={{
            background: 'linear-gradient(135deg, #a18fff 0%, #6C5CE7 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <FaListUl size={18} />
        </span>
        <span
          className="text-[16px] font-extrabold tracking-tight flex-1"
          style={{
            color: '#6C5CE7',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 8px #6C5CE720',
          }}
        >
          Danh sách bài nghe
          {typeof totalCount === 'number' && (
            <span className="ml-2 text-[13px] font-bold text-[#6C5CE7BB]">({totalCount})</span>
          )}
        </span>
        <span className="text-md px-2 py-0.5 rounded-full shrink-0">{displayItems[0]?.level}</span>
      </div>
      {!collapsed && (
        <div className="space-y-1">
          {displayItems.map((p, number) => {
          const m = levelMeta[p.level];
          const isSelected = selectedId === p.id;
          // Màu sắc đồng bộ với LevelFilterBar
          const accent = m?.accent || m?.badgeBg;
          const itemBg = isSelected ? accent : m?.badgeBg;
          const borderColor = accent;
          const iconColor = isSelected ? '#fff' : m?.badgeText;
          const hoverBg = isSelected ? accent : accent + '22';
          // Hiệu ứng sóng nhạc khi play
          const isPlaying = isPlayingId === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-lg border flex items-center gap-2 px-3 py-2 transition-all cursor-pointer group ${isSelected ? 'ring-2' : ''}`}
              style={{
                borderColor,
                background: itemBg,
                opacity: p.listened ? 0.7 : 1,
              }}
              onClick={() => onSelect(p.id)}
              onMouseEnter={e => {
                if (!isSelected) e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={e => {
                if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface)';
              }}
              tabIndex={0}
              aria-label={`Chọn bài nghe ${p.title}`}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(p.id); }}
            >              
              <div className="flex-1 min-w-0 flex flex-col items-start gap-2">
                <div>
                  <span style={{ color: iconColor }}>{number + 1}. {p.title}</span>
                  {p.titleVi && <span className="text-xs ml-2" style={{ color: iconColor, opacity: 0.85 }}>{p.titleVi}</span>}                  
                </div>
                <div>
                  {/* Thời lượng */}
                  <span className="text-[11px] font-bold tabular-nums ml-2" style={{ color: isSelected ? '#fff' : accent, opacity: 0.8 }}>
                    <FaClock className="inline mr-1 mb-0.5" />
                    {Math.floor(p.durationSec / 60)}:{(p.durationSec % 60).toString().padStart(2, '0')}
                  </span>
                  {/* Đã nghe */}
                  {p.listened && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">Đã nghe</span>
                  )}
                </div>
              </div>
              {/* Sóng nhạc khi play */}
              {isPlaying && (
                <span className="flex items-end gap-[2px] h-5 mr-1">
                  {[4, 7, 10, 6, 9, 12, 5, 8].map((h, i) => (
                    <span key={i} className="w-[2px] rounded-full bg-white animate-pulse"
                      style={{
                        height: `${h * 1.5}px`,
                        opacity: 0.7,
                        animationDelay: `${i * 0.07}s`,
                        animationDuration: `${0.5 + (i % 4) * 0.15}s`,
                      }} />
                  ))}
                </span>
              )}
              {/* Play button: chỉ hiện khi hover hoặc chọn */}
              {typeof onPlay === 'function' && (
                <span
                  className={`ml-1 flex items-center justify-center transition-all duration-200 ${isSelected || isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}
                >
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 shadow transition-colors border border-white/70 focus:outline-none"
                    style={{ color: isPlaying ? accent : iconColor, boxShadow: isPlaying ? `0 0 0 2px ${accent}44` : undefined }}
                    title={isPlaying ? 'Dừng phát' : 'Nghe nhanh bài này'}
                    aria-label={isPlaying ? 'Dừng phát' : 'Nghe nhanh bài này'}
                    tabIndex={0}
                    onClick={e => {
                      e.stopPropagation();
                      onPlay(p.id);
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onPlay(p.id); } }}
                  >
                    {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                  </button>
                </span>
              )}
            </div>
          );
          })}
        </div>
      )}
    </>
  );
};
