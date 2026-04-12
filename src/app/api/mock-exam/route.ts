import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/mock-exam — list published mock exams, filterable by subject & level
export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get('subject') ?? 'JLPT';
  const level = req.nextUrl.searchParams.get('level');

  const where: Record<string, unknown> = { published: true, subject };
  if (level) where.levelCode = level;

  const exams = await prisma.mockExam.findMany({
    where,
    include: {
      sections: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, titleVi: true, skill: true, timeLimit: true, order: true, _count: { select: { questions: true } } },
      },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ levelCode: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(exams);
}
