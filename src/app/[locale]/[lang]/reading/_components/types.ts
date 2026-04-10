// ─── Types ────────────────────────────────────────────────────────────────────

export interface PassageSummary {
  id: string;
  title: string;
  titleVi: string | null;
  summary: string | null;
  level: string;
  type: string;
  source: string | null;
  tags: string | null;
  charCount: number;
  createdAt: string;
}

export interface PassageDetail extends PassageSummary {
  content: string;
  sourceUrl: string | null;
  pinyin?: string | null;
  translation?: string | null;
}

export interface ReadingStats {
  totalRead: number;
  streakDays: number;
  lastReadDate: string;
  readToday: number;
  readIds: string[];
}

export interface ComprehensionQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GrammarPoint {
  id: string;
  name: string;
  meaning: string;
  pattern: RegExp;
  highlight: string;
}

export interface GrammarMatch {
  id: string;
  name: string;
  meaning: string;
  level: string;
  highlight: string;
  example: string;
}

