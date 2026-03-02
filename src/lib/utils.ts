export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const SKILLS = [
  { key: 'nghe', label: 'Nghe', icon: '🎧', color: 'bg-blue-100 text-blue-700' },
  { key: 'noi', label: 'Nói', icon: '🎤', color: 'bg-green-100 text-green-700' },
  { key: 'doc', label: 'Đọc', icon: '📖', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'viet', label: 'Viết', icon: '✏️', color: 'bg-purple-100 text-purple-700' },
] as const;

export type SkillKey = 'nghe' | 'noi' | 'doc' | 'viet';

export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type LevelCode = (typeof LEVELS)[number];

export function getSkillLabel(key: string) {
  return SKILLS.find(s => s.key === key)?.label ?? key;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
