import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words — list user's saved words
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const words = await prisma.savedWord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      collections: {
        select: { collection: { select: { id: true, name: true, color: true } } },
      },
    },
  });

  return NextResponse.json(
    words.map(w => ({
      ...w,
      collections: w.collections.map(c => c.collection),
    }))
  );
}

// POST /api/words — save a word
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { japanese, reading, meaning, context, sourceId } = await req.json();
  if (!japanese?.trim() || !meaning?.trim()) {
    return NextResponse.json({ error: 'japanese and meaning are required' }, { status: 400 });
  }

  const word = await prisma.savedWord.upsert({
    where: { userId_japanese: { userId: user.id, japanese: japanese.trim() } },
    update: { reading: reading?.trim() || null, meaning: meaning.trim(), context: context?.trim() || null, sourceId: sourceId || null },
    create: {
      userId:   user.id,
      japanese: japanese.trim(),
      reading:  reading?.trim() || null,
      meaning:  meaning.trim(),
      context:  context?.trim() || null,
      sourceId: sourceId || null,
    },
  });

  return NextResponse.json(word, { status: 201 });
}
