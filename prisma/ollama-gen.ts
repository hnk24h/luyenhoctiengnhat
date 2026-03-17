/**
 * ollama-gen.ts — Ollama-powered content generator for luyenthitiengnhat
 *
 * Pipeline:  Dataset (JSON) → Ollama API → Lesson/Vocab/Questions → Prisma DB
 *
 * Usage:
 *   npx tsx prisma/ollama-gen.ts --mode lessons   --dataset ./prisma/data/jlpt-n5-topics.json
 *   npx tsx prisma/ollama-gen.ts --mode vocab     --dataset ./prisma/data/jlpt-n5-words.json
 *   npx tsx prisma/ollama-gen.ts --mode questions --dataset ./prisma/data/jlpt-n5-exam.json
 *   npx tsx prisma/ollama-gen.ts --mode lessons   --dataset ./prisma/data/jlpt-n5-topics.json --dry-run
 *
 * Flags:
 *   --mode         lessons | vocab | questions
 *   --dataset      path to JSON dataset file
 *   --model        Ollama model name (default: llama3:latest)
 *   --dry-run      Print generated content without writing to DB
 *   --limit N      Stop after N items (for testing)
 */

import { PrismaClient, Subject, Skill, LessonType, Language, ContentType, QuestionType } from '@prisma/client';
import { OllamaClient } from './ollama-client.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

// ─── CLI args ─────────────────────────────────────────────────────────────────

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const MODE     = getArg('mode') as 'lessons' | 'vocab' | 'questions' | undefined;
const DATASET  = getArg('dataset');
const MODEL    = getArg('model') ?? 'llama3:latest';
const DRY_RUN  = hasFlag('dry-run');
const LIMIT    = getArg('limit') ? parseInt(getArg('limit')!, 10) : undefined;

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Common header in every dataset file */
interface DatasetHeader {
  subject: 'JLPT' | 'HSK' | 'PMP';
  levelCode: string;   // e.g. "N5", "HSK2", "PMP"
  mode: 'lessons' | 'vocab' | 'questions';
  language: string;    // target language: "ja" | "zh" | "en"
}

interface LessonDataset extends DatasetHeader {
  mode: 'lessons';
  categoryCode: string;    // e.g. "n5_vocab" — must already exist in DB
  categoryName: string;    // displayed in logs
  topics: { title: string; keywords?: string[]; level?: string }[];
}

interface VocabDataset extends DatasetHeader {
  mode: 'vocab';
  categoryCode: string;
  lessonTitle: string;
  words: {
    term: string;         // target language word
    pronunciation?: string; // reading / pinyin
    meaning: string;      // Vietnamese meaning
  }[];
}

interface QuestionDataset extends DatasetHeader {
  mode: 'questions';
  examSetTitle: string;
  skill: 'vocab' | 'grammar' | 'doc' | 'nghe' | 'viet';
  count: number;              // questions to generate
  topics: string[];           // context topics for the questions
}

// ─── LLM response shapes ──────────────────────────────────────────────────────

interface LLMlessonMeta {
  title: string;
  description: string;
}

interface LLMLesson {
  title: string;
  description: string;
  content: string;  // Markdown (generated as plain text)
}

interface LLMVocabItem {
  term: string;
  pronunciation: string;
  meanings: { vi: string; en?: string };
  examples: { text: string; translation: string }[];
}

