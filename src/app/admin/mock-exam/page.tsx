import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaClipboardList } from 'react-icons/fa6';
import AdminPageHeader from '../_components/AdminPageHeader';
import AdminMockExamClient from './AdminMockExamClient';

export const dynamic = 'force-dynamic';

const SUBJECT_LABEL: Record<string, { label: string; flag: string }> = {
  JLPT: { label: 'Tiếng Nhật — JLPT', flag: '🇯🇵' },
  BJT:  { label: 'Business Japanese — BJT', flag: '💼' },
};

export default async function AdminMockExamPage({ searchParams: rawSearchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const searchParams = await rawSearchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'BJT'].includes(searchParams.subject ?? '') ? searchParams.subject : undefined) as string | undefined;

  const exams = await prisma.mockExam.findMany({
    where: subject ? { subject: subject as any } : { subject: { in: ['JLPT', 'BJT'] as any } },
    include: {
      sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  const meta = subject ? SUBJECT_LABEL[subject] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AdminPageHeader
        icon={<FaClipboardList size={18} />}
        title="Đề thi thử"
        breadcrumb="Quản lý đề thi thử"
        badge={`${exams.length} đề${meta ? ` — ${meta.flag} ${meta.label}` : ''}`}
        subjects={{ active: subject, baseHref: '/admin/mock-exam', showAll: true }}
      />
      <AdminMockExamClient exams={exams} subject={subject ?? ''} />
    </div>
  );
}
