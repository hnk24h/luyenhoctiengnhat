import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

  const profile = await prisma.userStudyProfile.findUnique({
    where: { userId: user.id },
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
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const weeklyGoal = typeof body?.weeklyGoal === 'number' ? Math.round(body.weeklyGoal) : NaN;

  if (!Number.isFinite(weeklyGoal) || weeklyGoal < 3 || weeklyGoal > 50) {
    return NextResponse.json({ error: 'Weekly goal must be between 3 and 50' }, { status: 400 });
  }

  const existing = await prisma.userStudyProfile.findUnique({
    where: { userId: user.id },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  });

  const profile = await prisma.userStudyProfile.upsert({
    where: { userId: user.id },
    update: { weeklyGoal },
    create: {
      userId: user.id,
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
}