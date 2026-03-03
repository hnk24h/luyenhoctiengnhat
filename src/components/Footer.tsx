import Link from 'next/link';

const LINKS = {
  'Học': [
    { label: 'Học N5', href: '/learn/N5' },
    { label: 'Học N4', href: '/learn/N4' },
    { label: 'Học N3', href: '/learn/N3' },
    { label: 'Học N2', href: '/learn/N2' },
    { label: 'Học N1', href: '/learn/N1' },
  ],
  'Luyện thi': [
    { label: 'Đề thi thử JLPT', href: '/levels' },
    { label: 'Tiến trình', href: '/dashboard' },
  ],
  'Tài khoản': [
    { label: 'Đăng nhập', href: '/login' },
    { label: 'Đăng ký miễn phí', href: '/register' },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: 'var(--text-primary)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      className="text-white/70">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-base font-bold"
                style={{ background: 'var(--primary)' }}>日</span>
              <span className="font-bold text-white">JLPT Luyện Thi</span>
            </div>
            <p className="text-xs leading-relaxed text-white/50">
              Hệ thống học tiếng Nhật online miễn phí.<br />
              Chinh phục JLPT N5~N1 theo từng bước.
            </p>
            <div className="mt-4 text-2xl font-black text-white/10 font-japanese leading-none">
              日本語
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: 'inherit' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2024 JLPT Luyện Thi. Miễn phí cho người học.</p>
          <p className="text-xs text-white/20 font-japanese">知識への投資は最高の利益をもたらす</p>
        </div>
      </div>
    </footer>
  );
}
