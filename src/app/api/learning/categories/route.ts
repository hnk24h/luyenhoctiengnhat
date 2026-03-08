import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { Skill } from '@prisma/client';
import { Subject } from '@prisma/client';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

// GET /api/learning/categories?levelId=&skill=&subject=JLPT
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const levelId = searchParams.get('levelId');
  const skill   = searchParams.get('skill');
  const subject = searchParams.get('subject');  // 'JLPT' | 'HSK'

  const categories = await prisma.learningCategory.findMany({
    where: {
      ...(levelId ? { levelId } : {}),
      ...(skill   ? { skill: skill as Skill }   : {}),
      ...(subject ? { level: { subject: subject as Subject } } : {}),
    },
    orderBy: [{ levelId: 'asc' }, { skill: 'asc' }, { order: 'asc' }],
    include: {
      level:   { select: { code: true, name: true } },
      _count:  { select: { lessons: true } },
    },
  });

  return NextResponse.json(categories);
}

// POST /api/learning/categories
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { levelId, skill, name, description, icon, order } = body;

  if (!levelId || !skill || !name?.trim()) {
    return NextResponse.json({ error: 'levelId, skill và name là bắt buộc' }, { status: 400 });
  }

  const category = await prisma.learningCategory.create({
    data: {
      levelId,
      skill,
      name:        name.trim(),
      description: description?.trim() || null,
      icon:        icon?.trim() || null,
      order:       order ?? 0,
    },
    include: {
      level:  { select: { code: true, name: true } },
      _count: { select: { lessons: true } },
    },
  });

  return NextResponse.json(category, { status: 201 });
}
