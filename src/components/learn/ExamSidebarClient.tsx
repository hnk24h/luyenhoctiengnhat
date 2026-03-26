"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LearnSidebar } from "../LearnSidebar";

export interface SidebarLevel {
  code: string;
  label: string;
  desc?: string;
}
export interface SidebarSkill {
  key: string;
  label: string;
  icon: React.ReactNode;
}


interface ExamSet {
  id: string;
  title: string;
  skill: string;
}

interface ExamSidebarClientProps {
  lang: string;
  selectedLevel: string;
  levels: SidebarLevel[];
  selectedSkill: string;
  skills: SidebarSkill[];
  examSets: ExamSet[];
  onSkillChange?: (skill: string) => void;
}

import { useState, useEffect } from "react";

export const ExamSidebarClient: React.FC<ExamSidebarClientProps> = ({
  lang,
  selectedLevel,
  levels,
  selectedSkill: initialSkill,
  skills,
  examSets,
  onSkillChange,
}) => {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState(initialSkill || (skills[0]?.key ?? ''));

  // Reset skill về mặc định khi đổi cấp độ hoặc danh sách kỹ năng
  useEffect(() => {
    setSelectedSkill(skills[0]?.key ?? '');
    if (onSkillChange) onSkillChange(skills[0]?.key ?? '');
  }, [selectedLevel, skills]);

  // Khi chọn skill mới, đồng bộ lên parent nếu có onSkillChange
  const handleSkillChange = (skill: string) => {
    setSelectedSkill(skill);
    if (onSkillChange) onSkillChange(skill);
  };

  // Filter exam sets by selected skill
  const filteredExamSets = examSets.filter(e => e.skill === selectedSkill);

  return (
    <LearnSidebar
      mode="level"
      setMode={() => {}}
      selectedLevel={selectedLevel}
      setSelectedLevel={lv => router.push(`/${lang}/levels/${lv}`)}
      selectedSkill={selectedSkill}
      setSelectedSkill={handleSkillChange}
      levels={levels}
      skills={skills}
      title="Luyện thi"
    />
  );
};
