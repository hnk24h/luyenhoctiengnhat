import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LessonClient from './LessonClient';

interface Props {
  params: { lang: string; level: string; skill: string; categoryId: string; lessonId: string }
}

async function getLesson(lessonId: string, userId?: string) {
  return prisma.learningLesson.findUnique({
    where: { id: lessonId },
    include: {
      items: { orderBy: { order: 'asc' }, include: { meanings: true, examples: true } },
      progress: userId ? { where: { userId } } : false,
      category: { include: { level: true, lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } } } },
    },
  });
}

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const lesson = await getLesson(params.lessonId, userId);
  if (!lesson) notFound();

  const category = lesson.category;
  const skill = SKILLS.find(s => s.key === category.skill);
  const isCompleted = userId && (lesson.progress as any[])?.some((p: any) => p.completed);
  const allLessons = category.lessons;
  const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs mb-5 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
        <Link href="/learn" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Học</Link>
        <span>/</span>
        <Link href={`/${params.lang}/learn/${category.level.code}`} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>{category.level.code}</Link>
        <span>/</span>
        <Link href={`/${params.lang}/learn/${category.level.code}/${category.skill}/${category.id}`} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
          {category.name}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--primary)', padding: '1.25rem 1.5rem' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${skill?.color ?? 'bg-gray-100'}`}>{skill?.label}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bài {currentIdx + 1} / {allLessons.length}</span>
              {isCompleted && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#166534' }}>✓ Đã học</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h1>
            {lesson.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <LessonClient
        lessonId={lesson.id}
        lessonType={lesson.type}
        content={null}
        items={lesson.items}
        isCompleted={!!isCompleted}
        isLoggedIn={!!userId}
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title, categoryId: category.id, level: category.level.code, skill: category.skill } : null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title, categoryId: category.id, level: category.level.code, skill: category.skill } : null}
      />
    </div>
  );
}
