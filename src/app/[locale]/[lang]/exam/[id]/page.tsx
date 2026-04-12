
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ExamClient from './ExamClient';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { FaRegFile } from 'react-icons/fa6';
import Link from 'next/link';
import { ExamSidebarClient } from '@/components/learn/ExamSidebarClient';

interface Props { params: Promise<{ locale: string; lang: string; id: string }> }


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

export default async function ExamPage({ params: rawParams }: Props) {
  const params = await rawParams;
  const examSet = await getExamSet(params.id);
  if (!examSet) notFound();

  // Lấy danh sách các cấp độ theo subject (JLPT cho ja, HSK cho zh)
  let subject: 'JLPT' | 'HSK' = 'JLPT';
  if (params.lang === 'zh') subject = 'HSK';
  const allLevels = await prisma.level.findMany({ where: { subject }, orderBy: { order: 'asc' } });
  const JA_DESCS: Record<string, string> = { N5: 'Sơ cấp', N4: 'Sơ trung cấp', N3: 'Trung cấp', N2: 'Trung cao cấp', N1: 'Cao cấp' };
  const ZH_DESCS: Record<string, string> = { HSK1: 'Nhập môn', HSK2: 'Sơ cấp', HSK3: 'Trung cấp', HSK4: 'Trên trung cấp', HSK5: 'Cao cấp', HSK6: 'Thành thạo' };
  const descMap = params.lang === 'zh' ? ZH_DESCS : JA_DESCS;
  const LEVELS_OBJ = allLevels.map(lv => ({ code: lv.code, label: lv.code, desc: descMap[lv.code] ?? lv.description ?? '' }));

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
      locale={params.locale}
      levels={LEVELS_OBJ}
      skills={SKILLS}
      examSetsForSidebar={examSetsForSidebar}
      examSet={{
        ...examSet,
        lang: params.lang,
        timeLimit: examSet.timeLimit === null ? undefined : examSet.timeLimit,
      }}
      questionsForClient={questionsForClient}
    />
  );
}
