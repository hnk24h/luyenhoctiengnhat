import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { mapLessonToListeningPractice, serializeListeningContent, validateListeningImportItem } from '@/modules/listeningUtils';

export const dynamic = 'force-dynamic';

async function ensureListeningCategory(levelCode: string) {
  const level = await prisma.level.findUnique({ where: { code: levelCode } });
  if (!level) return null;

  const existing = await prisma.learningCategory.findFirst({
    where: {
      levelId: level.id,
      skill: 'nghe',
      name: 'Luyện nghe JLPT',
    },
  });

  if (existing) return existing;

  return prisma.learningCategory.create({
    data: {
      levelId: level.id,
      skill: 'nghe',
      name: 'Luyện nghe JLPT',
      description: 'Ngan hang bai nghe theo mondai JLPT',
      icon: '🎧',
      order: 999,
    },
  });
}

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET() {
  const isAdmin = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const lessons = await prisma.learningLesson.findMany({
    where: {
      type: 'audio',
      category: { skill: 'nghe' },
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

  return NextResponse.json(
    lessons
      .map((lesson) => {
        const practice = mapLessonToListeningPractice(lesson);
        if (!practice) return null;
        return {
          ...practice,
          lessonId: lesson.id,
          categoryId: lesson.categoryId,
          categoryName: lesson.category.name,
          levelId: lesson.category.levelId,
          order: lesson.order,
        };
      })
      .filter(Boolean)
  );
}

export async function POST(req: Request) {
  const isAdmin = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const body = await req.json();

  if (Array.isArray(body.items)) {
    const results = [] as { title: string; id: string }[];

    for (const rawItem of body.items) {
      const validated = validateListeningImportItem(rawItem);
      if (!validated.ok) {
        return NextResponse.json({ message: `Import lỗi ở bài ${rawItem?.title ?? 'không tên'}: ${validated.error}` }, { status: 400 });
      }

      const category = await ensureListeningCategory(validated.item.levelCode);
      if (!category) {
        return NextResponse.json({ message: `Không tìm thấy level ${validated.item.levelCode}` }, { status: 404 });
      }

      const maxOrderRow = await prisma.learningLesson.aggregate({
        where: { categoryId: category.id, type: 'audio' },
        _max: { order: true },
      });

      const lesson = await prisma.learningLesson.create({
        data: {
          categoryId: category.id,
          title: validated.item.title,
          description: validated.item.summary,
          type: 'audio',
          order: (maxOrderRow._max.order ?? -1) + 1,
          content: serializeListeningContent(validated.item),
        },
      });

      results.push({ title: lesson.title, id: lesson.id });
    }

    return NextResponse.json({ success: true, imported: results.length, items: results }, { status: 201 });
  }

  const validated = validateListeningImportItem(body);
  if (!validated.ok) return NextResponse.json({ message: validated.error }, { status: 400 });

  const category = await ensureListeningCategory(validated.item.levelCode);
  if (!category) return NextResponse.json({ message: `Không tìm thấy level ${validated.item.levelCode}` }, { status: 404 });

  const maxOrderRow = await prisma.learningLesson.aggregate({
    where: { categoryId: category.id, type: 'audio' },
    _max: { order: true },
  });

  const lesson = await prisma.learningLesson.create({
    data: {
      categoryId: category.id,
      title: validated.item.title,
      description: validated.item.summary,
      type: 'audio',
      order: (maxOrderRow._max.order ?? -1) + 1,
      content: serializeListeningContent(validated.item),
    },
    include: {
      category: { include: { level: true } },
    },
  });

  return NextResponse.json(mapLessonToListeningPractice(lesson), { status: 201 });
}