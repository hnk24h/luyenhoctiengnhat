'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBookOpen, FaPencil, FaChartBar, FaGear, FaLayerGroup, FaNewspaper, FaBookmark, FaBars, FaXmark, FaDesktop, FaMoon, FaSun, FaCompass, FaChevronDown, FaArrowRight, FaUser, FaHeadphones, FaGraduationCap, FaComments, FaShuffle } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { useTheme, type AppearanceMode } from '@/context/ThemeContext';

type NavLink = { href: string; label: string; icon: IconType; authRequired?: boolean };

// ── ISO-coded nav links ─────────────────────────────────────────────────────

const JLPT_NAV_LINKS: NavLink[] = [
  { href: '/ja/learn',     label: 'Cấp độ',    icon: FaBookOpen },
  { href: '/ja/levels',    label: 'Luyện thi',  icon: FaPencil },
  { href: '/ja/listening', label: 'Luyện nghe', icon: FaHeadphones },
  { href: '/ja/vocab',     label: 'Từ vựng',    icon: FaBookmark },
  { href: '/ja/practice',  label: 'Flashcard',  icon: FaLayerGroup, authRequired: true },
  { href: '/ja/reading',   label: 'Đọc hiểu',   icon: FaNewspaper },
  { href: '/dashboard',    label: 'Tiến trình', icon: FaChartBar,   authRequired: true },
];

