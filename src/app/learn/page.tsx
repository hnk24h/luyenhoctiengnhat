export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import Link from 'next/link';
import { SKILLS } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import { FaPencil } from 'react-icons/fa6';

const LEVEL_META: Record<string, { bg: string; color: string; bar: string; desc: string; pct: number; jp: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D', bar: '#4ADE80', desc: 'Sơ cấp',        pct: 20,  jp: 'にほんごはじめの一歩' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8', bar: '#60A5FA', desc: 'Sơ trung cấp',  pct: 40,  jp: 'よみかき・かいわの基礎' },
  N3: { bg: '#FEF9C3', color: '#92400E', bar: '#FCD34D', desc: 'Trung cấp',     pct: 60,  jp: 'ふつうレベル' },
  N2: { bg: '#FFEDD5', color: '#C2410C', bar: '#FB923C', desc: 'Trung cao cấp', pct: 80,  jp: 'ビジネスに向けて' },
  N1: { bg: '#FFE4E6', color: '#BE123C', bar: '#FB7185', desc: 'Cao cấp',       pct: 100, jp: '最高難易度' },
};

async function getLevelsWithCount() {
  return prisma.level.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { learningCategories: true } } },
  });
}

export default async function LearnPage() {
  const levels = await getLevelsWithCount();

  return (
    <div>
      {/* ── Page header ─────────────────────────────── */}
      <section className="py-12 px-4" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            NỘI DUNG HỌC
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Học Tiếng Nhật</h1>
          <p style={{ color: 'var(--text-muted)' }}>Chọn cấp độ từ N5 (sơ cấp) → N1 (cao cấp). Lộ trình được thiết kế từng bước nhỏ.</p>

          {/* Level quick tabs — DungMori-style horizontal pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(LEVEL_META).map(([code, m]) => (
              <Link key={code} href={`/learn/${code}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: m.bg, color: m.color }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: m.color }}>{code}</span>
                {m.desc}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Level cards grid ────────────────────────── */}
      <section className="py-10 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto">
          {levels.length === 0 ? (
            <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
              Chưa có nội dung học.{' '}
              <Link href="/admin/seed" style={{ color: 'var(--accent)' }} className="underline">Admin → Seed</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.map((l, i) => {
                const m = LEVEL_META[l.code] ?? { bg: '#F3F4F6', color: '#374151', bar: '#9CA3AF', desc: '', pct: 50, jp: '' };
                return (
                  <Link key={l.id} href={`/learn/${l.code}`}
                    className="group relative flex flex-col rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: m.bg }}>
                    {/* Faded bg code */}
                    <div className="absolute right-3 top-1 text-8xl font-black leading-none opacity-[0.07] select-none"
                      style={{ color: m.color }}>{l.code}</div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                        style={{ background: m.color }}>{l.code}</div>
                      <div>
                        <div className="font-bold" style={{ color: m.color }}>{m.desc}</div>
                        <div className="text-xs font-japanese opacity-50" style={{ color: m.color }}>{m.jp}</div>
                      </div>
                    </div>

                    <p className="text-xs mb-4 leading-relaxed opacity-70" style={{ color: m.color }}>
                      {l.name || `Cấp độ ${l.code} JLPT — ${l._count.learningCategories} chủ đề`}
                    </p>

                    {/* 4 skill quick pills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {SKILLS.map(sk => (
                        <span key={sk.key}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(0,0,0,0.08)', color: m.color }}>
                          {sk.icon} {sk.label}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs mb-1" style={{ color: m.color }}>
                        <span className="opacity-60">{l._count.learningCategories} chủ đề</span>
                        <span className="opacity-60">{'★'.repeat(i + 1)}{'☆'.repeat(4 - i)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.bar }} />
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Exam CTA card */}
              <Link href="/levels"
                className="flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl gap-3"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <FaPencil size={28} className="text-white"/>
                </div>
                <div className="font-bold text-lg">Luyện thi</div>
                <p className="text-sm text-white/70">Thi thử với đề sát format JLPT thật</p>
                <span className="px-4 py-1.5 rounded-xl text-sm font-bold mt-1"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Vào thi thử →
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 4 skills strip ──────────────────────────── */}
      <section className="py-10 px-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>4 Kỹ năng rèn luyện</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SKILLS.map(s => (
              <div key={s.key} className={`card-hover border text-center ${s.key === 'nghe' ? 'skill-nghe' : s.key === 'noi' ? 'skill-noi' : s.key === 'doc' ? 'skill-doc' : 'skill-viet'}`}>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-2 mx-auto">
                  <SkillIcon skill={s.key} size={22}/>
                </div>
                <div className="font-bold text-sm mb-1">{s.label}</div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {s.key === 'nghe' && 'Luyện nghe hội thoại, thông báo'}
                  {s.key === 'noi'  && 'Mẫu câu giao tiếp, phát âm'}
                  {s.key === 'doc'  && 'Từ vựng, ngữ pháp, đọc hiểu'}
                  {s.key === 'viet' && 'Hiragana, Katakana, Kanji'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
