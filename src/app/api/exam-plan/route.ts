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

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.userExamPlan.findUnique({
    where: { userId: user.id },
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
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const targetLevelCode = typeof body?.targetLevelCode === 'string' ? body.targetLevelCode.trim().toUpperCase() : '';
  const examDate = parseExamDate(body?.examDate);
  const daysLeftAtSave = parsePositiveInt(body?.daysLeftAtSave);
  const weeksLeftAtSave = parsePositiveInt(body?.weeksLeftAtSave);
  const examsPerWeek = parsePositiveInt(body?.examsPerWeek);
  const studySessionsPerWeek = parsePositiveInt(body?.studySessionsPerWeek);
  const reviewDays = parsePositiveInt(body?.reviewDays);

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

  const saved = await prisma.userExamPlan.upsert({
    where: { userId: user.id },
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
      userId: user.id,
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
}