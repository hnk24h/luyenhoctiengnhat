import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/pmp/questions
 * GET /api/pmp/questions?area=integration
 * GET /api/pmp/questions?group=planning
 * GET /api/pmp/questions?difficulty=hard
 * Returns PMP exam questions. Optionally filter by knowledge area code, process group, or difficulty.
 * Shuffled at query level (random-ish via order).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const area       = searchParams.get('area')       || undefined;
  const group      = searchParams.get('group')      || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const limitStr   = searchParams.get('limit');
  const limit      = limitStr ? parseInt(limitStr, 10) : 50;

  // Validate limit to prevent abuse
  const safeLimit = Math.min(Math.max(1, isNaN(limit) ? 50 : limit), 200);

  const questions = await prisma.pMPExamQuestion.findMany({
    where: {
      ...(area  ? { area }  : {}),
      ...(group ? { group } : {}),
      ...(difficulty ? { difficulty } : {}),
    },
    select: {
      id:         true,
      content:    true,
      optionA:    true,
      optionB:    true,
      optionC:    true,
      optionD:    true,
      answer:     true,
      explain:    true,
      difficulty: true,
      area:       true,
      group:      true,
      tags:       true,
    },
    take: safeLimit,
  });

  return NextResponse.json(questions);
}
