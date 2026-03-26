import React, { useState } from 'react';
import { FaLayerGroup, FaBolt, FaFolder, FaBookmark } from 'react-icons/fa6';

const VOCAB_LEVELS = [
  { code: 'N5', label: 'N5', desc: 'Sơ cấp' },
  { code: 'N4', label: 'N4', desc: 'Sơ trung cấp' },
  { code: 'N3', label: 'N3', desc: 'Trung cấp' },
  { code: 'N2', label: 'N2', desc: 'Trung cao cấp' },
  { code: 'N1', label: 'N1', desc: 'Cao cấp' },
];

const VOCAB_FUNCTIONS = [
  { key: 'flashcard', label: 'Học Flashcard', icon: <FaLayerGroup /> },
  { key: 'srs', label: 'Học SRS', icon: <FaBolt /> },
  { key: 'topics', label: 'Theo chủ đề', icon: <FaFolder /> },
  { key: 'mine', label: 'Từ vựng của tôi', icon: <FaBookmark /> },
];

export interface VocabSidebarProps {
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedFunc: string;
  setSelectedFunc: (func: string) => void;
}

export const VocabSidebar: React.FC<VocabSidebarProps> = ({
  selectedLevel, setSelectedLevel, selectedFunc, setSelectedFunc,
}) => {
  // Dummy progress for demo
  const progress = 0.33;
  return (
    <aside
      className="w-72 max-w-full rounded-xl flex flex-col transition-all duration-300 animate-fade-up sticky top-8 self-start shadow-sm"
      style={{
        minWidth: 220,
        zIndex: 20,
        boxShadow: '0 2px 12px 0 rgba(61,58,140,0.04)',
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-4 border-b rounded-t-xl"
        style={{
          borderBottom: '1.5px solid var(--border)',
          background: 'linear-gradient(90deg, var(--primary) 90%, var(--primary-light) 100%)',
        }}
      >
        <FaLayerGroup size={22} className="text-white drop-shadow" />
        <span className="font-bold text-lg text-white tracking-wide select-none">
          Học từ vựng
        </span>
      </div>
      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-ink-muted">Tiến trình</span>
          <span className="text-xs font-bold text-primary">{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      {/* Nested navigation: Level → Function */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 md:p-5">
        <div>
          <div className="font-bold mb-2 text-sm text-ink-primary tracking-wide">Chọn cấp độ</div>
          <ul className="flex flex-col gap-2">
            {VOCAB_LEVELS.map(lv => (
              <li key={lv.code}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all border border-transparent ${selectedLevel === lv.code ? 'bg-primary text-white' : 'hover:bg-muted text-ink-primary'}`}
                  onClick={() => setSelectedLevel(lv.code)}
                >
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-light text-primary font-bold text-xs mr-2 min-w-fit">
                    {lv.label}
                  </span>
                  <span className="flex-1 flex flex-col items-start">
                    <span className="text-[14px] font-semibold leading-tight">{lv.label}</span>
                    {lv.desc && (
                      <span className="text-[11px] text-ink-muted font-normal mt-0.5 leading-tight">{lv.desc}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Only show functions after selecting a level */}
        {selectedLevel && (
          <div className="mt-5">
            <div className="font-bold mb-2 text-sm text-ink-primary tracking-wide">Chọn chức năng</div>
            <ul className="flex flex-col gap-2">
              {VOCAB_FUNCTIONS.map(func => (
                <li key={func.key}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 font-semibold transition-all border border-transparent ${selectedFunc === func.key ? 'bg-accent text-white' : 'hover:bg-muted text-ink-primary'}`}
                    onClick={() => setSelectedFunc(func.key)}
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent-light text-accent font-bold text-base">
                      {func.icon}
                    </span>
                    <span className="flex-1 text-[14px] font-semibold">{func.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* CTA */}
      <div className="px-5 pb-4 pt-2">
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-bold text-sm shadow transition-all hover:brightness-110">
          Bắt đầu học từ vựng
        </button>
      </div>
    </aside>
  );
};
