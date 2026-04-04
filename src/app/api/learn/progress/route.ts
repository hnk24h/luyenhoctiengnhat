import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized', message: 'Chưa đăng nhập.' }, { status: 401 });

  const userId = session.user.id;

  let body: { lessonId?: string; completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { lessonId, completed } = body;
  if (!lessonId) return NextResponse.json({ error: 'Missing lessonId', message: 'Thiếu lessonId.' }, { status: 400 });

  try {
    const prog = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: completed ?? false, completedAt: completed ? new Date() : null },
      create: { userId, lessonId, completed: completed ?? false, completedAt: completed ? new Date() : null },
    });
    return NextResponse.json(prog);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
