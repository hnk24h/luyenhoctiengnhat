import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject') as string | null;
  const exams = await prisma.mockExam.findMany({
    where: subject ? { subject: subject as any } : {},
    include: {
      sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  });
  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const body = await req.json();
  const { title, description, subject, levelCode, totalTime, sections } = body;
  if (!title || !subject || !levelCode) {
    return NextResponse.json({ message: 'Thiếu thông tin bắt buộc.' }, { status: 400 });
  }
  const exam = await prisma.mockExam.create({
    data: {
      title,
      description: description || null,
      subject,
      levelCode,
      totalTime: totalTime || 0,
      sections: sections?.length ? {
        create: sections.map((s: any, i: number) => ({
          title: s.title,
          titleVi: s.titleVi || null,
          skill: s.skill,
          timeLimit: s.timeLimit || 0,
          order: i,
        })),
      } : undefined,
    },
    include: {
      sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { sessions: true } },
    },
  });
  return NextResponse.json(exam, { status: 201 });
}
