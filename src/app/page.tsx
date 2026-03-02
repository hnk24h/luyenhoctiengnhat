import Link from 'next/link';
import { SKILLS } from '@/lib/utils';

const LEVELS = [
  { code: 'N5', label: 'N5', desc: 'Sơ cấp', color: 'border-green-400 bg-green-50', badge: 'bg-green-100 text-green-700' },
  { code: 'N4', label: 'N4', desc: 'Sơ trung cấp', color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { code: 'N3', label: 'N3', desc: 'Trung cấp', color: 'border-yellow-400 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  { code: 'N2', label: 'N2', desc: 'Trung cao cấp', color: 'border-orange-400 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  { code: 'N1', label: 'N1', desc: 'Cao cấp', color: 'border-red-400 bg-red-50', badge: 'bg-red-100 text-red-700' },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">🇯🇵</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Luyện Thi Tiếng Nhật JLPT
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Hệ thống học và luyện thi 4 kỹ năng (Nghe, Nói, Đọc, Viết) theo cấp độ N5~N1
        </p>
        <Link href="/levels" className="btn-primary text-base px-8 py-3">
          Bắt đầu học ngay →
        </Link>
      </div>

      {/* Kỹ năng */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">4 Kỹ năng luyện thi</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SKILLS.map(skill => (
            <div key={skill.key} className="card text-center hover:shadow-md transition">
              <div className="text-4xl mb-2">{skill.icon}</div>
              <div className="font-semibold text-gray-900">{skill.label}</div>
              <div className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${skill.color}`}>{skill.key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cấp độ */}
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Chọn cấp độ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {LEVELS.map(l => (
            <Link key={l.code} href={`/levels/${l.code}`}
              className={`card border-2 text-center hover:shadow-lg transition cursor-pointer ${l.color}`}>
              <div className="text-3xl font-bold text-gray-900 mb-1">{l.label}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${l.badge} inline-block`}>{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
