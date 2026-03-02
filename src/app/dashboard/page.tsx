import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSkillLabel, SKILLS } from '@/lib/utils';

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Tiến trình học tập</h1>
      <p className="text-gray-500 mb-8">Xin chào, {session.user?.name}!</p>

      {/* Skill stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {skillStats.map(s => (
          <div key={s.key} className="card text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="font-semibold">{s.label}</div>
            <div className="text-2xl font-bold mt-1 text-gray-900">{s.done}</div>
            <div className="text-xs text-gray-400">bộ đề đã làm</div>
            {s.avg !== null && (
              <div className={`text-sm font-semibold mt-1 ${s.avg >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                Avg: {s.avg}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử làm bài</h2>
      {recentSessions.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">
          Bạn chưa làm bài thi nào.{' '}
          <Link href="/levels" className="text-red-600 hover:underline">Bắt đầu ngay →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recentSessions.map(s => {
            const skill = SKILLS.find(sk => sk.key === s.examSet.skill);
            const pct = s.totalQ > 0 ? Math.round((s.correctQ / s.totalQ) * 100) : 0;
            return (
              <div key={s.id} className="card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{skill?.icon ?? '📝'}</span>
                  <div>
                    <div className="font-medium text-gray-900">{s.examSet.title}</div>
                    <div className="text-xs text-gray-400">
                      {s.examSet.level.code} · {skill?.label} ·{' '}
                      {new Date(s.startedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${pct >= 60 ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
                  <span className="text-xs text-gray-400">{s.correctQ}/{s.totalQ}</span>
                  <Link href={`/results/${s.id}`} className="btn-secondary text-xs py-1 px-2">Xem lại</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
