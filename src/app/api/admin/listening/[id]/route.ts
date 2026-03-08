import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { mapLessonToListeningPractice, serializeListeningContent, validateListeningImportItem } from '@/modules/listeningUtils';

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && session.user.role === 'admin');
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const isAdmin = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const validated = validateListeningImportItem(await req.json());
  if (!validated.ok) return NextResponse.json({ message: validated.error }, { status: 400 });

  const existing = await prisma.learningLesson.findUnique({
    where: { id: params.id },
    include: { category: { include: { level: true } } },
  });
  if (!existing) return NextResponse.json({ message: 'Không tìm thấy bài nghe.' }, { status: 404 });

  let categoryId = existing.categoryId;
  if (existing.category.level.code !== validated.item.levelCode) {
    const level = await prisma.level.findUnique({ where: { code: validated.item.levelCode } });
    if (!level) return NextResponse.json({ message: `Không tìm thấy level ${validated.item.levelCode}` }, { status: 404 });

    const category = await prisma.learningCategory.findFirst({
      where: { levelId: level.id, skill: 'nghe', name: 'Luyện nghe JLPT' },
    }) ?? await prisma.learningCategory.create({
      data: {
        levelId: level.id,
        skill: 'nghe',
        name: 'Luyện nghe JLPT',
        description: 'Ngan hang bai nghe theo mondai JLPT',
        icon: '🎧',
        order: 999,
      },
    });

    categoryId = category.id;
  }

  const updated = await prisma.learningLesson.update({
    where: { id: params.id },
    data: {
      categoryId,
      title: validated.item.title,
      description: validated.item.summary,
      type: 'audio',
    },
    include: { category: { include: { level: true } } },
  });

  return NextResponse.json(mapLessonToListeningPractice(updated));
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const isAdmin = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  await prisma.learningLesson.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}