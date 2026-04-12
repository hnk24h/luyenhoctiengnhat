'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { ChatBot } from './ChatBot';

/**
 * Renders Footer and ChatBot only on public (non-admin) routes.
 * Used in RootLayout so those components never appear in /admin/*.
 */
export function PublicShell() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <>
      <Footer />
      <ChatBot />
    </>
  );
}
