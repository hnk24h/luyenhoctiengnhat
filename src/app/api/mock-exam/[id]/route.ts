import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/mock-exam/[id] — get a single mock exam with sections and questions (answers stripped)
export async function GET(
  _req: NextRequest,
  { params: rawParams }: { params: Promise<{ id: string }> },
) {
  const { id } = await rawParams;

  const exam = await prisma.mockExam.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true, sectionId: true, partLabel: true, partTitle: true,
              passageText: true, passageAudio: true, passageImage: true,
              content: true, options: true, audioUrl: true, imageUrl: true, order: true,
              // answer & explain NOT sent to client
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(exam);
}
