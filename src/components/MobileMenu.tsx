'use client';
import React, { useEffect, useRef } from 'react';
import { getLocaleHref } from '@/utils/localeRoute';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FaXmark } from 'react-icons/fa6';
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

export function MobileMenu({
  open, onClose, currentLang, currentLocale, subjects, primaryLinks, exploreLinks,
  isActive, session, profileLinks, appearanceOptions, appearance, setAppearance,
}: MobileMenuProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const locale = currentLocale || 'vi';

  return (
    /* Full-screen overlay — panel drops from top */
    <div className="lg:hidden fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel slides down from top */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 top-0 flex flex-col rounded-b-3xl overflow-hidden"
        style={{
          maxHeight: '90dvh',
          background: 'var(--bg-surface)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}
      >
        {/* Sheet header */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Menu</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
            aria-label="Đóng menu"
          >
            <FaXmark size={13} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 flex flex-col gap-5">

            {/* ── Môn học ── */}
            <section>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2.5 px-0.5"
                style={{ color: 'var(--text-muted)' }}>Môn học</div>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map(sub => (
                  <Link key={sub.id} href={getLocaleHref(sub.href, locale)} onClick={onClose}
                    className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl font-semibold transition-all text-center active:scale-95"
                    style={currentLang === sub.id
                      ? { background: sub.color, color: '#fff', boxShadow: `0 4px 16px ${sub.color}66` }
                      : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                    <span className="text-2xl leading-none">{sub.flag}</span>
                    <span className="text-[11px] leading-tight">{sub.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Nav chính: 2 cột ── */}
            <section>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2.5 px-0.5"
                style={{ color: 'var(--text-muted)' }}>Tính năng</div>
              <div className="grid grid-cols-2 gap-2">
                {primaryLinks.map(link => (
                  <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
                    className="flex items-center gap-2.5 px-3.5 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-95"
                    style={isActive(link.href)
                      ? { background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--primary) 25%, transparent)' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    <link.icon size={15} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Khám phá ── */}
            {exploreLinks.length > 0 && (
              <section>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2 px-0.5"
                  style={{ color: 'var(--text-muted)' }}>Khám phá</div>
                <div className="flex flex-col gap-0.5">
                  {exploreLinks.map(link => (
                    <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] transition-all hover:bg-[var(--bg-muted)] active:bg-[var(--bg-muted)]"
                      style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                      <link.icon size={14} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Giao diện ── */}
            <section className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2.5 px-0.5"
                style={{ color: 'var(--text-muted)' }}>Giao diện</div>
              <div className="grid grid-cols-3 gap-2">
                {appearanceOptions.map(option => (
                  <button key={option.id} type="button" onClick={() => setAppearance(option.id)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-semibold transition-all active:scale-95"
                    style={appearance === option.id
                      ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 40%, transparent)' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                    <option.icon size={15} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Profile / Auth ── */}
            <section className="pb-safe">
              {session ? (
                <div className="rounded-2xl border p-3.5" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'var(--primary)' }}>
                      {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 mb-2">
                    <Link href={getLocaleHref('/dashboard', locale)} onClick={onClose}
                      className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] transition-all hover:bg-[var(--bg-muted)]"
                      style={isActive('/dashboard') ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                      Hồ sơ & tiến trình
                    </Link>
                    {profileLinks.map(link => (
                      <Link key={link.href} href={getLocaleHref(link.href, locale)} onClick={onClose}
                        className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] transition-all hover:bg-[var(--bg-muted)]"
                        style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                        <link.icon size={13} />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <button onClick={onClose} type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] transition-all hover:bg-[var(--bg-muted)]"
                    style={{ color: 'var(--text-muted)' }}>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <Link href="/auth/login" onClick={onClose}
                    className="flex-1 text-center py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-95"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                    Đăng nhập
                  </Link>
                  <Link href="/auth/register" onClick={onClose}
                    className="flex-1 text-center py-3 rounded-2xl text-[13px] font-bold text-white transition-all active:scale-95"
                    style={{ background: 'var(--primary)', boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 40%, transparent)' }}>
                    Đăng ký
                  </Link>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* Pull indicator at bottom */}
        <div className="shrink-0 flex justify-center py-3">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>
      </div>
    </div>
  );
}
