import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';

export default function LangPage({ params }: { params: { lang: string } }) {
  if (params.lang === 'en') redirect('/pmp');
  return <LandingPage lang={params.lang} />;
}
