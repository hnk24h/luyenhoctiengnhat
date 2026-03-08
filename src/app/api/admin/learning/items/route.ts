import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });

  const { lessonId, type, term, pronunciation, language, meaning, example, exampleMeaning, audioUrl, imageUrl, order } = await req.json();
  if (!lessonId || !term || !meaning) return NextResponse.json({ message: 'Thiếu thông tin.' }, { status: 400 });

  const item = await prisma.content.create({
    data: {
      lessonId, type: type ?? 'vocab', language: language ?? 'ja',
      term, pronunciation: pronunciation ?? null, audioUrl: audioUrl ?? null, imageUrl: imageUrl ?? null, order: order ?? 0,
      meanings: { create: [{ language: 'vi', meaning: meaning.trim() }] },
      ...(example?.trim() ? { examples: { create: [{ exampleText: example.trim(), translation: exampleMeaning?.trim() ?? null, language: language ?? 'ja', translationLanguage: exampleMeaning?.trim() ? 'vi' : null }] } } : {}),
    },
    include: { meanings: true, examples: true },
  });
  return NextResponse.json(item, { status: 201 });
}
