import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ExamClient from './ExamClient';
import { getSkillLabel } from '@/lib/utils';
import Link from 'next/link';

interface Props { params: { id: string } }

async function getExamSet(id: string) {
  return prisma.examSet.findUnique({
    where: { id },
    include: {
      level: true,
      questions: { orderBy: { order: 'asc' } },
    },
  });
}

export const dynamic = 'force-dynamic';

export default async function ExamPage({ params }: Props) {
  const examSet = await getExamSet(params.id);
  if (!examSet) notFound();

  // Sanitize questions (don't expose answers to client)
  const questionsForClient = examSet.questions.map(q => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: q.options ? JSON.parse(q.options) : null,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    order: q.order,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link href="/levels" className="hover:text-red-600">Cấp độ</Link>
        <span>/</span>
        <Link href={`/levels/${examSet.level.code}`} className="hover:text-red-600">{examSet.level.code}</Link>
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
    </div>
  );
}
