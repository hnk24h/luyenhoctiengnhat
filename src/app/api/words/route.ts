import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words — list user's saved words (with linked Content + meanings)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const words = await prisma.savedWord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      content: {
        select: {
          id: true, term: true, pronunciation: true, language: true,
          meanings: { select: { language: true, meaning: true } },
          examples: { select: { exampleText: true, translation: true } },
        },
      },
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

// POST /api/words — save a word by contentId
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { contentId, context } = await req.json();

  // support legacy callers that send `term` — look up Content by term
  let resolvedContentId: string = contentId;
  if (!resolvedContentId) {
    const { term } = await req.clone().json().catch(() => ({})) as { term?: string };
    if (!term?.trim()) return NextResponse.json({ error: 'contentId hoặc term là bắt buộc' }, { status: 400 });
    const found = await prisma.content.findFirst({ where: { term: term.trim() } });
    if (!found) return NextResponse.json({ error: 'Từ này chưa có trong hệ thống học tập' }, { status: 404 });
    resolvedContentId = found.id;
  }

  const word = await prisma.savedWord.upsert({
    where: { userId_contentId: { userId: user.id, contentId: resolvedContentId } },
    update: { context: context?.trim() || null },
    create: { userId: user.id, contentId: resolvedContentId, context: context?.trim() || null },
    include: {
      content: { select: { term: true, pronunciation: true, meanings: { select: { language: true, meaning: true } } } },
    },
  });

  return NextResponse.json(word, { status: 201 });
}