interface LLMQuestion {
  content: string;
  options: string[];    // 4 options A/B/C/D
  answer: string;       // must be one of options
  explain: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { process.stdout.write(msg + '\n'); }
function ok(msg: string)  { log(`  ✅ ${msg}`); }
function info(msg: string){ log(`  ℹ️  ${msg}`); }
function warn(msg: string){ log(`  ⚠️  ${msg}`); }
function err(msg: string) { log(`  ❌ ${msg}`); }

function loadDataset(filePath: string): DatasetHeader {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`Dataset file not found: ${abs}`);
  return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

// ─── MODE: lessons ────────────────────────────────────────────────────────────

async function runLessons(ds: LessonDataset, ollama: OllamaClient) {
  log(`\n📚 Mode: LESSONS — Subject: ${ds.subject} / Level: ${ds.levelCode}`);
  log(`   Category: ${ds.categoryName}  |  Topics: ${ds.topics.length}`);

  // Find level in DB
  const level = await prisma.level.findUnique({ where: { code: ds.levelCode } });
  if (!level) throw new Error(`Level "${ds.levelCode}" not found in DB. Run seed first.`);

  // Find or create category
  let category = await prisma.learningCategory.findFirst({
    where: { levelId: level.id, name: ds.categoryName },
  });

  if (!category && !DRY_RUN) {
    category = await prisma.learningCategory.create({
      data: {
        levelId: level.id,
        skill: Skill.vocab,
        name: ds.categoryName,
        description: `Generated by Ollama (${MODEL})`,
        icon: ds.subject === 'JLPT' ? '📖' : ds.subject === 'HSK' ? '📕' : '📋',
        order: 99,
      },
    });
    ok(`Created category: ${category.name}`);
  } else if (category) {
    info(`Using existing category: ${category.name} (id: ${category.id})`);
  }

  const topics = LIMIT ? ds.topics.slice(0, LIMIT) : ds.topics;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    log(`\n  [${i + 1}/${topics.length}] Generating lesson: "${topic.title}" ...`);

    // Step 1: get title + description as JSON (short → reliable)
    const metaPrompt = buildLessonMetaPrompt(topic.title, topic.keywords ?? [], ds.subject, ds.levelCode);
    let meta: LLMlessonMeta;
    try {
      meta = await ollama.generateJSON<LLMlessonMeta>({ prompt: metaPrompt });
    } catch (e) {
      err(`  Failed (meta): ${e}`);
      continue;
    }

    // Step 2: get full Markdown content as plain text (avoids JSON escape issues)
    const contentPrompt = buildLessonContentPrompt(topic.title, topic.keywords ?? [], ds.subject, ds.levelCode, ds.language);
    const system = buildLessonSystem(ds.subject, ds.levelCode, ds.language);
    let rawContent: string;
    try {
      rawContent = await ollama.generate({ prompt: contentPrompt, system });
    } catch (e) {
      err(`  Failed (content): ${e}`);
      continue;
    }

    const lesson: LLMLesson = { title: meta.title, description: meta.description, content: rawContent };

    if (DRY_RUN) {
      log('\n' + '─'.repeat(60));
      log(`Title: ${lesson.title}`);
      log(`Desc:  ${lesson.description}`);
      log(`Content (first 500 chars):\n${lesson.content.slice(0, 500)}`);
      continue;
    }

    // Check existing
    const exists = category && await prisma.learningLesson.findFirst({
      where: { categoryId: category.id, title: lesson.title },
    });
    if (exists) { warn(`  Already exists, skipping.`); continue; }

    if (category) {
      await prisma.learningLesson.create({
        data: {
          categoryId:  category.id,
          title:       lesson.title,
          description: lesson.description,
          content:     lesson.content,
          type:        LessonType.text,
          order:       i,
        },
      });
      ok(`Saved: ${lesson.title}`);
    }
  }
}

// ─── MODE: vocab ──────────────────────────────────────────────────────────────

