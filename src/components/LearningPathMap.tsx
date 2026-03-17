'use client';

import { useState } from 'react';
import { FaLock } from 'react-icons/fa6';
import Link from 'next/link';

export interface PathLesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  itemCount: number;
  isCompleted: boolean;
  requiredTier?: string;
}

interface Props {
  lessons: PathLesson[];
  accentColor: string;
  accentRgb: string;
  lessonsHref: string;
}

// ─── SVG layout constants ──────────────────────────────────────────────────────
const VW = 260;  // svg viewBox width
const NS = 88;   // node spacing (px)
const T  = 56;   // top padding
const B  = 50;   // bottom padding
const LX = 66;   // left-track x
const RX = 194;  // right-track x
const CX = 130;  // center x
const R  = 17;   // node radius

const trunc = (s: string, max = 16) => s.length > max ? s.slice(0, max - 1) + '…' : s;

type State = 'done' | 'current' | 'next' | 'future';

// ─── Color palette per state ───────────────────────────────────────────────────
const STATE_COLORS: Record<State, { bg: string; border: string; txt: string }> = {
  done:    { bg: '',        border: '',        txt: '#fff' },     // filled w/ accent
  current: { bg: '#ffffff', border: '',        txt: '' },         // filled w/ accent border
  next:    { bg: '#F1F5F9', border: '#94A3B8', txt: '#475569' },
  future:  { bg: '#F8FAFC', border: '#E2E8F0', txt: '#CBD5E1' },
};

