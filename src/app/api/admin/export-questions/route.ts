import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/export-questions?examSetId=xxx
 * Returns importable JSON of an exam set + all questions
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examSetId = searchParams.get('examSetId');

  if (!examSetId) {
    // Return all exam sets summary
    const sets = await prisma.examSet.findMany({
      include: {
        level: { select: { code: true } },
        _count: { select: { questions: true } },
      },
      orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }],
    });
    return NextResponse.json(sets.map(s => ({
      id: s.id,
      levelCode: s.level.code,
      skill: s.skill,
      title: s.title,
      questionCount: s._count.questions,
    })));
  }

  const examSet = await prisma.examSet.findUnique({
    where: { id: examSetId },
    include: {
      level: { select: { code: true } },
      questions: { orderBy: { order: 'asc' } },
    },
  });

  if (!examSet) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const exportData = {
    examSet: {
      levelCode: examSet.level.code,
      skill: examSet.skill,
      title: examSet.title,
      description: examSet.description,
      timeLimit: examSet.timeLimit,
    },
    questions: examSet.questions.map(q => ({
      type: q.type,
      content: q.content,
      options: q.options ? JSON.parse(q.options) : null,
      answer: q.answer,
      explain: q.explain,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
      order: q.order,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="examset-${examSetId}.json"`,
    },
  });
}
