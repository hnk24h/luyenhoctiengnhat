import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ctx { params: Promise<{ level: string }> }

const SELECT = {
  id: true,
  content: true,
  createdAt: true,
  user: { select: { name: true } },
} as const;

function toDto(p: { id: string; content: string; createdAt: Date; user: { name: string | null } }) {
  return { id: p.id, content: p.content, userName: p.user.name ?? '', createdAt: p.createdAt.toISOString() };
}

export async function GET(_: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const levelCode = params.level.toUpperCase();
  const posts = await prisma.levelPost.findMany({
    where: { levelCode },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: SELECT,
  });
  return NextResponse.json(posts.map(toDto));
}

export async function POST(req: NextRequest, { params: rawParams }: Ctx) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.content || typeof body.content !== 'string') {
    return NextResponse.json({ error: 'Nội dung không hợp lệ' }, { status: 400 });
  }
  const content = body.content.trim().slice(0, 500);
  if (!content) return NextResponse.json({ error: 'Nội dung không được trống' }, { status: 400 });

  const levelCode = params.level.toUpperCase();
  const levelExists = await prisma.level.findUnique({
    where: { code: levelCode },
    select: { id: true },
  });
  if (!levelExists) return NextResponse.json({ error: 'Cấp độ không tồn tại' }, { status: 404 });

  const post = await prisma.levelPost.create({
    data: { userId, levelCode, content },
    select: SELECT,
  });
  return NextResponse.json(toDto(post), { status: 201 });
}
