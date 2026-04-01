import { notFound } from 'next/navigation';

const VALID_LANGS = new Set(['ja', 'zh', 'ko', 'vi', 'en']);

// JSON-LD schema per language for SEO
const LANG_SCHEMA: Record<string, object> = {
  ja: {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Luyện Thi Tiếng Nhật JLPT — IkagiLearn',
    description: 'Hệ thống học tiếng Nhật từ vựng, ngữ pháp, luyện nghe và thi thử JLPT N5~N1.',
    provider: { '@type': 'Organization', name: 'IkagiLearn', url: 'https://e-learn.ikagi.site' },
    inLanguage: 'ja',
    url: 'https://e-learn.ikagi.site/vi/ja',
  },
  zh: {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Luyện Thi Tiếng Trung HSK — IkagiLearn',
    description: 'Hệ thống học tiếng Trung từ vựng, ngữ pháp, luyện nghe và thi thử HSK 1~6.',
    provider: { '@type': 'Organization', name: 'IkagiLearn', url: 'https://e-learn.ikagi.site' },
    inLanguage: 'zh',
    url: 'https://e-learn.ikagi.site/vi/zh',
  },
  ko: {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Luyện Thi Tiếng Hàn TOPIK — IkagiLearn',
    description: 'Hệ thống học tiếng Hàn từ vựng, ngữ pháp, luyện nghe và thi thử TOPIK 1~6.',
    provider: { '@type': 'Organization', name: 'IkagiLearn', url: 'https://e-learn.ikagi.site' },
    inLanguage: 'ko',
    url: 'https://e-learn.ikagi.site/vi/ko',
  },
};

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!VALID_LANGS.has(params.lang)) notFound();
  const schema = LANG_SCHEMA[params.lang];
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      {children}
    </>
  );
}
