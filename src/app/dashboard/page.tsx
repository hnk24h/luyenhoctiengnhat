import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowTrendUp,
  FaBolt,
  FaBookOpen,
  FaBullseye,
  FaChartLine,
  FaFireFlameCurved,
  FaLayerGroup,
  FaPlay,
  FaRegCirclePlay,
  FaRotateRight,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SKILLS, getSkillLabel } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import { mapLessonToListeningPractice } from '@/modules/listeningUtils';
import { DashboardWeeklyGoalEditor } from '@/components/DashboardWeeklyGoalEditor';

export const dynamic = 'force-dynamic';

type LessonWithProgress = {
  id: string;
  title: string;
  type: string;
  order: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    skill: string;
    order: number;
    level: {
      code: string;
      order: number;
      name: string;
    };
  };
  progress: Array<{
    completed: boolean;
    completedAt: Date | null;
  }>;
};

type ExamProgressItem = {
  examSet: { skill: string };
  bestScore: number | null;
  attempts: number;
};

type WeakSkillSummary = {
  key: string;
  label: string;
  avg: number | null;
  attempts: number;
};

type FlashcardForDashboard = {
  deckId: string;
  deck: {
    title: string;
    color: string;
  };
  progress: {
    dueAt: Date;
  } | null;
};

type DueDeckSummary = {
  deckId: string;
  title: string;
  color: string;
  dueCount: number;
};

type StatsCard = {
  label: string;
  value: number;
  detail: string;
  icon: IconType;
  color: string;
};

type SavedExamPlan = {
  targetLevelCode: string;
  examDate: Date;
  daysLeftAtSave: number;
  weeksLeftAtSave: number;
  examsPerWeek: number;
  studySessionsPerWeek: number;
  reviewDays: number;
  updatedAt: Date;
};

type StudyProfile = {
  weeklyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
};

type ListeningRecommendation = {
  id: string;
  title: string;
  level: string;
  mondai: string;
  focus: string;
  summary: string;
};

type ReadingRecommendation = {
  id: string;
  title: string;
  titleVi: string | null;
  level: string;
  type: string;
  summary: string | null;
};

function getLessonHref(lesson: LessonWithProgress) {
  return `/learn/${lesson.category.level.code}/${lesson.category.skill}/${lesson.categoryId}/${lesson.id}`;
}

function getSkillHref(skill: string) {
  if (skill === 'nghe') return '/listening';
  if (skill === 'doc') return '/reading';
  return '/learn';
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDateVi(date: Date) {
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

function buildStreakMetrics(activityDates: Date[], now: Date) {
  const uniqueDays = Array.from(new Set(
    activityDates.map((date) => startOfDay(date).getTime()),
  )).sort((a, b) => a - b);

  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
    };
  }

  let longestStreak = 1;
  let runningLongest = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    if ((uniqueDays[index] - uniqueDays[index - 1]) === 86400000) {
      runningLongest += 1;
      longestStreak = Math.max(longestStreak, runningLongest);
    } else {
      runningLongest = 1;
    }
  }

  const lastActivityDate = new Date(uniqueDays[uniqueDays.length - 1]);
  const diffFromToday = dayDiff(now, lastActivityDate);
  let currentStreak = 0;

  if (diffFromToday <= 1) {
    currentStreak = 1;
    for (let index = uniqueDays.length - 1; index > 0; index -= 1) {
      if ((uniqueDays[index] - uniqueDays[index - 1]) === 86400000) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
  };
}

