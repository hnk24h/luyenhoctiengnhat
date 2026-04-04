import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(req: Request, { params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const body = await req.json();
  const { levelId, skill, title, description, timeLimit } = body;
  const updated = await prisma.examSet.update({
    where: { id: params.id },
    data: { levelId, skill, title, description: description || null, timeLimit: timeLimit ?? null },
    include: { level: true, _count: { select: { questions: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  await prisma.examSet.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Đã xóa.' });
}
