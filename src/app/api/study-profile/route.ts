import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const weeklyGoal = typeof (body as any)?.weeklyGoal === 'number' ? Math.round((body as any).weeklyGoal) : NaN;

  if (!Number.isFinite(weeklyGoal) || weeklyGoal < 3 || weeklyGoal > 50) {
    return NextResponse.json({ error: 'Weekly goal must be between 3 and 50' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}