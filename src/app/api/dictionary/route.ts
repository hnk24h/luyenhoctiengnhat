import { NextRequest, NextResponse } from 'next/server';

// ── Mazii Japanese-Vietnamese lookup ─────────────────────────────────────────
// POST https://mazii.net/api/search  (free, no key needed)
async function lookupMazii(word: string): Promise<{
  found: boolean;
  word?: string;
  reading?: string;
  meanings?: { pos: string; defs: string[]; tags: string[] }[];
  jlpt?: string[];
  is_common?: boolean;
}> {
  const res = await fetch('https://mazii.net/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dict: 'javi', limit: 3, page: 1, query: word, type: 'word' }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return { found: false };
  const json = await res.json();
  if (json?.status !== 200 || !json?.data?.length) return { found: false };

  const top = json.data[0];
  const meanings = (top.means ?? []).slice(0, 4).map((m: any) => ({
    pos:  m.kind ?? '',
    defs: [m.mean].filter(Boolean),
    tags: [],
  }));

  return {
    found:     true,
    word:      top.word  ?? word,
    reading:   top.phonetic ?? null,
    meanings,
    jlpt:      [],
    is_common: false,
    lang:      'vi',
  } as any;
}

// ── Jisho Japanese-English lookup ─────────────────────────────────────────────
async function lookupJisho(word: string): Promise<{
  found: boolean;
  word?: string;
  reading?: string;
  meanings?: { pos: string; defs: string[]; tags: string[] }[];
  jlpt?: string[];
  is_common?: boolean;
}> {
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return { found: false };
  const json = await res.json();
  const data = json.data ?? [];
  if (data.length === 0) return { found: false };

  const top = data[0];
  const jp  = top.japanese?.[0] ?? {};
  return {
    found:     true,
    word:      jp.word || word,
    reading:   jp.reading || null,
    meanings:  (top.senses ?? []).slice(0, 3).map((s: any) => ({
      pos:  (s.parts_of_speech ?? []).join(', '),
      defs: (s.english_definitions ?? []).slice(0, 4) as string[],
      tags: (s.tags ?? []) as string[],
    })),
    jlpt:      top.jlpt ?? [],
    is_common: top.is_common ?? false,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────
// GET /api/dictionary?q=食べる&lang=vi   (Vietnamese via Mazii, default)
// GET /api/dictionary?q=食べる&lang=en   (English via Jisho)
export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get('q');
  const lang = (req.nextUrl.searchParams.get('lang') ?? 'vi') as 'vi' | 'en';
  if (!q?.trim()) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  try {
    const result = lang === 'vi'
      ? await lookupMazii(q.trim())
      : await lookupJisho(q.trim());

    return NextResponse.json({ ...result, lang });
  } catch {
    return NextResponse.json({ found: false, error: 'Lookup failed' });
  }
}
