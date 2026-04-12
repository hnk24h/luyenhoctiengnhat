'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { AdminButton, AdminSpinner } from '@/components/admin/ui';
import {
  listLevels, listLessonsForLevel,
  getUserAccess, grantAccess, revokeAccess,
} from '@/services/admin/userService';
import type { UserRow, LevelOption, LessonRow, AccessTier } from '@/types/admin/user';

const SKILLS = [
  { value: 'doc',      label: 'Đọc' },
  { value: 'nghe',     label: 'Nghe' },
  { value: 'ngu_phap', label: 'Ngữ pháp' },
  { value: 'tu_vung',  label: 'Từ vựng' },
  { value: 'viet',     label: 'Viết' },
  { value: 'noi',      label: 'Nói' },
];

const TIERS: { value: AccessTier; label: string }[] = [
  { value: 'free',    label: 'Free' },
  { value: 'basic',   label: 'Basic' },
  { value: 'premium', label: 'Premium' },
];

interface Props {
  user: UserRow | null;
  onClose: () => void;
}

export default function UserAccessModal({ user, onClose }: Props) {
  const [levels, setLevels]           = useState<LevelOption[]>([]);
  const [lessons, setLessons]         = useState<LessonRow[]>([]);
  const [selectedLevel, setLevel]     = useState('');
  const [selectedSkill, setSkill]     = useState('');
  const [selectedTier, setTier]       = useState<AccessTier>('free');
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [accessList, setAccessList]   = useState<unknown[]>([]);

  // Load levels + current access list when user changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([listLevels(), getUserAccess(user.id)])
      .then(([lvls, acc]) => {
        setLevels(lvls);
        setAccessList(acc);
        setLevel('');
        setSkill('');
        setLessons([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Re-fetch lessons when level/skill changes
  const loadLessons = useCallback(async (levelId: string, skill: string) => {
    if (!levelId) { setLessons([]); return; }
    setLoading(true);
    try {
      setLessons(await listLessonsForLevel(levelId, skill));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLevelChange = (id: string) => {
    setLevel(id);
    setSkill('');
    loadLessons(id, '');
  };

  const handleSkillChange = (skill: string) => {
    setSkill(skill);
    loadLessons(selectedLevel, skill);
  };

  const toggleLesson = (id: string, checked: boolean) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, selected: checked } : l));
  };

  const handleSave = async () => {
    if (!user) return;
    const selected = lessons.filter(l => l.selected);
    if (!selected.length) return;
    setLoading(true);
    try {
      await Promise.all(
        selected.map(l =>
          grantAccess({ userId: user.id, lessonId: l.id, tier: selectedTier }),
        ),
      );
      // Refresh
      setAccessList(await getUserAccess(user.id));
      setLessons(prev => prev.map(l => ({ ...l, selected: false })));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (lessonId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await revokeAccess(user.id, lessonId);
      setAccessList(await getUserAccess(user.id));
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedCount = lessons.filter(l => l.selected).length;

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Cấp quyền bài học
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {user.name} · {user.email}
            </p>
          </div>
          <AdminButton variant="ghost" size="sm" onClick={onClose}>
            <FaXmark size={14} />
          </AdminButton>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b shrink-0 space-y-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
          {/* Row 1: Level + Skill */}
          <div className="flex gap-2">
            <select
              className="input flex-1 min-w-0 text-sm"
              value={selectedLevel}
              onChange={e => handleLevelChange(e.target.value)}
            >
              <option value="">-- Cấp độ --</option>
              {levels.map(lv => (
                <option key={lv.id} value={lv.id}>{lv.code} · {lv.name}</option>
              ))}
            </select>

            <select
              className="input flex-1 min-w-0 text-sm"
              value={selectedSkill}
              onChange={e => handleSkillChange(e.target.value)}
              disabled={!selectedLevel}
            >
              <option value="">-- Skill --</option>
              {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Row 2: Tier */}
          <select
            className="input w-full text-sm"
            value={selectedTier}
            onChange={e => setTier(e.target.value as AccessTier)}
          >
            {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Search + Save bar */}
        <div className="flex items-center gap-2 px-5 py-2 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <input
            className="input flex-1 text-sm"
            placeholder="Tìm bài học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <AdminButton
            size="sm"
            disabled={selectedCount === 0 || loading}
            loading={loading}
            onClick={handleSave}
          >
            Cấp quyền{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </AdminButton>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <AdminSpinner label="Đang tải..." />
            </div>
          ) : filteredLessons.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              {selectedLevel ? 'Không có bài học nào' : 'Chọn cấp độ để xem bài học'}
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredLessons.map(l => (
                <li key={l.id}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-black/[.03]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                    checked={!!l.selected}
                    onChange={e => toggleLesson(l.id, e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {l.title}
                    </div>
                    {l.description && (
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {l.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs shrink-0 px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {l.selectedTier ?? 'free'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Granted access list */}
        {accessList.length > 0 && (
          <div className="border-t px-5 py-3 shrink-0" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Đã cấp quyền ({accessList.length})
            </p>
            <div className="max-h-28 overflow-y-auto space-y-1">
              {(accessList as any[]).map((a: any) => (
                <div key={a.id ?? a.lessonId}
                  className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                    {a.lesson?.title ?? a.lessonId}
                  </span>
                  <button
                    className="shrink-0 px-1.5 py-0.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => handleRevoke(a.lessonId ?? a.lesson?.id)}
                  >
                    Thu hồi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
