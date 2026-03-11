import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://e-learn.ikagi.site';
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/learn',
          '/learn/',
          '/levels',
          '/listening',
          '/vocab',
          '/flashcards',
          '/auth/login',
          '/auth/register',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/exam/',
          '/results/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
