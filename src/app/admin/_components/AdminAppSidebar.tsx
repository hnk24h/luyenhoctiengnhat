'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  FaGauge, FaBullseye, FaBook, FaBookOpen, FaNewspaper,
  FaHeadphones, FaUsers, FaUpload, FaXmark, FaChevronDown,
  FaSeedling, FaPalette, FaWrench, FaClipboardList, FaAnglesLeft,
  FaSun, FaMoon, FaDesktop, FaRightFromBracket,
} from 'react-icons/fa6';
import { useTheme, THEMES, type AppearanceMode, type ThemeId } from '@/context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type IconComp = React.FC<{ size?: number }>;

interface NavLeaf    { t: 'leaf';    href: string; icon: IconComp; label: string }
interface NavGroup   { t: 'group';   key: string; flag?: string; icon?: IconComp; label: string; desc?: string; items: NavLeaf[] }
interface NavSection { t: 'section'; label: string; children: Array<NavGroup | NavLeaf> }
type NavNode = NavLeaf | NavSection;

// ─── Nav data ────────────────────────────────────────────────────────────────

const NAV: NavNode[] = [
  { t: 'leaf', href: '/admin', icon: FaGauge, label: 'Dashboard' },

  {
    t: 'section', label: 'Môn học',
    children: [
      {
        t: 'group', key: 'JLPT', flag: '🇯🇵', label: 'JLPT', desc: 'N5→N1',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=JLPT',    icon: FaBullseye,      label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=JLPT',  icon: FaBook,          label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/mock-exam?subject=JLPT', icon: FaClipboardList, label: 'Đề thi thử' },
          { t: 'leaf', href: '/admin/learning?subject=JLPT',  icon: FaBookOpen,      label: 'Bài học' },
          { t: 'leaf', href: '/admin/reading?subject=JLPT',   icon: FaNewspaper,     label: 'Bài đọc' },
          { t: 'leaf', href: '/admin/listening?subject=JLPT', icon: FaHeadphones,    label: 'Bài nghe' },
          { t: 'leaf', href: '/admin/import?subject=JLPT',    icon: FaUpload,        label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'HSK', flag: '🇨🇳', label: 'HSK', desc: 'HSK 1→6',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=HSK',   icon: FaBullseye,  label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=HSK', icon: FaBook,      label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/learning?subject=HSK', icon: FaBookOpen,  label: 'Bài học' },
          { t: 'leaf', href: '/admin/reading?subject=HSK',  icon: FaNewspaper, label: 'Bài đọc' },
          { t: 'leaf', href: '/admin/import?subject=HSK',   icon: FaUpload,    label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'BJT', flag: '💼', label: 'BJT', desc: 'J1+→J5',
        items: [
          { t: 'leaf', href: '/admin/mock-exam?subject=BJT', icon: FaClipboardList, label: 'Đề thi thử' },
          { t: 'leaf', href: '/admin/learning?subject=BJT',  icon: FaBookOpen,      label: 'Bài học' },
          { t: 'leaf', href: '/admin/import?subject=BJT',    icon: FaUpload,        label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'PMP', flag: '📋', label: 'PMP', desc: 'PMBOK',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=PMP',   icon: FaBullseye, label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=PMP', icon: FaBook,     label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/learning?subject=PMP', icon: FaBookOpen, label: 'Bài học' },
          { t: 'leaf', href: '/admin/import?subject=PMP',   icon: FaUpload,   label: 'Import' },
        ],
      },
    ],
  },

  {
    t: 'section', label: 'Hệ thống',
    children: [
      { t: 'leaf', href: '/admin/users',    icon: FaUsers,   label: 'Người dùng' },
      { t: 'leaf', href: '/admin/nav-menu', icon: FaClipboardList, label: 'Quản lý Menu' },
      {
        t: 'group', key: 'tools', icon: FaWrench, label: 'Công cụ',
        items: [
          { t: 'leaf', href: '/admin/seed',      icon: FaSeedling, label: 'Seed dữ liệu' },
          { t: 'leaf', href: '/admin/theme',     icon: FaPalette,  label: 'Theme' },
          { t: 'leaf', href: '/admin/import',    icon: FaUpload,   label: 'Import JSON' },
          { t: 'leaf', href: '/admin/normalize', icon: FaBookOpen, label: 'Chuẩn hóa data' },
        ],
      },
    ],
  },
];

// ─── Active helpers ───────────────────────────────────────────────────────────

function leafActive(href: string, pathname: string, qs: string) {
  const [p, q] = href.split('?');
  if (pathname !== p) return false;
  if (!q) return !qs;
  return qs === q || qs.startsWith(q + '&') || qs.includes('&' + q);
}
function groupActive(g: NavGroup, pathname: string, qs: string) {
  return g.items.some(l => leafActive(l.href, pathname, qs));
}

// ─── Tooltip (collapsed icon mode) ───────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="relative group/tip flex">
      {children}
      <span className="
        pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
        whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-md
        opacity-0 group-hover/tip:opacity-100 transition-opacity delay-100
      " style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)' }}>
        {label}
      </span>
    </span>
  );
}

// ─── Inner nav (uses useSearchParams — must be in Suspense) ──────────────────

function SidebarNav({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const pathname  = usePathname();
  const rawSearch = useSearchParams().toString();

  const calcOpen = useCallback(() => {
    const s = new Set<string>();
    for (const node of NAV) {
      if (node.t !== 'section') continue;
      for (const child of node.children) {
        if (child.t === 'group' && groupActive(child, pathname, rawSearch)) s.add(child.key);
      }
    }
    return s;
  }, [pathname, rawSearch]);

  const [open, setOpen] = useState<Set<string>>(calcOpen);

  useEffect(() => {
    const active = calcOpen();
    if (!active.size) return;
    setOpen(prev => { const n = new Set(prev); active.forEach(k => n.add(k)); return n; });
  }, [calcOpen]);

  const toggle = (key: string) =>
    setOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // ── Leaf ──────────────────────────────────────────────────────────────────
  const renderLeaf = (leaf: NavLeaf, indent = false) => {
    const active = leafActive(leaf.href, pathname, rawSearch);
    const linkContent = (
      <Link
        key={leaf.href}
        href={leaf.href}
        onClick={onLinkClick}
        title={collapsed ? leaf.label : undefined}
        className={[
          'flex items-center gap-2 rounded-lg transition-all duration-150 select-none',
          collapsed
            ? 'w-9 h-9 justify-center mx-auto'
            : indent
              ? 'py-1.5 px-2.5 text-[12px]'
              : 'py-2 px-3 text-[13px]',
          active
            ? 'font-semibold'
            : 'font-normal hover:bg-black/5',
        ].join(' ')}
        style={{
          textDecoration: 'none',
          background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
          color: active ? 'var(--primary)' : 'var(--text-secondary)',
        }}
      >
        <leaf.icon size={collapsed ? 14 : indent ? 11 : 13} />
        {!collapsed && leaf.label}
      </Link>
    );

    return collapsed ? (
      <Tooltip key={leaf.href} label={leaf.label}>{linkContent}</Tooltip>
    ) : linkContent;
  };

  // ── Group (accordion) ─────────────────────────────────────────────────────
  const renderGroup = (group: NavGroup) => {
    const active = groupActive(group, pathname, rawSearch);
    const isOpen = open.has(group.key);

    if (collapsed) {
      // Show only the flag/icon as tooltip
      const firstLeaf = group.items[0];
      return (
        <Tooltip key={group.key} label={group.label}>
          <button
            onClick={() => toggle(group.key)}
            className={[
              'w-9 h-9 flex items-center justify-center rounded-lg mx-auto transition-colors',
              active ? '' : 'hover:bg-black/5',
            ].join(' ')}
            style={{
              background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontSize: 15,
            }}
          >
            {group.flag
              ? <span style={{ lineHeight: 1 }}>{group.flag}</span>
              : group.icon
                ? <group.icon size={13} />
                : firstLeaf && <firstLeaf.icon size={13} />}
          </button>
        </Tooltip>
      );
    }

    return (
      <div key={group.key}>
        {/* Accordion trigger */}
        <button
          onClick={() => toggle(group.key)}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] transition-colors hover:bg-black/5"
          style={{
            background: active && !isOpen ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : undefined,
            fontWeight: active ? 700 : 500,
            color: active ? 'var(--primary)' : 'var(--text-primary)',
            border: 'none', cursor: 'pointer',
          }}
        >
          {group.flag
            ? <span style={{ fontSize: 15, lineHeight: 1 }}>{group.flag}</span>
            : group.icon && <group.icon size={13} />}
          <span className="flex-1 text-left">{group.label}</span>
          {group.desc && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{group.desc}</span>
          )}
          <FaChevronDown
            size={9}
            style={{
              color: 'var(--text-muted)', flexShrink: 0,
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform .2s ease',
            }}
          />
        </button>

        {/* Children */}
        {isOpen && (
          <div
            className="flex flex-col gap-0.5 ml-3.5 pl-2.5 pt-0.5 pb-1"
            style={{ borderLeft: '1px solid var(--border)' }}
          >
            {group.items.map(l => renderLeaf(l, true))}
          </div>
        )}
      </div>
    );
  };

  // ── Root render ───────────────────────────────────────────────────────────
  return (
    <nav className={`flex flex-col flex-1 overflow-y-auto ${collapsed ? 'px-1 py-2 gap-1 items-center' : 'px-2 py-2 gap-0.5'}`}>
      {NAV.map((node, i) => {
        if (node.t === 'leaf') {
          const active = pathname === node.href;
          if (collapsed) {
            return (
              <Tooltip key={node.href} label={node.label}>
                <Link
                  href={node.href}
                  onClick={onLinkClick}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                  style={{
                    background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  <node.icon size={14} />
                </Link>
              </Tooltip>
            );
          }
          return (
            <Link
              key={node.href}
              href={node.href}
              onClick={onLinkClick}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors hover:bg-black/5"
              style={{
                textDecoration: 'none',
                background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
                color: active ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <node.icon size={14} />
              {node.label}
            </Link>
          );
        }

        if (node.t === 'section') {
          return (
            <div key={node.label} className={collapsed ? 'contents' : ''} style={!collapsed ? { marginTop: i > 0 ? 12 : 4 } : {}}>
              {!collapsed && (
                <div className="px-3 pb-1 pt-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  {node.label}
                </div>
              )}
              {collapsed && i > 0 && (
                <div className="w-6 my-1 border-t self-center" style={{ borderColor: 'var(--border)' }} />
              )}
              <div className={`flex flex-col ${collapsed ? 'items-center gap-1' : 'gap-0.5'}`}>
                {node.children.map(child =>
                  child.t === 'group' ? renderGroup(child) : renderLeaf(child),
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </nav>
  );
}

// ─── SidebarFooter ───────────────────────────────────────────────────────────

const APPEARANCE_OPTIONS: { id: AppearanceMode; icon: React.FC<{ size?: number }>; label: string }[] = [
  { id: 'light',  icon: FaSun,     label: 'Sáng' },
  { id: 'system', icon: FaDesktop, label: 'Tự động' },
  { id: 'dark',   icon: FaMoon,    label: 'Tối' },
];

export function ProfilePopup({
  onClose,
  user,
  initials,
  theme,
  appearance,
  resolvedAppearance,
  setTheme,
  setAppearance,
  placement = 'sidebar',
}: {
  onClose: () => void;
  user: { name?: string | null; email?: string | null; image?: string | null } | undefined;
  initials: string;
  theme: ThemeId;
  appearance: AppearanceMode;
  resolvedAppearance: 'light' | 'dark';
  setTheme: (id: ThemeId) => void;
  setAppearance: (mode: AppearanceMode) => void;
  placement?: 'sidebar' | 'header';
}) {
  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-popup]') && !target.closest('[data-profile-trigger]')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const posClass = placement === 'header'
    ? 'rounded-xl shadow-xl overflow-hidden'
    : 'absolute bottom-full left-2 right-2 mb-2 rounded-xl shadow-xl overflow-hidden z-50';

  return (
    <div
      data-profile-popup
      className={posClass}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* ── Profile header ─────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          {user?.image
            ? <img src={user.image} alt={user?.name ?? ''} width={36} height={36} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {user?.name ?? 'Admin'}
          </div>
          {user?.email && (
            <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
          )}
        </div>
      </div>

      {/* ── Appearance ─────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Giao diện
        </div>
        <div className="flex gap-1.5">
          {APPEARANCE_OPTIONS.map(opt => {
            const active = appearance === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAppearance(opt.id)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <opt.icon size={13} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Theme ──────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Màu sắc
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {THEMES.map(t => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all truncate"
                style={{
                  border: `1.5px solid ${active ? t.preview.primary : 'var(--border)'}`,
                  background: active ? `color-mix(in srgb, ${t.preview.primary} 10%, transparent)` : 'transparent',
                  color: active ? t.preview.primary : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                title={t.name}
              >
                <span style={{ fontSize: 12, flexShrink: 0 }}>{t.emoji}</span>
                <span className="truncate">{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sign out ───────────────────────────────────── */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--bg-muted)]"
        style={{ border: 'none', cursor: 'pointer', color: 'var(--admin-danger, #DC2626)', background: 'transparent', textAlign: 'left' }}
      >
        <FaRightFromBracket size={13} />
        Đăng xuất
      </button>
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { data: session } = useSession();
  const { theme, appearance, resolvedAppearance, setTheme, setAppearance } = useTheme();
  const [popupOpen, setPopupOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const popupProps = { user, initials, theme, appearance, resolvedAppearance, setTheme, setAppearance, onClose: () => setPopupOpen(false) };

  // ── Collapsed mode ────────────────────────────────────
  if (collapsed) {
    return (
      <div className="relative flex-shrink-0 flex flex-col items-center gap-2 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {popupOpen && (
          <div className="absolute left-full bottom-0 ml-2 w-64">
            <ProfilePopup {...popupProps} />
          </div>
        )}
        <Tooltip label={user?.name ?? 'Admin'}>
          <button
            data-profile-trigger
            onClick={() => setPopupOpen(p => !p)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {user?.image
              ? <img src={user.image} alt={user?.name ?? ''} width={32} height={32} className="w-full h-full object-cover" />
              : initials}
          </button>
        </Tooltip>
      </div>
    );
  }

  // ── Expanded mode ─────────────────────────────────────
  return (
    <div className="relative flex-shrink-0 border-t" style={{ borderColor: 'var(--border)' }}>

      {/* Popup floats above the profile bar */}
      {popupOpen && <ProfilePopup {...popupProps} />}

      {/* Profile bar */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          {user?.image
            ? <img src={user.image} alt={user?.name ?? ''} width={28} height={28} className="w-full h-full object-cover" />
            : initials}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {user?.name ?? 'Admin'}
          </div>
          {user?.email && (
            <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
          )}
        </div>

        {/* "···" trigger button */}
        <button
          data-profile-trigger
          onClick={() => setPopupOpen(p => !p)}
          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-black/5 flex-shrink-0"
          style={{
            border: 'none', cursor: 'pointer',
            color: popupOpen ? 'var(--primary)' : 'var(--text-muted)',
            background: popupOpen ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
          }}
          aria-label="Profile & settings"
        >
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>···</span>
        </button>
      </div>
    </div>
  );
}


// ─── Public component ────────────────────────────────────────────────────────

interface AdminAppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile open (overlay mode) */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminAppSidebar({
  collapsed, onToggleCollapse, mobileOpen, onMobileClose,
}: AdminAppSidebarProps) {
  const width = collapsed ? 56 : 228;

  // Single <aside> handles both desktop (inline flex item) and mobile (fixed overlay).
  // On mobile:   fixed inset-y-0, slides in/out via translate-x.
  // On desktop:  md:relative + md:h-full → back in the flex flow, always visible.
  return (
    <aside
      data-slot="sidebar"
      className={[
        // Mobile: fixed overlay
        'fixed inset-y-0 left-0 z-50',
        // Desktop: inline in the flex row
        'md:relative md:inset-auto md:z-auto md:h-full',
        // Common layout
        'flex flex-col flex-shrink-0 overflow-hidden',
        // Animate width (desktop collapse) + slide (mobile open/close)
        'transition-[width,transform] duration-200 ease-in-out',
        // Mobile slideshow; desktop always visible
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
      style={{
        width,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── SidebarHeader ────────────────────────────────────────── */}
      <div
        className="flex items-center flex-shrink-0 h-16 border-b"
        style={{
          borderColor: 'var(--border)',
          padding: collapsed ? '0 8px' : '0 12px',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <Link
            href="/admin"
            className="font-extrabold tracking-tight truncate"
            style={{ fontSize: 15, color: 'var(--primary)', textDecoration: 'none', letterSpacing: -0.3 }}
          >
            ⚙️ Admin
          </Link>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-7 h-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)] flex-shrink-0"
          style={{ color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaAnglesLeft
            size={11}
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          />
        </button>
        {/* Mobile close ✕ */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--bg-muted)] transition-colors"
            style={{ color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
            aria-label="Close sidebar"
          >
            <FaXmark size={13} />
          </button>
        )}
      </div>

      {/* ── SidebarContent ───────────────────────────────────────── */}
      <Suspense>
        <SidebarNav collapsed={collapsed} onLinkClick={mobileOpen ? onMobileClose : undefined} />
      </Suspense>

      {/* ── SidebarFooter ────────────────────────────────────────── */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
