import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/chinese/passages
 * GET /api/chinese/passages?level=HSK3
 * Returns ChinesePassage rows (excluding full content for list view unless ?detail=1).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level  = searchParams.get('level') || undefined;
  const detail = searchParams.get('detail') === '1';

  const passages = await prisma.chinesePassage.findMany({
    where: {
      ...(level ? { level } : {}),
    },
    select: {
      id:          true,
      title:       true,
      titleVi:     true,
      level:       true,
      topic:       true,
      content:     true,
      pinyin:      true,
      translation: detail,
      audioUrl:    true,
      createdAt:   true,
    },
    orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(passages);
}
