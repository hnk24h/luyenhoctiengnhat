// Canonical listening domain types — shared across listening page, ListeningList, ListeningPlayer.

export interface Segment {
  speaker: string;
  text: string;
  pinyin?: string;
}

export interface GrammarPoint {
  pattern: string;
  reading: string | null;
  meaning: string;
  example: string;
  exampleReading: string | null;
  exampleVi: string;
  searchIn: string;
  levelCode: string;
  order: number;
  foundInText: boolean;
}

export interface ListeningPractice {
  id: string;
  lang: string;
  level: string;
  category: string;
  title: string;
  titleVi?: string | null;
  summary: string;
  situation: string;
  durationSec: number;
  focus: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  audioUrl?: string | null;
  segments: Segment[];
  grammarPoints: GrammarPoint[];
}

export interface LevelMeta {
  badgeBg: string;
  badgeText: string;
  accent: string;
  desc: string;
}

export interface LangConfig {
  speechLang: string;
  hasPinyin: boolean;
  categoryLabel: string;
  levelCodes: string[];
  accentColor: string;
  heroBg: string;
  heroTag: string;
  heroTitle: string;
  levelMeta: Record<string, LevelMeta>;
}
