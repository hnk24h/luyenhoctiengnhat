import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

// GET /api/nav/level-preview?lang=ja&level=N5&section=learn
// Returns: recentLesson, latestLesson, dueCount (flash due today)
// Works for unauthenticated users too — just returns latest lesson + null for progress fields
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang    = searchParams.get('lang')    ?? 'ja';
  const level   = searchParams.get('level')   ?? 'N5';
  const section = searchParams.get('section') ?? 'learn'; // learn | vocab | listening | grammar | practice

  // Map lang → subject
  const subjectMap: Record<string, string> = { ja: 'JLPT', zh: 'HSK' };
  const subject = subjectMap[lang] ?? 'JLPT';

  // Map section → skill filter (optional)
  const skillMap: Record<string, string | null> = {
    learn:    null,            // all skills
    vocab:    'vocabulary',
    listening:'listening',
    grammar:  'grammar',
    kanji:    'kanji',
    reading:  'reading',
    practice: null,
  };
  const skill = skillMap[section] ?? null;

  try {
    // ── Latest lesson (newest by order desc) ──────────────────────────────────
    const latestLesson = await prisma.learningLesson.findFirst({
      where: {
        status: 'published',
        category: {
          level: { code: level, subject: subject as any },
          ...(skill ? { skill: skill as any } : {}),
        },
      },
      orderBy: { order: 'desc' },
      select: { id: true, title: true, category: { select: { skill: true } } },
    });

    // ── Try auth for personalised data ────────────────────────────────────────
    let recentLesson: { id: string; title: string; completedAt: Date | null } | null = null;
    let dueCount = 0;
    let completedCount = 0;
    let totalCount = 0;

    // Count total published lessons for this level+section
    totalCount = await prisma.learningLesson.count({
      where: {
        status: 'published',
        category: {
          level: { code: level, subject: subject as any },
          ...(skill ? { skill: skill as any } : {}),
        },
      },
    });

    const user = await getApiUser(req);
    if (user) {
      // Most recently touched lesson
      const recentProgress = await prisma.lessonProgress.findFirst({
        where: {
          userId: user.id,
          lesson: {
            status: 'published',
            category: {
              level: { code: level, subject: subject as any },
              ...(skill ? { skill: skill as any } : {}),
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        select: {
          completedAt: true,
          lesson: { select: { id: true, title: true } },
        },
      });
      if (recentProgress) {
        recentLesson = {
          id: recentProgress.lesson.id,
          title: recentProgress.lesson.title,
          completedAt: recentProgress.completedAt,
        };
      }

      // Count completed lessons
      completedCount = await prisma.lessonProgress.count({
        where: {
          userId: user.id,
          completed: true,
          lesson: {
            category: {
              level: { code: level, subject: subject as any },
              ...(skill ? { skill: skill as any } : {}),
            },
          },
        },
      });

      // Due flashcards today (SRS: dueAt <= now)
      dueCount = await prisma.flashcardProgress.count({
        where: {
          userId: user.id,
          dueAt: { lte: new Date() },
        },
      });
    }

    return NextResponse.json({
      level,
      section,
      latestLesson: latestLesson
        ? { id: latestLesson.id, title: latestLesson.title }
        : null,
      recentLesson,
      dueCount,
      completedCount,
      totalCount,
    });
  } catch (e) {
    console.error('[nav/level-preview]', e);
    return NextResponse.json({ level, section, latestLesson: null, recentLesson: null, dueCount: 0, completedCount: 0, totalCount: 0 });
  }
}
