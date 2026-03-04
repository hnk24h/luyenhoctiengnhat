import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/collections — list user's collections with word count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const collections = await prisma.wordCollection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { words: true } } },
  });

  return NextResponse.json(
    collections.map(c => ({ id: c.id, name: c.name, color: c.color, wordCount: c._count.words, createdAt: c.createdAt }))
  );
}

// POST /api/collections — create new collection
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  try {
    const col = await prisma.wordCollection.create({
      data: { userId: user.id, name: name.trim(), color: color ?? '#4F46E5' },
    });
    return NextResponse.json({ ...col, wordCount: 0 }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Collection name already exists' }, { status: 409 });
  }
}
