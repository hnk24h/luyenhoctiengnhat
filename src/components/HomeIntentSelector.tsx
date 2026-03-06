'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBolt,
  FaBookOpen,
  FaBullseye,
  FaCalendarDays,
  FaHeadphones,
  FaListCheck,
  FaMicrophone,
  FaPencil,
  FaRoute,
} from 'react-icons/fa6';

type IntentKey = 'beginner' | 'level' | 'skill' | 'deadline';
type SkillKey = 'nghe' | 'noi' | 'doc' | 'viet';
type LevelCode = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const LEVEL_OPTIONS: LevelCode[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const INTENTS: Array<{
  key: IntentKey;
  title: string;
  description: string;
  icon: typeof FaRoute;
  accent: string;
}> = [
  {
    key: 'beginner',
    title: 'Tôi mới bắt đầu',
    description: 'Muốn có lộ trình đơn giản và học từ nền tảng N5.',
    icon: FaRoute,
    accent: '#15803D',
  },
  {
    key: 'level',
    title: 'Tôi đã biết level',
    description: 'Đi thẳng vào cấp độ phù hợp thay vì bắt đầu từ đầu.',
    icon: FaBullseye,
    accent: '#2563EB',
  },
  {
    key: 'skill',
    title: 'Tôi muốn luyện kỹ năng',
    description: 'Tập trung vào nghe, nói, đọc hoặc viết theo nhu cầu hiện tại.',
    icon: FaHeadphones,
    accent: '#D97706',
  },
  {
    key: 'deadline',
    title: 'Tôi sắp thi JLPT',
    description: 'Lập kế hoạch ôn tập theo deadline và số tuần còn lại.',
    icon: FaCalendarDays,
    accent: '#BE123C',
  },
];

const SKILL_OPTIONS: Array<{
  key: SkillKey;
  label: string;
  href: string;
  icon: typeof FaHeadphones;
}> = [
  { key: 'nghe', label: 'Nghe', href: '/listening', icon: FaHeadphones },
  { key: 'noi', label: 'Nói', href: '/learn', icon: FaMicrophone },
  { key: 'doc', label: 'Đọc', href: '/reading', icon: FaBookOpen },
  { key: 'viet', label: 'Viết', href: '/learn', icon: FaPencil },
];

function addWeeks(base: Date, weeks: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function HomeIntentSelector() {
  const [intent, setIntent] = useState<IntentKey>('beginner');
  const [selectedLevel, setSelectedLevel] = useState<LevelCode>('N5');
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>('nghe');
  const [deadlineLevel, setDeadlineLevel] = useState<LevelCode>('N3');
  const [deadlineDate, setDeadlineDate] = useState(formatDateInput(addWeeks(new Date(), 8)));

  const recommendation = useMemo(() => {
    if (intent === 'beginner') {
      return {
        href: '/learn/N5',
        title: 'Bắt đầu từ lộ trình N5',
        description: 'Đi từ các bài nền tảng, sau đó nối sang nghe, đọc và thi thử.',
        bullets: ['Học theo từng chủ đề nhỏ', 'Giảm cảm giác quá tải lúc mới bắt đầu', 'Dễ hình thành thói quen học hàng ngày'],
      };
    }

    if (intent === 'level') {
      return {
        href: `/learn/${selectedLevel}`,
        title: `Đi thẳng vào level ${selectedLevel}`,
        description: 'Phù hợp khi bạn đã biết trình độ hiện tại hoặc đang học theo giáo trình tương ứng.',
        bullets: ['Bỏ qua bước dò đường', 'Xem ngay chủ đề theo level', 'Kết hợp học bài và luyện đề cùng cấp độ'],
      };
    }

    if (intent === 'skill') {
      const skill = SKILL_OPTIONS.find((item) => item.key === selectedSkill) ?? SKILL_OPTIONS[0];
      return {
        href: skill.href,
        title: `Tập trung luyện ${skill.label}`,
        description: 'Phù hợp khi bạn muốn cải thiện nhanh một kỹ năng cụ thể thay vì học toàn lộ trình.',
        bullets: ['Học theo đúng điểm yếu hiện tại', 'Giảm phân tán khi thời gian ít', 'Dễ quay lại học mỗi ngày'],
      };
    }

    return {
      href: `/levels?planLevel=${deadlineLevel}&examDate=${deadlineDate}#deadline-planner`,
      title: 'Lập kế hoạch ôn thi theo deadline',
      description: 'Chọn ngày thi dự kiến, level mục tiêu và nhận nhịp luyện đề theo tuần.',
      bullets: ['Biết mình còn bao nhiêu tuần', 'Ước lượng số đề nên làm mỗi tuần', 'Có đường đi rõ hơn trước kỳ thi'],
    };
  }, [deadlineDate, deadlineLevel, intent, selectedLevel, selectedSkill]);

  return (
    <section className="py-14 px-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr,0.95fr] gap-6 items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            BẮT ĐẦU NHANH
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bạn đang ở trạng thái nào?</h2>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Chọn mục tiêu hiện tại để hệ thống đưa bạn vào đúng điểm bắt đầu thay vì phải tự đoán nên đi đâu trước.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {INTENTS.map((item) => {
              const active = intent === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIntent(item.key)}
                  className="text-left rounded-[24px] border p-4 transition-all"
                  style={active
                    ? { borderColor: item.accent, background: 'color-mix(in srgb, var(--bg-base) 82%, transparent)', boxShadow: `0 10px 30px color-mix(in srgb, ${item.accent} 18%, transparent)` }
                    : { borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${item.accent} 12%, white)`, color: item.accent }}>
                      <item.icon size={18} />
                    </div>
                    {active && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: item.accent }}>
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>
            <FaBolt size={14} /> Gợi ý bắt đầu
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{recommendation.title}</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{recommendation.description}</p>

          {intent === 'level' && (
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>Chọn level</div>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className="px-3 py-2 rounded-2xl text-sm font-semibold transition-all"
                    style={selectedLevel === level
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {intent === 'skill' && (
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>Chọn kỹ năng</div>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_OPTIONS.map((skill) => {
                  const active = selectedSkill === skill.key;
                  return (
                    <button
                      key={skill.key}
                      type="button"
                      onClick={() => setSelectedSkill(skill.key)}
                      className="flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-semibold transition-all"
                      style={active
                        ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                      <skill.icon size={14} /> {skill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {intent === 'deadline' && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>Level mục tiêu</div>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDeadlineLevel(level)}
                      className="px-3 py-2 rounded-2xl text-sm font-semibold transition-all"
                      style={deadlineLevel === level
                        ? { background: '#BE123C', color: '#fff' }
                        : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Ngày thi dự kiến
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  min={formatDateInput(new Date())}
                  onChange={(event) => setDeadlineDate(event.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[22px] p-4" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              <FaListCheck size={14} style={{ color: 'var(--primary)' }} /> Vì sao nên bắt đầu ở đây
            </div>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {recommendation.bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-2">
                  <span style={{ color: 'var(--primary)' }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link href={recommendation.href} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
              Đi theo gợi ý <FaArrowRight size={12} />
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm">
              Xem dashboard học tập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}