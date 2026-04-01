import React from 'react';
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
  return (
    <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
      {primaryLinks.map(link => {
        const active = isActive(link.href);
        const activeStyle   = { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', fontWeight: 600 } as const;
        const inactiveStyle = { color: 'var(--text-secondary)' } as const;
        // Link dạng /vi/ja/learn
        const href = `/${currentLocale}${link.href}`;
        return (
          <Link key={link.href} href={href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
            style={active ? activeStyle : inactiveStyle}>
            <link.icon size={13} />
            <span>{t(link.label)}</span>
          </Link>
        );
      })}

      {exploreLinks.length > 0 && (
        <div className="relative">
          <button
            onClick={() => toggleMenu('explore')}
            aria-expanded={openMenu === 'explore'}
            aria-haspopup="true"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
            style={openMenu === 'explore' || exploreLinks.some(l => isActive(l.href))
              ? { color: 'var(--text-primary)', fontWeight: 600 }
              : { color: 'var(--text-secondary)' }}>
            <FaCompass size={13} />
            <span>{t('explore')}</span>
            <FaChevronDown size={9} style={{ transform: openMenu === 'explore' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
          </button>
          {openMenu === 'explore' && (
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
