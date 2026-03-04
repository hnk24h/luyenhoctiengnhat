'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaArrowLeft, FaBookmark, FaNewspaper, FaAlignLeft,
  FaAlignJustify, FaArrowUpRightFromSquare, FaBook,
} from 'react-icons/fa6';
import { JapaneseText } from '@/components/JapaneseText';

interface Passage {
  id: string; title: string; titleVi: string | null;
  content: string; summary: string | null; level: string;
  type: string; source: string | null; sourceUrl: string | null;
  tags: string | null; createdAt: string;
}

const LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' },
  N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  short: <FaAlignLeft size={13} />,
  long:  <FaAlignJustify size={13} />,
  news:  <FaNewspaper size={13} />,
};

export default function ReadingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [passage,    setPassage]    = useState<Passage | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [fontSize,   setFontSize]   = useState(18); // px

  // Load passage
  useEffect(() => {
    fetch(`/api/reading/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setPassage(d); setLoading(false); });
  }, [params.id]);

  // Load user's saved words (to highlight already-saved)
  useEffect(() => {
    if (!session) return;
    fetch('/api/words')
      .then(r => r.ok ? r.json() : [])
      .then((words: { japanese: string }[]) =>
        setSavedWords(words.map(w => w.japanese))
      );
  }, [session]);

  const handleWordSaved = useCallback((w: { japanese: string }) => {
    setSavedWords(prev => [...prev, w.japanese]);
    setSavedCount(n => n + 1);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!passage) return (
    <div className="p-8 text-center">
      <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài đọc.</p>
      <Link href="/reading" className="btn-primary inline-flex mt-4 items-center gap-2">
        <FaArrowLeft size={12} /> Quay lại
      </Link>
    </div>
  );

  const lm   = LEVEL_META[passage.level] ?? LEVEL_META.N5;
  const tags: string[] = passage.tags ? JSON.parse(passage.tags) : [];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">

      {/* Back */}
      <Link href="/reading"
        className="inline-flex items-center gap-1.5 text-sm mb-6 btn-ghost"
        style={{ color: 'var(--text-muted)' }}>
        <FaArrowLeft size={11} /> Danh sách bài đọc
      </Link>

      {/* Passage header */}
      <div className="card mb-6" style={{ borderTop: `4px solid ${lm.color}` }}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: lm.bg, color: lm.color }}>{passage.level}</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {TYPE_ICON[passage.type]} {passage.type === 'news' ? 'Tin tức' : passage.type === 'long' ? 'Bài dài' : 'Đoạn ngắn'}
          </span>
          {tags.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>#{t}</span>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-1 leading-snug"
          style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif' }}>
          {passage.title}
        </h1>
        {passage.titleVi && (
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--primary)' }}>{passage.titleVi}</p>
        )}
        {passage.summary && (
          <p className="text-sm mt-2 p-3 rounded-lg"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)', lineHeight: 1.7 }}>
            {passage.summary}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {passage.source && (
              <span className="flex items-center gap-1">
                <FaNewspaper size={10} />
                {passage.sourceUrl
                  ? <a href={passage.sourceUrl} target="_blank" rel="noreferrer"
                      className="underline hover:text-primary flex items-center gap-1">
                      {passage.source} <FaArrowUpRightFromSquare size={9} />
                    </a>
                  : passage.source}
              </span>
            )}
            <span>{new Date(passage.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          {savedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FaBookmark size={10} /> {savedCount} từ đã lưu
            </div>
          )}
        </div>
      </div>

      {/* Reading controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cỡ chữ:</span>
          {[16, 18, 20, 22].map(sz => (
            <button key={sz} onClick={() => setFontSize(sz)}
              className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
              style={fontSize === sz
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {sz === 16 ? 'S' : sz === 18 ? 'M' : sz === 20 ? 'L' : 'XL'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          style={{ background: '#FEF9C3', color: '#92400E' }}>
          💡 Click vào từ để tra nghĩa
          {session && ' và lưu'}
        </div>
      </div>

      {/* Article body */}
      <div className="card"
        style={{ fontSize, lineHeight: 2, fontFamily: '"Noto Sans JP", serif' }}>
        <JapaneseText
          content={passage.content}
          passageId={passage.id}
          savedWords={savedWords}
          onWordSaved={handleWordSaved}
        />
      </div>

      {/* Saved words this session */}
      {savedCount > 0 && (
        <div className="card mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
            <FaBookmark size={14} style={{ color: 'var(--primary)' }} />
            Đã lưu <strong>{savedCount}</strong> từ mới trong bài đọc này
          </div>
          <Link href="/vocab"
            className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0">
            <FaBook size={11} /> Xem bộ sưu tập
          </Link>
        </div>
      )}
    </main>
  );
}
