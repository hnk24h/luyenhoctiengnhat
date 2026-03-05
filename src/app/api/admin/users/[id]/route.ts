import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function adminOnly(session: any) {
  const role = session?.user?.role;
  return !session || (role !== 'admin' && role !== 'ADMIN');
}

// GET /api/admin/users/[id] — full user profile + stats
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: {
        select: { sessions: true, progress: true, savedWords: true, flashcardDecks: true, lessonProgress: true },
      },
      sessions: {
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true, score: true, totalQ: true, correctQ: true,
          startedAt: true, finishedAt: true,
          examSet: { select: { title: true, skill: true, level: { select: { code: true } } } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
  return NextResponse.json(user);
}

// PUT /api/admin/users/[id] — update name, role
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  // Prevent self-demotion
  if ((session!.user as any).id === params.id) {
    return NextResponse.json({ error: 'Không thể thay đổi quyền của chính mình' }, { status: 400 });
  }

  const body = await req.json();
  const data: any = {};
  if (body.name  !== undefined) data.name  = body.name;
  if (body.role  !== undefined) {
    if (!['user', 'admin'].includes(body.role)) {
      return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
    }
    data.role = body.role;
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(updated);
}

// DELETE /api/admin/users/[id] — delete user + all related data
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  if ((session!.user as any).id === params.id) {
    return NextResponse.json({ error: 'Không thể xóa chính mình' }, { status: 400 });
  }

  // Delete relations without onDelete: Cascade manually
  await prisma.examSession.deleteMany({ where: { userId: params.id } });
  await prisma.userProgress.deleteMany({ where: { userId: params.id } });
  await prisma.lessonProgress.deleteMany({ where: { userId: params.id } });
  // FlashcardDeck, SavedWord, WordCollection cascade automatically
  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
