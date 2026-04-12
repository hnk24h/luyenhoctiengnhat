import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Import a full mock exam from JSON.
 *
 * Expected body:
 * {
 *   title: string,
 *   description?: string,
 *   subject: "JLPT" | "BJT",
 *   levelCode: string,
 *   totalTime: number,          // seconds
 *   year?: number,
 *   sections: [{
 *     title: string,
 *     titleVi?: string,
 *     skill: string,
 *     timeLimit: number,         // seconds
 *     questions: [{
 *       partLabel?: string,
 *       partTitle?: string,
 *       passageText?: string,
 *       passageAudio?: string,
 *       passageImage?: string,
 *       content: string,
 *       options: string[],       // ["A) ...", "B) ...", ...]
 *       answer: string,          // correct option key e.g. "A"
 *       explain?: string,
 *       audioUrl?: string,
 *       imageUrl?: string,
 *     }]
 *   }]
 * }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, subject, levelCode, totalTime, year, sections } = body;

  if (!title || !subject || !levelCode || !sections?.length) {
    return NextResponse.json({ message: 'Thiếu thông tin bắt buộc (title, subject, levelCode, sections).' }, { status: 400 });
  }

  const validSubjects = ['JLPT', 'BJT'];
  if (!validSubjects.includes(subject)) {
    return NextResponse.json({ message: `Subject phải là: ${validSubjects.join(', ')}` }, { status: 400 });
  }

  const exam = await prisma.$transaction(async (tx) => {
    const created = await tx.mockExam.create({
      data: {
        title,
        description: description || null,
        subject,
        levelCode,
        totalTime: totalTime || 0,
        year: year || null,
        published: false,
      },
    });

    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      if (!sec.title || !sec.skill) continue;

      const section = await tx.mockExamSection.create({
        data: {
          mockExamId: created.id,
          title: sec.title,
          titleVi: sec.titleVi || null,
          skill: sec.skill,
          timeLimit: sec.timeLimit || 0,
          order: si,
        },
      });

      if (sec.questions?.length) {
        await tx.mockExamQuestion.createMany({
          data: sec.questions.map((q: any, qi: number) => ({
            sectionId: section.id,
            partLabel: q.partLabel || null,
            partTitle: q.partTitle || null,
            passageText: q.passageText || null,
            passageAudio: q.passageAudio || null,
            passageImage: q.passageImage || null,
            content: q.content || '',
            options: q.options || [],
            answer: q.answer || '',
            explain: q.explain || null,
            audioUrl: q.audioUrl || null,
            imageUrl: q.imageUrl || null,
            order: qi,
          })),
        });
      }
    }

    return tx.mockExam.findUnique({
      where: { id: created.id },
      include: {
        sections: { include: { _count: { select: { questions: true } } }, orderBy: { order: 'asc' } },
      },
    });
  });

  return NextResponse.json(exam, { status: 201 });
}
