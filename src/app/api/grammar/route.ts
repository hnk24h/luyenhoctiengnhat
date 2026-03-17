import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang = searchParams.get('lang') ?? 'ja';
  const level = searchParams.get('level') ?? undefined;

  const patterns = await prisma.grammarPattern.findMany({
    where: { lang, ...(level ? { levelCode: level } : {}) },
    orderBy: [{ levelCode: 'asc' }, { order: 'asc' }],
  });

  return NextResponse.json(patterns);
}
