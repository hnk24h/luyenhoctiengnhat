import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const examSet = await prisma.examSet.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      level: { select: { code: true } },
    },
  });

  if (!examSet) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Strip the correct answer so the client can't cheat
  const questions = examSet.questions.map((q) => {
    const { answer: _a, explain: _e, ...rest } = q as typeof q & { answer: string; explain?: string };
    void _a; void _e;
    return rest;
  });

  return NextResponse.json({
    id: examSet.id,
    title: examSet.title,
    skill: examSet.skill,
    timeLimit: examSet.timeLimit,
    levelCode: examSet.level.code,
    questions,
  });
}
