import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import AdminQuestionsClient from './AdminQuestionsClient';

interface Props { params: { id: string } }

export const dynamic = 'force-dynamic';

export default async function AdminQuestionsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const examSet = await prisma.examSet.findUnique({
    where: { id: params.id },
    include: {
      level: true,
      questions: { orderBy: { order: 'asc' } },
    },
  });
  if (!examSet) notFound();

  return (
    <div className="px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div className="rounded-2xl mb-6 px-6 py-5"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #5B5EA6 100%)' }}>
        <Link href="/admin/examsets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: '#fff' }}>
          ← Danh sách bộ đề
        </Link>
        <h1 className="text-xl font-bold text-white mb-1">{examSet.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {examSet.level.code}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {examSet.skill}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            {examSet.questions.length} câu hỏi
          </span>
        </div>
      </div>
      <AdminQuestionsClient examSetId={examSet.id} questions={examSet.questions} />
    </div>
  );
}
