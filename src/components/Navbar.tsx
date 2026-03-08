'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBookOpen, FaPencil, FaChartBar, FaGear, FaPlay, FaLayerGroup, FaNewspaper, FaBookmark, FaBars, FaXmark, FaDesktop, FaMoon, FaSun, FaCompass, FaChevronDown, FaArrowRight, FaUser, FaHeadphones, FaGlobe } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { useTheme, type AppearanceMode } from '@/context/ThemeContext';

type NavLink = { href: string; label: string; icon: IconType; authRequired?: boolean };

// ── ISO-coded nav links ─────────────────────────────────────────────────────

const JLPT_NAV_LINKS: NavLink[] = [
  { href: '/ja/learn',     label: 'Cấp độ',    icon: FaBookOpen },
  { href: '/ja/listening', label: 'Luyện nghe', icon: FaHeadphones },
  { href: '/ja/levels',    label: 'Luyện thi',  icon: FaPencil },
  { href: '/ja/practice',  label: 'Flashcard',  icon: FaLayerGroup, authRequired: true },
  { href: '/ja/reading',   label: 'Đọc hiểu',   icon: FaNewspaper },
  { href: '/ja/vocab',     label: 'Từ vựng',    icon: FaBookmark },
  { href: '/dashboard',    label: 'Tiến trình', icon: FaChartBar,   authRequired: true },
];

const CHINESE_NAV_LINKS: NavLink[] = [
  { href: '/zh',           label: 'Tổng quan',  icon: FaBookOpen },
  { href: '/zh/learn',     label: 'Cấp độ',     icon: FaCompass },
  { href: '/zh/grammar',   label: 'Ngữ pháp',   icon: FaBookOpen },
  { href: '/zh/listening', label: 'Luyện nghe', icon: FaHeadphones },
  { href: '/zh/reading',   label: 'Đọc hiểu',   icon: FaNewspaper },
  { href: '/zh/vocab',     label: 'Từ vựng',    icon: FaBookmark,  authRequired: true },
  { href: '/zh/practice',  label: 'Flashcard',  icon: FaLayerGroup, authRequired: true },
];

const PMP_NAV_LINKS: NavLink[] = [
  { href: '/en/pmp',                     label: 'Tổng quan',       icon: FaBookOpen },
  { href: '/en/pmp/knowledge-areas',     label: 'Knowledge Areas', icon: FaLayerGroup },
  { href: '/en/pmp/exam',                label: 'Luyện thi',       icon: FaPencil },
];

const SUBJECTS = [
  { id: 'ja', label: 'Tiếng Nhật',  flag: '🇯🇵', href: '/ja/learn', color: '#6C5CE7',
    desc: 'N5 → N1 · Học tiếng Nhật' },
  { id: 'zh', label: 'Tiếng Trung', flag: '🇨🇳', href: '/zh/learn',  color: '#DC2626',
    desc: 'HSK1 → HSK6 · Học tiếng Trung' },
  { id: 'en', label: 'PMP PMBOK',   flag: '📊',  href: '/en/pmp',   color: '#2B6CB0',
    desc: 'PMBOK 6th · Chứng chỉ PMP' },
] as const;

// legacy alias kept for isActive checks below
const NAV_LINKS = JLPT_NAV_LINKS;

