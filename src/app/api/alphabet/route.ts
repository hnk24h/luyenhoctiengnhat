import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SCRIPT_CATEGORY: Record<string, string[]> = {
  hiragana: ['alphabet-n5-hiragana'],
  katakana: ['alphabet-n5-katakana'],
  pinyin:   ['alphabet-hsk1-pinyin'],
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang   = searchParams.get('lang') ?? 'ja';
  const script = searchParams.get('script') ?? (lang === 'zh' ? 'pinyin' : 'hiragana');

  const catIds = SCRIPT_CATEGORY[script];
  if (!catIds?.length) return NextResponse.json([]);

  const lessons = await prisma.learningLesson.findMany({
    where: { categoryId: { in: catIds } },
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          meanings: { where: { language: 'vi' } },
          examples: { orderBy: { id: 'asc' }, take: 1 },
        },
      },
    },
  });

  return NextResponse.json(lessons);
}
