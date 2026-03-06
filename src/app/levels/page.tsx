export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SKILLS } from '@/lib/utils';

const LEVEL_INFO: Record<string, { desc: string; color: string; badge: string }> = {
  N5: { desc: 'Sơ cấp', color: 'border-green-400 bg-green-50', badge: 'bg-green-100 text-green-700' },
  N4: { desc: 'Sơ trung cấp', color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  N3: { desc: 'Trung cấp', color: 'border-yellow-400 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  N2: { desc: 'Trung cao cấp', color: 'border-orange-400 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  N1: { desc: 'Cao cấp', color: 'border-red-400 bg-red-50', badge: 'bg-red-100 text-red-700' },
};

async function getLevels() {
  const levels = await prisma.level.findMany({ orderBy: { order: 'asc' } });
  return levels;
}

export default async function LevelsPage() {
  const levels = await getLevels();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Chọn cấp độ</h1>
      <p className="text-gray-500 mb-8">Chọn cấp độ JLPT phù hợp để bắt đầu luyện thi</p>
      {levels.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">
          Chưa có cấp độ nào. Admin hãy thêm cấp độ trong trang quản trị.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {levels.map(l => {
            const info = LEVEL_INFO[l.code] ?? { desc: '', color: '', badge: '' };
            return (
              <Link key={l.id} href={`/levels/${l.code}`}
                className={`card border-2 text-center hover:shadow-lg transition cursor-pointer ${info.color}`}>
                <div className="text-3xl font-bold text-gray-900 mb-1">{l.code}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${info.badge} inline-block mb-1`}>{info.desc}</div>
                {l.description && <p className="text-xs text-gray-500 mt-1">{l.description}</p>}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Luyện thi theo kỹ năng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SKILLS.map(skill => (
            <div key={skill.key} className="card text-center">
              <div className="text-3xl mb-1">{skill.icon}</div>
              <div className="font-semibold">{skill.label}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${skill.color}`}>{skill.key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
