import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  const userId = user.id;

  try {
    const profile = await prisma.userStudyProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      profile: profile
        ? {
            weeklyGoal: profile.weeklyGoal,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            lastActivityDate: profile.lastActivityDate?.toISOString().slice(0, 10) ?? null,
            updatedAt: profile.updatedAt.toISOString(),
          }
        : null,
    });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  const userId = user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const bodyData = body as { weeklyGoal?: unknown };
  const weeklyGoal = typeof bodyData?.weeklyGoal === 'number' ? Math.round(bodyData.weeklyGoal) : NaN;

  if (!Number.isFinite(weeklyGoal) || weeklyGoal < 3 || weeklyGoal > 50) {
    return apiError(ApiCode.VALIDATION, 'Weekly goal must be between 3 and 50', 400);
  }

  const existing = await prisma.userStudyProfile.findUnique({
    where: { userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  });

  try {
    const profile = await prisma.userStudyProfile.upsert({
      where: { userId },
      update: { weeklyGoal },
      create: {
        userId,
        weeklyGoal,
        currentStreak: existing?.currentStreak ?? 0,
        longestStreak: existing?.longestStreak ?? 0,
        lastActivityDate: existing?.lastActivityDate ?? null,
      },
    });

    return NextResponse.json({
      profile: {
        weeklyGoal: profile.weeklyGoal,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActivityDate: profile.lastActivityDate?.toISOString().slice(0, 10) ?? null,
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}