async function runVocab(ds: VocabDataset, ollama: OllamaClient) {
  log(`\n📝 Mode: VOCAB — Subject: ${ds.subject} / Level: ${ds.levelCode}`);
  log(`   Lesson: ${ds.lessonTitle}  |  Words: ${ds.words.length}`);

  const level = await prisma.level.findUnique({ where: { code: ds.levelCode } });
  if (!level) throw new Error(`Level "${ds.levelCode}" not found in DB.`);

  // Find/create category (use a default "Vocab" category)
  let category = await prisma.learningCategory.findFirst({
    where: { levelId: level.id, skill: Skill.vocab },
    orderBy: { order: 'asc' },
  });
  if (!category && !DRY_RUN) {
    category = await prisma.learningCategory.create({
      data: {
        levelId: level.id,
        skill: Skill.vocab,
        name: `Từ vựng ${ds.levelCode}`,
        icon: '📖',
        order: 0,
      },
    });
  }

  // Find/create lesson
  let lesson = category ? await prisma.learningLesson.findFirst({
    where: { categoryId: category.id, title: ds.lessonTitle },
  }) : null;

  if (!lesson && category && !DRY_RUN) {
    lesson = await prisma.learningLesson.create({
      data: {
        categoryId: category.id,
        title:      ds.lessonTitle,
        type:       LessonType.vocab,
        order:      0,
      },
    });
    ok(`Created lesson: ${ds.lessonTitle}`);
  }

  const words = LIMIT ? ds.words.slice(0, LIMIT) : ds.words;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    log(`  [${i + 1}/${words.length}] Enriching: "${word.term}" ...`);

    const prompt = buildVocabPrompt(word, ds.subject, ds.levelCode, ds.language);
    let item: LLMVocabItem;
    try {
      item = await ollama.generateJSON<LLMVocabItem>({ prompt });
    } catch (e) {
      err(`  Failed: ${e}`);
      continue;
    }

    if (DRY_RUN) {
      log(`  ${item.term} [${item.pronunciation}] — ${item.meanings.vi}`);
      item.examples.forEach(ex => log(`    • ${ex.text} → ${ex.translation}`));
      continue;
    }

    if (!lesson) continue;

    // Upsert Content
    const existing = await prisma.content.findFirst({
      where: { lessonId: lesson.id, term: item.term },
    });
    if (existing) { warn(`  "${item.term}" already exists, skipping.`); continue; }

    const lang = ds.language as Language;
    await prisma.content.create({
      data: {
        lessonId:      lesson.id,
        type:          ContentType.vocab,
        language:      lang,
        term:          item.term,
        pronunciation: item.pronunciation || null,
        order:         i,
        meanings: {
          create: [
            { language: Language.vi, meaning: item.meanings.vi },
            ...(item.meanings.en ? [{ language: Language.en, meaning: item.meanings.en }] : []),
          ],
        },
        examples: {
          create: item.examples.slice(0, 3).map(ex => ({
            exampleText:         ex.text,
            translation:         ex.translation,
            language:            lang,
            translationLanguage: Language.vi,
          })),
        },
      },
    });
    ok(`Saved vocab: ${item.term}`);
  }
}

// ─── MODE: questions ──────────────────────────────────────────────────────────

