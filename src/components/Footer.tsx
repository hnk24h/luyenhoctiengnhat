import Link from 'next/link';
import { FaArrowRight, FaBookOpen, FaChartLine, FaLayerGroup, FaNewspaper, FaStar } from 'react-icons/fa6';

const LINKS = {
  'Lộ trình học': [
    { label: 'Học N5', href: '/learn/N5' },
    { label: 'Học N4', href: '/learn/N4' },
    { label: 'Học N3', href: '/learn/N3' },
    { label: 'Học N2', href: '/learn/N2' },
    { label: 'Học N1', href: '/learn/N1' },
  ],
  'Khám phá': [
    { label: 'Đề thi thử JLPT', href: '/levels' },
    { label: 'Flashcards', href: '/flashcards' },
    { label: 'Đọc hiểu', href: '/reading' },
    { label: 'Tiến trình', href: '/dashboard' },
  ],
  'Tài khoản': [
    { label: 'Đăng nhập', href: '/login' },
    { label: 'Đăng ký miễn phí', href: '/register' },
    { label: 'Từ vựng đã lưu', href: '/vocab' },
  ],
};

const SUPPORT_ACTIONS = [
  { label: 'Bắt đầu học ngay', href: '/learn', icon: FaBookOpen },
  { label: 'Làm đề thử JLPT', href: '/levels', icon: FaChartLine },
  { label: 'Đọc hiểu mỗi ngày', href: '/reading', icon: FaNewspaper },
];

const FEATURE_PILLS = [
  { label: 'N5-N1', icon: FaStar },
  { label: 'Flashcards', icon: FaLayerGroup },
  { label: 'Mock Tests', icon: FaChartLine },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <div className="site-footer-hero mb-8 md:mb-10">
          <div className="grid lg:grid-cols-[1.3fr_.9fr] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-base font-bold"
                  style={{ background: 'var(--primary)' }}>日</span>
                <span className="font-bold site-footer-title text-base">JLPT Luyện Thi</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight site-footer-title max-w-xl">
                Học tiếng Nhật có lộ trình rõ ràng, luyện thi sát đề và theo dõi tiến bộ mỗi ngày.
              </h2>
              <p className="text-sm mt-3 max-w-2xl site-footer-brand-copy leading-relaxed">
                Một không gian học tập gọn gàng để bạn đi từ nền tảng N5 đến mục tiêu N1, kết hợp bài học, đề thi thử,
                flashcards và đọc hiểu trong cùng một trải nghiệm.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {FEATURE_PILLS.map((pill) => (
                  <span key={pill.label} className="site-footer-pill">
                    <pill.icon size={11} />
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="site-footer-cta-card">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--footer-text-soft)' }}>
                Kết nối & hỗ trợ
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--footer-text-muted)' }}>
                Bắt đầu nhanh từ các lối vào chính của hệ thống. Phần này được thiết kế như một cụm hành động ở cuối trang,
                thay cho footer chỉ có danh sách link.
              </p>
              <div className="space-y-2">
                {SUPPORT_ACTIONS.map((action) => (
                  <Link key={action.href} href={action.href} className="site-footer-action">
                    <span className="flex items-center gap-3">
                      <span className="site-footer-action-icon">
                        <action.icon size={13} />
                      </span>
                      <span className="text-sm font-medium">{action.label}</span>
                    </span>
                    <FaArrowRight size={12} />
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href="/register" className="btn-primary text-xs py-2 px-3.5 rounded-2xl">Tạo tài khoản</Link>
                <Link href="/learn" className="btn-secondary text-xs py-2 px-3.5 rounded-2xl">Bắt đầu học</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-base font-bold"
                style={{ background: 'var(--primary)' }}>日</span>
              <span className="font-bold site-footer-title">JLPT Luyện Thi</span>
            </div>
            <p className="text-xs leading-relaxed site-footer-brand-copy">
              Hệ thống học tiếng Nhật online miễn phí.<br />
              Chinh phục JLPT N5~N1 theo từng bước.
            </p>
            <div className="mt-4 text-2xl font-black site-footer-mark font-japanese leading-none">
              日本語
            </div>
            <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--footer-text-soft)' }}>
              Tối ưu cho người học tự luyện với giao diện nhẹ, tiến trình rõ ràng và khả năng học liên tục trên mọi thiết bị.
            </p>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="site-footer-title font-semibold text-sm mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="site-footer-link text-xs inline-flex">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--footer-text-soft)' }}>© 2024 JLPT Luyện Thi. Miễn phí cho người học.</p>
          <p className="text-xs font-japanese" style={{ color: 'var(--footer-text-soft)' }}>知識への投資は最高の利益をもたらす</p>
        </div>
      </div>
    </footer>
  );
}
