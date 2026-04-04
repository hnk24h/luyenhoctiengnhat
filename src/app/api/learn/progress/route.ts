import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Chưa đăng nhập.', 401);

  const userId = user.id;

  let body: { lessonId?: string; completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { lessonId, completed } = body;
  if (!lessonId) return apiError(ApiCode.VALIDATION, 'Thiếu lessonId.', 400);

  try {
    const prog = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: completed ?? false, completedAt: completed ? new Date() : null },
      create: { userId, lessonId, completed: completed ?? false, completedAt: completed ? new Date() : null },
    });
    return NextResponse.json(prog);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}
