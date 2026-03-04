import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Ctx = { params: { id: string } };

async function getUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// POST /api/collections/[id]/words — add word(s) to collection
// Body: { wordId } or { wordIds: string[] }
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const ids: string[] = body.wordIds ?? (body.wordId ? [body.wordId] : []);
  if (!ids.length) return NextResponse.json({ error: 'wordId required' }, { status: 400 });

  // skipDuplicates — ignore if already linked
  await prisma.savedWordsOnCollections.createMany({
    data: ids.map(wordId => ({ wordId, collectionId: params.id })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: ids.length });
}

// DELETE /api/collections/[id]/words — remove word from collection
// Body: { wordId }
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getUser(session.user.email);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { wordId } = await req.json();
  if (!wordId) return NextResponse.json({ error: 'wordId required' }, { status: 400 });

  await prisma.savedWordsOnCollections.delete({
    where: { wordId_collectionId: { wordId, collectionId: params.id } },
  });

  return NextResponse.json({ ok: true });
}
