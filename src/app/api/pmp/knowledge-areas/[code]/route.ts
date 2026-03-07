import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/pmp/knowledge-areas/[code]
 * Returns one PMPKnowledgeArea with all its processes (including process group info).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  const ka = await prisma.pMPKnowledgeArea.findUnique({
    where: { code },
    include: {
      processes: {
        include: {
          processGroup: {
            select: { code: true, name: true, nameVi: true, order: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!ka) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(ka);
}
