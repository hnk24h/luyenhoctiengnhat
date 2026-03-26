export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Thi Thử JLPT',
  description: 'Làm đề thi thử JLPT N5~N1 sát format thật. Kiểm tra trình độ tiếng Nhật với các bài thi nghe, đọc và ngữ pháp.',
  alternates: { canonical: 'https://e-learn.ikagi.site/levels' },
  openGraph: {
    title: 'Thi Thử JLPT N5~N1 | IkagiLearn',
    description: 'Đề thi thử JLPT sát format thật. Nghe, đọc, ngữ pháp — đầy đủ 5 cấp độ N5 đến N1.',
    url: 'https://e-learn.ikagi.site/levels',
  },
};

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { ExamDeadlinePlanner } from '@/components/ExamDeadlinePlanner';
import {
  FaHeadphones, FaBookOpen, FaPencil, FaComments,
  FaCalendarDays, FaLightbulb, FaBullseye, FaRepeat,
  FaChartBar, FaStopwatch, FaFont, FaFileLines,
} from 'react-icons/fa6';

const LEVEL_META: Record<string, {
  desc: string; color: string; light: string;
  vocab: string; kanji: string; tip: string;
}> = {
  N5: { desc: 'Sơ cấp',        color: '#16A34A', light: '#F0FDF4', vocab: '~800 từ',   kanji: '100 Kanji',  tip: 'Phù hợp người mới bắt đầu' },
  N4: { desc: 'Sơ trung cấp',  color: '#2563EB', light: '#EFF6FF', vocab: '~1500 từ',  kanji: '300 Kanji',  tip: 'Giao tiếp cơ bản hàng ngày' },
  N3: { desc: 'Trung cấp',     color: '#D97706', light: '#FFFBEB', vocab: '~3750 từ',  kanji: '650 Kanji',  tip: 'Đọc báo, xem phim đơn giản' },
  N2: { desc: 'Trung cao cấp', color: '#EA580C', light: '#FFF7ED', vocab: '~6000 từ',  kanji: '1000 Kanji', tip: 'Yêu cầu nhiều doanh nghiệp Nhật' },
  N1: { desc: 'Cao cấp',       color: '#DC2626', light: '#FFF1F2', vocab: '~10000 từ', kanji: '2000 Kanji', tip: 'Trình độ gần như người bản xứ' },
};

const SKILL_META: Record<string, { label: string; icon: ReactNode; color: string }> = {
  nghe: { label: 'Nghe',    icon: <FaHeadphones size={10}/>, color: '#2563EB' },
  doc:  { label: 'Đọc',     icon: <FaBookOpen   size={10}/>, color: '#D97706' },
  viet: { label: 'Ngữ pháp', icon: <FaPencil    size={10}/>, color: '#7C3AED' },
  noi:  { label: 'Từ vựng', icon: <FaComments   size={10}/>, color: '#059669' },
};

