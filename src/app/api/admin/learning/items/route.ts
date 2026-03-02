import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const { lessonId, type, japanese, reading, meaning, example, exampleReading, exampleMeaning, audioUrl, imageUrl, order } = await req.json();
  if (!lessonId || !japanese || !meaning) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });

  const item = await prisma.learningItem.create({
    data: { lessonId, type: type ?? 'vocab', japanese, reading, meaning, example, exampleReading, exampleMeaning, audioUrl, imageUrl, order: order ?? 0 },
  });
  return NextResponse.json(item, { status: 201 });
}
