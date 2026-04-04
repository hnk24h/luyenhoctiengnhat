import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function parseExamDate(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function parsePositiveInt(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const plan = await prisma.userExamPlan.findUnique({
      where: { userId },
    });

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({
      plan: {
        targetLevelCode: plan.targetLevelCode,
        examDate: plan.examDate.toISOString().slice(0, 10),
        daysLeftAtSave: plan.daysLeftAtSave,
        weeksLeftAtSave: plan.weeksLeftAtSave,
        examsPerWeek: plan.examsPerWeek,
        studySessionsPerWeek: plan.studySessionsPerWeek,
        reviewDays: plan.reviewDays,
        updatedAt: plan.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const targetLevelCode = typeof (body as any)?.targetLevelCode === 'string' ? (body as any).targetLevelCode.trim().toUpperCase() : '';
  const examDate = parseExamDate((body as any)?.examDate);
  const daysLeftAtSave = parsePositiveInt((body as any)?.daysLeftAtSave);
  const weeksLeftAtSave = parsePositiveInt((body as any)?.weeksLeftAtSave);
  const examsPerWeek = parsePositiveInt((body as any)?.examsPerWeek);
  const studySessionsPerWeek = parsePositiveInt((body as any)?.studySessionsPerWeek);
  const reviewDays = parsePositiveInt((body as any)?.reviewDays);

  if (!targetLevelCode || !examDate || !daysLeftAtSave || !weeksLeftAtSave || !examsPerWeek || !studySessionsPerWeek || !reviewDays) {
    return NextResponse.json({ error: 'Invalid plan payload' }, { status: 400 });
  }

  const level = await prisma.level.findUnique({
    where: { code: targetLevelCode },
    select: { id: true },
  });

  if (!level) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  try {
    const saved = await prisma.userExamPlan.upsert({
      where: { userId },
      update: {
        targetLevelCode,
        examDate,
        daysLeftAtSave,
        weeksLeftAtSave,
        examsPerWeek,
        studySessionsPerWeek,
        reviewDays,
      },
      create: {
        userId,
        targetLevelCode,
        examDate,
        daysLeftAtSave,
        weeksLeftAtSave,
        examsPerWeek,
        studySessionsPerWeek,
        reviewDays,
      },
    });

    return NextResponse.json({
      plan: {
        targetLevelCode: saved.targetLevelCode,
        examDate: saved.examDate.toISOString().slice(0, 10),
        daysLeftAtSave: saved.daysLeftAtSave,
        weeksLeftAtSave: saved.weeksLeftAtSave,
        examsPerWeek: saved.examsPerWeek,
        studySessionsPerWeek: saved.studySessionsPerWeek,
        reviewDays: saved.reviewDays,
        updatedAt: saved.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}