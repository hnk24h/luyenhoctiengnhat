import type { Metadata } from 'next';
import AlphabetClient from './AlphabetClient';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const langLabel: Record<string, { title: string; desc: string }> = {
    ja: { title: 'Bảng Chữ Kana — Hiragana & Katakana', desc: 'Học bảng chữ Hiragana, Katakana tiếng Nhật từ cơ bản đến nâng cao. Luyện phát âm, tra nghĩa từng ký tự.' },
    zh: { title: 'Bảng Chữ Tiếng Trung — Pinyin & Hanzi', desc: 'Học bảng Pinyin, Hán tự cơ bản tiếng Trung. Tra nghĩa và luyện viết từng ký tự.' },
    ko: { title: 'Bảng Chữ Hangul — Tiếng Hàn', desc: 'Học bảng chữ Hangul tiếng Hàn từ cơ bản. Luyện phát âm và nhận mặt chữ.' },
  };
  const m = langLabel[lang] ?? langLabel.ja;
  const canonical = `https://e-learn.ikagi.site/${lang}/alphabet`;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical },
    openGraph: { title: `${m.title} | IkagiLearn`, description: m.desc, url: canonical },
  };
}

export default function AlphabetPage() {
  return <AlphabetClient />;
}
