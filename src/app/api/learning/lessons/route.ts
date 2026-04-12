import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Subject } from '@prisma/client';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

// GET /api/learning/lessons?categoryId=&subject=JLPT&status=draft
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const subject    = searchParams.get('subject');  // 'JLPT' | 'HSK'
  const status     = searchParams.get('status');   // 'draft' | 'published' | 'archived'

  const lessons = await prisma.learningLesson.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(subject    ? { category: { level: { subject: subject as Subject } } } : {}),
      ...(status && ['draft', 'published', 'archived'].includes(status) ? { status: status as 'draft' | 'published' | 'archived' } : {}),
    },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { items: true } },
      category: { select: { name: true, skill: true, level: { select: { code: true } } } },
    },
  });

  return NextResponse.json(lessons);
}

// POST /api/learning/lessons
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { categoryId, title, description, content, type, order, requiredTier } = body;

  if (!categoryId || !title?.trim()) {
    return NextResponse.json({ error: 'categoryId và title là bắt buộc' }, { status: 400 });
  }

  const lesson = await prisma.learningLesson.create({
    data: {
      categoryId,
      title:       title.trim(),
      description: description?.trim() || null,
      type:        type || 'text',
      order:       order ?? 0,
      requiredTier: requiredTier ?? 'free',
    },
    include: {
      _count: { select: { items: true } },
      category: { select: { name: true, skill: true, level: { select: { code: true } } } },
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
