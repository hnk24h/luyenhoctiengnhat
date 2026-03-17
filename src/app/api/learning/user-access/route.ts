import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Lấy danh sách quyền truy cập từng user cho từng bài học
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const lessonId = searchParams.get('lessonId');

  const where: any = {};
  if (userId) where.userId = userId;
  if (lessonId) where.lessonId = lessonId;

  const accesses = await prisma.userLessonAccess.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, subscriptionTier: true } },
      lesson: { select: { id: true, title: true, requiredTier: true } },
    },
  });
  return NextResponse.json(accesses);
}

// POST: Cấp quyền truy cập bài học cho user
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, lessonId, expiresAt, note } = body;
  if (!userId || !lessonId) return NextResponse.json({ error: 'Thiếu userId hoặc lessonId' }, { status: 400 });

  const access = await prisma.userLessonAccess.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { expiresAt, note },
    create: { userId, lessonId, expiresAt, note },
  });
  return NextResponse.json(access);
}

// DELETE: Xóa quyền truy cập bài học của user
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const lessonId = searchParams.get('lessonId');
  if (!userId || !lessonId) return NextResponse.json({ error: 'Thiếu userId hoặc lessonId' }, { status: 400 });

  await prisma.userLessonAccess.delete({
    where: { userId_lessonId: { userId, lessonId } },
  });
  return NextResponse.json({ success: true });
}
