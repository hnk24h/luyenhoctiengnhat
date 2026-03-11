import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/reading?level=N5&type=short&lang=ja — public list of passages
// GET /api/reading?level=HSK1&lang=zh            — Chinese reading list
// GET /api/reading?export=1&admin=1              — admin full export (includes content)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level      = searchParams.get('level')  || undefined;
  const type       = searchParams.get('type')   || undefined;
  const admin      = searchParams.get('admin')  === '1';
  const doExport   = searchParams.get('export') === '1';
  const lang       = searchParams.get('lang')   ?? 'ja';

  // ── Chinese reading branch ──────────────────────────────────────────────
  if (lang === 'zh' && !doExport && !admin) {
    const zhPassages = await prisma.chinesePassage.findMany({
      where: { ...(level ? { level } : {}) },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, titleVi: true, level: true, topic: true, content: true, createdAt: true },
    });
    return NextResponse.json(zhPassages.map(p => ({
      id: p.id,
      title: p.title,
      titleVi: p.titleVi ?? null,
      summary: null,
      level: p.level,
      type: 'short',
      source: null,
      tags: p.topic ? JSON.stringify([p.topic]) : null,
      charCount: p.content.length,
      createdAt: p.createdAt.toISOString(),
    })));
  }

  // Admins can see all passages including unpublished
  const session = (admin || doExport) ? await getServerSession(authOptions) : null;
  const isAdmin = (admin || doExport) && (
    (session?.user as any)?.role === 'ADMIN' ||
    (session?.user as any)?.role === 'admin'
  );

  if (doExport && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const passages = await prisma.readingPassage.findMany({
    where: {
      ...(isAdmin ? {} : { published: true }),
      ...(level ? { level } : {}),
      ...(type  ? { type  } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, titleVi: true,
      summary: true, level: true, type: true,
      source: true, sourceUrl: true, tags: true,
      published: true, createdAt: true,
      content: true, // needed for charCount + export
    },
  });

  // For export: return clean JSON without DB internals
  if (doExport) {
    const exportData = passages.map(p => ({
      title:     p.title,
      titleVi:   p.titleVi   ?? undefined,
      content:   p.content,
      summary:   p.summary   ?? undefined,
      level:     p.level,
      type:      p.type,
      source:    p.source    ?? undefined,
      sourceUrl: p.sourceUrl ?? undefined,
      tags:      p.tags ?? undefined,
      published: p.published,
    }));
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="reading-passages-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  }

  // Strip content from listing response; expose charCount instead
  const withMeta = passages.map(p => ({
    id:        p.id,
    title:     p.title,
    titleVi:   p.titleVi,
    summary:   p.summary,
    level:     p.level,
    type:      p.type,
    source:    p.source,
    tags:      p.tags,
    createdAt: p.createdAt,
    charCount: p.content.length,
  }));

  return NextResponse.json(withMeta);
}

// POST /api/reading — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== 'admin' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, titleVi, content, summary, level, type, source, sourceUrl, tags } = await req.json();
  if (!title?.trim() || !content?.trim() || !level) {
    return NextResponse.json({ error: 'title, content, level are required' }, { status: 400 });
  }

  const passage = await prisma.readingPassage.create({
    data: {
      title:     title.trim(),
      titleVi:   titleVi?.trim() || null,
      content:   content.trim(),
      summary:   summary?.trim() || null,
      level,
      type:      type || 'short',
      source:    source?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      tags:      tags || null,
    },
  });

  return NextResponse.json(passage, { status: 201 });
}
