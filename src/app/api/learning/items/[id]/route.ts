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
  const { type, japanese, reading, meaning, example, exampleReading, exampleMeaning, audioUrl, imageUrl, order } = body;

  const updated = await prisma.learningItem.update({
    where: { id: params.id },
    data: {
      ...(type           !== undefined ? { type }                                 : {}),
      ...(japanese       !== undefined ? { japanese: japanese.trim() }            : {}),
      ...(reading        !== undefined ? { reading: reading || null }             : {}),
      ...(meaning        !== undefined ? { meaning: meaning.trim() }              : {}),
      ...(example        !== undefined ? { example: example || null }             : {}),
      ...(exampleReading !== undefined ? { exampleReading: exampleReading || null } : {}),
      ...(exampleMeaning !== undefined ? { exampleMeaning: exampleMeaning || null } : {}),
      ...(audioUrl       !== undefined ? { audioUrl: audioUrl || null }           : {}),
      ...(imageUrl       !== undefined ? { imageUrl: imageUrl || null }           : {}),
      ...(order          !== undefined ? { order }                                : {}),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/learning/items/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.learningItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
