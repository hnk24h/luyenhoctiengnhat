import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { apiError, ApiCode } from '@/lib/api-response';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError(ApiCode.UNAUTHORIZED, 'Unauthorized', 401);
  }

  const formData = await req.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    return apiError(ApiCode.VALIDATION, 'No file provided', 400);
  }
  if (!ALLOWED.includes(file.type)) {
    return apiError(ApiCode.VALIDATION, 'Only JPEG, PNG, GIF, WEBP allowed', 400);
  }
  if (file.size > MAX_SIZE) {
    return apiError(ApiCode.VALIDATION, 'File too large (max 5 MB)', 400);
  }

  const ext = extname(file.name) || `.${file.type.split('/')[1]}`;
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'flashcards');

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  const url = `/uploads/flashcards/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
