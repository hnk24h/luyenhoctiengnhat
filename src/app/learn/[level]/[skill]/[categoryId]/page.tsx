import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-5 flex-wrap">
        <Link href="/learn" className="hover:text-red-600">Học</Link>
        <span>/</span>
        <Link href={`/learn/${category.level.code}`} className="hover:text-red-600">{category.level.code}</Link>
        <span>/</span>
        <span className="text-gray-600">{category.name}</span>
      </div>

      {/* Header */}
      <div className="card mb-6 bg-gradient-to-r from-gray-50 to-white border-l-4 border-l-red-500">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{category.icon ?? skill?.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${skill?.color ?? 'bg-gray-100'}`}>{skill?.label}</span>
              <span className="text-xs text-gray-400">Cấp {category.level.code}</span>
              <span className="text-xs text-gray-400">{category.lessons.length} bài</span>
            </div>
            {category.description && <p className="text-sm text-gray-500 mt-2">{category.description}</p>}
          </div>
          {userId && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-gray-900">{completedCount}/{category.lessons.length}</div>
              <div className="text-xs text-gray-400">hoàn thành</div>
            </div>
          )}
        </div>
        {userId && category.lessons.length > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${Math.round((completedCount / category.lessons.length) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="space-y-2">
        {category.lessons.length === 0 ? (
          <div className="card text-center text-gray-400 py-10">Chưa có bài học nào.</div>
        ) : category.lessons.map((lesson, idx) => {
          const isCompleted = userId && (lesson.progress as any[])?.some((p: any) => p.completed);
          const typeIcon: Record<string, string> = { vocab: '🔤', grammar: '📐', audio: '🎧', text: '📄' };
          return (
            <Link key={lesson.id}
              href={`/learn/${category.level.code}/${category.skill}/${category.id}/${lesson.id}`}
              className={`card flex items-center gap-4 py-4 border hover:border-red-300 hover:shadow-sm transition group
                ${isCompleted ? 'bg-green-50' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600'}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition">{lesson.title}</h3>
                {lesson.description && <p className="text-xs text-gray-400 mt-0.5">{lesson.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm">{typeIcon[lesson.type] ?? '📄'}</span>
                <span className="text-xs text-gray-400">{lesson._count.items} mục</span>
                <span className="text-gray-300 group-hover:text-red-400">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
