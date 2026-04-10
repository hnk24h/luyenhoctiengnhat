'use client';

import React, { useState } from 'react';
import {
  FaNewspaper, FaBook, FaAlignLeft, FaAlignJustify,
  FaClock, FaCircleCheck, FaGraduationCap,
} from 'react-icons/fa6';

import type { PassageSummary, PassageDetail } from './types';
import { LEVEL_META, TYPE_META } from './constants';
import { readTime } from './helpers';
import { GrammarPanel } from './ReadingComponents';

export function PassageListPanel({ passages, selectedId, onSelect, loading, isChinese, selectedType, onTypeSelect, readIds = [], currentPassage }: {
  passages: PassageSummary[]; selectedId: string | null;
  onSelect: (id: string) => void; loading: boolean; isChinese: boolean;
  selectedType: string; onTypeSelect: (t: string) => void;
  readIds?: string[]; currentPassage?: PassageDetail | null;
}) {
  const [tab, setTab] = useState<'list' | 'grammar'>('list');
  const chips = [
    { key: '', label: 'Tất cả', icon: <FaBook size={10} /> },
    { key: 'short', label: 'Đoạn ngắn', icon: <FaAlignLeft size={10} /> },
    { key: 'long', label: 'Bài dài', icon: <FaAlignJustify size={10} /> },
    { key: 'news', label: 'Tin tức', icon: <FaNewspaper size={10} /> },
  ];

  const showGrammarTab = !isChinese && currentPassage;

  return (
    <aside
      className="w-full rounded-2xl flex flex-col transition-all duration-300 sticky top-[72px] self-start overflow-hidden"
      style={{
        zIndex: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        maxHeight: 'calc(100vh - 88px)',
      }}
    >
      {/* Tab header */}
      <div className="flex shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setTab('list')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-bold transition-all"
          style={tab === 'list'
            ? { background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 72%, #000) 100%)', color: '#fff' }
            : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
          <FaNewspaper size={11} />
          Bài đọc
          {!loading && passages.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={tab === 'list' ? { background: 'rgba(255,255,255,0.2)' } : { background: 'var(--border)' }}>
              {passages.length}
            </span>
          )}
        </button>
        {showGrammarTab && (
          <button onClick={() => setTab('grammar')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-bold transition-all"
            style={tab === 'grammar'
              ? { background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', color: '#fff' }
              : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            <FaGraduationCap size={11} />
            Ngữ pháp
          </button>
        )}
      </div>

      {tab === 'list' ? (
        <>
          {/* Filter chips */}
          {!isChinese && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2.5 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              {chips.map(c => {
                const active = selectedType === c.key;
                return (
                  <button key={c.key} onClick={() => onTypeSelect(c.key)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                    style={active
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Passage list */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
            style={{ scrollbarWidth: 'thin' } as React.CSSProperties}>
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="rounded-xl animate-pulse p-3"
                  style={{ background: 'var(--bg-muted)', height: 72 }}>
                  <div className="h-2.5 w-3/4 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-2 w-1/2 rounded mt-2.5" style={{ background: 'var(--border)' }} />
                </div>
              ))
            ) : passages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">📭</span>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Chưa có bài đọc</p>
              </div>
            ) : (
              passages.map(p => {
                const active = p.id === selectedId;
                const lm = LEVEL_META[p.level] ?? LEVEL_META.N5;
                const tm = TYPE_META[p.type];
                const isRead = readIds.includes(p.id);
                return (
                  <button key={p.id} onClick={() => onSelect(p.id)}
                    className="w-full text-left rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden p-2.5"
                    style={active
                      ? { background: `color-mix(in srgb, ${lm.color} 8%, transparent)`, border: `1.5px solid ${lm.color}44`, boxShadow: `0 2px 8px ${lm.color}12` }
                      : { background: 'transparent', border: '1.5px solid transparent' }}>
                    <h4 className="text-[12px] font-bold leading-tight line-clamp-2"
                      style={{
                        color: active ? lm.color : 'var(--text-primary)',
                        fontFamily: isChinese ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
                      }}>
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: lm.bg, color: lm.color }}>
                        {p.level}
                      </span>
                      {tm && (
                        <span className="text-[8px] flex items-center gap-0.5 font-medium"
                          style={{ color: tm.color }}>
                          {tm.icon}
                        </span>
                      )}
                      {active ? (
                        <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                          style={{ background: '#DBEAFE', color: '#2563EB' }}>
                          ● Đang đọc
                        </span>
                      ) : isRead ? (
                        <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                          style={{ background: '#DCFCE7', color: '#15803D' }}>
                          <FaCircleCheck size={7} /> Đã đọc
                        </span>
                      ) : null}
                      <span className="text-[9px] flex items-center gap-0.5 ml-auto"
                        style={{ color: 'var(--text-muted)' }}>
                        <FaClock size={7} /> {readTime(p.charCount)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Grammar tab */
        <div className="flex-1 overflow-y-auto p-2"
          style={{ scrollbarWidth: 'thin' } as React.CSSProperties}>
          {currentPassage ? (
            <GrammarPanel passage={currentPassage} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <FaGraduationCap size={24} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Chọn bài đọc để xem ngữ pháp</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
