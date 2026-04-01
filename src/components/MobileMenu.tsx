import React from 'react';
import { getLocaleHref } from '@/utils/localeRoute';
import Link from 'next/link';
import type { IconType } from 'react-icons';

import type { AppearanceMode } from '@/context/ThemeContext';
interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  currentLang: string;
  currentLocale: string;
  subjects: ReadonlyArray<{ id: string; label: string; flag: string; href: string; color: string }>;
  primaryLinks: Array<{ href: string; label: string; icon: IconType }>;
  exploreLinks: Array<{ href: string; label: string; icon: IconType }>;
  isActive: (href: string) => boolean;
  LANG_LEVELS: Record<string, any>;
  session: any;
  profileLinks: Array<{ href: string; label: string; icon: IconType }>;
  appearanceOptions: Array<{ id: AppearanceMode; label: string; icon: IconType }>;
  appearance: AppearanceMode;
  setAppearance: (id: AppearanceMode) => void;
}

export function MobileMenu({ open, onClose, currentLang, subjects, primaryLinks, exploreLinks, isActive, LANG_LEVELS, session, profileLinks, appearanceOptions, appearance, setAppearance }: MobileMenuProps) {
  if (!open) return null;
  // Mapping route tự động theo locale — fallback to 'vi' since locale is not passed
  const locale = 'vi';
  return (
    <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
      <div className="mx-auto px-4 py-4 flex flex-col gap-4 w-full" style={{ maxWidth: 'var(--page-max-w)' }}>
        {/* Module switcher */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Môn học</div>
          <div className="grid grid-cols-3 gap-2">
            {subjects.map(sub => (
              <Link key={sub.id} href={getLocaleHref(sub.href, locale)} onClick={onClose}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all text-center"
                style={currentLang === sub.id
                  ? { background: sub.color, color: '#fff' }
                  : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                <span className="text-xl">{sub.flag}</span>
                <span className="text-[11px] leading-tight">{sub.label}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* Primary links */}
        <div className="grid grid-cols-2 gap-2">
          {primaryLinks.map(link => (
            <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all"
              style={isActive(link.href)
                ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', fontWeight: 600 }
                : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
              <link.icon size={14} />
              {link.label}
            </Link>
          ))}
        </div>
        {/* Explore links */}
        {exploreLinks.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Khám phá</div>
            <div className="flex flex-col gap-0.5">
              {exploreLinks.map(link => (
                <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                  style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                  <span className="flex items-center gap-3">
                    <link.icon size={14} />
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Appearance options */}
        <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Giao diện</div>
            <div className="grid grid-cols-3 gap-2">
              {appearanceOptions.map(option => (
                <button key={option.id} onClick={() => setAppearance(option.id)}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={appearance === option.id
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  <option.icon size={14} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Profile links */}
          {session ? (
            <div className="rounded-2xl border px-3 py-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'var(--primary)' }}>
                  {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 mb-2">
                <Link href={getLocaleHref('/dashboard', locale)} onClick={onClose}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                  style={isActive('/dashboard') ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                  <span>Hồ sơ & tiến trình</span>
                </Link>
                {profileLinks.map(link => (
                  <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                    style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                    <link.icon size={13} />
                    {link.label}
                  </Link>
                ))}
              </div>
              <button onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                style={{ color: 'var(--text-muted)' }}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login" onClick={onClose}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-muted)]"
                style={{ color: 'var(--text-secondary)' }}>
                Đăng nhập
              </Link>
              <Link href="/auth/register" onClick={onClose}
                className="flex-1 text-center text-sm py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--primary)' }}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
