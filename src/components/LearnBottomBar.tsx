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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg flex flex-col md:hidden animate-fade-up">
      <div className="flex overflow-x-auto gap-2 px-2 py-2 scrollbar-hide">
        {safeLevels.map(lv => (
          <button
            key={lv.code}
            className={`flex flex-col items-center px-3 py-1 rounded-full font-semibold text-xs transition-all whitespace-nowrap ${selectedLevel === lv.code ? 'bg-primary text-white shadow-primary' : 'bg-muted text-ink-primary'}`}
            onClick={() => setSelectedLevel(lv.code)}
            style={{ minWidth: 56 }}
          >
            <span>{lv.label}</span>
            {lv.desc && <span className="text-[10px] mt-0.5 opacity-70">{lv.desc}</span>}
          </button>
        ))}
      </div>
      <div className="flex justify-around items-center px-2 py-1 border-t border-border bg-surface">
        {safeSkills.map(skill => (
          <button
            key={skill.key}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${selectedSkill === skill.key ? 'text-accent' : 'text-ink-muted'}`}
            onClick={() => setSelectedSkill(skill.key)}
          >
            <span className="text-2xl mb-1">{skill.icon}</span>
            <span className="text-xs font-semibold">{skill.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
