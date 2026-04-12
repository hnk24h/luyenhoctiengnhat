import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: { user?: { role?: string } } | null) {
  const role = session?.user?.role;
  return role === 'admin' || role === 'ADMIN';
}

// PATCH /api/learning/lessons/reorder  { categoryId, orderedIds: string[] }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { orderedIds } = body as { orderedIds: string[] };

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds is required' }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.learningLesson.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
