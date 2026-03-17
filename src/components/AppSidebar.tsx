'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaCheck, FaMagnifyingGlass, FaPlay, FaXmark, FaListUl, FaCircleDot } from 'react-icons/fa6';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ItemProgress = 'done' | 'in-progress' | 'new';

export interface SidebarChip {
  value: string;
  label: string;
  bg?: string;
  color?: string;
  activeColor?: string;
}

export interface SidebarFilterGroup {
  label: string;
  chips: SidebarChip[];
  value: string;
  onChange: (v: string) => void;
}

export interface SidebarItem {
  id: string;
  title: string;
  titleVi?: string | null;
  levelLabel?: string;
  levelBg?: string;
  levelColor?: string;
  tag?: string;
  meta?: string;
  metaIcon?: React.ReactNode;
  fontFamily?: string;
  /** Progress state shown as indicator on the item */
  progress?: ItemProgress;
}

export interface AppSidebarProps {
  headerIcon: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Hex color — CSS variables like var(--primary) also supported */
  accentColor: string;
  filters?: SidebarFilterGroup[];
  items: SidebarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showSoundBars?: boolean;
  loading?: boolean;
  emptyText?: string;
  /** Custom empty state node (overrides emptyText) */
  emptyNode?: React.ReactNode;
  /** Enable search bar above item list */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Label shown in the mobile trigger button */
  mobileLabel?: string;
}

// ─── Inner panel (shared between desktop aside + mobile sheet) ───────────────

