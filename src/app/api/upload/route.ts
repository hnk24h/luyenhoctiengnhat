import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/aac'];
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mime = file.type;
    const isAudio = ALLOWED_AUDIO.includes(mime);
    const isImage = ALLOWED_IMAGE.includes(mime);

    if (!isAudio && !isImage) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const maxBytes = isAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File too large (max ${maxBytes / 1024 / 1024} MB)` }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? (isAudio ? 'mp3' : 'jpg');
    const subDir = isAudio ? 'audio' : 'images';
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
    const fileName = `${timestamp}_${safeName}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${subDir}/${fileName}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
