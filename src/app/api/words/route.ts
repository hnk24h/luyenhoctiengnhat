import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words — list user's saved words (with linked Content + meanings)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  try {
    const words = await prisma.savedWord.findMany({
      where: { userId },
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/words — save a word by contentId
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  let body: { contentId?: string; context?: string; term?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { contentId, context } = body;

  // support legacy callers that send `term` — look up Content by term
  let resolvedContentId: string | undefined = contentId;
  if (!resolvedContentId) {
    const { term } = body;
    if (!term?.trim()) return NextResponse.json({ error: 'contentId hoặc term là bắt buộc' }, { status: 400 });
    const found = await prisma.content.findFirst({ where: { term: term.trim() } });
    if (!found) return NextResponse.json({ error: 'Từ này chưa có trong hệ thống học tập' }, { status: 404 });
    resolvedContentId = found.id;
  }

  try {
    const word = await prisma.savedWord.upsert({
      where: { userId_contentId: { userId, contentId: resolvedContentId } },
      update: { context: context?.trim() || null },
      create: { userId, contentId: resolvedContentId, context: context?.trim() || null },
      include: {
        content: { select: { term: true, pronunciation: true, meanings: { select: { language: true, meaning: true } } } },
      },
    });
    return NextResponse.json(word, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
