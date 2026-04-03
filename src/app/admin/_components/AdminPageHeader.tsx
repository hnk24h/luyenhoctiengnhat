// ─── AdminPageHeader ──────────────────────────────────────────────────────────
// Shared header for all admin pages.
// Renders: breadcrumb, icon + title, optional subtitle/count badge,
// optional subject tabs (JLPT / HSK / PMP), and optional action buttons slot.

import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';

const SUBJECTS = [
  { key: 'JLPT', flag: '🇯🇵' },
  { key: 'HSK',  flag: '🇨🇳' },
  { key: 'PMP',  flag: '📋' },
] as const;

export interface SubjectTabsConfig {
  /** Current active subject key, e.g. "JLPT". Falsy = show "Tất cả" active. */
  active: string | undefined;
  /** Base href for building tab links, e.g. "/admin/examsets" */
  baseHref: string;
  /** Include an "All" tab (Tất cả). Default false. */
  showAll?: boolean;
}

interface Props {
  /** Icon component, e.g. <FaBullseye size={18} /> */
  icon: React.ReactNode;
  /** Page title, e.g. "Cấp độ" */
  title: string;
  /** Breadcrumb trail after "Admin / ", e.g. "Quản lý cấp độ" */
  breadcrumb: string;
  /** Optional small badge text after the title, e.g. "12 cấp" */
  badge?: string;
  /** Subject tabs configuration. Omit if page doesn't use subject filter. */
  subjects?: SubjectTabsConfig;
  /** Action buttons rendered on the right side of the header. */
  actions?: React.ReactNode;
}

export default function AdminPageHeader({ icon, title, breadcrumb, badge, subjects, actions }: Props) {
  return (
    <div className="mb-6 space-y-1">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href="/admin" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
          Admin
        </Link>
        <FaChevronRight size={9} />
        <span>{breadcrumb}</span>
      </div>

      {/* ── Title row ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (right side) */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* ── Subject tabs ── */}
      {subjects && (
        <div className="flex gap-1.5 flex-wrap pt-1">
          {subjects.showAll && (
            <Link
              href={subjects.baseHref}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={!subjects.active
                ? { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }
                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              🌐 Tất cả
            </Link>
          )}
          {SUBJECTS.map(s => (
            <Link
              key={s.key}
              href={`${subjects.baseHref}?subject=${s.key}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={subjects.active === s.key
                ? { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }
                : { background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {s.flag} {s.key}
            </Link>
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      <div style={{ borderBottom: '1px solid var(--border)', marginTop: 12 }} />
    </div>
  );
}