export default async function LevelsPage({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const userId  = (session?.user as { id?: string } | undefined)?.id;
  const lang = params.lang ?? 'ja';

  // Phân loại cấp độ theo lang
  const subject = lang === 'zh' ? 'HSK' : 'JLPT';
  const levels = await prisma.level.findMany({
    where: { subject },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { examSets: true } },
      examSets: { select: { skill: true } },
    },
  });

  // User progress: count of completed exam sets per level
  const progressByLevel: Record<string, { done: number; total: number; bestAvg: number | null }> = {};
  if (userId && levels.length) {
    const progressRows = await prisma.userProgress.findMany({
      where: {
        userId,
        examSet: { levelId: { in: levels.map(l => l.id) } },
      },
      select: { attempts: true, bestScore: true, examSet: { select: { levelId: true } } },
    });
    for (const l of levels) {
      const rows = progressRows.filter(r => r.examSet.levelId === l.id);
      const done = rows.filter(r => r.attempts > 0).length;
      const scored = rows.filter(r => r.bestScore != null);
      progressByLevel[l.id] = {
        done,
        total: l._count.examSets,
        bestAvg: scored.length ? scored.reduce((s, r) => s + r.bestScore!, 0) / scored.length : null,
      };
    }
  }

  const savedPlan = session?.user?.email
    ? await prisma.userExamPlan.findFirst({
        where: { user: { email: session.user.email } },
        select: {
          targetLevelCode: true,
          examDate: true,
          daysLeftAtSave: true,
          weeksLeftAtSave: true,
          examsPerWeek: true,
          studySessionsPerWeek: true,
          reviewDays: true,
          updatedAt: true,
        },
      })
    : null;


  // Dummy reviews & top rank (có thể fetch từ DB thực tế)
  const reviews = [
    { name: 'Nguyễn Văn A', avatar: '/avatars/ava1.png', text: 'Trang luyện thi rất trực quan, giúp mình ôn tập hiệu quả và tiết kiệm thời gian.' },
    { name: 'Trần Thị B', avatar: '/avatars/ava2.png', text: 'Đề thi sát thực tế, giao diện dễ dùng, rất phù hợp cho người tự học.' },
    { name: 'Lê C', avatar: '/avatars/ava3.png', text: 'Mình thích phần thống kê tiến trình và bảng xếp hạng, tạo động lực học tập.' },
  ];
  const topRank = [
    { name: 'Nguyễn Văn A', score: 990, level: 'N1', avatar: '/avatars/ava1.png' },
    { name: 'Trần Thị B', score: 950, level: 'N2', avatar: '/avatars/ava2.png' },
    { name: 'Lê C', score: 900, level: 'N3', avatar: '/avatars/ava3.png' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section tối giản */}
      <section
        className={`w-full py-14 md:py-24 flex flex-col items-center justify-center text-center border-b border-gray-200 relative overflow-hidden
          ${lang === 'zh' ? 'bg-gradient-to-br from-[#fbeee6] via-[#f7f7f7] to-[#e6e6fa]' : 'bg-gradient-to-br from-[#f1f5f9] via-[#fdf6f0] to-[#f3f3f3]'}`}
      >
        {/* Decorative SVG pattern background */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          {lang === 'zh' ? (
            // Mây cuộn Trung Quốc
            <svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M0 180 Q100 120 200 180 T400 180 T600 180" stroke="#eab308" strokeWidth="8" fill="none" opacity="0.12" />
              <circle cx="520" cy="60" r="32" fill="#d7262b" opacity="0.08" />
              <circle cx="80" cy="40" r="24" fill="#b85c00" opacity="0.10" />
            </svg>
          ) : (
            // Sóng Seigaiha Nhật Bản
            <svg width="100%" height="100%" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M0 180 Q60 120 120 180 T240 180 T360 180 T480 180 T600 180" stroke="#2563eb" strokeWidth="8" fill="none" opacity="0.10" />
              <circle cx="500" cy="60" r="28" fill="#e6002d" opacity="0.08" />
              <circle cx="120" cy="40" r="20" fill="#2563eb" opacity="0.10" />
            </svg>
          )}
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            {lang === 'zh' ? (
              <span className="text-4xl md:text-5xl">🏮</span>
            ) : (
              <span className="text-4xl md:text-5xl">🌸</span>
            )}
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-0 font-serif
              ${lang === 'zh' ? 'text-[#d7262b]' : 'text-[#e6002d] font-["Sawarabi Mincho","serif"]'}`}
            >
              {lang === 'zh' ? 'Luyện thi HSK' : 'Luyện thi JLPT'}
            </h1>
          </div>
          <div className={`text-lg md:text-xl font-medium mb-2
            ${lang === 'zh' ? 'text-[#b85c00] font-serif' : 'text-[#2563eb] font-["Sawarabi Mincho","serif"]'}`}
          >
            {lang === 'zh'
              ? 'HSK1 → HSK6 · Đề thi thử tiếng Trung'
              : 'JLPT N5 → N1 · Đề thi thử tiếng Nhật'}
          </div>
          <div className="text-base md:text-lg text-gray-600 mb-2 max-w-xl mx-auto">
            {lang === 'zh'
              ? 'Chinh phục tiếng Trung hiện đại với đề thi thử HSK chuẩn quốc tế.'
              : 'Chinh phục tiếng Nhật cùng đề thi thử JLPT sát thực tế, giao diện tối giản.'}
          </div>
          <div className="text-sm md:text-base text-gray-400 mb-6 max-w-xl mx-auto">
            {lang === 'zh'
              ? 'Mây cuộn, sắc đỏ vàng truyền thống, giao diện lấy cảm hứng từ văn hoá Trung Hoa.'
              : 'Sóng Seigaiha, hoa anh đào, sắc đỏ xanh đặc trưng Nhật Bản.'}
          </div>
          <a href="#levels" className={`inline-block px-8 py-3 rounded-full font-bold text-lg shadow hover:scale-105 transition
            ${lang === 'zh' ? 'bg-[#d7262b] text-white hover:bg-[#b85c00]' : 'bg-[#e6002d] text-white hover:bg-[#2563eb]'}`}
          >Bắt đầu luyện thi</a>
        </div>
      </section>

      {/* Level cards section */}
      <section id="levels" className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {levels.length === 0 ? (
            <div className="rounded-2xl border p-16 text-center text-sm col-span-full bg-white" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Chưa có cấp độ nào.
            </div>
          ) : (
            levels.map(l => {
              const meta = LEVEL_META[l.code] ?? { desc: '', color: '#6B7280', light: '#F9FAFB', vocab: '', kanji: '', tip: '' };
              const prog = progressByLevel[l.id];
              const pct  = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
              // Skill chips: unique skills with counts
              const skillCounts: Record<string, number> = {};
              for (const es of l.examSets) {
                skillCounts[es.skill] = (skillCounts[es.skill] ?? 0) + 1;
              }
              return (
                <Link key={l.id} href={`/${lang}/levels/${l.code}`}
                  className="group flex flex-col items-start gap-3 rounded-2xl border p-5 bg-white hover:shadow-lg transition-all duration-150"
                  style={{ borderColor: '#E5E7EB' }}>
                  {/* Level badge */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl font-extrabold text-white text-xl mb-1"
                    style={{ background: meta.color }}>
                    {l.code}
                  </div>
                  {/* Info */}
                  <div className="flex-1 w-full flex flex-col items-start">
                    <span className="text-base font-bold mb-0.5 text-gray-900">{l.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold mb-2 bg-gray-100 text-gray-600">{meta.desc}</span>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs flex items-center gap-1 text-gray-500">
                        <FaBookOpen size={10}/> {meta.vocab}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-gray-500">
                        <FaFont size={10}/> {meta.kanji}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-gray-500">
                        <FaFileLines size={10}/> {l._count.examSets} đề
                      </span>
                    </div>
                    {/* Skill chips */}
                    <div className="flex gap-1 flex-wrap mb-2">
                      {Object.entries(skillCounts).map(([skill, count]) => {
                        const sm = SKILL_META[skill];
                        if (!sm) return null;
                        return (
                          <span key={skill} className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium inline-flex items-center gap-1">
                            {sm.icon} {count}
                          </span>
                        );
                      })}
                    </div>
                    {/* Progress bar (logged in) */}
                    {prog && prog.total > 0 && (
                      <div className="w-full mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                          <div className="h-1.5 rounded-full transition-all duration-300 bg-blue-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold shrink-0 text-blue-600">
                          {prog.done}/{prog.total}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* CTA arrow */}
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                    <span className="hidden sm:inline">Vào luyện thi</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>


      {/* Top học viên xuất sắc - UI đẹp hơn */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center tracking-tight">Top học viên xuất sắc</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {topRank.map((u, idx) => (
            <div key={u.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center hover:shadow-md transition">
              <div className="relative mb-3">
                <img src={u.avatar} alt={u.name} className="w-16 h-16 rounded-full border-2 border-blue-200 shadow" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">#{idx+1}</span>
              </div>
              <div className="font-semibold text-gray-900 text-lg mb-1">{u.name}</div>
              <div className="text-xs text-gray-500 mb-2">Level: <span className="font-bold text-blue-600">{u.level}</span></div>
              <div className="flex items-center gap-1 mt-auto">
                <span className="text-xs text-gray-400">Điểm</span>
                <span className="font-bold text-2xl text-blue-600 drop-shadow">{u.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Đánh giá học viên - UI đẹp hơn */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center tracking-tight">Cảm nhận học viên</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center hover:shadow-md transition">
              <img src={r.avatar} alt={r.name} className="w-14 h-14 rounded-full border-2 border-gray-200 mb-3" />
              <div className="font-semibold text-gray-900 mb-1 text-center">{r.name}</div>
              <div className="text-sm text-gray-600 italic text-center">“{r.text}”</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips section */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900"><FaLightbulb size={14}/> Mẹo luyện thi hiệu quả</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: <FaBullseye  size={18}/>, title: 'Bắt đầu từ cấp độ dễ', body: 'Dù đích là N2, hãy chạy thử N5 để quen format' },
            { icon: <FaRepeat    size={18}/>, title: 'Luyện mỗi ngày 20 phút', body: 'Đều đặn quan trọng hơn học cấp tập trước thi' },
            { icon: <FaChartBar  size={18}/>, title: 'Xem lại đáp án sai', body: 'Đọc giải thích để hiểu bản chất, không chỉ học thuộc' },
            { icon: <FaStopwatch size={18}/>, title: 'Làm đề có giới hạn thời gian', body: 'Luyện quản lý thời gian sát với điều kiện thi thật' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-3">
              <span className="shrink-0 text-gray-400">{tip.icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">{tip.title}</div>
                <div className="text-xs mt-0.5 text-gray-500">{tip.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
