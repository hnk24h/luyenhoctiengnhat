import { notFound } from 'next/navigation';
import LocaleProvider from './provider';
import { Navbar } from '@/components/Navbar';

const VALID_LOCALES = new Set(['vi', 'en']);

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!VALID_LOCALES.has(locale)) notFound();
  return (
    <LocaleProvider params={{ locale }}>
      <Navbar />
      <div className="mx-auto w-full px-4 sm:px-6 pt-4" style={{ maxWidth: 'var(--page-max-w)', background: 'var(--bg-base)' }}>
        {children}
      </div>
    </LocaleProvider>
  );
}