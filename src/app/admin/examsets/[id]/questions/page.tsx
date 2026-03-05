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
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

  const examSet = await prisma.examSet.findUnique({
    where: { id: params.id },
    include: {
      level: true,
      questions: { orderBy: { order: 'asc' } },
    },
  });
  if (!examSet) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/admin/examsets" className="text-sm text-gray-500 hover:text-red-600">← Danh sách bộ đề</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Câu hỏi: {examSet.title}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {examSet.level.code} · {examSet.skill} · {examSet.questions.length} câu hỏi
        </p>
      </div>
      <AdminQuestionsClient examSetId={examSet.id} questions={examSet.questions} />
    </div>
  );
}
