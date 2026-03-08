import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId');
  if (!categoryId) {
    return NextResponse.json({ error: 'categoryId required' }, { status: 400 });
  }

  const category = await prisma.learningCategory.findUnique({
    where: { id: categoryId },
    include: {
      level: { select: { code: true } },
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: { order: 'asc' },
            include: { meanings: { select: { language: true, meaning: true } } },
          },
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({
    category: {
      id: category.id,
      name: category.name,
      skill: category.skill,
      level: category.level.code,
    },
    lessons: category.lessons.map(l => ({
      id: l.id,
      title: l.title,
      type: l.type,
      items: l.items,
    })),
  });
}
