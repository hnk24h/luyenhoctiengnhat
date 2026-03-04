import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: { wordId: string } }

// DELETE /api/words/[wordId]
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const word = await prisma.savedWord.findFirst({ where: { id: params.wordId, userId: user.id } });
  if (!word) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.savedWord.delete({ where: { id: params.wordId } });
  return NextResponse.json({ ok: true });
}
