import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LessonClient from './LessonClient';

interface Props {
  params: { level: string; skill: string; categoryId: string; lessonId: string }
}

async function getLesson(lessonId: string, userId?: string) {
  return prisma.learningLesson.findUnique({
    where: { id: lessonId },
    include: {
      items: { orderBy: { order: 'asc' } },
      progress: userId ? { where: { userId } } : false,
      category: { include: { level: true, lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } } } },
    },
  });
}

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-5 flex-wrap">
        <Link href="/learn" className="hover:text-red-600">Học</Link>
        <span>/</span>
        <Link href={`/learn/${category.level.code}`} className="hover:text-red-600">{category.level.code}</Link>
        <span>/</span>
        <Link href={`/learn/${category.level.code}/${category.skill}/${category.id}`} className="hover:text-red-600">
          {category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="card mb-6 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${skill?.color ?? 'bg-gray-100'}`}>{skill?.label}</span>
              <span className="text-xs text-gray-400">Bài {currentIdx + 1} / {allLessons.length}</span>
              {isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Đã học</span>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            {lesson.description && <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <LessonClient
        lessonId={lesson.id}
        lessonType={lesson.type}
        content={lesson.content}
        items={lesson.items}
        isCompleted={!!isCompleted}
        isLoggedIn={!!userId}
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title, categoryId: category.id, level: category.level.code, skill: category.skill } : null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title, categoryId: category.id, level: category.level.code, skill: category.skill } : null}
      />
    </div>
  );
}
