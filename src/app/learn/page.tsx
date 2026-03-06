export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import Link from 'next/link';
import {
  FaArrowRight,
  FaBolt,
  FaBullseye,
  FaCalendarDay,
  FaFireFlameCurved,
  FaPencil,
  FaRoute,
} from 'react-icons/fa6';
import { authOptions } from '@/lib/auth';
import { SkillIcon } from '@/components/SkillIcon';
import { prisma } from '@/lib/db';
import { SKILLS, getSkillLabel, type SkillKey } from '@/lib/utils';

const LEVEL_META: Record<string, { bg: string; color: string; bar: string; desc: string; jp: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D', bar: '#4ADE80', desc: 'Sơ cấp', jp: 'にほんごはじめの一歩' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8', bar: '#60A5FA', desc: 'Sơ trung cấp', jp: 'よみかき・かいわの基礎' },
  N3: { bg: '#FEF9C3', color: '#92400E', bar: '#FCD34D', desc: 'Trung cấp', jp: 'ふつうレベル' },
  N2: { bg: '#FFEDD5', color: '#C2410C', bar: '#FB923C', desc: 'Trung cao cấp', jp: 'ビジネスに向けて' },
  N1: { bg: '#FFE4E6', color: '#BE123C', bar: '#FB7185', desc: 'Cao cấp', jp: '最高難易度' },
};

type LevelWithContent = {
  id: string;
  code: string;
  name: string;
  order: number;
  learningCategories: Array<{
    id: string;
    skill: string;
    name: string;
    order: number;
    lessons: Array<{ id: string }>;
  }>;
};

type LessonWithProgress = {
  id: string;
  title: string;
  order: number;
  categoryId: string;
  progress: Array<{
    completed: boolean;
    completedAt: Date | null;
  }>;
  category: {
    id: string;
    skill: string;
    name: string;
    order: number;
    level: {
      code: string;
      order: number;
    };
  };
};

type ExamProgressItem = {
  examSet: { skill: string };
  bestScore: number | null;
};

type StudyProfile = {
  weeklyGoal: number;
  currentStreak: number;
};

type SavedExamPlan = {
  targetLevelCode: string;
  examDate: Date;
};

type WeakSkillSummary = {
  key: string;
  label: string;
  avg: number | null;
  attempts: number;
};

type LearnLane = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type LevelSummary = {
  levelCode: string;
  done: number;
  total: number;
  pct: number;
};

async function getLevelsWithContent() {
  return prisma.level.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      order: true,
      learningCategories: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          skill: true,
          name: true,
          order: true,
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });
}

function getLessonHref(lesson: LessonWithProgress) {
  return `/learn/${lesson.category.level.code}/${lesson.category.skill}/${lesson.categoryId}/${lesson.id}`;
}

function formatDateVi(date: Date) {
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function getEstimatedHours(lessonCount: number) {
  return Math.max(1, Math.round((lessonCount * 12) / 60));
}

function getWeakSkill(progress: ExamProgressItem[]): WeakSkillSummary | null {
  const stats = SKILLS.map((skill) => {
    const items = progress.filter((item) => item.examSet.skill === skill.key && item.bestScore !== null);
    const avg = items.length > 0
      ? Math.round(items.reduce((sum, item) => sum + (item.bestScore ?? 0), 0) / items.length)
      : null;

    return {
      key: skill.key,
      label: skill.label,
      avg,
      attempts: items.length,
    };
  }).filter((item) => item.attempts > 0);

  return stats.sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999))[0] ?? null;
}

function getLevelSummary(lessons: LessonWithProgress[]): LevelSummary[] {
  return Array.from(new Set(lessons.map((lesson) => lesson.category.level.code))).map((levelCode) => {
    const levelLessons = lessons.filter((lesson) => lesson.category.level.code === levelCode);
    const done = levelLessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;
    const total = levelLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return { levelCode, done, total, pct };
  });
}

