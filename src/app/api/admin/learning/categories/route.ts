import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

export async function GET() {
  const cats = await prisma.learningCategory.findMany({
    include: { level: true, _count: { select: { lessons: true } } },
    orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }, { order: 'asc' }],
  });
  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const { levelId, skill, name, description, icon, order } = await req.json();
  if (!levelId || !skill || !name) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });

  const cat = await prisma.learningCategory.create({ data: { levelId, skill, name, description, icon, order: order ?? 0 } });
  return NextResponse.json(cat, { status: 201 });
}
