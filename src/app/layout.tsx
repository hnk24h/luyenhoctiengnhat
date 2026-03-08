import type { Metadata } from 'next';
import { Noto_Sans_JP, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const BASE_URL = 'https://e-learn.ikagi.site';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Luyện Thi Tiếng Nhật JLPT N5~N1 — IkagiLearn',
    template: '%s | IkagiLearn',
  },
  description:
    'Hệ thống học tiếng Nhật miễn phí: từ vựng, ngữ pháp, luyện nghe-nói-đọc-viết và thi thử JLPT N5~N1 với đề sát format thật.',
  keywords: [
    'luyện thi JLPT', 'học tiếng Nhật', 'JLPT N5', 'JLPT N4', 'JLPT N3', 'JLPT N2', 'JLPT N1',
    'từ vựng tiếng Nhật', 'ngữ pháp tiếng Nhật', 'thi tiếng Nhật online',
    'Minna no Nihongo', 'Mimikara Oboeru', 'Shin Kanzen Master',
    'IkagiLearn', 'ikagi', 'e-learn tiếng Nhật',
  ],
  authors: [{ name: 'IkagiLearn', url: BASE_URL }],
  creator: 'IkagiLearn',
  publisher: 'IkagiLearn',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'IkagiLearn',
    title: 'Luyện Thi Tiếng Nhật JLPT N5~N1 — IkagiLearn',
    description:
      'Học tiếng Nhật miễn phí: từ vựng, ngữ pháp, luyện 4 kỹ năng và thi thử JLPT N5~N1.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IkagiLearn — Luyện Thi Tiếng Nhật JLPT',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luyện Thi Tiếng Nhật JLPT N5~N1 — IkagiLearn',
    description:
      'Học tiếng Nhật miễn phí: từ vựng, ngữ pháp, luyện 4 kỹ năng và thi thử JLPT N5~N1.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Paste your Google Search Console verification code here when you get it:
    // google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable}`} suppressHydrationWarning>
      <body className={notoSansJP.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
