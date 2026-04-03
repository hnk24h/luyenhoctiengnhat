import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FaCompass, FaChevronDown, FaArrowRight } from 'react-icons/fa6';
import type { IconType } from 'react-icons';


type MenuName = 'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam' | 'grammar' | 'alphabet';
interface NavMenuProps {
  primaryLinks: Array<{ href: string; label: string; icon: IconType }>;
  exploreLinks: Array<{ href: string; label: string; icon: IconType }>;
  currentLang: string;
  LANG_LEVELS: Record<string, any>;
  isActive: (href: string) => boolean;
  toggleMenu: (name: MenuName) => void;
  openMenu: MenuName | null;
  currentLocale: string;
}

function NavMenuComponent({
  primaryLinks,
  exploreLinks,
  currentLang,
  LANG_LEVELS,
  isActive,
  toggleMenu,
  openMenu,
  currentLocale
}: NavMenuProps) {
  const t = useTranslations('menu');

  // Local hover state for explore submenu (hover-to-open, not click)
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverOpen(true);
  }
  function handleMouseLeave() {
    hoverTimer.current = setTimeout(() => setHoverOpen(false), 150);
  }

  const exploreIsOpen = hoverOpen || openMenu === 'explore';
  const exploreHasActive = exploreLinks.some(l => isActive(`/${currentLocale}${l.href}`));

  return (
    <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
      {primaryLinks.map(link => {
        const href = `/${currentLocale}${link.href}`;
        const active = isActive(href);
        return (
          <Link key={link.href} href={href}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all hover:bg-[var(--bg-muted)]"
            style={active
              ? { background: 'color-mix(in srgb, var(--primary) 9%, var(--bg-muted))', color: 'var(--primary)', fontWeight: 600 }
              : { color: 'var(--text-secondary)' }}>
            <link.icon size={14} />
            <span>{t(link.label)}</span>
            {active && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{ width: '60%', background: 'var(--primary)' }} />
            )}
          </Link>
        );
      })}

      {exploreLinks.length > 0 && (
        <div className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <button
            aria-expanded={exploreIsOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all hover:bg-[var(--bg-muted)]"
            style={exploreIsOpen || exploreHasActive
              ? { background: 'color-mix(in srgb, var(--primary) 9%, var(--bg-muted))', color: 'var(--primary)', fontWeight: 600 }
              : { color: 'var(--text-secondary)' }}>
            <FaCompass size={14} />
            <span>{t('explore')}</span>
            <FaChevronDown size={9} style={{ transform: exploreIsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
          </button>
          {exploreIsOpen && (
            <div className="absolute top-full mt-1 right-0 w-56 rounded-2xl border p-2 shadow-xl z-50"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
              {exploreLinks.map(link => {
                const href = `/${currentLocale}${link.href}`;
                const active = isActive(href);
                return (
                  <Link key={link.href} href={href}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
                    style={active
                      ? { color: 'var(--primary)', fontWeight: 600 }
                      : { color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-2.5">
                      <link.icon size={13} />
                      <span>{t(link.label)}</span>
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
  );
}

export const NavMenu = React.memo(NavMenuComponent);
