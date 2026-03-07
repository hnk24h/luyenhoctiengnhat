import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/chinese/vocab?level=HSK1
 * Returns LearningItem rows seeded under the HSK level's vocab category.
 * Fields: id, japanese (汉字), reading (pinyin), meaning (Vietnamese)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level = searchParams.get('level') || 'HSK1';

  const items = await prisma.learningItem.findMany({
    where: {
      lesson: {
        category: {
          level: {
            code: level,
            subject: 'HSK',
          },
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
