'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FaArrowRight, FaBolt, FaBookOpen, FaCheck,
  FaChevronDown, FaClock, FaFire, FaPlus, FaSpinner,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LevelMeta {
  code: string;
  label: string;
  color: string;
  desc?: string;
}

interface LevelPreviewData {
  latestLesson: { id: string; title: string } | null;
  recentLesson: { id: string; title: string; completedAt: string | null } | null;
  dueCount: number;
  completedCount: number;
  totalCount: number;
}

interface LevelMegaMenuProps {
  /** The nav link (e.g. vocab, listening) */
  link: { href: string; icon: IconType };
  /** Full locale-prefixed href, e.g. /vi/ja/vocab */
  href: string;
  /** Whether current page is inside this link's route */
  active: boolean;
  /** Translated label */
  label: string;
  /** Levels for current lang */
  levels: LevelMeta[];
  /** e.g. 'ja' | 'zh' */
  currentLang: string;
  /** e.g. 'vi' */
  currentLocale: string;
  /** Session status */
  sessionStatus: 'authenticated' | 'loading' | 'unauthenticated';
}

// ─── Static quick-links (no login needed) ────────────────────────────────────

function staticQuickLinks(href: string, levelCode: string): Array<{ icon: React.ReactNode; label: string; sub: string; href: string }> {
  return [
    {
      icon: <FaBookOpen size={12} />,
      label: 'Bắt đầu học',
      sub: `Level ${levelCode}`,
      href: `${href}?level=${levelCode}`,
    },
    {
      icon: <FaBolt size={12} />,
      label: 'Luyện tập nhanh',
      sub: 'Flashcard & SRS',
      href: `${href.replace(/\/[^/]+$/, '/practice')}?level=${levelCode}`,
    },
    {
      icon: <FaFire size={12} />,
      label: 'Luyện nghe',
      sub: `Bài nghe ${levelCode}`,
      href: `${href.replace(/\/[^/]+$/, '/listening')}?level=${levelCode}`,
    },
  ];
}

// ─── Section extracted from href ─────────────────────────────────────────────

function sectionFromHref(href: string): string {
  const parts = href.split('/');
  return parts[parts.length - 1] ?? 'learn';
}

// ─── Dynamic panel (authenticated) ───────────────────────────────────────────

