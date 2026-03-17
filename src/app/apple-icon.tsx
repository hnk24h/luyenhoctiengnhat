import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// 4-circle Ikigai mark, scaled to 180px
export default function AppleIcon() {
  const C = 90;  // center
  const d = 19;  // offset from center to each circle's center
  const r = 68;  // circle diameter in px
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
        borderRadius: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top */}
        <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%',
          background: 'rgba(255,255,255,0.40)',
          top: C - d - r / 2, left: C - r / 2 }}/>
        {/* Right */}
        <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%',
          background: 'rgba(255,255,255,0.40)',
          top: C - r / 2, left: C + d - r / 2 }}/>
        {/* Bottom */}
        <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%',
          background: 'rgba(255,255,255,0.40)',
          top: C + d - r / 2, left: C - r / 2 }}/>
        {/* Left */}
        <div style={{ position: 'absolute', width: r, height: r, borderRadius: '50%',
          background: 'rgba(255,255,255,0.40)',
          top: C - r / 2, left: C - d - r / 2 }}/>
        {/* Center glow */}
        <div style={{ position: 'absolute', width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          top: C - 22, left: C - 22 }}/>
        {/* Center dot */}
        <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%',
          background: 'white', top: C - 9, left: C - 9 }}/>
      </div>
    ),
    { ...size, fonts: [] },
  );
}
