import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { lessonId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const lesson = await prisma.learningLesson.findUnique({
    where: { id: params.lessonId },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      items: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          language: true,
          term: true,
          pronunciation: true,
          audioUrl: true,
          imageUrl: true,
          order: true,
          meanings: { select: { id: true, language: true, meaning: true } },
          examples: {
            select: {
              id: true,
              exampleText: true,
              translation: true,
              language: true,
              translationLanguage: true,
            },
          },
        },
      },
      progress: userId ? { where: { userId }, select: { completed: true } } : false,
    },
  });

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    items: lesson.items,
    isCompleted: userId
      ? (lesson.progress as { completed: boolean }[])?.some(p => p.completed)
      : false,
  });
}