const KNOWN_LANGS = new Set(['ja', 'zh', 'ko', 'vi', 'en']);

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const { appearance, resolvedAppearance, setAppearance } = useTheme();
  const exploreMenuRef = useRef<HTMLDivElement | null>(null);
  const appearanceMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const modulesMenuRef = useRef<HTMLDivElement | null>(null);

  // Detect current language from the first URL segment (ISO 639-1)
  const langSegment = pathname.split('/')[1] ?? '';
  const currentLang = KNOWN_LANGS.has(langSegment) ? langSegment : 'ja';
  const currentSubjectMeta = SUBJECTS.find(s => s.id === currentLang) ?? SUBJECTS[0];

  const activeNavLinks: NavLink[] = currentLang === 'zh' ? CHINESE_NAV_LINKS
    : currentLang === 'en' ? PMP_NAV_LINKS
    : JLPT_NAV_LINKS;

  const isAdmin = (session?.user as any)?.role === 'admin';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const visibleLinks = activeNavLinks.filter(l => !l.authRequired || session);
  const profileLinks: { href: string; label: string; icon: IconType }[] = [
    // ...(session ? [{ href: '/dashboard', label: 'Tiến trình', icon: FaPencil }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: FaGear }] : []),
  ];
  const primaryLinks = useMemo(
    () => visibleLinks.filter(link => {
      if (currentLang === 'ja') {
        return ['/ja/learn', '/ja/listening', '/ja/reading', '/ja/vocab', '/ja/practice'].includes(link.href);
      }
      if (currentLang === 'zh') {
        return ['/zh', '/zh/grammar', '/zh/listening', '/zh/reading', '/zh/vocab'].includes(link.href);
      }
      return true;
    }).slice(0, 5),
    [visibleLinks, currentLang]
  );
  const exploreLinks = useMemo(
    () => visibleLinks.filter(link => {
      if (currentLang === 'ja' && session && link.href === '/ja/levels') return false;
      return !primaryLinks.some(primary => primary.href === link.href);
    }),
    [primaryLinks, session, visibleLinks, currentLang]
  );
  const appearanceOptions: { id: AppearanceMode; label: string; icon: IconType }[] = [
    { id: 'light', label: 'Sáng', icon: FaSun },
    { id: 'dark', label: 'Tối', icon: FaMoon },
    { id: 'system', label: 'Hệ thống', icon: FaDesktop },
  ];
  const currentAppearanceIcon = appearance === 'system'
    ? FaDesktop
    : resolvedAppearance === 'dark'
      ? FaMoon
      : FaSun;

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setAppearanceOpen(false);
    setProfileOpen(false);
    setModulesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | PointerEvent) {
      const target = event.target as Node | null;

      if (exploreMenuRef.current && target && !exploreMenuRef.current.contains(target)) {
        setExploreOpen(false);
      }
      if (appearanceMenuRef.current && target && !appearanceMenuRef.current.contains(target)) {
        setAppearanceOpen(false);
      }
      if (profileMenuRef.current && target && !profileMenuRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (modulesMenuRef.current && target && !modulesMenuRef.current.contains(target)) {
        setModulesOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <>
      <header style={{ background: 'color-mix(in srgb, var(--bg-surface) 84%, transparent)', borderBottom: '1px solid var(--border)' }}
        className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group" onClick={() => setMobileOpen(false)}>
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl text-white text-base font-bold shadow-lg transition-transform group-hover:scale-105"
                style={{ background: currentSubjectMeta.color, boxShadow: `0 4px 14px ${currentSubjectMeta.color}55` }}>
                {currentLang === 'ja' ? '日' : currentLang === 'zh' ? '中' : '📊'}
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>Luyện Thi</span>
                <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentSubjectMeta.flag} {currentSubjectMeta.label}</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              <nav
                className="flex items-center gap-1 rounded-2xl border p-1.5 shadow-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>

                {/* Module switcher */}
                <div ref={modulesMenuRef} className="relative">
                  <button
                    onClick={() => { setModulesOpen(o => !o); setExploreOpen(false); setAppearanceOpen(false); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={modulesOpen
                      ? { background: 'var(--bg-muted)', color: 'var(--text-primary)' }
                      : { color: 'var(--text-secondary)' }}>
                    <span>{currentSubjectMeta.flag}</span>
                    <span className="hidden lg:inline">{currentSubjectMeta.label}</span>
                    <FaChevronDown size={10} style={{ transform: modulesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                  </button>
                  {modulesOpen && (
                    <div className="absolute top-[calc(100%+10px)] left-0 w-64 rounded-2xl border p-2 shadow-2xl z-50"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Chọn môn học</div>
                      {SUBJECTS.map(sub => (
                        <Link key={sub.id} href={sub.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={currentLang === sub.id
                            ? { background: 'var(--bg-muted)', color: 'var(--text-primary)', fontWeight: 700 }
                            : { color: 'var(--text-secondary)' }}>
                          <span className="text-base">{sub.flag}</span>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sub.label}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {sub.desc}
                            </div>
                          </div>
                          {currentLang === sub.id && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: sub.color }}>▶</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-5 w-px mx-1 shrink-0" style={{ background: 'var(--border)' }} />

              {primaryLinks.map(link => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                    style={active
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { color: 'var(--text-secondary)' }}>
                    <link.icon size={14} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
                <div ref={exploreMenuRef} className="relative ml-1">
                  <button
                    onClick={() => {
                      setExploreOpen(open => !open);
                      setAppearanceOpen(false);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={isActive(`/${currentLang}/reading`) || isActive(`/${currentLang}/practice`) || isActive(`/${currentLang}/vocab`) || (!session && isActive(`/${currentLang}/levels`)) || exploreOpen
                      ? { background: 'var(--bg-muted)', color: 'var(--text-primary)' }
                      : { color: 'var(--text-secondary)' }}>
                    <FaCompass size={14} />
                    <span>Khám phá</span>
                    <FaChevronDown size={11} style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                  </button>
                  {exploreOpen && (
                    <div className="absolute top-[calc(100%+10px)] left-0 w-72 rounded-2xl border p-2 shadow-2xl"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                        Điều hướng nhanh
                      </div>
                      {exploreLinks.map(link => {
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all"
                            style={active
                              ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                              : { color: 'var(--text-secondary)' }}>
                            <span className="flex items-center gap-3">
                              <link.icon size={14} />
                              <span className="text-sm font-medium">{link.label}</span>
                            </span>
                            <FaArrowRight size={11} style={{ opacity: 0.6 }} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <div ref={appearanceMenuRef} className="hidden md:block relative">
                <button
                  onClick={() => {
                    setAppearanceOpen(open => !open);
                    setExploreOpen(false);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl border transition-all"
                  style={{
                    borderColor: appearanceOpen ? 'var(--primary)' : 'var(--border)',
                    background: appearanceOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: appearanceOpen ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  aria-label="Đổi chế độ giao diện">
                  {currentAppearanceIcon({ size: 15 })}
                </button>
                {appearanceOpen && (
                  <div className="absolute top-[calc(100%+10px)] right-0 w-48 rounded-2xl border p-2 shadow-2xl"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                      Giao diện
                    </div>
                    {appearanceOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setAppearance(option.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={appearance === option.id
                          ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                          : { color: 'var(--text-secondary)' }}>
                        <option.icon size={14} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {session ? (
                <>
                  {/* <Link href="/learn"
                    className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <FaPlay size={10} /> Tiếp tục học
                  </Link> */}
                  <div ref={profileMenuRef} className="hidden lg:block relative">
                    <button
                      onClick={() => {
                        setProfileOpen(open => !open);
                        setAppearanceOpen(false);
                        setExploreOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm rounded-2xl border px-2.5 py-1.5 transition-all"
                      style={{
                        color: profileOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderColor: profileOpen ? 'var(--primary)' : 'var(--border)',
                        background: profileOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
                      }}>
                      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ background: 'var(--primary)' }}>
                        {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                      <span className="hidden 2xl:inline max-w-[100px] truncate">{session.user?.name}</span>
                      <FaChevronDown size={11} style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                    </button>
                    {profileOpen && (
                      <div className="absolute top-[calc(100%+10px)] right-0 w-60 rounded-2xl border p-2 shadow-2xl"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                        <div className="px-3 py-2 border-b mb-2" style={{ borderColor: 'var(--border)' }}>
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={isActive('/dashboard')
                            ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                            : { color: 'var(--text-secondary)' }}>
                          <FaChartBar size={14} />
                          <span>Tiến trình</span>
                        </Link>
                        {profileLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={isActive(link.href)
                              ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                              : { color: 'var(--text-secondary)' }}>
                            <link.icon size={14} />
                            <span>{link.label}</span>
                          </Link>
                        ))}
                        <button onClick={() => signOut()}
                          className="w-full mt-1 btn-secondary text-xs py-2 px-3.5 rounded-2xl justify-center">
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:inline-flex btn-ghost text-sm py-2 px-3 rounded-2xl">Đăng nhập</Link>
                  <Link href="/register"
                    className="hidden md:inline-flex text-sm py-2 px-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)', boxShadow: '0 2px 10px rgba(61,58,140,.35)' }}>
                    Đăng ký
                  </Link>
                </>
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-2xl transition-all border"
                style={{
                  color: 'var(--text-primary)',
                  background: mobileOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
                  borderColor: mobileOpen ? 'var(--primary)' : 'var(--border)',
                }}
                aria-label="Menu">
                {mobileOpen ? <FaXmark size={16} /> : <FaBars size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              {/* Mobile module switcher */}
              <div className="rounded-2xl border p-2" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Chọn môn học</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SUBJECTS.map(sub => (
                    <Link key={sub.id} href={sub.href} onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all text-center"
                      style={currentLang === sub.id
                        ? { background: sub.color, color: '#fff' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      <span className="text-base">{sub.flag}</span>
                      <span>{sub.id}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {primaryLinks.map(link => {
                  const active = isActive(link.href);
                  return (
                    <Link key={link.href} href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all"
                      style={active
                        ? { background: 'var(--primary)', color: '#fff' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                      <link.icon size={15} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  Khám phá
                </div>
                <div className="flex flex-col gap-1">
              {exploreLinks.map(link => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all"
                    style={active
                      ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                      : { color: 'var(--text-primary)' }}>
                    <span className="flex items-center gap-3">
                      <link.icon size={15} />
                      {link.label}
                    </span>
                    <FaArrowRight size={11} style={{ opacity: 0.55 }} />
                  </Link>
                );
              })}
                </div>
              </div>

              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-3 px-1">
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                    Giao diện
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {appearanceOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setAppearance(option.id)}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={appearance === option.id
                          ? { background: 'var(--primary)', color: '#fff' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                        <option.icon size={13} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {session ? (
                  <div className="rounded-2xl border px-3 py-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'var(--primary)' }}>
                        {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</div>
                        <div className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-3">
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={isActive('/dashboard')
                          ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                          : { color: 'var(--text-primary)' }}>
                        <FaUser size={15} />
                        Hồ sơ & tiến trình
                      </Link>
                      {profileLinks.map(link => (
                        <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={isActive(link.href)
                            ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                            : { color: 'var(--text-primary)' }}>
                          <link.icon size={15} />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <button onClick={() => { signOut(); setMobileOpen(false); }}
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0 w-full justify-center">
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center btn-ghost text-sm py-2.5 rounded-2xl">
                      Đăng nhập
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center text-sm py-2.5 rounded-2xl font-bold text-white transition-all"
                      style={{ background: 'var(--primary)' }}>
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
