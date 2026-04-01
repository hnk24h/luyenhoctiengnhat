import React from 'react';
import { SidebarLevel, SidebarSkill } from './LearnSidebar';

interface LearnBottomBarProps {
  levels: SidebarLevel[];
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  skills: SidebarSkill[];
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
}

export const LearnBottomBar: React.FC<LearnBottomBarProps> = ({
  levels, selectedLevel, setSelectedLevel, skills, selectedSkill, setSelectedSkill,
}) => {
  const safeLevels = Array.isArray(levels) ? levels : [];
  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex flex-col md:hidden"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ── Level tabs (horizontally scrollable) ── */}
      {safeLevels.length > 0 && (
        <div
          className="flex overflow-x-auto gap-2 px-3 pt-2.5 pb-2"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {safeLevels.map(lv => (
            <button
              key={lv.code}
              onClick={() => setSelectedLevel(lv.code)}
              className="flex flex-col items-center px-4 py-1.5 rounded-full font-bold text-[11px] transition-all whitespace-nowrap shrink-0 active:scale-95"
              style={
                selectedLevel === lv.code
                  ? {
                      background: 'var(--primary)',
                      color: '#fff',
                      boxShadow: '0 2px 10px color-mix(in srgb, var(--primary) 40%, transparent)',
                    }
                  : {
                      background: 'var(--bg-muted)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {lv.label}
              {lv.desc && (
                <span className="text-[9px] mt-0.5 font-normal opacity-70 leading-none">
                  {lv.desc}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Skill tabs ── */}
      {safeSkills.length > 0 && (
        <div className="flex border-t" style={{ borderColor: 'var(--border)' }}>
          {safeSkills.map(skill => {
            const isActive = selectedSkill === skill.key;
            return (
              <button
                key={skill.key}
                onClick={() => setSelectedSkill(skill.key)}
                className="flex flex-col items-center justify-center flex-1 py-2.5 gap-0.5 transition-all active:scale-95 min-w-0"
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  borderTop: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                  marginTop: '-1px',
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ fontSize: '15px', lineHeight: 1 }}
                >
                  {skill.icon}
                </span>
                <span
                  className="text-[10px] font-semibold leading-tight text-center w-full px-1.5 overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } as React.CSSProperties}
                >
                  {skill.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
