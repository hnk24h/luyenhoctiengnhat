
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ExamClient from './ExamClient';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { FaRegFile } from 'react-icons/fa6';
import Link from 'next/link';
import { ExamSidebarClient } from '@/components/learn/ExamSidebarClient';

interface Props { params: { lang: string; id: string } }


async function getExamSet(id: string) {
  return prisma.examSet.findUnique({
    where: { id },
    include: {
      level: true,
      questions: { orderBy: { order: 'asc' } },
    },
  });
}


async function getExamSetsByLevel(levelCode: string) {
  return prisma.examSet.findMany({
    where: { level: { code: levelCode } },
    orderBy: { title: 'asc' },
  });
}


async function getExamSkills(levelCode: string) {
  // Lấy các skill khác nhau trong examSet cùng cấp độ
  const examSets = await prisma.examSet.findMany({
    where: { level: { code: levelCode } },
    select: { skill: true },
    distinct: ['skill'],
  });
  return examSets.map(e => e.skill).filter(Boolean);
}

export const dynamic = 'force-dynamic';

import ExamPageClient from "./ExamPageClient";

export default async function ExamPage({ params }: Props) {
  const examSet = await getExamSet(params.id);
  if (!examSet) notFound();

  // Lấy danh sách các cấp độ theo subject (JLPT cho ja, HSK cho zh)
  let subject: 'JLPT' | 'HSK' = 'JLPT';
  if (params.lang === 'zh') subject = 'HSK';
  const allLevels = await prisma.level.findMany({ where: { subject }, orderBy: { order: 'asc' } });
  const LEVELS_OBJ = allLevels.map(lv => ({ code: lv.code, label: lv.code, desc: (lv as any).desc || '' }));

  // Lấy danh sách skill trong cấp độ này
  const skillKeys = await getExamSkills(examSet.level.code);
  const SKILLS = skillKeys.map((key: string) => ({ key, label: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Luyện thi', icon: <FaRegFile /> }));

  // Lấy danh sách các bài thi cùng cấp độ
  const examSetsSameLevel = await getExamSetsByLevel(examSet.level.code);

  // Chuẩn hóa examSets cho ExamSidebarClient
  const examSetsForSidebar = examSetsSameLevel.map(e => ({ id: e.id, title: e.title, skill: e.skill }));

  // Sanitize questions (don't expose answers to client)
  const questionsForClient = examSet.questions.map(q => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: (q.options ?? null) as string[] | null,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    order: q.order,
  }));

  return (
    <ExamPageClient
      levels={LEVELS_OBJ}
      skills={SKILLS}
      examSetsForSidebar={examSetsForSidebar}
      examSet={{
        ...examSet,
        lang: params.lang,
      }}
      questionsForClient={questionsForClient}
    />
  );
}