function getStatusMeta(done: number, total: number) {
  if (total === 0) {
    return {
      label: 'Đang cập nhật',
      text: 'var(--text-muted)',
      bg: 'rgba(148, 163, 184, 0.16)',
    };
  }

  if (done === 0) {
    return {
      label: 'Chưa bắt đầu',
      text: '#9A3412',
      bg: 'rgba(251, 146, 60, 0.18)',
    };
  }

  if (done >= total) {
    return {
      label: 'Hoàn thành',
      text: '#166534',
      bg: 'rgba(74, 222, 128, 0.18)',
    };
  }

  return {
    label: 'Đang học',
    text: '#1D4ED8',
    bg: 'rgba(96, 165, 250, 0.18)',
  };
}

function getPrimarySkills(level: LevelWithContent) {
  const skillCounts = level.learningCategories.reduce<Record<string, number>>((acc, category) => {
    acc[category.skill] = (acc[category.skill] ?? 0) + category.lessons.length;
    return acc;
  }, {});

  return Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([skill]) => getSkillLabel(skill));
}

function getSkillHref(
  skill: SkillKey,
  levels: LevelWithContent[],
  preferredLevelCode?: string | null,
) {
  if (skill === 'nghe') {
    return preferredLevelCode ? `/listening?level=${preferredLevelCode}` : '/listening';
  }

  if (skill === 'doc') {
    return preferredLevelCode ? `/reading?level=${preferredLevelCode}` : '/reading';
  }

  const preferredLevel = preferredLevelCode
    ? levels.find((level) => level.code === preferredLevelCode)
    : null;
  const preferredCategory = preferredLevel?.learningCategories.find((category) => category.skill === skill);

  if (preferredCategory) {
    return `/learn/${preferredLevelCode}/${skill}/${preferredCategory.id}`;
  }

  for (const level of levels) {
    const firstCategory = level.learningCategories.find((category) => category.skill === skill);
    if (firstCategory) {
      return `/learn/${level.code}/${skill}/${firstCategory.id}`;
    }
  }

  return '/learn';
}

