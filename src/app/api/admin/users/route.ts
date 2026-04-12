// Đã xóa GET_ALL vì Next.js chỉ cho phép export các method HTTP chuẩn
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { UserRole, SubscriptionTier } from '@prisma/client';

function adminOnly(session: any) {
  const role = session?.user?.role;
  return !session || (role !== 'admin' && role !== 'ADMIN');
}

// GET /api/admin/users?page=1&limit=20&search=&role=&tier=
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = searchParams.get('search')?.trim() || '';
  const role   = searchParams.get('role') || '';
  const tier   = searchParams.get('tier') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role as UserRole;
  if (tier) where.subscriptionTier = tier;

  const [total, users, byRoleRaw, byTierRaw, grandTotal] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, role: true,
        subscriptionTier: true, image: true, createdAt: true,
        accounts: { select: { id: true, provider: true } },
        _count: {
          select: { sessions: true, progress: true, savedWords: true, flashcardDecks: true },
        },
      },
    }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['subscriptionTier'], _count: { _all: true } }),
    prisma.user.count(),
  ]);

  const byRole: Record<string, number> = {};
  byRoleRaw.forEach(r => { byRole[r.role] = r._count._all; });

  const byTier: Record<string, number> = {};
  byTierRaw.forEach(r => { byTier[r.subscriptionTier] = r._count._all; });

  return NextResponse.json({
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    summary: { byRole, byTier, total: grandTotal },
  });
}

// POST /api/admin/users — create new user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  const { name, email, password, role } = await req.json();
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Tên, email và mật khẩu là bắt buộc' }, { status: 400 });
  }
  if (role && !['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed, role: role || 'user' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
