import { notFound } from 'next/navigation';
import LocaleProvider from './provider';
import { Navbar } from '@/components/Navbar';

const VALID_LOCALES = new Set(['vi', 'en']);

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!VALID_LOCALES.has(params.locale)) notFound();
  return (
    <LocaleProvider params={params}>
      <Navbar />
      <div className="mx-auto w-full pt-5" style={{ maxWidth: 'var(--page-max-w)', background: 'var(--bg-base)' }}>
        {children}
      </div>
    </LocaleProvider>
  );
}