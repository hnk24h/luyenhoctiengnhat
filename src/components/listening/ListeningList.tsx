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
  levelMeta: Record<string, { badgeBg: string; badgeText: string; accent?: string }>;
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
  // Move useState to top-level
  const [page, setPage] = useState(0);

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
  // Tách filter/sort nếu có
  const displayItems = filterSortFn ? filterSortFn(items) : items;
  // Pagination state
  const pageSize = 6;
  const totalPages = Math.ceil(displayItems.length / pageSize);
  const pagedItems = displayItems.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div
      className="backdrop-blur-xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl shadow-xl p-2 space-y-2"
      style={{ boxShadow: '0 4px 32px 0 var(--primary-light)', minHeight: 120 }}
    >
      <div
        className="flex items-center gap-2 mb-3 px-2 py-1 select-none"
      >
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full shadow"
          style={{
            background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 8px var(--primary-light)',
          }}
        >
          <FaListUl size={16} />
        </span>
        <span
          className="text-[15px] font-extrabold tracking-tight flex-1"
          style={{
            color: 'var(--primary)',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 8px var(--primary-light)',
          }}
        >
          Danh sách bài nghe
          {typeof totalCount === 'number' && (
            <span className="ml-2 text-[12px] font-bold text-[var(--primary)]/70">({totalCount})</span>
          )}
        </span>
      </div>
      <>
        <div className="flex flex-col gap-2">
          {pagedItems.map((p, number) => {
            const m = levelMeta[p.level];
            const isSelected = selectedId === p.id;
            const accent = m?.accent || m?.badgeBg || 'var(--primary)';
            const itemBg = isSelected ? 'color-mix(in srgb, var(--primary) 10%, var(--bg-surface))' : 'var(--bg-surface)';
            const borderColor = isSelected ? accent : 'transparent';
            const iconColor = isSelected ? accent : m?.badgeText || 'var(--primary)';
            const isPlaying = isPlayingId === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-lg ${isSelected ? 'ring-2 ring-[var(--primary)] scale-[1.025]' : 'hover:scale-[1.015]'}`}
                style={{
                  // background: itemBg,
                  border: `2px solid ${borderColor}`,
                  boxShadow: isSelected ? `0 4px 24px 0 ${accent}22` : '0 1px 4px 0 var(--primary-light)',
                  minHeight: 56,
                  opacity: p.listened ? 0.7 : 1,
                  zIndex: isSelected ? 2 : 1,
                }}
                onClick={() => onSelect(p.id)}
                tabIndex={0}
                aria-label={`Chọn bài nghe ${p.title}`}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(p.id); }}
              >
                {/* Accent bar for selected */}
                {isSelected && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px 0 ${accent}55` }} />
                )}
                {/* Level dot */}
                <span className="w-3 h-3 rounded-full mr-1" style={{ background: accent, boxShadow: `0 0 0 2px ${accent}33` }} />
                <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px]" style={{ color: iconColor }}>{page * pageSize + number + 1}. {p.title}</span>
                    {p.titleVi && <span className="text-xs ml-1" style={{ color: iconColor, opacity: 0.85 }}>{p.titleVi}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold tabular-nums flex items-center gap-1" style={{ color: isSelected ? accent : iconColor, opacity: 0.8 }}>
                      <FaClock className="inline mr-1 mb-0.5" />
                      {Math.floor(p.durationSec / 60)}:{(p.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                    {p.listened && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold ml-1">Đã nghe</span>
                    )}
                  </div>
                </div>
                {/* Sóng nhạc khi play */}
                {isPlaying && (
                  <span className="flex items-end gap-[2px] h-5 mr-1">
                    {[4, 7, 10, 6, 9, 12, 5, 8].map((h, i) => (
                      <span key={i} className="w-[2px] rounded-full bg-[var(--primary)] animate-pulse"
                        style={{
                          height: `${h * 1.5}px`,
                          opacity: 0.7,
                          animationDelay: `${i * 0.07}s`,
                          animationDuration: `${0.5 + (i % 4) * 0.15}s`,
                        }} />
                    ))}
                  </span>
                )}
                {/* Play button: floating, prominent */}
                {typeof onPlay === 'function' && (
                  <span
                    className={`ml-2 flex items-center justify-center transition-all duration-200 ${isSelected || isPlaying ? 'opacity-100 scale-100' : 'opacity-80 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}
                    style={{ zIndex: 3 }}
                  >
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-[var(--primary-light)] to-[var(--primary)] shadow-lg border-2 border-white/80 focus:outline-none hover:scale-110 transition-transform"
                      style={{ color: isPlaying ? '#fff' : accent, boxShadow: isPlaying ? `0 0 0 3px ${accent}44` : undefined }}
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
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-2 px-2">
            <button
              className="px-3 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs shadow hover:bg-[var(--primary)] hover:text-white transition disabled:opacity-40"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span className="text-xs text-[var(--primary)] font-semibold">
              Trang {page + 1}/{totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs shadow hover:bg-[var(--primary)] hover:text-white transition disabled:opacity-40"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </>
    </div>
  );
};
