import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaBook } from 'react-icons/fa6';
import AdminPageHeader from '../_components/AdminPageHeader';
import AdminExamSetsClient from './AdminExamSetsClient';

export const dynamic = 'force-dynamic';

const SUBJECT_LABEL: Record<string, { label: string; flag: string }> = {
  JLPT: { label: 'Tiếng Nhật — JLPT', flag: '🇯🇵' },
  HSK:  { label: 'Tiếng Trung — HSK',  flag: '🇨🇳' },
  PMP:  { label: 'Quản lý dự án — PMP', flag: '📋' },
};

export default async function AdminExamSetsPage({ searchParams: rawSearchParams }: { searchParams: Promise<{ level?: string; subject?: string }> }) {
  const searchParams = await rawSearchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'HSK', 'PMP'].includes(searchParams.subject ?? '') ? searchParams.subject : undefined) as string | undefined;

  const levels = await prisma.level.findMany({
    where: subject ? { subject: subject as any } : {},
    orderBy: { order: 'asc' },
  });

  const examSets = await prisma.examSet.findMany({
    where: {
      ...(searchParams.level ? { level: { code: searchParams.level } } : {}),
      ...(!searchParams.level && subject ? { level: { subject: subject as any } } : {}),
    },
    include: { level: true, _count: { select: { questions: true } } },
    orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AdminPageHeader
        icon={<FaBook size={18} />}
        title="Bộ đề"
        breadcrumb="Quản lý bộ đề"
        badge={`${examSets.length} bộ đề${subject ? ` — ${SUBJECT_LABEL[subject]?.flag} ${SUBJECT_LABEL[subject]?.label}` : ''}`}
        subjects={{ active: subject, baseHref: '/admin/examsets', showAll: true }}
      />
      <AdminExamSetsClient levels={levels} examSets={examSets} subject={subject ?? ''} />
    </div>
  );
}
