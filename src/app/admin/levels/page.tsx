import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaHouse, FaChevronRight } from 'react-icons/fa6';
import AdminLevelsClient from './AdminLevelsClient';

export const dynamic = 'force-dynamic';

export default async function AdminLevelsPage({ searchParams: rawSearchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const searchParams = await rawSearchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'HSK', 'BJT', 'PMP'].includes(searchParams.subject ?? '') ? searchParams.subject : 'JLPT') as string;

  const [levels, skillCounts] = await Promise.all([
    prisma.level.findMany({
      where: { subject: subject as any },
      orderBy: { order: 'asc' },
    }),
    prisma.examSet.groupBy({
      by: ['levelId', 'skill'],
      _count: { id: true },
      where: { level: { subject: subject as any } },
    }),
  ]);

  // Build map: levelId -> { skill -> count }
  const skillMap: Record<string, Record<string, number>> = {};
  for (const row of skillCounts) {
    skillMap[row.levelId] ??= {};
    skillMap[row.levelId][row.skill] = row._count.id;
  }

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Cấp độ</span>
      </nav>
      <AdminLevelsClient levels={levels} skillMap={skillMap} subject={subject} />
    </div>
  );
}