function getWeakSkill(progress: ExamProgressItem[]): WeakSkillSummary | null {
  const stats = SKILLS.map((skill: (typeof SKILLS)[number]) => {
    const items = progress.filter((item: ExamProgressItem) => item.examSet.skill === skill.key && item.bestScore !== null);
    const avg = items.length > 0
      ? Math.round(items.reduce((sum: number, item: ExamProgressItem) => sum + (item.bestScore ?? 0), 0) / items.length)
      : null;

    return {
      key: skill.key,
      label: skill.label,
      avg,
      attempts: items.length,
    };
  }).filter((item: WeakSkillSummary) => item.attempts > 0);

  return stats.sort((a: WeakSkillSummary, b: WeakSkillSummary) => (a.avg ?? 999) - (b.avg ?? 999))[0] ?? null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;
  const now = new Date();
  const weekStart = startOfWeek(now);

  const [
    recentSessions,
    examProgress,
    lessons,
    flashcards,
    flashcardReviewsThisWeek,
    lessonReviewsThisWeek,
    savedExamPlan,
    studyProfile,
    examActivityDates,
    flashcardActivityDates,
    lessonActivityDates,
  ] = await Promise.all([
    prisma.examSession.findMany({
      where: { userId },
      include: { examSet: { include: { level: true } } },
      orderBy: { startedAt: 'desc' },
      take: 8,
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: { examSet: { include: { level: true } } },
      orderBy: { lastAttempt: 'desc' },
    }),
    prisma.learningLesson.findMany({
      include: {
        progress: { where: { userId } },
        category: {
          include: {
            level: true,
          },
        },
      },
      orderBy: [
        { category: { level: { order: 'asc' } } },
        { category: { order: 'asc' } },
        { order: 'asc' },
      ],
    }),
    prisma.flashcard.findMany({
      where: { deck: { userId } },
      include: {
        deck: true,
        progress: true,
      },
      orderBy: [
        { deck: { updatedAt: 'desc' } },
        { order: 'asc' },
      ],
    }),
    prisma.flashcardProgress.findMany({
      where: {
        userId,
        lastReview: { gte: weekStart },
      },
      select: { id: true },
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: weekStart },
      },
      select: { id: true },
    }),
    prisma.userExamPlan.findUnique({
      where: { userId },
    }),
    prisma.userStudyProfile.findUnique({
      where: { userId },
    }),
    prisma.examSession.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: 'asc' },
    }),
    prisma.flashcardProgress.findMany({
      where: {
        userId,
        lastReview: { not: null },
      },
      select: { lastReview: true },
      orderBy: { lastReview: 'asc' },
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    }),
  ]);

  const typedLessons = lessons as LessonWithProgress[];
  const lessonCount = typedLessons.length;
  const completedLessonCount = typedLessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;
  const nextLesson = typedLessons.find((lesson) => !lesson.progress.some((item) => item.completed)) ?? null;

  const mostRecentCompletedLesson = typedLessons
    .filter((lesson) => lesson.progress.some((item) => item.completedAt))
    .sort((a, b) => {
      const aDate = a.progress[0]?.completedAt?.getTime() ?? 0;
      const bDate = b.progress[0]?.completedAt?.getTime() ?? 0;
      return bDate - aDate;
    })[0] ?? null;

  const continueLesson = mostRecentCompletedLesson
    ? typedLessons.find((lesson) => (
      lesson.categoryId === mostRecentCompletedLesson.categoryId && lesson.order === mostRecentCompletedLesson.order + 1
    )) ?? nextLesson
    : nextLesson;

  const levelSummary = Array.from(new Set(typedLessons.map((lesson) => lesson.category.level.code))).map((levelCode) => {
    const levelLessons = typedLessons.filter((lesson) => lesson.category.level.code === levelCode);
    const done = levelLessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;
    const total = levelLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return { levelCode, done, total, pct };
  });

  const currentLevel = levelSummary.find((level) => level.total > 0 && level.done < level.total) ?? levelSummary[0] ?? null;

  const typedFlashcards = flashcards as FlashcardForDashboard[];
  const dueCards = typedFlashcards.filter((card: FlashcardForDashboard) => !card.progress || new Date(card.progress.dueAt) <= now);
  const dueDeckMap = dueCards.reduce<Record<string, DueDeckSummary>>((acc: Record<string, DueDeckSummary>, card: FlashcardForDashboard) => {
    const existing = acc[card.deckId];
    if (existing) {
      existing.dueCount += 1;
      return acc;
    }

    acc[card.deckId] = {
      deckId: card.deckId,
      title: card.deck.title,
      color: card.deck.color,
      dueCount: 1,
    };
    return acc;
  }, {});

  const dueDecks = Object.values(dueDeckMap) as DueDeckSummary[];
  dueDecks.sort((a: DueDeckSummary, b: DueDeckSummary) => b.dueCount - a.dueCount);
  const recommendedDeck = dueDecks[0] ?? null;

  const weakSkill = getWeakSkill(examProgress);
  const recommendedSkillHref = weakSkill ? getSkillHref(weakSkill.key) : '/levels';
  const activeExamPlan = savedExamPlan as SavedExamPlan | null;
  const activityDates = [
    ...examActivityDates.map((item) => item.startedAt),
    ...flashcardActivityDates.map((item) => item.lastReview).filter((value): value is Date => Boolean(value)),
    ...lessonActivityDates.map((item) => item.completedAt).filter((value): value is Date => Boolean(value)),
  ];
  const streakMetrics = buildStreakMetrics(activityDates, now);
  let effectiveStudyProfile = (studyProfile as StudyProfile | null) ?? {
    weeklyGoal: 12,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  };

  if (
    !studyProfile
    || studyProfile.currentStreak !== streakMetrics.currentStreak
    || studyProfile.longestStreak !== streakMetrics.longestStreak
    || (studyProfile.lastActivityDate?.getTime() ?? null) !== (streakMetrics.lastActivityDate?.getTime() ?? null)
  ) {
    const syncedStudyProfile = await prisma.userStudyProfile.upsert({
      where: { userId },
      update: {
        currentStreak: streakMetrics.currentStreak,
        longestStreak: Math.max(studyProfile?.longestStreak ?? 0, streakMetrics.longestStreak),
        lastActivityDate: streakMetrics.lastActivityDate,
      },
      create: {
        userId,
        weeklyGoal: studyProfile?.weeklyGoal ?? 12,
        currentStreak: streakMetrics.currentStreak,
        longestStreak: streakMetrics.longestStreak,
        lastActivityDate: streakMetrics.lastActivityDate,
      },
    });

    effectiveStudyProfile = {
      weeklyGoal: syncedStudyProfile.weeklyGoal,
      currentStreak: syncedStudyProfile.currentStreak,
      longestStreak: syncedStudyProfile.longestStreak,
      lastActivityDate: syncedStudyProfile.lastActivityDate,
    };
  }

  const liveDaysLeft = activeExamPlan
    ? Math.ceil((new Date(activeExamPlan.examDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const recommendedLevelCode = activeExamPlan?.targetLevelCode ?? currentLevel?.levelCode ?? recentSessions[0]?.examSet.level.code ?? 'N5';

  const weeklyExamCount = recentSessions.filter((sessionItem) => new Date(sessionItem.startedAt) >= weekStart).length;
  const weeklyStudyActions = lessonReviewsThisWeek.length + flashcardReviewsThisWeek.length + weeklyExamCount;
  const weeklyGoal = effectiveStudyProfile.weeklyGoal;
  const weeklyPct = Math.min(100, Math.round((weeklyStudyActions / weeklyGoal) * 100));

  const [rawListeningRecommendations, readingRecommendations] = await Promise.all([
    weakSkill?.key === 'nghe'
      ? prisma.learningLesson.findMany({
          where: {
            type: 'audio',
            category: {
              skill: 'nghe',
              level: { code: recommendedLevelCode },
            },
          },
          include: {
            category: { include: { level: true } },
          },
          orderBy: [
            { category: { order: 'asc' } },
            { order: 'asc' },
          ],
          take: 2,
        })
      : Promise.resolve([]),
    weakSkill?.key === 'doc'
      ? prisma.readingPassage.findMany({
          where: {
            published: true,
            level: recommendedLevelCode,
          },
          select: {
            id: true,
            title: true,
            titleVi: true,
            level: true,
            type: true,
            summary: true,
          },
          orderBy: [
            { updatedAt: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 2,
        })
      : Promise.resolve([]),
  ]);

  const listeningRecommendations = rawListeningRecommendations
    .map((lesson) => mapLessonToListeningPractice(lesson))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item): ListeningRecommendation => ({
      id: item.id,
      title: item.title,
      level: item.level,
      mondai: item.mondai,
      focus: item.focus,
      summary: item.summary,
    }));

  const detailedWeakSkillHref = weakSkill?.key === 'nghe' && listeningRecommendations[0]
    ? `/listening?level=${listeningRecommendations[0].level}&practice=${listeningRecommendations[0].id}`
    : weakSkill?.key === 'doc' && readingRecommendations[0]
      ? `/reading/${readingRecommendations[0].id}`
      : recommendedSkillHref;

  const skillStats = SKILLS.map((skill: (typeof SKILLS)[number]) => {
    const done = examProgress.filter((item: ExamProgressItem) => item.examSet.skill === skill.key);
    const avg = done.length > 0
      ? Math.round(done.reduce((sum: number, item: ExamProgressItem) => sum + (item.bestScore ?? 0), 0) / done.length)
      : null;

    return { ...skill, done: done.length, avg };
  });

  const statsCards: StatsCard[] = [
    {
      label: 'Bài học đã hoàn thành',
      value: completedLessonCount,
      detail: lessonCount > 0 ? `${lessonCount - completedLessonCount} bài còn lại` : 'Chưa có dữ liệu',
      icon: FaBookOpen,
      color: 'var(--primary)',
    },
    {
      label: 'Flashcards cần ôn',
      value: dueCards.length,
      detail: recommendedDeck ? `${recommendedDeck.title}` : 'Chưa có thẻ đến hạn',
      icon: FaLayerGroup,
      color: '#D97706',
    },
    {
      label: 'Lượt học tuần này',
      value: weeklyStudyActions,
      detail: `${weeklyPct}% mục tiêu tuần`,
      icon: FaChartLine,
      color: '#059669',
    },
    {
      label: 'Streak hiện tại',
      value: effectiveStudyProfile.currentStreak,
      detail: `Kỷ lục ${effectiveStudyProfile.longestStreak} ngày`,
      icon: FaFireFlameCurved,
      color: '#EA580C',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <section className="rounded-[32px] border p-6 sm:p-8" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-base))' }}>
        <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6 items-start">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--primary)' }}>Bảng điều khiển học tập</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Hôm nay bạn nên học gì?
            </h1>
            <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Xin chào {session.user?.name}. Dashboard này ưu tiên việc tiếp tục học, ôn đúng phần đến hạn và luyện lại kỹ năng còn yếu.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              {continueLesson ? (
                <Link href={getLessonHref(continueLesson)} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
                  <FaPlay size={12} /> Tiếp tục bài học
                </Link>
              ) : (
                <Link href="/learn" className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
                  <FaPlay size={12} /> Bắt đầu lộ trình học
                </Link>
              )}
              <Link href={recommendedDeck ? `/flashcards/${recommendedDeck.deckId}/study` : '/flashcards'} className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm">
                <FaRotateRight size={12} /> Ôn tập đến hạn
              </Link>
              {activeExamPlan ? (
                <Link href="/levels#deadline-planner" className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm">
                  <FaBullseye size={12} /> Xem kế hoạch thi {activeExamPlan.targetLevelCode}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
            <div className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--primary)' }}>
              Mục tiêu tuần
            </div>
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{weeklyStudyActions}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>trên {weeklyGoal} lượt học mục tiêu</div>
              </div>
              <div className="text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{weeklyPct}%</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
              <div className="h-full rounded-full" style={{ width: `${weeklyPct}%`, background: 'var(--primary)' }} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
              <div>
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{lessonReviewsThisWeek.length}</div>
                <div style={{ color: 'var(--text-muted)' }}>Bài học</div>
              </div>
              <div>
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{flashcardReviewsThisWeek.length}</div>
                <div style={{ color: 'var(--text-muted)' }}>Thẻ đã ôn</div>
              </div>
              <div>
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{weeklyExamCount}</div>
                <div style={{ color: 'var(--text-muted)' }}>Đề đã làm</div>
              </div>
            </div>

            <DashboardWeeklyGoalEditor
              initialGoal={weeklyGoal}
              currentStreak={effectiveStudyProfile.currentStreak}
              longestStreak={effectiveStudyProfile.longestStreak}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="rounded-[24px] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>{card.label}</span>
              <card.icon size={15} style={{ color: card.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{card.detail}</div>
          </div>
        ))}
      </section>

      {activeExamPlan ? (
        <section className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>Mục tiêu kỳ thi</div>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                Kế hoạch chinh phục {activeExamPlan.targetLevelCode}
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Thi ngày {formatDateVi(activeExamPlan.examDate)}. {liveDaysLeft !== null && liveDaysLeft > 0
                  ? `Còn khoảng ${liveDaysLeft} ngày để bám theo nhịp ôn.`
                  : 'Deadline đã tới hoặc đã qua, bạn nên cập nhật lại kế hoạch.'}
              </p>
            </div>
            <Link href="/levels#deadline-planner" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              Cập nhật kế hoạch →
            </Link>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mt-5">
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Đề mỗi tuần</div>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{activeExamPlan.examsPerWeek}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Buổi học mỗi tuần</div>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{activeExamPlan.studySessionsPerWeek}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Chu kỳ ôn đề</div>
              <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{activeExamPlan.reviewDays} ngày</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Kế hoạch lưu gần nhất</div>
              <div className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>{formatDateVi(activeExamPlan.updatedAt)}</div>
            </div>
          </div>
        </section>
      ) : null}

      {weakSkill?.key === 'nghe' && listeningRecommendations.length > 0 ? (
        <section className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>Recommendation theo skill yếu</div>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Bài nghe nên làm ngay cho {recommendedLevelCode}</h2>
            </div>
            <Link href={`/listening?level=${recommendedLevelCode}`} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              Xem toàn bộ bài nghe →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {listeningRecommendations.map((item) => (
              <Link key={item.id} href={`/listening?level=${item.level}&practice=${item.id}`} className="rounded-[24px] border p-4 block" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {item.level} · {item.mondai}
                </div>
                <div className="font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{item.summary}</div>
                <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Trọng tâm: {item.focus}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {weakSkill?.key === 'doc' && readingRecommendations.length > 0 ? (
        <section className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>Recommendation theo skill yếu</div>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Bài đọc nên làm ngay cho {recommendedLevelCode}</h2>
            </div>
            <Link href={`/reading?level=${recommendedLevelCode}`} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              Xem toàn bộ bài đọc →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {readingRecommendations.map((item) => (
              <Link key={item.id} href={`/reading/${item.id}`} className="rounded-[24px] border p-4 block" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {item.level} · {item.type}
                </div>
                <div className="font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                {item.titleVi ? <div className="text-sm mt-1" style={{ color: 'var(--primary)' }}>{item.titleVi}</div> : null}
                {item.summary ? <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{item.summary}</div> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>Hôm nay học gì</div>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>3 hành động ưu tiên</h2>
            </div>
            <FaBolt size={16} style={{ color: 'var(--primary)' }} />
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                <FaBookOpen size={14} style={{ color: 'var(--primary)' }} /> Tiếp tục học
              </div>
              {continueLesson ? (
                <>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{continueLesson.title}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {continueLesson.category.level.code} · {getSkillLabel(continueLesson.category.skill)} · {continueLesson.category.name}
                  </div>
                  <Link href={getLessonHref(continueLesson)} className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: 'var(--primary)' }}>
                    Vào bài học <FaArrowTrendUp size={12} />
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bạn chưa có bài học nào đang chờ tiếp tục.</div>
                  <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: 'var(--primary)' }}>
                    Khởi động lộ trình <FaArrowTrendUp size={12} />
                  </Link>
                </>
              )}
            </div>

            <div className="rounded-[24px] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                <FaLayerGroup size={14} style={{ color: '#D97706' }} /> Ôn tập đến hạn
              </div>
              {recommendedDeck ? (
                <>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{recommendedDeck.title}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {recommendedDeck.dueCount} thẻ đang đến hạn để ôn tập.
                  </div>
                  <Link href={`/flashcards/${recommendedDeck.deckId}/study`} className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: '#D97706' }}>
                    Bắt đầu ôn thẻ <FaArrowTrendUp size={12} />
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hiện chưa có flashcards đến hạn.</div>
                  <Link href="/flashcards" className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: '#D97706' }}>
                    Xem bộ thẻ <FaArrowTrendUp size={12} />
                  </Link>
                </>
              )}
            </div>

            <div className="rounded-[24px] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                <FaRegCirclePlay size={14} style={{ color: '#2563EB' }} /> Luyện kỹ năng yếu
              </div>
              {weakSkill ? (
                <>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{weakSkill.label}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Điểm trung bình hiện tại là {weakSkill.avg}% trên {weakSkill.attempts} bộ đề đã làm.
                  </div>
                  <Link href={detailedWeakSkillHref} className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: '#2563EB' }}>
                    Luyện ngay <FaArrowTrendUp size={12} />
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chưa có đủ dữ liệu để xác định kỹ năng yếu nhất.</div>
                  <Link href="/levels" className="inline-flex items-center gap-2 text-sm font-semibold mt-3" style={{ color: '#2563EB' }}>
                    Làm đề đầu tiên <FaArrowTrendUp size={12} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine size={15} style={{ color: 'var(--primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tiến độ theo level</h2>
            </div>

            {levelSummary.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu bài học để hiển thị tiến độ.</div>
            ) : (
              <div className="space-y-4">
                {currentLevel && (
                  <div className="rounded-[22px] p-4" style={{ background: 'var(--primary-light)' }}>
                    <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Level hiện tại</div>
                    <div className="flex items-end justify-between gap-3 mt-2">
                      <div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentLevel.levelCode}</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentLevel.done}/{currentLevel.total} bài đã hoàn thành</div>
                      </div>
                      <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{currentLevel.pct}%</div>
                    </div>
                  </div>
                )}

                {levelSummary.map((level) => (
                  <div key={level.levelCode}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-primary)' }}>{level.levelCode}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{level.done}/{level.total}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                      <div className="h-full rounded-full" style={{ width: `${level.pct}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FaTriangleExclamation size={15} style={{ color: '#D97706' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Điểm cần chú ý</h2>
            </div>

            <div className="space-y-3 text-sm">
              {weakSkill ? (
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Kỹ năng yếu nhất hiện tại</div>
                  <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>{weakSkill.label} với mức trung bình {weakSkill.avg}%.</div>
                </div>
              ) : null}

              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Flashcards đến hạn</div>
                <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>{dueCards.length} thẻ đang chờ được ôn lại.</div>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-base)' }}>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tiến độ bài học</div>
                <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>{completedLessonCount}/{lessonCount} bài đã hoàn tất trên toàn bộ lộ trình.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>Kỹ năng & lịch sử</div>
            <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Tiến trình gần đây</h2>
          </div>
          <Link href="/levels" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Làm thêm đề →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {skillStats.map((skill) => (
            <div key={skill.key} className="rounded-[22px] border p-4 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--primary-light)' }}>
                <SkillIcon skill={skill.key} size={18} />
              </div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{skill.label}</div>
              <div className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{skill.done}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>bộ đề đã làm</div>
              {skill.avg !== null && (
                <div className="inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={skill.avg >= 60
                    ? { background: '#DCFCE7', color: '#166534' }
                    : { background: '#FEE2E2', color: '#B91C1C' }}>
                  {skill.avg}%
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Lịch sử làm bài</h3>
          {recentSessions.length === 0 ? (
            <div className="rounded-[22px] border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
              Bạn chưa làm bài thi nào. <Link href="/levels" className="font-semibold" style={{ color: 'var(--primary)' }}>Bắt đầu ngay →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((sessionItem) => {
                const pct = sessionItem.totalQ > 0 ? Math.round((sessionItem.correctQ / sessionItem.totalQ) * 100) : 0;
                const good = pct >= 60;

                return (
                  <div key={sessionItem.id} className="rounded-[22px] border px-4 py-3 flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
                        <SkillIcon skill={sessionItem.examSet.skill} size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{sessionItem.examSet.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {sessionItem.examSet.level.code} · {getSkillLabel(sessionItem.examSet.skill)} · {new Date(sessionItem.startedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold" style={{ color: good ? '#059669' : 'var(--accent)' }}>{pct}%</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sessionItem.correctQ}/{sessionItem.totalQ}</span>
                      <Link href={`/results/${sessionItem.id}`} className="btn-secondary text-xs py-1 px-3">Xem lại</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}