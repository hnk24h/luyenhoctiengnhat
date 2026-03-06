import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sets = await prisma.examSet.findMany({
    include: { level: true, _count: { select: { questions: true } } },
    orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }],
  });
  return NextResponse.json(sets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const { levelId, skill, title, description, timeLimit } = await req.json();
  if (!levelId || !skill || !title) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });
  const set = await prisma.examSet.create({ data: { levelId, skill, title, description, timeLimit } });
  return NextResponse.json(set, { status: 201 });
}
