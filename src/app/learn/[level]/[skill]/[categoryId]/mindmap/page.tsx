import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';
import MindmapClient from './MindmapClient';

interface Props {
  params: { level: string; skill: string; categoryId: string };
}

async function getCategory(categoryId: string) {
  return prisma.learningCategory.findUnique({
    where: { id: categoryId },
    include: {
      level: { select: { code: true } },
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              japanese: true,
              reading: true,
              meaning: true,
              type: true,
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.learningCategory.findUnique({
    where: { id: params.categoryId },
    select: { name: true },
  });
  return { title: `Mindmap — ${cat?.name ?? 'Chủ đề'}` };
}

export const dynamic = 'force-dynamic';

export default async function MindmapPage({ params }: Props) {
  const category = await getCategory(params.categoryId);
  if (!category) notFound();

  return (
    <MindmapClient
      category={{
        id: category.id,
        name: category.name,
        skill: category.skill,
        level: category.level.code,
      }}
      lessons={category.lessons.map(l => ({
        id: l.id,
        title: l.title,
        type: l.type,
        items: l.items,
      }))}
      level={params.level}
      skill={params.skill}
    />
  );
}
