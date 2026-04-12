'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  FaBookOpen, FaChevronRight, FaFilePdf,
  FaPenNib, FaLayerGroup, FaMagnifyingGlass, FaPlay,
  FaPause, FaRotateLeft, FaVolumeHigh, FaForwardStep,
  FaCheck, FaFire, FaBolt, FaGraduationCap, FaShuffle,
  FaArrowLeft, FaArrowRight,
} from 'react-icons/fa6';
import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface KanjiLevel { level: string; kanjiCount: number; lessonCount: number }
interface KanjiItem {
  id: string; character: string; meaning: string; onyomi?: string | null;
  kunyomi?: string | null; pinyin?: string | null; strokeCount: number;
  lesson: number; order: number;
}
interface LessonGroup { lesson: number; count: number; preview: string[]; items: KanjiItem[] }
interface LevelData { level: string; totalKanji: number; lessons: LessonGroup[] }
interface KanjiExample {
  word: string; reading: string; meaning: string;
  sentence?: string; sentenceReading?: string; sentenceMeaning?: string;
}
interface KanjiDetail extends KanjiItem {
  radical?: string | null; radicalMeaning?: string | null;
  examples?: KanjiExample[] | null;
  strokeOrder?: { d: string }[] | null;
  svgContent?: string | null;
}

// ─── Level meta colors ────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  N5: '#22C55E', N4: '#3B82F6', N3: '#8B5CF6', N2: '#F59E0B', N1: '#EF4444',
  HSK1: '#22C55E', HSK2: '#3B82F6', HSK3: '#8B5CF6', HSK4: '#F59E0B', HSK5: '#EF4444', HSK6: '#DC2626',
};

const LANG_LABELS: Record<string, { title: string; charName: string; levels: string[] }> = {
  ja: { title: 'Học Kanji', charName: 'Kanji', levels: ['N5', 'N4', 'N3', 'N2', 'N1'] },
  zh: { title: 'Học Hán Tự', charName: 'Hán tự', levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] },
  ko: { title: 'Học Hanja', charName: 'Hanja', levels: ['TOPIK1', 'TOPIK2'] },
};

// ─── PDF Export ────────────────────────────────────────────────────────────────
async function exportKanjiPDF(kanjiList: KanjiItem[], level: string, lesson?: number) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210, pageH = 297;
  const margin = 15;
  const cellSize = 18; // standard kanji practice cell
  const cols = Math.floor((pageW - margin * 2) / cellSize);
  const practiceRows = 6; // rows of empty cells per kanji for practice

  let y = margin;

  // Title
  doc.setFontSize(14);
  doc.text(`${level} ${lesson ? `Bài ${lesson}` : ''} - Luyện viết Kanji`, margin, y);
  y += 10;

  for (const kanji of kanjiList) {
    // Check if we need a new page
    const blockHeight = cellSize + (practiceRows * cellSize) + 12;
    if (y + blockHeight > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    // Kanji info line
    doc.setFontSize(8);
    doc.setTextColor(100);
    const info = [kanji.meaning];
    doc.text(info.join(' | '), margin, y);
    y += 5;

    // Draw the model character in first cell
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, cellSize, cellSize);
    // Cross guidelines in cell (like real kanji practice paper)
    doc.setDrawColor(220);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y + cellSize / 2, margin + cellSize, y + cellSize / 2); // horizontal
    doc.line(margin + cellSize / 2, y, margin + cellSize / 2, y + cellSize); // vertical
    doc.setLineDashPattern([], 0);

    // Character text (large)
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(kanji.character, margin + cellSize / 2, y + cellSize / 2 + 5, { align: 'center' });

    // Empty practice cells
    for (let c = 1; c < cols; c++) {
      const cx = margin + c * cellSize;
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, cellSize, cellSize);
      // Guidelines
      doc.setDrawColor(230);
      doc.setLineWidth(0.1);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(cx, y + cellSize / 2, cx + cellSize, y + cellSize / 2);
      doc.line(cx + cellSize / 2, y, cx + cellSize / 2, y + cellSize);
      doc.setLineDashPattern([], 0);
    }
    y += cellSize;

    // Additional practice rows (empty grid)
    for (let row = 0; row < practiceRows - 1; row++) {
      for (let c = 0; c < cols; c++) {
        const cx = margin + c * cellSize;
        doc.setDrawColor(210);
        doc.setLineWidth(0.2);
        doc.rect(cx, y, cellSize, cellSize);
        doc.setDrawColor(235);
        doc.setLineWidth(0.1);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(cx, y + cellSize / 2, cx + cellSize, y + cellSize / 2);
        doc.line(cx + cellSize / 2, y, cx + cellSize / 2, y + cellSize);
        doc.setLineDashPattern([], 0);
      }
      y += cellSize;
    }

    y += 4; // spacing between kanji
  }

  doc.save(`kanji-practice-${level}${lesson ? `-lesson${lesson}` : ''}.pdf`);
}

