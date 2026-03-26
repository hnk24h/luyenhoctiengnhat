'use client';

import React, { useState } from 'react';
import { LearnBottomBar } from '../LearnBottomBar';

interface SidebarLevel {
  code: string;
  label: string;
  desc?: string;
}
interface SidebarSkill {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface LevelBottomBarClientProps {
  levels: SidebarLevel[];
  skills: SidebarSkill[];
  initialLevel: string;
  initialSkill: string;
  onLevelChange?: (level: string) => void;
  onSkillChange?: (skill: string) => void;
}

export const LevelBottomBarClient: React.FC<LevelBottomBarClientProps> = ({
  levels,
  skills,
  initialLevel,
  initialSkill,
  onLevelChange,
  onSkillChange,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    onLevelChange?.(level);
  };
  const handleSkillChange = (skill: string) => {
    setSelectedSkill(skill);
    onSkillChange?.(skill);
  };

  return (
    <LearnBottomBar
      levels={levels}
      selectedLevel={selectedLevel}
      setSelectedLevel={handleLevelChange}
      skills={skills}
      selectedSkill={selectedSkill}
      setSelectedSkill={handleSkillChange}
    />
  );
};
