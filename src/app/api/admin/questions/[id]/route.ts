import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const { type, content, options, answer, explain, audioUrl, imageUrl, order } = await req.json();
  if (!type || !content || !answer) {
    return NextResponse.json({ message: 'Thiếu thông tin bắt buộc.' }, { status: 400 });
  }
  const question = await prisma.question.update({
    where: { id: params.id },
    data: { type, content, options: options ?? null, answer, explain: explain || null, audioUrl: audioUrl || null, imageUrl: imageUrl || null, order: order ?? 0 },
  });
  return NextResponse.json(question);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  await prisma.question.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Đã xóa.' });
}
