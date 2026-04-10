import { THUMB_GRADIENTS, THUMB_ICONS, LEVEL_ORDER, GRAMMAR_DB } from './constants';
import type { PassageDetail, ReadingStats, ComprehensionQ, GrammarMatch } from './types';

// ─── Thumbnail helpers ────────────────────────────────────────────────────────

export function thumbGradient(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return THUMB_GRADIENTS[Math.abs(h) % THUMB_GRADIENTS.length];
}

export function thumbIcon(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return THUMB_ICONS[Math.abs(h) % THUMB_ICONS.length];
}

export function readTime(chars: number | undefined | null) {
  const n = typeof chars === 'number' && !Number.isNaN(chars) ? chars : 0;
  return `${Math.max(1, Math.ceil(n / 400))} phút`;
}

// ─── Reading stats (localStorage) ─────────────────────────────────────────────

export function getReadingStats(): ReadingStats {
  if (typeof window === 'undefined') return { totalRead: 0, streakDays: 0, lastReadDate: '', readToday: 0, readIds: [] };
  try {
    const raw = localStorage.getItem('reading-stats');
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return { totalRead: 0, streakDays: 0, lastReadDate: '', readToday: 0, readIds: [] };
}

export function markPassageRead(passageId: string): ReadingStats {
  const stats = getReadingStats();
  const today = new Date().toISOString().slice(0, 10);
  if (stats.readIds.includes(passageId)) return stats;
  stats.readIds.push(passageId);
  stats.totalRead++;
  if (stats.lastReadDate === today) {
    stats.readToday++;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    stats.streakDays = stats.lastReadDate === yesterday ? stats.streakDays + 1 : 1;
    stats.readToday = 1;
    stats.lastReadDate = today;
  }
  localStorage.setItem('reading-stats', JSON.stringify(stats));
  return stats;
}

// ─── Comprehension questions generator ────────────────────────────────────────

export function generateComprehensionQuestions(passage: PassageDetail, isChinese: boolean): ComprehensionQ[] {
  const sentences = passage.content.split(/[。！？\n]+/).map(s => s.trim()).filter(s => s.length > 5);
  if (sentences.length < 3) return [];

  const qs: ComprehensionQ[] = [];
  qs.push({
    id: 'q1',
    question: isChinese ? '这篇文章的主题是什么？' : 'この文章のテーマは何ですか？',
    options: isChinese
      ? [passage.titleVi ?? passage.title, '天气预报', '做饭方法', '旅游指南']
      : [passage.titleVi ?? passage.title, '天気予報', '料理のレシピ', '旅行のガイド'],
    correctIndex: 0,
  });

  if (sentences.length >= 2) {
    const target = sentences[Math.min(1, sentences.length - 1)];
    const dist1 = sentences.length > 3 ? sentences[3].slice(0, 30) + '…' : (isChinese ? '没有提到' : '述べられていない');
    qs.push({
      id: 'q2',
      question: isChinese ? '文章中提到了什么内容？' : '文章には何が書かれていますか？',
      options: [
        target.slice(0, 40) + (target.length > 40 ? '…' : ''),
        dist1,
        isChinese ? '作者不同意' : '筆者は反対している',
        isChinese ? '以上都不对' : '上記のどれでもない',
      ],
      correctIndex: 0,
    });
  }

  if (passage.summary) {
    qs.push({
      id: 'q3',
      question: isChinese ? '以下哪个最能概括这篇文章？' : '次のうち、この文章を最もよく要約しているのはどれですか？',
      options: [
        passage.summary.slice(0, 50) + (passage.summary.length > 50 ? '…' : ''),
        isChinese ? '一个关于科学实验的报告' : '科学実験に関するレポート',
        isChinese ? '一篇社论文章' : '社説記事',
        isChinese ? '一份广告素材' : '広告資料',
      ],
      correctIndex: 0,
    });
  }

  return qs.map(q => {
    const correct = q.options[q.correctIndex];
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correct) };
  });
}

// ─── Pre-reading keywords extractor ───────────────────────────────────────────

export function extractKeywords(content: string, isChinese: boolean): { word: string }[] {
  if (isChinese) {
    const found = content.match(/[\u4e00-\u9fff]{2,4}/g) ?? [];
    return [...new Set(found)].slice(0, 6).map(w => ({ word: w }));
  }
  const kanjiWords = content.match(/[\u4e00-\u9fff\u3400-\u4dbf]{2,6}/g) ?? [];
  const katakana = content.match(/[\u30a0-\u30ff]{3,}/g) ?? [];
  return [...new Set([...kanjiWords, ...katakana])].slice(0, 8).map(w => ({ word: w }));
}

// ─── Grammar analysis ─────────────────────────────────────────────────────────

function getLevelsToScan(level: string): string[] {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === -1) return ['N5'];
  return LEVEL_ORDER.slice(0, idx + 1).reverse();
}

export function analyzeGrammar(content: string, level: string): GrammarMatch[] {
  const sentences = content.split(/[。！？\n]+/).map(s => s.trim()).filter(s => s.length > 3);
  const results: GrammarMatch[] = [];
  const seen = new Set<string>();
  for (const lk of getLevelsToScan(level)) {
    for (const g of GRAMMAR_DB[lk] ?? []) {
      if (seen.has(g.id)) continue;
      const ex = sentences.find(s => g.pattern.test(s));
      if (ex) {
        results.push({ id: g.id, name: g.name, meaning: g.meaning, level: lk, highlight: g.highlight, example: ex + '。' });
        seen.add(g.id);
      }
      if (results.length >= 9) break;
    }
    if (results.length >= 9) break;
  }
  return results.sort((a, b) =>
    (a.level === level && b.level !== level) ? -1 : (b.level === level && a.level !== level) ? 1 : 0
  );
}
