import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import LevelDetailClient from './LevelDetailClient';

interface Props { params: { lang: string; level: string } }

export const dynamic = 'force-dynamic';

export default async function LevelDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const level = await prisma.level.findUnique({
    where: { code: params.level.toUpperCase() },
    include: {
      examSets: {
        include: { _count: { select: { questions: true } } },
        orderBy: [{ skill: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
  if (!level) notFound();

  // Fetch user progress separately if authenticated
  const progressMap: Record<string, { bestScore: number | null; attempts: number; completed: boolean }> = {};
  if (userId) {
    const progressRows = await prisma.userProgress.findMany({
      where: {
        userId,
        examSetId: { in: level.examSets.map(s => s.id) },
      },
      select: { examSetId: true, bestScore: true, attempts: true, completed: true },
    });
    for (const row of progressRows) {
      progressMap[row.examSetId] = {
        bestScore: row.bestScore,
        attempts: row.attempts,
        completed: row.completed,
      };
    }
  }

  const examSets = level.examSets.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    skill: s.skill,
    timeLimit: s.timeLimit,
    questionCount: s._count.questions,
    progress: progressMap[s.id] ?? null,
  }));

  return (
    <LevelDetailClient
      lang={params.lang}
      level={{ code: level.code, name: level.name, description: level.description }}
      examSets={examSets}
      isLoggedIn={Boolean(userId)}
    />
  );
}

