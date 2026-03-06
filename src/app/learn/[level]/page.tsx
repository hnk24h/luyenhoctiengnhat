import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';

interface Props { params: { level: string } }

const LEVEL_META: Record<string, { desc: string; bg: string; color: string; gradient: string }> = {
  N5: { desc: 'Sơ cấp',       bg: '#DCFCE7', color: '#15803D', gradient: 'from-emerald-500 to-green-600' },
  N4: { desc: 'Sơ trung cấp', bg: '#DBEAFE', color: '#1D4ED8', gradient: 'from-blue-500 to-indigo-600' },
  N3: { desc: 'Trung cấp',    bg: '#FEF9C3', color: '#92400E', gradient: 'from-amber-500 to-orange-500' },
  N2: { desc: 'Trung cao cấp',bg: '#FFEDD5', color: '#C2410C', gradient: 'from-orange-500 to-red-500' },
  N1: { desc: 'Cao cấp',      bg: '#FFE4E6', color: '#BE123C', gradient: 'from-rose-600 to-red-700' },
};

const SKILL_STYLE: Record<string, { cls: string; ring: string }> = {
  nghe: { cls: 'skill-nghe', ring: 'ring-blue-200' },
  noi:  { cls: 'skill-noi',  ring: 'ring-green-200' },
  doc:  { cls: 'skill-doc',  ring: 'ring-amber-200' },
  viet: { cls: 'skill-viet', ring: 'ring-purple-200' },
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

export const dynamic = 'force-dynamic';

export default async function LearnLevelPage({ params }: Props) {
  const level = await getLevel(params.level);
  if (!level) notFound();

  const meta = LEVEL_META[level.code] ?? { desc: '', bg: '#F3F4F6', color: '#374151', gradient: 'from-gray-500 to-gray-700' };

  const grouped = SKILLS.map(skill => ({
    skill,
    categories: level.learningCategories.filter(c => c.skill === skill.key),
  })).filter(g => g.categories.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Học</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{level.code}</span>
      </div>

      {/* Level header */}
      <div className={`rounded-2xl bg-gradient-to-br ${meta.gradient} text-white px-8 py-7 mb-8 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm mb-1" style={{ color: 'rgba(255,255,255,.88)' }}>{meta.desc}</div>
            <h1 className="text-4xl font-bold mb-1">Học {level.code}</h1>
            <p style={{ color: 'rgba(255,255,255,.92)' }}>{level.name}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black opacity-20">{level.code}</div>
          </div>
        </div>
      </div>

      {/* Skills & categories */}
      <div className="space-y-8">
        {grouped.map(({ skill, categories }) => {
          const ss = SKILL_STYLE[skill.key] ?? { cls: '', ring: '' };
          return (
            <div key={skill.key}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{skill.icon}</span>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Kỹ năng {skill.label}</h2>
                <span className={`badge border ${ss.cls}`}>{categories.length} chủ đề</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                  <Link key={cat.id}
                    href={`/learn/${level.code}/${skill.key}/${cat.id}`}
                    className={`card-hover border flex items-center gap-4 ${ss.cls}`}>
                    <div className="text-3xl shrink-0">{cat.icon ?? skill.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-0.5">{cat.name}</div>
                      {cat.description && (
                        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
                      )}
                      <div className="text-xs mt-1 flex flex-wrap gap-x-3 gap-y-1" style={{ color: 'var(--text-muted)' }}>
                        <span>{cat._count.lessons} bài học</span>
                        <span>Bắt đầu theo thứ tự từ bài 1</span>
                      </div>
                    </div>
                    <span className="text-lg" style={{ opacity: 0.6 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {grouped.length === 0 && (
          <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
            Chưa có nội dung cho cấp độ này. Hãy seed dữ liệu tại{' '}
            <Link href="/admin/seed" style={{ color: 'var(--accent)' }} className="underline">Admin → Seed</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
