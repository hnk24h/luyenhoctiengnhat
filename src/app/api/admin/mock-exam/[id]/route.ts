import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request, { params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const exam = await prisma.mockExam.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        include: { questions: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      _count: { select: { sessions: true } },
    },
  });
  if (!exam) return NextResponse.json({ message: 'Không tìm thấy.' }, { status: 404 });
  return NextResponse.json(exam);
}

export async function PUT(req: Request, { params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const body = await req.json();
  const { title, description, subject, levelCode, totalTime, published } = body;
  const updated = await prisma.mockExam.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(subject !== undefined && { subject }),
      ...(levelCode !== undefined && { levelCode }),
      ...(totalTime !== undefined && { totalTime }),
      ...(published !== undefined && { published }),
    },
    include: {
      sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  // Cascade: delete answers → sessions → questions → sections → exam
  await prisma.$transaction(async (tx) => {
    const sections = await tx.mockExamSection.findMany({ where: { mockExamId: params.id }, select: { id: true } });
    const sectionIds = sections.map(s => s.id);
    await tx.mockExamAnswer.deleteMany({ where: { sectionId: { in: sectionIds } } });
    await tx.mockExamSession.deleteMany({ where: { mockExamId: params.id } });
    await tx.mockExamQuestion.deleteMany({ where: { sectionId: { in: sectionIds } } });
    await tx.mockExamSection.deleteMany({ where: { mockExamId: params.id } });
    await tx.mockExam.delete({ where: { id: params.id } });
  });
  return NextResponse.json({ message: 'Đã xóa.' });
}
