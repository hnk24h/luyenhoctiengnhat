import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminExamSetsClient from './AdminExamSetsClient';

export const dynamic = 'force-dynamic';

const SUBJECT_LABEL: Record<string, { label: string; flag: string }> = {
  JLPT: { label: 'Tiếng Nhật — JLPT', flag: '🇯🇵' },
  HSK:  { label: 'Tiếng Trung — HSK',  flag: '🇨🇳' },
  PMP:  { label: 'Quản lý dự án — PMP', flag: '📋' },
};

export default async function AdminExamSetsPage({ searchParams }: { searchParams: { level?: string; subject?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
      {/* Gradient header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #5B5EA6 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        marginTop: 24,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
            <a href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Admin</a>
            {' / '}Quản lý bộ đề
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📝 Bộ đề</h1>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>
              {examSets.length} bộ đề
            </span>
            {subject && (
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>
                {SUBJECT_LABEL[subject]?.flag} {SUBJECT_LABEL[subject]?.label}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="/admin/examsets" style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
            background: !subject ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
            color: !subject ? 'var(--primary)' : '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>🌐 Tất cả</a>
          {Object.entries(SUBJECT_LABEL).map(([s, m]) => (
            <a key={s} href={`/admin/examsets?subject=${s}`} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              textDecoration: 'none',
              background: subject === s ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              color: subject === s ? 'var(--primary)' : '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {m.flag} {s}
            </a>
          ))}
        </div>
      </div>
      <AdminExamSetsClient levels={levels} examSets={examSets} subject={subject ?? ''} />
    </div>
  );
}
