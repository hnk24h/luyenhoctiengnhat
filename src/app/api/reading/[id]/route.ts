import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { id: string } }

// GET /api/reading/[id]?lang=ja|zh — public single passage
export async function GET(req: NextRequest, { params }: Ctx) {
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
      createdAt: passage.createdAt.toISOString(),
      pinyin: passage.pinyin ?? null,
      translation: passage.translation ?? null,
    });
  }

  const passage = await prisma.readingPassage.findUnique({ where: { id: params.id } });
  if (!passage || !passage.published) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(passage);
}

// PUT /api/reading/[id] — admin only
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
}

// DELETE /api/reading/[id] — admin only
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.readingPassage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
