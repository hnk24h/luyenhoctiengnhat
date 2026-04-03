// Shared admin-layer types — use these instead of duplicating interface definitions across admin components.

export interface AdminLevel {
  id: string;
  code: string;
  name: string;
  subject: string;
  order: number;
}

export interface AdminCategory {
  id: string;
  levelId: string;
  skill: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  level: { code: string; name: string };
  _count: { lessons: number };
}

export interface AdminExamSet {
  id: string;
  title: string;
  description: string | null;
  lang: string;
  level: AdminLevel;
  _count: { questions: number };
}
