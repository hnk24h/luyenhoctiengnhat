import React, { useState } from 'react';

interface Card {
  id: string;
  front: string;
  back: string;
  reading?: string | null;
  example?: string | null;
}

interface AnkiStudyTabProps {
  items: Card[];
  tier: 'free' | 'basic' | 'premium';
  font: string;
}

const RATING_CONFIG = [
  { rating: 0, label: 'Lại', bg: '#FEE2E2', color: '#DC2626' },
  { rating: 1, label: 'Khó', bg: '#FEF3C7', color: '#D97706' },
  { rating: 2, label: 'Tốt', bg: '#DCFCE7', color: '#16A34A' },
  { rating: 3, label: 'Dễ', bg: '#EFF6FF', color: '#2563EB' },
];


export const AnkiStudyTab: React.FC<AnkiStudyTabProps> = ({ items, tier, font }) => {
  // All hooks must be at top-level
  const PRESETS = [10, 20, 50, 0]; // 0 = all
  const [showSetup, setShowSetup] = useState(true);
  const [limitPreset, setLimitPreset] = useState(10);
  const [useCustom, setUseCustom] = useState(false);
  const [customCount, setCustomCount] = useState('');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);
  const [queue, setQueue] = useState<Card[]>([]);

  React.useEffect(() => {
    if (!showSetup) {
      let n = useCustom ? Math.max(1, parseInt(customCount) || items.length) : (limitPreset === 0 ? items.length : limitPreset);
      setQueue(items.slice(0, Math.min(n, items.length)));
      setIdx(0);
      setFlipped(false);
      setSessionDone(0);
      setSessionAgain(0);
      setFinished(items.length === 0);
    }
  }, [showSetup, items, limitPreset, useCustom, customCount]);

  const currentCard = queue[idx] ?? null;
  const progress = idx / (queue.length || 1);

  function rate(rating: number) {
    if (!currentCard) return;
    setSessionDone(n => n + 1);
    if (rating === 0) {
      setSessionAgain(n => n + 1);
      setIdx(i => i + 1);
    } else {
      setIdx(i => i + 1);
    }
    setFlipped(false);
    if (idx + 1 >= queue.length) setFinished(true);
  }

  // Access control UI (must be after hooks)
  if (tier === 'free') {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-2xl p-8 text-center shadow-md mt-4">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-xl font-bold mb-2 text-gray-700">Chỉ dành cho tài khoản Basic hoặc Premium.</div>
        <button className="mt-4 px-6 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm shadow hover:bg-blue-600">Nâng cấp</button>
      </div>
    );
  }

  // Study screen
  return (
    <div className="flex flex-col items-center justify-center px-2 sm:px-4">
      {/* Progress bar */}
      <div className="w-full max-w-xl flex items-center gap-2 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%`, background: '#F59E0B' }} />
            </div>
            <span className="text-xs shrink-0 text-gray-500">{idx + 1} / {queue.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs ml-2" style={{ color: '#D97706' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M13 16h-1v-4l-2-2" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {queue.length - idx} còn lại
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="btn-ghost p-1.5 ml-2"
          title="Cài đặt phiên ôn"
          style={{ color: '#F59E0B' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.5-3.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z" stroke="#F59E0B" strokeWidth="2"/></svg>
        </button>
      </div>
      {/* Card area */}
      <div
        className="w-full max-w-xl cursor-pointer select-none mb-6"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: '1200px', maxWidth: '100vw' }}
      >
        <div style={{
          display: 'grid',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Front face */}
          <div
            className="card flex flex-col items-center justify-center p-4 sm:p-8"
            style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderTop: '4px solid #F59E0B',
            minHeight: 240,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}>
            <div className="text-xs font-semibold mb-4 px-3 py-1 rounded-full shrink-0 bg-yellow-100 text-yellow-700">Mặt trước</div>
            <div
              className="text-center font-bold w-full"
              style={{
                color: '#222',
                fontFamily: font,
                lineHeight: 1.4,
                fontSize: 'clamp(1.1rem, 4vw, 2rem)',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}>
              {currentCard?.front}
            </div>
            {currentCard?.reading && (
              <div className="mt-3 text-base sm:text-lg text-center w-full text-gray-500" style={{ fontFamily: font, wordBreak: 'break-word' }}>
                {currentCard.reading}
              </div>
            )}
            <div className="mt-6 text-xs shrink-0 text-gray-400">
              Nhấn hoặc click để lật thẻ
            </div>
          </div>
          {/* Back face */}
          <div
            className="card flex flex-col items-center justify-center p-4 sm:p-8"
            style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderTop: '4px solid #F59E0B',
            minHeight: 240,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}>
            <div className="text-xs font-semibold mb-4 px-3 py-1 rounded-full shrink-0 bg-green-100 text-green-700">Mặt sau</div>
            <div
              className="text-center font-bold mb-2 w-full"
              style={{
                color: '#222',
                fontSize: 'clamp(1rem, 3.5vw, 1.5rem)',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}>
              {currentCard?.back}
            </div>
            {currentCard?.reading && (
              <div className="text-sm sm:text-base text-center w-full mt-1 text-gray-500" style={{ fontFamily: font, wordBreak: 'break-word' }}>
                {currentCard.reading}
              </div>
            )}
            {currentCard?.example && (
              <div className="mt-4 p-3 rounded-lg text-sm text-center w-full bg-yellow-100 text-yellow-700" style={{ lineHeight: 1.7, wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                {currentCard.example}
              </div>
            )}
            <div className="mt-5 text-xs shrink-0 text-gray-400">
              Nhấn để lật lại mặt trước
            </div>
          </div>
        </div>
      </div>
      {/* Rating buttons */}
      {flipped ? (
        <div className="mt-6 w-full max-w-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-2">
            <p className="text-sm text-gray-500">Bạn nhớ từ này như thế nào?</p>
            <button
              onClick={() => setFlipped(false)}
              className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-gray-500 bg-yellow-100"
              style={{ minWidth: 80 }}>
              Lật lại
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {RATING_CONFIG.map(({ rating, label, bg, color }) => (
              <button
                key={rating}
                onClick={() => rate(rating)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: bg, color, minWidth: 90 }}>
                <span className="text-lg font-bold">{label}</span>
                <span className="text-xs opacity-50 font-mono">[{rating + 1}]</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="mt-6 btn-primary flex items-center gap-2 px-6 sm:px-8 py-3 text-base bg-yellow-400 text-white rounded-xl font-bold"
          style={{ minWidth: 120 }}>
          Lật thẻ
        </button>
      )}
    </div>
  );
};
