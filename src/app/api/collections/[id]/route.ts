import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/collections/[id] — rename / recolor
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { name?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, color } = body;
  try {
    const updated = await prisma.wordCollection.update({
      where: { id: params.id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(color          ? { color }              : {}),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/collections/[id] — delete collection (words remain, just delinked)
export async function DELETE(_req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await prisma.wordCollection.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
