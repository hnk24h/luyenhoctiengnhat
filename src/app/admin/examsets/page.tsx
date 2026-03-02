import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminExamSetsClient from './AdminExamSetsClient';

export default async function AdminExamSetsPage({ searchParams }: { searchParams: { level?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

  const levels = await prisma.level.findMany({ orderBy: { order: 'asc' } });
  const examSets = await prisma.examSet.findMany({
    where: searchParams.level ? { level: { code: searchParams.level } } : {},
    include: { level: true, _count: { select: { questions: true } } },
    orderBy: [{ level: { order: 'asc' } }, { skill: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Quản lý bộ đề</h1>
        </div>
      </div>
      <AdminExamSetsClient levels={levels} examSets={examSets} />
    </div>
  );
}
