import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/jlpt/vocab?level=N5
 * Returns LearningItem vocab rows for the given JLPT level (subject=JLPT).
 * Only returns type='vocab' items (excludes secondary example rows).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level = searchParams.get('level') || 'N5';

  const items = await prisma.learningItem.findMany({
    where: {
      type: 'vocab',
      lesson: {
        category: {
          level: {
            code: level,
            subject: 'JLPT',
          },
          name: { contains: 'tham khảo' },
        },
      },
    },
    select: {
      id: true,
      japanese: true,
      reading: true,
      meaning: true,
      example: true,
      exampleReading: true,
      exampleMeaning: true,
      order: true,
    },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(items);
}
