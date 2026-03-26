"use client";
import { useState } from "react";
import { LearnLayout } from "@/components/learn/LearnLayout";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { FaRegFile } from "react-icons/fa6";
import { ExamSidebarClient } from "@/components/learn/ExamSidebarClient";
import ExamClient from "./ExamClient";
import Link from "next/link";

export default function ExamPageClient({
  levels,
  skills,
  examSetsForSidebar,
  examSet,
  questionsForClient,
}) {
  const [selectedLevel, setSelectedLevel] = useState(examSet.level.code);
  const [selectedSkill, setSelectedSkill] = useState(examSet.skill || (skills[0]?.key ?? "exam"));

  return (
    <LearnLayout
      sidebarProps={{
        customSidebar: (
          <ExamSidebarClient
            lang={examSet.lang}
            selectedLevel={selectedLevel}
            levels={levels}
            selectedSkill={selectedSkill}
            skills={skills}
            examSets={examSetsForSidebar}
          />
        ),
      }}
      bottomBarProps={{
        levels,
        selectedLevel,
        setSelectedLevel,
        skills,
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
        timeLimit={examSet.timeLimit}
        questions={questionsForClient}
      />
    </LearnLayout>
  );
}
