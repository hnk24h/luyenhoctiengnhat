import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

// PUT /api/learning/categories/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, description, icon, order, skill } = body;

  const updated = await prisma.learningCategory.update({
    where: { id: params.id },
    data: {
      ...(name        !== undefined ? { name: name.trim() }               : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(icon        !== undefined ? { icon: icon || null }               : {}),
      ...(order       !== undefined ? { order }                            : {}),
      ...(skill       !== undefined ? { skill }                            : {}),
    },
    include: {
      level:  { select: { code: true, name: true } },
      _count: { select: { lessons: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/learning/categories/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.learningCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
