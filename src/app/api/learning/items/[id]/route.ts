import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

// PUT /api/learning/items/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { type, term, pronunciation, language, meaning, example, exampleMeaning, audioUrl, imageUrl, order } = body;

  // Update Content base fields
  const updated = await prisma.content.update({
    where: { id: params.id },
    data: {
      ...(type          !== undefined ? { type }                                   : {}),
      ...(term          !== undefined ? { term: term.trim() }                      : {}),
      ...(pronunciation !== undefined ? { pronunciation: pronunciation || null }   : {}),
      ...(language      !== undefined ? { language }                               : {}),
      ...(audioUrl      !== undefined ? { audioUrl: audioUrl || null }             : {}),
      ...(imageUrl      !== undefined ? { imageUrl: imageUrl || null }             : {}),
      ...(order         !== undefined ? { order }                                  : {}),
    },
  });

  // Upsert primary Vietnamese meaning
  if (meaning !== undefined) {
    await prisma.contentMeaning.upsert({
      where: { contentId_language: { contentId: params.id, language: 'vi' } },
      create: { contentId: params.id, language: 'vi', meaning: meaning.trim() },
      update: { meaning: meaning.trim() },
    });
  }

  // Update or create first example
  if (example !== undefined) {
    const firstEx = await prisma.contentExample.findFirst({ where: { contentId: params.id } });
    if (firstEx) {
      await prisma.contentExample.update({
        where: { id: firstEx.id },
        data: { exampleText: example || firstEx.exampleText, translation: exampleMeaning !== undefined ? (exampleMeaning || null) : firstEx.translation },
      });
    } else if (example) {
      await prisma.contentExample.create({
        data: { contentId: params.id, exampleText: example, translation: exampleMeaning || null, language: updated.language, translationLanguage: exampleMeaning ? 'vi' : null },
      });
    }
  }

  const result = await prisma.content.findUnique({
    where: { id: params.id },
    include: { meanings: true, examples: true },
  });

  return NextResponse.json(result);
}

// DELETE /api/learning/items/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.content.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
