import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

// PATCH /api/admin/nav-menu/[id]  → update item
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.navMenuItem.update({
    where: { id },
    data: {
      ...(body.href        !== undefined && { href: body.href }),
      ...(body.labelKey    !== undefined && { labelKey: body.labelKey }),
      ...(body.label       !== undefined && { label: body.label ?? null }),
      ...(body.iconName    !== undefined && { iconName: body.iconName }),
      ...(body.sortOrder   !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isPrimary   !== undefined && { isPrimary: body.isPrimary }),
      ...(body.enabled     !== undefined && { enabled: body.enabled }),
      ...(body.authRequired !== undefined && { authRequired: body.authRequired }),
    },
  });

  revalidateTag('nav-menu');
  return NextResponse.json(item);
}

// DELETE /api/admin/nav-menu/[id]  → delete item
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.navMenuItem.delete({ where: { id } });

  revalidateTag('nav-menu');
  return NextResponse.json({ ok: true });
}
