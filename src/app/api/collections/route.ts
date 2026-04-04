import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { apiError, ApiCode } from '@/lib/api-response';

// GET /api/collections — list user's collections with word count
// Supports optional pagination: ?page=1&limit=20 (mobile)
export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const paginated = limitParam !== null;
  const limit = Math.min(Math.max(parseInt(limitParam ?? '20', 10) || 20, 1), 100);
  const page  = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);

  try {
    const [collections, total] = await Promise.all([
      prisma.wordCollection.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { words: true } } },
        ...(paginated ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      paginated ? prisma.wordCollection.count({ where: { userId } }) : Promise.resolve(0),
    ]);

    const mapped = collections.map(c => ({ id: c.id, name: c.name, color: c.color, wordCount: c._count.words, createdAt: c.createdAt }));

    if (paginated) {
      return NextResponse.json({ data: mapped, total, page, limit, hasMore: page * limit < total });
    }
    return NextResponse.json(mapped);
  } catch {
    return apiError(ApiCode.INTERNAL, 'Internal server error', 500);
  }
}

// POST /api/collections — create new collection
export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);

  const userId = user.id;

  let body: { name?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(ApiCode.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const { name, color } = body;
  if (!name?.trim()) return apiError(ApiCode.VALIDATION, 'Name required', 400);

  try {
    const col = await prisma.wordCollection.create({
      data: { userId, name: name.trim(), color: color ?? '#4F46E5' },
    });
    return NextResponse.json({ ...col, wordCount: 0 }, { status: 201 });
  } catch {
    return apiError(ApiCode.CONFLICT, 'Collection name already exists', 409);
  }
}
