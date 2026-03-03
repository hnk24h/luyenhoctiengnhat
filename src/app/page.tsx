import Link from 'next/link';
import { FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaMapPin, FaBook, FaCircleCheck } from 'react-icons/fa6';
import type { ReactNode } from 'react';

const LEVELS = [
  { code: 'N5', desc: 'Sơ cấp',        bg: '#DCFCE7', color: '#15803D', bar: '#4ADE80', pct: 20, jp: 'にほんご　はじめの　いっぽ' },
  { code: 'N4', desc: 'Sơ trung cấp',  bg: '#DBEAFE', color: '#1D4ED8', bar: '#60A5FA', pct: 40, jp: 'よみかき・かいわの　きそ' },
  { code: 'N3', desc: 'Trung cấp',     bg: '#FEF9C3', color: '#92400E', bar: '#FCD34D', pct: 60, jp: 'ふつう　にほんごの　せかい' },
  { code: 'N2', desc: 'Trung cao cấp', bg: '#FFEDD5', color: '#C2410C', bar: '#FB923C', pct: 80, jp: 'ビジネス・じゅけんに　むけて' },
  { code: 'N1', desc: 'Cao cấp',       bg: '#FFE4E6', color: '#BE123C', bar: '#FB7185', pct: 100, jp: 'にほんごの　さいこうほう' },
];

const SKILLS: { icon: ReactNode; label: string; key: string; desc: string; cls: string }[] = [
  { icon: <FaHeadphones size={20}/>, label: 'Nghe',  key: 'nghe', desc: 'Luyện nghe hội thoại & thông báo', cls: 'skill-nghe' },
  { icon: <FaMicrophone size={20}/>, label: 'Nói',   key: 'noi',  desc: 'Mẫu câu giao tiếp tự nhiên',      cls: 'skill-noi' },
  { icon: <FaBookOpen size={20}/>,   label: 'Đọc',  key: 'doc',  desc: 'Từ vựng, ngữ pháp, đọc hiểu',     cls: 'skill-doc' },
  { icon: <FaPencil size={20}/>,     label: 'Viết', key: 'viet', desc: 'Kana, Kanji, cấu trúc câu',        cls: 'skill-viet' },
];

const STEPS: { num: string; icon: ReactNode; title: string; desc: string }[] = [
  { num: '01', icon: <FaMapPin size={28}/>,      title: 'Chọn cấp độ', desc: 'Bắt đầu từ N5 (sơ cấp) hoặc cấp độ phù hợp với bạn.' },
  { num: '02', icon: <FaBook size={28}/>,         title: 'Học từng chủ đề', desc: 'Từ vựng, ngữ pháp, luyện 4 kỹ năng nghe-nói-đọc-viết.' },
  { num: '03', icon: <FaCircleCheck size={28}/>,  title: 'Luyện thi & kiểm tra', desc: 'Thi thử với đề sát format JLPT, theo dõi điểm số.' },
];

const STATS = [
  { num: '1,200+', label: 'Bài học' },
  { num: '4',      label: 'Kỹ năng' },
  { num: '5',      label: 'Cấp độ N5~N1' },
  { num: '100%',   label: 'Miễn phí' },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-4" style={{ background: 'var(--bg-surface)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #3D3A8C, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #C84B31, transparent)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <span className="text-base">🇯🇵</span> Hệ thống học tiếng Nhật N5 → N1
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Chinh phục JLPT<br />
            <span style={{ color: 'var(--primary)' }}>theo từng bước nhỏ</span>
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Học từ vựng, ngữ pháp, luyện 4 kỹ năng và thi thử với đề sát format JLPT.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/learn" className="btn-primary px-8 py-3 text-base">Bắt đầu học →</Link>
            <Link href="/levels" className="btn-secondary px-8 py-3 text-base">Thi thử ngay</Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip (Riki-style) ──────────────────── */}
      <section style={{ background: 'var(--primary)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center text-white">
              <div className="text-2xl font-black">{s.num}</div>
              <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Level cards (DungMori-style) ──────────────── */}
      <section className="py-16 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>LỘ TRÌNH</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Chọn cấp độ của bạn</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Từ N5 (sơ cấp) đến N1 (cao cấp) — đi theo lộ trình hoặc nhảy thẳng vào level cần thiết</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {LEVELS.map((l, i) => (
              <Link key={l.code} href={`/learn/${l.code}`}
                className="group relative flex flex-col rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                style={{ background: l.bg }}>
                {/* Big faded level text bg */}
                <div className="absolute right-2 top-0 text-7xl font-black opacity-[0.07] select-none leading-none"
                  style={{ color: l.color }}>{l.code}</div>

                {/* Level badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white font-black text-lg mb-3 shrink-0"
                  style={{ background: l.color }}>
                  {l.code}
                </div>

                <div className="font-bold text-sm mb-0.5" style={{ color: l.color }}>{l.desc}</div>
                <div className="text-xs opacity-60 font-japanese mb-3" style={{ color: l.color }}>{l.jp}</div>

                {/* Skill pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {SKILLS.map(sk => (
                    <span key={sk.key} className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(0,0,0,0.08)', color: l.color }}>
                      {sk.icon}
                    </span>
                  ))}
                </div>

                {/* Progress strip (difficulty) */}
                <div className="mt-auto">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${l.pct}%`, background: l.bar }} />
                  </div>
                  <div className="text-xs mt-1 opacity-50" style={{ color: l.color }}>
                    {'★'.repeat(i + 1)}{'☆'.repeat(4 - i)} độ khó
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>CÁCH HOẠT ĐỘNG</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>3 bước đơn giản để bắt đầu</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(step => (
              <div key={step.num} className="flex flex-col items-center text-center p-6 rounded-2xl relative"
                style={{ background: 'var(--primary-light)' }}>
              <div className="font-black opacity-20 absolute top-3 right-4 text-5xl select-none leading-none" style={{ color: 'var(--primary)' }}>
                  {step.num}
                </div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 Skills ─────────────────────────────────── */}
      <section className="py-14 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>NỘI DUNG HỌC</div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>4 Kỹ năng luyện thi JLPT</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SKILLS.map(s => (
              <Link key={s.key} href="/learn"
                className={`card-hover border text-center p-5 ${s.cls}`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-bold text-base mb-1">{s.label}</div>
                <p className="text-xs opacity-80 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Japanese quote (Riki-style dark section) ──── */}
      <section className="py-16 px-4 text-center" style={{ background: 'var(--primary)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl font-black text-white opacity-20 font-japanese mb-2">知識への投資は最高の利益をもたらす</div>
          <p className="text-white/60 text-sm mb-6 italic">"Đầu tư vào tri thức mang lại lợi ích cao nhất" — B. Franklin</p>
          <h2 className="text-2xl font-bold text-white mb-3">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-white/70 text-sm mb-7">Học miễn phí, tiến trình lưu tự động.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="px-8 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90"
              style={{ background: '#fff', color: 'var(--primary)' }}>
              Đăng ký miễn phí →
            </Link>
            <Link href="/learn" className="px-8 py-3 rounded-xl font-bold text-base text-white transition-all"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)' }}>
              Học ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
