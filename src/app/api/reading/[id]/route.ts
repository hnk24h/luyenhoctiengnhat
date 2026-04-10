import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: Promise<{ id: string }> }

// GET /api/reading/[id]?lang=ja|zh — public single passage
export async function GET(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const lang = req.nextUrl.searchParams.get('lang') ?? 'ja';

  // ── Chinese passage branch ───────────────────────────────────────────────
  if (lang === 'zh') {
    const passage = await prisma.chinesePassage.findUnique({ where: { id: params.id } });
    if (!passage) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      id: passage.id,
      title: passage.title,
      titleVi: passage.titleVi ?? null,
      content: passage.content,
      summary: null,
      level: passage.level,
      type: 'short',
      source: null,
      sourceUrl: null,
      tags: passage.topic ? JSON.stringify([passage.topic]) : null,
      charCount: passage.content.length,
      createdAt: passage.createdAt.toISOString(),
      pinyin: passage.pinyin ?? null,
      translation: passage.translation ?? null,
    });
  }

  const passage = await prisma.readingPassage.findUnique({ where: { id: params.id } });
  if (!passage || !passage.published) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...passage, charCount: passage.content.length });
}

// PUT /api/reading/[id] — admin only
export async function PUT(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await req.json();
    const passage = await prisma.readingPassage.update({
      where: { id: params.id },
      data: {
        title:     data.title?.trim(),
        titleVi:   data.titleVi?.trim() || null,
        content:   data.content?.trim(),
        summary:   data.summary?.trim() || null,
        level:     data.level,
        type:      data.type,
        source:    data.source?.trim() || null,
        sourceUrl: data.sourceUrl?.trim() || null,
        tags:      data.tags || null,
        published: data.published ?? true,
      },
    });
    return NextResponse.json(passage);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reading/[id] — admin only
export async function DELETE(_: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await prisma.readingPassage.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