async function runQuestions(ds: QuestionDataset, ollama: OllamaClient) {
  log(`\n❓ Mode: QUESTIONS — Subject: ${ds.subject} / Level: ${ds.levelCode}`);
  log(`   ExamSet: "${ds.examSetTitle}"  |  Skill: ${ds.skill}  |  Count: ${ds.count}`);

  const level = await prisma.level.findUnique({ where: { code: ds.levelCode } });
  if (!level) throw new Error(`Level "${ds.levelCode}" not found in DB.`);

  // Find or create ExamSet
  let examSet = await prisma.examSet.findFirst({
    where: { levelId: level.id, title: ds.examSetTitle },
  });

  if (!examSet && !DRY_RUN) {
    examSet = await prisma.examSet.create({
      data: {
        levelId:     level.id,
        skill:       ds.skill as Skill,
        title:       ds.examSetTitle,
        description: `AI-generated (${MODEL})`,
      },
    });
    ok(`Created ExamSet: ${ds.examSetTitle}`);
  } else if (examSet) {
    info(`Using existing ExamSet: ${examSet.title}`);
  }

  // Get current question count for ordering
  const existingCount = examSet ? await prisma.question.count({ where: { examSetId: examSet.id } }) : 0;

  const batchSize = Math.min(5, ds.count); // generate 5 at a time
  const batches   = Math.ceil(ds.count / batchSize);
  let generated   = 0;

  for (let b = 0; b < batches && generated < ds.count; b++) {
    const thisCount = Math.min(batchSize, ds.count - generated);
    log(`\n  Batch ${b + 1}/${batches}: generating ${thisCount} questions ...`);

    const prompt = buildQuestionsPrompt(ds, thisCount);

    let questions: LLMQuestion[];
    try {
      const result = await ollama.generateJSON<{ questions: LLMQuestion[] }>({ prompt });
      questions = result.questions ?? [];
    } catch (e) {
      err(`  Batch failed: ${e}`);
      continue;
    }

    for (const q of questions) {
      if (DRY_RUN) {
        log(`\n  Q: ${q.content}`);
        q.options.forEach((o, i) => log(`     ${String.fromCharCode(65 + i)}. ${o}`));
        log(`  ✓ ${q.answer}`);
        log(`  💡 ${q.explain}`);
        continue;
      }

      if (!examSet) continue;

      // Validate answer is one of the options
      if (!q.options.includes(q.answer)) {
        warn(`  Question answer not in options — auto-selecting first option`);
        q.answer = q.options[0];
      }

      await prisma.question.create({
        data: {
          examSetId: examSet.id,
          type:      QuestionType.tracnghiem,
          content:   q.content,
          options:   q.options,
          answer:    q.answer,
          explain:   q.explain || null,
          order:     existingCount + generated,
        },
      });
      generated++;
    }

    if (!DRY_RUN) ok(`Batch ${b + 1}: saved ${questions.length} questions`);
  }

  if (!DRY_RUN) log(`\n📊 Total generated: ${generated} questions`);
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildLessonSystem(subject: string, level: string, lang: string): string {
  const langLabel = lang === 'ja' ? 'Japanese' : lang === 'zh' ? 'Chinese' : lang;
  return [
    `You are an expert ${langLabel} language teacher creating structured lessons for ${subject} ${level} learners.`,
    `Target audience: Vietnamese speakers studying ${langLabel}.`,
    `Explain concepts clearly in Vietnamese mixed with ${langLabel} examples.`,
    `Write clean Markdown. Use ## for sections, tables for comparisons, bullet points for lists.`,
    `Include: explanation, key points, example sentences, a memory tip.`,
    `Length: 400-700 words of Markdown.`,
  ].join('\n');
}

/** Step 1: Short JSON call — just title + description (reliable) */
function buildLessonMetaPrompt(title: string, keywords: string[], subject: string, level: string): string {
  return [
    `For a ${subject} ${level} lesson on "${title}":`,
    keywords.length ? `Keywords: ${keywords.join(', ')}` : '',
    `Return ONLY this JSON (no extra text):`,
    `{ "title": "<lesson title>", "description": "<one Vietnamese sentence>" }`,
  ].filter(Boolean).join('\n');
}

/** Step 2: Plain text Markdown content (no JSON wrapping — avoids escape issues) */
function buildLessonContentPrompt(title: string, keywords: string[], subject: string, level: string, lang: string): string {
  const langLabel = lang === 'ja' ? 'Japanese' : lang === 'zh' ? 'Chinese' : lang;
  return [
    `Write a ${langLabel} lesson for ${subject} ${level} on: "${title}"`,
    keywords.length ? `Must cover: ${keywords.join(', ')}` : '',
    `Output Markdown only. No JSON. No preamble. Start directly with the first ## heading.`,
  ].filter(Boolean).join('\n');
}

function buildVocabPrompt(
  word: { term: string; pronunciation?: string; meaning: string },
  subject: string, level: string, lang: string
): string {
  const langLabel = lang === 'ja' ? 'Japanese' : lang === 'zh' ? 'Chinese' : lang;
  return [
    `Enrich this ${langLabel} vocabulary word for ${subject} ${level}:`,
    `Word: "${word.term}"`,
    word.pronunciation ? `Reading/Pronunciation: ${word.pronunciation}` : '',
    `Base meaning: "${word.meaning}"`,
    '',
    `Return JSON:`,
    `{`,
    `  "term": "${word.term}",`,
    `  "pronunciation": "correct reading/pinyin",`,
    `  "meanings": { "vi": "Vietnamese meaning", "en": "English meaning" },`,
    `  "examples": [`,
    `    { "text": "${langLabel} example sentence", "translation": "Vietnamese translation" },`,
    `    { "text": "${langLabel} example sentence 2", "translation": "Vietnamese translation" }`,
    `  ]`,
    `}`,
  ].filter(Boolean).join('\n');
}

function buildQuestionsPrompt(ds: QuestionDataset, count: number): string {
  const langLabel = ds.language === 'ja' ? 'Japanese' : ds.language === 'zh' ? 'Chinese' : ds.language;
  const skillLabel: Record<string, string> = {
    vocab: 'vocabulary', grammar: 'grammar', doc: 'reading comprehension',
    nghe: 'listening', viet: 'writing',
  };
  return [
    `Create ${count} multiple-choice ${skillLabel[ds.skill] ?? ds.skill} questions for ${ds.subject} ${ds.levelCode}.`,
    `Target: Vietnamese learners studying ${langLabel}.`,
    `Topics to cover: ${ds.topics.join(', ')}`,
    '',
    `Rules:`,
    `- Each question has exactly 4 options`,
    `- Only one correct answer`,
    `- Include a brief Vietnamese explanation`,
    `- Questions in ${langLabel}, options in ${langLabel}`,
    `- Explanations in Vietnamese`,
    `- Difficulty: appropriate for ${ds.levelCode} level`,
    '',
    `Return JSON:`,
    `{`,
    `  "questions": [`,
    `    {`,
    `      "content": "question text",`,
    `      "options": ["option A", "option B", "option C", "option D"],`,
    `      "answer": "exact text of correct option",`,
    `      "explain": "Vietnamese explanation"`,
    `    }`,
    `  ]`,
    `}`,
  ].join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('🤖 Ollama Content Generator');
  log(`   Model   : ${MODEL}`);
  log(`   Mode    : ${MODE ?? '(not set)'}`);
  log(`   Dataset : ${DATASET ?? '(not set)'}`);
  log(`   Dry-run : ${DRY_RUN}`);
  log('');

  // Validate
  if (!MODE || !['lessons', 'vocab', 'questions'].includes(MODE)) {
    err('--mode must be one of: lessons | vocab | questions');
    process.exit(1);
  }
  if (!DATASET) {
    err('--dataset <path> is required');
    process.exit(1);
  }

  // Init Ollama
  const ollama = new OllamaClient({ model: MODEL, temperature: 0.4 });
  const { ok: alive, models } = await ollama.ping();
  if (!alive) {
    err('Cannot reach Ollama at http://localhost:11434. Is it running?');
    process.exit(1);
  }
  if (!models.includes(MODEL)) {
    warn(`Model "${MODEL}" not found. Available: ${models.join(', ')}`);
    warn(`Run: ollama pull ${MODEL}`);
    process.exit(1);
  }
  ok(`Ollama connected — model: ${MODEL}`);

  // Load dataset
  const dataset = loadDataset(DATASET) as LessonDataset & VocabDataset & QuestionDataset;

  if (DRY_RUN) {
    log('\n⚡ DRY RUN — no database writes\n');
  }

  try {
    if (MODE === 'lessons')   await runLessons(dataset, ollama);
    if (MODE === 'vocab')     await runVocab(dataset, ollama);
    if (MODE === 'questions') await runQuestions(dataset, ollama);
  } finally {
    await prisma.$disconnect();
  }

  log('\n🎉 Done!');
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
