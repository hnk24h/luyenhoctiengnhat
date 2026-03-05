import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

const VALID_TYPES = ['vocab', 'kanji', 'grammar', 'example', 'phrase'];

// POST /api/learning/lessons/[id]/import
// Body: { format: 'json' | 'csv', data: string }
// JSON data: JSON string of array of items
// CSV data:  raw CSV text with header row
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const lesson = await prisma.learningLesson.findUnique({ where: { id: params.id } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const body = await req.json();
  const { format, data } = body as { format: 'json' | 'csv'; data: string };

  if (!data?.trim()) return NextResponse.json({ error: 'Không có dữ liệu' }, { status: 400 });

  let rows: any[] = [];

  // ── Parse ────────────────────────────────────────────────────────────────────

  if (format === 'json') {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return NextResponse.json({ error: 'JSON phải là một mảng []' }, { status: 400 });
      rows = parsed;
    } catch {
      return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 });
    }
  } else if (format === 'csv') {
    const lines = data.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return NextResponse.json({ error: 'CSV cần ít nhất 1 dòng header + 1 dòng dữ liệu' }, { status: 400 });

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle quoted fields containing commas
      const values: string[] = [];
      let cur = '';
      let inQuote = false;
      for (const ch of line) {
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { values.push(cur); cur = ''; }
        else { cur += ch; }
      }
      values.push(cur);

      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = (values[idx] ?? '').trim();
      });
      rows.push(obj);
    }
  } else {
    return NextResponse.json({ error: 'format phải là json hoặc csv' }, { status: 400 });
  }

  // ── Validate & normalize ──────────────────────────────────────────────────────

  const valid: any[] = [];
  const errors: string[] = [];

  rows.forEach((row, i) => {
    const line = `Dòng ${i + 1}`;
    const japanese = (row.japanese ?? row['tiếng nhật'] ?? row.jp ?? '').trim();
    const meaning  = (row.meaning  ?? row['nghĩa']      ?? row.vn ?? '').trim();
    const reading  = (row.reading  ?? row['cách đọc']   ?? row.kana ?? '').trim();
    const type     = (row.type     ?? row['loại']       ?? 'vocab').trim().toLowerCase();
    const example        = (row.example        ?? row['ví dụ']       ?? '').trim();
    const exampleReading = (row.examplereading ?? row['đọc ví dụ']   ?? '').trim();
    const exampleMeaning = (row.examplemeaning ?? row['nghĩa ví dụ'] ?? '').trim();
    const order    = parseInt(row.order ?? row['thứ tự'] ?? '0', 10) || 0;

    if (!japanese) { errors.push(`${line}: thiếu "japanese"`); return; }
    if (!meaning)  { errors.push(`${line}: thiếu "meaning"`);  return; }
    if (!VALID_TYPES.includes(type)) {
      errors.push(`${line}: type "${type}" không hợp lệ (vocab|kanji|grammar|example|phrase)`); return;
    }

    valid.push({ japanese, meaning, reading: reading || null, type, example: example || null, exampleReading: exampleReading || null, exampleMeaning: exampleMeaning || null, order });
  });

  if (valid.length === 0) {
    return NextResponse.json({ error: 'Không có dòng hợp lệ nào', details: errors }, { status: 400 });
  }

  // ── Get current max order ─────────────────────────────────────────────────────

  const maxOrderRecord = await prisma.learningItem.findFirst({
    where: { lessonId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const baseOrder = (maxOrderRecord?.order ?? -1) + 1;

  // ── Bulk create ──────────────────────────────────────────────────────────────

  await prisma.learningItem.createMany({
    data: valid.map((v, i) => ({
      lessonId:       params.id,
      type:           v.type,
      japanese:       v.japanese,
      reading:        v.reading,
      meaning:        v.meaning,
      example:        v.example,
      exampleReading: v.exampleReading,
      exampleMeaning: v.exampleMeaning,
      audioUrl:       null,
      imageUrl:       null,
      order:          v.order !== 0 ? v.order : baseOrder + i,
    })),
  });

  return NextResponse.json({ imported: valid.length, skipped: errors.length, errors });
}
