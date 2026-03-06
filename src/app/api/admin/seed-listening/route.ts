import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LISTENING_PRACTICES } from '@/modules/listeningContent';
import { serializeListeningContent } from '@/modules/listeningUtils';

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

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  const levelCodes = Array.from(new Set(LISTENING_PRACTICES.map((item) => item.level)));
  const existingLevels = await prisma.level.findMany({ where: { code: { in: levelCodes } } });
  const existingLevelCodes = new Set(existingLevels.map((level) => level.code));
  const missingLevels = levelCodes.filter((code) => !existingLevelCodes.has(code));

  if (missingLevels.length > 0) {
    return NextResponse.json({
      message: `Thiếu cấp độ: ${missingLevels.join(', ')}. Hãy seed bộ đề hoặc tạo level trước.`,
    }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;

  for (const practice of LISTENING_PRACTICES) {
    const category = await ensureListeningCategory(practice.level);
    if (!category) continue;

    const existed = await prisma.learningLesson.findFirst({
      where: {
        categoryId: category.id,
        type: 'audio',
        title: practice.title,
      },
    });

    if (existed) {
      skipped += 1;
      continue;
    }

    const maxOrder = await prisma.learningLesson.aggregate({
      where: { categoryId: category.id, type: 'audio' },
      _max: { order: true },
    });

    await prisma.learningLesson.create({
      data: {
        categoryId: category.id,
        title: practice.title,
        description: practice.summary,
        type: 'audio',
        order: (maxOrder._max.order ?? -1) + 1,
        content: serializeListeningContent({
          levelCode: practice.level,
          mondai: practice.mondai,
          title: practice.title,
          summary: practice.summary,
          situation: practice.situation,
          durationSec: practice.durationSec,
          focus: practice.focus,
          question: practice.question,
          options: practice.options,
          answer: practice.answer,
          explanation: practice.explanation,
          audioUrl: practice.audioUrl ?? null,
          transcript: practice.segments,
        }),
      },
    });

    created += 1;
  }

  return NextResponse.json({
    message: `Đã seed ${created} bài nghe mẫu. Bỏ qua ${skipped} bài đã tồn tại.`,
    created,
    skipped,
  });
}