// ─── TTS Audio Helper ──────────────────────────────────────────────────────────
function speakText(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'ko-KR';
  utterance.rate = 0.8;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

function AudioButton({ text, lang, size = 'sm' }: { text: string; lang: string; size?: 'sm' | 'xs' }) {
  const [speaking, setSpeaking] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeaking(true);
    speakText(text, lang);
    setTimeout(() => setSpeaking(false), 1500);
  };
  return (
    <button onClick={handleClick} title="Nghe phát âm"
      className={`shrink-0 rounded-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
        size === 'sm' ? 'w-7 h-7' : 'w-5 h-5'
      }`}
      style={{
        background: speaking ? 'var(--primary)' : 'var(--bg-muted)',
        color: speaking ? '#fff' : 'var(--primary)',
      }}>
      <FaVolumeHigh size={size === 'sm' ? 11 : 9} />
    </button>
  );
}

// ─── Progress Tracking (localStorage) ──────────────────────────────────────────
interface KanjiProgress {
  learned: string[];
  lastStudyDate: string;
  streak: number;
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

function useKanjiProgress(lang: string) {
  const storageKey = `kanji-progress-${lang}`;
  const [progress, setProgress] = useState<KanjiProgress>({ learned: [], lastStudyDate: '', streak: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as KanjiProgress;
        // Check if streak should reset (missed a day)
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastStudyDate && parsed.lastStudyDate !== today && !isYesterday(parsed.lastStudyDate)) {
          parsed.streak = 0;
        }
        setProgress(parsed);
      }
    } catch { /* ignore */ }
  }, [storageKey]);

  const save = useCallback((p: KanjiProgress) => {
    setProgress(p);
    localStorage.setItem(storageKey, JSON.stringify(p));
  }, [storageKey]);

  const markLearned = useCallback((kanjiId: string) => {
    setProgress(prev => {
      if (prev.learned.includes(kanjiId)) return prev;
      const today = new Date().toISOString().split('T')[0];
      const streak = prev.lastStudyDate === today
        ? prev.streak
        : isYesterday(prev.lastStudyDate)
          ? prev.streak + 1
          : 1;
      const next = { learned: [...prev.learned, kanjiId], lastStudyDate: today, streak };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const unmarkLearned = useCallback((kanjiId: string) => {
    setProgress(prev => {
      const next = { ...prev, learned: prev.learned.filter(id => id !== kanjiId) };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const isLearned = useCallback((kanjiId: string) => progress.learned.includes(kanjiId), [progress.learned]);

  return { progress, markLearned, unmarkLearned, isLearned, save };
}

type LearningMode = 'grid' | 'study' | 'practice';

// ─── Study Mode (full-width sequential study) ─────────────────────────────────
function StudyModeView({
  kanjiList, lang, currentIdx, setCurrentIdx, isLearned, markLearned, unmarkLearned, onExit,
}: {
  kanjiList: KanjiItem[]; lang: string; currentIdx: number;
  setCurrentIdx: (i: number) => void;
  isLearned: (id: string) => boolean; markLearned: (id: string) => void;
  unmarkLearned: (id: string) => void; onExit: () => void;
}) {
  const k = kanjiList[currentIdx];
  const [detail, setDetail] = useState<KanjiDetail | null>(null);
  const learned = isLearned(k.id);

  useEffect(() => {
    fetch(`/api/kanji/${k.id}`).then(r => r.json()).then(setDetail);
  }, [k.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIdx > 0) setCurrentIdx(currentIdx - 1);
      if (e.key === 'ArrowRight' && currentIdx < kanjiList.length - 1) setCurrentIdx(currentIdx + 1);
      if (e.key === ' ') { e.preventDefault(); learned ? unmarkLearned(k.id) : markLearned(k.id); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, kanjiList.length, setCurrentIdx, learned, k.id, markLearned, unmarkLearned]);

  const data = detail || k;
  const examples = (detail as KanjiDetail)?.examples || [];

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <FaArrowLeft size={10} /> Quay lại
        </button>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-bold" style={{ color: 'var(--primary)' }}>{currentIdx + 1}</span>
          <span>/</span>
          <span>{kanjiList.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / kanjiList.length) * 100}%`, background: 'var(--primary)' }} />
      </div>

      {/* Main card */}
      <div className="rounded-2xl p-6 space-y-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Stroke animation centered */}
        <div className="flex justify-center">
          <StrokeAnimation character={data.character} />
        </div>

        {/* Character + meaning + audio */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.meaning}</h2>
            <AudioButton text={data.character} lang={lang} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {data.strokeCount} nét
            {(detail as KanjiDetail)?.radical && ` • Bộ: ${(detail as KanjiDetail).radical} (${(detail as KanjiDetail).radicalMeaning})`}
          </p>
        </div>

        {/* Readings */}
        <div className="grid grid-cols-2 gap-3">
          {lang === 'ja' && (
            <>
              {data.onyomi && (
                <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
                  <div>
                    <div className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>音読み (On)</div>
                    <div className="text-base font-bold" style={{ color: 'var(--primary)' }}>{data.onyomi}</div>
                  </div>
                  <AudioButton text={data.onyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                </div>
              )}
              {data.kunyomi && (
                <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
                  <div>
                    <div className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>訓読み (Kun)</div>
                    <div className="text-base font-bold" style={{ color: '#059669' }}>{data.kunyomi}</div>
                  </div>
                  <AudioButton text={data.kunyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                </div>
              )}
            </>
          )}
          {lang === 'zh' && data.pinyin && (
            <div className="rounded-xl p-3 col-span-2 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
              <div>
                <div className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Pinyin</div>
                <div className="text-base font-bold" style={{ color: 'var(--primary)' }}>{data.pinyin}</div>
              </div>
              <AudioButton text={data.character} lang={lang} size="xs" />
            </div>
          )}
        </div>

        {/* Examples */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Từ vựng & Ví dụ</h3>
            {examples.map((ex: KanjiExample, i: number) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 p-3" style={{ background: 'var(--bg-muted)' }}>
                  <div className="flex-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{ex.word}</span>
                    <span className="text-[10px] ml-1.5" style={{ color: 'var(--primary)' }}>{ex.reading}</span>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ex.meaning}</div>
                  </div>
                  <AudioButton text={ex.word} lang={lang} size="xs" />
                </div>
                {ex.sentence && (
                  <div className="px-3 py-2 flex items-start gap-2" style={{ background: 'var(--bg-surface)' }}>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{ex.sentence}</p>
                      {ex.sentenceReading && <p className="text-[9px] mt-0.5" style={{ color: 'var(--primary)', opacity: 0.7 }}>{ex.sentenceReading}</p>}
                      {ex.sentenceMeaning && <p className="text-[9px] mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{ex.sentenceMeaning}</p>}
                    </div>
                    <AudioButton text={ex.sentence} lang={lang} size="xs" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mark learned button */}
        <button onClick={() => learned ? unmarkLearned(k.id) : markLearned(k.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: learned ? '#22C55E18' : 'var(--primary)',
            color: learned ? '#22C55E' : '#fff',
            border: learned ? '2px solid #22C55E40' : 'none',
          }}>
          <FaCheck size={12} />
          {learned ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}
        </button>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-30"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <FaArrowLeft size={11} /> Chữ trước
        </button>
        <button onClick={() => setCurrentIdx(Math.min(kanjiList.length - 1, currentIdx + 1))} disabled={currentIdx === kanjiList.length - 1}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-30"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          Chữ tiếp <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Quick Practice Mode (flashcard) ───────────────────────────────────────────
function QuickPracticeView({
  kanjiList, lang, isLearned, markLearned, onExit,
}: {
  kanjiList: KanjiItem[]; lang: string;
  isLearned: (id: string) => boolean; markLearned: (id: string) => void;
  onExit: () => void;
}) {
  const [shuffled, setShuffled] = useState<KanjiItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    const arr = [...kanjiList].sort(() => Math.random() - 0.5);
    setShuffled(arr);
    setIdx(0);
    setFlipped(false);
    setStats({ correct: 0, wrong: 0 });
  }, [kanjiList]);

  const reshuffle = () => {
    const arr = [...kanjiList].sort(() => Math.random() - 0.5);
    setShuffled(arr);
    setIdx(0);
    setFlipped(false);
    setStats({ correct: 0, wrong: 0 });
  };

  const k = shuffled[idx];
  const isFinished = idx >= shuffled.length;

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      markLearned(k.id);
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }
    setFlipped(false);
    setIdx(i => i + 1);
  };

  useEffect(() => {
    if (isFinished || !k) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      if (flipped && e.key === 'ArrowRight') handleAnswer(true);
      if (flipped && e.key === 'ArrowLeft') handleAnswer(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (isFinished) {
    const total = stats.correct + stats.wrong;
    const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Hoàn thành!</h2>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { label: 'Đúng', value: stats.correct, color: '#22C55E' },
            { label: 'Sai', value: stats.wrong, color: '#EF4444' },
            { label: 'Tỷ lệ', value: `${pct}%`, color: 'var(--primary)' },
          ].map(s => (
            <div key={s.label} className="text-center rounded-xl p-3" style={{ background: 'var(--bg-muted)' }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={reshuffle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <FaShuffle size={11} /> Luyện lại
          </button>
          <button onClick={onExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            Thoát
          </button>
        </div>
      </div>
    );
  }

  if (!k) return null;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <FaArrowLeft size={10} /> Quay lại
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: '#22C55E' }}>✓ {stats.correct}</span>
          <span style={{ color: '#EF4444' }}>✗ {stats.wrong}</span>
          <span style={{ color: 'var(--text-muted)' }}>{idx + 1}/{shuffled.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${((idx + 1) / shuffled.length) * 100}%`, background: 'var(--primary)' }} />
      </div>

      {/* Flashcard */}
      <button onClick={() => setFlipped(f => !f)}
        className="w-full rounded-2xl p-8 text-center transition-all cursor-pointer hover:shadow-lg"
        style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)', minHeight: '280px',
        }}>
        <div className="text-7xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {k.character}
        </div>
        {!flipped ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa • Space</p>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{k.meaning}</div>
            <div className="flex items-center justify-center gap-4 text-sm">
              {lang === 'ja' && k.onyomi && <span style={{ color: 'var(--primary)' }}>On: {k.onyomi}</span>}
              {lang === 'ja' && k.kunyomi && <span style={{ color: '#059669' }}>Kun: {k.kunyomi}</span>}
              {lang === 'zh' && k.pinyin && <span style={{ color: 'var(--primary)' }}>{k.pinyin}</span>}
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{k.strokeCount} nét</p>
            {isLearned(k.id) && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#22C55E18', color: '#22C55E' }}>
                <FaCheck size={8} /> Đã thuộc
              </span>
            )}
          </div>
        )}
      </button>

      {/* Answer buttons (show after flip) */}
      {flipped && (
        <div className="flex items-center gap-3">
          <button onClick={() => handleAnswer(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: '#EF444418', color: '#EF4444', border: '1px solid #EF444430' }}>
            Chưa biết ←
          </button>
          <button onClick={() => handleAnswer(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: '#22C55E', color: '#fff' }}>
            Biết rồi! →
          </button>
        </div>
      )}

      <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
        Space = lật • ← Chưa biết • → Biết rồi
      </p>
    </div>
  );
}

