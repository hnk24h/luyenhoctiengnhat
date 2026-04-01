import type { MetadataRoute } from 'next';

const BASE = 'https://e-learn.ikagi.site';

// ─── Language / level config ────────────────────────────────────────────────
const LANGS = ['ja', 'zh', 'ko'] as const;
type Lang = typeof LANGS[number];

const LEVELS_BY_LANG: Record<Lang, string[]> = {
  ja: ['N5', 'N4', 'N3', 'N2', 'N1'],
  zh: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  ko: ['TOPIK1', 'TOPIK2', 'TOPIK3', 'TOPIK4', 'TOPIK5', 'TOPIK6'],
};

// Public pages per language
const LANG_STATIC_PATHS = [
  { path: '',          priority: 1.0,  changeFreq: 'weekly' },
  { path: '/learn',    priority: 0.9,  changeFreq: 'weekly' },
  { path: '/levels',   priority: 0.9,  changeFreq: 'weekly' },
  { path: '/listening',priority: 0.85, changeFreq: 'weekly' },
  { path: '/vocab',    priority: 0.85, changeFreq: 'weekly' },
  { path: '/grammar',  priority: 0.8,  changeFreq: 'weekly' },
  { path: '/reading',  priority: 0.8,  changeFreq: 'weekly' },
  { path: '/alphabet', priority: 0.7,  changeFreq: 'monthly' },
  { path: '/practice', priority: 0.7,  changeFreq: 'weekly' },
] as const;

// Global static pages (no lang prefix)
const GLOBAL_STATIC = [
  { url: '',               priority: 1.0,  changeFreq: 'weekly' },
  { url: '/auth/login',    priority: 0.4,  changeFreq: 'monthly' },
  { url: '/auth/register', priority: 0.4,  changeFreq: 'monthly' },
] as const;

type ChangeFreq = MetadataRoute.Sitemap[0]['changeFrequency'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Global pages (no locale prefix)
  const globalEntries: MetadataRoute.Sitemap = GLOBAL_STATIC.map(({ url, priority, changeFreq }) => ({
    url: `${BASE}${url}`,
    lastModified: now,
    changeFrequency: changeFreq as ChangeFreq,
    priority,
  }));

  // 2. Per-language static pages: /ja, /zh, /ko + each subpath
  const langStaticEntries: MetadataRoute.Sitemap = LANGS.flatMap(lang =>
    LANG_STATIC_PATHS.map(({ path, priority, changeFreq }) => ({
      url: `${BASE}/${lang}${path}`,
      lastModified: now,
      changeFrequency: changeFreq as ChangeFreq,
      priority,
    }))
  );

  // 3. Per-language learn level pages: /ja/learn/N5, /zh/learn/HSK1, ...
  const learnLevelEntries: MetadataRoute.Sitemap = LANGS.flatMap(lang =>
    LEVELS_BY_LANG[lang].map(level => ({
      url: `${BASE}/${lang}/learn/${level}`,
      lastModified: now,
      changeFrequency: 'weekly' as ChangeFreq,
      priority: 0.85,
    }))
  );

  // 4. Per-language exam level pages: /ja/levels/N5/exams, ...
  const examLevelEntries: MetadataRoute.Sitemap = LANGS.flatMap(lang =>
    LEVELS_BY_LANG[lang].flatMap(level => [
      {
        url: `${BASE}/${lang}/levels/${level}`,
        lastModified: now,
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.8,
      },
      {
        url: `${BASE}/${lang}/levels/${level}/exams`,
        lastModified: now,
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.8,
      },
    ])
  );

  return [
    ...globalEntries,
    ...langStaticEntries,
    ...learnLevelEntries,
    ...examLevelEntries,
  ];
}
