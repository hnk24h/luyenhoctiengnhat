import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { FaChartBar, FaChevronDown } from 'react-icons/fa6';
import type { IconType } from 'react-icons';


type MenuName = 'modules' | 'explore' | 'appearance' | 'profile' | 'learn' | 'listening' | 'vocab' | 'exam' | 'grammar' | 'alphabet';
interface ProfileDropdownProps {
  session: any;
  profileOpen: boolean;
  toggleMenu: (name: MenuName) => void;
  isActive: (href: string) => boolean;
  profileLinks: Array<{ href: string; label: string; icon: IconType }>;
  signOut: () => void;
}

export function ProfileDropdown({ session, profileOpen, toggleMenu, isActive, profileLinks, signOut }: ProfileDropdownProps) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (timer.current) clearTimeout(timer.current);
    setHoverOpen(true);
  }
  function handleMouseLeave() {
    timer.current = setTimeout(() => setHoverOpen(false), 150);
  }

  const isOpen = hoverOpen || profileOpen;

  if (!session) {
    return (
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
    );
  }
  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-[var(--bg-muted)]"
        style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--primary)' }}>
          {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
        </span>
        <span className="hidden lg:block text-sm font-medium max-w-[90px] truncate" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</span>
        <FaChevronDown size={10} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-56 rounded-2xl border p-2 shadow-xl z-50"
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
            <button onClick={signOut}
              className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)]"
              style={{ color: 'var(--text-muted)' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
