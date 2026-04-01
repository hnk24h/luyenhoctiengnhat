import type { Metadata } from 'next';
import VocabClient from './VocabClient';

const BASE = 'https://e-learn.ikagi.site';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const langLabel: Record<string, { title: string; desc: string; exam: string }> = {
    ja: { title: 'Từ Vựng Tiếng Nhật JLPT N5~N1', desc: 'Học từ vựng tiếng Nhật theo từng cấp N5, N4, N3, N2, N1 — flashcard, SRS, tổng hợp theo chủ đề.', exam: 'JLPT' },
    zh: { title: 'Từ Vựng Tiếng Trung HSK', desc: 'Học từ vựng tiếng Trung theo cấp HSK1 đến HSK6 — flashcard, Pinyin, nghĩa tiếng Việt.', exam: 'HSK' },
    ko: { title: 'Từ Vựng Tiếng Hàn TOPIK', desc: 'Học từ vựng tiếng Hàn theo cấp TOPIK — flashcard, phiên âm, nghĩa tiếng Việt.', exam: 'TOPIK' },
  };
  const m = langLabel[params.lang] ?? langLabel.ja;
  const canonical = `${BASE}/${params.lang}/vocab`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: {
      title: `${m.title} | IkagiLearn`,
      description: m.desc,
      url: canonical,
    },
  };
}

export default function VocabPage() {
  return <VocabClient />;
}
