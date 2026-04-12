'use client';

import React, { createContext, useContext, useState, useCallback, Suspense, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { FaBars, FaMagnifyingGlass, FaBell, FaSun, FaMoon, FaTableColumns } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import { useTheme, THEMES, type AppearanceMode, type ThemeId } from '@/context/ThemeContext';
import { AdminAppSidebar, ProfilePopup } from './AdminAppSidebar';

// ─── Sidebar context ──────────────────────────────────────────────────────────

interface SidebarCtx {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  toggleMobile: () => {},
});
export const useSidebar = () => useContext(SidebarContext);

// ─── Breadcrumb (needs Suspense for useSearchParams) ─────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
  admin:     'Admin',
  users:     'Quản lý người dùng',
  levels:    'Cấp độ',
  examsets:  'Bộ đề',
  'mock-exam': 'Đề thi thử',
  learning:  'Bài học',
  reading:   'Bài đọc',
  listening: 'Bài nghe',
  import:    'Import',
  seed:      'Seed dữ liệu',
  theme:     'Theme',
  normalize: 'Chuẩn hóa data',
  'user-access': 'Phân quyền',
};

function BreadcrumbInner() {
  const pathname = usePathname();
  const qs = useSearchParams().get('subject');

  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  if (qs) crumbs[crumbs.length - 1] = {
    ...crumbs[crumbs.length - 1],
    label: `${crumbs[crumbs.length - 1].label} — ${qs}`,
  };

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0">
      {crumbs.map((c, i) => (
        <React.Fragment key={c.href}>
          {i > 0 && (
            <span className="text-[var(--text-muted)] flex-shrink-0 select-none">›</span>
          )}
          <span
            className={`truncate ${c.isLast ? 'font-medium' : ''}`}
            style={{ color: c.isLast ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {c.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}

function Breadcrumb() {
  return (
    <Suspense fallback={<span className="text-sm" style={{ color: 'var(--text-muted)' }}>Admin</span>}>
      <BreadcrumbInner />
    </Suspense>
  );
}

// ─── SidebarInset header ──────────────────────────────────────────────────────

function AdminHeader() {
  const { toggle, toggleMobile } = useSidebar();
  const { data: session } = useSession();
  const { theme, appearance, resolvedAppearance, setTheme, setAppearance } = useTheme();
  const [search, setSearch] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; right: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const handleAvatarClick = () => {
    if (!popupOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setPopupOpen(p => !p);
  };

  const popupProps = {
    user, initials,
    theme: theme as ThemeId,
    appearance: appearance as AppearanceMode,
    resolvedAppearance,
    setTheme, setAppearance,
    onClose: () => setPopupOpen(false),
  };

  return (
    <>
      <header
      className="flex items-center gap-3 flex-shrink-0 border-b px-4 sticky top-0 z-10"
      style={{ height: 64, borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* ── Left: sidebar toggles ───────────────────────────────── */}
      {/* Desktop collapse toggle */}
      <button
        onClick={toggle}
        className="hidden md:flex w-8 h-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
        style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        aria-label="Toggle sidebar"
      >
        <FaTableColumns size={14} />
      </button>
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
        style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        aria-label="Open menu"
      >
        <FaBars size={14} />
      </button>

      {/* ── Center: search ─────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-2 rounded-lg px-3 h-9 cursor-text"
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', width: 240 }}
        onClick={() => inputRef.current?.focus()}
      >
        <FaMagnifyingGlass size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="flex-1 bg-transparent text-[13px] outline-none"
          style={{ color: 'var(--text-primary)', caretColor: 'var(--primary)' }}
        />
        <kbd
          className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono rounded px-1 py-0.5"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ── Spacer — pushes right actions to the far right ─────── */}
      <div className="flex-1" />

      {/* ── Right: action icons ────────────────────────────────── */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Notification bell */}
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
          style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Thông báo"
        >
          <FaBell size={14} />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#EF4444' }}
          />
        </button>

        {/* Dark / light toggle */}
        <button
          onClick={() => setAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-muted)]"
          style={{ border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Chuyển giao diện"
        >
          {resolvedAppearance === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
        </button>

        {/* User avatar — click opens profile popup (portal) */}
        <button
          ref={avatarRef}
          data-profile-trigger
          onClick={handleAvatarClick}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden flex-shrink-0 ml-1 transition-opacity hover:opacity-80"
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', padding: 0 }}
          title={user?.name ?? 'Admin'}
          aria-label="Cài đặt tài khoản"
        >
          {user?.image
            ? <img src={user.image} alt={user.name ?? ''} className="w-full h-full object-cover" />
            : initials}
        </button>
      </div>
    </header>

    {/* ── Portal: popup renders at body level to escape stacking ctx ── */}
    {popupOpen && popupPos && createPortal(
      <div
        style={{
          position: 'fixed',
          top: popupPos.top,
          right: popupPos.right,
          zIndex: 9999,
          width: 288,
        }}
      >
        <ProfilePopup {...popupProps} placement="header" />
      </div>,
      document.body
    )}
    </>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  // Initialise from localStorage (SSR-safe: window is undefined on server)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('admin-sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setCollapsed(prev => {
    const next = !prev;
    try { localStorage.setItem('admin-sidebar-collapsed', String(next)); } catch {}
    return next;
  }), []);
  const toggleMobile = useCallback(() => setMobileOpen(p => !p), []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, mobileOpen, toggleMobile }}>
      {/* SidebarProvider wrapper */}
      <div data-slot="sidebar-wrapper" className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-muted)' }}>

        {/* ── Mobile overlay backdrop ───────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={toggleMobile}
            aria-hidden
          />
        )}

        {/* ── AppSidebar ────────────────────────────────────────── */}
        <AdminAppSidebar
          collapsed={collapsed}
          onToggleCollapse={toggle}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* ── SidebarInset ─────────────────────────────────────── */}
        <main data-slot="sidebar-inset" className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Header (inside SidebarInset) */}
          <AdminHeader />

          {/* Main scrollable content */}
          <div className="flex-1 overflow-auto p-3">
            {children}
          </div>

        </main>
      </div>
    </SidebarContext.Provider>
  );
}
