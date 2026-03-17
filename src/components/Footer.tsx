'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaArrowRight, FaBookOpen, FaChartLine, FaLayerGroup, FaNewspaper, FaStar } from 'react-icons/fa6';

const VALID_LANGS = ['ja', 'zh', 'ko', 'vi', 'en'];

interface FooterConfig {
  logoChar: string;
  brand: string;
  tagline: string;
  heroTitle: string;
  heroDesc: string;
  brandDesc: string;
  brandMark: string;
  quote: string;
  examLabel: string;
  pills: { label: string; icon: typeof FaStar }[];
  levels: { label: string; code: string }[];
}

const CONFIGS: Record<string, FooterConfig> = {
  ja: {
    logoChar: '日',
    brand: 'JLPT Luyện Thi',
    tagline: '日本語',
    heroTitle: 'Học tiếng Nhật có lộ trình rõ ràng, luyện thi sát đề và theo dõi tiến bộ mỗi ngày.',
    heroDesc: 'Từ nền tảng N5 đến mục tiêu N1, kết hợp bài học, đề thi thử, flashcards và đọc hiểu trong cùng một trải nghiệm.',
    brandDesc: 'Hệ thống học tiếng Nhật online miễn phí. Chinh phục JLPT N5~N1 theo từng bước.',
    brandMark: '日本語',
    quote: '知識への投資は最高の利益をもたらす',
    examLabel: 'Đề thi thử JLPT',
    pills: [
      { label: 'N5-N1', icon: FaStar },
      { label: 'Flashcards', icon: FaLayerGroup },
      { label: 'Mock Tests', icon: FaChartLine },
    ],
    levels: [
      { label: 'Học N5', code: 'N5' }, { label: 'Học N4', code: 'N4' },
      { label: 'Học N3', code: 'N3' }, { label: 'Học N2', code: 'N2' },
      { label: 'Học N1', code: 'N1' },
    ],
  },
  zh: {
    logoChar: '中',
    brand: 'HSK Luyện Thi',
    tagline: '汉语',
    heroTitle: 'Học tiếng Trung có lộ trình rõ ràng, luyện thi sát đề HSK và theo dõi tiến bộ mỗi ngày.',
    heroDesc: 'Từ HSK1 cơ bản đến HSK6 thành thạo, kết hợp bài học, đề thi thử, flashcards và đọc hiểu.',
    brandDesc: 'Hệ thống học tiếng Trung online miễn phí. Chinh phục HSK 1~6 theo từng bước.',
    brandMark: '汉语',
    quote: '学而时习之，不亦说乎',
    examLabel: 'Đề thi thử HSK',
    pills: [
      { label: 'HSK 1-6', icon: FaStar },
      { label: 'Flashcards', icon: FaLayerGroup },
      { label: 'Mock Tests', icon: FaChartLine },
    ],
    levels: [
      { label: 'Học HSK1', code: 'HSK1' }, { label: 'Học HSK2', code: 'HSK2' },
      { label: 'Học HSK3', code: 'HSK3' }, { label: 'Học HSK4', code: 'HSK4' },
      { label: 'Học HSK5', code: 'HSK5' }, { label: 'Học HSK6', code: 'HSK6' },
    ],
  },
  ko: {
    logoChar: '한',
    brand: 'TOPIK Luyện Thi',
    tagline: '한국어',
    heroTitle: 'Học tiếng Hàn có lộ trình rõ ràng, luyện thi sát đề TOPIK và theo dõi tiến bộ mỗi ngày.',
    heroDesc: 'Từ TOPIK 1 cơ bản đến TOPIK 6 thành thạo, kết hợp bài học, đề thi thử, flashcards và đọc hiểu.',
    brandDesc: 'Hệ thống học tiếng Hàn online miễn phí. Chinh phục TOPIK I & II theo từng bước.',
    brandMark: '한국어',
    quote: '배움에는 끝이 없다',
    examLabel: 'Đề thi thử TOPIK',
    pills: [
      { label: 'TOPIK I-II', icon: FaStar },
      { label: 'Flashcards', icon: FaLayerGroup },
      { label: 'Mock Tests', icon: FaChartLine },
    ],
    levels: [
      { label: 'Học TOPIK1', code: 'TOPIK1' }, { label: 'Học TOPIK2', code: 'TOPIK2' },
      { label: 'Học TOPIK3', code: 'TOPIK3' }, { label: 'Học TOPIK4', code: 'TOPIK4' },
      { label: 'Học TOPIK5', code: 'TOPIK5' }, { label: 'Học TOPIK6', code: 'TOPIK6' },
    ],
  },
};

