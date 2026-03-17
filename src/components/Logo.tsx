import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * Inline SVG logo mark — Ikigai symbol: 4 overlapping circles.
 * Derived from "Ikagi" (← Ikigai 生き甲斐), the Japanese concept of
 * "reason for being". The sweet-spot center = purpose = language mastery.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '-');
  const gid  = `ikagi-bg-${uid}`;
  const glow = `ikagi-glow-${uid}`;
  const clip = `ikagi-clip-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IkagiLearn"
      className={className}>
      <defs>
        {/* Brand gradient: purple → blue */}
        <linearGradient id={gid} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#2563EB"/>
        </linearGradient>
        {/* Soft center glow */}
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        {/* Clip to rounded square */}
        <clipPath id={clip}>
          <rect width="48" height="48" rx="13"/>
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="13" fill={`url(#${gid})`}/>

      {/* ── 4 Ikigai circles ────────────────────────────────── */}
      <g clipPath={`url(#${clip})`}>
        {/* Top    */} <circle cx="24" cy="15" r="12" fill="white" fillOpacity="0.38"/>
        {/* Right  */} <circle cx="33" cy="24" r="12" fill="white" fillOpacity="0.38"/>
        {/* Bottom */} <circle cx="24" cy="33" r="12" fill="white" fillOpacity="0.38"/>
        {/* Left   */} <circle cx="15" cy="24" r="12" fill="white" fillOpacity="0.38"/>
      </g>

      {/* Center glow — the ikigai sweet-spot */}
      <circle cx="24" cy="24" r="7" fill={`url(#${glow})`}/>
      <circle cx="24" cy="24" r="3" fill="white"/>
    </svg>
  );
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'light';
  className?: string;
}

const SIZE_MAP = { sm: 28, md: 36, lg: 48 };
const TEXT_MAP = { sm: { name: 13, sub: 10 }, md: { name: 15, sub: 11 }, lg: { name: 18, sub: 13 } };

export function Logo({ size = 'md', showText = true, variant = 'default', className }: LogoProps) {
  const px = SIZE_MAP[size];
  const txt = TEXT_MAP[size];
  const nameColor = variant === 'light' ? '#fff' : '#0F0D1A';
  const subColor  = variant === 'light' ? 'rgba(255,255,255,.7)' : '#7C3AED';

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark size={px}/>
      {showText && (
        <span className="flex flex-col leading-none gap-0.5">
          <span style={{ fontSize: txt.name, fontWeight: 800, color: nameColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
            Ikagi
          </span>
          <span style={{ fontSize: txt.sub, fontWeight: 700, color: subColor, letterSpacing: '-0.01em', lineHeight: 1 }}>
            Learn
          </span>
        </span>
      )}
    </span>
  );
}
