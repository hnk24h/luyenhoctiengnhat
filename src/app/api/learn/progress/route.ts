import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Chưa đăng nhập.' }, { status: 401 });

  const userId = (session.user as any).id;
  const { lessonId, completed } = await req.json();
  if (!lessonId) return NextResponse.json({ message: 'Thiếu lessonId.' }, { status: 400 });

  const prog = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { userId, lessonId, completed, completedAt: completed ? new Date() : null },
  });

  return NextResponse.json(prog);
}
