/**
 * Seed: JLPT Mock Exams — cấu trúc thực tế 100% theo đề thi JLPT năm 2025
 * Tất cả 5 cấp độ N5–N1, mỗi đề chia 2 phần:
 *   Section 1: 言語知識（文字・語彙・文法）・読解
 *   Section 2: 聴解
 *
 * Run: npx tsx prisma/seed-mock-exam-jlpt.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface PartDef {
  partLabel: string;   // e.g. "問題1"
  partTitle: string;   // e.g. "漢字読み"
  partTitleVi: string; // Vietnamese translation
  count: number;       // number of questions
  instruction: string; // directions text shown before questions
}

interface SectionDef {
  title: string;
  titleVi: string;
  skill: 'grammar_reading' | 'listening';
  timeLimitMin: number;
  parts: PartDef[];
}

interface ExamDef {
  levelCode: string;
  totalTimeMin: number;
  sections: [SectionDef, SectionDef]; // always [lang+reading, listening]
}

// ─────────────────────────────────────────────────────────────
//  JLPT 2025 Exam Definitions — số lượng câu hỏi giống thật 100%
// ─────────────────────────────────────────────────────────────

const EXAMS: ExamDef[] = [
  // ══════════════════════════════════════════════════════════
  //  N5 — 総合105分
  //  Sec1: 75分  (25分 文字語彙 + 50分 文法読解)
  //  Sec2: 30分  聴解
  // ══════════════════════════════════════════════════════════
  {
    levelCode: 'N5',
    totalTimeMin: 105,
    sections: [
      {
        title: '言語知識（文字・語彙・文法）・読解',
        titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng・Ngữ pháp)・Đọc hiểu',
        skill: 'grammar_reading',
        timeLimitMin: 75,
        parts: [
          // ── 文字・語彙 ──
          {
            partLabel: '問題1', partTitle: '漢字読み', partTitleVi: 'Đọc cách đọc Hán tự',
            count: 12,
            instruction: '＿の言葉の読み方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題2', partTitle: '表記', partTitleVi: 'Chính tả',
            count: 8,
            instruction: '＿の言葉を漢字で書くとき、最もよいものを1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題3', partTitle: '文脈規定', partTitleVi: 'Điền từ theo ngữ cảnh',
            count: 10,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題4', partTitle: '言い換え類義', partTitleVi: 'Từ đồng nghĩa',
            count: 5,
            instruction: '＿の文と だいたい同じ意味の文はどれですか。1・2・3・4から最もよいものを一つえらびなさい。',
          },
          // ── 文法 ──
          {
            partLabel: '問題5', partTitle: '文法形式の判断', partTitleVi: 'Ngữ pháp - Chọn hình thức đúng',
            count: 16,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題6', partTitle: '文の組み立て', partTitleVi: 'Sắp xếp câu',
            count: 5,
            instruction: '次の文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題7', partTitle: '文章の文法', partTitleVi: 'Ngữ pháp trong đoạn văn',
            count: 5,
            instruction: '次の文章を読んで、文章全体の内容を考えて、（　）に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 読解 ──
          {
            partLabel: '問題8', partTitle: '内容理解（短文）', partTitleVi: 'Đọc hiểu đoạn ngắn',
            count: 3,
            instruction: '次の（1）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題9', partTitle: '内容理解（中文）', partTitleVi: 'Đọc hiểu đoạn vừa',
            count: 2,
            instruction: '次の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
        ],
      },
      {
        title: '聴解',
        titleVi: 'Nghe hiểu',
        skill: 'listening',
        timeLimitMin: 30,
        parts: [
          {
            partLabel: '問題1', partTitle: '課題理解', partTitleVi: 'Nghe hiểu nội dung hội thoại và chọn hành động',
            count: 7,
            instruction: 'まず話を聞いてください。それから、质問とせんたくしを聞いて、1から4の中から、正しい答えを一つえらんでください。',
          },
          {
            partLabel: '問題2', partTitle: 'ポイント理解', partTitleVi: 'Nghe và nắm bắt điểm mấu chốt',
            count: 6,
            instruction: 'まず質問を聞いてください。そのあと問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題3', partTitle: '発話表現', partTitleVi: 'Chọn câu nói phù hợp với tình huống',
            count: 5,
            instruction: '絵を見ながら質問を聞いてください。やじるし（→）の人は何と言いますか。1から3の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題4', partTitle: '即時応答', partTitleVi: 'Nghe và chọn câu trả lời phù hợp ngay',
            count: 6,
            instruction: '問題用紙に何もいんさつされていません。まず文を聞いてください。それから、そのへんじを聞いて、1から3の中から、最もよいものを一つえらんでください。',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  N4 — 総合125分
  //  Sec1: 90分  (30分 文字語彙 + 60分 文法読解)
  //  Sec2: 35分  聴解
  // ══════════════════════════════════════════════════════════
  {
    levelCode: 'N4',
    totalTimeMin: 125,
    sections: [
      {
        title: '言語知識（文字・語彙・文法）・読解',
        titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng・Ngữ pháp)・Đọc hiểu',
        skill: 'grammar_reading',
        timeLimitMin: 90,
        parts: [
          // ── 文字・語彙 ──
          {
            partLabel: '問題1', partTitle: '漢字読み', partTitleVi: 'Đọc cách đọc Hán tự',
            count: 9,
            instruction: '＿の言葉の読み方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題2', partTitle: '表記', partTitleVi: 'Chính tả',
            count: 6,
            instruction: '＿の言葉を漢字で書くとき、最もよいものを1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題3', partTitle: '文脈規定', partTitleVi: 'Điền từ theo ngữ cảnh',
            count: 10,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題4', partTitle: '言い換え類義', partTitleVi: 'Từ đồng nghĩa',
            count: 5,
            instruction: '＿の言葉に意味が最も近いものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題5', partTitle: '用法', partTitleVi: 'Cách dùng từ',
            count: 5,
            instruction: '次の言葉の使い方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 文法 ──
          {
            partLabel: '問題6', partTitle: '文法形式の判断', partTitleVi: 'Ngữ pháp - Chọn hình thức đúng',
            count: 15,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題7', partTitle: '文の組み立て', partTitleVi: 'Sắp xếp câu',
            count: 5,
            instruction: '次の文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題8', partTitle: '文章の文法', partTitleVi: 'Ngữ pháp trong đoạn văn',
            count: 5,
            instruction: '次の文章を読んで、文章全体の内容を考えて、（　）に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 読解 ──
          {
            partLabel: '問題9', partTitle: '内容理解（短文）', partTitleVi: 'Đọc hiểu đoạn ngắn',
            count: 4,
            instruction: '次の（1）から（2）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題10', partTitle: '内容理解（中文）', partTitleVi: 'Đọc hiểu đoạn vừa',
            count: 4,
            instruction: '次の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題11', partTitle: '情報検索', partTitleVi: 'Tìm kiếm thông tin',
            count: 2,
            instruction: '右のページを見て、下の質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
        ],
      },
      {
        title: '聴解',
        titleVi: 'Nghe hiểu',
        skill: 'listening',
        timeLimitMin: 35,
        parts: [
          {
            partLabel: '問題1', partTitle: '課題理解', partTitleVi: 'Nghe hiểu nội dung hội thoại và chọn hành động',
            count: 7,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、正しい答えを一つえらんでください。',
          },
          {
            partLabel: '問題2', partTitle: 'ポイント理解', partTitleVi: 'Nghe và nắm bắt điểm mấu chốt',
            count: 6,
            instruction: 'まず質問を聞いてください。そのあと問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題3', partTitle: '発話表現', partTitleVi: 'Chọn câu nói phù hợp với tình huống',
            count: 5,
            instruction: '絵を見ながら質問を聞いてください。やじるし（→）の人は何と言いますか。1から3の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題4', partTitle: '即時応答', partTitleVi: 'Nghe và chọn câu trả lời phù hợp ngay',
            count: 8,
            instruction: '問題用紙に何もいんさつされていません。まず文を聞いてください。それから、そのへんじを聞いて、1から3の中から、最もよいものを一つえらんでください。',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  N3 — 総合140分
  //  Sec1: 100分 (30分 文字語彙 + 70分 文法読解)
  //  Sec2: 40分  聴解
  // ══════════════════════════════════════════════════════════
  {
    levelCode: 'N3',
    totalTimeMin: 140,
    sections: [
      {
        title: '言語知識（文字・語彙・文法）・読解',
        titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng・Ngữ pháp)・Đọc hiểu',
        skill: 'grammar_reading',
        timeLimitMin: 100,
        parts: [
          // ── 文字・語彙 ──
          {
            partLabel: '問題1', partTitle: '漢字読み', partTitleVi: 'Đọc cách đọc Hán tự',
            count: 8,
            instruction: '＿の言葉の読み方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題2', partTitle: '表記', partTitleVi: 'Chính tả',
            count: 6,
            instruction: '＿の言葉を漢字で書くとき、最もよいものを1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題3', partTitle: '文脈規定', partTitleVi: 'Điền từ theo ngữ cảnh',
            count: 11,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題4', partTitle: '言い換え類義', partTitleVi: 'Từ đồng nghĩa',
            count: 5,
            instruction: '＿の言葉に意味が最も近いものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題5', partTitle: '用法', partTitleVi: 'Cách dùng từ',
            count: 5,
            instruction: '次の言葉の使い方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 文法 ──
          {
            partLabel: '問題6', partTitle: '文法形式の判断', partTitleVi: 'Ngữ pháp - Chọn hình thức đúng',
            count: 13,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題7', partTitle: '文の組み立て', partTitleVi: 'Sắp xếp câu',
            count: 5,
            instruction: '次の文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題8', partTitle: '文章の文法', partTitleVi: 'Ngữ pháp trong đoạn văn',
            count: 5,
            instruction: '次の文章を読んで、文章全体の内容を考えて、（　）に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 読解 ──
          {
            partLabel: '問題9', partTitle: '内容理解（短文）', partTitleVi: 'Đọc hiểu đoạn ngắn (150 chữ)',
            count: 8,
            instruction: '次の（1）から（4）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題10', partTitle: '内容理解（中文）', partTitleVi: 'Đọc hiểu đoạn vừa (350 chữ)',
            count: 6,
            instruction: '次の（1）から（2）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題11', partTitle: '内容理解（長文）', partTitleVi: 'Đọc hiểu đoạn dài (550 chữ)',
            count: 4,
            instruction: '次の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題12', partTitle: '情報検索', partTitleVi: 'Tìm kiếm thông tin (700 chữ)',
            count: 2,
            instruction: '右のページを見て、下の質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
        ],
      },
      {
        title: '聴解',
        titleVi: 'Nghe hiểu',
        skill: 'listening',
        timeLimitMin: 40,
        parts: [
          {
            partLabel: '問題1', partTitle: '課題理解', partTitleVi: 'Nghe hiểu nội dung hội thoại và chọn hành động',
            count: 6,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、正しい答えを一つえらんでください。',
          },
          {
            partLabel: '問題2', partTitle: 'ポイント理解', partTitleVi: 'Nghe và nắm bắt điểm mấu chốt',
            count: 6,
            instruction: 'まず質問を聞いてください。そのあと問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題3', partTitle: '概要理解', partTitleVi: 'Nghe và hiểu nội dung tổng quan',
            count: 3,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題4', partTitle: '発話表現', partTitleVi: 'Chọn câu nói phù hợp với tình huống',
            count: 4,
            instruction: '絵を見ながら質問を聞いてください。やじるし（→）の人は何と言いますか。1から3の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題5', partTitle: '即時応答', partTitleVi: 'Nghe và chọn câu trả lời phù hợp ngay',
            count: 9,
            instruction: '問題用紙に何もいんさつされていません。まず文を聞いてください。それから、そのへんじを聞いて、1から3の中から、最もよいものを一つえらんでください。',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  N2 — 総合155分
  //  Sec1: 105分 (文字語彙・文法・読解 合算)
  //  Sec2: 50分  聴解
  // ══════════════════════════════════════════════════════════
  {
    levelCode: 'N2',
    totalTimeMin: 155,
    sections: [
      {
        title: '言語知識（文字・語彙・文法）・読解',
        titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng・Ngữ pháp)・Đọc hiểu',
        skill: 'grammar_reading',
        timeLimitMin: 105,
        parts: [
          // ── 文字・語彙 ──
          {
            partLabel: '問題1', partTitle: '漢字読み', partTitleVi: 'Đọc cách đọc Hán tự',
            count: 5,
            instruction: '＿の言葉の読み方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題2', partTitle: '表記', partTitleVi: 'Chính tả',
            count: 5,
            instruction: '＿の言葉を漢字で書くとき、最もよいものを1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題3', partTitle: '語形成', partTitleVi: 'Cấu tạo từ (tiền tố / hậu tố)',
            count: 5,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題4', partTitle: '文脈規定', partTitleVi: 'Điền từ theo ngữ cảnh',
            count: 7,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題5', partTitle: '言い換え類義', partTitleVi: 'Từ đồng nghĩa',
            count: 5,
            instruction: '＿の言葉に意味が最も近いものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題6', partTitle: '用法', partTitleVi: 'Cách dùng từ',
            count: 5,
            instruction: '次の言葉の使い方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 文法 ──
          {
            partLabel: '問題7', partTitle: '文法形式の判断', partTitleVi: 'Ngữ pháp - Chọn hình thức đúng',
            count: 12,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題8', partTitle: '文の組み立て', partTitleVi: 'Sắp xếp câu',
            count: 5,
            instruction: '次の文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題9', partTitle: '文章の文法', partTitleVi: 'Ngữ pháp trong đoạn văn',
            count: 5,
            instruction: '次の文章を読んで、文章全体の内容を考えて、（　）に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 読解 ──
          {
            partLabel: '問題10', partTitle: '内容理解（短文）', partTitleVi: 'Đọc hiểu đoạn ngắn (200 chữ)',
            count: 5,
            instruction: '次の（1）から（5）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題11', partTitle: '内容理解（中文）', partTitleVi: 'Đọc hiểu đoạn vừa (500 chữ)',
            count: 9,
            instruction: '次の（1）から（3）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題12', partTitle: '統合理解', partTitleVi: 'Đọc hiểu tổng hợp (so sánh 2 bài)',
            count: 3,
            instruction: '次のAとBの文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題13', partTitle: '主張理解（長文）', partTitleVi: 'Đọc hiểu luận điểm (900 chữ)',
            count: 4,
            instruction: '次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題14', partTitle: '情報検索', partTitleVi: 'Tìm kiếm thông tin (700 chữ)',
            count: 2,
            instruction: '右のページを見て、下の質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
        ],
      },
      {
        title: '聴解',
        titleVi: 'Nghe hiểu',
        skill: 'listening',
        timeLimitMin: 50,
        parts: [
          {
            partLabel: '問題1', partTitle: '課題理解', partTitleVi: 'Nghe hiểu nội dung hội thoại và chọn hành động',
            count: 5,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、正しい答えを一つえらんでください。',
          },
          {
            partLabel: '問題2', partTitle: 'ポイント理解', partTitleVi: 'Nghe và nắm bắt điểm mấu chốt',
            count: 6,
            instruction: 'まず質問を聞いてください。そのあと問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題3', partTitle: '概要理解', partTitleVi: 'Nghe và hiểu nội dung tổng quan',
            count: 5,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題4', partTitle: '即時応答', partTitleVi: 'Nghe và chọn câu trả lời phù hợp ngay',
            count: 12,
            instruction: '問題用紙に何もいんさつされていません。まず文を聞いてください。それから、そのへんじを聞いて、1から3の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題5', partTitle: '統合理解', partTitleVi: 'Nghe tổng hợp (thảo luận dài)',
            count: 4,
            instruction: '長めの話を聞きます。この問題には練習はありません。まず話を聞いてください。それから、質問と選択肢を聞いて、1から4の中から最もよいものを一つ選んでください。',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  N1 — 総合170分
  //  Sec1: 110分 (文字語彙・文法・読解 合算)
  //  Sec2: 60分  聴解
  // ══════════════════════════════════════════════════════════
  {
    levelCode: 'N1',
    totalTimeMin: 170,
    sections: [
      {
        title: '言語知識（文字・語彙・文法）・読解',
        titleVi: 'Kiến thức ngôn ngữ (Chữ・Từ vựng・Ngữ pháp)・Đọc hiểu',
        skill: 'grammar_reading',
        timeLimitMin: 110,
        parts: [
          // ── 文字・語彙 ──
          {
            partLabel: '問題1', partTitle: '漢字読み', partTitleVi: 'Đọc cách đọc Hán tự',
            count: 6,
            instruction: '＿の言葉の読み方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題2', partTitle: '文脈規定', partTitleVi: 'Điền từ theo ngữ cảnh',
            count: 7,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題3', partTitle: '言い換え類義', partTitleVi: 'Từ đồng nghĩa / diễn đạt cách khác',
            count: 6,
            instruction: '＿の言葉に意味が最も近いものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題4', partTitle: '用法', partTitleVi: 'Cách dùng từ',
            count: 6,
            instruction: '次の言葉の使い方として最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 文法 ──
          {
            partLabel: '問題5', partTitle: '文法形式の判断', partTitleVi: 'Ngữ pháp - Chọn hình thức đúng',
            count: 10,
            instruction: '（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題6', partTitle: '文の組み立て', partTitleVi: 'Sắp xếp câu',
            count: 5,
            instruction: '次の文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題7', partTitle: '文章の文法', partTitleVi: 'Ngữ pháp trong đoạn văn',
            count: 5,
            instruction: '次の文章を読んで、文章全体の内容を考えて、（　）に入る最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          // ── 読解 ──
          {
            partLabel: '問題8', partTitle: '内容理解（短文）', partTitleVi: 'Đọc hiểu đoạn ngắn (200 chữ)',
            count: 4,
            instruction: '次の（1）から（4）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題9', partTitle: '内容理解（中文）', partTitleVi: 'Đọc hiểu đoạn vừa (500 chữ)',
            count: 9,
            instruction: '次の（1）から（3）の文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
          {
            partLabel: '問題10', partTitle: '内容理解（長文）', partTitleVi: 'Đọc hiểu đoạn dài (1000 chữ)',
            count: 4,
            instruction: '次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題11', partTitle: '統合理解', partTitleVi: 'Đọc hiểu tổng hợp (so sánh nhiều bài)',
            count: 3,
            instruction: '次のAとBの文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題12', partTitle: '主張理解（長文）', partTitleVi: 'Đọc hiểu luận điểm (1000 chữ)',
            count: 4,
            instruction: '次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つえらびなさい。',
          },
          {
            partLabel: '問題13', partTitle: '情報検索', partTitleVi: 'Tìm kiếm thông tin (1000 chữ)',
            count: 5,
            instruction: '右のページを見て、下の質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。',
          },
        ],
      },
      {
        title: '聴解',
        titleVi: 'Nghe hiểu',
        skill: 'listening',
        timeLimitMin: 60,
        parts: [
          {
            partLabel: '問題1', partTitle: '課題理解', partTitleVi: 'Nghe hiểu nội dung hội thoại và chọn hành động',
            count: 5,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、正しい答えを一つえらんでください。',
          },
          {
            partLabel: '問題2', partTitle: 'ポイント理解', partTitleVi: 'Nghe và nắm bắt điểm mấu chốt',
            count: 6,
            instruction: 'まず質問を聞いてください。そのあと問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題3', partTitle: '概要理解', partTitleVi: 'Nghe và hiểu nội dung, nhận định tổng quan',
            count: 6,
            instruction: 'まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題4', partTitle: '即時応答', partTitleVi: 'Nghe và chọn câu trả lời phù hợp ngay',
            count: 14,
            instruction: '問題用紙に何もいんさつされていません。まず文を聞いてください。それから、そのへんじを聞いて、1から3の中から、最もよいものを一つえらんでください。',
          },
          {
            partLabel: '問題5', partTitle: '統合理解', partTitleVi: 'Nghe tổng hợp (thảo luận dài)',
            count: 4,
            instruction: '長めの話を聞きます。この問題には練習はありません。まず話を聞いてください。それから、質問と選択肢を聞いて、1から4の中から最もよいものを一つ選んでください。',
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  Helper: generate placeholder question content per part type
// ─────────────────────────────────────────────────────────────

function makePlaceholderQuestion(
  partLabel: string,
  partTitle: string,
  partTitleVi: string,
  instruction: string,
  index: number,  // 0-based within this part
  skill: 'grammar_reading' | 'listening',
): {
  content: string;
  options: string[];
  answer: string;
  explain: string;
} {
  const num = index + 1;

  if (skill === 'listening') {
    return {
      content: `[${partLabel} ${partTitle} — Câu ${num}]\n\n${instruction}\n\n（音声ファイルをアップロードしてください）`,
      options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
      answer: '1',
      explain: `Giải thích đáp án câu ${num} — ${partTitleVi}`,
    };
  }

  // grammar_reading: vary by part title
  const t = partTitle;

  if (t === '漢字読み') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n＿の言葉の読み方として最もよいものを一つえらびなさい。\n\n（漢字読みの問題 ${num} — nội dung sẽ được cập nhật）`,
      options: ['ひらがな1', 'ひらがな2', 'ひらがな3', 'ひらがな4'],
      answer: '1',
      explain: `Cách đọc đúng của Hán tự trong câu ${num}.`,
    };
  }
  if (t === '表記') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n＿の言葉を漢字で書くとき最もよいものを一つえらびなさい。\n\n（表記の問題 ${num} — nội dung sẽ được cập nhật）`,
      options: ['漢字1', '漢字2', '漢字3', '漢字4'],
      answer: '1',
      explain: `Cách viết chính xác bằng Hán tự câu ${num}.`,
    };
  }
  if (t === '語形成') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n（　　）に入れるのに最もよいものを一つえらびなさい。\n\n（語形成の問題 ${num} — tiền tố/hậu tố — nội dung sẽ được cập nhật）`,
      options: ['語彙A', '語彙B', '語彙C', '語彙D'],
      answer: '1',
      explain: `Cấu tạo từ đúng cho câu ${num}.`,
    };
  }
  if (t === '文脈規定') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n（　　）に入れるのに最もよいものを一つえらびなさい。\n\n（文脈規定の問題 ${num} — điền từ theo ngữ cảnh — nội dung sẽ được cập nhật）`,
      options: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
      answer: '1',
      explain: `Từ phù hợp với ngữ cảnh câu ${num}.`,
    };
  }
  if (t === '言い換え類義') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n＿の言葉に意味が最も近いものを一つえらびなさい。\n\n（言い換え類義の問題 ${num} — từ đồng nghĩa — nội dung sẽ được cập nhật）`,
      options: ['類義語A', '類義語B', '類義語C', '類義語D'],
      answer: '1',
      explain: `Từ đồng nghĩa phù hợp với câu ${num}.`,
    };
  }
  if (t === '用法') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n次の言葉の使い方として最もよいものを一つえらびなさい。\n\n（用法の問題 ${num} — cách dùng từ — nội dung sẽ được cập nhật）`,
      options: ['用例A', '用例B', '用例C', '用例D'],
      answer: '1',
      explain: `Cách dùng từ đúng trong câu ${num}.`,
    };
  }
  if (t === '文法形式の判断') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n（　　）に入れるのに最もよいものを一つえらびなさい。\n\n（文法形式の問題 ${num} — chọn dạng ngữ pháp đúng — nội dung sẽ được cập nhật）`,
      options: ['文法A', '文法B', '文法C', '文法D'],
      answer: '1',
      explain: `Dạng ngữ pháp đúng cho câu ${num}.`,
    };
  }
  if (t === '文の組み立て') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n次の文の ★ に入る最もよいものを一つえらびなさい。\n\n　　　___　★　___　___\n\n（文の組み立て問題 ${num} — sắp xếp câu — nội dung sẽ được cập nhật）`,
      options: ['語句A', '語句B', '語句C', '語句D'],
      answer: '1',
      explain: `Trật tự từ đúng để tạo thành câu ${num}.`,
    };
  }
  if (t === '文章の文法') {
    return {
      content: `[${partLabel} ${t} — Câu ${num}]\n\n${instruction}\n\n（文章の文法問題 ${num} — ngữ pháp trong đoạn văn — nội dung sẽ được cập nhật）`,
      options: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
      answer: '1',
      explain: `Ngữ pháp phù hợp với đoạn văn trong câu ${num}.`,
    };
  }
  // Reading comprehension types
  return {
    content: `[${partLabel} ${t} — Câu ${num}]\n\n${instruction}\n\n（${t}の問題 ${num} — nội dung bài đọc và câu hỏi sẽ được cập nhật）`,
    options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    answer: '1',
    explain: `Giải thích đáp án của câu ${num} — ${partTitleVi}.`,
  };
}

// ─────────────────────────────────────────────────────────────
//  Main seed function
// ─────────────────────────────────────────────────────────────

export async function seedJLPTMockExams() {
  console.log('🗑  Xóa dữ liệu MockExam cũ...');
  await prisma.mockExam.deleteMany({ where: { subject: 'JLPT' } });

  let totalExams = 0;
  let totalQuestions = 0;

  for (const examDef of EXAMS) {
    const { levelCode, totalTimeMin, sections } = examDef;
    const [sec1, sec2] = sections;

    const sec1Questions = sec1.parts.reduce((s, p) => s + p.count, 0);
    const sec2Questions = sec2.parts.reduce((s, p) => s + p.count, 0);
    const totalQ = sec1Questions + sec2Questions;

    console.log(`\n📝 Tạo đề JLPT ${levelCode} (${totalTimeMin}p) — ${totalQ} câu hỏi`);
    console.log(`   Section 1: ${sec1.titleVi} — ${sec1Questions} câu`);
    console.log(`   Section 2: ${sec2.titleVi} — ${sec2Questions} câu`);

    const exam = await prisma.mockExam.create({
      data: {
        title: `Đề thi thử JLPT ${levelCode} — 2025`,
        description: `Đề thi thử JLPT ${levelCode} theo cấu trúc đề thi chính thức năm 2025. Gồm ${totalQ} câu hỏi chia thành 2 phần: Kiến thức ngôn ngữ & Đọc hiểu (${sec1.timeLimitMin} phút) và Nghe hiểu (${sec2.timeLimitMin} phút).`,
        subject: 'JLPT' as any,
        levelCode,
        year: 2025,
        totalTime: totalTimeMin * 60,
        published: false,
      },
    });

    for (let sIdx = 0; sIdx < 2; sIdx++) {
      const secDef = sections[sIdx];
      const section = await prisma.mockExamSection.create({
        data: {
          mockExamId: exam.id,
          title: secDef.title,
          titleVi: secDef.titleVi,
          skill: secDef.skill,
          timeLimit: secDef.timeLimitMin * 60,
          order: sIdx,
        },
      });

      let qOrder = 0;
      for (const part of secDef.parts) {
        for (let i = 0; i < part.count; i++) {
          const q = makePlaceholderQuestion(
            part.partLabel,
            part.partTitle,
            part.partTitleVi,
            part.instruction,
            i,
            secDef.skill,
          );
          await prisma.mockExamQuestion.create({
            data: {
              sectionId: section.id,
              partLabel: part.partLabel,
              partTitle: part.partTitle,
              content: q.content,
              options: q.options,
              answer: q.answer,
              explain: q.explain,
              order: qOrder++,
            },
          });
          totalQuestions++;
        }
        console.log(`     ✓ ${part.partLabel} ${part.partTitle} — ${part.count} câu`);
      }
    }

    totalExams++;
  }

  console.log(`\n✅ Hoàn tất! Đã tạo ${totalExams} đề thi với tổng cộng ${totalQuestions} câu hỏi mẫu.`);
  console.log('   → Vào trang admin > Đề thi thử để xem và chỉnh sửa nội dung.\n');
}

// ─────────────────────────────────────────────────────────────
//  Entry point (standalone run)
// ─────────────────────────────────────────────────────────────

seedJLPTMockExams()
  .catch(e => { console.error('❌ Seed thất bại:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
