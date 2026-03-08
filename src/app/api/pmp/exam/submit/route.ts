import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/pmp/exam/submit
// Body: { answers: { questionId, selected, correct }[], areaCode?: string | null }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Vui lòng đăng nhập.' }, { status: 401 });

  const { answers, areaCode } = await req.json() as {
    answers: { questionId: string; selected: string; correct: boolean }[];
    areaCode?: string | null;
  };

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ message: 'Không có câu trả lời.' }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  const totalQ = answers.length;
  const correctQ = answers.filter(a => a.correct).length;
  const score = parseFloat(((correctQ / totalQ) * 100).toFixed(1));

  const examSession = await prisma.pMPExamSession.create({
    data: {
      userId,
      areaCode: areaCode || null,
      score,
      totalQ,
      correctQ,
      finishedAt: new Date(),
      answers: {
        create: answers.map(a => ({
          questionId: a.questionId,
          answer: a.selected,
          isCorrect: a.correct,
        })),
      },
    },
  });

  // Update PMPUserProgress per knowledge area if questions have area codes
  const questionIds = answers.map(a => a.questionId);
  const questions = await prisma.pMPExamQuestion.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, area: true, processId: true, process: { select: { knowledgeAreaId: true, knowledgeArea: { select: { code: true } } } } },
  });

  const areaStats: Record<string, { attempted: number; correct: number }> = {};
  for (const q of questions) {
    const areaCode = q.area ?? q.process?.knowledgeArea?.code ?? 'general';
    if (!areaStats[areaCode]) areaStats[areaCode] = { attempted: 0, correct: 0 };
    const ans = answers.find(a => a.questionId === q.id);
    if (ans) {
      areaStats[areaCode].attempted++;
      if (ans.correct) areaStats[areaCode].correct++;
    }
  }

  for (const [area, stats] of Object.entries(areaStats)) {
    const prog = await prisma.pMPUserProgress.findUnique({
      where: { userId_knowledgeArea: { userId, knowledgeArea: area } },
    });
    if (prog) {
      await prisma.pMPUserProgress.update({
        where: { userId_knowledgeArea: { userId, knowledgeArea: area } },
        data: {
          questionsAttempted: prog.questionsAttempted + stats.attempted,
          questionsCorrect: prog.questionsCorrect + stats.correct,
        },
      });
    } else {
      await prisma.pMPUserProgress.create({
        data: { userId, knowledgeArea: area, questionsAttempted: stats.attempted, questionsCorrect: stats.correct },
      });
    }
  }

  return NextResponse.json({ sessionId: examSession.id, score, totalQ, correctQ }, { status: 201 });
}