function SidebarPanel({
  headerIcon, title, subtitle, accentColor, filters, items, selectedId, onSelect,
  showSoundBars, loading, emptyText, emptyNode, searchable, searchPlaceholder,
  onClose,
}: AppSidebarProps & { onClose?: () => void }) {
  const [q, setQ] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── 6. Keyboard navigation ─────────────────────────────────────────────
  const handleListKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const displayed = searchable && q.trim()
      ? items.filter(it => it.title.toLowerCase().includes(q.trim().toLowerCase()))
      : items;
    const cur = displayed.findIndex(it => it.id === selectedId);
    const next = e.key === 'ArrowDown'
      ? Math.min(displayed.length - 1, cur + 1)
      : Math.max(0, cur - 1);
    if (next !== cur) onSelect(displayed[next].id);
    // scroll into view
    const btns = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-sidebar-item]');
    btns?.[next]?.scrollIntoView({ block: 'nearest' });
  }, [items, selectedId, onSelect, q, searchable]);

  const displayed = searchable && q.trim()
    ? items.filter(it => it.title.toLowerCase().includes(q.trim().toLowerCase()))
    : items;

  // ── 1. Gradient fix: use CSS custom property --sac inline ─────────────
  const headerStyle = {
    '--sac': accentColor,
    background: 'linear-gradient(135deg, var(--sac) 0%, color-mix(in srgb, var(--sac) 68%, #000) 100%)',
  } as React.CSSProperties;

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>

      {/* ── Gradient header ── */}
      <div className="px-4 py-4 shrink-0" style={headerStyle}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}>
            {headerIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold leading-snug truncate" style={{ color: '#fff' }}>{title}</div>
            {subtitle !== undefined && (
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>{subtitle}</div>
            )}
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
              <FaXmark size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Filter zone — accessible labels (11px) ── */}
      {filters && filters.length > 0 && (
        <div className="px-3 pt-3 pb-2 flex flex-col gap-3 shrink-0 border-b"
          style={{ borderColor: 'var(--border)' }}>
          {filters.map((group) => (
            <div key={group.label}>
              <div className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {group.label}
              </div>
              <div className="flex flex-wrap gap-1">
                {group.chips.map((chip) => {
                  const isActive = group.value === chip.value;
                  const activeColor = chip.activeColor ?? accentColor;
                  return (
                    <button key={chip.value} onClick={() => group.onChange(chip.value)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-2"
                      style={isActive
                        ? {
                            background: activeColor, color: '#fff',
                            boxShadow: `0 2px 10px color-mix(in srgb, ${activeColor} 40%, transparent)`,
                            // ── 9. focus ring color ──
                            '--tw-ring-color': activeColor,
                          } as React.CSSProperties
                        : chip.bg
                          ? { background: chip.bg, color: chip.color ?? 'var(--text-secondary)' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }
                      }>
                      {/* ── 9. Checkmark on active chip ── */}
                      {isActive && <FaCheck size={8} />}
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. Search bar ── */}
      {searchable && (
        <div className="px-3 py-2 shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--bg-muted)' }}>
            <FaMagnifyingGlass size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={searchPlaceholder ?? 'Tìm kiếm...'}
              className="flex-1 bg-transparent border-none outline-none text-[12px]"
              style={{ color: 'var(--text-base)' }}
            />
            {q && (
              <button onClick={() => { setQ(''); searchRef.current?.focus(); }}
                style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                <FaXmark size={10} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Item list ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto" onKeyDown={handleListKeyDown}
        tabIndex={-1} style={{ outline: 'none' }}>
        {loading ? (
          <div className="flex flex-col gap-2 px-3 pt-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          // ── 3. Better empty state ──
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
            {emptyNode ?? (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--bg-muted)' }}>
                  <FaListUl size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="text-center">
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {q ? 'Không tìm thấy kết quả' : emptyText ?? 'Chưa có nội dung'}
                  </div>
                  {!q && (
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Thử chọn cấp độ khác hoặc kiểm tra lại kết nối
                    </div>
                  )}
                  {q && (
                    <button onClick={() => setQ('')}
                      className="text-[11px] mt-1 underline" style={{ color: accentColor }}>
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          displayed.map((item, idx) => {
            const active = item.id === selectedId;
            const realIdx = items.indexOf(item);
            return (
              <button key={item.id} data-sidebar-item onClick={() => onSelect(item.id)}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-inset${active ? '' : ' hover:bg-[var(--bg-muted)]'}`}
                style={active
                  ? { background: 'var(--primary-light)', '--tw-ring-color': accentColor } as React.CSSProperties
                  : { '--tw-ring-color': accentColor } as React.CSSProperties
                }>

                {/* Left accent bar */}
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all"
                  style={{ background: active ? accentColor : 'transparent' }} />

                {/* Number → play circle */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={active
                    ? { background: accentColor, boxShadow: `0 2px 10px color-mix(in srgb, ${accentColor} 40%, transparent)` }
                    : { background: item.levelBg ?? 'var(--bg-muted)' }}>
                  {active
                    ? <FaPlay size={8} color="#fff" />
                    : <span className="text-[10px] font-bold" style={{ color: item.levelColor ?? 'var(--text-muted)' }}>
                        {(realIdx >= 0 ? realIdx : idx) + 1}
                      </span>
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold leading-snug line-clamp-1"
                    style={{ color: active ? accentColor : 'var(--text-base)', fontFamily: item.fontFamily }}>
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.levelLabel && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: item.levelBg ?? 'var(--border)', color: item.levelColor ?? 'var(--text-muted)' }}>
                        {item.levelLabel}
                      </span>
                    )}
                    {item.tag && (
                      <span className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{item.tag}</span>
                    )}
                    {item.meta && (
                      <span className="ml-auto text-[9px] flex items-center gap-0.5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {item.metaIcon}{item.meta}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── 6. Progress indicator ── */}
                {item.progress === 'done' && !active && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#DCFCE7' }}>
                    <FaCheck size={8} style={{ color: '#16A34A' }} />
                  </div>
                )}
                {item.progress === 'in-progress' && !active && (
                  <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#3B82F6' }} />
                )}

                {/* ── Sound bars on active ── */}
                {showSoundBars && active && (
                  <div className="flex items-end gap-[2px] h-4 shrink-0">
                    {[1, 1.7, 1.3, 1.9, 1.1].map((s, i) => (
                      <div key={i} className="w-[3px] rounded-full"
                        style={{ height: `${s * 7}px`, background: accentColor, opacity: 0.8,
                          animation: 'soundBar 0.9s ease-in-out infinite alternate',
                          animationDelay: `${i * 0.13}s` }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function AppSidebar(props: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sheet on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  // Lock body scroll when sheet open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const selectedItem = props.items.find(it => it.id === props.selectedId);
  const activeFilterLabels = (props.filters ?? [])
    .flatMap(g => g.chips.filter(c => c.value === g.value && c.value !== '' && c.value !== 'ALL').map(c => c.label))
    .join(' · ');

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0"
        style={{ background: 'var(--bg-base)', position: 'sticky', top: '56px', height: 'calc(100vh - 64px)' }}>
        <div className="flex flex-col flex-1 m-3 rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
          <SidebarPanel {...props} />
        </div>
      </aside>

      {/* ── 8. Mobile: floating trigger button ── */}
      <button
        className="lg:hidden fixed bottom-5 left-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
        style={{
          '--sac': props.accentColor,
          background: 'var(--sac)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        } as React.CSSProperties}
        onClick={() => setMobileOpen(true)}
      >
        <FaListUl size={12} />
        <span className="text-[12px] font-semibold">
          {selectedItem
            ? <span className="max-w-[120px] truncate block">{selectedItem.title}</span>
            : (props.mobileLabel ?? 'Danh sách bài')}
        </span>
        {activeFilterLabels && (
          <span className="text-[10px] opacity-75">{activeFilterLabels}</span>
        )}
      </button>

      {/* ── 8. Mobile: bottom sheet overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          {/* Sheet */}
          <div className="relative rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '88vh', background: 'var(--bg-base)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarPanel {...props} onClose={() => {
                setMobileOpen(false);
              }} onSelect={(id) => { props.onSelect(id); setMobileOpen(false); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
