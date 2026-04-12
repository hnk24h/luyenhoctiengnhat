import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import MockExamClient from './MockExamClient';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string; lang: string; id: string }> }

export default async function MockExamPage({ params: rawParams }: Props) {
  const params = await rawParams;

  const exam = await prisma.mockExam.findUnique({
    where: { id: params.id, published: true },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true, sectionId: true, partLabel: true, partTitle: true,
              passageText: true, passageAudio: true, passageImage: true,
              content: true, options: true, audioUrl: true, imageUrl: true, order: true,
            },
          },
        },
      },
    },
  });

  if (!exam) notFound();

  return (
    <MockExamClient
      exam={{
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        levelCode: exam.levelCode,
        totalTime: exam.totalTime,
        sections: exam.sections.map(s => ({
          id: s.id,
          title: s.title,
          titleVi: s.titleVi,
          skill: s.skill,
          timeLimit: s.timeLimit,
          order: s.order,
          questions: s.questions.map(q => ({
            ...q,
            options: (q.options ?? null) as string[] | null,
          })),
        })),
      }}
    />
  );
}
