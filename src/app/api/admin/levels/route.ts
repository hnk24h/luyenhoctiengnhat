import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Subject } from '@prisma/client';

function adminOnly(session: any) {
  return !session || session.user?.role !== 'admin';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject'); // 'JLPT' | 'HSK'
  const levels = await prisma.level.findMany({
    where: subject ? { subject: subject as Subject } : {},
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(levels);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  const { code, name, description, order } = await req.json();
  if (!code || !name) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });
  const existing = await prisma.level.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ message: 'Cấp độ đã tồn tại.' }, { status: 409 });
  const level = await prisma.level.create({ data: { code, name, description, order: order ?? 0 } });
  return NextResponse.json(level, { status: 201 });
}
