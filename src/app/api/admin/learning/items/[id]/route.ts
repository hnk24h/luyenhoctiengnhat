import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  await prisma.learningItem.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Đã xóa.' });
}
