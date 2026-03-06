import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SKILLS, getSkillLabel } from '@/lib/utils';

interface Props { params: { level: string } }

async function getExamSets(levelCode: string) {
  const level = await prisma.level.findUnique({
    where: { code: levelCode.toUpperCase() },
    include: {
      examSets: {
        include: { _count: { select: { questions: true } } },
        orderBy: [{ skill: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
  return level;
}

export const dynamic = 'force-dynamic';

export default async function LevelDetailPage({ params }: Props) {
  const level = await getExamSets(params.level);
  if (!level) notFound();

  const grouped = SKILLS.map(skill => ({
    skill,
    sets: level.examSets.filter(s => s.skill === skill.key),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/levels" className="text-sm text-gray-500 hover:text-red-600">← Tất cả cấp độ</Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Cấp độ {level.code}</h1>
      <p className="text-gray-500 mb-8">{level.description || 'Luyện thi JLPT ' + level.code}</p>

      <div className="space-y-8">
        {grouped.map(({ skill, sets }) => (
          <div key={skill.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{skill.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">Kỹ năng {skill.label}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${skill.color}`}>{sets.length} bộ đề</span>
            </div>
            {sets.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-400">Chưa có bộ đề cho kỹ năng này.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.map(s => (
                  <Link key={s.id} href={`/exam/${s.id}`}
                    className="card hover:shadow-md transition border hover:border-red-300 group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-lg">{skill.icon}</span>
                      <span className="text-xs text-gray-400">{s._count.questions} câu hỏi</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition mb-1">{s.title}</h3>
                    {s.description && <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>}
                    {s.timeLimit && (
                      <div className="mt-2 text-xs text-gray-400">⏱ {Math.round(s.timeLimit / 60)} phút</div>
                    )}
                    <div className="mt-3">
                      <span className="text-xs font-medium text-red-600 group-hover:underline">Bắt đầu →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
