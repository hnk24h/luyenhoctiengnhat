/**
 * POST /api/admin/nav-menu/seed
 * Upserts all DEFAULT_NAV_ITEMS into the DB.
 * Safe to call multiple times — skips existing rows.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { DEFAULT_NAV_ITEMS } from '@/lib/nav-config';

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let created = 0;
  let skipped = 0;

  for (const item of DEFAULT_NAV_ITEMS) {
    const exists = await prisma.navMenuItem.findUnique({
      where: { lang_href: { lang: item.lang, href: item.href } },
    });
    if (exists) { skipped++; continue; }

    await prisma.navMenuItem.create({ data: item });
    created++;
  }

  revalidateTag('nav-menu');
  return NextResponse.json({ ok: true, created, skipped });
}
