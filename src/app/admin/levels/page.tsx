import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminLevelsClient from './AdminLevelsClient';

export const dynamic = 'force-dynamic';

const SUBJECT_META: Record<string, { label: string; flag: string }> = {
  JLPT: { label: 'Tiếng Nhật — JLPT', flag: '🇯🇵' },
  HSK:  { label: 'Tiếng Trung — HSK',  flag: '🇨🇳' },
  PMP:  { label: 'Quản lý dự án — PMP', flag: '📋' },
};

export default async function AdminLevelsPage({ searchParams }: { searchParams: { subject?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

  const subject = (['JLPT', 'HSK', 'PMP'].includes(searchParams.subject ?? '') ? searchParams.subject : 'JLPT') as string;
  const meta = SUBJECT_META[subject] ?? SUBJECT_META.JLPT;

  const levels = await prisma.level.findMany({
    where: { subject: subject as any },
    orderBy: { order: 'asc' },
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
      {/* Gradient header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
            {' / '}Quản lý cấp độ
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🎯 Cấp độ</h1>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>
              {levels.length} cấp — {meta.flag} {meta.label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(SUBJECT_META).map(([s, m]) => (
            <a key={s} href={`/admin/levels?subject=${s}`} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              textDecoration: 'none',
              background: subject === s ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              color: subject === s ? '#dc2626' : '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {m.flag} {s}
            </a>
          ))}
        </div>
      </div>

      <AdminLevelsClient levels={levels} subject={subject} />
    </div>
  );
}
