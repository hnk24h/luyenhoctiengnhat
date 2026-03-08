import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luyện Nghe Tiếng Nhật JLPT',
  description:
    'Luyện nghe tiếng Nhật theo format JLPT N5~N1 với hội thoại thực tế, thông báo và bài nghe giao tiếp. Có đáp án và giải thích chi tiết.',
  alternates: { canonical: 'https://e-learn.ikagi.site/listening' },
  openGraph: {
    title: 'Luyện Nghe JLPT N5~N1 | IkagiLearn',
    description:
      'Bài nghe tiếng Nhật theo format JLPT. Hội thoại, thông báo, nghe đoán — đầy đủ N5 đến N1.',
    url: 'https://e-learn.ikagi.site/listening',
  },
};

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
