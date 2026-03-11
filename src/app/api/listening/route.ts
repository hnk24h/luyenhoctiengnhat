import { NextRequest, NextResponse } from 'next/server';
import { Subject } from '@prisma/client';
import { prisma } from '@/lib/db';
import { mapLessonToUnified } from '@/modules/listeningUtils';

export const dynamic = 'force-dynamic';

const LANG_SUBJECT: Record<string, Subject> = {
  ja: 'JLPT',
  zh: 'HSK',
  en: 'JLPT',
  ko: 'JLPT',
  vi: 'JLPT',
};

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') ?? 'ja';
  const subject: Subject = LANG_SUBJECT[lang] ?? 'JLPT';

  const lessons = await prisma.learningLesson.findMany({
    where: {
      type: 'audio',
      category: {
        skill: 'nghe',
        level: { subject },
      },
    },
    include: {
      category: {
        include: {
          level: true,
        },
      },
    },
    orderBy: [
      { category: { level: { order: 'asc' } } },
      { order: 'asc' },
      { title: 'asc' },
    ],
  });

  const practices = lessons
    .map(l => mapLessonToUnified(l, lang))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return NextResponse.json(practices);
}