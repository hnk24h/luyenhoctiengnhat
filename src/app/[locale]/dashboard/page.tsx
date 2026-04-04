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
  FaCircleCheck,
  FaCalendarDays,
  FaHeadphones,
  FaNewspaper,
  FaArrowRight,
  FaTrophy,
  FaFire,
  FaGraduationCap,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SKILLS, getSkillLabel } from '@/lib/utils';
import { SkillIcon } from '@/components/SkillIcon';
import { mapLessonToListeningPractice } from '@/modules/listeningUtils';
import { DashboardWeeklyGoalEditor } from '@/components/DashboardWeeklyGoalEditor';

export const dynamic = 'force-dynamic';

/* ── Types ─────────────────────────────────────────────────────────── */
type LessonWithProgress = {
  id: string; title: string; type: string; order: number; categoryId: string;
  category: { id: string; name: string; skill: string; order: number; level: { code: string; order: number; name: string } };
  progress: Array<{ completed: boolean; completedAt: Date | null }>;
};
type ExamProgressItem = { examSet: { skill: string }; bestScore: number | null; attempts: number };
type WeakSkillSummary = { key: string; label: string; avg: number | null; attempts: number };
type FlashcardForDashboard = { deckId: string; deck: { title: string; color: string }; progress: { dueAt: Date } | null };
type DueDeckSummary = { deckId: string; title: string; color: string; dueCount: number };
type StatsCard = { label: string; value: number; detail: string; icon: IconType; color: string; bg: string };
type SavedExamPlan = { targetLevelCode: string; examDate: Date; daysLeftAtSave: number; weeksLeftAtSave: number; examsPerWeek: number; studySessionsPerWeek: number; reviewDays: number; updatedAt: Date };
type StudyProfile = { weeklyGoal: number; currentStreak: number; longestStreak: number; lastActivityDate: Date | null };
type ListeningRecommendation = { id: string; title: string; level: string; mondai: string; focus: string; summary: string };
type ReadingRecommendation = { id: string; title: string; titleVi: string | null; level: string; type: string; summary: string | null };

/* ── Helpers ────────────────────────────────────────────────────────── */
function getLangFromLevelCode(code: string): string {
  if (/^N[1-5]$/.test(code)) return 'ja';
  if (/^HSK/i.test(code)) return 'zh';
  if (/^TOPIK/i.test(code)) return 'ko';
  return 'ja';
}

function getLessonHref(lesson: LessonWithProgress, locale: string) {
  const lang = getLangFromLevelCode(lesson.category.level.code);
  return `/${locale}/${lang}/learn/${lesson.category.level.code}/${lesson.category.skill}/${lesson.categoryId}/${lesson.id}`;
}

function getSkillHref(skill: string, lang: string, locale: string) {
  if (skill === 'nghe') return `/${locale}/${lang}/listening`;
  if (skill === 'doc') return `/${locale}/${lang}/reading`;
  return `/${locale}/${lang}/learn`;
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
  const uniqueDays = Array.from(new Set(activityDates.map(d => startOfDay(d).getTime()))).sort((a, b) => a - b);
  if (uniqueDays.length === 0) return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  let longestStreak = 1, runningLongest = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] - uniqueDays[i - 1] === 86400000) { runningLongest++; longestStreak = Math.max(longestStreak, runningLongest); }
    else { runningLongest = 1; }
  }
  const lastActivityDate = new Date(uniqueDays[uniqueDays.length - 1]);
  const diffFromToday = dayDiff(now, lastActivityDate);
  let currentStreak = 0;
  if (diffFromToday <= 1) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (uniqueDays[i] - uniqueDays[i - 1] === 86400000) currentStreak++;
      else break;
    }
  }
  return { currentStreak, longestStreak, lastActivityDate };
}

