import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Vui lòng đăng nhập để nộp bài.' }, { status: 401 });
  }

  const { examSetId, answers } = await req.json();
  if (!examSetId || !answers) {
    return NextResponse.json({ message: 'Thiếu dữ liệu bài thi.' }, { status: 400 });
  }

  const examSet = await prisma.examSet.findUnique({
    where: { id: examSetId },
    include: { questions: true },
  });
  if (!examSet) {
    return NextResponse.json({ message: 'Bộ đề không tồn tại.' }, { status: 404 });
  }

  // Chấm điểm
  let correctQ = 0;
  for (const q of examSet.questions) {
    const userAns: string = answers[q.id] ?? '';
    let correctAns: string | string[];
    try { correctAns = JSON.parse(q.answer); } catch { correctAns = q.answer; }

    const isCorrect = Array.isArray(correctAns)
      ? correctAns.includes(userAns.trim())
      : userAns.trim() === (correctAns as string).trim();

    if (isCorrect) correctQ++;
  }

  const totalQ = examSet.questions.length;
  const score = totalQ > 0 ? parseFloat(((correctQ / totalQ) * 100).toFixed(1)) : 0;
  const userId = (session.user as any).id;

  const examSession = await prisma.examSession.create({
    data: {
      userId,
      examSetId,
      score,
      totalQ,
      correctQ,
      finishedAt: new Date(),
      answers: {
        create: examSet.questions.map(q => {
          const userAns: string = answers[q.id] ?? '';
          let correctAns: string | string[];
          try { correctAns = JSON.parse(q.answer); } catch { correctAns = q.answer; }
          const isCorrect = Array.isArray(correctAns)
            ? correctAns.includes(userAns.trim())
            : userAns.trim() === (correctAns as string).trim();
          return { questionId: q.id, answer: userAns, isCorrect };
        }),
      },
    },
  });

  // Cập nhật tiến trình
  const prog = await prisma.userProgress.findUnique({
    where: { userId_examSetId: { userId, examSetId } },
  });
  if (prog) {
    await prisma.userProgress.update({
      where: { userId_examSetId: { userId, examSetId } },
      data: {
        attempts: prog.attempts + 1,
        bestScore: Math.max(prog.bestScore ?? 0, score),
        completed: true,
        lastAttempt: new Date(),
      },
    });
  } else {
    await prisma.userProgress.create({
      data: {
        userId, examSetId, completed: true,
        bestScore: score, attempts: 1, lastAttempt: new Date(),
      },
    });
  }

  // Remove the manual scoring loop since it's now inline in ExamAnswer create
  // Keep scoring variables from the loop above
  return NextResponse.json({ sessionId: examSession.id, score, correctQ, totalQ });
}
