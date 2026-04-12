'use client';

import React from 'react';
import { FaCircle } from 'react-icons/fa6';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** Show a small dot before the label */
  dot?: boolean;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--bg-muted)',     color: 'var(--text-secondary)' },
  success: { bg: '#D1FAE5',            color: '#059669' },
  warning: { bg: '#FEF3C7',            color: '#D97706' },
  danger:  { bg: '#FEE2E2',            color: '#DC2626' },
  info:    { bg: '#DBEAFE',            color: '#2563EB' },
  muted:   { bg: 'var(--bg-muted)',     color: 'var(--text-muted)' },
};

export default function AdminBadge({ children, variant = 'default', dot, className = '' }: AdminBadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span
      className={`admin-badge ${className}`}
      style={{ background: v.bg, color: v.color }}
    >
      {dot && <FaCircle size={5} />}
      {children}
    </span>
  );
}

/* ── Status Badge (for ContentStatus) ────────────────────────────────────── */

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  draft:     { label: 'Nháp',     variant: 'warning' },
  published: { label: 'Xuất bản', variant: 'success' },
  archived:  { label: 'Lưu trữ', variant: 'muted' },
};

interface StatusBadgeProps {
  status: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <AdminBadge variant={cfg.variant} dot className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}>
      {onClick ? <button type="button" onClick={onClick} className="bg-transparent border-none p-0 font-inherit color-inherit cursor-pointer">{cfg.label}</button> : cfg.label}
    </AdminBadge>
  );
}

/* ── Skill Badge ─────────────────────────────────────────────────────────── */

const SKILL_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon: string }> = {
  vocab:   { label: 'Từ vựng',  variant: 'info',    icon: '📖' },
  grammar: { label: 'Ngữ pháp', variant: 'success', icon: '📝' },
  doc:     { label: 'Đọc',      variant: 'warning', icon: '📚' },
  nghe:    { label: 'Nghe',     variant: 'info',    icon: '🎧' },
  noi:     { label: 'Nói',      variant: 'success', icon: '🎤' },
  viet:    { label: 'Viết',     variant: 'default', icon: '✍️' },
};

export function SkillBadge({ skill }: { skill: string }) {
  const cfg = SKILL_CONFIG[skill] ?? { label: skill, variant: 'default' as BadgeVariant, icon: '📋' };
  return (
    <AdminBadge variant={cfg.variant}>
      <span className="mr-0.5">{cfg.icon}</span> {cfg.label}
    </AdminBadge>
  );
}

/* ── Level Badge ─────────────────────────────────────────────────────────── */

export function LevelBadge({ code }: { code: string }) {
  const isN = code.startsWith('N');
  return (
    <AdminBadge variant={isN ? 'danger' : 'info'}>
      {code}
    </AdminBadge>
  );
}
