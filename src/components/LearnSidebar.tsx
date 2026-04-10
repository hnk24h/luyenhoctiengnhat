'use client';

import React, { useState } from 'react';
import { FaLayerGroup, FaBookOpen, FaHeadphones, FaPenNib, FaBook, FaRetweet, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { UserProgressCard } from './learn/UserProgressCard';


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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}




export const LearnSidebar: React.FC<LearnSidebarProps> = ({
  selectedLevel, setSelectedLevel, selectedSkill, setSelectedSkill, levels, skills, title,
  collapsed = false, onToggleCollapse,
}) => {
  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-64'} max-w-full rounded-2xl flex flex-col transition-all duration-300 ease-in-out sticky top-[72px] self-start overflow-hidden`}
      style={{
        minWidth: collapsed ? 56 : 200,
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
        className={`flex items-center ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'} py-3.5 shrink-0 transition-all duration-300`}
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 72%, #000) 100%)',
        }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}>
          <FaLayerGroup size={15} className="text-white" />
        </div>
        <span className={`font-bold text-[14px] text-white tracking-wide select-none transition-all duration-300 ${
          collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
        }`}>
          {title || 'Học'}
        </span>
      </div>

      {/* User progress card */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <UserProgressCard collapsed={collapsed} />
      </div>

      {/* Scrollable content */}
      <div className={`flex-1 overflow-y-auto ${collapsed ? 'p-1.5' : 'p-3'} flex flex-col gap-4 transition-all duration-300`}>

        {/* Level selection */}
        <div>
          {!collapsed && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] px-1 mb-2"
              style={{ color: 'var(--text-muted)' }}>Cấp độ</div>
          )}
          <ul className="flex flex-col gap-1">
            {levels.map(lv => {
              const active = selectedLevel === lv.code;
              return (
                <li key={lv.code}>
                  <button
                    onClick={() => setSelectedLevel(lv.code)}
                    title={collapsed ? `${lv.label}${lv.desc ? ' — ' + lv.desc : ''}` : (lv.tooltip || lv.desc)}
                    className={`w-full text-left ${collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2.5'} rounded-xl flex items-center gap-3 transition-all focus:outline-none focus-visible:ring-2`}
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
                      className={`inline-flex items-center justify-center ${collapsed ? 'w-full' : 'w-9'} h-6 rounded-lg text-[11px] font-bold shrink-0`}
                      style={active
                        ? { background: 'var(--primary)', color: '#fff' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }
                      }
                    >
                      {lv.label}
                    </span>

                    {/* Desc - hidden when collapsed */}
                    {!collapsed && (
                      <span className="flex-1 flex flex-col min-w-0">
                        {lv.desc && (
                          <span className="text-[11px] font-normal leading-tight truncate"
                            style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {lv.desc}
                          </span>
                        )}
                      </span>
                    )}

                    {/* Mini progress - hidden when collapsed */}
                    {!collapsed && lv.percent !== undefined && (
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
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] px-1 mb-2"
                style={{ color: 'var(--text-muted)' }}>Kỹ năng</div>
            )}
            <ul className="flex flex-col gap-1">
              {skills.map(skill => {
                const active = selectedSkill === skill.key;
                return (
                  <li key={skill.key}>
                    <button
                      onClick={() => setSelectedSkill(skill.key)}
                      title={collapsed ? skill.label : undefined}
                      className={`w-full text-left ${collapsed ? 'px-0 justify-center' : 'px-3'} py-2.5 rounded-xl flex items-center gap-3 transition-all focus:outline-none focus-visible:ring-2`}
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
                      <span className={`flex-1 text-[13px] font-semibold transition-all duration-300 ${
                        collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
                      }`}>{skill.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Collapse/Expand toggle */}
      {onToggleCollapse && (
        <div className="shrink-0 p-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-3'} py-2 rounded-xl text-[12px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            style={{ color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
          >
            {collapsed
              ? <FaChevronRight size={12} className="transition-transform duration-300" />
              : <FaChevronLeft size={12} className="transition-transform duration-300" />
            }
            <span className={`transition-all duration-300 ${
              collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
            }`}>Thu gọn</span>
          </button>
        </div>
      )}
    </aside>
  );
};