export function Footer() {
  const pathname = usePathname();
  const seg = pathname.split('/')[1];
  const lang = VALID_LANGS.includes(seg) ? seg : 'ja';
  const cfg = CONFIGS[lang] ?? CONFIGS.ja;
  const p = (path: string) => `/${lang}${path}`;
  const year = new Date().getFullYear();

  const links = {
    'Lộ trình học': cfg.levels.map(l => ({ label: l.label, href: p(`/learn/${l.code}`) })),
    'Khám phá': [
      { label: cfg.examLabel, href: p('/levels') },
      { label: 'Flashcards', href: p('/flashcards') },
      { label: 'Đọc hiểu', href: p('/reading') },
      { label: 'Tiến trình', href: '/dashboard' },
    ],
    'Tài khoản': [
      { label: 'Đăng nhập', href: '/auth/login' },
      { label: 'Đăng ký miễn phí', href: '/auth/register' },
      { label: 'Từ vựng đã lưu', href: '/vocab' },
    ],
  };

  const supportActions = [
    { label: 'Bắt đầu học ngay', href: p('/learn'), icon: FaBookOpen },
    { label: cfg.examLabel, href: p('/levels'), icon: FaChartLine },
    { label: 'Đọc hiểu mỗi ngày', href: p('/reading'), icon: FaNewspaper },
  ];

  return (
    <footer className="site-footer">
      <div className="mx-auto px-4 py-10 md:py-12 w-full" style={{ maxWidth: 'var(--page-max-w)' }}>
        <div className="site-footer-hero mb-8 md:mb-10">
          <div className="grid lg:grid-cols-[1.3fr_.9fr] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-base font-bold"
                  style={{ background: 'var(--primary)' }}>{cfg.logoChar}</span>
                <span className="font-bold site-footer-title text-base">{cfg.brand}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight site-footer-title max-w-xl">
                {cfg.heroTitle}
              </h2>
              <p className="text-sm mt-3 max-w-2xl site-footer-brand-copy leading-relaxed">
                {cfg.heroDesc}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {cfg.pills.map((pill) => (
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
                Bắt đầu nhanh từ các lối vào chính. Học, thi thử hoặc đọc hiểu — mọi thứ chỉ một cú click.
              </p>
              <div className="space-y-2">
                {supportActions.map((action) => (
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
                <Link href="/auth/register" className="btn-primary text-xs py-2 px-3.5 rounded-2xl">Tạo tài khoản</Link>
                <Link href={p('/learn')} className="btn-secondary text-xs py-2 px-3.5 rounded-2xl">Bắt đầu học</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-base font-bold"
                style={{ background: 'var(--primary)' }}>{cfg.logoChar}</span>
              <span className="font-bold site-footer-title">{cfg.brand}</span>
            </div>
            <p className="text-xs leading-relaxed site-footer-brand-copy">
              {cfg.brandDesc}
            </p>
            <div className="mt-4 text-2xl font-black site-footer-mark font-japanese leading-none">
              {cfg.brandMark}
            </div>
            <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--footer-text-soft)' }}>
              Tối ưu cho người học tự luyện với giao diện nhẹ, tiến trình rõ ràng và khả năng học liên tục trên mọi thiết bị.
            </p>
          </div>

          {Object.entries(links).map(([section, sLinks]) => (
            <div key={section}>
              <h3 className="site-footer-title font-semibold text-sm mb-3">{section}</h3>
              <ul className="space-y-2">
                {sLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="site-footer-link text-xs inline-flex">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--footer-text-soft)' }}>© {year} {cfg.brand}. Miễn phí cho người học.</p>
          <p className="text-xs font-japanese" style={{ color: 'var(--footer-text-soft)' }}>{cfg.quote}</p>
        </div>
      </div>
    </footer>
  );
}
