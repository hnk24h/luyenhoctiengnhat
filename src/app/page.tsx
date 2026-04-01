import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://e-learn.ikagi.site' },
};

export default function HomePage() {
  // Redirect to default locale + language so [locale]/layout wraps with Navbar
  redirect('/vi/ja');
}