const CHINESE_NAV_LINKS: NavLink[] = [
  { href: '/zh/learn',     label: 'Cấp độ',    icon: FaBookOpen },
  { href: '/zh/levels',    label: 'Luyện thi',  icon: FaPencil },
  { href: '/zh/listening', label: 'Luyện nghe', icon: FaHeadphones },
  { href: '/zh/vocab',     label: 'Từ vựng',    icon: FaBookmark },
  { href: '/zh/practice',  label: 'Flashcard',  icon: FaLayerGroup, authRequired: true },
  { href: '/zh/reading',   label: 'Đọc hiểu',   icon: FaNewspaper },
  { href: '/zh/grammar',   label: 'Ngữ pháp',   icon: FaCompass },
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

const KNOWN_LANGS = new Set(['ja', 'zh', 'ko', 'vi', 'en']);

type LevelMeta = { code: string; label: string; desc: string; color: string };
const LANG_LEVELS: Record<string, LevelMeta[]> = {
  ja: [
    { code: 'N5', label: 'N5', desc: 'Sơ cấp',       color: '#15803D' },
    { code: 'N4', label: 'N4', desc: 'Sơ trung cấp', color: '#1D4ED8' },
    { code: 'N3', label: 'N3', desc: 'Trung cấp',    color: '#92400E' },
    { code: 'N2', label: 'N2', desc: 'Trung cao cấp',color: '#C2410C' },
    { code: 'N1', label: 'N1', desc: 'Cao cấp',      color: '#BE123C' },
  ],
  zh: [
    { code: 'HSK1', label: 'HSK 1', desc: 'Nhập môn',     color: '#15803D' },
    { code: 'HSK2', label: 'HSK 2', desc: 'Cơ bản',        color: '#1D4ED8' },
    { code: 'HSK3', label: 'HSK 3', desc: 'Sơ trung cấp',  color: '#92400E' },
    { code: 'HSK4', label: 'HSK 4', desc: 'Trung cấp',     color: '#C2410C' },
    { code: 'HSK5', label: 'HSK 5', desc: 'Trung cao cấp', color: '#EA580C' },
    { code: 'HSK6', label: 'HSK 6', desc: 'Cao cấp',       color: '#BE123C' },
  ],
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam' | null>(null);
  const { appearance, resolvedAppearance, setAppearance } = useTheme();
  const navMenuRef = useRef<HTMLElement | null>(null);

  const modulesOpen    = openMenu === 'modules';
  const exploreOpen    = openMenu === 'explore';
  const appearanceOpen = openMenu === 'appearance';
  const profileOpen    = openMenu === 'profile';
  const learnOpen      = openMenu === 'learn';
  const listeningOpen  = openMenu === 'listening';
  const vocabOpen      = openMenu === 'vocab';
  const examOpen       = openMenu === 'exam';

  function toggleMenu(name: 'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam') {
    setOpenMenu(prev => (prev === name ? null : name));
  }

  // Detect current language from the first URL segment (ISO 639-1)
  const langSegment = pathname.split('/')[1] ?? '';
  const currentLang = KNOWN_LANGS.has(langSegment) ? langSegment : 'ja';
  const currentSubjectMeta = SUBJECTS.find(s => s.id === currentLang) ?? SUBJECTS[0];

  const activeNavLinks: NavLink[] = currentLang === 'zh' ? CHINESE_NAV_LINKS
    : currentLang === 'en' ? PMP_NAV_LINKS
    : JLPT_NAV_LINKS;

  const isAdmin = (session?.user as any)?.role === 'admin';

  const isActive = useMemo(
    () => (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname]
  );

  const visibleLinks = activeNavLinks.filter(l => !l.authRequired || session);
  const profileLinks: { href: string; label: string; icon: IconType }[] = [
    // ...(session ? [{ href: '/dashboard', label: 'Tiến trình', icon: FaPencil }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: FaGear }] : []),
  ];
  const primaryLinks = useMemo(() => {
    if (currentLang === 'en') return visibleLinks;
    const primaryHrefs = new Set([
      `/${currentLang}/learn`,
      `/${currentLang}/levels`,
      `/${currentLang}/listening`,
      `/${currentLang}/vocab`,
    ]);
    return visibleLinks.filter(l => primaryHrefs.has(l.href));
  }, [visibleLinks, currentLang]);
  const exploreLinks = useMemo(
    () => visibleLinks.filter(link => !primaryLinks.some(primary => primary.href === link.href)),
    [primaryLinks, visibleLinks]
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
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header ref={navMenuRef}
        style={{ background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', borderBottom: '1px solid var(--border)' }}
        className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="mx-auto px-4 sm:px-6 w-full" style={{ maxWidth: 'var(--page-max-w)' }}>
          <div className="flex h-14 items-center gap-3">

            {/* ── Logo + language switcher ── */}
            <div className="flex items-center gap-1 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: currentSubjectMeta.color }}>
                  {currentLang === 'ja' ? '日' : currentLang === 'zh' ? '中' : '📊'}
                </span>
                <span className="hidden sm:flex flex-col leading-none gap-0.5">
                  <span className="font-bold text-[13px] tracking-tight" style={{ color: 'var(--text-primary)' }}>LuyệnThi</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{currentSubjectMeta.flag} {currentSubjectMeta.label}</span>
                </span>
              </Link>
              {/* Language switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => toggleMenu('modules')}
                  aria-expanded={modulesOpen}
                  aria-haspopup="true"
                  className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:bg-[var(--bg-muted)] ml-0.5"
                  style={{ color: modulesOpen ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <FaChevronDown size={9} style={{ transform: modulesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                </button>
                {modulesOpen && (
                  <div className="absolute top-full mt-2 left-0 w-64 rounded-2xl border p-2 shadow-xl z-50"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Chọn môn học</div>
                    {SUBJECTS.map(sub => (
                      <Link key={sub.id} href={sub.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-lg">{sub.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sub.label}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.desc}</div>
                        </div>
                        {currentLang === sub.id && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sub.color }} />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Desktop navigation ── */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {primaryLinks.map(link => {
                const active = isActive(link.href);
                const isLearnLink     = link.href === `/${currentLang}/learn`;
                const isListeningLink = link.href === `/${currentLang}/listening`;
                const isVocabLink     = link.href === `/${currentLang}/vocab`;
                const isExamLink      = link.href === `/${currentLang}/levels`;
                const levels = LANG_LEVELS[currentLang];

                const activeStyle   = { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', fontWeight: 600 } as const;
                const inactiveStyle = { color: 'var(--text-secondary)' } as const;

                if (isVocabLink) {
                  const vocabBase = `/${currentLang}/vocab`;
                  const vocabActive = pathname.startsWith(vocabBase);
                  const VOCAB_SUBMENU = [
                    { href: `${vocabBase}?tab=reference`, label: 'Theo cấp độ', icon: FaBookOpen },
                    { href: `${vocabBase}?tab=topics`,    label: 'Theo chủ đề',  icon: FaLayerGroup },
                    { href: `${vocabBase}?tab=mine`,      label: 'Của tôi',       icon: FaBookmark },
                  ];
                  return (
                    <div key={link.href} className="relative">
                      <button
                        onClick={() => toggleMenu('vocab')}
                        aria-expanded={vocabOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={vocabOpen || vocabActive ? activeStyle : inactiveStyle}>
                        <link.icon size={13} />
                        <span>Từ vựng</span>
                        <FaChevronDown size={9} style={{ transform: vocabOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                      </button>
                      {vocabOpen && (
                        <div className="absolute top-full mt-2 left-0 w-52 rounded-2xl border p-2 shadow-xl z-50"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          {VOCAB_SUBMENU.map(item => (
                            <Link key={item.href} href={item.href}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                              style={{ color: 'var(--text-secondary)' }}>
                              <span className="flex items-center gap-2.5">
                                <item.icon size={13} />
                                <span>{item.label}</span>
                              </span>
                              <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                if (isListeningLink) {
                  const listeningBase = `/${currentLang}/listening`;
                  const listeningActive = pathname.startsWith(listeningBase);
                  const LISTENING_SUBMENU = [
                    { href: listeningBase,                    label: 'Nghe theo giáo trình', icon: FaGraduationCap, mode: '' },
                    { href: `${listeningBase}?mode=dialogue`, label: 'Nghe hội thoại',       icon: FaComments,      mode: 'dialogue' },
                    { href: `${listeningBase}?mode=random`,   label: 'Nghe ngẫu nhiên',      icon: FaShuffle,       mode: 'random' },
                  ];
                  return (
                    <div key={link.href} className="relative">
                      <button
                        onClick={() => toggleMenu('listening')}
                        aria-expanded={listeningOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={listeningOpen || listeningActive ? activeStyle : inactiveStyle}>
                        <FaHeadphones size={13} />
                        <span>Luyện nghe</span>
                        <FaChevronDown size={9} style={{ transform: listeningOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                      </button>
                      {listeningOpen && (
                        <div className="absolute top-full mt-2 left-0 w-56 rounded-2xl border p-2 shadow-xl z-50"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          {LISTENING_SUBMENU.map(item => {
                            const itemActive = item.mode === '' ? pathname === listeningBase : false;
                            return (
                              <Link key={item.href} href={item.href}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                                style={itemActive
                                  ? { color: 'var(--primary)', fontWeight: 600 }
                                  : { color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-2.5">
                                  <item.icon size={13} />
                                  <span>{item.label}</span>
                                </span>
                                <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                if (isExamLink && levels) {
                  return (
                    <div key={link.href} className="relative">
                      <button
                        onClick={() => toggleMenu('exam')}
                        aria-expanded={examOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={examOpen || pathname.startsWith(`/${currentLang}/levels`) ? activeStyle : inactiveStyle}>
                        <link.icon size={13} />
                        <span>Luyện thi</span>
                        <FaChevronDown size={9} style={{ transform: examOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                      </button>
                      {examOpen && (
                        <div className="absolute top-full mt-2 left-0 w-52 rounded-2xl border p-2 shadow-xl z-50"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Chọn cấp độ</div>
                          {levels.map(level => {
                            const levelHref = `/${currentLang}/levels/${level.code}`;
                            const levelActive = isActive(levelHref);
                            return (
                              <Link key={level.code} href={levelHref}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                                style={levelActive
                                  ? { color: 'var(--primary)', fontWeight: 600 }
                                  : { color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg text-white min-w-[36px] text-center" style={{ background: level.color }}>{level.label}</span>
                                  <span>{level.desc}</span>
                                </span>
                                <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                              </Link>
                            );
                          })}
                          <Link href={`/${currentLang}/levels`}
                            className="flex items-center justify-center gap-2 mt-1.5 pt-1.5 border-t px-3 py-1.5 text-xs font-medium transition-all hover:bg-[var(--bg-muted)] rounded-xl"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            Xem tổng quan
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }
                if (isLearnLink && levels) {
                  return (
                    <div key={link.href} className="relative">
                      <button
                        onClick={() => toggleMenu('learn')}
                        aria-expanded={learnOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={learnOpen || pathname.startsWith(`/${currentLang}/learn/`) ? activeStyle : inactiveStyle}>
                        <link.icon size={13} />
                        <span>{link.label}</span>
                        <FaChevronDown size={9} style={{ transform: learnOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                      </button>
                      {learnOpen && (
                        <div className="absolute top-full mt-2 left-0 w-52 rounded-2xl border p-2 shadow-xl z-50"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Chọn cấp độ</div>
                          {levels.map(level => {
                            const levelHref = `/${currentLang}/learn/${level.code}`;
                            const levelActive = isActive(levelHref);
                            return (
                              <Link key={level.code} href={levelHref}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                                style={levelActive
                                  ? { color: 'var(--primary)', fontWeight: 600 }
                                  : { color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg text-white min-w-[36px] text-center" style={{ background: level.color }}>{level.label}</span>
                                  <span>{level.desc}</span>
                                </span>
                                <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                              </Link>
                            );
                          })}
                          <Link href={`/${currentLang}/learn`}
                            className="flex items-center justify-center gap-2 mt-1.5 pt-1.5 border-t px-3 py-1.5 text-xs font-medium transition-all hover:bg-[var(--bg-muted)] rounded-xl"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            Xem tổng quan
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                    style={active ? activeStyle : inactiveStyle}>
                    <link.icon size={13} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {exploreLinks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => toggleMenu('explore')}
                    aria-expanded={exploreOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                    style={exploreOpen || exploreLinks.some(l => isActive(l.href))
                      ? { color: 'var(--text-primary)', fontWeight: 600 }
                      : { color: 'var(--text-secondary)' }}>
                    <FaCompass size={13} />
                    <span>Thêm</span>
                    <FaChevronDown size={9} style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                  </button>
                  {exploreOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 rounded-2xl border p-2 shadow-xl z-50"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      {exploreLinks.map(link => {
                        const active = isActive(link.href);
                        return (
                          <Link key={link.href} href={link.href}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                            style={active
                              ? { color: 'var(--primary)', fontWeight: 600 }
                              : { color: 'var(--text-secondary)' }}>
                            <span className="flex items-center gap-2.5">
                              <link.icon size={13} />
                              <span>{link.label}</span>
                            </span>
                            <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
              {/* Theme toggle */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => toggleMenu('appearance')}
                  aria-expanded={appearanceOpen}
                  aria-haspopup="true"
                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-[var(--bg-muted)]"
                  style={{ color: appearanceOpen ? 'var(--primary)' : 'var(--text-muted)' }}
                  aria-label="Đổi giao diện">
                  {currentAppearanceIcon({ size: 15 })}
                </button>
                {appearanceOpen && (
                  <div className="absolute top-full mt-2 right-0 w-44 rounded-2xl border p-2 shadow-xl z-50"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    {appearanceOptions.map(option => (
                      <button key={option.id} onClick={() => setAppearance(option.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={appearance === option.id
                          ? { color: 'var(--primary)', fontWeight: 600 }
                          : { color: 'var(--text-secondary)' }}>
                        <option.icon size={14} />
                        <span>{option.label}</span>
                        {appearance === option.id && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {session ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => toggleMenu('profile')}
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-[var(--bg-muted)]"
                    style={{ color: profileOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--primary)' }}>
                      {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                    <span className="hidden lg:block text-sm font-medium max-w-[90px] truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</span>
                    <FaChevronDown size={10} style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
                  </button>
                  {profileOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 rounded-2xl border p-2 shadow-xl z-50"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1 border-b" style={{ borderColor: 'var(--border)' }}>
                        <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'var(--primary)' }}>
                          {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</div>
                        </div>
                      </div>
                      <Link href="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={isActive('/dashboard') ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-secondary)' }}>
                        <FaChartBar size={13} />
                        <span>Tiến trình</span>
                      </Link>
                      {profileLinks.map(link => (
                        <Link key={link.href} href={link.href}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                          style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-secondary)' }}>
                          <link.icon size={13} />
                          <span>{link.label}</span>
                        </Link>
                      ))}
                      <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                        <button onClick={() => signOut()}
                          className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                          style={{ color: 'var(--text-muted)' }}>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="hidden md:inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-muted)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    Đăng nhập
                  </Link>
                  <Link href="/auth/register"
                    className="hidden md:inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)' }}>
                    Đăng ký
                  </Link>
                </>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                style={{
                  color: mobileOpen ? 'var(--primary)' : 'var(--text-primary)',
                  background: mobileOpen ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
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
            <div className="mx-auto px-4 py-4 flex flex-col gap-4 w-full" style={{ maxWidth: 'var(--page-max-w)' }}>
              {/* Module switcher */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Môn học</div>
                <div className="grid grid-cols-3 gap-2">
                  {SUBJECTS.map(sub => (
                    <Link key={sub.id} href={sub.href} onClick={() => setMobileOpen(false)}
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

              <div className="grid grid-cols-2 gap-2">
                {primaryLinks.map(link => {
                  const active = isActive(link.href);
                  const isLearnLink     = link.href === `/${currentLang}/learn`;
                  const isListeningLink = link.href === `/${currentLang}/listening`;
                  const isVocabLink     = link.href === `/${currentLang}/vocab`;
                  const isExamLink      = link.href === `/${currentLang}/levels`;
                  const levels = LANG_LEVELS[currentLang];
                  if (isVocabLink) {
                    const vocabBase = `/${currentLang}/vocab`;
                    const VOCAB_SUBMENU = [
                      { href: `${vocabBase}?tab=reference`, label: 'Theo cấp độ', icon: FaBookOpen },
                      { href: `${vocabBase}?tab=topics`,    label: 'Theo chủ đề',  icon: FaLayerGroup },
                      { href: `${vocabBase}?tab=mine`,      label: 'Của tôi',       icon: FaBookmark },
                    ];
                    return (
                      <div key={link.href} className="col-span-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Từ vựng</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {VOCAB_SUBMENU.map(item => (
                            <Link key={item.href} href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all text-center"
                              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                              <item.icon size={15} />
                              <span className="leading-tight">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (isListeningLink) {
                    const listeningBase = `/${currentLang}/listening`;
                    const LISTENING_SUBMENU = [
                      { href: listeningBase,                    label: 'Giáo trình', icon: FaGraduationCap },
                      { href: `${listeningBase}?mode=dialogue`, label: 'Hội thoại',  icon: FaComments },
                      { href: `${listeningBase}?mode=random`,   label: 'Ngẫu nhiên', icon: FaShuffle },
                    ];
                    return (
                      <div key={link.href} className="col-span-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Luyện nghe</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {LISTENING_SUBMENU.map(item => (
                            <Link key={item.href} href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all text-center"
                              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                              <item.icon size={15} />
                              <span className="leading-tight">{item.label.replace('Nghe ', '')}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (isExamLink && levels) {
                    return (
                      <div key={link.href} className="col-span-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Luyện thi</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {levels.map(level => {
                            const levelHref = `/${currentLang}/levels/${level.code}`;
                            const levelActive = isActive(levelHref);
                            return (
                              <Link key={level.code} href={levelHref} onClick={() => setMobileOpen(false)}
                                className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                                style={levelActive
                                  ? { background: level.color, color: '#fff' }
                                  : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                                <span>{level.label}</span>
                                <span className="font-normal text-[10px] opacity-70">{level.desc}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (isLearnLink && levels) {
                    return (
                      <div key={link.href} className="col-span-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Cấp độ</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {levels.map(level => {
                            const levelHref = `/${currentLang}/learn/${level.code}`;
                            const levelActive = isActive(levelHref);
                            return (
                              <Link key={level.code} href={levelHref} onClick={() => setMobileOpen(false)}
                                className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                                style={levelActive
                                  ? { background: level.color, color: '#fff' }
                                  : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                                <span>{level.label}</span>
                                <span className="font-normal text-[10px] opacity-70">{level.desc}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                      style={active
                        ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', fontWeight: 600 }
                        : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                      <link.icon size={14} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {exploreLinks.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-0.5" style={{ color: 'var(--text-muted)' }}>Khám phá</div>
                  <div className="flex flex-col gap-0.5">
                    {exploreLinks.map(link => {
                      const active = isActive(link.href);
                      return (
                        <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                          style={active ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                          <span className="flex items-center gap-3">
                            <link.icon size={14} />
                            {link.label}
                          </span>
                          <FaArrowRight size={10} style={{ opacity: 0.4 }} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

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
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={isActive('/dashboard') ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                        <FaUser size={13} />
                        Hồ sơ & tiến trình
                      </Link>
                      {profileLinks.map(link => (
                        <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                          style={isActive(link.href) ? { color: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text-primary)' }}>
                          <link.icon size={13} />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <button onClick={() => { signOut(); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                      style={{ color: 'var(--text-muted)' }}>
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-muted)]"
                      style={{ color: 'var(--text-secondary)' }}>
                      Đăng nhập
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center text-sm py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
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
