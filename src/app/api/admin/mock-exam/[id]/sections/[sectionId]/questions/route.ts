import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Add a question to a section */
export async function POST(req: Request, { params: rawParams }: { params: Promise<{ id: string; sectionId: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const body = await req.json();
  const count = await prisma.mockExamQuestion.count({ where: { sectionId: params.sectionId } });
  const q = await prisma.mockExamQuestion.create({
    data: {
      sectionId: params.sectionId,
      partLabel: body.partLabel || null,
      partTitle: body.partTitle || null,
      passageText: body.passageText || null,
      passageAudio: body.passageAudio || null,
      passageImage: body.passageImage || null,
      content: body.content || '',
      options: body.options || [],
      answer: body.answer || '',
      explain: body.explain || null,
      audioUrl: body.audioUrl || null,
      imageUrl: body.imageUrl || null,
      order: count,
    },
  });
  return NextResponse.json(q, { status: 201 });
}

/* Update or delete a question */
export async function PUT(req: Request, { params: rawParams }: { params: Promise<{ id: string; sectionId: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const body = await req.json();
  const { questionId, ...data } = body;
  if (!questionId) return NextResponse.json({ message: 'Thiếu questionId.' }, { status: 400 });
  const updated = await prisma.mockExamQuestion.update({
    where: { id: questionId },
    data: {
      ...(data.partLabel !== undefined && { partLabel: data.partLabel || null }),
      ...(data.partTitle !== undefined && { partTitle: data.partTitle || null }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.options !== undefined && { options: data.options }),
      ...(data.answer !== undefined && { answer: data.answer }),
      ...(data.explain !== undefined && { explain: data.explain || null }),
      ...(data.passageText !== undefined && { passageText: data.passageText || null }),
      ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params: rawParams }: { params: Promise<{ id: string; sectionId: string }> }) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }
  const { questionId } = await req.json();
  if (!questionId) return NextResponse.json({ message: 'Thiếu questionId.' }, { status: 400 });
  await prisma.mockExamAnswer.deleteMany({ where: { questionId } });
  await prisma.mockExamQuestion.delete({ where: { id: questionId } });
  return NextResponse.json({ message: 'Đã xóa.' });
}
