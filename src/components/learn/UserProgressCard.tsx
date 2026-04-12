'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaSeedling, FaLeaf, FaTree, FaFire } from 'react-icons/fa6';

interface StudyProfile {
  weeklyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

/** Growth stages mapped to streak ranges */
function getGrowthStage(streak: number): {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
} {
  if (streak >= 30) return { icon: <FaTree size={18} />, label: 'Đại thụ', color: '#15803D', bg: '#DCFCE7' };
  if (streak >= 14) return { icon: <FaTree size={16} />, label: 'Cây lớn', color: '#16A34A', bg: '#DCFCE7' };
  if (streak >= 7) return { icon: <FaLeaf size={16} />, label: 'Cây non', color: '#22C55E', bg: '#F0FDF4' };
  if (streak >= 3) return { icon: <FaSeedling size={15} />, label: 'Nảy mầm', color: '#4ADE80', bg: '#F0FDF4' };
  return { icon: <FaSeedling size={14} />, label: 'Hạt giống', color: '#86EFAC', bg: '#F0FDF4' };
}

interface UserProgressCardProps {
  collapsed?: boolean;
}

export const UserProgressCard: React.FC<UserProgressCardProps> = ({ collapsed = false }) => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudyProfile | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/study-profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.profile) setProfile(data.profile); })
      .catch(() => {});
  }, [session?.user?.id]);

  if (!session?.user) return null;

  const user = session.user;
  const streak = profile?.currentStreak ?? 0;
  const weeklyGoal = profile?.weeklyGoal ?? 7;
  // Simple progress: streak days / weekly goal as cycle progress
  const progressPercent = Math.min(100, Math.round((streak / Math.max(weeklyGoal, 1)) * 100));
  const growth = getGrowthStage(streak);
  const initials = (user.name ?? user.email ?? '?').charAt(0).toUpperCase();

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-3 px-1">
        {/* Avatar circle */}
        <div className="relative">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
            style={{ border: '2px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)' }}
            title={user.name ?? user.email ?? ''}
          >
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              initials
            )}
          </div>
          {/* Growth icon overlay */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: growth.bg, color: growth.color, border: '1.5px solid var(--bg-surface)' }}
            title={`${growth.label} · ${streak} ngày streak`}
          >
            <span className="scale-[0.55]">{growth.icon}</span>
          </div>
        </div>
        {/* Mini progress ring */}
        <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0" aria-label={`${progressPercent}%`}>
          <circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle cx="14" cy="14" r="11" fill="none" stroke={growth.color} strokeWidth="2.5"
            strokeDasharray={`${(progressPercent / 100) * 69.1} 69.1`}
            strokeLinecap="round" transform="rotate(-90 14 14)" className="transition-all duration-500" />
          <text x="14" y="14" textAnchor="middle" dominantBaseline="central"
            fill="var(--text-muted)" fontSize="8" fontWeight="700">{streak}</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-2.5">
        {/* Avatar with progress ring */}
        <div className="relative shrink-0">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="19" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="22" cy="22" r="19" fill="none" stroke={growth.color} strokeWidth="2.5"
              strokeDasharray={`${(progressPercent / 100) * 119.4} 119.4`}
              strokeLinecap="round" transform="rotate(-90 22 22)" className="transition-all duration-500" />
          </svg>
          <div
            className="absolute inset-[5px] rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              initials
            )}
          </div>
          {/* Growth stage icon */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: growth.bg, color: growth.color, border: '2px solid var(--bg-surface)' }}
          >
            <span className="scale-[0.6]">{growth.icon}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {user.name ?? user.email ?? 'Bạn'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span style={{ color: growth.color }} className="flex items-center gap-0.5 text-[10px] font-semibold">
              {growth.icon} {growth.label}
            </span>
            {streak > 0 && (
              <>
                <span className="text-[9px]" style={{ color: 'var(--border)' }}>·</span>
                <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                  <FaFire size={8} style={{ color: streak >= 3 ? '#EF4444' : '#F59E0B' }} />
                  {streak} ngày
                </span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: growth.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
