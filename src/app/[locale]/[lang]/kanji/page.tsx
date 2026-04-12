import type { Metadata } from 'next';
import KanjiClient from './KanjiClient';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Học Kanji — Hán tự tiếng Nhật JLPT N5~N1', desc: 'Học Kanji tiếng Nhật theo cấp JLPT N5, N4, N3, N2, N1. Xem cách viết, nét bút, ôn tập và xuất PDF luyện viết.' },
    zh: { title: 'Học Hán Tự — Hanzi HSK', desc: 'Học Hán tự tiếng Trung theo cấp HSK. Xem cách viết, nét bút và luyện viết.' },
    ko: { title: 'Học Hanja — Hán tự tiếng Hàn', desc: 'Học Hán tự tiếng Hàn. Xem cách viết, nét bút và luyện viết.' },
  };
  const m = meta[lang] ?? meta.ja;
  const canonical = `https://e-learn.ikagi.site/${lang}/kanji`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function KanjiPage() {
  return <KanjiClient />;
}
