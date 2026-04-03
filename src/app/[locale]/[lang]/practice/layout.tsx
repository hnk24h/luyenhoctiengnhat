import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://e-learn.ikagi.site';

interface Props { children: ReactNode; params: Promise<{ lang: string }> }

export async function generateMetadata({ params: rawParams }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await rawParams;
  const langLabel: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Luyện Tập Từ Vựng Tiếng Nhật — Flashcard & SRS', desc: 'Luyện tập từ vựng tiếng Nhật qua các bộ thẻ flashcard. Ôn tập thông minh theo thuật toán SRS, theo dõi tiến trình.' },
    zh: { title: 'Luyện Tập Từ Vựng Tiếng Trung — Flashcard & SRS', desc: 'Luyện tập từ vựng tiếng Trung qua flashcard và SRS. Quản lý bộ thẻ cá nhân.' },
    ko: { title: 'Luyện Tập Từ Vựng Tiếng Hàn — Flashcard & SRS', desc: 'Luyện tập từ vựng tiếng Hàn với flashcard và ôn tập SRS thông minh.' },
  };
  const m = langLabel[params.lang] ?? langLabel.ja;
  const canonical = `${BASE}/${params.lang}/practice`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function PracticeLayout({ children }: Props) {
  return <>{children}</>;
}
