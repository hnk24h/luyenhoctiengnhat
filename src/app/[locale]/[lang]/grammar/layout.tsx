import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://e-learn.ikagi.site';

interface Props { children: ReactNode; params: { lang: string } }

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const langLabel: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Ngữ Pháp Tiếng Nhật JLPT N5~N1', desc: 'Học ngữ pháp tiếng Nhật theo cấp N5, N4, N3, N2, N1. Giải thích rõ ràng, ví dụ thực tế, luyện tập bài bản.' },
    zh: { title: 'Ngữ Pháp Tiếng Trung HSK', desc: 'Học ngữ pháp tiếng Trung theo cấp HSK1~6. Giải thích tiếng Việt, ví dụ Pinyin và Hán tự.' },
    ko: { title: 'Ngữ Pháp Tiếng Hàn TOPIK', desc: 'Học ngữ pháp tiếng Hàn theo cấp TOPIK. Ví dụ thực tế, giải thích chi tiết bằng tiếng Việt.' },
  };
  const m = langLabel[params.lang] ?? langLabel.ja;
  const canonical = `${BASE}/${params.lang}/grammar`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function GrammarLayout({ children }: Props) {
  return <>{children}</>;
}
