"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { ExamSidebarClient } from '@/components/learn/ExamSidebarClient';
import { LevelBottomBarClient } from '@/components/learn/LevelBottomBarClient';
import LevelPostsSection, { type LevelPostData } from '@/components/LevelPostsSection';
import { FaRegFile } from 'react-icons/fa6';

const SKILL_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  nghe:    { label: 'Nghe',     icon: '🎧', color: '#2563EB', bg: '#EFF6FF' },
  doc:     { label: 'Đọc',     icon: '📖', color: '#D97706', bg: '#FFFBEB' },
  viet:    { label: 'Viết',    icon: '✏️', color: '#7C3AED', bg: '#F5F3FF' },
  noi:     { label: 'Nói',     icon: '🎤', color: '#059669', bg: '#F0FDF4' },
  vocab:   { label: 'Từ vựng', icon: '📝', color: '#DC2626', bg: '#FFF1F2' },
  grammar: { label: 'Ngữ pháp',icon: '📐', color: '#0891B2', bg: '#ECFEFF' },
};

export default function ClientPage({
  params,
  level,
  LEVELS_OBJ,
  SKILLS,
  userId,
  session,
  progressMap,
  totalSets,
  totalDone,
  totalPct,
  bySkill,
  posts,
}: any) {
  const [selectedSkill, setSelectedSkill] = useState(SKILLS[0].key);
  return (
    <LearnLayout
      sidebarProps={{
        customSidebar: (
          <ExamSidebarClient
            lang={params.lang}
            selectedLevel={level.code}
            levels={LEVELS_OBJ}
            selectedSkill={selectedSkill}
            skills={SKILLS}
            examSets={level.examSets.map((e: any) => ({ id: e.id, title: e.title, skill: e.skill }))}
            onSkillChange={setSelectedSkill}
          />
        ),
      }}
      bottomBarProps={undefined}
    >
      {/* Bottom bar client component (mobile/tablet) */}
      <LevelBottomBarClient
        levels={LEVELS_OBJ}
        skills={SKILLS}
        initialLevel={level.code}
        initialSkill={selectedSkill}
      />
      {/* Header */}
      <div className="mb-6">
        <LearnHeader icon={<FaRegFile />} title={`Luyện thi ${level.code} - ${level.desc || ''}`} subtitle={level.name} />
        {/* Stat pills */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>{totalSets} đề thi</span>
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>{Object.keys(bySkill).length} kỹ năng</span>
          {userId && totalDone > 0 && (
            <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{totalDone}/{totalSets} hoàn thành</span>
          )}
        </div>
      </div>

      {/* Filter kỹ năng (hiển thị cho mobile/tablet, desktop đã có sidebar) */}
      <div className="mb-4 md:hidden flex gap-2 overflow-x-auto">
        {SKILLS.map((skill: any) => (
          <button
            key={skill.key}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-border ${selectedSkill === skill.key ? 'bg-primary text-white' : 'bg-muted text-ink-primary'}`}
            onClick={() => setSelectedSkill(skill.key)}
          >
            <span>{skill.icon}</span>
            <span>{skill.label}</span>
          </button>
        ))}
      </div>

      {/* Danh sách bài thi dạng card, chỉ hiển thị theo kỹ năng đã chọn */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {level.examSets.filter((e: any) => e.skill === selectedSkill).length === 0 ? (
          <div className="col-span-full text-ink-muted text-center py-8">Không có đề thi cho kỹ năng này.</div>
        ) : (
          level.examSets.filter((e: any) => e.skill === selectedSkill).map((e: any) => (
            <div key={e.id} className="rounded-xl border border-border bg-white shadow-sm p-4 flex flex-col gap-2 transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{SKILL_INFO[e.skill]?.icon || '📋'}</span>
                <span className="font-bold text-sm text-ink-primary flex-1">{e.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                <span>{SKILL_INFO[e.skill]?.label || e.skill}</span>
                <span>• {e._count?.questions || 0} câu hỏi</span>
                {e.timeLimit && <span>• {e.timeLimit} phút</span>}
              </div>
              <Link href={`/${params.lang}/exam/${e.id}`} className="mt-auto inline-block px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs text-center transition-all hover:brightness-110">Làm bài</Link>
            </div>
          ))
        )}
      </div>
      {/* Community posts */}
      <LevelPostsSection
        levelCode={level.code}
        initialPosts={posts}
        userId={userId}
        userName={(session?.user as { name?: string } | undefined)?.name ?? undefined}
      />
    </LearnLayout>
  );
}