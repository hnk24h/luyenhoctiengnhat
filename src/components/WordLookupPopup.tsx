import React from 'react';
import { FaXmark } from 'react-icons/fa6';

interface WordLookupPopupProps {
  word: string;
  pos: { x: number; y: number };
  accent: string;
  hasPinyin: boolean;
  onClose: () => void;
}

export const WordLookupPopup: React.FC<WordLookupPopupProps> = ({ word, pos, accent, hasPinyin, onClose }) => {
  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{ top: pos.y - 8, left: pos.x, transform: 'translate(-50%, -100%)' }}
    >
      <div className="rounded-2xl shadow-xl border px-4 py-3 min-w-[160px] max-w-[220px]"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.18)' }}>
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-2 overflow-hidden">
          <div className="w-4 h-4 rotate-45 border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', marginTop: -8, marginLeft: 0 }} />
        </div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xl font-bold" style={{ fontFamily: hasPinyin ? 'Noto Sans SC, sans-serif' : 'Noto Sans JP, serif', color: accent }}>
            {word}
          </span>
          <button onClick={onClose}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-50"
            style={{ color: 'var(--text-muted)' }}>
            <FaXmark size={10} />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={hasPinyin
              ? `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(word)}`
              : `https://jisho.org/search/${encodeURIComponent(word)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold px-2 py-1 rounded-lg"
            style={{ background: `${accent}18`, color: accent }}>
            {hasPinyin ? 'MDBG' : 'Jisho'} →
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText(word).catch(() => { }); }}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
