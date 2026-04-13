import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { FaHouse, FaChevronRight } from 'react-icons/fa6';
import AdminQuestionsClient from './AdminQuestionsClient';

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

export default async function AdminQuestionsPage({ params: rawParams }: Props) {
  const params = await rawParams;
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
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <Link href="/admin/examsets" className="hover:underline">Bộ đề</Link>
        <FaChevronRight size={8} />
        <span className="font-medium truncate max-w-[240px]" style={{ color: 'var(--text-primary)' }}>{examSet.title}</span>
      </nav>

      {/* Info bar */}
      <div className="admin-card p-3 flex items-center gap-3 flex-wrap">
        <Link href="/admin/examsets"
          className="text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{ color: 'var(--primary)' }}>
          ← Danh sách bộ đề
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span className="text-sm font-bold truncate flex-1 min-w-0" style={{ color: 'var(--text-primary)' }}>{examSet.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {examSet.level.code}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#EEF2FF', color: '#4338CA' }}>
            {examSet.skill}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {examSet.questions.length} câu
          </span>
        </div>
      </div>

      <AdminQuestionsClient examSetId={examSet.id} questions={examSet.questions} />
    </div>
  );
}
