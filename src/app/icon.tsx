import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// 4-circle Ikigai mark, scaled to 32px
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
        borderRadius: '9px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top circle */}
        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.42)', top: 2, left: 8 }}/>
        {/* Right circle */}
        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.42)', top: 8, left: 14 }}/>
        {/* Bottom circle */}
        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.42)', top: 14, left: 8 }}/>
        {/* Left circle */}
        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.42)', top: 8, left: 2 }}/>
        {/* Center sweet-spot dot */}
        <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%',
          background: 'white', top: 13, left: 13 }}/>
      </div>
    ),
    { ...size, fonts: [] },
  );
}