export default function LearningPathMap({ lessons, accentColor, accentRgb, lessonsHref }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const N   = lessons.length;
  const H   = T + (N + 1) * NS + B;
  const gid = `glow${accentColor.replace(/[^0-9a-f]/gi, '')}`;

  // position p=0 → START (top), p=1..N → lessons, p=N+1 → GOAL (bottom)
  const pos = (p: number) => ({
    y: T + p * NS,
    x: (p === 0 || p === N + 1) ? CX : (p % 2 === 1 ? LX : RX),
  });

  const curP = (() => {
    const i = lessons.findIndex(l => !l.isCompleted);
    return i === -1 ? N + 1 : i + 1;
  })();

  const state = (p: number): State => {
    if (p === 0 || lessons[p - 1]?.isCompleted) return 'done';
    if (p === N + 1) return curP > N ? 'current' : 'future';
    if (p === curP) return 'current';
    if (p <= curP + 2) return 'next';
    return 'future';
  };

  // Bezier path between two position-indices
  const pathD = (p1: number, p2: number) => {
    const a = pos(p1), b = pos(p2);
    return `M${a.x},${a.y} C${a.x},${a.y - NS * .46} ${b.x},${b.y + NS * .46} ${b.x},${b.y}`;
  };

  const activeLes = (active !== null && active >= 1 && active <= N) ? lessons[active - 1] : null;
  const actPos    = active !== null ? pos(active) : null;
  const completed = lessons.filter(l => l.isCompleted).length;

  return (
    <div className="rounded-3xl border overflow-hidden flex flex-col"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
            🗺 Lộ trình học
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {completed}&thinsp;/&thinsp;{N} bài hoàn thành
          </p>
        </div>
        <Link href={lessonsHref}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: `rgba(${accentRgb},.12)`, color: accentColor }}>
          Học ngay →
        </Link>
      </div>

      {/* ── SVG Map ── */}
      <div className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative"
        style={{ maxHeight: 490, flexShrink: 1 }}>
        <div className="relative" style={{ width: VW, margin: '0 auto' }}>

          <svg viewBox={`0 0 ${VW} ${H}`} width={VW} height={H}
            style={{ display: 'block' }}
            onClick={() => setActive(null)}>

            <defs>
              {/* Radial glow for current node */}
              <radialGradient id={gid} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={accentColor} stopOpacity=".4" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0"  />
              </radialGradient>
              {/* Anime hand-drawn roughness filter */}
              <filter id="rf" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency=".042" numOctaves="2" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale=".75" />
              </filter>
              {/* Glow blur for completed path shadows */}
              <filter id="gf">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Dot-grid background pattern */}
              <pattern id="dpat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r=".8" fill="currentColor" opacity=".07" />
              </pattern>
            </defs>

            {/* Background dot grid */}
            <rect width={VW} height={H} fill="url(#dpat)" style={{ color: 'var(--text-muted)' }} />

            {/* ── Paths ── */}
            {Array.from({ length: N + 1 }, (_, i) => {
              const s1 = state(i), s2 = state(i + 1);
              const done = s1 === 'done';
              const mid  = pos(i);
              const mid2 = pos(i + 1);
              return (
                <g key={`seg-${i}`}>
                  {/* Glow shadow under completed paths */}
                  {done && (
                    <path d={pathD(i, i + 1)}
                      stroke={accentColor} strokeWidth="6" fill="none"
                      strokeLinecap="round" opacity=".14" filter="url(#gf)" />
                  )}
                  {/* Main path */}
                  <path d={pathD(i, i + 1)}
                    stroke={done ? accentColor : s2 === 'next' ? '#94A3B8' : '#E2E8F0'}
                    strokeWidth={done ? 2.5 : 1.8}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={s2 === 'future' ? '4 5' : undefined}
                    opacity={s2 === 'future' ? .28 : 1}
                    filter={done ? 'url(#rf)' : undefined}
                  />
                  {/* Midpoint dot on completed paths */}
                  {done && (
                    <circle
                      cx={(mid.x + mid2.x) / 2}
                      cy={(mid.y + mid2.y) / 2}
                      r="3" fill={accentColor} opacity=".55" />
                  )}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {Array.from({ length: N + 2 }, (_, p) => {
              const { x, y } = pos(p);
              const s      = state(p);
              const sc     = STATE_COLORS[s];
              const lesson = (p >= 1 && p <= N) ? lessons[p - 1] : null;
              const isGoal = p === N + 1;
              const isSt   = p === 0;
              const isCur  = s === 'current';

              return (
                <g key={`nd-${p}`}
                  style={{ cursor: lesson ? 'pointer' : 'default' }}
                  onClick={e => { e.stopPropagation(); lesson && setActive(active === p ? null : p); }}>

                  {/* Glow halo for current */}
                  {isCur && <circle cx={x} cy={y} r="32" fill={`url(#${gid})`} />}

                  {/* Pulsing ring (SVG animate — avoids Tailwind/CSS issues in SVG) */}
                  {isCur && (
                    <circle cx={x} cy={y} r={R + 4} fill="none"
                      stroke={accentColor} strokeWidth="1.5" opacity=".55">
                      <animate attributeName="r"
                        values={`${R + 4};${R + 16};${R + 4}`} dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity"
                        values=".55;0;.55" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* ── GOAL node ── */}
                  {isGoal && (
                    <>
                      <circle cx={x} cy={y} r="23"
                        fill={s === 'done' ? '#FEF3C7' : '#F8FAFC'}
                        stroke={s === 'done' ? '#F59E0B' : '#E2E8F0'}
                        strokeWidth="2.5"
                        filter={s === 'done' ? 'url(#rf)' : undefined} />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize="19">
                        {s === 'done' ? '🏆' : '⭐'}
                      </text>
                      <text x={x} y={y + 34} textAnchor="middle"
                        fontSize="7.5" fontWeight="800" letterSpacing="1.2"
                        fill={s === 'done' ? '#F59E0B' : '#94A3B8'}>MỤC TIÊU</text>
                    </>
                  )}

                  {/* ── START node ── */}
                  {isSt && (
                    <>
                      <circle cx={x} cy={y} r={R} fill={accentColor} filter="url(#rf)" />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                        fontSize="9" fontWeight="700" fill="white">スタート</text>
                      <text x={x} y={y + R + 14} textAnchor="middle"
                        fontSize="8.5" fill="#94A3B8">始まり</text>
                    </>
                  )}

                  {/* ── LESSON node ── */}
                  {lesson && (
                    <>
                      {/* Selection indicator ring */}
                      {active === p && (
                        <circle cx={x} cy={y} r={R + 5} fill="none"
                          stroke={accentColor} strokeWidth="1.5"
                          strokeDasharray="3 2" opacity=".65" />
                      )}
                      {/* Main circle with hover/click for tooltip */}
                      <circle cx={x} cy={y} r={R}
                        fill={s === 'done' ? accentColor : s === 'current' ? '#fff' : sc.bg}
                        stroke={s === 'done' ? accentColor : s === 'current' ? accentColor : sc.border}
                        strokeWidth={isCur ? 2.5 : 1.5}
                        filter={s !== 'future' ? 'url(#rf)' : undefined}
                        onMouseEnter={() => { if (active !== p) setActive(p); }}
                        onClick={() => setActive(p)}
                        style={{ cursor: 'pointer' }}
                      />

                      {/* Icon / number */}
                      {s === 'done' ? (
                        <>
                          <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                            fontSize="13" fill="white">✓</text>
                          {/* Sparkles on completed */}
                          <text x={x + R + 4} y={y - R + 2} fontSize="8.5" fill="#FCD34D" opacity=".9">✦</text>
                          <text x={x - R - 2} y={y - R + 8} fontSize="7" fill="#FCD34D" opacity=".65">✧</text>
                        </>
                      ) : (
                        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                          fontSize="10" fontWeight="700"
                          fill={s === 'current' ? accentColor : sc.txt}>{p}</text>
                      )}

                      {/* Short title beside node (not for future) */}
                      {s !== 'future' && (
                        <g>
                          <text
                            x={x === LX ? x + R + 7 : x - R - 7}
                            y={y + 1}
                            textAnchor={x === LX ? 'start' : 'end'}
                            dominantBaseline="central"
                            fontSize="8.8"
                            fontWeight={isCur ? '700' : '500'}
                            fill={s === 'done' ? '#64748B' : isCur ? '#1E293B' : '#94A3B8'}>
                            {trunc(lesson.title)}
                          </text>
                          {lesson.requiredTier && lesson.requiredTier !== 'free' && (
                            <foreignObject
                              x={x === LX ? x + R + 60 : x - R - 30}
                              y={y - 8}
                              width={16}
                              height={16}
                            >
                              <FaLock style={{ color: '#F59E0B', width: 14, height: 14 }} title="Bài học bị khóa theo gói" />
                            </foreignObject>
                          )}
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── Lesson tooltip ── */}
          {active !== null && activeLes && actPos && (
            <div className="absolute z-30 rounded-2xl border shadow-2xl"
              style={{
                background: 'var(--bg-surface)',
                borderColor: `rgba(${accentRgb},.3)`,
                boxShadow: `0 10px 32px rgba(${accentRgb},.22)`,
                width: 154,
                left:  actPos.x <= CX ? actPos.x + R + 16 : undefined,
                right: actPos.x >  CX ? VW - actPos.x + R + 16 : undefined,
                top: Math.max(6, actPos.y - 46),
                padding: '12px 13px',
                pointerEvents: 'auto',
              }}
              onMouseLeave={() => setActive(null)}
              onClick={e => e.stopPropagation()}>

              {/* Close button */}
              <button
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                onClick={() => setActive(null)}>×</button>

              {/* Type badge */}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 mb-2"
                style={{ background: `rgba(${accentRgb},.1)`, color: accentColor }}>
                {activeLes.type === 'vocab' ? '📖 Từ vựng' : '📐 Ngữ pháp'}
              </span>

              {/* Title */}
              <p className="text-xs font-bold leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
                {activeLes.title}
              </p>

              {/* Description */}
              {activeLes.description && (
                <p className="text-[10px] leading-relaxed line-clamp-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {activeLes.description}
                </p>
              )}

              {/* Item count */}
              <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
                {activeLes.itemCount} mục học
              </p>

              {/* CTA */}
              <Link href={lessonsHref}
                className="block text-center text-[10px] font-bold py-1.5 rounded-xl transition-all hover:scale-105"
                style={{ background: `rgba(${accentRgb},.12)`, color: accentColor }}>
                Học bài này →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
