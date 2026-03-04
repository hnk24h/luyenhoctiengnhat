'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBookOpen, FaPencil, FaChartBar, FaGear, FaPlay, FaLayerGroup, FaNewspaper, FaBookmark, FaBars, FaXmark } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

const NAV_LINKS: { href: string; label: string; icon: IconType; authRequired?: boolean }[] = [
  { href: '/learn',      label: 'Học',        icon: FaBookOpen },
  { href: '/levels',     label: 'Luyện thi',  icon: FaPencil },
  { href: '/flashcards', label: 'Flashcard',  icon: FaLayerGroup, authRequired: true },
  { href: '/reading',    label: 'Đọc hiểu',   icon: FaNewspaper },
  { href: '/vocab',      label: 'Từ vựng',    icon: FaBookmark,   authRequired: true },
  { href: '/dashboard',  label: 'Tiến trình', icon: FaChartBar, authRequired: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const visibleLinks = NAV_LINKS.filter(l => !l.authRequired || session);

  return (
    <>
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
        className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group" onClick={() => setMobileOpen(false)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-base font-bold shadow-primary/30 shadow-lg"
                style={{ background: 'var(--primary)' }}>
                日
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                JLPT<span className="font-normal" style={{ color: 'var(--text-muted)' }}>&nbsp;Luyện Thi</span>
              </span>
            </Link>

            {/* Desktop nav links — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {visibleLinks.map(link => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${active ? 'text-white shadow-sm' : 'hover:bg-muted'}`}
                    style={active
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { color: 'var(--text-secondary)' }}>
                    <link.icon size={14} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive('/admin') ? 'text-white' : ''}`}
                  style={isActive('/admin')
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { color: 'var(--text-muted)' }}>
                  <FaGear size={14} />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {session ? (
                <>
                  <Link href="/learn"
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <FaPlay size={10} /> Tiếp tục học
                  </Link>
                  <span className="hidden md:flex items-center gap-1.5 text-sm"
                    style={{ color: 'var(--text-secondary)' }}>
                    <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--primary)' }}>
                      {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                    <span className="hidden xl:inline max-w-[100px] truncate">{session.user?.name}</span>
                  </span>
                  <button onClick={() => signOut()}
                    className="hidden md:inline-flex btn-secondary text-xs py-1.5 px-3">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:inline-flex btn-ghost text-sm py-1.5 px-3">Đăng nhập</Link>
                  <Link href="/register"
                    className="hidden md:inline-flex text-sm py-1.5 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)', boxShadow: '0 2px 10px rgba(61,58,140,.35)' }}>
                    Đăng ký
                  </Link>
                </>
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all"
                style={{ color: 'var(--text-base)', background: mobileOpen ? 'var(--primary-light)' : 'transparent' }}
                aria-label="Menu">
                {mobileOpen ? <FaXmark size={16} /> : <FaBars size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {visibleLinks.map(link => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={active
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { color: 'var(--text-base)' }}>
                    <link.icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={isActive('/admin')
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { color: 'var(--text-muted)' }}>
                  <FaGear size={15} />
                  Admin
                </Link>
              )}

              <div className="border-t mt-1 pt-2" style={{ borderColor: 'var(--border)' }}>
                {session ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'var(--primary)' }}>
                        {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                      <span className="truncate max-w-[160px]">{session.user?.name}</span>
                    </span>
                    <button onClick={() => { signOut(); setMobileOpen(false); }}
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0">
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center btn-ghost text-sm py-2">
                      Đăng nhập
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center text-sm py-2 rounded-xl font-bold text-white transition-all"
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
