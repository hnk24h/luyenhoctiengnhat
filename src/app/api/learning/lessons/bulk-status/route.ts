import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: { user?: { role?: string } } | null) {
  const role = session?.user?.role;
  return role === 'admin' || role === 'ADMIN';
}

// PATCH /api/learning/lessons/bulk-status  { ids: string[], status: 'draft' | 'published' | 'archived' }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { ids, status } = body as { ids: string[]; status: string };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids is required' }, { status: 400 });
  }
  if (!['draft', 'published', 'archived'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await prisma.learningLesson.updateMany({
    where: { id: { in: ids } },
    data: { status: status as 'draft' | 'published' | 'archived' },
  });

  return NextResponse.json({ ok: true, updated: ids.length });
}
