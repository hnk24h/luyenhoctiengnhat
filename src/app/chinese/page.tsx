'use client';
import Link from 'next/link';
import { FaBookOpen, FaNewspaper, FaBookmark, FaLayerGroup, FaArrowRight, FaStar, FaGraduationCap, FaChartBar } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';

const HSK_LEVELS = [
  {
    level: 'HSK 1',
    code: 'HSK1',
    color: '#48BB78',
    bg: '#F0FFF4',
    darkBg: '#1a3a2a',
    vocab: '~150 từ',
    desc: 'Giao tiếp cơ bản, chào hỏi, số đếm, ngày tháng.',
    topics: ['Tự giới thiệu', 'Gia đình', 'Thời gian'],
    order: 1,
  },
  {
    level: 'HSK 2',
    code: 'HSK2',
    color: '#4299E1',
    bg: '#EBF8FF',
    darkBg: '#1a2e3a',
    vocab: '~300 từ',
    desc: 'Giao tiếp thông thường về các chủ đề quen thuộc.',
    topics: ['Mua sắm', 'Giao thông', 'Sức khỏe'],
    order: 2,
  },
  {
    level: 'HSK 3',
    code: 'HSK3',
    color: '#9F7AEA',
    bg: '#FAF5FF',
    darkBg: '#2a1a3a',
    vocab: '~600 từ',
    desc: 'Xử lý hầu hết tình huống khi du lịch Trung Quốc.',
    topics: ['Du lịch', 'Ẩm thực', 'Cuộc sống hàng ngày'],
    order: 3,
  },
  {
    level: 'HSK 4',
    code: 'HSK4',
    color: '#ED8936',
    bg: '#FFFAF0',
    darkBg: '#3a2a1a',
    vocab: '~1,200 từ',
    desc: 'Giao tiếp lưu loát về nhiều chủ đề đa dạng.',
    topics: ['Công việc', 'Xã hội', 'Văn hóa'],
    order: 4,
  },
  {
    level: 'HSK 5',
    code: 'HSK5',
    color: '#F56565',
    bg: '#FFF5F5',
    darkBg: '#3a1a1a',
    vocab: '~2,500 từ',
    desc: 'Đọc báo, tạp chí; xem phim không cần phụ đề.',
    topics: ['Báo chí', 'Văn học', 'Kinh tế'],
    order: 5,
  },
  {
    level: 'HSK 6',
    code: 'HSK6',
    color: '#D53F8C',
    bg: '#FFF5F7',
    darkBg: '#3a1a2a',
    vocab: '~5,000+ từ',
    desc: 'Đọc, nghe, viết lưu loát như người bản ngữ.',
    topics: ['Học thuật', 'Nghiên cứu', 'Văn học nâng cao'],
    order: 6,
  },
];

const FEATURES = [
  { icon: FaBookOpen,     title: 'Từ vựng HSK',         desc: 'Học từ vựng theo từng cấp độ HSK với ví dụ và pinyin.' },
  { icon: FaNewspaper,    title: 'Đọc hiểu',             desc: 'Bài đọc tiếng Trung theo cấp độ với giải thích chi tiết.' },
  { icon: FaLayerGroup,   title: 'Flashcard thông minh', desc: 'Ôn tập từ vựng bằng SRS (Spaced Repetition System).' },
  { icon: FaGraduationCap, title: 'Luyện thi HSK',       desc: 'Đề thi thử theo từng cấp độ HSK chuẩn.' },
];

export default function ChinesePage() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            🇨🇳 Học Tiếng Trung Quốc
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Học Tiếng Trung<br />
            <span style={{ color: '#FED7D7' }}>từ HSK 1 đến HSK 6</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Lộ trình học hoàn chỉnh từ cơ bản đến nâng cao. Từ vựng, đọc hiểu, luyện thi — tất cả trong một nền tảng.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/chinese/vocab"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.5)' }}>
              <FaBookmark size={14} /> Học từ vựng
            </Link>
            <Link href="/chinese/reading"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'white', color: '#e53e3e' }}>
              <FaNewspaper size={14} /> Đọc hiểu <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* HSK Levels */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Chọn cấp độ HSK</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Mỗi cấp độ tương đương một mức thành thạo tiếng Trung</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HSK_LEVELS.map(hsk => (
            <Link
              key={hsk.code}
              href={`/chinese/vocab?level=${hsk.code}`}
              className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-lg border"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold text-white mb-2"
                    style={{ background: hsk.color }}>
                    {hsk.level}
                  </span>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{hsk.vocab}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
                  style={{ background: `${hsk.color}20`, color: hsk.color }}>
                  中
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{hsk.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {hsk.topics.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-lg text-xs font-medium"
                    style={{ background: `${hsk.color}15`, color: hsk.color }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: hsk.color }}>
                Bắt đầu học <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="rounded-3xl p-8 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Tính năng học tập</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl mx-auto mb-3"
                  style={{ background: '#FED7D720', color: '#e53e3e' }}>
                  <f.icon size={20} />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
