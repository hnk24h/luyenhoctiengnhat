/**
 * Seeder: Chinese (HSK) listening practices
 * Run: npx tsx prisma/seed-chinese-listening.ts
 *
 * Requires HSK levels to already exist (run seed-hsk.ts first).
 * Creates LearningCategory (skill=nghe) + LearningLesson (type=audio)
 * for every entry in CHINESE_LISTENING_PRACTICES.
 */

import { PrismaClient } from '@prisma/client';
import { CHINESE_LISTENING_PRACTICES } from '../src/modules/chineseListeningContent';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Chinese listening practices...\n');

  // Load HSK levels
  const levels = await prisma.level.findMany({ where: { subject: 'HSK' } });
  if (!levels.length) throw new Error('No HSK levels found. Run npx tsx prisma/seed-hsk.ts first.');

  const levelMap: Record<string, string> = Object.fromEntries(levels.map(l => [l.code, l.id]));

  // Group practices by HSK level
  const byLevel = CHINESE_LISTENING_PRACTICES.reduce<Record<string, typeof CHINESE_LISTENING_PRACTICES>>(
    (acc, p) => { (acc[p.level] ??= []).push(p); return acc; },
    {},
  );

  for (const [levelCode, practices] of Object.entries(byLevel)) {
    const levelId = levelMap[levelCode];
    if (!levelId) { console.warn(`  ⚠  Level ${levelCode} not in DB — skipping`); continue; }

    // Find or create listening category
    let category = await prisma.learningCategory.findFirst({ where: { levelId, skill: 'nghe' } });
    if (!category) {
      category = await prisma.learningCategory.create({
        data: {
          levelId,
          skill: 'nghe',
          name: `Luyện nghe tiếng Trung ${levelCode}`,
          description: `Bài nghe HSK cấp độ ${levelCode}`,
          order: 0,
        },
      });
      console.log(`  + Created category: ${category.name}`);
    } else {
      console.log(`  ✓ Category exists: ${category.name}`);
    }

    for (let i = 0; i < practices.length; i++) {
      const p = practices[i];

      // Serialize content as JSON blob — same format as JLPT lessons.
      // 'mondai' stores the Chinese type ('Hội thoại', 'Độc thoại'…)
      // for unified category-based filtering in the API.
      const content = JSON.stringify({
        mondai: p.type,
        titleVi: p.titleVi,
        summary: p.summary,
        situation: p.situation,
        durationSec: p.durationSec,
        focus: p.focus,
        question: p.question,
        options: p.options,
        answer: p.answer,
        explanation: p.explanation,
        audioUrl: p.audioUrl ?? null,
        transcript: p.segments, // segments include pinyin
      });

      await prisma.learningLesson.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          categoryId: category.id,
          title: p.title,
          description: p.summary,
          type: 'audio',
          content,
          order: i,
        },
        update: {
          title: p.title,
          description: p.summary,
          content,
          order: i,
        },
      });
      console.log(`    · ${p.id} — ${p.title}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
