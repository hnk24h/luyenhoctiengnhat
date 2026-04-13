import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { FaHouse, FaChevronRight } from 'react-icons/fa6';
import AdminMockExamQuestionsClient from './AdminMockExamQuestionsClient';

interface Props { params: Promise<{ id: string; sectionId: string }> }

export const dynamic = 'force-dynamic';

export default async function AdminMockExamSectionPage({ params: rawParams }: Props) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const section = await prisma.mockExamSection.findUnique({
    where: { id: params.sectionId },
    include: {
      mockExam: { select: { id: true, title: true, subject: true, levelCode: true } },
      questions: { orderBy: { order: 'asc' } },
    },
  });
  if (!section || section.mockExam.id !== params.id) notFound();

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href="/admin" className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
          <FaHouse size={11} /> Trang chủ
        </Link>
        <FaChevronRight size={9} />
        <Link href={`/admin/mock-exam?subject=${section.mockExam.subject}`} className="hover:text-[var(--primary)] transition-colors">
          Đề thi thử
        </Link>
        <FaChevronRight size={9} />
        <Link href={`/admin/mock-exam/${params.id}/sections`} className="hover:text-[var(--primary)] transition-colors" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {section.mockExam.title}
        </Link>
        <FaChevronRight size={9} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{section.titleVi || section.title}</span>
      </nav>

      <AdminMockExamQuestionsClient
        examId={params.id}
        sectionId={params.sectionId}
        questions={section.questions}
      />
    </div>
  );
}
