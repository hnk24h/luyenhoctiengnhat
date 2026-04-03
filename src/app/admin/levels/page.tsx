import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaBullseye } from 'react-icons/fa6';
import AdminPageHeader from '../_components/AdminPageHeader';
import AdminLevelsClient from './AdminLevelsClient';

export const dynamic = 'force-dynamic';

const SUBJECT_META: Record<string, { label: string; flag: string }> = {
  JLPT: { label: 'Tiếng Nhật — JLPT', flag: '🇯🇵' },
  HSK:  { label: 'Tiếng Trung — HSK',  flag: '🇨🇳' },
  PMP:  { label: 'Quản lý dự án — PMP', flag: '📋' },
};

export default async function AdminLevelsPage({ searchParams }: { searchParams: { subject?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'HSK', 'PMP'].includes(searchParams.subject ?? '') ? searchParams.subject : 'JLPT') as string;
  const meta = SUBJECT_META[subject] ?? SUBJECT_META.JLPT;

  const levels = await prisma.level.findMany({
    where: { subject: subject as any },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AdminPageHeader
        icon={<FaBullseye size={18} />}
        title="Cấp độ"
        breadcrumb="Quản lý cấp độ"
        badge={`${levels.length} cấp — ${meta.flag} ${meta.label}`}
        subjects={{ active: subject, baseHref: '/admin/levels' }}
      />
      <AdminLevelsClient levels={levels} subject={subject} />
    </div>
  );
}
