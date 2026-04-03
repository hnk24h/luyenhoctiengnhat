import type { Metadata } from 'next';

const BASE = 'https://e-learn.ikagi.site';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const langLabel: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Luyện Nghe Tiếng Nhật JLPT', desc: 'Luyện kỹ năng nghe tiếng Nhật với các bài hội thoại, thông báo thực tế. Đề nghe sát format JLPT N5~N1.' },
    zh: { title: 'Luyện Nghe Tiếng Trung HSK', desc: 'Luyện nghe tiếng Trung với hội thoại thực tế, sát format đề thi HSK. Có phân tích ngữ pháp từng câu.' },
    ko: { title: 'Luyện Nghe Tiếng Hàn TOPIK', desc: 'Luyện kỹ năng nghe tiếng Hàn với hội thoại tự nhiên, đề nghe sát format TOPIK.' },
  };
  const m = langLabel[lang] ?? langLabel.ja;
  const canonical = `${BASE}/${lang}/listening`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
