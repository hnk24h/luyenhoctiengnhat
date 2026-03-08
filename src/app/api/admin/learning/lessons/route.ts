import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const lessons = await prisma.learningLesson.findMany({
    where: categoryId ? { categoryId } : {},
    include: { _count: { select: { items: true } } },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const { categoryId, title, description, content, type, order } = await req.json();
  if (!categoryId || !title) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });

  const lesson = await prisma.learningLesson.create({ data: { categoryId, title, description, type: type ?? 'text', order: order ?? 0 } });
  return NextResponse.json(lesson, { status: 201 });
}
