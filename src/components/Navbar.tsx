'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-red-600 text-lg">
            <span className="text-2xl">🇯🇵</span>
            <span>JLPT Luyện Thi</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/learn" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
              Học
            </Link>
            <Link href="/levels" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
              Luyện thi
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                Tiến trình
              </Link>
            )}
            {(session?.user as any)?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                Admin
              </Link>
            )}
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{session.user?.name}</span>
                <button onClick={() => signOut()} className="btn-secondary text-xs py-1.5 px-3">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-xs py-1.5 px-3">Đăng nhập</Link>
                <Link href="/register" className="btn-primary text-xs py-1.5 px-3">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
