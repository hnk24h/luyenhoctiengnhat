import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Ctx = { params: { id: string } };

async function getUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// PUT /api/collections/[id] — rename / recolor
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name, color } = await req.json();
  const updated = await prisma.wordCollection.update({
    where: { id: params.id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(color          ? { color }              : {}),
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/collections/[id] — delete collection (words remain, just delinked)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.wordCollection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