function DynamicPanel({
  href,
  levelCode,
  lang,
  locale,
  onClose,
}: {
  href: string;
  levelCode: string;
  lang: string;
  locale: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<LevelPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const section = sectionFromHref(href);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetch(`/api/nav/level-preview?lang=${lang}&level=${levelCode}&section=${section}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lang, levelCode, section]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <FaSpinner size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  const progressPct = data && data.totalCount > 0
    ? Math.round((data.completedCount / data.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-2.5">
      {/* Progress bar */}
      {data && data.totalCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              Tiến trình {levelCode}
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>
              {data.completedCount}/{data.totalCount} bài
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'var(--primary)' }}
            />
          </div>
        </div>
      )}

      {/* 3 quick action items */}
      <div className="grid grid-cols-3 gap-2">
        {/* Continue / Recent */}
        <Link
          href={data?.recentLesson ? `/${locale}/${lang}/learn/${data.recentLesson.id}` : `${href}?level=${levelCode}`}
          onClick={onClose}
          className="group flex flex-col gap-1 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: 'var(--bg-muted)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <FaClock size={10} style={{ color: 'var(--primary)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
              Tiếp tục
            </span>
          </div>
          <span className="text-[11px] font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {data?.recentLesson?.title ?? `Bắt đầu ${levelCode}`}
          </span>
          <span className="text-[10px] mt-auto" style={{ color: 'var(--text-muted)' }}>
            {data?.recentLesson?.completedAt
              ? `${Math.ceil((Date.now() - new Date(data.recentLesson.completedAt).getTime()) / 86400000)}n trước`
              : 'Chưa bắt đầu'}
          </span>
        </Link>

        {/* Latest lesson */}
        <Link
          href={data?.latestLesson ? `/${locale}/${lang}/learn/${data.latestLesson.id}` : `${href}?level=${levelCode}`}
          onClick={onClose}
          className="group flex flex-col gap-1 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: 'var(--bg-muted)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <FaPlus size={10} style={{ color: '#10B981' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#10B981' }}>
              Bài mới nhất
            </span>
          </div>
          <span className="text-[11px] font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {data?.latestLesson?.title ?? `Bài học ${levelCode}`}
          </span>
          <span className="text-[10px] mt-auto" style={{ color: 'var(--text-muted)' }}>
            {data?.totalCount ? `${data.totalCount} bài tổng cộng` : 'Xem tất cả'}
          </span>
        </Link>

        {/* Due today */}
        <Link
          href={`/${locale}/${lang}/practice?level=${levelCode}`}
          onClick={onClose}
          className="group flex flex-col gap-1 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: data?.dueCount ? 'color-mix(in srgb, #F59E0B 10%, var(--bg-muted))' : 'var(--bg-muted)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <FaBolt size={10} style={{ color: '#F59E0B' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#F59E0B' }}>
              Hôm nay
            </span>
          </div>
          <span className="text-[11px] font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {data?.dueCount ? `${data.dueCount} thẻ cần ôn` : 'Không có thẻ'}
          </span>
          <span className="text-[10px] mt-auto flex items-center gap-1" style={{ color: '#F59E0B' }}>
            {data?.dueCount ? <><FaFire size={9} /> Ôn ngay</> : <><FaCheck size={9} /> Xong rồi!</>}
          </span>
        </Link>
      </div>
    </div>
  );
}

// ─── Static panel (unauthenticated) ──────────────────────────────────────────

function StaticPanel({ href, levelCode, locale, lang, onClose }: { href: string; levelCode: string; locale: string; lang: string; onClose: () => void }) {
  const section = sectionFromHref(href);
  const items = [
    {
      icon: <FaBookOpen size={11} />,
      color: 'var(--primary)',
      bg: 'color-mix(in srgb, var(--primary) 10%, var(--bg-muted))',
      label: 'Học bài',
      sub: `Bắt đầu ${levelCode}`,
      href: `${href}?level=${levelCode}`,
    },
    {
      icon: <FaBolt size={11} />,
      color: '#10B981',
      bg: 'color-mix(in srgb, #10B981 10%, var(--bg-muted))',
      label: 'Luyện tập',
      sub: 'Flashcard SRS',
      href: `/${locale}/${lang}/practice?level=${levelCode}`,
    },
    {
      icon: <FaFire size={11} />,
      color: '#F59E0B',
      bg: 'color-mix(in srgb, #F59E0B 10%, var(--bg-muted))',
      label: 'Luyện nghe',
      sub: `Bài nghe ${levelCode}`,
      href: `/${locale}/${lang}/listening?level=${levelCode}`,
    },
  ];

  // Hide practice/listening items when already on that page
  const filtered = items.filter(item => !item.href.includes(`/${section}?`) || section === 'learn');
  const display = filtered.length >= 3 ? filtered : items;

  return (
    <div className="grid grid-cols-3 gap-2">
      {display.map(item => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="flex flex-col gap-1 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: item.bg }}
        >
          <div className="flex items-center gap-1.5 mb-0.5" style={{ color: item.color }}>
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{item.sub}</span>
          <FaArrowRight size={9} className="mt-auto" style={{ color: item.color, opacity: 0.7 }} />
        </Link>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LevelMegaMenu({
  link,
  href,
  active,
  label,
  levels,
  currentLang,
  currentLocale,
  sessionStatus,
}: LevelMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState(levels[0]?.code ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const enter = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, []);

  const leave = useCallback(() => {
    timer.current = setTimeout(() => setOpen(false), 180);
  }, []);

  // Reset active level when levels change (lang switch)
  useEffect(() => {
    setActiveLevel(levels[0]?.code ?? '');
  }, [levels]);

  if (levels.length === 0) {
    // No levels → plain link
    return (
      <Link href={href}
        className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:bg-[var(--bg-muted)] whitespace-nowrap"
        style={active
          ? { background: 'color-mix(in srgb, var(--primary) 9%, var(--bg-muted))', color: 'var(--primary)', fontWeight: 600 }
          : { color: 'var(--text-secondary)' }}>
        <link.icon size={14} />
        <span>{label}</span>
        {active && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
            style={{ width: '60%', background: 'var(--primary)' }} />
        )}
      </Link>
    );
  }

  const activeLevelMeta = levels.find(l => l.code === activeLevel) ?? levels[0];

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {/* Trigger button */}
      <Link href={href}
        className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all hover:bg-[var(--bg-muted)] whitespace-nowrap"
        style={active || open
          ? { background: 'color-mix(in srgb, var(--primary) 9%, var(--bg-muted))', color: 'var(--primary)', fontWeight: 600 }
          : { color: 'var(--text-secondary)' }}>
        <link.icon size={14} />
        <span>{label}</span>
        <FaChevronDown size={8} style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .15s ease',
          opacity: 0.45,
          marginLeft: 1,
        }} />
        {(active || open) && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
            style={{ width: '60%', background: 'var(--primary)' }} />
        )}
      </Link>

      {/* Mega dropdown */}
      {open && (
        <div
          className="absolute top-full mt-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            width: 480,
            borderColor: 'var(--border)',
            background: 'var(--bg-surface)',
          }}
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          {/* ── Header ───────────────────────────────────────────── */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <link.icon size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{label}</span>
            </div>
            <Link
              href={href}
              className="flex items-center gap-1 text-[11px] font-medium hover:underline"
              style={{ color: 'var(--primary)' }}>
              Xem tất cả <FaArrowRight size={8} />
            </Link>
          </div>

          {/* ── Level pills ──────────────────────────────────────── */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
            {levels.map(lv => {
              const isActive = lv.code === activeLevel;
              return (
                <Link
                  key={lv.code}
                  href={`${href}?level=${lv.code}`}
                  onMouseEnter={() => setActiveLevel(lv.code)}
                  onClick={() => setOpen(false)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all border"
                  style={{
                    background: isActive
                      ? `color-mix(in srgb, ${lv.color} 12%, var(--bg-muted))`
                      : 'var(--bg-muted)',
                    color: isActive ? lv.color : 'var(--text-secondary)',
                    borderColor: isActive
                      ? `color-mix(in srgb, ${lv.color} 40%, transparent)`
                      : 'transparent',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    boxShadow: isActive ? `0 2px 8px color-mix(in srgb, ${lv.color} 25%, transparent)` : 'none',
                  }}
                >
                  <span>{lv.label}</span>
                  {lv.desc && (
                    <span className="text-[9px] font-normal opacity-70">{lv.desc}</span>
                  )}
                  {/* active indicator dot */}
                  {isActive && (
                    <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: lv.color }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Panel: quick actions for active level ────────────── */}
          <div className="px-4 pb-3.5 pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              {activeLevelMeta?.desc ?? activeLevelMeta?.label} — Truy cập nhanh
            </div>

            {sessionStatus === 'authenticated' ? (
              <DynamicPanel
                key={`${activeLevel}-${sectionFromHref(href)}`}
                href={href}
                levelCode={activeLevel}
                lang={currentLang}
                locale={currentLocale}
                onClose={() => setOpen(false)}
              />
            ) : (
              <StaticPanel
                href={href}
                levelCode={activeLevel}
                locale={currentLocale}
                lang={currentLang}
                onClose={() => setOpen(false)}
              />
            )}
          </div>

          {/* ── Footer: "navigate directly" ──────────────────────── */}
          <div className="px-4 py-2 flex items-center gap-2 flex-wrap"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            {levels.map(lv => (
              <Link
                key={lv.code}
                href={`${href}?level=${lv.code}`}
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                style={{ color: lv.color, background: `color-mix(in srgb, ${lv.color} 10%, transparent)` }}
              >
                {lv.label}
              </Link>
            ))}
            <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>Click để tới thẳng cấp độ</span>
          </div>
        </div>
      )}
    </div>
  );
}
