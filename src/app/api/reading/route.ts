import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/reading?level=N5&type=short — public list of passages
// GET /api/reading?export=1&admin=1    — admin full export (includes content)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const level      = searchParams.get('level')  || undefined;
  const type       = searchParams.get('type')   || undefined;
  const admin      = searchParams.get('admin')  === '1';
  const doExport   = searchParams.get('export') === '1';

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
    // for export include full content; for listing exclude it
    ...(doExport ? {} : {
      select: {
        id: true, title: true, titleVi: true,
        summary: true, level: true, type: true,
        source: true, tags: true, createdAt: true,
        content: false,
      },
    }),
  });

  // For export: return clean JSON without DB internals
  if (doExport) {
    const exportData = passages.map((p: any) => ({
      title:     p.title,
      titleVi:   p.titleVi   ?? undefined,
      content:   p.content,
      summary:   p.summary   ?? undefined,
      level:     p.level,
      type:      p.type,
      source:    p.source    ?? undefined,
      sourceUrl: p.sourceUrl ?? undefined,
      tags:      p.tags ? JSON.parse(p.tags) : undefined,
      published: p.published,
    }));
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="reading-passages-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  }

  // Attach character count by re-fetching minimal content length
  const withMeta = await Promise.all(
    (passages as any[]).map(async (p) => {
      const full = await prisma.readingPassage.findUnique({ where: { id: p.id }, select: { content: true } });
      return { ...p, charCount: full?.content.length ?? 0 };
    })
  );

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
      tags:      tags ? JSON.stringify(tags) : null,
    },
  });

  return NextResponse.json(passage, { status: 201 });
}
