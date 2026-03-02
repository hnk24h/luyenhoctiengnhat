import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';

interface Props { params: { level: string } }

const LEVEL_INFO: Record<string, { desc: string; gradient: string }> = {
  N5: { desc: 'Sơ cấp', gradient: 'from-green-500 to-emerald-600' },
  N4: { desc: 'Sơ trung cấp', gradient: 'from-blue-500 to-cyan-600' },
  N3: { desc: 'Trung cấp', gradient: 'from-yellow-500 to-orange-500' },
  N2: { desc: 'Trung cao cấp', gradient: 'from-orange-500 to-red-500' },
  N1: { desc: 'Cao cấp', gradient: 'from-red-600 to-rose-700' },
};

async function getLevel(code: string) {
  return prisma.level.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      learningCategories: {
        include: { _count: { select: { lessons: true } } },
        orderBy: [{ skill: 'asc' }, { order: 'asc' }],
      },
    },
  });
}

export default async function LearnLevelPage({ params }: Props) {
  const level = await getLevel(params.level);
  if (!level) notFound();

  const info = LEVEL_INFO[level.code] ?? { desc: '', gradient: 'from-gray-500 to-gray-700' };

  const grouped = SKILLS.map(skill => ({
    skill,
    categories: level.learningCategories.filter(c => c.skill === skill.key),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${info.gradient} text-white p-8 mb-8`}>
        <Link href="/learn" className="text-white/70 text-sm hover:text-white mb-3 block">← Tất cả cấp độ</Link>
        <h1 className="text-4xl font-bold mb-1">Học {level.code}</h1>
        <p className="text-white/80 text-lg">{level.name} · {info.desc}</p>
        {level.description && <p className="text-white/60 text-sm mt-2">{level.description}</p>}
      </div>

      {/* Skills & categories */}
      <div className="space-y-10">
        {grouped.map(({ skill, categories }) => (
          <div key={skill.key}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{skill.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">Kỹ năng {skill.label}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${skill.color}`}>{categories.length} chủ đề</span>
            </div>
            {categories.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-400 text-center">
                Chưa có nội dung cho kỹ năng này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <Link key={cat.id}
                    href={`/learn/${level.code}/${skill.key}/${cat.id}`}
                    className="card border hover:border-red-300 hover:shadow-md transition group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{cat.icon ?? skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition leading-tight">{cat.name}</h3>
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-400">{cat._count.lessons} bài học</div>
                      </div>
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
