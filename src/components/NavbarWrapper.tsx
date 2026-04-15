/**
 * Server component wrapper that fetches nav config from DB (cached)
 * and passes it to the client Navbar component.
 * This avoids any client-side fetch overhead — nav config is baked in at SSR time.
 */
import { Navbar } from '@/components/Navbar';
import { getNavConfig } from '@/lib/nav-config';

export async function NavbarWrapper() {
  let navConfig;
  try {
    // Fetch all langs upfront so the client has the full dataset when switching langs
    const [ja, zh, pmp] = await Promise.all([
      getNavConfig('ja'),
      getNavConfig('zh'),
      getNavConfig('pmp'),
    ]);
    navConfig = [...ja, ...zh, ...pmp];
  } catch {
    // Fall back to hardcoded if DB not available (first deploy, etc.)
    navConfig = undefined;
  }

  return <Navbar navConfig={navConfig} />;
}
