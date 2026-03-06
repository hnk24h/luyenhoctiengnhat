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

export const metadata: Metadata = {
  title: 'Luyện Thi Tiếng Nhật JLPT',
  description: 'Hệ thống học và luyện thi tiếng Nhật theo cấp độ N5~N1',
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
