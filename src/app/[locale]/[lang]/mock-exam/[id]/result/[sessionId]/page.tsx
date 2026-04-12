import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import MockExamResultClient from './MockExamResultClient';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string; lang: string; id: string; sessionId: string }> }

export default async function MockExamResultPage({ params: rawParams }: Props) {
  const params = await rawParams;

  const session = await prisma.mockExamSession.findUnique({
    where: { id: params.sessionId },
    include: {
      mockExam: {
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
                select: { id: true, sectionId: true, content: true, options: true, answer: true, explain: true, partLabel: true, order: true },
              },
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!session) notFound();

  // Build per-section stats
  const sectionStats = session.mockExam.sections.map(sec => {
    const secAnswers = session.answers.filter(a => a.sectionId === sec.id);
    const correct = secAnswers.filter(a => a.isCorrect).length;
    const total = sec.questions.length;
    const timeUsed = (session.sectionTimes as Record<string, number> | null)?.[sec.id] ?? 0;
    return {
      id: sec.id,
      title: sec.title,
      titleVi: sec.titleVi,
      skill: sec.skill,
      total,
      correct,
      score: total > 0 ? Math.round((correct / total) * 100 * 10) / 10 : 0,
      timeUsed,
      questions: sec.questions.map(q => {
        const userAnswer = session.answers.find(a => a.questionId === q.id);
        return {
          id: q.id,
          content: q.content,
          options: (q.options ?? null) as string[] | null,
          correctAnswer: q.answer,
          explain: q.explain,
          partLabel: q.partLabel,
          userAnswer: userAnswer?.answer ?? null,
          isCorrect: userAnswer?.isCorrect ?? false,
        };
      }),
    };
  });

  return (
    <MockExamResultClient
      exam={{
        id: session.mockExam.id,
        title: session.mockExam.title,
        subject: session.mockExam.subject,
        levelCode: session.mockExam.levelCode,
        totalTime: session.mockExam.totalTime,
      }}
      session={{
        id: session.id,
        score: session.score ?? 0,
        correctQ: session.correctQ,
        totalQ: session.totalQ,
        startedAt: session.startedAt.toISOString(),
        finishedAt: session.finishedAt?.toISOString() ?? null,
      }}
      sectionStats={sectionStats}
      lang={params.lang}
    />
  );
}
