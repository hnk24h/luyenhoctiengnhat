import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  // Seed levels
  const levelData = [
    { code: 'N5', name: 'Sơ cấp', description: 'Cấp độ cơ bản nhất', order: 1 },
    { code: 'N4', name: 'Sơ trung cấp', description: 'Tiếp theo sau N5', order: 2 },
    { code: 'N3', name: 'Trung cấp', description: 'Mức độ trung bình', order: 3 },
    { code: 'N2', name: 'Trung cao cấp', description: 'Gần như thành thạo', order: 4 },
    { code: 'N1', name: 'Cao cấp', description: 'Thành thạo hoàn toàn', order: 5 },
  ];
  for (const l of levelData) {
    await prisma.level.upsert({ where: { code: l.code }, update: {}, create: l });
  }

  const n5 = await prisma.level.findUnique({ where: { code: 'N5' } });
  if (!n5) return NextResponse.json({ message: 'Lỗi seed.' }, { status: 500 });

  // Seed 1 exam set nghe N5
  const existing = await prisma.examSet.findFirst({ where: { levelId: n5.id, skill: 'nghe', title: '[Mẫu] Nghe hiểu N5 - Đề 1' } });
  if (!existing) {
    const set = await prisma.examSet.create({
      data: {
        levelId: n5.id, skill: 'nghe', title: '[Mẫu] Nghe hiểu N5 - Đề 1',
        description: 'Bộ đề nghe hiểu mẫu cho N5', timeLimit: 1800,
      },
    });
    await prisma.question.createMany({
      data: [
        { examSetId: set.id, type: 'tracnghiem', content: 'Người phụ nữ đang làm gì?', options: ['Nấu ăn', 'Đọc sách', 'Xem TV', 'Mua sắm'], answer: 'Đọc sách', explain: 'Từ audio cho biết người phụ nữ đang đọc sách.', order: 1 },
        { examSetId: set.id, type: 'tracnghiem', content: 'Hai người đang nói chuyện ở đâu?', options: ['Nhà hàng', 'Nhà ga', 'Công viên', 'Siêu thị'], answer: 'Nhà ga', explain: '「駅」(えき) có nghĩa là nhà ga.', order: 2 },
        { examSetId: set.id, type: 'tracnghiem', content: 'Mấy giờ thì cuộc họp bắt đầu?', options: ['9:00', '10:00', '14:00', '15:00'], answer: '10:00', order: 3 },
      ],
    });

    // Seed đề đọc N5
    const setDoc = await prisma.examSet.create({
      data: {
        levelId: n5.id, skill: 'doc', title: '[Mẫu] Đọc hiểu N5 - Đề 1',
        description: 'Bộ đề đọc hiểu mẫu cho N5', timeLimit: 2100,
      },
    });
    await prisma.question.createMany({
      data: [
        { examSetId: setDoc.id, type: 'tracnghiem', content: 'わたしは まいにち （　　） をのみます。\n--- "（　　）" に はいる ことばは なんですか？', options: JSON.stringify(['みず', 'たべもの', 'くるま', 'でんき']), answer: 'みず', explain: '「のむ」(飲む) = uống, phải dùng với nước uống.', order: 1 },
        { examSetId: setDoc.id, type: 'tracnghiem', content: 'この 文の いみは なんですか？\n「かのじょは がっこうに いきません。」', options: JSON.stringify(['Cô ấy đến trường.', 'Cô ấy không đến trường.', 'Cô ấy đến nhà.', 'Cô ấy đi làm.']), answer: 'Cô ấy không đến trường.', explain: '「いきません」= phủ định của いきます = không đi.', order: 2 },
        { examSetId: setDoc.id, type: 'dien_tu', content: 'Điền từ thích hợp:\nきのう、わたしは ともだちと _____ を たべました。 (ramen)', answer: 'ラーメン', explain: 'ラーメン = ramen.', order: 3 },
      ],
    });

    // Seed đề viết N5
    const setViet = await prisma.examSet.create({
      data: {
        levelId: n5.id, skill: 'viet', title: '[Mẫu] Chữ Kanji N5 - Đề 1',
        description: 'Bài tập viết và nhận biết Kanji N5', timeLimit: 1200,
      },
    });
    await prisma.question.createMany({
      data: [
        { examSetId: setViet.id, type: 'tracnghiem', content: '「山」の よみかたは？', options: JSON.stringify(['やま', 'かわ', 'うみ', 'そら']), answer: 'やま', explain: '山 = núi, đọc là やま (yama).', order: 1 },
        { examSetId: setViet.id, type: 'tracnghiem', content: '「水」の よみかたは？', options: JSON.stringify(['ひ', 'みず', 'き', 'つち']), answer: 'みず', explain: '水 = nước, đọc là みず (mizu).', order: 2 },
        { examSetId: setViet.id, type: 'dien_tu', content: '「fire」を かんじで かいてください。', answer: '火', explain: '火 = hiragana: ひ, âm Hán Việt: Hỏa = lửa.', order: 3 },
      ],
    });
  }

  return NextResponse.json({ message: 'Seed dữ liệu mẫu thành công!' });
}
