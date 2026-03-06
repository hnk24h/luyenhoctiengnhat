'use client';

import { useState, useTransition } from 'react';
import { FaBullseye, FaFireFlameCurved, FaFloppyDisk } from 'react-icons/fa6';

export function DashboardWeeklyGoalEditor({
  initialGoal,
  currentStreak,
  longestStreak,
}: {
  initialGoal: number;
  currentStreak: number;
  longestStreak: number;
}) {
  const [weeklyGoal, setWeeklyGoal] = useState(initialGoal);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[22px] border p-4 mt-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
      <div className="grid sm:grid-cols-[1fr,auto] gap-4 items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <FaBullseye size={13} style={{ color: 'var(--primary)' }} /> Mục tiêu cá nhân
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Bạn đang có streak {currentStreak} ngày. Kỷ lục hiện tại là {longestStreak} ngày liên tiếp.
          </div>
          <div className="flex items-center gap-2 text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            <FaFireFlameCurved size={12} style={{ color: '#EA580C' }} /> Streak được tính từ bài học hoàn thành, flashcard đã ôn và đề đã làm.
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <input
            type="number"
            min={3}
            max={50}
            value={weeklyGoal}
            onChange={(event) => setWeeklyGoal(Number(event.target.value) || 3)}
            className="input w-24"
          />
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);

              startTransition(async () => {
                try {
                  const res = await fetch('/api/study-profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weeklyGoal }),
                  });

                  if (!res.ok) {
                    const payload = await res.json().catch(() => null);
                    throw new Error(payload?.error || 'Không thể lưu mục tiêu tuần');
                  }

                  setMessage('Đã lưu mục tiêu tuần mới.');
                } catch (requestError) {
                  setError(requestError instanceof Error ? requestError.message : 'Không thể lưu mục tiêu tuần');
                }
              });
            }}
            disabled={isPending}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            <FaFloppyDisk size={12} /> {isPending ? 'Đang lưu...' : 'Lưu goal'}
          </button>
        </div>
      </div>

      {message ? <div className="text-sm mt-3" style={{ color: '#166534' }}>{message}</div> : null}
      {error ? <div className="text-sm mt-3" style={{ color: '#B91C1C' }}>{error}</div> : null}
    </div>
  );
}