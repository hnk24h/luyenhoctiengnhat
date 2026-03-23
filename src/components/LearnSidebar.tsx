import React, { useState } from 'react';
import { FaLayerGroup, FaBookOpen, FaHeadphones, FaPenNib, FaBook, FaRetweet } from 'react-icons/fa6';


export interface SidebarLevel {
  code: string;
  label: string;
  desc?: string; // mô tả độ khó
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
}




export const LearnSidebar: React.FC<LearnSidebarProps> = ({
  selectedLevel, setSelectedLevel, selectedSkill, setSelectedSkill, levels, skills, title,
}) => {
  // Dummy progress for demo
  const progress = 0.42;
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
          {title || 'Học'}
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
      {/* Nested navigation: Level → Skill */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 md:p-5">
        <div>
          <div className="font-bold mb-2 text-sm text-ink-primary tracking-wide">Chọn cấp độ</div>
          <ul className="flex flex-col gap-2">
            {levels.map(lv => (
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
        {/* Only show skills after selecting a level */}
        {selectedLevel && (
          <div className="mt-5">
            <div className="font-bold mb-2 text-sm text-ink-primary tracking-wide">Chọn kỹ năng</div>
            <ul className="flex flex-col gap-2">
              {skills.map(skill => (
                <li key={skill.key}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 font-semibold transition-all border border-transparent ${selectedSkill === skill.key ? 'bg-accent text-white' : 'hover:bg-muted text-ink-primary'}`}
                    onClick={() => setSelectedSkill(skill.key)}
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-accent-light text-accent font-bold text-base">
                      {skill.icon}
                    </span>
                    <span className="flex-1 text-[14px] font-semibold">{skill.label}</span>
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
          Bắt đầu học ngay
        </button>
      </div>
    </aside>
  );
};
