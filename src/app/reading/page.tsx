'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaBook, FaNewspaper, FaAlignLeft, FaAlignJustify,
  FaFilter, FaChevronRight, FaClock, FaBolt,
} from 'react-icons/fa6';

interface Passage {
  id:        string;
  title:     string;
  titleVi:   string | null;
  summary:   string | null;
  level:     string;
  type:      string;
  source:    string | null;
  tags:      string | null;
  charCount: number;
  createdAt: string;
}

const LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' },
  N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
  short: { icon: <FaAlignLeft  size={12} />, label: 'Đoạn ngắn', bg: '#EFF6FF', color: '#2563EB' },
  long:  { icon: <FaAlignJustify size={12} />, label: 'Bài dài',  bg: '#F5F3FF', color: '#7C3AED' },
  news:  { icon: <FaNewspaper size={12} />, label: 'Tin tức',   bg: '#FFF7ED', color: '#EA580C' },
};

function readTime(chars: number) {
  const mins = Math.ceil(chars / 400);
  return `${mins} phút`;
}

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const queryLevel = searchParams.get('level') ?? '';
  const queryType = searchParams.get('type') ?? '';
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [level,    setLevel]    = useState(queryLevel);
  const [type,     setType]     = useState(queryType);

  useEffect(() => {
    setLevel(queryLevel);
    setType(queryType);
  }, [queryLevel, queryType]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (type)  params.set('type',  type);
    const res = await fetch(`/api/reading?${params}`);
    if (res.ok) setPassages(await res.json());
    setLoading(false);
  }, [level, type]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>
          KỸ NĂNG ĐỌC HIỂU
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-base)' }}>Đọc tiếng Nhật</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Click vào từ bất kỳ để tra nghĩa và lưu vào bộ sưu tập từ vựng.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <FaFilter size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Lọc:</span>
        </div>

        {/* Level filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lv => (
            <button key={lv} onClick={() => setLevel(lv)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={level === lv
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {lv || 'Tất cả cấp'}
            </button>
          ))}
        </div>

        <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--border)' }} />

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['', 'short', 'long', 'news'].map(tp => (
            <button key={tp} onClick={() => setType(tp)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={type === tp
                ? { background: 'var(--primary)', color: 'white' }
                : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {tp ? TYPE_META[tp]?.label : 'Tất cả loại'}
            </button>
          ))}
        </div>
      </div>

      {/* Passages grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ height: 160, background: 'var(--border)' }} />
          ))}
        </div>
      ) : passages.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4 opacity-30">📖</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Chưa có bài đọc nào</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Thử chọn bộ lọc khác</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {passages.map(p => {
            const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
            const tm = TYPE_META[p.type]   ?? TYPE_META.short;
            const tags: string[] = p.tags ? JSON.parse(p.tags) : [];
            return (
              <Link key={p.id} href={`/reading/${p.id}`}
                className="card card-hover group flex flex-col gap-3 no-underline"
                style={{ textDecoration: 'none' }}>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: lm.bg, color: lm.color }}>{p.level}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: tm.bg, color: tm.color }}>
                      {tm.icon}{tm.label}
                    </span>
                  </div>
                  <FaChevronRight size={12} className="shrink-0 mt-0.5 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--text-muted)' }} />
                </div>

                <div>
                  <div className="font-bold text-base mb-1"
                    style={{ color: 'var(--text-base)', fontFamily: '"Noto Sans JP", serif', lineHeight: 1.5 }}>
                    {p.title}
                  </div>
                  {p.titleVi && (
                    <div className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{p.titleVi}</div>
                  )}
                </div>

                {p.summary && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.summary}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <FaClock size={10} /> {readTime(p.charCount)}
                    </span>
                    {p.source && <span>📰 {p.source}</span>}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {tags.slice(0, 3).map(t => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>#{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
