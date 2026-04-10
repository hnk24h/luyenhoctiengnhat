import { NextRequest, NextResponse } from 'next/server';

// POST /api/translate — translate paragraphs using Google Translate free API
export async function POST(req: NextRequest) {
  try {
    const { paragraphs, from, to } = (await req.json()) as {
      paragraphs: string[];
      from?: string;
      to?: string;
    };

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json({ error: 'paragraphs array required' }, { status: 400 });
    }

    // Limit to prevent abuse
    if (paragraphs.length > 100) {
      return NextResponse.json({ error: 'Too many paragraphs (max 100)' }, { status: 400 });
    }

    const srcLang = from ?? 'ja';
    const tgtLang = to ?? 'vi';

    // Translate all paragraphs in a single request by joining with newlines
    const joined = paragraphs.join('\n');
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', srcLang);
    url.searchParams.set('tl', tgtLang);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', joined);

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Translation service error' }, { status: 502 });
    }

    const data = await res.json();

    // data[0] is an array of [translatedSegment, originalSegment, ...]
    const translatedText = (data[0] as [string, string][] | null)
      ?.map(seg => seg[0])
      .join('') ?? '';

    // Split back by newlines to match original paragraphs
    const results = translatedText.split('\n');

    // Pad/trim to match input length
    const translations: string[] = paragraphs.map((_, i) => (results[i] ?? '').trim());

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
