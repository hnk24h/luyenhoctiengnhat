import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/kanji?lang=ja&level=N5
// Returns distinct levels with lesson counts + kanji counts
// If level provided, returns lessons summary for that level
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'ja';
  const level = searchParams.get('level');

  if (level) {
    // Get lessons for a specific level
    const kanji = await prisma.kanji.findMany({
      where: { language: lang as any, level },
      orderBy: [{ lesson: 'asc' }, { order: 'asc' }],
      select: {
        id: true, character: true, meaning: true, onyomi: true,
        kunyomi: true, pinyin: true, strokeCount: true, lesson: true, order: true,
      },
    });

    // Group by lesson
    const lessonsMap = new Map<number, typeof kanji>();
    for (const k of kanji) {
      if (!lessonsMap.has(k.lesson)) lessonsMap.set(k.lesson, []);
      lessonsMap.get(k.lesson)!.push(k);
    }

    const lessons = Array.from(lessonsMap.entries()).map(([num, items]) => ({
      lesson: num,
      count: items.length,
      preview: items.slice(0, 5).map(k => k.character),
      items,
    }));

    return NextResponse.json({ level, totalKanji: kanji.length, lessons });
  }

  // Get levels overview
  const counts = await prisma.kanji.groupBy({
    by: ['level'],
    where: { language: lang as any },
    _count: { id: true },
  });

  const lessonCounts = await prisma.kanji.groupBy({
    by: ['level', 'lesson'],
    where: { language: lang as any },
  });

  const lessonMap = new Map<string, number>();
  for (const lc of lessonCounts) {
    lessonMap.set(lc.level, (lessonMap.get(lc.level) || 0) + 1);
  }

  const levels = counts
    .map(c => ({
      level: c.level,
      kanjiCount: c._count.id,
      lessonCount: lessonMap.get(c.level) || 0,
    }))
    .sort((a, b) => {
      // Sort N5 > N4 > N3 > N2 > N1 (descending) or HSK1 < HSK2 etc.
      const aNum = parseInt(a.level.replace(/\D/g, ''));
      const bNum = parseInt(b.level.replace(/\D/g, ''));
      if (a.level.startsWith('N') && b.level.startsWith('N')) return bNum - aNum;
      return aNum - bNum;
    });

  return NextResponse.json(levels);
}
