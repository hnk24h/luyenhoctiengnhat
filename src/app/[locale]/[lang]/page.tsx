import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';

export default async function LangPage({ params }: { params: Promise<{ locale: string; lang: string }> }) {
  const { locale, lang } = await params;
  if (lang === 'en') redirect('/pmp');
  return <LandingPage lang={lang} locale={locale} />;
}
