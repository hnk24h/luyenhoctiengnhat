import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/collections/[id]/words — add word(s) to collection
// Body: { wordId } or { wordIds: string[] }
export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { wordIds?: string[]; wordId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ids: string[] = body.wordIds ?? (body.wordId ? [body.wordId] : []);
  if (!ids.length) return NextResponse.json({ error: 'wordId required' }, { status: 400 });

  try {
    // skipDuplicates — ignore if already linked
    await prisma.savedWordsOnCollections.createMany({
      data: ids.map(wordId => ({ wordId, collectionId: params.id })),
      skipDuplicates: true,
    });
    return NextResponse.json({ ok: true, added: ids.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/collections/[id]/words — remove word from collection
// Body: { wordId }
export async function DELETE(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const col = await prisma.wordCollection.findUnique({ where: { id: params.id } });
  if (!col || col.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { wordId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { wordId } = body;
  if (!wordId) return NextResponse.json({ error: 'wordId required' }, { status: 400 });

  try {
    await prisma.savedWordsOnCollections.delete({
      where: { wordId_collectionId: { wordId, collectionId: params.id } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
