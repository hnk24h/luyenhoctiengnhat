import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/import-questions
 * Body JSON format:
 * {
 *   "examSetId": "existing-id",          // option A: add to existing set
 *   "examSet": {                          // option B: create new set
 *     "levelCode": "N5",
 *     "skill": "doc",
 *     "title": "N5 Từ vựng - Bộ 1",
 *     "description": "...",
 *     "timeLimit": 1800
 *   },
 *   "clearExisting": false,              // true = delete old questions first
 *   "questions": [
 *     {
 *       "type": "tracnghiem",
 *       "content": "Câu hỏi...",
 *       "options": ["A", "B", "C", "D"],
 *       "answer": "A",
 *       "explain": "Giải thích...",
 *       "imageUrl": null,
 *       "audioUrl": null,
 *       "order": 1
 *     }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { examSetId, examSet: examSetData, questions, clearExisting = false } = body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'questions array is required and must not be empty' }, { status: 400 });
  }

  let targetSetId: string;

  // ── Resolve exam set ────────────────────────────────────────────────────────
  if (examSetId) {
    const existing = await prisma.examSet.findUnique({ where: { id: examSetId } });
    if (!existing) return NextResponse.json({ error: 'ExamSet not found' }, { status: 404 });
    targetSetId = examSetId;
  } else if (examSetData) {
    const { levelCode, skill, title, description, timeLimit } = examSetData;
    if (!levelCode || !skill || !title) {
      return NextResponse.json({ error: 'examSet requires levelCode, skill, title' }, { status: 400 });
    }
    const level = await prisma.level.findUnique({ where: { code: levelCode.toUpperCase() } });
    if (!level) return NextResponse.json({ error: `Level ${levelCode} not found` }, { status: 404 });

    const newSet = await prisma.examSet.create({
      data: { levelId: level.id, skill, title, description, timeLimit },
    });
    targetSetId = newSet.id;
  } else {
    return NextResponse.json({ error: 'Provide either examSetId or examSet object' }, { status: 400 });
  }

  // ── Optionally clear existing questions ─────────────────────────────────────
  if (clearExisting) {
    await prisma.question.deleteMany({ where: { examSetId: targetSetId } });
  }

  // ── Get current max order to append ─────────────────────────────────────────
  const maxOrderRow = await prisma.question.aggregate({
    where: { examSetId: targetSetId },
    _max: { order: true },
  });
  const baseOrder = (maxOrderRow._max.order ?? -1) + 1;

  // ── Bulk insert questions ────────────────────────────────────────────────────
  const created = await prisma.$transaction(
    questions.map((q: any, idx: number) =>
      prisma.question.create({
        data: {
          examSetId: targetSetId,
          type:     q.type     ?? 'tracnghiem',
          content:  q.content  ?? '',
          options:  q.options  ?? null,
          answer:   typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer),
          explain:  q.explain  ?? null,
          audioUrl: q.audioUrl ?? null,
          imageUrl: q.imageUrl ?? null,
          order:    q.order    ?? baseOrder + idx,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    examSetId: targetSetId,
    imported: created.length,
    message: `Đã import ${created.length} câu hỏi thành công`,
  });
}
