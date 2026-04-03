import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import LevelDetailClient from '../LevelDetailClient';

interface Props { params: Promise<{ locale: string; lang: string; level: string }> }

export async function generateMetadata({ params: rawParams }: Props): Promise<Metadata> {
  const params = await rawParams;
  const examLabel: Record<string, string> = { ja: 'JLPT', zh: 'HSK', ko: 'TOPIK' };
  const exam = examLabel[params.lang] ?? 'JLPT';
  const level = params.level.toUpperCase();
  const title = `Thi Thử ${exam} ${level} — Đề Thật, Đánh Giá Trực Tiếp`;
  const desc = `Luyện thi thử ${exam} ${level} với đề sát format thực tế. Theo dõi điểm, phân tích sai sót, cải thiện kết quả.`;
  const canonical = `https://e-learn.ikagi.site/${params.lang}/levels/${params.level}/exams`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title: `${title} | IkagiLearn`, description: desc, url: canonical },
  };
}

const getCachedLevel = unstable_cache(
  (code: string) =>
    prisma.level.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        examSets: {
          include: { _count: { select: { questions: true } } },
          orderBy: [{ skill: 'asc' }, { createdAt: 'asc' }],
        },
      },
    }),
  ['level-exam-structure'],
  { revalidate: 3600, tags: ['level-exam-structure'] },
);

export const dynamic = 'force-dynamic';

export default async function LevelExamsPage({ params: rawParams }: Props) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const level = await getCachedLevel(params.level);
  if (!level) notFound();

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
      locale={params.locale}
      lang={params.lang}
      level={{ code: level.code, name: level.name, description: level.description }}
      examSets={examSets}
      isLoggedIn={Boolean(userId)}
    />
  );
}
