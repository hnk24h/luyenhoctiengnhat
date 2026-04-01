import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Từ Vựng Tiếng Nhật JLPT',
  description:
    'Tra cứu và học từ vựng tiếng Nhật theo cấp độ JLPT N5~N1. Có phiên âm, nghĩa tiếng Việt, ví dụ và bài tập flashcard.',
  alternates: { canonical: 'https://e-learn.ikagi.site/vocab' },
  openGraph: {
    title: 'Từ Vựng Tiếng Nhật JLPT N5~N1 | IkagiLearn',
    description:
      'Tra cứu từ vựng JLPT N5~N1 với ví dụ câu, phiên âm và bài tập flashcard.',
    url: 'https://e-learn.ikagi.site/vocab',
  },
};

export default function VocabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
