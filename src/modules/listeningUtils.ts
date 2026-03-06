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

export function validateListeningImportItem(input: unknown): { ok: true; item: ListeningImportItem } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Mỗi bài nghe phải là object.' };

  const payload = input as Record<string, unknown>;
  const levelCode = typeof payload.levelCode === 'string' ? payload.levelCode.trim().toUpperCase() : '';
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const mondai = typeof payload.mondai === 'string' ? payload.mondai.trim() : '';
  const question = typeof payload.question === 'string' ? payload.question.trim() : '';
  const answer = typeof payload.answer === 'string' ? payload.answer.trim() : '';
  const options = Array.isArray(payload.options)
    ? payload.options
      .filter((option: unknown): option is string => typeof option === 'string')
      .map((option: string) => option.trim())
      .filter((option: string) => Boolean(option))
    : [];
  const transcript = normalizeTranscript(payload.transcript);

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
      id: typeof payload.id === 'string' ? payload.id.trim() : undefined,
      levelCode,
      title,
      summary: typeof payload.summary === 'string' ? payload.summary.trim() : '',
      mondai,
      situation: typeof payload.situation === 'string' ? payload.situation.trim() : '',
      durationSec: typeof payload.durationSec === 'number' && Number.isFinite(payload.durationSec)
        ? Math.max(10, Math.round(payload.durationSec))
        : undefined,
      focus: typeof payload.focus === 'string' ? payload.focus.trim() : '',
      question,
      options,
      answer,
      explanation: typeof payload.explanation === 'string' ? payload.explanation.trim() : '',
      audioUrl: typeof payload.audioUrl === 'string' ? payload.audioUrl.trim() || null : null,
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
    summary: parsed.summary || record.description || 'Bài nghe luyện tập JLPT',
    situation: parsed.situation || record.description || 'Hội thoại luyện nghe',
    durationSec: parsed.durationSec ?? estimateDuration(parsed.transcript),
    focus: parsed.focus || 'Nghe ý chính và chi tiết quan trọng',
    question: parsed.question,
    options: parsed.options,
    answer: parsed.answer,
    explanation: parsed.explanation || '',
    audioUrl: parsed.audioUrl || null,
    segments: parsed.transcript,
  };
}