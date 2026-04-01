import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://e-learn.ikagi.site';

interface Props { children: ReactNode; params: { lang: string } }

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const langLabel: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Luyện Đọc Hiểu Tiếng Nhật JLPT', desc: 'Luyện đọc hiểu tiếng Nhật theo cấp N5~N1 với các đoạn văn, bài báo sát format JLPT thực tế.' },
    zh: { title: 'Luyện Đọc Hiểu Tiếng Trung HSK', desc: 'Luyện đọc hiểu tiếng Trung theo cấp HSK1~6 với đoạn văn sát format HSK thực tế.' },
    ko: { title: 'Luyện Đọc Hiểu Tiếng Hàn TOPIK', desc: 'Luyện đọc hiểu tiếng Hàn theo cấp TOPIK với đoạn văn sát format thi thực tế.' },
  };
  const m = langLabel[params.lang] ?? langLabel.ja;
  const canonical = `${BASE}/${params.lang}/reading`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function ReadingLayout({ children }: Props) {
  return <>{children}</>;
}
