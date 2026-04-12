
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FaArrowLeft, FaPlay, FaChevronRight, FaRegFile } from 'react-icons/fa6';
import LevelPostsSection, { type LevelPostData } from '@/components/LevelPostsSection';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { ExamSidebarClient } from '@/components/learn/ExamSidebarClient';

import ClientPage from './ClientPage';

interface Props { params: Promise<{ locale: string; lang: string; level: string }> }

// Tối ưu type cho examSets props
interface ExamSet {
  id: string;
  title: string;
  description: string;
  skill: string;
  timeLimit: number;
  questionCount: number;
  progress: {
    bestScore: number | null;
    attempts: number;
    completed: boolean;
  } | null;
}


// ─── Level visual meta ────────────────────────────────────────────────────────
const LEVEL_META: Record<string, { heroGrad: string; accent: string; desc: string }> = {
  N5:   { heroGrad: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', accent: '#059669', desc: 'Sơ cấp' },
  N4:   { heroGrad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', accent: '#2563EB', desc: 'Sơ trung cấp' },
  N3:   { heroGrad: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', accent: '#D97706', desc: 'Trung cấp' },
  N2:   { heroGrad: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)', accent: '#EA580C', desc: 'Trung cao cấp' },
  N1:   { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)', accent: '#DC2626', desc: 'Cao cấp' },
  HSK1: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)', accent: '#DC2626', desc: '入门级' },
  HSK2: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)', accent: '#DC2626', desc: '初级' },
  HSK3: { heroGrad: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', accent: '#D97706', desc: '中级' },
  HSK4: { heroGrad: 'linear-gradient(135deg, #92400E 0%, #C2410C 100%)', accent: '#C2410C', desc: '高级初阶' },
  HSK5: { heroGrad: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)', accent: '#B91C1C', desc: '高级' },
  HSK6: { heroGrad: 'linear-gradient(135deg, #111827 0%, #7F1D1D 100%)', accent: '#991B1B', desc: '精通级' },
};

const LEVELS_BY_LANG: Record<string, { code: string; label: string; desc: string }[]> = {
  ja: [
    { code: 'N5', label: 'N5', desc: 'Sơ cấp' },
    { code: 'N4', label: 'N4', desc: 'Sơ trung cấp' },
    { code: 'N3', label: 'N3', desc: 'Trung cấp' },
    { code: 'N2', label: 'N2', desc: 'Trung cao cấp' },
    { code: 'N1', label: 'N1', desc: 'Cao cấp' },
  ],
  zh: [
    { code: 'HSK1', label: 'HSK1', desc: '入门级' },
    { code: 'HSK2', label: 'HSK2', desc: '初级' },
    { code: 'HSK3', label: 'HSK3', desc: '中级' },
    { code: 'HSK4', label: 'HSK4', desc: '高级初阶' },
    { code: 'HSK5', label: 'HSK5', desc: '高级' },
    { code: 'HSK6', label: 'HSK6', desc: '精通级' },
  ],
};

const SKILL_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  nghe:    { label: 'Nghe',     icon: '🎧', color: '#2563EB', bg: '#EFF6FF' },
  doc:     { label: 'Đọc',     icon: '📖', color: '#D97706', bg: '#FFFBEB' },
  viet:    { label: 'Viết',    icon: '✏️', color: '#7C3AED', bg: '#F5F3FF' },
  noi:     { label: 'Nói',     icon: '🎤', color: '#059669', bg: '#F0FDF4' },
  vocab:   { label: 'Từ vựng', icon: '📝', color: '#DC2626', bg: '#FFF1F2' },
  grammar: { label: 'Ngữ pháp',icon: '📐', color: '#0891B2', bg: '#ECFEFF' },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
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

export async function generateMetadata({ params: rawParams }: Props): Promise<Metadata> {
  const params = await rawParams;
  const lv = params.level?.toUpperCase();
  const meta = LEVEL_META[lv];
  return {
    title: `Luyện thi ${lv}`,
    description: `Luyện thi JLPT ${lv}${meta?.desc ? ` (${meta.desc})` : ''} với bộ đề thi phân chia theo kỹ năng: nghe, đọc, viết.`,
  };
}

export const dynamic = 'force-dynamic';

// ─── Page ─────────────────────────────────────────────────────────────────────


export default async function LevelTopPage({ params: rawParams }: Props) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const level = await getCachedLevel(params.level);
  if (!level) notFound();

  // User exam progress
  const progressMap: Record<string, { bestScore: number | null; attempts: number }> = {};
  if (userId) {
    const rows = await prisma.userProgress.findMany({
      where: { userId, examSetId: { in: level.examSets.map(s => s.id) } },
      select: { examSetId: true, bestScore: true, attempts: true },
    });
    for (const r of rows) progressMap[r.examSetId] = r;
  }

  const totalSets = level.examSets.length;
  const totalDone = level.examSets.filter(s => (progressMap[s.id]?.attempts ?? 0) > 0).length;
  const totalPct  = totalSets > 0 ? Math.round((totalDone / totalSets) * 100) : 0;

  // Group exam sets by skill
  const bySkill = level.examSets.reduce<Record<string, { count: number; done: number }>>((acc, s) => {
    const sk = s.skill as string;
    if (!acc[sk]) acc[sk] = { count: 0, done: 0 };
    acc[sk].count++;
    if ((progressMap[s.id]?.attempts ?? 0) > 0) acc[sk].done++;
    return acc;
  }, {});

  // Community posts
  const rawPosts = await prisma.levelPost.findMany({
    where: { levelCode: level.code },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });
  const posts: LevelPostData[] = rawPosts.map(p => ({
    id: p.id, content: p.content, userName: p.user.name ?? '',
    createdAt: p.createdAt.toISOString(),
  }));

  // Sidebar config
  const LEVELS_OBJ = LEVELS_BY_LANG[params.lang] || [];
  // 4 kỹ năng chuẩn
  const SKILLS = [
    { key: 'nghe', label: 'Nghe', icon: '🎧' },
    { key: 'doc', label: 'Đọc', icon: '📖' },
    { key: 'viet', label: 'Viết', icon: '✏️' },
    { key: 'noi', label: 'Nói', icon: '🎤' },
  ];

  return (
    <ClientPage
      params={params}
      level={level}
      LEVELS_OBJ={LEVELS_OBJ}
      SKILLS={SKILLS}
      userId={userId}
      session={session}
      progressMap={progressMap}
      totalSets={totalSets}
      totalDone={totalDone}
      totalPct={totalPct}
      bySkill={bySkill}
      posts={posts}
    />
  );
}