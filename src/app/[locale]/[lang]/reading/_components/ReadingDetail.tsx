'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FaNewspaper, FaClock, FaBookmark, FaBook, FaGraduationCap,
  FaListUl, FaArrowUpRightFromSquare, FaChevronRight, FaChevronDown,
  FaStar, FaHeadphones, FaPenNib,
  FaCircleCheck, FaHighlighter, FaLanguage, FaSpinner,
} from 'react-icons/fa6';

import { JapaneseText } from '@/components/JapaneseText';
import type { PassageDetail, ReadingStats } from './types';
import { LEVEL_META, TYPE_META } from './constants';
import { readTime, markPassageRead, extractKeywords } from './helpers';
import {
  ReadingProgressBar, TTSPlayer, ComprehensionQuiz,
  HighlightToolbar, useHighlights,
} from './ReadingComponents';

// ─── AfterReadingCTA ──────────────────────────────────────────────────────────

function AfterReadingCTA({ locale, lang, level }: {
  locale: string; lang: string; level: string;
}) {
  const motivations = [
    '🎉 Tuyệt vời! Bạn đã đọc xong bài này!',
    '📚 Đọc thêm bài mới để nâng cao trình độ!',
    '💪 Mỗi bài đọc đưa bạn gần hơn đến mục tiêu!',
    '🌟 Kiến thức tích lũy mỗi ngày sẽ tạo nên sự khác biệt!',
  ];
  const [msg] = useState(() => motivations[Math.floor(Math.random() * motivations.length)]);

  const ctaItems = [
    { href: `/${locale}/${lang}/grammar`, icon: <FaGraduationCap size={20} />, label: 'Ngữ pháp', desc: `Ôn ngữ pháp ${level}`, color: '#7C3AED', bg: '#F5F3FF' },
    { href: `/${locale}/${lang}/vocab`, icon: <FaBook size={20} />, label: 'Từ vựng', desc: 'Xem từ đã lưu', color: '#2563EB', bg: '#EFF6FF' },
    { href: `/${locale}/${lang}/practice`, icon: <FaPenNib size={20} />, label: 'Luyện tập', desc: 'Làm bài tập', color: '#EA580C', bg: '#FFF7ED' },
    { href: `/${locale}/${lang}/listening`, icon: <FaHeadphones size={20} />, label: 'Nghe hiểu', desc: 'Rèn kỹ năng nghe', color: '#0D9488', bg: '#F0FDFA' },
  ];

  return (
    <div className="mt-8 rounded-2xl p-5 sm:p-6"
      style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 8%, var(--bg-surface)))',
        border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <FaCircleCheck size={18} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{msg}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tiếp tục hành trình học tập của bạn</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ctaItems.map(c => (
          <Link key={c.href} href={c.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: c.bg, border: `1px solid ${c.color}20` }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
            <span className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>{c.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── StreakRing ───────────────────────────────────────────────────────────────

function StreakRing({ streak, today, color }: { streak: number; today: number; color: string }) {
  const maxDays = 7; // ring fills over 7-day goal
  const pct = Math.min(1, streak / maxDays);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke={`${color}20`} strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 26 26)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x="26" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>
          {streak}
        </text>
        <text x="26" y="34" textAnchor="middle" fontSize="7" fill={`${color}99`}>
          ngày
        </text>
      </svg>
      <span className="text-[9px] font-semibold" style={{ color: `${color}99` }}>
        {today} bài hôm nay
      </span>
    </div>
  );
}

// ─── ReadingDetail ────────────────────────────────────────────────────────────

export function ReadingDetail({ passage, lang, locale, savedWords, onWordSaved, savedCount }: {
  passage: PassageDetail; lang: string; locale: string;
  savedWords: string[]; onWordSaved: (w: { term: string; contentId: string }) => void;
  savedCount: number;
}) {
  const { data: session } = useSession();
  const isChinese = lang === 'zh';
  const [fontSize, setFontSize] = useState(18);
  const [showTranslation, setShowTranslation] = useState(false);
  const [keywordsHighlighted, setKeywordsHighlighted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lm = LEVEL_META[passage.level] ?? LEVEL_META.N5;
  const tags: string[] = (() => {
    if (!passage.tags) return [];
    if (Array.isArray(passage.tags)) return passage.tags as string[];
    if (typeof passage.tags === 'string') {
      try { const parsed = JSON.parse(passage.tags); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return [];
  })();
  const tm = TYPE_META[passage.type];
  const { highlights, addHighlight } = useHighlights(passage.id);

  const keywords = useMemo(() => extractKeywords(passage.content, isChinese), [passage, isChinese]);
  const charCount = passage.charCount ?? passage.content?.length ?? 0;

  // Translation state
  const [showInlineTranslation, setShowInlineTranslation] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);

  const paragraphs = useMemo(
    () => passage.content.split('\n').filter(s => s.trim()),
    [passage.content],
  );

  const handleTranslate = useCallback(async () => {
    if (showInlineTranslation) {
      setShowInlineTranslation(false);
      return;
    }
    // Already cached
    if (Object.keys(translations).length >= paragraphs.length) {
      setShowInlineTranslation(true);
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphs, from: isChinese ? 'zh' : 'ja', to: 'vi' }),
      });
      if (res.ok) {
        const { translations: arr } = await res.json() as { translations: string[] };
        const map: Record<string, string> = {};
        paragraphs.forEach((p, i) => { map[p] = arr[i] ?? ''; });
        setTranslations(map);
        setShowInlineTranslation(true);
      }
    } catch { /* ignore */ }
    setTranslating(false);
  }, [showInlineTranslation, translations, paragraphs, isChinese]);

  const [stats, setStats] = useState<ReadingStats | null>(null);
  useEffect(() => {
    const s = markPassageRead(passage.id);
    setStats(s);
  }, [passage.id]);

  const handleHighlightSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 1) {
      addHighlight(sel.toString().trim());
      sel.removeAllRanges();
    }
  }, [addHighlight]);

  // Highlight keywords in content DOM
  const handleToggleKeywords = useCallback(() => {
    const el = contentRef.current?.querySelector('[data-article-body]') as HTMLElement | null;
    if (!el) return;
    if (keywordsHighlighted) {
      // Remove highlights
      el.querySelectorAll('mark[data-kw]').forEach(mark => {
        const text = document.createTextNode(mark.textContent || '');
        mark.parentNode?.replaceChild(text, mark);
      });
      el.normalize();
      setKeywordsHighlighted(false);
    } else {
      // Add highlights
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      for (const textNode of nodes) {
        const text = textNode.textContent || '';
        let html = text;
        let changed = false;
        for (const kw of keywords) {
          if (html.includes(kw.word)) {
            html = html.split(kw.word).join(
              `<mark data-kw="${kw.word}" style="background:#FDE68A;color:#78350F;border-radius:3px;padding:0 2px;cursor:help" title="${kw.word}">${kw.word}</mark>`
            );
            changed = true;
          }
        }
        if (changed) {
          const span = document.createElement('span');
          span.innerHTML = html;
          textNode.parentNode?.replaceChild(span, textNode);
        }
      }
      setKeywordsHighlighted(true);
    }
  }, [keywordsHighlighted, keywords]);

  return (
    <>
      <ReadingProgressBar contentRef={contentRef} />
      <article className="max-w-3xl mx-auto" ref={contentRef}>
        {/* Hero banner — compact single row */}
        <div className="rounded-2xl p-4 mb-3 relative overflow-hidden"
          style={{ background: lm.gradient, border: `1px solid ${lm.color}22` }}>
          <div className="relative z-10 flex items-start gap-3">
            {/* Left: title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: lm.color, color: '#fff' }}>
                  {lm.emoji} {passage.level}
                </span>
                {tm && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.7)', color: tm.color }}>
                    {tm.icon} {tm.label}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px]"
                  style={{ color: lm.color, opacity: 0.8 }}>
                  <FaClock size={8} /> {readTime(charCount)}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold leading-snug"
                style={{ color: '#1a1a2e', fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                {passage.title}
              </h1>
              {passage.titleVi && (
                <p className="text-xs font-medium mt-0.5" style={{ color: lm.color }}>{passage.titleVi}</p>
              )}
              {/* Tags + Source inline */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {tags.map(t => (
                  <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.6)', color: lm.color }}>#{t}</span>
                ))}
                {passage.source && (
                  <span className="flex items-center gap-1 text-[9px]" style={{ color: lm.color, opacity: 0.7 }}>
                    <FaNewspaper size={7} />
                    {passage.sourceUrl ? (
                      <a href={passage.sourceUrl} target="_blank" rel="noreferrer"
                        className="underline hover:opacity-80" style={{ color: 'inherit' }}>
                        {passage.source}
                      </a>
                    ) : passage.source}
                  </span>
                )}
              </div>
            </div>
            {/* Right: streak ring */}
            {stats && stats.totalRead > 0 && (
              <StreakRing streak={stats.streakDays} today={stats.readToday} color={lm.color} />
            )}
          </div>
        </div>

        {/* Single-line toolbar: all buttons + font dropdown */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <TTSPlayer text={passage.content} lang={lang} />
          {keywords.length > 0 && (
            <button onClick={handleToggleKeywords}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
              style={keywordsHighlighted
                ? { background: '#FDE68A', color: '#78350F', border: '1px solid #D97706' }
                : { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
              <FaStar size={9} /> {keywordsHighlighted ? 'Ẩn từ khóa' : 'Hiện từ khóa'}
            </button>
          )}
          <button onClick={handleTranslate} disabled={translating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
            style={showInlineTranslation
              ? { background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #3B82F6' }
              : { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            {translating ? <FaSpinner size={9} className="animate-spin" /> : <FaLanguage size={11} />}
            {translating ? 'Đang dịch...' : showInlineTranslation ? 'Ẩn bản dịch' : 'Dịch bài'}
          </button>
          <HighlightToolbar onHighlight={handleHighlightSelection} />
          {/* Font size dropdown */}
          <div className="relative ml-auto">
            <select
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="appearance-none text-[10px] font-semibold pl-2 pr-5 py-1 rounded-lg cursor-pointer"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <option value={16}>Nhỏ</option>
              <option value={18}>Vừa</option>
              <option value={20}>Lớn</option>
              <option value={22}>Rất lớn</option>
            </select>
            <FaChevronDown size={7} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Article body */}
        <div className="rounded-2xl p-5 sm:p-8"
          style={{
            fontSize, lineHeight: 2.2,
            fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
          <div data-article-body>
            {showInlineTranslation ? (
              /* Paragraph-by-paragraph with translation */
              paragraphs.map((para, i) => (
                <div key={i} className="mb-5 last:mb-0">
                  {isChinese ? (
                    <p style={{ color: 'var(--text-base)' }}>{para}</p>
                  ) : (
                    <JapaneseText content={para} passageId={`${passage.id}-p${i}`}
                      savedWords={savedWords} onWordSaved={onWordSaved} />
                  )}
                  {translations[para] && (
                    <p className="mt-1 text-sm leading-relaxed italic pl-3"
                      style={{
                        color: '#2563EB',
                        fontSize: Math.max(13, fontSize - 4),
                        lineHeight: 1.7,
                        fontFamily: 'system-ui, sans-serif',
                        borderLeft: '2px solid #93C5FD',
                      }}>
                      {translations[para]}
                    </p>
                  )}
                </div>
              ))
            ) : (
              /* Original rendering */
              isChinese
                ? passage.content.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0" style={{ color: 'var(--text-base)' }}>{para}</p>
                  ))
                : <JapaneseText content={passage.content} passageId={passage.id}
                    savedWords={savedWords} onWordSaved={onWordSaved} />
            )}
          </div>
        </div>

        {/* Highlighted words */}
        {highlights.length > 0 && (
          <div className="rounded-xl p-4 mt-4"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <div className="flex items-center gap-2 mb-2">
              <FaHighlighter size={11} style={{ color: '#D97706' }} />
              <span className="text-xs font-bold" style={{ color: '#92400E' }}>Đã đánh dấu</span>
              <span className="text-[10px] ml-auto" style={{ color: '#B45309' }}>{highlights.length} đoạn</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg cursor-pointer hover:line-through"
                  onClick={() => addHighlight(h)}
                  style={{ background: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A',
                    fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                  {h.length > 20 ? h.slice(0, 20) + '…' : h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chinese translation toggle */}
        {isChinese && passage.translation && (
          <div className="mt-4 rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setShowTranslation(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              Bản dịch tiếng Việt
              <FaChevronRight size={11}
                className={showTranslation ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>
            {showTranslation && (
              <div className="px-4 pb-4 pt-2" style={{ background: 'var(--bg-surface)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{passage.translation}</p>
              </div>
            )}
          </div>
        )}

        {/* Saved words banner */}
        {!isChinese && savedCount > 0 && (
          <div className="rounded-xl p-4 mt-4 flex items-center justify-between gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
              <FaBookmark size={13} style={{ color: 'var(--primary)' }} />
              Đã lưu <strong>{savedCount}</strong> từ mới trong bài này
            </div>
            <Link href={`/${locale}/${lang}/vocab`}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shrink-0 rounded-lg">
              <FaBook size={11} /> Từ vựng
            </Link>
          </div>
        )}

        {/* Saved words list */}
        {!isChinese && savedWords.length > 0 && (
          <div className="rounded-2xl p-4 mt-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <FaListUl size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>Từ đã lưu</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{savedWords.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {savedWords.slice(0, 20).map(w => (
                <span key={w} className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ background: 'var(--bg-base)', color: 'var(--text-base)',
                    border: '1px solid var(--border)', fontFamily: '"Noto Sans JP", serif' }}>{w}</span>
              ))}
              {savedWords.length > 20 && (
                <span className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  +{savedWords.length - 20} từ khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* Comprehension quiz */}
        <ComprehensionQuiz passage={passage} isChinese={isChinese} />

        {/* After reading CTA */}
        <AfterReadingCTA locale={locale} lang={lang} level={passage.level} />
      </article>
    </>
  );
}