function getMotivationLine(options: {
  firstName?: string | null;
  streak: number;
  continueLessonTitle?: string | null;
  weakSkill?: string | null;
  examPlan?: SavedExamPlan | null;
}) {
  if (!options.firstName) {
    return 'Đi theo cấp độ nếu bạn muốn học tuần tự. Chỉ chuyển sang ôn theo kỹ năng khi đã biết rõ điểm yếu của mình.';
  }

  if (options.streak >= 5) {
    return `${options.firstName}, bạn đang giữ nhịp rất tốt. Hôm nay chỉ cần tiếp tục đúng một bước để không đứt mạch học.`;
  }

  if (options.continueLessonTitle) {
    return `${options.firstName}, quay lại đúng bài đang dang dở sẽ hiệu quả hơn nhiều so với bắt đầu lại từ đầu.`;
  }

  if (options.weakSkill) {
    return `${options.firstName}, ưu tiên gia cố ${options.weakSkill.toLowerCase()} trước sẽ kéo toàn bộ năng lực làm bài lên nhanh hơn.`;
  }

  if (options.examPlan) {
    return `${options.firstName}, bạn đã có mục tiêu ${options.examPlan.targetLevelCode}. Giữ lộ trình đều quan trọng hơn học quá nhiều trong một ngày.`;
  }

  return `${options.firstName}, hãy chọn một đường học rõ ràng cho hôm nay: tiếp tục bài cũ, gia cố kỹ năng yếu hoặc ôn thi theo mục tiêu.`;
}

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const [levels, lessons, examProgress, studyProfile, savedExamPlan] = await Promise.all([
    getLevelsWithContent(),
    userId
      ? prisma.learningLesson.findMany({
          include: {
            progress: {
              where: { userId },
              select: {
                completed: true,
                completedAt: true,
              },
            },
            category: {
              include: {
                level: {
                  select: {
                    code: true,
                    order: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { category: { level: { order: 'asc' } } },
            { category: { order: 'asc' } },
            { order: 'asc' },
          ],
        })
      : Promise.resolve([]),
    userId
      ? prisma.userProgress.findMany({
          where: { userId },
          select: {
            bestScore: true,
            examSet: {
              select: {
                skill: true,
              },
            },
          },
        })
      : Promise.resolve([]),
    userId
      ? prisma.userStudyProfile.findUnique({
          where: { userId },
          select: {
            weeklyGoal: true,
            currentStreak: true,
          },
        })
      : Promise.resolve(null),
    userId
      ? prisma.userExamPlan.findUnique({
          where: { userId },
          select: {
            targetLevelCode: true,
            examDate: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const typedLevels = levels as LevelWithContent[];
  const typedLessons = lessons as LessonWithProgress[];
  const typedExamProgress = examProgress as ExamProgressItem[];
  const typedStudyProfile = studyProfile as StudyProfile | null;
  const activeExamPlan = savedExamPlan as SavedExamPlan | null;

  const levelSummary = getLevelSummary(typedLessons);
  const currentLevel = levelSummary.find((level) => level.total > 0 && level.done < level.total) ?? levelSummary[0] ?? null;
  const weakSkill = getWeakSkill(typedExamProgress);
  const preferredLevelCode = activeExamPlan?.targetLevelCode ?? currentLevel?.levelCode ?? typedLevels[0]?.code ?? null;
  const mostRecentCompletedLesson = typedLessons
    .filter((lesson) => lesson.progress.some((item) => item.completedAt))
    .sort((a, b) => {
      const aDate = a.progress[0]?.completedAt?.getTime() ?? 0;
      const bDate = b.progress[0]?.completedAt?.getTime() ?? 0;
      return bDate - aDate;
    })[0] ?? null;
  const nextLesson = typedLessons.find((lesson) => !lesson.progress.some((item) => item.completed)) ?? null;
  const continueLesson = mostRecentCompletedLesson
    ? typedLessons.find((lesson) => (
      lesson.categoryId === mostRecentCompletedLesson.categoryId && lesson.order === mostRecentCompletedLesson.order + 1
    )) ?? nextLesson
    : nextLesson;

  const completedLessonCount = typedLessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;
  const totalLessonCount = typedLevels.reduce((sum, level) => (
    sum + level.learningCategories.reduce((levelSum, category) => levelSum + category.lessons.length, 0)
  ), 0);
  const streak = typedStudyProfile?.currentStreak ?? 0;
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] ?? null;

  const learnLanes: LearnLane[] = session
    ? [
        continueLesson
          ? {
              eyebrow: 'Tiếp tục học',
              title: continueLesson.title,
              description: `Quay lại ${continueLesson.category.name} (${continueLesson.category.level.code}) để giữ mạch học thay vì chọn lại từ đầu.`,
              href: getLessonHref(continueLesson),
              cta: 'Tiếp tục đúng bài',
            }
          : {
              eyebrow: 'Khởi động lại lộ trình',
              title: 'Chọn level đang phù hợp nhất',
              description: 'Nếu bạn chưa có bài dang dở, bắt đầu từ level dễ nhất bạn có thể học đều mỗi ngày.',
              href: preferredLevelCode ? `/learn/${preferredLevelCode}` : '/learn/N5',
              cta: 'Vào lộ trình hiện tại',
            },
        weakSkill
          ? {
              eyebrow: 'Gia cố kỹ năng yếu',
              title: `Ưu tiên ${weakSkill.label}`,
              description: weakSkill.avg !== null
                ? `Điểm trung bình gần đây khoảng ${weakSkill.avg}%. Ôn tập trung vào kỹ năng này sẽ tạo khác biệt rõ nhất.`
                : 'Học theo kỹ năng sẽ hiệu quả hơn khi bạn đã biết rõ phần mình yếu nhất.',
              href: getSkillHref(weakSkill.key as SkillKey, typedLevels, preferredLevelCode),
              cta: `Luyện ${weakSkill.label.toLowerCase()}`,
            }
          : {
              eyebrow: 'Chọn kỹ năng trọng tâm',
              title: 'Ôn theo kỹ năng khi cần sửa điểm yếu',
              description: 'Nếu bạn đã biết rõ phần mình hay sai, đi thẳng vào từng kỹ năng sẽ nhanh hơn học dàn trải.',
              href: getSkillHref('doc', typedLevels, preferredLevelCode),
              cta: 'Mở lối tắt kỹ năng',
            },
        activeExamPlan
          ? {
              eyebrow: 'Ôn thi theo deadline',
              title: `Giữ mục tiêu ${activeExamPlan.targetLevelCode}`,
              description: `Mốc thi hiện tại là ${formatDateVi(activeExamPlan.examDate)}. Hãy dùng thi thử để kiểm tra tiến độ mỗi tuần.`,
              href: '/levels',
              cta: 'Vào khu luyện thi',
            }
          : {
              eyebrow: 'Chuẩn bị kỳ thi',
              title: 'Đưa việc học về đúng format JLPT',
              description: 'Khi đã có nền tảng, thi thử đều đặn giúp bạn nhìn rõ tốc độ, điểm yếu và áp lực thời gian.',
              href: '/levels',
              cta: 'Bắt đầu ôn thi',
            },
      ]
    : [
        {
          eyebrow: 'Mới bắt đầu',
          title: 'Đi từ N5 để xây nền',
          description: 'Nếu chưa chắc level hiện tại, đi từ N5 giúp bạn giữ lộ trình rõ ràng và ít bỏ sót nền tảng hơn.',
          href: '/learn/N5',
          cta: 'Bắt đầu từ N5',
        },
        {
          eyebrow: 'Ôn theo kỹ năng',
          title: 'Chọn đúng phần cần cải thiện',
          description: 'Nghe và đọc phù hợp khi bạn đã biết kỹ năng nào đang kéo điểm xuống.',
          href: '/reading',
          cta: 'Vào lối tắt kỹ năng',
        },
        {
          eyebrow: 'Chuẩn bị thi JLPT',
          title: 'Luyện đề theo áp lực thật',
          description: 'Khi cần chuyển từ học kiến thức sang làm bài, thi thử là cách nhanh nhất để thấy khoảng cách hiện tại.',
          href: '/levels',
          cta: 'Vào khu luyện thi',
        },
      ];

  return (
    <div>
      <section className="py-12 px-4" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            NỘI DUNG HỌC
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {session ? 'Hôm nay bạn nên học gì?' : 'Học Tiếng Nhật theo một lộ trình rõ ràng'}
          </h1>
          <p className="max-w-3xl" style={{ color: 'var(--text-muted)' }}>
            {getMotivationLine({
              firstName,
              streak,
              continueLessonTitle: continueLesson?.title ?? null,
              weakSkill: weakSkill?.label ?? null,
              examPlan: activeExamPlan,
            })}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            <div className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#1D4ED8' }}>
              {session ? `${completedLessonCount}/${totalLessonCount} bài đã hoàn thành` : `${totalLessonCount} bài học đang sẵn sàng`}
            </div>
            {session && currentLevel && (
              <div className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(16, 185, 129, 0.10)', color: '#047857' }}>
                Đang đi level {currentLevel.levelCode}
              </div>
            )}
            {session && streak > 0 && (
              <div className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#C2410C' }}>
                Streak {streak} ngày
              </div>
            )}
            {session && weakSkill && (
              <div className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#7E22CE' }}>
                Ưu tiên: {weakSkill.label}
              </div>
            )}
            {session && activeExamPlan && (
              <div className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#B91C1C' }}>
                Mục tiêu thi {activeExamPlan.targetLevelCode}
              </div>
            )}
          </div>

          {!session && (
            <div className="mt-5 rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(15, 23, 42, 0.04)', border: '1px solid var(--border)' }}>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Đăng nhập để biến trang này thành bảng điều hướng cá nhân</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Khi có tài khoản, bạn sẽ thấy level đang học, streak, bài cần học tiếp và kỹ năng yếu cần ưu tiên ngay trên đầu trang.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            {learnLanes.map((lane, index) => (
              <Link
                key={`${lane.title}-${index}`}
                href={lane.href}
                className="group rounded-3xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: index === 0 ? 'var(--primary)' : 'var(--bg-base)',
                  color: index === 0 ? '#fff' : 'var(--text-primary)',
                  border: index === 0 ? 'none' : '1px solid var(--border)',
                }}
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: index === 0 ? 'rgba(255,255,255,0.72)' : 'var(--primary)' }}>
                  {lane.eyebrow}
                </div>
                <div className="font-bold text-xl mb-2">{lane.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: index === 0 ? 'rgba(255,255,255,0.84)' : 'var(--text-muted)' }}>
                  {lane.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                  {lane.cta}
                  <FaArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Lộ trình theo cấp độ</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Phù hợp nhất khi bạn muốn học tuần tự từ nền tảng đến nâng cao.
                </p>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Muốn ôn đúng điểm yếu? Dùng lối tắt theo kỹ năng ở cuối trang.
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {Object.entries(LEVEL_META).map(([code, meta]) => (
                <Link
                  key={code}
                  href={`/learn/${code}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                    style={{ background: meta.color }}
                  >
                    {code}
                  </span>
                  {meta.desc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto">
          {typedLevels.length === 0 ? (
            <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
              Chưa có nội dung học. <Link href="/admin/seed" style={{ color: 'var(--accent)' }} className="underline">Admin → Seed</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {typedLevels.map((level) => {
                const meta = LEVEL_META[level.code] ?? { bg: '#F3F4F6', color: '#374151', bar: '#9CA3AF', desc: '', jp: '' };
                const lessonCount = level.learningCategories.reduce((sum, category) => sum + category.lessons.length, 0);
                const categoryCount = level.learningCategories.length;
                const progress = levelSummary.find((item) => item.levelCode === level.code) ?? {
                  levelCode: level.code,
                  done: 0,
                  total: lessonCount,
                  pct: 0,
                };
                const status = getStatusMeta(progress.done, progress.total);
                const topSkills = getPrimarySkills(level);
                const isRecommendedLevel = level.code === preferredLevelCode;

                return (
                  <Link
                    key={level.id}
                    href={`/learn/${level.code}`}
                    className="group relative flex flex-col rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: meta.bg }}
                  >
                    <div
                      className="absolute right-3 top-1 text-8xl font-black leading-none opacity-[0.07] select-none"
                      style={{ color: meta.color }}
                    >
                      {level.code}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                        style={{ background: meta.color }}
                      >
                        {level.code}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: meta.color }}>{meta.desc}</div>
                        <div className="text-xs font-japanese" style={{ color: meta.color, opacity: 0.8 }}>{meta.jp}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.text }}>
                        {status.label}
                      </span>
                      {isRecommendedLevel && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#1D4ED8' }}>
                          {activeExamPlan?.targetLevelCode === level.code ? 'Level mục tiêu' : 'Nên học tiếp'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs mb-4 leading-relaxed" style={{ color: meta.color, opacity: 0.9 }}>
                      {level.name || `Cấp độ ${level.code} JLPT`} {session && progress.total > 0 ? `• ${progress.done}/${progress.total} bài đã xong` : `• ${categoryCount} chủ đề`}
                    </p>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between text-xs" style={{ color: meta.color, opacity: 0.9 }}>
                        <span>{lessonCount} bài học</span>
                        <span>{categoryCount} chủ đề</span>
                      </div>
                      <div className="flex items-center justify-between text-xs gap-3" style={{ color: meta.color, opacity: 0.9 }}>
                        <span>Ước tính {getEstimatedHours(lessonCount)} giờ học nền</span>
                        <span>{topSkills.length > 0 ? `Trọng tâm: ${topSkills.join(', ')}` : 'Nội dung đang cập nhật'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {Array.from(new Set(level.learningCategories.map((category) => category.skill))).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(0,0,0,0.08)', color: meta.color }}
                        >
                          {getSkillLabel(skill)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      {session ? (
                        <>
                          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: meta.color }}>
                            <span style={{ opacity: 0.82 }}>Tiến độ thật của bạn</span>
                            <span style={{ opacity: 0.82 }}>{progress.pct}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                            <div className="h-full rounded-full" style={{ width: `${progress.pct}%`, background: meta.bar }} />
                          </div>
                          <div className="text-xs mt-2" style={{ color: meta.color, opacity: 0.88 }}>
                            {progress.done === 0
                              ? 'Bạn chưa bắt đầu level này.'
                              : progress.done >= progress.total
                                ? 'Bạn đã hoàn thành toàn bộ level này.'
                                : `Còn ${Math.max(progress.total - progress.done, 0)} bài để hoàn tất level ${level.code}.`}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs leading-relaxed" style={{ color: meta.color, opacity: 0.88 }}>
                          Đây là lộ trình {meta.desc.toLowerCase()} với nhịp học từng bước nhỏ. Đăng nhập để theo dõi tiến độ thật và nhận gợi ý học tiếp.
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              <Link
                href="/levels"
                className="flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl gap-3"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <FaPencil size={28} className="text-white" />
                </div>
                <div className="font-bold text-lg">Luyện thi</div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,.86)' }}>Thi thử với đề sát format JLPT thật</p>
                <span
                  className="px-4 py-1.5 rounded-xl text-sm font-bold mt-1"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Vào thi thử →
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-10 px-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ôn theo kỹ năng</h2>
              <p className="text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                Dùng khu này khi bạn đã biết điểm yếu cụ thể. Nếu vẫn đang xây nền hoặc quay lại sau một thời gian nghỉ, ưu tiên học theo level ở phía trên sẽ ít bị lan man hơn.
              </p>
            </div>
            {session && typedStudyProfile && (
              <div className="rounded-2xl p-4 min-w-[240px]" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--primary)' }}>Tín hiệu cá nhân</div>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center gap-2"><FaFireFlameCurved size={14} style={{ color: '#EA580C' }} /> Streak hiện tại: <strong>{typedStudyProfile.currentStreak} ngày</strong></div>
                  <div className="flex items-center gap-2"><FaBullseye size={14} style={{ color: '#2563EB' }} /> Mục tiêu tuần: <strong>{typedStudyProfile.weeklyGoal} phiên</strong></div>
                  {weakSkill && <div className="flex items-center gap-2"><FaBolt size={14} style={{ color: '#7C3AED' }} /> Cần ưu tiên: <strong>{weakSkill.label}</strong></div>}
                  {activeExamPlan && <div className="flex items-center gap-2"><FaCalendarDay size={14} style={{ color: '#DC2626' }} /> Mục tiêu thi: <strong>{activeExamPlan.targetLevelCode}</strong></div>}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SKILLS.map((skill) => (
              <Link
                key={skill.key}
                href={getSkillHref(skill.key, typedLevels, preferredLevelCode)}
                className={`card-hover border text-center ${skill.key === 'nghe' ? 'skill-nghe' : skill.key === 'noi' ? 'skill-noi' : skill.key === 'doc' ? 'skill-doc' : 'skill-viet'}`}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-2 mx-auto">
                  <SkillIcon skill={skill.key} size={22} />
                </div>
                <div className="font-bold text-sm mb-1">{skill.label}</div>
                {weakSkill?.key === skill.key && (
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--primary)' }}>
                    Nên ưu tiên
                  </div>
                )}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {skill.key === 'nghe' && 'Luyện nghe hội thoại, thông báo và phản xạ theo level hiện tại.'}
                  {skill.key === 'noi' && 'Đi theo mẫu câu giao tiếp và phát âm của level bạn đang học.'}
                  {skill.key === 'doc' && 'Gia cố đọc hiểu, từ vựng và ngữ pháp khi phần này đang kéo điểm xuống.'}
                  {skill.key === 'viet' && 'Ôn chữ và mẫu viết để nền tảng đọc nhớ không bị hổng.'}
                </p>
                <div className="text-xs font-semibold mt-2" style={{ color: 'var(--primary)' }}>
                  {skill.key === 'nghe' ? 'Vào bài nghe' : skill.key === 'doc' ? 'Vào bài đọc' : preferredLevelCode ? `Mở skill ở ${preferredLevelCode}` : 'Vào chủ đề đầu tiên'}
                </div>
              </Link>
            ))}
          </div>

          {session && continueLesson && (
            <div className="mt-6 rounded-3xl p-5 sm:p-6" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--primary)' }}>Gợi ý tốt nhất cho hôm nay</div>
                  <div className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{continueLesson.title}</div>
                  <p className="text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                    {mostRecentCompletedLesson
                      ? `Bạn vừa học xong ${mostRecentCompletedLesson.title}. Tiếp tục ngay bài kế tiếp trong ${continueLesson.category.name} sẽ giúp giữ liền mạch nhận thức.`
                      : `Đây là bài tiếp theo phù hợp nhất trong level ${continueLesson.category.level.code} để bạn quay lại nhịp học ngay.`}
                  </p>
                </div>
                <Link href={getLessonHref(continueLesson)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
                  <FaRoute size={14} />
                  Tiếp tục bài này
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}