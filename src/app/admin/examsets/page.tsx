import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FaHouse, FaChevronRight } from 'react-icons/fa6';
import AdminExamSetsClient from './AdminExamSetsClient';

export const dynamic = 'force-dynamic';

export default async function AdminExamSetsPage({ searchParams: rawSearchParams }: { searchParams: Promise<{ level?: string; subject?: string }> }) {
  const searchParams = await rawSearchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'HSK', 'BJT', 'PMP'].includes(searchParams.subject ?? '') ? searchParams.subject : undefined) as string | undefined;

  const [levels, examSets] = await Promise.all([
    prisma.level.findMany({
      where: subject ? { subject: subject as any } : {},
      orderBy: { order: 'asc' },
    }),
    prisma.examSet.findMany({
      where: {
        ...(searchParams.level ? { level: { code: searchParams.level } } : {}),
        ...(!searchParams.level && subject ? { level: { subject: subject as any } } : {}),
      },
      include: { level: true, _count: { select: { questions: true } } },
      orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Bộ đề</span>
      </nav>
      <AdminExamSetsClient levels={levels} examSets={examSets} subject={subject ?? ''} />
    </div>
  );
}
