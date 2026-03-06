import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mapLessonToListeningPractice } from '@/modules/listeningUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lessons = await prisma.learningLesson.findMany({
    where: {
      type: 'audio',
      category: {
        skill: 'nghe',
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
    .map(mapLessonToListeningPractice)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return NextResponse.json(practices);
}