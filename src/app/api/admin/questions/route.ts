import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const { examSetId, type, content, options, answer, explain, audioUrl, imageUrl, order } = await req.json();
  if (!examSetId || !type || !content || !answer) {
    return NextResponse.json({ message: 'Thiếu thông tin bắt buộc.' }, { status: 400 });
  }
  const question = await prisma.question.create({
    data: { examSetId, type, content, options, answer, explain, audioUrl, imageUrl, order: order ?? 0 },
  });
  return NextResponse.json(question, { status: 201 });
}
