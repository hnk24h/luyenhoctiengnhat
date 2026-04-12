import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="rounded-2xl mb-6 px-6 py-5"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #5B5EA6 100%)' }}>
        <Link href={`/admin/mock-exam?subject=${section.mockExam.subject}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: '#fff' }}>
          ← Danh sách đề thi
        </Link>
        <h1 className="text-xl font-bold text-white mb-1">{section.mockExam.title}</h1>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {section.mockExam.subject} {section.mockExam.levelCode}
          </span>
        </div>
        <h2 className="text-base font-semibold text-white opacity-90 mt-2">
          {section.titleVi || section.title}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            {section.skill}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            {section.questions.length} câu hỏi
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            {Math.round(section.timeLimit / 60)} phút
          </span>
        </div>
      </div>
      <AdminMockExamQuestionsClient
        examId={params.id}
        sectionId={params.sectionId}
        questions={section.questions}
      />
    </div>
  );
}
