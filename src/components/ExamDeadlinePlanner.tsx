'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaArrowRight, FaCalendarDays, FaChartLine, FaClock, FaFlagCheckered, FaFloppyDisk, FaListCheck } from 'react-icons/fa6';

interface PlannerLevel {
  code: string;
  name: string;
  description: string | null;
  examSetCount: number;
}

interface SavedExamPlan {
  targetLevelCode: string;
  examDate: string;
  daysLeftAtSave: number;
  weeksLeftAtSave: number;
  examsPerWeek: number;
  studySessionsPerWeek: number;
  reviewDays: number;
  updatedAt?: string;
}

function addWeeks(base: Date, weeks: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function todayInputValue() {
  return formatDateInput(new Date());
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function buildInitialLevel(levels: PlannerLevel[], queryLevel: string | null, savedPlan?: SavedExamPlan | null) {
  const normalizedQuery = queryLevel?.toUpperCase() ?? null;
  if (normalizedQuery && levels.some((level) => level.code === normalizedQuery)) return normalizedQuery;
  if (savedPlan?.targetLevelCode && levels.some((level) => level.code === savedPlan.targetLevelCode)) return savedPlan.targetLevelCode;
  return levels[0]?.code ?? 'N5';
}

function buildInitialDate(queryDate: string | null, savedPlan?: SavedExamPlan | null) {
  if (queryDate && isValidDateInput(queryDate)) return queryDate;
  if (savedPlan?.examDate && isValidDateInput(savedPlan.examDate)) return savedPlan.examDate;
  return formatDateInput(addWeeks(new Date(), 8));
}

export function ExamDeadlinePlanner({
  levels,
  canSave,
  savedPlan,
}: {
  levels: PlannerLevel[];
  canSave: boolean;
  savedPlan?: SavedExamPlan | null;
}) {
  const searchParams = useSearchParams();
  const queryLevel = searchParams.get('planLevel');
  const queryDate = searchParams.get('examDate');
  const [targetLevel, setTargetLevel] = useState(() => buildInitialLevel(levels, queryLevel, savedPlan));
  const [examDate, setExamDate] = useState(() => buildInitialDate(queryDate, savedPlan));
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setTargetLevel(buildInitialLevel(levels, queryLevel, savedPlan));
    setExamDate(buildInitialDate(queryDate, savedPlan));
  }, [levels, queryDate, queryLevel, savedPlan]);

  const selectedLevel = levels.find((level) => level.code === targetLevel) ?? levels[0] ?? null;

  const plan = useMemo(() => {
    if (!selectedLevel) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(`${examDate}T00:00:00`);
    const diffMs = target.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
    const examSetCount = Math.max(1, selectedLevel.examSetCount || 1);
    const examsPerWeek = clamp(Math.ceil(examSetCount / weeksLeft), 1, examSetCount);
    const studySessionsPerWeek = clamp(examsPerWeek + 2, 3, 6);
    const reviewDays = clamp(Math.ceil(daysLeft / Math.max(1, examSetCount)), 2, 7);

    return {
      isPast: daysLeft <= 0,
      daysLeft,
      weeksLeft,
      examSetCount,
      examsPerWeek,
      studySessionsPerWeek,
      reviewDays,
    };
  }, [examDate, selectedLevel]);

  return (
    <section id="deadline-planner" className="rounded-[28px] border p-5 sm:p-6 mb-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
      <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-6 items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold mb-4"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FaCalendarDays size={14} /> Chế độ ôn thi theo deadline
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Lập nhịp ôn tập theo ngày thi</h2>
          <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Chọn level mục tiêu và ngày thi dự kiến. Hệ thống sẽ gợi ý nhịp làm đề, số buổi học mỗi tuần và cách phân bổ ôn tập ngắn hạn.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Level mục tiêu
              </label>
              <select
                value={targetLevel}
                onChange={(event) => setTargetLevel(event.target.value)}
                className="input w-full">
                {levels.map((level) => (
                  <option key={level.code} value={level.code}>
                    {level.code} · {level.name || level.description || 'JLPT'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Ngày thi dự kiến
              </label>
              <input
                type="date"
                value={examDate}
                min={todayInputValue()}
                onChange={(event) => setExamDate(event.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
          {!selectedLevel || !plan ? null : plan.isPast ? (
            <div>
              <div className="text-sm font-semibold" style={{ color: '#B91C1C' }}>Ngày thi phải lớn hơn hôm nay</div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Hãy chọn một deadline trong tương lai để hệ thống tính nhịp ôn thi phù hợp.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Kế hoạch đề xuất</div>
                  <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{selectedLevel.code} trong {plan.weeksLeft} tuần</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{plan.daysLeft}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ngày còn lại</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <FaFlagCheckered size={13} style={{ color: 'var(--primary)' }} /> Bộ đề hiện có
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{plan.examSetCount}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <FaChartLine size={13} style={{ color: '#2563EB' }} /> Đề mỗi tuần
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{plan.examsPerWeek}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <FaClock size={13} style={{ color: '#D97706' }} /> Buổi học mỗi tuần
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{plan.studySessionsPerWeek}</div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <FaListCheck size={13} style={{ color: '#059669' }} /> Chu kỳ ôn đề
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{plan.reviewDays} ngày</div>
                </div>
              </div>

              <div className="rounded-[22px] p-4" style={{ background: 'var(--primary-light)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nhịp ôn gợi ý</div>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div>1. Mỗi tuần làm khoảng {plan.examsPerWeek} bộ đề của level {selectedLevel.code}.</div>
                  <div>2. Giữ {plan.studySessionsPerWeek} buổi học ngắn để ôn từ vựng, bài học và flashcards.</div>
                  <div>3. Cứ mỗi {plan.reviewDays} ngày, xem lại lỗi sai và làm lại một đề gần nhất.</div>
                </div>
              </div>

              {savedPlan ? (
                <div className="rounded-[22px] p-4 mt-4 border" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Kế hoạch đã lưu</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {savedPlan.targetLevelCode} · thi ngày {savedPlan.examDate.split('-').reverse().join('/')} · {savedPlan.examsPerWeek} đề mỗi tuần.
                  </div>
                </div>
              ) : null}

              {saveError ? (
                <div className="text-sm mt-4" style={{ color: '#B91C1C' }}>{saveError}</div>
              ) : null}
              {saveMessage ? (
                <div className="text-sm mt-4" style={{ color: '#166534' }}>{saveMessage}</div>
              ) : null}

              <div className="flex flex-wrap gap-3 mt-5">
                <Link href={`/levels/${selectedLevel.code}`} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
                  Vào luyện thi {selectedLevel.code} <FaArrowRight size={12} />
                </Link>
                <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm">
                  Xem dashboard học tập
                </Link>
                {canSave ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSaveMessage(null);
                      setSaveError(null);

                      startTransition(async () => {
                        try {
                          const response = await fetch('/api/exam-plan', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              targetLevelCode: selectedLevel.code,
                              examDate,
                              daysLeftAtSave: plan.daysLeft,
                              weeksLeftAtSave: plan.weeksLeft,
                              examsPerWeek: plan.examsPerWeek,
                              studySessionsPerWeek: plan.studySessionsPerWeek,
                              reviewDays: plan.reviewDays,
                            }),
                          });

                          if (!response.ok) {
                            const payload = await response.json().catch(() => null);
                            throw new Error(payload?.error || 'Không thể lưu kế hoạch');
                          }

                          setSaveMessage('Đã lưu kế hoạch ôn thi vào tài khoản. Dashboard sẽ dùng mục tiêu này.');
                        } catch (error) {
                          setSaveError(error instanceof Error ? error.message : 'Không thể lưu kế hoạch');
                        }
                      });
                    }}
                    disabled={isPending}
                    className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    <FaFloppyDisk size={12} /> {isPending ? 'Đang lưu...' : 'Lưu kế hoạch'}
                  </button>
                ) : (
                  <Link href="/login" className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm">
                    <FaFloppyDisk size={12} /> Đăng nhập để lưu kế hoạch
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}