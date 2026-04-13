import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaHouse, FaChevronRight } from 'react-icons/fa6';
import AdminMockExamClient from './AdminMockExamClient';

export const dynamic = 'force-dynamic';

export default async function AdminMockExamPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const exams = await prisma.mockExam.findMany({
    where: { subject: { in: ['JLPT', 'BJT'] as any } },
    include: {
      sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Đề thi thử</span>
      </nav>
      <AdminMockExamClient exams={exams} />
    </div>
  );
}

