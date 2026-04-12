import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/mock-exam/[id]/submit — submit a completed mock exam
export async function POST(
  req: NextRequest,
  { params: rawParams }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: mockExamId } = await rawParams;
  const body = await req.json();
  const { answers, sectionTimes } = body as {
    answers: Record<string, string>; // questionId → answer
    sectionTimes?: Record<string, number>; // sectionId → secondsUsed
  };

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Missing answers' }, { status: 400 });
  }

  // Load exam with questions (including answers)
  const exam = await prisma.mockExam.findUnique({
    where: { id: mockExamId },
    include: {
      sections: {
        include: { questions: { select: { id: true, sectionId: true, answer: true } } },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  // Grade answers
  const allQuestions = exam.sections.flatMap(s => s.questions);
  let correctQ = 0;
  const answerRecords: { sectionId: string; questionId: string; answer: string; isCorrect: boolean }[] = [];

  for (const q of allQuestions) {
    const userAnswer = answers[q.id];
    if (!userAnswer) continue;
    const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (isCorrect) correctQ++;
    answerRecords.push({
      sectionId: q.sectionId,
      questionId: q.id,
      answer: userAnswer,
      isCorrect,
    });
  }

  const totalQ = allQuestions.length;
  const score = totalQ > 0 ? Math.round((correctQ / totalQ) * 100 * 10) / 10 : 0;

  // Create session + answers
  const examSession = await prisma.mockExamSession.create({
    data: {
      userId: session.user.id,
      mockExamId,
      totalQ,
      correctQ,
      score,
      sectionTimes: sectionTimes ?? {},
      finishedAt: new Date(),
      answers: {
        create: answerRecords,
      },
    },
  });

  return NextResponse.json({
    sessionId: examSession.id,
    score,
    correctQ,
    totalQ,
  });
}
