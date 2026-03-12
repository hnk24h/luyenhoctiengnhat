import type { Metadata } from 'next';
import { LandingPage } from '@/components/LandingPage';

export const metadata: Metadata = {
  alternates: { canonical: 'https://e-learn.ikagi.site' },
};

export default function HomePage() {
  return <LandingPage lang="ja" />;
}
