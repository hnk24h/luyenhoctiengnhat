'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaBookOpen, FaPencil, FaChartBar, FaGear, FaPlay } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

const NAV_LINKS: { href: string; label: string; icon: IconType; authRequired?: boolean }[] = [
  { href: '/learn',     label: 'Học',        icon: FaBookOpen },
  { href: '/levels',    label: 'Luyện thi',  icon: FaPencil },
  { href: '/dashboard', label: 'Tiến trình', icon: FaChartBar, authRequired: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = (session?.user as any)?.role === 'admin';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-base font-bold shadow-primary/30 shadow-lg"
              style={{ background: 'var(--primary)' }}>
              日
            </span>
            <span className="font-bold text-base hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              JLPT<span className="font-normal" style={{ color: 'var(--text-muted)' }}>&nbsp;Luyện Thi</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(link => {
              if (link.authRequired && !session) return null;
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'text-white shadow-sm'
                      : 'hover:bg-muted'
                    }`}
                  style={active
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { color: 'var(--text-secondary)' }
                  }>
                  <link.icon size={14} />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive('/admin') ? 'text-white' : ''}`}
                style={isActive('/admin')
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-muted)' }
                }>
                <FaGear size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </nav>

          {/* Auth area */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <>
                {/* Quick study link */}
                <Link href="/learn"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <FaPlay size={10} /> Tiếp tục học
                </Link>
                <span className="hidden lg:flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}>
                  <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--primary)' }}>
                    {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate">{session.user?.name}</span>
                </span>
                <button onClick={() => signOut()}
                  className="btn-secondary text-xs py-1.5 px-3">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm py-1.5 px-3">Đăng nhập</Link>
                <Link href="/register"
                  className="text-sm py-1.5 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--primary)', boxShadow: '0 2px 10px rgba(61,58,140,.35)' }}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
