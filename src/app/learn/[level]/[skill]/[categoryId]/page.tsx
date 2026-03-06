import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FaFont, FaRuler, FaHeadphones, FaFile, FaCodeBranch } from 'react-icons/fa6';
import type { ReactNode } from 'react';

interface Props { params: { level: string; skill: string; categoryId: string } }

async function getCategoryWithLessons(categoryId: string, userId?: string) {
  const category = await prisma.learningCategory.findUnique({
    where: { id: categoryId },
    include: {
      level: true,
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { items: true } },
          progress: userId ? { where: { userId } } : false,
        },
      },
    },
  });
  return category;
}

export const dynamic = 'force-dynamic';

export default async function LearnCategoryPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const category = await getCategoryWithLessons(params.categoryId, userId);
  if (!category) notFound();

  const skill = SKILLS.find(s => s.key === category.skill);
  const completedCount = userId
    ? category.lessons.filter(l => (l.progress as any[])?.some((p: any) => p.completed)).length
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-5 flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Học</Link>
        <span>/</span>
        <Link href={`/learn/${category.level.code}`} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>{category.level.code}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{category.name}</span>
      </div>

      {/* Header */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{category.icon ?? skill?.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{category.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{skill?.label}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cấp {category.level.code}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{category.lessons.length} bài</span>
            </div>
            {category.description && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{category.description}</p>}
          </div>
          {userId && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{completedCount}/{category.lessons.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>hoàn thành</div>
            </div>
          )}
        </div>
        {userId && category.lessons.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="progress-track flex-1">
              <div className="progress-fill"
                style={{ width: `${Math.round((completedCount / category.lessons.length) * 100)}%` }} />
            </div>
            <Link href={`/learn/${category.level.code}/${category.skill}/${category.id}/mindmap`}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FaCodeBranch size={12}/> Mindmap
            </Link>
          </div>
        )}
        {!userId && category.lessons.length > 0 && (
          <div className="mt-3 flex justify-end">
            <Link href={`/learn/${category.level.code}/${category.skill}/${category.id}/mindmap`}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FaCodeBranch size={12}/> Mindmap
            </Link>
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="space-y-2">
        {category.lessons.length === 0 ? (
          <div className="card text-center py-10" style={{ color: 'var(--text-muted)' }}>Chưa có bài học nào.</div>
        ) : category.lessons.map((lesson, idx) => {
          const isCompleted = userId && (lesson.progress as any[])?.some((p: any) => p.completed);
          const typeIcon: Record<string, ReactNode> = {
            vocab:   <FaFont       size={14}/>,
            grammar: <FaRuler      size={14}/>,
            audio:   <FaHeadphones size={14}/>,
            text:    <FaFile       size={14}/>,
          };
          return (
            <Link key={lesson.id}
              href={`/learn/${category.level.code}/${category.skill}/${category.id}/${lesson.id}`}
              className={`card-hover border flex items-center gap-4 py-4 group ${
                isCompleted ? 'border-emerald-200' : ''
              }`}
              style={isCompleted ? { background: '#F0FDF4' } : {}}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'text-white'
              }`}
                style={!isCompleted ? { background: 'var(--primary-light)', color: 'var(--primary)' } : {}}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h3>
                {lesson.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center" style={{ color: 'var(--text-secondary)' }}>{typeIcon[lesson.type] ?? <FaFile size={14}/>}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{lesson._count.items} mục</span>
                <span className="opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--primary)' }}>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
