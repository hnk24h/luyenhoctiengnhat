"use client";
import { useState } from "react";
import { LearnLayout } from "@/components/learn/LearnLayout";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { FaRegFile } from "react-icons/fa6";
import { ExamSidebarClient } from "@/components/learn/ExamSidebarClient";
import ExamClient from "./ExamClient";
import Link from "next/link";

interface Level {
  code: string;
  label: string;
  desc?: string;
  [key: string]: any;
}
interface Skill {
  key: string;
  label?: string;
  [key: string]: any;
}
interface ExamSet {
  id: string;
  title: string;
  skill: string;
  level: { code: string };
  lang: string;
  timeLimit?: number;
  [key: string]: any;
}
interface ExamPageClientProps {
  levels: Level[];
  skills: Skill[];
  examSetsForSidebar: any[];
  examSet: ExamSet;
  questionsForClient: any[];
}

export default function ExamPageClient({
  levels,
  skills,
  examSetsForSidebar,
  examSet,
  questionsForClient,
}: ExamPageClientProps) {
  const [selectedLevel, setSelectedLevel] = useState(examSet.level.code);
  const [selectedSkill, setSelectedSkill] = useState(examSet.skill || (skills[0]?.key ?? "exam"));

  // Ensure levels have label (string) for SidebarLevel compatibility
  const sidebarLevels = levels.map(lv => ({
    code: lv.code,
    label: lv.label ?? String(lv.code),
    desc: lv.desc ?? '',
  }));

  // Map skills to SidebarSkill[] (ensure icon is present)
  const sidebarSkills = skills.map((sk: any) => ({
    key: sk.key,
    label: sk.label ?? String(sk.key),
    icon: sk.icon ?? <FaRegFile size={18} />,
  }));

  return (
    <LearnLayout
      sidebarProps={{
        customSidebar: (
          <ExamSidebarClient
            lang={examSet.lang}
            selectedLevel={selectedLevel}
            levels={sidebarLevels}
            selectedSkill={selectedSkill}
            skills={sidebarSkills}
            examSets={examSetsForSidebar}
          />
        ),
      }}
      bottomBarProps={{
        levels: sidebarLevels,
        selectedLevel,
        setSelectedLevel,
        skills: sidebarSkills,
        selectedSkill,
        setSelectedSkill,
      }}
    >
      <LearnHeader icon={<FaRegFile />} title={examSet.title} subtitle={`Cấp độ: ${examSet.level.code}`} />
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link href={`/${examSet.lang}/levels`} className="hover:text-red-600">Cấp độ</Link>
        <span>/</span>
        <Link href={`/${examSet.lang}/levels/${examSet.level.code}`} className="hover:text-red-600">{examSet.level.code}</Link>
        <span>/</span>
        <span className="text-gray-800">{examSet.title}</span>
      </div>
      <ExamClient
        examSetId={examSet.id}
        title={examSet.title}
        skill={examSet.skill}
        level={examSet.level.code}
        timeLimit={typeof examSet.timeLimit === 'number' ? examSet.timeLimit : null}
        questions={questionsForClient}
      />
    </LearnLayout>
  );
}
