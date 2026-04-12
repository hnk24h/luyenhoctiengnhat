/**
 * JLPT & BJT full mock exam section configurations.
 * Defines the standard exam structure per level.
 */

export interface SectionTemplate {
  skill: string;       // "vocab" | "grammar_reading" | "listening" | "reading" | "integrated"
  title: string;       // Japanese section title
  titleVi: string;     // Vietnamese section title
  timeLimit: number;   // seconds
  parts: string[];     // sub-parts (問題1, 問題2, ...)
}

export interface ExamTemplate {
  subject: 'JLPT' | 'BJT';
  levelCode: string;
  totalTime: number;   // total seconds
  sections: SectionTemplate[];
}

// ─── JLPT Exam Templates ────────────────────────────────────────────────────

export const JLPT_TEMPLATES: Record<string, ExamTemplate> = {
  N5: {
    subject: 'JLPT', levelCode: 'N5', totalTime: 105 * 60,
    sections: [
      {
        skill: 'vocab', title: '言語知識（文字・語彙）', titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng)',
        timeLimit: 25 * 60,
        parts: ['問題1 漢字読み', '問題2 表記', '問題3 文脈規定', '問題4 言い換え類義'],
      },
      {
        skill: 'grammar_reading', title: '言語知識（文法）・読解', titleVi: 'Kiến thức ngôn ngữ (Ngữ pháp)・Đọc hiểu',
        timeLimit: 50 * 60,
        parts: ['問題1 文法形式の判断', '問題2 文の組み立て', '問題3 文章の文法', '問題4 内容理解（短文）', '問題5 内容理解（中文）'],
      },
      {
        skill: 'listening', title: '聴解', titleVi: 'Nghe hiểu',
        timeLimit: 30 * 60,
        parts: ['問題1 課題理解', '問題2 ポイント理解', '問題3 発話表現', '問題4 即時応答'],
      },
    ],
  },
  N4: {
    subject: 'JLPT', levelCode: 'N4', totalTime: 125 * 60,
    sections: [
      {
        skill: 'vocab', title: '言語知識（文字・語彙）', titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng)',
        timeLimit: 30 * 60,
        parts: ['問題1 漢字読み', '問題2 表記', '問題3 文脈規定', '問題4 言い換え類義', '問題5 用法'],
      },
      {
        skill: 'grammar_reading', title: '言語知識（文法）・読解', titleVi: 'Kiến thức ngôn ngữ (Ngữ pháp)・Đọc hiểu',
        timeLimit: 60 * 60,
        parts: ['問題1 文法形式の判断', '問題2 文の組み立て', '問題3 文章の文法', '問題4 内容理解（短文）', '問題5 内容理解（中文）', '問題6 情報検索'],
      },
      {
        skill: 'listening', title: '聴解', titleVi: 'Nghe hiểu',
        timeLimit: 35 * 60,
        parts: ['問題1 課題理解', '問題2 ポイント理解', '問題3 発話表現', '問題4 即時応答'],
      },
    ],
  },
  N3: {
    subject: 'JLPT', levelCode: 'N3', totalTime: 140 * 60,
    sections: [
      {
        skill: 'vocab', title: '言語知識（文字・語彙）', titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng)',
        timeLimit: 30 * 60,
        parts: ['問題1 漢字読み', '問題2 表記', '問題3 文脈規定', '問題4 言い換え類義', '問題5 用法'],
      },
      {
        skill: 'grammar_reading', title: '言語知識（文法）・読解', titleVi: 'Kiến thức ngôn ngữ (Ngữ pháp)・Đọc hiểu',
        timeLimit: 70 * 60,
        parts: ['問題1 文法形式の判断', '問題2 文の組み立て', '問題3 文章の文法', '問題4 内容理解（短文）', '問題5 内容理解（中文）', '問題6 内容理解（長文）', '問題7 情報検索'],
      },
      {
        skill: 'listening', title: '聴解', titleVi: 'Nghe hiểu',
        timeLimit: 40 * 60,
        parts: ['問題1 課題理解', '問題2 ポイント理解', '問題3 概要理解', '問題4 発話表現', '問題5 即時応答'],
      },
    ],
  },
  N2: {
    subject: 'JLPT', levelCode: 'N2', totalTime: 155 * 60,
    sections: [
      {
        skill: 'vocab', title: '言語知識（文字・語彙）', titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng)',
        timeLimit: 25 * 60,
        parts: ['問題1 漢字読み', '問題2 表記', '問題3 語形成', '問題4 文脈規定', '問題5 言い換え類義', '問題6 用法'],
      },
      {
        skill: 'grammar_reading', title: '言語知識（文法）・読解', titleVi: 'Kiến thức ngôn ngữ (Ngữ pháp)・Đọc hiểu',
        timeLimit: 105 * 60,
        parts: ['問題7 文法形式の判断', '問題8 文の組み立て', '問題9 文章の文法', '問題10 内容理解（短文）', '問題11 内容理解（中文）', '問題12 統合理解', '問題13 主張理解（長文）', '問題14 情報検索'],
      },
      {
        skill: 'listening', title: '聴解', titleVi: 'Nghe hiểu',
        timeLimit: 50 * 60,
        parts: ['問題1 課題理解', '問題2 ポイント理解', '問題3 概要理解', '問題4 即時応答', '問題5 統合理解'],
      },
    ],
  },
  N1: {
    subject: 'JLPT', levelCode: 'N1', totalTime: 170 * 60,
    sections: [
      {
        skill: 'vocab', title: '言語知識（文字・語彙）', titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng)',
        timeLimit: 25 * 60,
        parts: ['問題1 漢字読み', '問題2 文脈規定', '問題3 言い換え類義', '問題4 用法'],
      },
      {
        skill: 'grammar_reading', title: '言語知識（文法）・読解', titleVi: 'Kiến thức ngôn ngữ (Ngữ pháp)・Đọc hiểu',
        timeLimit: 110 * 60,
        parts: ['問題5 文法形式の判断', '問題6 文の組み立て', '問題7 文章の文法', '問題8 内容理解（短文）', '問題9 内容理解（中文）', '問題10 内容理解（長文）', '問題11 統合理解', '問題12 主張理解', '問題13 情報検索'],
      },
      {
        skill: 'listening', title: '聴解', titleVi: 'Nghe hiểu',
        timeLimit: 55 * 60,
        parts: ['問題1 課題理解', '問題2 ポイント理解', '問題3 概要理解', '問題4 即時応答', '問題5 統合理解'],
      },
    ],
  },
};

