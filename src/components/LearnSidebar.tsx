'use client';

import React, { useState } from 'react';
import { FaLayerGroup, FaBookOpen, FaHeadphones, FaPenNib, FaBook, FaRetweet } from 'react-icons/fa6';


export interface SidebarLevel {
  code: string;
  label: string;
  desc?: string; // mô tả độ khó
  percent?: number;
  status?: 'not-started' | 'in-progress' | 'completed';
  learned?: number;
  total?: number;
  tooltip?: string;
}
export interface SidebarSkill {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface LearnSidebarProps {
  mode: 'level' | 'skill';
  setMode: (mode: 'level' | 'skill') => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  levels: SidebarLevel[];
  skills: SidebarSkill[];
  title?: string;
  showLevelProgress?: boolean;
}




export const LearnSidebar: React.FC<LearnSidebarProps> = ({
  selectedLevel, setSelectedLevel, selectedSkill, setSelectedSkill, levels, skills, title,
}) => {
  return (
    <aside
      className="w-64 max-w-full rounded-2xl flex flex-col transition-all duration-300 sticky top-[72px] self-start overflow-hidden"
      style={{
        minWidth: 200,
        zIndex: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        maxHeight: 'calc(100vh - 88px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5 shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 72%, #000) 100%)',
        }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}>
          <FaLayerGroup size={15} className="text-white" />
        </div>
        <span className="font-bold text-[14px] text-white tracking-wide select-none">
          {title || 'Học'}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">

        {/* Level selection */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] px-1 mb-2"
            style={{ color: 'var(--text-muted)' }}>Cấp độ</div>
          <ul className="flex flex-col gap-1">
            {levels.map(lv => {
              const active = selectedLevel === lv.code;
              return (
                <li key={lv.code}>
                  <button
                    onClick={() => setSelectedLevel(lv.code)}
                    title={lv.tooltip || lv.desc}
                    className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all focus:outline-none focus-visible:ring-2"
                    style={active
                      ? {
                          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--primary) 30%, transparent)',
                        }
                      : { color: 'var(--text-secondary)' }
                    }
                  >
                    {/* Level badge */}
                    <span
                      className="inline-flex items-center justify-center w-9 h-6 rounded-lg text-[11px] font-bold shrink-0"
                      style={active
                        ? { background: 'var(--primary)', color: '#fff' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                      }
                    >
                      {lv.label}
                    </span>

                    {/* Desc */}
                    <span className="flex-1 flex flex-col min-w-0">
                      {lv.desc && (
                        <span className="text-[11px] font-normal leading-tight truncate"
                          style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {lv.desc}
                        </span>
                      )}
                    </span>

                    {/* Mini progress */}
                    {lv.percent !== undefined && (
                      <span className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="w-10 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-muted)' }}>
                          <span className="h-1.5 rounded-full block transition-all"
                            style={{
                              width: `${lv.percent}%`,
                              background: lv.percent === 100 ? '#22c55e' : lv.percent > 0 ? 'var(--primary)' : 'transparent',
                            }} />
                        </span>
                        <span className="text-[9px] font-semibold"
                          style={{ color: lv.percent === 100 ? '#22c55e' : lv.percent > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {lv.percent}%
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Skill selection */}
        {selectedLevel && skills.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] px-1 mb-2"
              style={{ color: 'var(--text-muted)' }}>Kỹ năng</div>
            <ul className="flex flex-col gap-1">
              {skills.map(skill => {
                const active = selectedSkill === skill.key;
                return (
                  <li key={skill.key}>
                    <button
                      onClick={() => setSelectedSkill(skill.key)}
                      className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all focus:outline-none focus-visible:ring-2"
                      style={active
                        ? {
                            background: 'color-mix(in srgb, var(--accent, #7C3AED) 12%, transparent)',
                            color: 'var(--accent, #7C3AED)',
                            fontWeight: 600,
                            boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--accent, #7C3AED) 30%, transparent)',
                          }
                        : { color: 'var(--text-secondary)' }
                      }
                    >
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 text-[14px]"
                        style={active
                          ? { background: 'var(--accent, #7C3AED)', color: '#fff' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                        }
                      >
                        {skill.icon}
                      </span>
                      <span className="flex-1 text-[13px] font-semibold">{skill.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
