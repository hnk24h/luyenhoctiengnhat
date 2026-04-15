import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

// GET /api/admin/nav-menu?lang=ja  → list all items for lang
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const lang = req.nextUrl.searchParams.get('lang') ?? 'ja';
  const items = await prisma.navMenuItem.findMany({
    where: { lang },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(items);
}

// POST /api/admin/nav-menu  → create item
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { lang, href, labelKey, label, iconName, sortOrder, isPrimary, enabled, authRequired } = body;

  if (!lang || !href || !labelKey || !iconName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const item = await prisma.navMenuItem.create({
    data: {
      lang,
      href,
      labelKey,
      label: label || null,
      iconName,
      sortOrder: sortOrder ?? 0,
      isPrimary: isPrimary ?? false,
      enabled: enabled ?? true,
      authRequired: authRequired ?? false,
    },
  });

  revalidateTag('nav-menu');
  return NextResponse.json(item, { status: 201 });
}
