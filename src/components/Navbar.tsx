'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { DropdownMenu } from './DropdownMenu';
import { MobileMenu } from './MobileMenu';
import { NavMenu } from './NavMenu';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';
import { useSession, signOut } from 'next-auth/react';
import { FaBookOpen, FaPencil, FaChartBar, FaGear, FaLayerGroup, FaNewspaper, FaBookmark, FaBars, FaXmark, FaDesktop, FaMoon, FaSun, FaCompass, FaChevronDown, FaArrowRight, FaUser, FaHeadphones, FaGraduationCap, FaComments, FaShuffle, FaFont, FaStar, FaBolt, FaRegLightbulb } from 'react-icons/fa6';
// ── Reusable MenuItem component ─────────────────────────────────────────────
type MenuItemProps = {
  href: string;
  label: string;
  icon?: IconType;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};
const MenuItem = ({ href, label, icon: Icon, active, onClick, className }: MenuItemProps) => (
  <Link href={href}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)] ${active ? 'bg-[var(--bg-muted)] font-semibold text-[var(--primary)]' : 'text-[var(--text-secondary)]'} ${className || ''}`}
    style={active ? { color: 'var(--primary)', fontWeight: 600 } : {}}
    onClick={onClick}
    tabIndex={0}
    aria-current={active ? 'page' : undefined}
  >
    <span className="flex items-center gap-2.5">
      {Icon && <Icon size={13} />}
      <span>{label}</span>
    </span>
    <FaArrowRight size={10} style={{ opacity: 0.4 }}/>
  </Link>
);
import type { IconType } from 'react-icons';
import { useTheme, type AppearanceMode } from '@/context/ThemeContext';
import { LogoMark } from '@/components/Logo';

type NavLink = { href: string; label: string; icon: IconType; authRequired?: boolean };

// ── ISO-coded nav links ─────────────────────────────────────────────────────


const JLPT_NAV_LINKS: NavLink[] = [
  { href: '/ja/learn',     label: 'learn',       icon: FaBookOpen },
  { href: '/ja/vocab',     label: 'vocab',      icon: FaBookmark },
  { href: '/ja/listening', label: 'listening',   icon: FaHeadphones },
  { href: '/ja/grammar',   label: 'grammar',     icon: FaCompass },
  { href: '/ja/practice',  label: 'practice',  icon: FaLayerGroup },
  { href: '/ja/reading',   label: 'reading',   icon: FaNewspaper },
  { href: '/dashboard',    label: 'dashboard', icon: FaChartBar },
  { href: '/ja/levels',    label: 'exam',    icon: FaPencil },
];

const CHINESE_NAV_LINKS: NavLink[] = [
  { href: '/zh/alphabet',  label: 'alphabet', icon: FaFont },
  { href: '/zh/learn',     label: 'learn',    icon: FaBookOpen },
  { href: '/zh/levels',    label: 'exam',  icon: FaPencil },
  { href: '/zh/listening', label: 'listening', icon: FaHeadphones },
  { href: '/zh/vocab',     label: 'vocab',    icon: FaBookmark },
  { href: '/zh/practice',  label: 'practice',  icon: FaLayerGroup },
  { href: '/zh/reading',   label: 'reading',   icon: FaNewspaper },
  { href: '/zh/grammar',   label: 'grammar',     icon: FaCompass },
];

const PMP_NAV_LINKS: NavLink[] = [
  { href: '/pmp',                     label: 'home',       icon: FaBookOpen },
  { href: '/pmp/knowledge-areas',     label: 'practice', icon: FaLayerGroup },
  { href: '/pmp/exam',                label: 'exam',       icon: FaPencil },
];

const SUBJECTS = [
  { id: 'ja', label: 'ja',  flag: '🇯🇵', href: '/ja', color: '#6C5CE7',
    desc: 'subjectJaDesc' },
  { id: 'zh', label: 'zh', flag: '🇨🇳', href: '/zh',  color: '#DC2626',
    desc: 'subjectZhDesc' },
  { id: 'pmp', label: 'pmp',   flag: '📊',  href: '/pmp',   color: '#2B6CB0',
    desc: 'subjectPmpDesc' },
] as const;

const KNOWN_LANGS = new Set(['ja', 'zh', 'ko', 'vi', 'en']);

type LevelMeta = { code: string; label: string; desc: string; color: string };
const LANG_LEVELS: Record<string, LevelMeta[]> = {
  ja: [
    { code: 'N5', label: 'N5', desc: 'levelN5',       color: '#15803D' },
    { code: 'N4', label: 'N4', desc: 'levelN4', color: '#1D4ED8' },
    { code: 'N3', label: 'N3', desc: 'levelN3',    color: '#92400E' },
    { code: 'N2', label: 'N2', desc: 'levelN2',color: '#C2410C' },
    { code: 'N1', label: 'N1', desc: 'levelN1',      color: '#BE123C' },
  ],
  zh: [
    { code: 'HSK1', label: 'HSK 1', desc: 'levelHSK1',     color: '#15803D' },
    { code: 'HSK2', label: 'HSK 2', desc: 'levelHSK2',        color: '#1D4ED8' },
    { code: 'HSK3', label: 'HSK 3', desc: 'levelHSK3',  color: '#92400E' },
    { code: 'HSK4', label: 'HSK 4', desc: 'levelHSK4',     color: '#C2410C' },
    { code: 'HSK5', label: 'HSK 5', desc: 'levelHSK5', color: '#EA580C' },
    { code: 'HSK6', label: 'HSK 6', desc: 'levelHSK6',       color: '#BE123C' },
  ],
};

export function Navbar() {
  const t = useTranslations('menu');
    function handleLogout() {
      signOut();
    }
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam' | 'grammar' | 'alphabet' | null>(null);
  const { appearance, resolvedAppearance, setAppearance } = useTheme();
  const navMenuRef = useRef<HTMLElement | null>(null);

  // Subject switcher hover
  const [subjectHoverOpen, setSubjectHoverOpen] = useState(false);
  const subjectHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSubjectEnter() {
    if (subjectHoverTimer.current) clearTimeout(subjectHoverTimer.current);
    setSubjectHoverOpen(true);
  }
  function handleSubjectLeave() {
    subjectHoverTimer.current = setTimeout(() => setSubjectHoverOpen(false), 150);
  }

  const modulesOpen    = subjectHoverOpen;
  const exploreOpen    = openMenu === 'explore';
  const appearanceOpen = openMenu === 'appearance';
  const profileOpen    = openMenu === 'profile';
  const learnOpen      = openMenu === 'learn';
  const listeningOpen  = openMenu === 'listening';
  const vocabOpen      = openMenu === 'vocab';
  const examOpen       = openMenu === 'exam';
  const grammarOpen    = openMenu === 'grammar';
  const alphabetOpen   = openMenu === 'alphabet';

  type MenuName = 'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam' | 'grammar' | 'alphabet';
  function toggleMenu(name: MenuName) {
    setOpenMenu(prev => (prev === name ? null : name));
  }

  // SSR-safe: Extract locale and learning language from URL prefix only
  const segments = pathname.split('/');
  const locale = segments[1] && ["vi", "en"].includes(segments[1]) ? segments[1] : 'vi';
  const langSegment = segments[2] && KNOWN_LANGS.has(segments[2]) ? segments[2] : 'ja';
  const currentLang = langSegment;
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
    ...(isAdmin ? [{ href: '/admin', label: t('profile'), icon: FaGear }] : []),
  ];
  const primaryLinks = useMemo(() => {
    if (currentLang === 'en') return visibleLinks;
    const primaryHrefs = new Set([
      `/${currentLang}/vocab`,
      `/${currentLang}/learn`,
      `/${currentLang}/levels`,
      `/${currentLang}/practice`,
      `/${currentLang}/listening`,
      `/${currentLang}/grammar`,
    ]);
    return visibleLinks.filter(l => primaryHrefs.has(l.href));
  }, [visibleLinks, currentLang]);

  const exploreLinks = useMemo(
    () => visibleLinks.filter(link => !primaryLinks.some(primary => primary.href === link.href)),
    [primaryLinks, visibleLinks]
  );
  const appearanceOptions: { id: AppearanceMode; label: string; icon: IconType }[] = [
    { id: 'light', label: t('appearance_light'), icon: FaSun },
    { id: 'dark', label: t('appearance_dark'), icon: FaMoon },
    { id: 'system', label: t('appearance_system'), icon: FaDesktop },
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
        className="sticky top-0 z-50"
        style={{
          background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
        } as React.CSSProperties}>
        <div className="mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ maxWidth: 'var(--page-max-w)' }}>
          <div className="flex h-[60px] items-center gap-5">

            {/* ── Logo + subject switcher ── */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
                <span className="transition-transform group-hover:scale-105">
                  <LogoMark size={34} />
                </span>
                <span className="hidden sm:block font-bold text-[14px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  IkagiLearn
                </span>
              </Link>

              {/* Divider */}
              <span className="hidden sm:block w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />

              {/* Subject switcher pill */}
              <div className="relative" onMouseEnter={handleSubjectEnter} onMouseLeave={handleSubjectLeave}>
                <button
                  aria-label="Switch subject"
                  aria-expanded={modulesOpen}
                  className="hidden sm:flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-[11px] font-semibold transition-all border active:scale-95"
                  style={{
                    background: modulesOpen
                      ? `color-mix(in srgb, ${currentSubjectMeta.color} 12%, var(--bg-muted))`
                      : 'var(--bg-muted)',
                    color: currentSubjectMeta.color,
                    borderColor: modulesOpen
                      ? `color-mix(in srgb, ${currentSubjectMeta.color} 35%, transparent)`
                      : 'var(--border)',
                  }}>
                  <span className="text-sm leading-none">{currentSubjectMeta.flag}</span>
                  <span>{t(currentSubjectMeta.label)}</span>
                  <FaChevronDown size={8} style={{ transform: modulesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease', opacity: 0.6 }} />
                </button>
                {modulesOpen && (
                  <div className="absolute top-full mt-1 left-0 w-64 rounded-2xl border p-2 shadow-xl z-50"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>{t('modules')}</div>
                    {SUBJECTS.map(sub => (
                      <Link key={sub.id} href={`/${locale}${sub.href}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={() => setSubjectHoverOpen(false)}>
                        <span className="text-lg">{sub.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t(sub.label)}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t(sub.desc)}</div>
                        </div>
                        {currentLang === sub.id && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sub.color }} />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Desktop navigation ── */}
            <NavMenu
              primaryLinks={primaryLinks}
              exploreLinks={exploreLinks}
              currentLang={currentLang}
              LANG_LEVELS={LANG_LEVELS}
              isActive={isActive}
              toggleMenu={toggleMenu}
              openMenu={openMenu}
              currentLocale={locale}
            />

            {/* ── Right controls ── */}
            <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
              {/* Language switcher */}
              <LanguageSwitcher
                currentLocale={locale}
                onSwitch={(newLocale) => {
                  const segs = pathname.split('/');
                  if (["vi", "en"].includes(segs[1])) {
                    segs[1] = newLocale;
                  } else {
                    segs.splice(1, 0, newLocale);
                  }
                  router.push(segs.join('/').replace(/^\/\//, '/'));
                }}
              />
              {/* Theme toggle */}
              <ThemeToggle appearance={appearance} resolvedAppearance={resolvedAppearance} setAppearance={setAppearance} />
              <ProfileDropdown
                session={session}
                profileOpen={profileOpen}
                toggleMenu={toggleMenu}
                isActive={isActive}
                profileLinks={profileLinks}
                signOut={handleLogout}
              />

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                style={{
                  color: mobileOpen ? 'var(--primary)' : 'var(--text-primary)',
                  background: mobileOpen ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                }}
                aria-label="Menu"
                aria-expanded={mobileOpen}>
                {mobileOpen ? <FaXmark size={16} /> : <FaBars size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay — rendered outside header so position:fixed works correctly */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentLang={currentLang}
        currentLocale={locale}
        subjects={SUBJECTS.map(sub => ({
          ...sub,
          label: t(sub.label),
          desc: t(sub.desc)
        }))}
        primaryLinks={primaryLinks.map(link => ({ ...link, label: t(link.label) }))}
        exploreLinks={exploreLinks.map(link => ({ ...link, label: t(link.label) }))}
        isActive={isActive}
        LANG_LEVELS={Object.fromEntries(Object.entries(LANG_LEVELS).map(([lang, levels]) => [lang, levels.map(lv => ({ ...lv, desc: t(lv.desc) }))]))}
        session={session}
        profileLinks={profileLinks.map(link => ({ ...link, label: t(link.label) }))}
        appearanceOptions={appearanceOptions.map(opt => ({ ...opt, label: t(opt.label) }))}
        appearance={appearance}
        setAppearance={setAppearance}
      />
    </>
  );
}
