import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Subject } from '@prisma/client';

/**
 * GET /api/chinese/vocab?level=HSK1
 * Returns LearningItem rows seeded under the HSK level's vocab category.
 * Fields: id, term (汉字), pronunciation (pinyin), meaning (Vietnamese)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level = searchParams.get('level') || 'HSK1';

  const items = await prisma.content.findMany({
    where: {
      lesson: {
        category: {
          level: { code: level, subject: Subject.HSK },
        },
      },
    },
    include: { meanings: true, examples: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(items);
}
