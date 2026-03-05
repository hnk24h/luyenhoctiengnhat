import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return role === 'admin' || role === 'ADMIN';
}

// GET /api/learning/lessons/[id]  — includes items
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const lesson = await prisma.learningLesson.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { order: 'asc' } },
      category: { select: { name: true, skill: true, level: { select: { code: true } } } },
    },
  });
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lesson);
}

// PUT /api/learning/lessons/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { title, description, content, type, order } = body;

  const updated = await prisma.learningLesson.update({
    where: { id: params.id },
    data: {
      ...(title       !== undefined ? { title: title.trim() }           : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(content     !== undefined ? { content: content || null }       : {}),
      ...(type        !== undefined ? { type }                           : {}),
      ...(order       !== undefined ? { order }                          : {}),
    },
    include: {
      _count: { select: { items: true } },
      category: { select: { name: true, skill: true, level: { select: { code: true } } } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/learning/lessons/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.learningLesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

// POST /api/learning/lessons/[id]  — add item to lesson
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { type, japanese, reading, meaning, example, exampleReading, exampleMeaning, audioUrl, imageUrl, order } = body;

  if (!type || !japanese?.trim() || !meaning?.trim()) {
    return NextResponse.json({ error: 'type, japanese và meaning là bắt buộc' }, { status: 400 });
  }

  const item = await prisma.learningItem.create({
    data: {
      lessonId:       params.id,
      type,
      japanese:       japanese.trim(),
      reading:        reading?.trim()        || null,
      meaning:        meaning.trim(),
      example:        example?.trim()        || null,
      exampleReading: exampleReading?.trim() || null,
      exampleMeaning: exampleMeaning?.trim() || null,
      audioUrl:       audioUrl?.trim()       || null,
      imageUrl:       imageUrl?.trim()       || null,
      order:          order ?? 0,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