// ─── BJT Exam Template ──────────────────────────────────────────────────────

export const BJT_TEMPLATE: ExamTemplate = {
  subject: 'BJT', levelCode: 'BJT', totalTime: 120 * 60,
  sections: [
    {
      skill: 'listening', title: '聴解テスト', titleVi: 'Phần nghe',
      timeLimit: 50 * 60,
      parts: ['Part 1 描写問題', 'Part 2 応答問題', 'Part 3 会話問題', 'Part 4 説明問題'],
    },
    {
      skill: 'integrated', title: '聴読解テスト', titleVi: 'Phần nghe đọc tích hợp',
      timeLimit: 30 * 60,
      parts: ['Part 5 ビジュアル問題', 'Part 6 聴読解総合問題'],
    },
    {
      skill: 'reading', title: '読解テスト', titleVi: 'Phần đọc hiểu',
      timeLimit: 40 * 60,
      parts: ['Part 7 語彙・文法問題', 'Part 8 表現力問題', 'Part 9 読解問題', 'Part 10 複合問題'],
    },
  ],
};

// ─── BJT Level Descriptions ──────────────────────────────────────────────────

export const BJT_LEVELS = [
  { code: 'J1+', label: 'J1+', desc: 'Cao nhất (600+)', scoreRange: '600-800' },
  { code: 'J1',  label: 'J1',  desc: 'Cao cấp (530-599)', scoreRange: '530-599' },
  { code: 'J2',  label: 'J2',  desc: 'Trung cao cấp (420-529)', scoreRange: '420-529' },
  { code: 'J3',  label: 'J3',  desc: 'Trung cấp (320-419)', scoreRange: '320-419' },
  { code: 'J4',  label: 'J4',  desc: 'Sơ trung cấp (200-319)', scoreRange: '200-319' },
  { code: 'J5',  label: 'J5',  desc: 'Sơ cấp (0-199)', scoreRange: '0-199' },
];

export function getExamTemplate(subject: 'JLPT' | 'BJT', levelCode: string): ExamTemplate | null {
  if (subject === 'BJT') return BJT_TEMPLATE;
  return JLPT_TEMPLATES[levelCode] ?? null;
}
