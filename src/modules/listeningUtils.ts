import type { LearningLesson, LearningCategory, Level } from '@prisma/client';
import type { ListeningMondai, ListeningPractice, ListeningSegment } from './listeningContent';

type ListeningLessonRecord = LearningLesson & {
  category: LearningCategory & {
    level: Level;
  };
};

interface ListeningContentPayload {
  mondai?: string;
  summary?: string;
  situation?: string;
  durationSec?: number;
  focus?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  audioUrl?: string | null;
  transcript?: ListeningSegment[];
}

export interface ListeningImportItem {
  id?: string;
  levelCode: string;
  title: string;
  summary?: string;
  mondai: ListeningMondai;
  situation?: string;
  durationSec?: number;
  focus?: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  audioUrl?: string | null;
  transcript: ListeningSegment[];
}

const MONDAI_VALUES: ListeningMondai[] = ['Mondai 1', 'Mondai 2', 'Mondai 3', 'Mondai 4'];

function isMondai(value: string): value is ListeningMondai {
  return MONDAI_VALUES.includes(value as ListeningMondai);
}

function normalizeTranscript(raw: unknown): ListeningSegment[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((segment) => {
      if (!segment || typeof segment !== 'object') return null;
      const speaker = typeof (segment as { speaker?: unknown }).speaker === 'string'
        ? (segment as { speaker: string }).speaker.trim()
        : '';
      const text = typeof (segment as { text?: unknown }).text === 'string'
        ? (segment as { text: string }).text.trim()
        : '';

      if (!speaker || !text) return null;
      return { speaker, text };
    })
    .filter((segment): segment is ListeningSegment => Boolean(segment));
}

export function parseListeningContent(content: string | null | undefined): ListeningContentPayload | null {
  if (!content?.trim()) return null;

  try {
    const parsed = JSON.parse(content) as ListeningContentPayload;
    return {
      mondai: typeof parsed.mondai === 'string' ? parsed.mondai.trim() : undefined,
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : undefined,
      situation: typeof parsed.situation === 'string' ? parsed.situation.trim() : undefined,
      durationSec: typeof parsed.durationSec === 'number' && Number.isFinite(parsed.durationSec)
        ? Math.max(10, Math.round(parsed.durationSec))
        : undefined,
      focus: typeof parsed.focus === 'string' ? parsed.focus.trim() : undefined,
      question: typeof parsed.question === 'string' ? parsed.question.trim() : undefined,
      options: Array.isArray(parsed.options)
        ? parsed.options.filter((option): option is string => typeof option === 'string').map((option) => option.trim()).filter(Boolean)
        : undefined,
      answer: typeof parsed.answer === 'string' ? parsed.answer.trim() : undefined,
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation.trim() : undefined,
      audioUrl: typeof parsed.audioUrl === 'string' ? parsed.audioUrl.trim() || null : null,
      transcript: normalizeTranscript(parsed.transcript),
    };
  } catch {
    return null;
  }
}

export function serializeListeningContent(item: ListeningImportItem) {
  return JSON.stringify({
    mondai: item.mondai,
    summary: item.summary?.trim() || '',
    situation: item.situation?.trim() || '',
    durationSec: item.durationSec ?? estimateDuration(item.transcript),
    focus: item.focus?.trim() || '',
    question: item.question.trim(),
    options: item.options.map((option) => option.trim()).filter(Boolean),
    answer: item.answer.trim(),
    explanation: item.explanation?.trim() || '',
    audioUrl: item.audioUrl?.trim() || null,
    transcript: item.transcript.map((segment) => ({ speaker: segment.speaker.trim(), text: segment.text.trim() })),
  });
}

export function estimateDuration(transcript: ListeningSegment[]) {
  const totalChars = transcript.reduce((sum, segment) => sum + segment.text.length, 0);
  return Math.max(20, Math.round(totalChars / 5));
}

export function validateListeningImportItem(input: any): { ok: true; item: ListeningImportItem } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Mỗi bài nghe phải là object.' };

  const levelCode = typeof input.levelCode === 'string' ? input.levelCode.trim().toUpperCase() : '';
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const mondai = typeof input.mondai === 'string' ? input.mondai.trim() : '';
  const question = typeof input.question === 'string' ? input.question.trim() : '';
  const answer = typeof input.answer === 'string' ? input.answer.trim() : '';
  const options = Array.isArray(input.options)
    ? input.options.filter((option: unknown): option is string => typeof option === 'string').map((option) => option.trim()).filter(Boolean)
    : [];
  const transcript = normalizeTranscript(input.transcript);

  if (!levelCode) return { ok: false, error: 'Thiếu levelCode.' };
  if (!title) return { ok: false, error: 'Thiếu title.' };
  if (!isMondai(mondai)) return { ok: false, error: 'mondai phải là Mondai 1-4.' };
  if (!question) return { ok: false, error: 'Thiếu question.' };
  if (options.length < 2) return { ok: false, error: 'Cần ít nhất 2 options.' };
  if (!answer) return { ok: false, error: 'Thiếu answer.' };
  if (!options.includes(answer)) return { ok: false, error: 'answer phải nằm trong options.' };
  if (transcript.length === 0) return { ok: false, error: 'Transcript phải có ít nhất 1 dòng.' };

  return {
    ok: true,
    item: {
      id: typeof input.id === 'string' ? input.id.trim() : undefined,
      levelCode,
      title,
      summary: typeof input.summary === 'string' ? input.summary.trim() : '',
      mondai,
      situation: typeof input.situation === 'string' ? input.situation.trim() : '',
      durationSec: typeof input.durationSec === 'number' && Number.isFinite(input.durationSec)
        ? Math.max(10, Math.round(input.durationSec))
        : undefined,
      focus: typeof input.focus === 'string' ? input.focus.trim() : '',
      question,
      options,
      answer,
      explanation: typeof input.explanation === 'string' ? input.explanation.trim() : '',
      audioUrl: typeof input.audioUrl === 'string' ? input.audioUrl.trim() || null : null,
      transcript,
    },
  };
}

export function mapLessonToListeningPractice(record: ListeningLessonRecord): ListeningPractice | null {
  const parsed = parseListeningContent(record.content);
  if (!parsed?.mondai || !parsed.question || !parsed.answer || !parsed.options?.length || !parsed.transcript?.length) {
    return null;
  }
  if (!isMondai(parsed.mondai)) return null;

  return {
    id: record.id,
    level: record.category.level.code as ListeningPractice['level'],
    mondai: parsed.mondai,
    title: record.title,
    summary: parsed.summary || record.description || 'Bai nghe luyen tap JLPT',
    situation: parsed.situation || record.description || 'Hoi thoai luyen nghe',
    durationSec: parsed.durationSec ?? estimateDuration(parsed.transcript),
    focus: parsed.focus || 'Nghe y chinh va chi tiet quan trong',
    question: parsed.question,
    options: parsed.options,
    answer: parsed.answer,
    explanation: parsed.explanation || '',
    audioUrl: parsed.audioUrl || null,
    segments: parsed.transcript,
  };
}