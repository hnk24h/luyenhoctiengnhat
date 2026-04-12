'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  FaGauge, FaBullseye, FaBook, FaBookOpen, FaNewspaper,
  FaHeadphones, FaUsers, FaUpload, FaBars, FaXmark, FaChevronDown,
  FaSeedling, FaPalette, FaWrench, FaClipboardList, FaBriefcase,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

type IconComp = React.FC<{ size?: number }>;

interface NavLeaf  { t: 'leaf';    href: string; icon: IconComp; label: string }
interface NavGroup { t: 'group';   key: string; flag?: string; icon?: IconComp; label: string; desc?: string; items: NavLeaf[] }
interface NavSection { t: 'section'; label: string; children: Array<NavGroup | NavLeaf> }
type NavNode = NavLeaf | NavSection;

// ─── Nav data (4-level: root → section → group → leaf) ───────────────────────

const NAV: NavNode[] = [
  { t: 'leaf', href: '/admin', icon: FaGauge, label: 'Dashboard' },

  {
    t: 'section', label: 'Môn học',
    children: [
      {
        t: 'group', key: 'JLPT', flag: '🇯🇵', label: 'JLPT', desc: 'N5 → N1',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=JLPT',      icon: FaBullseye,      label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=JLPT',    icon: FaBook,          label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/mock-exam?subject=JLPT',   icon: FaClipboardList, label: 'Đề thi thử' },
          { t: 'leaf', href: '/admin/learning?subject=JLPT',    icon: FaBookOpen,      label: 'Bài học' },
          { t: 'leaf', href: '/admin/reading?subject=JLPT',     icon: FaNewspaper,     label: 'Bài đọc' },
          { t: 'leaf', href: '/admin/listening?subject=JLPT',   icon: FaHeadphones,    label: 'Bài nghe' },
          { t: 'leaf', href: '/admin/import?subject=JLPT',      icon: FaUpload,        label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'HSK', flag: '🇨🇳', label: 'HSK', desc: 'HSK 1→6',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=HSK',    icon: FaBullseye,  label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=HSK',  icon: FaBook,      label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/learning?subject=HSK',  icon: FaBookOpen,  label: 'Bài học' },
          { t: 'leaf', href: '/admin/reading?subject=HSK',   icon: FaNewspaper, label: 'Bài đọc' },
          { t: 'leaf', href: '/admin/import?subject=HSK',    icon: FaUpload,    label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'BJT', flag: '💼', label: 'BJT', desc: 'J1+ → J5',
        items: [
          { t: 'leaf', href: '/admin/mock-exam?subject=BJT', icon: FaClipboardList, label: 'Đề thi thử' },
          { t: 'leaf', href: '/admin/learning?subject=BJT',  icon: FaBookOpen,      label: 'Bài học' },
          { t: 'leaf', href: '/admin/import?subject=BJT',    icon: FaUpload,        label: 'Import' },
        ],
      },
      {
        t: 'group', key: 'PMP', flag: '📋', label: 'PMP', desc: 'PMBOK',
        items: [
          { t: 'leaf', href: '/admin/levels?subject=PMP',    icon: FaBullseye,  label: 'Cấp độ' },
          { t: 'leaf', href: '/admin/examsets?subject=PMP',  icon: FaBook,      label: 'Bộ đề' },
          { t: 'leaf', href: '/admin/learning?subject=PMP',  icon: FaBookOpen,  label: 'Bài học' },
          { t: 'leaf', href: '/admin/import?subject=PMP',    icon: FaUpload,    label: 'Import' },
        ],
      },
    ],
  },

  {
    t: 'section', label: 'Hệ thống',
    children: [
      { t: 'leaf', href: '/admin/users', icon: FaUsers, label: 'Người dùng' },
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

// ─── Active detection ─────────────────────────────────────────────────────────

/** Match a leaf href (may have query) against current pathname + search string */
function leafActive(href: string, pathname: string, qs: string): boolean {
  const [p, q] = href.split('?');
  if (pathname !== p) return false;
  if (!q) return !qs;                // no query in href → only active when no qs
  return qs === q || qs.startsWith(q + '&') || qs.includes('&' + q);
}

function groupActive(group: NavGroup, pathname: string, qs: string): boolean {
  return group.items.some(l => leafActive(l.href, pathname, qs));
}

// ─── SidebarContent (wrapped in Suspense because it calls useSearchParams) ────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname  = usePathname();
  const rawSearch = useSearchParams().toString();

  const calcOpen = useCallback((): Set<string> => {
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

  // Auto-expand the active group on navigation (keep any manually opened groups too)
  useEffect(() => {
    const active = calcOpen();
    if (!active.size) return;
    setOpen(prev => { const n = new Set(prev); active.forEach(k => n.add(k)); return n; });
  }, [calcOpen]);

  const toggle = (key: string) =>
    setOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // ── Render leaf link ──────────────────────────────────────────────────────
  const renderLeaf = (leaf: NavLeaf) => {
    const active = leafActive(leaf.href, pathname, rawSearch);
    return (
      <Link key={leaf.href} href={leaf.href} onClick={onClose}
        className="hover:bg-black/5 transition-colors"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 10px', borderRadius: 7, textDecoration: 'none',
          fontSize: 12.5, fontWeight: active ? 600 : 400,
          background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
          color: active ? 'var(--primary)' : 'var(--text-secondary)',
        }}>
        <leaf.icon size={12} />
        {leaf.label}
      </Link>
    );
  };

  // ── Render accordion group ────────────────────────────────────────────────
  const renderGroup = (group: NavGroup) => {
    const active = groupActive(group, pathname, rawSearch);
    const isOpen = open.has(group.key);
    return (
      <div key={group.key}>
        <button onClick={() => toggle(group.key)}
          className="hover:bg-black/5 transition-colors w-full"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 10px', borderRadius: 8,
            background: active && !isOpen ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : undefined,
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: active ? 700 : 500,
            color: active ? 'var(--primary)' : 'var(--text-primary)',
          }}>
          {group.flag
            ? <span style={{ fontSize: 16, lineHeight: 1 }}>{group.flag}</span>
            : group.icon && <group.icon size={13} />}
          <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
          {group.desc && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>{group.desc}</span>
          )}
          <FaChevronDown size={9} style={{
            color: 'var(--text-muted)', marginLeft: 2, flexShrink: 0,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform .2s ease',
          }}/>
        </button>

        {isOpen && (
          <div style={{
            marginLeft: 14, paddingLeft: 10,
            borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 1,
            paddingTop: 2, paddingBottom: 4,
          }}>
            {group.items.map(renderLeaf)}
          </div>
        )}
      </div>
    );
  };

  // ── Aside shell ───────────────────────────────────────────────────────────
  return (
    <aside style={{
      width: 220, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '14px 16px 10px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/admin" style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', textDecoration: 'none', letterSpacing: -0.3 }}>
          ⚙️ Admin
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <FaXmark size={14} />
          </button>
        )}
      </div>

      {/* Navigation tree */}
      <nav style={{ flex: 1, padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV.map((node, i) => {
          if (node.t === 'leaf') {
            const active = pathname === node.href;
            return (
              <Link key={node.href} href={node.href} onClick={onClose}
                className="hover:bg-black/5 transition-colors"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500, marginBottom: 2,
                  background: active ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : undefined,
                  color: active ? 'var(--primary)' : 'var(--text-primary)',
                }}>
                <node.icon size={14} />
                {node.label}
              </Link>
            );
          }

          if (node.t === 'section') {
            return (
              <div key={node.label} style={{ marginTop: i > 0 ? 8 : 2 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '2px 10px 6px',
                  color: 'var(--text-muted)',
                }}>
                  {node.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {node.children.map(child =>
                    child.t === 'group' ? renderGroup(child) : renderLeaf(child)
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <Link href="/" style={{ fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Về trang chính
        </Link>
      </div>
    </aside>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <Suspense fallback={null}>
      <SidebarContent onClose={onClose} />
    </Suspense>
  );
}

// ─── Shell layout ─────────────────────────────────────────────────────────────

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Desktop sidebar — sticky, full viewport height */}
      <div className="hidden lg:block" style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div className="lg:hidden" style={{
          position: 'sticky', top: 0, zIndex: 40, padding: '10px 16px',
          borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <FaBars size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>⚙️ Admin</span>
        </div>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
