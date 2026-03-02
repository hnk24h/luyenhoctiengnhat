import { prisma } from '@/lib/db';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';

const LEVEL_INFO: Record<string, { color: string; badge: string; desc: string }> = {
  N5: { color: 'border-green-400 bg-green-50 hover:bg-green-100', badge: 'bg-green-100 text-green-700', desc: 'Sơ cấp' },
  N4: { color: 'border-blue-400 bg-blue-50 hover:bg-blue-100', badge: 'bg-blue-100 text-blue-700', desc: 'Sơ trung cấp' },
  N3: { color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100', badge: 'bg-yellow-100 text-yellow-700', desc: 'Trung cấp' },
  N2: { color: 'border-orange-400 bg-orange-50 hover:bg-orange-100', badge: 'bg-orange-100 text-orange-700', desc: 'Trung cao cấp' },
  N1: { color: 'border-red-400 bg-red-50 hover:bg-red-100', badge: 'bg-red-100 text-red-700', desc: 'Cao cấp' },
};

async function getLevelsWithCount() {
  const levels = await prisma.level.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { learningCategories: true } } },
  });
  return levels;
}

export default async function LearnPage() {
  const levels = await getLevelsWithCount();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Học Tiếng Nhật</h1>
        <p className="text-gray-500">Học từ vựng, ngữ pháp và kỹ năng theo từng cấp độ N5~N1</p>
      </div>

      {levels.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">
          Chưa có nội dung học. Vui lòng seed dữ liệu tại <Link href="/admin/seed" className="text-red-600 underline">Admin → Seed</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {levels.map(l => {
            const info = LEVEL_INFO[l.code] ?? { color: '', badge: 'bg-gray-100 text-gray-600', desc: '' };
            return (
              <Link key={l.id} href={`/learn/${l.code}`}
                className={`card border-2 text-center transition cursor-pointer ${info.color}`}>
                <div className="text-3xl font-bold text-gray-900 mb-1">{l.code}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${info.badge} inline-block mb-2`}>{info.desc}</div>
                <div className="text-xs text-gray-500">{l._count.learningCategories} chủ đề</div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Skills overview */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">4 Kỹ năng rèn luyện</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SKILLS.map(s => (
          <div key={s.key} className="card text-center">
            <div className="text-4xl mb-2">{s.icon}</div>
            <div className="font-semibold text-gray-900">{s.label}</div>
            <p className="text-xs text-gray-400 mt-1">
              {s.key === 'nghe' && 'Luyện nghe hội thoại, thông báo'}
              {s.key === 'noi' && 'Mẫu câu giao tiếp, phát âm'}
              {s.key === 'doc' && 'Từ vựng, ngữ pháp, đọc hiểu'}
              {s.key === 'viet' && 'Hiragana, Katakana, Kanji'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