function getWeakSkill(progress: ExamProgressItem[]): WeakSkillSummary | null {
  const stats = SKILLS.map((skill: (typeof SKILLS)[number]) => {
    const items = progress.filter(p => p.examSet.skill === skill.key && p.bestScore !== null);
    const avg = items.length > 0 ? Math.round(items.reduce((s, p) => s + (p.bestScore ?? 0), 0) / items.length) : null;
    return { key: skill.key, label: skill.label, avg, attempts: items.length };
  }).filter(s => s.attempts > 0);
  return stats.sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999))[0] ?? null;
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/${locale}/auth/login`);

  const userId = (session.user as any).id as string;
  const now = new Date();
  const weekStart = startOfWeek(now);

  const [
    recentSessions, examProgress, lessons, flashcards,
    flashcardReviewsThisWeek, lessonReviewsThisWeek, savedExamPlan, studyProfile,
    examActivityDates, flashcardActivityDates, lessonActivityDates,
  ] = await Promise.all([
    prisma.examSession.findMany({ where: { userId }, include: { examSet: { include: { level: true } } }, orderBy: { startedAt: 'desc' }, take: 8 }),
    prisma.userProgress.findMany({ where: { userId }, include: { examSet: { include: { level: true } } }, orderBy: { lastAttempt: 'desc' } }),
    prisma.learningLesson.findMany({
      include: { progress: { where: { userId } }, category: { include: { level: true } } },
      orderBy: [{ category: { level: { order: 'asc' } } }, { category: { order: 'asc' } }, { order: 'asc' }],
    }),
    prisma.flashcard.findMany({
      where: { deck: { userId } }, include: { deck: true, progress: { where: { userId } } },
      orderBy: [{ deck: { updatedAt: 'desc' } }, { order: 'asc' }],
    }),
    prisma.flashcardProgress.findMany({ where: { userId, lastReview: { gte: weekStart } }, select: { id: true } }),
    prisma.lessonProgress.findMany({ where: { userId, completed: true, completedAt: { gte: weekStart } }, select: { id: true } }),
    prisma.userExamPlan.findUnique({ where: { userId } }),
    prisma.userStudyProfile.findUnique({ where: { userId } }),
    prisma.examSession.findMany({ where: { userId }, select: { startedAt: true }, orderBy: { startedAt: 'asc' } }),
    prisma.flashcardProgress.findMany({ where: { userId, lastReview: { not: null } }, select: { lastReview: true }, orderBy: { lastReview: 'asc' } }),
    prisma.lessonProgress.findMany({ where: { userId, completed: true, completedAt: { not: null } }, select: { completedAt: true }, orderBy: { completedAt: 'asc' } }),
  ]);

  // Lessons
  const typedLessons = lessons as LessonWithProgress[];
  const lessonCount = typedLessons.length;
  const completedLessonCount = typedLessons.filter(l => l.progress.some(p => p.completed)).length;
  const lessonPct = lessonCount > 0 ? Math.round((completedLessonCount / lessonCount) * 100) : 0;
  const nextLesson = typedLessons.find(l => !l.progress.some(p => p.completed)) ?? null;
  const mostRecentCompleted = typedLessons
    .filter(l => l.progress.some(p => p.completedAt))
    .sort((a, b) => (b.progress[0]?.completedAt?.getTime() ?? 0) - (a.progress[0]?.completedAt?.getTime() ?? 0))[0] ?? null;
  const continueLesson = mostRecentCompleted
    ? typedLessons.find(l => l.categoryId === mostRecentCompleted.categoryId && l.order === mostRecentCompleted.order + 1) ?? nextLesson
    : nextLesson;

  // Level summary
  const levelSummary = Array.from(new Set(typedLessons.map(l => l.category.level.code))).map(code => {
    const lvLessons = typedLessons.filter(l => l.category.level.code === code);
    const done = lvLessons.filter(l => l.progress.some(p => p.completed)).length;
    const total = lvLessons.length;
    return { levelCode: code, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });
  const currentLevel = levelSummary.find(l => l.total > 0 && l.done < l.total) ?? levelSummary[0] ?? null;

  // Flashcards
  const typedFlashcards = flashcards.map(c => ({ ...c, progress: c.progress[0] ?? null })) as FlashcardForDashboard[];
  const dueCards = typedFlashcards.filter(c => !c.progress || new Date(c.progress.dueAt) <= now);
  const dueDeckMap = dueCards.reduce<Record<string, DueDeckSummary>>((acc, card) => {
    if (acc[card.deckId]) { acc[card.deckId].dueCount++; return acc; }
    acc[card.deckId] = { deckId: card.deckId, title: card.deck.title, color: card.deck.color, dueCount: 1 };
    return acc;
  }, {});
  const dueDecks = Object.values(dueDeckMap).sort((a, b) => b.dueCount - a.dueCount);
  const recommendedDeck = dueDecks[0] ?? null;

  // Skill & weak
  const weakSkill = getWeakSkill(examProgress);
  const activeExamPlan = savedExamPlan as SavedExamPlan | null;
  const recommendedLevelCode = activeExamPlan?.targetLevelCode ?? currentLevel?.levelCode ?? recentSessions[0]?.examSet.level.code ?? 'N5';
  const recommendedLang = getLangFromLevelCode(recommendedLevelCode);
  const recommendedSkillHref = weakSkill ? getSkillHref(weakSkill.key, recommendedLang, locale) : `/${locale}/${recommendedLang}/levels`;

  // Streak
  const activityDates = [
    ...examActivityDates.map(i => i.startedAt),
    ...flashcardActivityDates.map(i => i.lastReview).filter((v): v is Date => Boolean(v)),
    ...lessonActivityDates.map(i => i.completedAt).filter((v): v is Date => Boolean(v)),
  ];
  const streakMetrics = buildStreakMetrics(activityDates, now);
  let effectiveStudyProfile = (studyProfile as StudyProfile | null) ?? { weeklyGoal: 12, currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  if (!studyProfile || studyProfile.currentStreak !== streakMetrics.currentStreak || studyProfile.longestStreak !== streakMetrics.longestStreak || (studyProfile.lastActivityDate?.getTime() ?? null) !== (streakMetrics.lastActivityDate?.getTime() ?? null)) {
    const synced = await prisma.userStudyProfile.upsert({
      where: { userId },
      update: { currentStreak: streakMetrics.currentStreak, longestStreak: Math.max(studyProfile?.longestStreak ?? 0, streakMetrics.longestStreak), lastActivityDate: streakMetrics.lastActivityDate },
      create: { userId, weeklyGoal: studyProfile?.weeklyGoal ?? 12, currentStreak: streakMetrics.currentStreak, longestStreak: streakMetrics.longestStreak, lastActivityDate: streakMetrics.lastActivityDate },
    });
    effectiveStudyProfile = { weeklyGoal: synced.weeklyGoal, currentStreak: synced.currentStreak, longestStreak: synced.longestStreak, lastActivityDate: synced.lastActivityDate };
  }

  // Weekly goal
  const weeklyExamCount = recentSessions.filter(s => new Date(s.startedAt) >= weekStart).length;
  const weeklyStudyActions = lessonReviewsThisWeek.length + flashcardReviewsThisWeek.length + weeklyExamCount;
  const weeklyGoal = effectiveStudyProfile.weeklyGoal;
  const weeklyPct = Math.min(100, Math.round((weeklyStudyActions / weeklyGoal) * 100));
  const liveDaysLeft = activeExamPlan ? Math.ceil((new Date(activeExamPlan.examDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Recommendations
  const [rawListeningRecs, readingRecs] = await Promise.all([
    weakSkill?.key === 'nghe'
      ? prisma.learningLesson.findMany({ where: { type: 'audio', category: { skill: 'nghe', level: { code: recommendedLevelCode } } }, include: { category: { include: { level: true } } }, orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }], take: 2 })
      : Promise.resolve([]),
    weakSkill?.key === 'doc'
      ? prisma.readingPassage.findMany({ where: { published: true, level: recommendedLevelCode }, select: { id: true, title: true, titleVi: true, level: true, type: true, summary: true }, orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }], take: 2 })
      : Promise.resolve([]),
  ]);
  const listeningRecs = rawListeningRecs.map(l => mapLessonToListeningPractice(l)).filter((i): i is NonNullable<typeof i> => Boolean(i)).map((i): ListeningRecommendation => ({ id: i.id, title: i.title, level: i.level, mondai: i.mondai, focus: i.focus, summary: i.summary }));
  const detailedWeakSkillHref = weakSkill?.key === 'nghe' && listeningRecs[0]
    ? `/${locale}/${recommendedLang}/listening?level=${listeningRecs[0].level}&practice=${listeningRecs[0].id}`
    : weakSkill?.key === 'doc' && readingRecs[0]
      ? `/${locale}/${recommendedLang}/reading/${readingRecs[0].id}`
      : recommendedSkillHref;

  // Skill stats
  const skillStats = SKILLS.map((skill: (typeof SKILLS)[number]) => {
    const done = examProgress.filter(p => p.examSet.skill === skill.key);
    const avg = done.length > 0 ? Math.round(done.reduce((s, p) => s + (p.bestScore ?? 0), 0) / done.length) : null;
    return { ...skill, done: done.length, avg };
  });

  const statsCards: StatsCard[] = [
    { label: 'Bài học hoàn thành', value: completedLessonCount, detail: `${lessonCount - completedLessonCount} bài còn lại`, icon: FaBookOpen, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Thẻ cần ôn hôm nay', value: dueCards.length, detail: recommendedDeck ? recommendedDeck.title : 'Không có thẻ đến hạn', icon: FaLayerGroup, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Hoạt động tuần này', value: weeklyStudyActions, detail: `${weeklyPct}% mục tiêu`, icon: FaChartLine, color: '#059669', bg: '#F0FDF4' },
    { label: 'Streak hiện tại', value: effectiveStudyProfile.currentStreak, detail: `Kỷ lục ${effectiveStudyProfile.longestStreak} ngày`, icon: FaFireFlameCurved, color: '#EA580C', bg: '#FFF7ED' },
  ];

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  })();

  const firstName = session.user?.name?.split(' ').pop() ?? 'bạn';
  const continueHref = continueLesson ? getLessonHref(continueLesson, locale) : `/${locale}/${recommendedLang}/learn`;
  const flashcardStudyHref = recommendedDeck ? `/${locale}/${recommendedLang}/practice/${recommendedDeck.deckId}/study` : `/${locale}/${recommendedLang}/practice`;

  return (
    <div className="db-root">
      {/* ── Hero greeting ─── */}
      <section className="db-hero">
        <div className="db-hero-inner">
          <div className="db-hero-left">
            <div className="db-greeting-badge">
              {effectiveStudyProfile.currentStreak > 0 && (
                <span className="db-streak-badge">
                  <FaFire size={12} style={{ color: '#EA580C' }} />
                  {effectiveStudyProfile.currentStreak} ngày streak
                </span>
              )}
            </div>
            <h1 className="db-hero-title">
              {greeting}, <span className="db-hero-name">{firstName}</span> 👋
            </h1>
            <p className="db-hero-sub">
              {continueLesson
                ? `Bạn đang học ${continueLesson.category.level.code} · ${continueLesson.category.name}. Tiếp tục nhé!`
                : 'Bắt đầu hành trình học tập của bạn hôm nay.'}
            </p>
            <div className="db-hero-actions">
              <Link href={continueHref} className="db-btn-primary">
                <FaPlay size={12} /> {continueLesson ? 'Tiếp tục học' : 'Bắt đầu học'}
              </Link>
              {recommendedDeck && (
                <Link href={flashcardStudyHref} className="db-btn-secondary">
                  <FaRotateRight size={12} /> Ôn flashcard ({recommendedDeck.dueCount})
                </Link>
              )}
              {activeExamPlan && (
                <Link href={`/${locale}/${recommendedLang}/levels#deadline-planner`} className="db-btn-secondary">
                  <FaBullseye size={12} /> Kế hoạch {activeExamPlan.targetLevelCode}
                </Link>
              )}
            </div>
          </div>

          {/* Weekly ring */}
          <div className="db-weekly-card">
            <div className="db-weekly-label">Mục tiêu tuần</div>
            <div className="db-weekly-ring-wrap">
              <svg viewBox="0 0 80 80" className="db-ring" aria-hidden>
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-muted)" strokeWidth="7" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--primary)" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - weeklyPct / 100)}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset .6s ease' }} />
              </svg>
              <div className="db-ring-center">
                <div className="db-ring-pct">{weeklyPct}%</div>
                <div className="db-ring-sub">{weeklyStudyActions}/{weeklyGoal}</div>
              </div>
            </div>
            <div className="db-weekly-breakdown">
              <div className="db-weekly-item"><span className="db-weekly-val">{lessonReviewsThisWeek.length}</span><span className="db-weekly-key">Bài học</span></div>
              <div className="db-weekly-item"><span className="db-weekly-val">{flashcardReviewsThisWeek.length}</span><span className="db-weekly-key">Thẻ ôn</span></div>
              <div className="db-weekly-item"><span className="db-weekly-val">{weeklyExamCount}</span><span className="db-weekly-key">Đề làm</span></div>
            </div>
            <DashboardWeeklyGoalEditor initialGoal={weeklyGoal} currentStreak={effectiveStudyProfile.currentStreak} longestStreak={effectiveStudyProfile.longestStreak} />
          </div>
        </div>
      </section>

      {/* ── Stats row ─── */}
      <section className="db-stats">
        {statsCards.map(card => (
          <div key={card.label} className="db-stat-card" style={{ '--sc-color': card.color, '--sc-bg': card.bg } as React.CSSProperties}>
            <div className="db-stat-icon-wrap">
              <card.icon size={16} />
            </div>
            <div className="db-stat-body">
              <div className="db-stat-label">{card.label}</div>
              <div className="db-stat-value">{card.value}</div>
              <div className="db-stat-detail">{card.detail}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Main two-col ─── */}
      <section className="db-main-grid">

        {/* LEFT: Priority actions + active level */}
        <div className="db-col-left">

          {/* Continue lesson hero card */}
          <div className="db-continue-card">
            <div className="db-continue-badge">
              <FaBolt size={12} /> Tiếp tục ngay
            </div>
            {continueLesson ? (
              <>
                <div className="db-continue-level">{continueLesson.category.level.code} · {getSkillLabel(continueLesson.category.skill)}</div>
                <h2 className="db-continue-title">{continueLesson.title}</h2>
                <div className="db-continue-cat">{continueLesson.category.name}</div>
                <Link href={continueHref} className="db-btn-primary mt-4 self-start">
                  <FaPlay size={11} /> Vào bài học <FaArrowRight size={10} />
                </Link>
              </>
            ) : (
              <>
                <h2 className="db-continue-title">Bắt đầu lộ trình học</h2>
                <div className="db-continue-cat">Chọn cấp độ phù hợp với bạn</div>
                <Link href={`/${locale}/${recommendedLang}/learn`} className="db-btn-primary mt-4 self-start">
                  <FaPlay size={11} /> Bắt đầu ngay
                </Link>
              </>
            )}
          </div>

          {/* 3 priority actions */}
          <div className="db-actions-card">
            <div className="db-card-header">
              <FaBolt size={14} style={{ color: 'var(--primary)' }} />
              <h2 className="db-card-title">3 hành động ưu tiên hôm nay</h2>
            </div>

            <div className="db-action-list">
              {/* 1. Continue lesson */}
              <div className="db-action-item">
                <div className="db-action-icon" style={{ background: '#EEF2FF' }}><FaBookOpen size={14} style={{ color: '#4F46E5' }} /></div>
                <div className="db-action-body">
                  <div className="db-action-label">Tiếp tục bài học</div>
                  {continueLesson
                    ? <div className="db-action-sub">{continueLesson.title} · {continueLesson.category.level.code}</div>
                    : <div className="db-action-sub">Chưa có bài học nào đang tiếp tục</div>}
                </div>
                <Link href={continueHref} className="db-action-cta" style={{ color: '#4F46E5' }}>Học <FaArrowRight size={10} /></Link>
              </div>

              {/* 2. Flashcard review */}
              <div className="db-action-item">
                <div className="db-action-icon" style={{ background: '#FFFBEB' }}><FaLayerGroup size={14} style={{ color: '#D97706' }} /></div>
                <div className="db-action-body">
                  <div className="db-action-label">Ôn thẻ đến hạn</div>
                  {recommendedDeck
                    ? <div className="db-action-sub">{recommendedDeck.title} · {recommendedDeck.dueCount} thẻ</div>
                    : <div className="db-action-sub">Không có flashcard đến hạn</div>}
                </div>
                <Link href={flashcardStudyHref} className="db-action-cta" style={{ color: '#D97706' }}>Ôn <FaArrowRight size={10} /></Link>
              </div>

              {/* 3. Weak skill */}
              <div className="db-action-item">
                <div className="db-action-icon" style={{ background: '#EFF6FF' }}><FaRegCirclePlay size={14} style={{ color: '#2563EB' }} /></div>
                <div className="db-action-body">
                  <div className="db-action-label">Luyện kỹ năng yếu</div>
                  {weakSkill
                    ? <div className="db-action-sub">{weakSkill.label} · TB {weakSkill.avg}%</div>
                    : <div className="db-action-sub">Làm đề để xác định kỹ năng yếu</div>}
                </div>
                <Link href={detailedWeakSkillHref} className="db-action-cta" style={{ color: '#2563EB' }}>Luyện <FaArrowRight size={10} /></Link>
              </div>
            </div>
          </div>

          {/* Exam plan */}
          {activeExamPlan && (
            <div className="db-examplan-card">
              <div className="db-card-header">
                <FaCalendarDays size={14} style={{ color: '#7C3AED' }} />
                <h2 className="db-card-title">Kế hoạch thi {activeExamPlan.targetLevelCode}</h2>
                <Link href={`/${locale}/${recommendedLang}/levels#deadline-planner`} className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>Cập nhật →</Link>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Thi ngày <strong>{formatDateVi(activeExamPlan.examDate)}</strong>.{' '}
                {liveDaysLeft !== null && liveDaysLeft > 0 ? `Còn ${liveDaysLeft} ngày.` : 'Deadline đã tới — cập nhật lại kế hoạch.'}
              </p>
              <div className="db-examplan-grid">
                {[
                  { label: 'Đề/tuần', value: activeExamPlan.examsPerWeek },
                  { label: 'Buổi học/tuần', value: activeExamPlan.studySessionsPerWeek },
                  { label: 'Chu kỳ ôn', value: `${activeExamPlan.reviewDays}n` },
                  { label: 'Cập nhật', value: formatDateVi(activeExamPlan.updatedAt) },
                ].map(item => (
                  <div key={item.label} className="db-examplan-item">
                    <div className="db-examplan-val">{item.value}</div>
                    <div className="db-examplan-key">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Level progress + Alerts + Skill stats */}
        <div className="db-col-right">

          {/* Level progress */}
          <div className="db-progress-card">
            <div className="db-card-header">
              <FaGraduationCap size={14} style={{ color: 'var(--primary)' }} />
              <h2 className="db-card-title">Tiến độ theo level</h2>
              <span className="ml-auto text-xs font-bold" style={{ color: 'var(--primary)' }}>{lessonPct}% tổng thể</span>
            </div>
            {currentLevel && (
              <div className="db-current-level">
                <div>
                  <div className="db-cur-level-code">{currentLevel.levelCode}</div>
                  <div className="db-cur-level-sub">{currentLevel.done}/{currentLevel.total} bài</div>
                </div>
                <div className="db-cur-level-pct">{currentLevel.pct}%</div>
              </div>
            )}
            <div className="db-level-bars">
              {levelSummary.map(lv => (
                <div key={lv.levelCode} className="db-level-bar-row">
                  <span className="db-level-bar-code">{lv.levelCode}</span>
                  <div className="db-level-bar-track">
                    <div className="db-level-bar-fill" style={{ width: `${lv.pct}%` }} />
                  </div>
                  <span className="db-level-bar-pct">{lv.pct}%</span>
                </div>
              ))}
            </div>
            {lessonCount === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu bài học.</p>}
          </div>

          {/* Alerts */}
          <div className="db-alerts-card">
            <div className="db-card-header">
              <FaTriangleExclamation size={14} style={{ color: '#D97706' }} />
              <h2 className="db-card-title">Điểm cần chú ý</h2>
            </div>
            <div className="db-alert-list">
              {weakSkill && (
                <div className="db-alert-item">
                  <FaArrowTrendUp size={11} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                  <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{weakSkill.label}</span> — điểm TB {weakSkill.avg}% ({weakSkill.attempts} bộ đề)</div>
                </div>
              )}
              {dueCards.length > 0 && (
                <div className="db-alert-item">
                  <FaLayerGroup size={11} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                  <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dueCards.length} flashcard</span> đến hạn ôn tập</div>
                </div>
              )}
              <div className="db-alert-item">
                <FaCircleCheck size={11} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{completedLessonCount}/{lessonCount}</span> bài học đã hoàn tất</div>
              </div>
            </div>
          </div>

          {/* Skill stats */}
          <div className="db-skill-card">
            <div className="db-card-header">
              <FaChartLine size={14} style={{ color: 'var(--primary)' }} />
              <h2 className="db-card-title">Điểm kỹ năng</h2>
              <Link href={`/${locale}/${recommendedLang}/levels`} className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>Làm thêm →</Link>
            </div>
            <div className="db-skill-grid">
              {skillStats.map(skill => (
                <div key={skill.key} className="db-skill-item">
                  <div className="db-skill-icon"><SkillIcon skill={skill.key} size={16} /></div>
                  <div className="db-skill-name">{skill.label}</div>
                  <div className="db-skill-count">{skill.done} đề</div>
                  {skill.avg !== null
                    ? <div className="db-skill-score" style={skill.avg >= 60 ? { background: '#DCFCE7', color: '#166534' } : { background: '#FEE2E2', color: '#B91C1C' }}>{skill.avg}%</div>
                    : <div className="db-skill-score" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>—</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommendations ─── */}
      {weakSkill?.key === 'nghe' && listeningRecs.length > 0 && (
        <section className="db-rec-section">
          <div className="db-card-header mb-4">
            <FaHeadphones size={14} style={{ color: '#2563EB' }} />
            <h2 className="db-card-title">Bài nghe gợi ý cho {recommendedLevelCode}</h2>
            <Link href={`/${locale}/${recommendedLang}/listening?level=${recommendedLevelCode}`} className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>Xem tất cả →</Link>
          </div>
          <div className="db-rec-grid">
            {listeningRecs.map(item => (
              <Link key={item.id} href={`/${locale}/${recommendedLang}/listening?level=${item.level}&practice=${item.id}`} className="db-rec-card">
                <div className="db-rec-meta">{item.level} · {item.mondai}</div>
                <div className="db-rec-title">{item.title}</div>
                <div className="db-rec-sub">{item.summary}</div>
                <div className="db-rec-focus">Trọng tâm: {item.focus}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {weakSkill?.key === 'doc' && readingRecs.length > 0 && (
        <section className="db-rec-section">
          <div className="db-card-header mb-4">
            <FaNewspaper size={14} style={{ color: '#F59E0B' }} />
            <h2 className="db-card-title">Bài đọc gợi ý cho {recommendedLevelCode}</h2>
            <Link href={`/${locale}/${recommendedLang}/reading?level=${recommendedLevelCode}`} className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>Xem tất cả →</Link>
          </div>
          <div className="db-rec-grid">
            {readingRecs.map((item: ReadingRecommendation) => (
              <Link key={item.id} href={`/${locale}/${recommendedLang}/reading/${item.id}`} className="db-rec-card">
                <div className="db-rec-meta">{item.level} · {item.type}</div>
                <div className="db-rec-title">{item.title}</div>
                {item.titleVi && <div className="db-rec-sub" style={{ color: 'var(--primary)' }}>{item.titleVi}</div>}
                {item.summary && <div className="db-rec-sub">{item.summary}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent sessions ─── */}
      <section className="db-history-section">
        <div className="db-card-header mb-4">
          <FaTrophy size={14} style={{ color: 'var(--primary)' }} />
          <h2 className="db-card-title">Lịch sử làm bài gần đây</h2>
          <Link href={`/${locale}/${recommendedLang}/levels`} className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>Làm thêm đề →</Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="db-empty">
            Bạn chưa làm bài thi nào.{' '}
            <Link href={`/${locale}/${recommendedLang}/levels`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Bắt đầu ngay →</Link>
          </div>
        ) : (
          <div className="db-session-list">
            {recentSessions.map(s => {
              const pct = s.totalQ > 0 ? Math.round((s.correctQ / s.totalQ) * 100) : 0;
              const good = pct >= 60;
              return (
                <div key={s.id} className="db-session-row">
                  <div className="db-session-icon"><SkillIcon skill={s.examSet.skill} size={16} /></div>
                  <div className="db-session-info">
                    <div className="db-session-title">{s.examSet.title}</div>
                    <div className="db-session-meta">{s.examSet.level.code} · {getSkillLabel(s.examSet.skill)} · {new Date(s.startedAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="db-session-score">
                    <span style={{ color: good ? '#059669' : '#DC2626', fontWeight: 700, fontSize: 18 }}>{pct}%</span>
                    <span className="db-session-qq">{s.correctQ}/{s.totalQ}</span>
                  </div>
                  <Link href={`/results/${s.id}`} className="db-btn-xs">Xem lại</Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
