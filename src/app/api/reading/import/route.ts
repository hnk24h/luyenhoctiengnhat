import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface PassageJson {
  title:      string;
  titleVi?:   string;
  content:    string;
  summary?:   string;
  level:      string;
  type?:      string;
  source?:    string;
  sourceUrl?: string;
  tags?:      string[];
  published?: boolean;
}

// POST /api/reading/import  — admin only, bulk upsert from JSON array
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin' && (session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let items: PassageJson[];
  try {
    const body = await req.json();
    items = Array.isArray(body) ? body : body.passages ?? [];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Expecting a JSON array of passages' }, { status: 400 });
  }

  const LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1']);
  const TYPES  = new Set(['short', 'long', 'news']);

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    if (!p.title?.trim() || !p.content?.trim()) {
      results.skipped++;
      results.errors.push(`[${i + 1}] Missing title or content — skipped`);
      continue;
    }
    if (!LEVELS.has(p.level)) {
      results.skipped++;
      results.errors.push(`[${i + 1}] "${p.title}" — invalid level "${p.level}" — skipped`);
      continue;
    }

    try {
      await prisma.readingPassage.create({
        data: {
          title:     p.title.trim(),
          titleVi:   p.titleVi?.trim()   || null,
          content:   p.content.trim(),
          summary:   p.summary?.trim()   || null,
          level:     p.level,
          type:      TYPES.has(p.type ?? '') ? p.type! : 'short',
          source:    p.source?.trim()    || null,
          sourceUrl: p.sourceUrl?.trim() || null,
          tags:      p.tags?.length ? JSON.stringify(p.tags) : null,
          published: p.published !== false,
        },
      });
      results.imported++;
    } catch (e: any) {
      results.errors.push(`[${i + 1}] "${p.title}" — ${e.message}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results, { status: results.imported > 0 ? 200 : 400 });
}