// ─── Stroke Animation Component ───────────────────────────────────────────────
function StrokeAnimation({ character, compact }: { character: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const animRef = useRef<number | null>(null);

  const charCode = character.charCodeAt(0).toString(16).padStart(5, '0');
  const svgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${charCode}.svg`;

  const [svgData, setSvgData] = useState<string | null>(null);
  const [paths, setPaths] = useState<SVGPathElement[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    setSvgData(null);
    setPaths([]);
    setCurrentStroke(0);
    setPlaying(false);

    fetch(svgUrl)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => {
        setSvgData(text);
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const pathEls = doc.querySelectorAll('path[d]');
        setPaths(Array.from(pathEls) as unknown as SVGPathElement[]);
      })
      .catch(() => setLoadError(true));
  }, [character, svgUrl]);

  const reset = useCallback(() => {
    setCurrentStroke(0);
    setPlaying(false);
    if (animRef.current) clearTimeout(animRef.current as unknown as number);
  }, []);

  const play = useCallback(() => {
    if (paths.length === 0) return;
    setPlaying(true);
    setCurrentStroke(0);
    let stroke = 0;
    const animate = () => {
      stroke++;
      setCurrentStroke(stroke);
      if (stroke < paths.length) {
        animRef.current = window.setTimeout(() => animate(), 500) as unknown as number;
      } else {
        setPlaying(false);
      }
    };
    animRef.current = window.setTimeout(() => animate(), 250) as unknown as number;
  }, [paths]);

  const stepForward = useCallback(() => {
    if (currentStroke < paths.length) {
      setCurrentStroke(s => s + 1);
    }
  }, [currentStroke, paths.length]);

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current as unknown as number); };
  }, []);

  const boxSize = compact ? 'w-40 h-40' : 'w-48 h-48';

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${boxSize} rounded-2xl flex items-center justify-center font-bold`}
          style={{ background: 'var(--bg-muted)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontSize: compact ? '4rem' : '5rem' }}>
          {character}
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Hãy viết theo thứ tự nét chuẩn</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG display */}
      <div className={`relative ${boxSize} rounded-2xl overflow-hidden`}
        style={{ background: 'var(--bg-muted)', border: '2px solid var(--border)' }}>
        {/* Grid guidelines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 109 109" xmlns="http://www.w3.org/2000/svg">
          <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1="0" y1="0" x2="109" y2="109" stroke="var(--border)" strokeWidth="0.3" strokeDasharray="4,4" opacity={0.4} />
          <line x1="109" y1="0" x2="0" y2="109" stroke="var(--border)" strokeWidth="0.3" strokeDasharray="4,4" opacity={0.4} />
        </svg>

        {/* Stroke paths */}
        {svgData && paths.length > 0 && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 109 109" xmlns="http://www.w3.org/2000/svg">
            {/* Ghost strokes (future) */}
            {paths.map((p, i) => {
              if (i < currentStroke) return null;
              const d = p.getAttribute('d') || '';
              return (
                <path key={`ghost-${i}`} d={d} fill="none"
                  stroke="var(--text-muted)" strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round" opacity={0.1} />
              );
            })}
            {/* Visible strokes */}
            {paths.map((p, i) => {
              const d = p.getAttribute('d') || '';
              const isVisible = i < currentStroke;
              const isCurrent = i === currentStroke - 1;
              if (!isVisible) return null;
              return (
                <path key={i} d={d} fill="none"
                  stroke={isCurrent && playing ? '#EF4444' : 'var(--text-primary)'}
                  strokeWidth={isCurrent ? 4.5 : 3}
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition: 'stroke 0.3s, stroke-width 0.15s' }} />
              );
            })}
            {/* Stroke number labels */}
            {paths.map((p, i) => {
              if (i >= currentStroke) return null;
              const d = p.getAttribute('d') || '';
              // Extract first coordinate from path as label position
              const match = d.match(/[ML]\s*([\d.]+)[,\s]+([\d.]+)/i);
              if (!match) return null;
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              return (
                <text key={`num-${i}`} x={x} y={y - 2} fontSize="6"
                  fill="var(--primary)" fontWeight="bold" textAnchor="middle" opacity={0.7}>
                  {i + 1}
                </text>
              );
            })}
          </svg>
        )}

        {/* Stroke counter badge */}
        {paths.length > 0 && (
          <div className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {currentStroke}/{paths.length}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button onClick={play} disabled={playing || paths.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--primary)', color: '#fff', opacity: playing ? 0.6 : 1 }}>
          {playing ? <FaPause size={9} /> : <FaPlay size={9} />}
          {playing ? 'Đang chạy' : 'Tự động'}
        </button>
        <button onClick={stepForward} disabled={playing || currentStroke >= paths.length}
          title="Nét tiếp theo"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:scale-105 disabled:opacity-30"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <FaForwardStep size={9} /> Từng nét
        </button>
        <button onClick={reset}
          className="p-1.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
          <FaRotateLeft size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Kanji Detail Panel (Right Panel) ──────────────────────────────────────────
function KanjiDetailPanel({
  kanji, lang, onPrev, onNext, hasPrev, hasNext, isLearned, markLearned, unmarkLearned,
}: {
  kanji: KanjiItem; lang: string;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
  isLearned: (id: string) => boolean; markLearned: (id: string) => void; unmarkLearned: (id: string) => void;
}) {
  const [detail, setDetail] = useState<KanjiDetail | null>(null);

  useEffect(() => {
    fetch(`/api/kanji/${kanji.id}`)
      .then(r => r.json())
      .then(setDetail);
  }, [kanji.id]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext, hasPrev, hasNext]);

  const data = detail || kanji;

  return (
    <div className="sticky top-[72px] self-start rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        maxHeight: 'calc(100vh - 88px)',
      }}>
      {/* Header */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Chi tiết chữ</h3>
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={!hasPrev}
              className="p-1 rounded-lg transition-all hover:scale-110 disabled:opacity-30"
              style={{ background: 'var(--bg-surface)' }}>
              <FaChevronRight size={10} className="rotate-180" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button onClick={onNext} disabled={!hasNext}
              className="p-1 rounded-lg transition-all hover:scale-110 disabled:opacity-30"
              style={{ background: 'var(--bg-surface)' }}>
              <FaChevronRight size={10} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stroke animation */}
        <div className="flex justify-center">
          <StrokeAnimation character={data.character} compact />
        </div>

        {/* Kanji character + audio */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{data.meaning}</h2>
            <AudioButton text={data.character} lang={lang} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {data.strokeCount} nét
            {(detail as KanjiDetail)?.radical && ` • Bộ: ${(detail as KanjiDetail).radical} (${(detail as KanjiDetail).radicalMeaning})`}
          </p>
        </div>

        {/* Readings with audio */}
        <div className="space-y-2">
          {lang === 'ja' && (
            <>
              {data.onyomi && (
                <div className="rounded-xl p-2.5 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
                  <div>
                    <div className="text-[9px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>音読み (On)</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{data.onyomi}</div>
                  </div>
                  <AudioButton text={data.onyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                </div>
              )}
              {data.kunyomi && (
                <div className="rounded-xl p-2.5 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
                  <div>
                    <div className="text-[9px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>訓読み (Kun)</div>
                    <div className="text-sm font-bold" style={{ color: '#059669' }}>{data.kunyomi}</div>
                  </div>
                  <AudioButton text={data.kunyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                </div>
              )}
              {!data.onyomi && !data.kunyomi && (
                <div className="rounded-xl p-2.5 text-center" style={{ background: 'var(--bg-muted)' }}>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu cách đọc</div>
                </div>
              )}
            </>
          )}
          {lang === 'zh' && data.pinyin && (
            <div className="rounded-xl p-2.5 flex items-center justify-between" style={{ background: 'var(--bg-muted)' }}>
              <div>
                <div className="text-[9px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Pinyin</div>
                <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{data.pinyin}</div>
              </div>
              <AudioButton text={data.character} lang={lang} size="xs" />
            </div>
          )}
        </div>

        {/* Examples with sentences + audio */}
        {(detail as KanjiDetail)?.examples && (detail as KanjiDetail).examples!.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Từ vựng & Ví dụ</h3>
            <div className="space-y-2.5">
              {(detail as KanjiDetail).examples!.map((ex: KanjiExample, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {/* Word row */}
                  <div className="flex items-center gap-2 p-2.5" style={{ background: 'var(--bg-muted)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{ex.word}</span>
                        <span className="text-[10px]" style={{ color: 'var(--primary)' }}>{ex.reading}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ex.meaning}</div>
                    </div>
                    <AudioButton text={ex.word} lang={lang} size="xs" />
                  </div>
                  {/* Sentence row (if available) */}
                  {ex.sentence && (
                    <div className="px-2.5 py-2 flex items-start gap-2" style={{ background: 'var(--bg-surface)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {ex.sentence}
                        </p>
                        {ex.sentenceReading && (
                          <p className="text-[9px] mt-0.5" style={{ color: 'var(--primary)', opacity: 0.7 }}>
                            {ex.sentenceReading}
                          </p>
                        )}
                        {ex.sentenceMeaning && (
                          <p className="text-[9px] mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>
                            {ex.sentenceMeaning}
                          </p>
                        )}
                      </div>
                      <AudioButton text={ex.sentence} lang={lang} size="xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark learned */}
        <button onClick={() => isLearned(kanji.id) ? unmarkLearned(kanji.id) : markLearned(kanji.id)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: isLearned(kanji.id) ? '#22C55E18' : 'var(--primary)',
            color: isLearned(kanji.id) ? '#22C55E' : '#fff',
            border: isLearned(kanji.id) ? '1.5px solid #22C55E40' : 'none',
          }}>
          <FaCheck size={9} />
          {isLearned(kanji.id) ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}
        </button>

        {/* PDF export single kanji */}
        <button onClick={() => exportKanjiPDF([data], data.lesson ? `Bài ${data.lesson}` : '')}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.02]"
          style={{ background: '#DC262612', color: '#DC2626', border: '1px solid #DC262625' }}>
          <FaFilePdf size={10} /> Xuất PDF luyện viết
        </button>
      </div>
    </div>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────
export default function KanjiClient() {
  const { lang } = useParams<{ lang: string }>();
  const labels = LANG_LABELS[lang] || LANG_LABELS.ja;

  const [levels, setLevels] = useState<KanjiLevel[]>([]);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedKanjiIdx, setSelectedKanjiIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<LearningMode>('grid');
  const [studyIdx, setStudyIdx] = useState(0);

  const { progress, markLearned, unmarkLearned, isLearned } = useKanjiProgress(lang);

  // Fetch levels
  useEffect(() => {
    setLoading(true);
    fetch(`/api/kanji?lang=${lang}`)
      .then(r => r.json())
      .then(data => { setLevels(data); setLoading(false); });
  }, [lang]);

  // Fetch level detail when level changes
  useEffect(() => {
    if (!selectedLevel) { setLevelData(null); return; }
    setLoading(true);
    setSelectedLesson('');
    setSelectedKanjiIdx(null);
    fetch(`/api/kanji?lang=${lang}&level=${selectedLevel}`)
      .then(r => r.json())
      .then((data: LevelData) => { setLevelData(data); setLoading(false); });
  }, [lang, selectedLevel]);

  // Reset kanji selection when lesson changes
  useEffect(() => { setSelectedKanjiIdx(null); setSearch(''); }, [selectedLesson]);

  // Auto-select first level if levels loaded and none selected
  useEffect(() => {
    if (levels.length > 0 && !selectedLevel) {
      setSelectedLevel(levels[0].level);
    }
  }, [levels, selectedLevel]);

  // Build sidebar levels
  const sidebarLevels = levels.map(lv => ({
    code: lv.level,
    label: lv.level,
    desc: `${lv.kanjiCount} chữ • ${lv.lessonCount} bài`,
  }));

  // Build sidebar skills (lessons for selected level)
  const lessonSkills = levelData?.lessons.map(l => ({
    key: String(l.lesson),
    label: `Bài ${l.lesson} (${l.count} chữ)`,
    icon: <FaBookOpen size={13} />,
  })) || [];

  // Add "All" option at the top
  const sidebarSkills = levelData ? [
    { key: 'all', label: `Tất cả (${levelData.totalKanji} chữ)`, icon: <FaLayerGroup size={13} /> },
    ...lessonSkills,
  ] : [];

  // Auto-select "all" when level data loads
  useEffect(() => {
    if (levelData && !selectedLesson) {
      setSelectedLesson('all');
    }
  }, [levelData, selectedLesson]);

  const handleSetLevel = useCallback((level: string) => {
    setSelectedLevel(level);
  }, []);

  const handleSetLesson = useCallback((lesson: string) => {
    setSelectedLesson(lesson);
  }, []);

  // Current kanji list based on selection
  const currentKanji: KanjiItem[] = (() => {
    if (!levelData) return [];
    if (selectedLesson === 'all') return levelData.lessons.flatMap(l => l.items);
    const lesson = levelData.lessons.find(l => String(l.lesson) === selectedLesson);
    return lesson?.items || [];
  })();

  const filteredKanji = currentKanji.filter(k =>
    !search || k.character.includes(search) || k.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const currentLessonData = levelData?.lessons.find(l => String(l.lesson) === selectedLesson);
  const color = LEVEL_COLORS[selectedLevel] || 'var(--primary)';

  // Progress stats for current view
  const learnedInView = filteredKanji.filter(k => isLearned(k.id)).length;
  const learnedPercent = filteredKanji.length > 0 ? Math.round((learnedInView / filteredKanji.length) * 100) : 0;

  // Build right panel
  const rightPanel = mode === 'grid' && selectedKanjiIdx !== null && filteredKanji[selectedKanjiIdx] ? (
    <KanjiDetailPanel
      kanji={filteredKanji[selectedKanjiIdx]}
      lang={lang}
      onPrev={() => setSelectedKanjiIdx(Math.max(0, selectedKanjiIdx - 1))}
      onNext={() => setSelectedKanjiIdx(Math.min(filteredKanji.length - 1, selectedKanjiIdx + 1))}
      hasPrev={selectedKanjiIdx > 0}
      hasNext={selectedKanjiIdx < filteredKanji.length - 1}
      isLearned={isLearned}
      markLearned={markLearned}
      unmarkLearned={unmarkLearned}
    />
  ) : undefined;

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'level' as const,
        setMode: () => {},
        selectedLevel,
        setSelectedLevel: handleSetLevel,
        selectedSkill: selectedLesson,
        setSelectedSkill: handleSetLesson,
        levels: sidebarLevels,
        skills: sidebarSkills,
        title: labels.title,
      }}
      bottomBarProps={{
        levels: sidebarLevels,
        selectedLevel,
        setSelectedLevel: handleSetLevel,
        skills: sidebarSkills,
        selectedSkill: selectedLesson,
        setSelectedSkill: handleSetLesson,
      }}
      rightPanel={rightPanel}
    >
      <LearnHeader
        icon={<FaPenNib size={14} />}
        title={selectedLevel ? `${labels.charName} ${selectedLevel}` : labels.title}
        subtitle={
          selectedLesson === 'all'
            ? `${levelData?.totalKanji || 0} chữ • ${levelData?.lessons.length || 0} bài`
            : currentLessonData
              ? `Bài ${currentLessonData.lesson} • ${currentLessonData.count} chữ`
              : undefined
        }
      >
        {/* PDF export button */}
        {filteredKanji.length > 0 && (
          <button
            onClick={() => exportKanjiPDF(
              filteredKanji,
              selectedLevel,
              selectedLesson !== 'all' ? Number(selectedLesson) : undefined,
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:scale-105 ml-auto"
            style={{ background: '#DC262612', color: '#DC2626', border: '1px solid #DC262625' }}>
            <FaFilePdf size={11} /> Xuất PDF
          </button>
        )}
      </LearnHeader>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          {filteredKanji.length > 0 && (
            <div className="relative">
              <FaMagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Tìm ${labels.charName.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          )}

          {/* Stats row when viewing all */}
          {selectedLesson === 'all' && levelData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Tổng chữ', value: levelData.totalKanji, icon: <FaPenNib size={11} />, color },
                { label: 'Đã thuộc', value: learnedInView, icon: <FaCheck size={11} />, color: '#22C55E' },
                { label: 'Hoàn thành', value: `${learnedPercent}%`, icon: <FaGraduationCap size={11} />, color: '#3B82F6' },
                { label: 'Streak', value: `${progress.streak} ngày`, icon: <FaFire size={11} />, color: progress.streak > 0 ? '#F59E0B' : 'var(--text-muted)' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center"
                    style={{ background: s.color + '18', color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Compact progress bar (when viewing a specific lesson) */}
          {selectedLesson !== 'all' && filteredKanji.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 shrink-0">
                {progress.streak > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#F59E0B' }}>
                    <FaFire size={10} /> {progress.streak}
                  </span>
                )}
                <span className="text-[10px] font-bold" style={{ color: '#22C55E' }}>
                  <FaCheck size={8} className="inline mr-0.5" />{learnedInView}/{filteredKanji.length}
                </span>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${learnedPercent}%`, background: '#22C55E' }} />
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--primary)' }}>{learnedPercent}%</span>
            </div>
          )}

          {/* Mode selector */}
          {filteredKanji.length > 0 && (
            <div className="flex items-center gap-2">
              {([
                { key: 'grid' as const, label: 'Lưới', icon: <FaLayerGroup size={10} /> },
                { key: 'study' as const, label: 'Học từng chữ', icon: <FaGraduationCap size={10} /> },
                { key: 'practice' as const, label: 'Luyện nhanh', icon: <FaBolt size={10} /> },
              ]).map(m => (
                <button key={m.key} onClick={() => { setMode(m.key); if (m.key === 'study') setStudyIdx(0); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-105"
                  style={{
                    background: mode === m.key ? 'var(--primary)' : 'var(--bg-surface)',
                    color: mode === m.key ? '#fff' : 'var(--text-muted)',
                    border: mode === m.key ? 'none' : '1px solid var(--border)',
                  }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Study mode */}
          {mode === 'study' && filteredKanji.length > 0 && (
            <StudyModeView
              kanjiList={filteredKanji} lang={lang}
              currentIdx={studyIdx} setCurrentIdx={setStudyIdx}
              isLearned={isLearned} markLearned={markLearned} unmarkLearned={unmarkLearned}
              onExit={() => setMode('grid')}
            />
          )}

          {/* Quick Practice mode */}
          {mode === 'practice' && filteredKanji.length > 0 && (
            <QuickPracticeView
              kanjiList={filteredKanji} lang={lang}
              isLearned={isLearned} markLearned={markLearned}
              onExit={() => setMode('grid')}
            />
          )}

          {/* Kanji Grid (grid mode) */}
          {mode === 'grid' && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {filteredKanji.map((k, idx) => {
                const isActive = selectedKanjiIdx === idx;
                const learned = isLearned(k.id);
                return (
                  <button key={k.id} onClick={() => setSelectedKanjiIdx(idx)}
                    className="group relative rounded-2xl p-3 text-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: isActive ? `color-mix(in srgb, ${color} 10%, var(--bg-surface))` : 'var(--bg-surface)',
                      border: isActive ? `2px solid ${color}` : '1.5px solid var(--border)',
                      boxShadow: isActive ? `0 0 0 3px ${color}20` : undefined,
                    }}>
                    {/* Learned badge */}
                    {learned && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: '#22C55E', color: '#fff' }}>
                        <FaCheck size={7} />
                      </div>
                    )}
                    <div className="text-3xl font-bold mb-1" style={{ color: learned ? '#22C55E' : 'var(--text-primary)' }}>
                      {k.character}
                    </div>
                    <div className="text-[10px] font-semibold truncate" style={{ color }}>
                      {lang === 'ja' ? (k.onyomi || k.kunyomi || '') : (k.pinyin || '')}
                    </div>
                    <div className="text-[9px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {k.meaning}
                    </div>
                    <div className="text-[8px] mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
                      {k.strokeCount} nét
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {mode === 'grid' && filteredKanji.length === 0 && !loading && (
            <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px dashed var(--border)' }}>
              <FaMagnifyingGlass size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {search ? 'Không tìm thấy kết quả' : `Chưa có dữ liệu ${labels.charName.toLowerCase()}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mobile modal fallback for kanji detail (hidden on lg+) */}
      {mode === 'grid' && selectedKanjiIdx !== null && filteredKanji[selectedKanjiIdx] && (
        <MobileKanjiModal
          kanji={filteredKanji[selectedKanjiIdx]}
          lang={lang}
          onClose={() => setSelectedKanjiIdx(null)}
          onPrev={() => setSelectedKanjiIdx(Math.max(0, selectedKanjiIdx - 1))}
          onNext={() => setSelectedKanjiIdx(Math.min(filteredKanji.length - 1, selectedKanjiIdx + 1))}
          hasPrev={selectedKanjiIdx > 0}
          hasNext={selectedKanjiIdx < filteredKanji.length - 1}
          isLearned={isLearned}
          markLearned={markLearned}
          unmarkLearned={unmarkLearned}
        />
      )}
    </LearnLayout>
  );
}

// ─── Mobile Kanji Modal (shown on < lg screens only) ──────────────────────────
function MobileKanjiModal({
  kanji, lang, onClose, onPrev, onNext, hasPrev, hasNext, isLearned, markLearned, unmarkLearned,
}: {
  kanji: KanjiItem; lang: string; onClose: () => void;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
  isLearned: (id: string) => boolean; markLearned: (id: string) => void; unmarkLearned: (id: string) => void;
}) {
  const [detail, setDetail] = useState<KanjiDetail | null>(null);

  useEffect(() => {
    fetch(`/api/kanji/${kanji.id}`)
      .then(r => r.json())
      .then(setDetail);
  }, [kanji.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const data = detail || kanji;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-2xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>

        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />

        {/* Close + nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {hasPrev && (
              <button onClick={onPrev} className="p-2 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                <FaChevronRight size={11} className="rotate-180" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            {hasNext && (
              <button onClick={onNext} className="p-2 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                <FaChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        {/* Stroke animation */}
        <div className="flex justify-center mb-4">
          <StrokeAnimation character={data.character} />
        </div>

        {/* Info + audio */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{data.meaning}</h2>
            <AudioButton text={data.character} lang={lang} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {data.strokeCount} nét
            {(detail as KanjiDetail)?.radical && ` • Bộ: ${(detail as KanjiDetail).radical} (${(detail as KanjiDetail).radicalMeaning})`}
          </p>
        </div>

        {/* Readings with audio */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {lang === 'ja' && (
            <>
              {data.onyomi && (
                <div className="rounded-xl p-2.5" style={{ background: 'var(--bg-muted)' }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>音読み (On)</div>
                    <AudioButton text={data.onyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{data.onyomi}</div>
                </div>
              )}
              {data.kunyomi && (
                <div className="rounded-xl p-2.5" style={{ background: 'var(--bg-muted)' }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>訓読み (Kun)</div>
                    <AudioButton text={data.kunyomi.replace(/[()（）・]/g, '')} lang={lang} size="xs" />
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#059669' }}>{data.kunyomi}</div>
                </div>
              )}
              {!data.onyomi && !data.kunyomi && (
                <div className="rounded-xl p-2.5 col-span-2 text-center" style={{ background: 'var(--bg-muted)' }}>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu cách đọc</div>
                </div>
              )}
            </>
          )}
          {lang === 'zh' && data.pinyin && (
            <div className="rounded-xl p-2.5 col-span-2" style={{ background: 'var(--bg-muted)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>Pinyin</div>
                <AudioButton text={data.character} lang={lang} size="xs" />
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{data.pinyin}</div>
            </div>
          )}
        </div>

        {/* Examples with sentences + audio */}
        {(detail as KanjiDetail)?.examples && (detail as KanjiDetail).examples!.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Từ vựng & Ví dụ</h3>
            <div className="space-y-2.5">
              {(detail as KanjiDetail).examples!.map((ex: KanjiExample, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 p-2.5" style={{ background: 'var(--bg-muted)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{ex.word}</span>
                        <span className="text-[10px]" style={{ color: 'var(--primary)' }}>{ex.reading}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ex.meaning}</div>
                    </div>
                    <AudioButton text={ex.word} lang={lang} size="xs" />
                  </div>
                  {ex.sentence && (
                    <div className="px-2.5 py-2 flex items-start gap-2" style={{ background: 'var(--bg-surface)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {ex.sentence}
                        </p>
                        {ex.sentenceReading && (
                          <p className="text-[9px] mt-0.5" style={{ color: 'var(--primary)', opacity: 0.7 }}>
                            {ex.sentenceReading}
                          </p>
                        )}
                        {ex.sentenceMeaning && (
                          <p className="text-[9px] mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>
                            {ex.sentenceMeaning}
                          </p>
                        )}
                      </div>
                      <AudioButton text={ex.sentence} lang={lang} size="xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark learned */}
        <button onClick={(e) => { e.stopPropagation(); isLearned(kanji.id) ? unmarkLearned(kanji.id) : markLearned(kanji.id); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 mb-2"
          style={{
            background: isLearned(kanji.id) ? '#22C55E18' : 'var(--primary)',
            color: isLearned(kanji.id) ? '#22C55E' : '#fff',
            border: isLearned(kanji.id) ? '2px solid #22C55E40' : 'none',
          }}>
          <FaCheck size={12} />
          {isLearned(kanji.id) ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}
        </button>
      </div>
    </div>
  );
}
