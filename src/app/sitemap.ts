import type { MetadataRoute } from 'next';

const BASE = 'https://e-learn.ikagi.site';

// Static public pages
const STATIC: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  { url: '',          priority: 1.0,  changeFrequency: 'weekly' },
  { url: '/learn',    priority: 0.9,  changeFrequency: 'weekly' },
  { url: '/levels',   priority: 0.9,  changeFrequency: 'weekly' },
  { url: '/listening',priority: 0.8,  changeFrequency: 'weekly' },
  { url: '/vocab',    priority: 0.8,  changeFrequency: 'weekly' },
  { url: '/flashcards',priority: 0.7, changeFrequency: 'weekly' },
  { url: '/auth/login',    priority: 0.4,  changeFrequency: 'monthly' },
  { url: '/auth/register', priority: 0.4,  changeFrequency: 'monthly' },
];

// JLPT level pages
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
const TABS   = ['vocab', 'grammar'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // /learn/N5, /learn/N4 … (one per level)
  const levelEntries: MetadataRoute.Sitemap = LEVELS.flatMap(level =>
    TABS.map(tab => ({
      url: `${BASE}/learn/${level}?tab=${tab}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  );

  return [...staticEntries, ...levelEntries];
}
