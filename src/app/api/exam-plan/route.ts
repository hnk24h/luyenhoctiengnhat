import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

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

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  const userId = user.id;

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
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  const userId = user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const bodyData = body as {
    targetLevelCode?: unknown;
    examDate?: unknown;
    daysLeftAtSave?: unknown;
    weeksLeftAtSave?: unknown;
    examsPerWeek?: unknown;
    studySessionsPerWeek?: unknown;
    reviewDays?: unknown;
  };

  const targetLevelCode = typeof bodyData?.targetLevelCode === 'string' ? bodyData.targetLevelCode.trim().toUpperCase() : '';
  const examDate = parseExamDate(bodyData?.examDate);
  const daysLeftAtSave = parsePositiveInt(bodyData?.daysLeftAtSave);
  const weeksLeftAtSave = parsePositiveInt(bodyData?.weeksLeftAtSave);
  const examsPerWeek = parsePositiveInt(bodyData?.examsPerWeek);
  const studySessionsPerWeek = parsePositiveInt(bodyData?.studySessionsPerWeek);
  const reviewDays = parsePositiveInt(bodyData?.reviewDays);

  if (!targetLevelCode || !examDate || !daysLeftAtSave || !weeksLeftAtSave || !examsPerWeek || !studySessionsPerWeek || !reviewDays) {
    return apiError(ApiCode.VALIDATION, 'Invalid plan payload', 400);
  }

  const level = await prisma.level.findUnique({
    where: { code: targetLevelCode },
    select: { id: true },
  });

  if (!level) {
    return apiError(ApiCode.NOT_FOUND, 'Level not found', 404);
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
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}