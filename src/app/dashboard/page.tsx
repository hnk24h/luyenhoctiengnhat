import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSkillLabel, SKILLS } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;

  const [recentSessions, progress] = await Promise.all([
    prisma.examSession.findMany({
      where: { userId },
      include: { examSet: { include: { level: true } } },
      orderBy: { startedAt: 'desc' },
      take: 10,
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: { examSet: { include: { level: true } } },
      orderBy: { lastAttempt: 'desc' },
    }),
  ]);

  const skillStats = SKILLS.map(skill => {
    const done = progress.filter(p => p.examSet.skill === skill.key);
    const avg = done.length > 0 ? Math.round(done.reduce((a, p) => a + (p.bestScore ?? 0), 0) / done.length) : null;
    return { ...skill, done: done.length, avg };
  });

  const skillClass: Record<string, string> = {
    nghe: 'skill-nghe', noi: 'skill-noi', doc: 'skill-doc', viet: 'skill-viet',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Bảng điều khiển</p>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Tiến trình học tập</h1>
        <p style={{ color: 'var(--text-muted)' }}>Xin chào, <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{session.user?.name}</span>!</p>
      </div>

      {/* Skill stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skillStats.map(s => (
          <div key={s.key} className={`card-hover border text-center ${skillClass[s.key] ?? ''}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</div>
            <div className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{s.done}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>bộ đề đã làm</div>
            {s.avg !== null && (
              <div className="text-sm font-bold mt-2 px-2 py-0.5 rounded-full inline-block"
                style={s.avg >= 60
                  ? { background: '#D1FAE5', color: '#065F46' }
                  : { background: '#FDE8E5', color: 'var(--accent)' }}>
                {s.avg}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Lịch sử làm bài</h2>
        {recentSessions.length === 0 ? (
          <div className="card text-center py-10" style={{ color: 'var(--text-muted)' }}>
            Bạn chưa làm bài thi nào.{' '}
            <Link href="/levels" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Bắt đầu ngay →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map(s => {
              const skill = SKILLS.find(sk => sk.key === s.examSet.skill);
              const pct = s.totalQ > 0 ? Math.round((s.correctQ / s.totalQ) * 100) : 0;
              const good = pct >= 60;
              return (
                <div key={s.id} className="card-hover border flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'var(--primary-light)' }}>
                      <SkillIcon skill={s.examSet.skill} size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.examSet.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {s.examSet.level.code} · {skill?.label} · {new Date(s.startedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold" style={{ color: good ? '#059669' : 'var(--accent)' }}>{pct}%</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.correctQ}/{s.totalQ}</span>
                    <Link href={`/results/${s.id}`} className="btn-secondary text-xs py-1 px-3">Xem lại</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
