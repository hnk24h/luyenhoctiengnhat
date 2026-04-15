/**
 * Server-side utility: fetch NavMenuItem rows from DB and convert to
 * the shape that Navbar / NavMenu expect.
 * Uses Next.js `unstable_cache` so menu is served from memory between requests
 * and only re-fetched after revalidateTag('nav-menu').
 */
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import type { IconType } from 'react-icons';
import { getIcon } from '@/lib/nav-icons';

// ─── Shared type (serialisable — no IconType in it) ──────────────────────────

export interface NavConfigItem {
  id: string;
  href: string;
  labelKey: string;
  label?: string;        // optional display name override from DB
  iconName: string;
  isPrimary: boolean;
  authRequired: boolean;
  sortOrder: number;
  enabled: boolean;
  lang: string;
}

// What Navbar/NavMenu actually need (includes the resolved icon)
export interface ResolvedNavItem {
  href: string;
  label: string;       // i18n key, resolved by caller via t()
  icon: IconType;
  authRequired?: boolean;
  isPrimary: boolean;
}

// ─── Hardcoded defaults (used as seed + fallback) ────────────────────────────

export const DEFAULT_NAV_ITEMS: Omit<NavConfigItem, 'id'>[] = [
  // ── JLPT / Japanese ──────────────────────────────────────────────────────
  { lang: 'ja', href: '/ja/learn',     labelKey: 'learn',     iconName: 'FaBookOpen',     sortOrder: 0,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/vocab',     labelKey: 'vocab',     iconName: 'FaBookmark',     sortOrder: 1,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/kanji',     labelKey: 'kanji',     iconName: 'FaPenNib',       sortOrder: 2,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/listening', labelKey: 'listening', iconName: 'FaHeadphones',   sortOrder: 3,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/grammar',   labelKey: 'grammar',   iconName: 'FaCompass',      sortOrder: 4,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/practice',  labelKey: 'practice',  iconName: 'FaLayerGroup',   sortOrder: 5,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/reading',   labelKey: 'reading',   iconName: 'FaNewspaper',    sortOrder: 6,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/mock-exam', labelKey: 'mock_exam', iconName: 'FaGraduationCap',sortOrder: 7,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'ja', href: '/ja/bjt',       labelKey: 'bjt',       iconName: 'FaStar',         sortOrder: 8,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'ja', href: '/dashboard',    labelKey: 'dashboard', iconName: 'FaChartBar',     sortOrder: 9,  isPrimary: false, enabled: true, authRequired: true  },
  { lang: 'ja', href: '/ja/levels',    labelKey: 'exam',      iconName: 'FaPencil',       sortOrder: 10, isPrimary: false, enabled: true, authRequired: false },
  // ── HSK / Chinese ────────────────────────────────────────────────────────
  { lang: 'zh', href: '/zh/alphabet',  labelKey: 'alphabet',  iconName: 'FaFont',         sortOrder: 0,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/learn',     labelKey: 'learn',     iconName: 'FaBookOpen',     sortOrder: 1,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/kanji',     labelKey: 'hanzi',     iconName: 'FaPenNib',       sortOrder: 2,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/levels',    labelKey: 'exam',      iconName: 'FaPencil',       sortOrder: 3,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/listening', labelKey: 'listening', iconName: 'FaHeadphones',   sortOrder: 4,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/vocab',     labelKey: 'vocab',     iconName: 'FaBookmark',     sortOrder: 5,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/practice',  labelKey: 'practice',  iconName: 'FaLayerGroup',   sortOrder: 6,  isPrimary: true,  enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/reading',   labelKey: 'reading',   iconName: 'FaNewspaper',    sortOrder: 7,  isPrimary: false, enabled: true, authRequired: false },
  { lang: 'zh', href: '/zh/grammar',   labelKey: 'grammar',   iconName: 'FaCompass',      sortOrder: 8,  isPrimary: false, enabled: true, authRequired: false },
  // ── PMP / English ────────────────────────────────────────────────────────
  { lang: 'pmp', href: '/pmp',                  labelKey: 'home',     iconName: 'FaBookOpen',  sortOrder: 0, isPrimary: true, enabled: true, authRequired: false },
  { lang: 'pmp', href: '/pmp/knowledge-areas',  labelKey: 'practice', iconName: 'FaLayerGroup',sortOrder: 1, isPrimary: true, enabled: true, authRequired: false },
  { lang: 'pmp', href: '/pmp/exam',             labelKey: 'exam',     iconName: 'FaPencil',    sortOrder: 2, isPrimary: true, enabled: true, authRequired: false },
];

// ─── Cached DB fetch ──────────────────────────────────────────────────────────

const fetchFromDB = unstable_cache(
  async (lang: string): Promise<NavConfigItem[]> => {
    const rows = await prisma.navMenuItem.findMany({
      where: { lang, enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(r => ({
      id: r.id,
      href: r.href,
      labelKey: r.labelKey,
      label: r.label ?? undefined,
      iconName: r.iconName,
      isPrimary: r.isPrimary,
      authRequired: r.authRequired,
      sortOrder: r.sortOrder,
      enabled: r.enabled,
      lang: r.lang,
    }));
  },
  ['nav-menu'],
  { tags: ['nav-menu'], revalidate: 300 }
);

/**
 * Get nav items for a given lang.
 * Falls back to DEFAULT_NAV_ITEMS if DB returns empty (not seeded yet).
 */
export async function getNavConfig(lang: string): Promise<NavConfigItem[]> {
  try {
    const rows = await fetchFromDB(lang);
    if (rows.length > 0) return rows;
  } catch {
    // DB unavailable — use fallback silently
  }
  return DEFAULT_NAV_ITEMS
    .filter(i => i.lang === lang)
    .map((i, idx) => ({ ...i, id: `fallback-${idx}` }));
}

/** Convert DB items to the shape Navbar/NavMenu consumes */
export function resolveNavItems(items: NavConfigItem[]): ResolvedNavItem[] {
  return items.map(i => ({
    href: i.href,
    label: i.labelKey,
    icon: getIcon(i.iconName),
    authRequired: i.authRequired,
    isPrimary: i.isPrimary,
  }));
}
