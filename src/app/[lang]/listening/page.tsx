'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaHeadphones, FaCirclePlay, FaStop, FaVolumeHigh,
  FaClock, FaCheck, FaWaveSquare, FaRegFileLines, FaChevronRight,
  FaBookmark, FaKeyboard, FaPlay, FaPause, FaMusic,
} from 'react-icons/fa6';

// ─── Unified practice type (matches /api/listening?lang= response) ────────────
interface Segment { speaker: string; text: string; pinyin?: string }
interface ListeningPractice {
  id: string; lang: string; level: string; category: string;
  title: string; titleVi?: string | null;
  summary: string; situation: string; durationSec: number;
  focus: string; question: string; options: string[];
  answer: string; explanation: string; audioUrl?: string | null;
  segments: Segment[];
}

// ─── Per-language config ──────────────────────────────────────────────────────
interface LevelMeta { badgeBg: string; badgeText: string; accent: string; desc: string }
interface LangConfig {
  speechLang: string;
  hasPinyin: boolean;
  categoryLabel: string;
  levelCodes: string[];
  accentColor: string;
  heroBg: string;
  heroTag: string;
  heroTitle: string;
  levelMeta: Record<string, LevelMeta>;
}

const LANG_CONFIG: Record<string, LangConfig> = {
  ja: {
    speechLang: 'ja-JP',
    hasPinyin: false,
    categoryLabel: 'Mondai',
    levelCodes: ['N5', 'N4', 'N3', 'N2', 'N1'],
    accentColor: 'var(--primary)',
    heroBg: 'var(--primary-light)',
    heroTag: 'Luyện nghe JLPT theo level và mondai',
    heroTitle: 'Luyện nghe hội thoại N5 đến N1',
    levelMeta: {
      N5: { badgeBg: '#DCFCE7', badgeText: '#15803D', accent: '#4ADE80', desc: 'Cơ bản, hội thoại rất ngắn' },
      N4: { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', accent: '#60A5FA', desc: 'Hội thoại thông dụng' },
      N3: { badgeBg: '#FEF9C3', badgeText: '#92400E', accent: '#FACC15', desc: 'Tình huống mở rộng' },
      N2: { badgeBg: '#FFEDD5', badgeText: '#C2410C', accent: '#FB923C', desc: 'Nghe công việc, thông báo' },
      N1: { badgeBg: '#FFE4E6', badgeText: '#BE123C', accent: '#FB7185', desc: 'Nội dung học thuật, phân tích' },
    },
  },
  zh: {
    speechLang: 'zh-CN',
    hasPinyin: true,
    categoryLabel: 'Dạng bài',
    levelCodes: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
    accentColor: '#e53e3e',
    heroBg: '#FFF1F2',
    heroTag: 'Luyện nghe tiếng Trung theo HSK',
    heroTitle: 'Luyện nghe hội thoại HSK1 đến HSK6',
    levelMeta: {
      HSK1: { badgeBg: '#DCFCE7', badgeText: '#15803D', accent: '#4ADE80', desc: 'Câu đơn, từ cơ bản' },
      HSK2: { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', accent: '#60A5FA', desc: 'Hội thoại ngắn hàng ngày' },
      HSK3: { badgeBg: '#FEF9C3', badgeText: '#92400E', accent: '#FACC15', desc: 'Tình huống giao tiếp thường gặp' },
      HSK4: { badgeBg: '#FFEDD5', badgeText: '#C2410C', accent: '#FB923C', desc: 'Chủ đề xã hội, công việc' },
      HSK5: { badgeBg: '#F3E8FF', badgeText: '#6B21A8', accent: '#C084FC', desc: 'Nội dung phức tạp, học thuật' },
      HSK6: { badgeBg: '#FFE4E6', badgeText: '#BE123C', accent: '#FB7185', desc: 'Thảo luận chuyên sâu, trừu tượng' },
    },
  },
};

const DEFAULT_CONFIG = LANG_CONFIG.ja;

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─── Dictation scoring ─────────────────────────────────────────────────────────
interface DictResult { score: number; tokens: { char: string; correct: boolean }[] }

function normalizeCJK(text: string) {
  return text.replace(/[。、！？「」『』・\s\n,.!?'"()（）【】\-—]/g, '').toLowerCase();
}

function scoreDictation(input: string, reference: string): DictResult {
  const ref = normalizeCJK(reference);
  const inp = normalizeCJK(input);
  // LCS DP
  const m = ref.length, n = inp.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = ref[i - 1] === inp[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  // Backtrace
  const inLCS = new Array(m).fill(false);
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (ref[i - 1] === inp[j - 1]) { inLCS[i - 1] = true; i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  const tokens = ref.split('').map((char, idx) => ({ char, correct: inLCS[idx] }));
  const score = m > 0 ? Math.round((inLCS.filter(Boolean).length / m) * 100) : 0;
  return { score, tokens };
}

// ─── Page entry ───────────────────────────────────────────────────────────────
export default function ListeningPage() {
  return (
    <Suspense fallback={<ListeningPageFallback />}>
      <ListeningPageContent />
    </Suspense>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ListeningPageContent() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const cfg = LANG_CONFIG[lang] ?? DEFAULT_CONFIG;
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [practices, setPractices]               = useState<ListeningPractice[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedLevel, setSelectedLevel]       = useState(() => searchParams.get('level') ?? cfg.levelCodes[0]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedId, setSelectedId]             = useState('');
  const [showTranscript, setShowTranscript]     = useState(false);
  const [showPinyin, setShowPinyin]             = useState(false);
  const [showAnswer, setShowAnswer]             = useState(false);
  const [playbackRate, setPlaybackRate]         = useState(lang === 'ja' ? 0.92 : 1.0);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [speechSupported, setSpeechSupported]   = useState(false);
  const [savedIds, setSavedIds]                 = useState<Set<string>>(new Set());
  const [savingId, setSavingId]                 = useState<string | null>(null);
  const [showDictation, setShowDictation]       = useState(false);
  const [dictationText, setDictationText]       = useState('');
  const [dictationResult, setDictationResult]   = useState<DictResult | null>(null);
  const [activeTab, setActiveTab]               = useState<'transcript'|'quiz'|'dictation'>('quiz');
  const [audioCurrent, setAudioCurrent]         = useState(0);
  const [audioDuration, setAudioDuration]       = useState(0);
  const [speakingSegIdx, setSpeakingSegIdx]     = useState(0);

  const synthRef     = useRef<SpeechSynthesis | null>(null);
  const voicesRef    = useRef<SpeechSynthesisVoice[]>([]);
  const playTokenRef = useRef(0);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const autoPlayRef  = useRef(false);

  // ── Load practices from API ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const mode = searchParams.get('mode') ?? '';
    fetch(`/api/listening?lang=${lang}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ListeningPractice[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setPractices(data);
        if (mode === 'random') {
          const idx = Math.floor(Math.random() * data.length);
          setSelectedId(data[idx]?.id ?? '');
        } else if (mode === 'dialogue') {
          // Pre-select a category that contains dialogue/hội thoại content
          const dialogueCat = data.map(p => p.category).find(c =>
            /tho[aạ]i|dial|convers/i.test(c)
          );
          if (dialogueCat) setSelectedCategory(dialogueCat);
          setSelectedId(data.find(p => p.category === dialogueCat)?.id ?? data[0]?.id ?? '');
        } else {
          setSelectedId(data[0]?.id ?? '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ─────────────────────────────────────────────────────────
  const availableCategories = useMemo(() => {
    const base = selectedLevel === 'ALL' ? practices : practices.filter(p => p.level === selectedLevel);
    return Array.from(new Set(base.map(p => p.category)));
  }, [practices, selectedLevel]);

  const filteredPractices = useMemo(() =>
    practices.filter(p =>
      (selectedLevel === 'ALL' || p.level === selectedLevel) &&
      (selectedCategory === 'ALL' || p.category === selectedCategory)
    ), [practices, selectedLevel, selectedCategory]);

  const selectedPractice = useMemo(() =>
    filteredPractices.find(p => p.id === selectedId) ?? filteredPractices[0] ?? null,
    [filteredPractices, selectedId]);

  useEffect(() => {
    if (!filteredPractices.find(p => p.id === selectedId) && filteredPractices[0]) {
      setSelectedId(filteredPractices[0].id);
    }
    setShowTranscript(false);
    setShowAnswer(false);
    setShowDictation(false);
    setDictationText('');
    setDictationResult(null);
    setActiveTab('quiz');
  }, [filteredPractices, selectedId]);

  // ── Speech synthesis ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setSpeechSupported(true);
    const update = () => { voicesRef.current = synth.getVoices(); };
    update();
    synth.addEventListener('voiceschanged', update);
    return () => {
      playTokenRef.current += 1;
      synth.cancel();
      synth.removeEventListener('voiceschanged', update);
    };
  }, []);

  useEffect(() => () => {
    playTokenRef.current += 1;
    synthRef.current?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    stopPlayback();
    if (autoPlayRef.current) {
      autoPlayRef.current = false;
      window.setTimeout(() => playDialogue(0), 60);
    }
  }, [selectedPractice?.id]);

  // ── Apply speed change to currently-playing audio in real time ───────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  function stopPlayback() {
    playTokenRef.current += 1;
    synthRef.current?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsSpeaking(false);
    setAudioCurrent(0);
    setAudioDuration(0);
    setSpeakingSegIdx(0);
  }

  async function saveLesson(lessonId: string) {
    if (!session) return;
    setSavingId(lessonId);
    try {
      const res = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: true }),
      });
      if (res.ok) setSavedIds(prev => new Set([...prev, lessonId]));
    } finally {
      setSavingId(null);
    }
  }

  function playDialogue(fromIdx = 0) {
    if (!selectedPractice) return;
    if (selectedPractice.audioUrl) {
      if (!audioRef.current || audioRef.current.src !== selectedPractice.audioUrl) {
        audioRef.current?.pause();
        const a = new Audio(selectedPractice.audioUrl);
        a.addEventListener('loadedmetadata', () => setAudioDuration(a.duration));
        a.addEventListener('timeupdate', () => setAudioCurrent(a.currentTime));
        audioRef.current = a;
      }
      const audio = audioRef.current;
      audio.playbackRate = playbackRate;
      audio.onended = () => { setIsSpeaking(false); setAudioCurrent(0); };
      audio.onerror = () => setIsSpeaking(false);
      audio.currentTime = fromIdx; // fromIdx used as seconds offset for audio
      audio.play().catch(() => setIsSpeaking(false));
      setIsSpeaking(true);
      return;
    }
    if (!synthRef.current) return;
    const synth = synthRef.current;
    const langPrefix = cfg.speechLang.split('-')[0].toLowerCase();
    const voice = voicesRef.current.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ?? null;
    const token = ++playTokenRef.current;
    synth.cancel();
    setIsSpeaking(true);
    const segs = selectedPractice.segments;
    let idx = fromIdx;
    setSpeakingSegIdx(idx);
    const speakNext = () => {
      if (playTokenRef.current !== token) return;
      if (idx >= segs.length) { setIsSpeaking(false); setSpeakingSegIdx(0); return; }
      setSpeakingSegIdx(idx);
      const utt = new SpeechSynthesisUtterance(segs[idx].text);
      utt.lang = cfg.speechLang;
      utt.rate = playbackRate;
      if (voice) utt.voice = voice;
      utt.onend = () => { if (playTokenRef.current !== token) return; idx++; window.setTimeout(speakNext, 240); };
      utt.onerror = () => { if (playTokenRef.current !== token) return; setIsSpeaking(false); };
      synth.speak(utt);
    };
    speakNext();
  }

  const accent = cfg.accentColor;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: accent, borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <main>
      {/* ── Hero ── */}
      <section className="mx-4 mt-4 mb-0 px-6 py-10 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-5"
            style={{ background: cfg.heroBg, color: accent }}>
            <FaHeadphones size={14} /> {cfg.heroTag}
          </div>
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {cfg.heroTitle}
              </h1>
              <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Chọn cấp độ, lọc theo loại bài, nghe hội thoại và tự kiểm tra đáp án ngay trên một màn hình.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Bài nghe', value: practices.length, icon: FaWaveSquare },
                  { label: cfg.categoryLabel, value: availableCategories.length, icon: FaRegFileLines },
                  { label: 'Cấp độ', value: cfg.levelCodes.length, icon: FaHeadphones },
                  { label: 'Chế độ', value: cfg.hasPinyin ? 'Nghe + pinyin' : 'Nghe + giải thích', icon: FaCheck },
                ].map(item => (
                  <div key={item.label} className="rounded-3xl p-4 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <item.icon size={15} style={{ color: accent }} />
                      <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: accent }}>
                Cách luyện nhanh
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>1. Chọn cấp độ phù hợp với mục tiêu của bạn.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>2. Nghe và thử trả lời câu hỏi trước khi xem đáp án.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>
                  {cfg.hasPinyin ? '3. Bật pinyin để đối chiếu cách đọc sau khi nghe.' : '3. Xem transcript và giải thích để củng cố hiểu biết.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters + Practice ── */}
      <section className="px-4 py-8" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Filters card */}
          <div className="card">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>Cấp độ</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', ...cfg.levelCodes] as string[]).map(lvl => {
                    const active = selectedLevel === lvl;
                    const meta = lvl !== 'ALL' ? cfg.levelMeta[lvl] : null;
                    return (
                      <button key={lvl}
                        onClick={() => { setSelectedLevel(lvl); setSelectedCategory('ALL'); }}
                        className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                        style={active
                          ? { background: accent, color: '#fff' }
                          : lvl === 'ALL'
                            ? { background: 'var(--bg-muted)', color: 'var(--text-primary)' }
                            : { background: meta?.badgeBg, color: meta?.badgeText }}>
                        {lvl === 'ALL' ? 'Tất cả' : meta ? `${lvl} · ${meta.desc}` : lvl}
                      </button>
                    );
                  })}
                </div>
              </div>
              {availableCategories.length > 1 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>{cfg.categoryLabel}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setSelectedCategory('ALL')}
                      className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                      style={selectedCategory === 'ALL' ? { background: accent, color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                      Tất cả
                    </button>
                    {availableCategories.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                        style={selectedCategory === cat ? { background: accent, color: '#fff' } : { background: cfg.heroBg, color: accent }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid xl:grid-cols-[1fr,340px] gap-5 items-start">

            {/* ── Player card ── */}
            <div className="xl:sticky xl:top-20">
              {selectedPractice ? (() => {
                const meta = cfg.levelMeta[selectedPractice.level];
                const isSaved = savedIds.has(selectedPractice.id);
                return (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.10)' }}>

                    {/* Coloured top bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${meta?.accent ?? accent}, ${accent})` }} />

                    {/* ── Compact header: badges + title + save ── */}
                    <div className="px-4 pt-3 pb-3 flex items-start gap-3">
                      {/* Left: meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {meta && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: meta.badgeBg, color: meta.badgeText }}>
                              {selectedPractice.level}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.heroBg, color: accent }}>
                            {selectedPractice.category}
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <FaClock size={8} />{formatDuration(selectedPractice.durationSec)}
                          </span>
                        </div>
                        <h2 className="text-base font-bold leading-snug"
                          style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                          {selectedPractice.title}
                          {selectedPractice.titleVi && (
                            <span className="text-xs font-semibold ml-2" style={{ color: accent }}>{selectedPractice.titleVi}</span>
                          )}
                        </h2>
                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{selectedPractice.situation}</p>
                      </div>
                      {/* Right: save */}
                      {session && (
                        <button onClick={() => saveLesson(selectedPractice.id)}
                          disabled={savingId === selectedPractice.id}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all mt-0.5"
                          style={isSaved
                            ? { background: '#DCFCE7', color: '#15803D' }
                            : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                          <FaBookmark size={9} />
                          {isSaved ? 'Đã lưu' : 'Lưu'}
                        </button>
                      )}
                    </div>

                    {/* ── Inline player bar ── */}
                    <div className="mx-4 mb-3 rounded-xl px-3 py-2" style={{ background: 'var(--bg-base)' }}>
                      {/* Row 1: play + bars + speed select */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {/* Sound bars */}
                        <div className="flex items-end gap-[2px] h-6 shrink-0">
                          {[4,7,10,6,9,12,5,8,11,4,9,6].map((h, i) => (
                            <div key={i} className="w-[3px] rounded-full"
                              style={{
                                height: isSpeaking ? undefined : `${h * 2}px`,
                                minHeight: 3,
                                background: accent,
                                opacity: isSpeaking ? 1 : 0.3,
                                animation: isSpeaking ? `soundBar ${0.5 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite alternate` : 'none',
                              }} />
                          ))}
                        </div>

                        {/* Play / Stop */}
                        {(speechSupported || selectedPractice.audioUrl) ? (
                          <button onClick={isSpeaking ? stopPlayback : () => playDialogue(0)}
                            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all active:scale-95"
                            style={isSpeaking
                              ? { background: '#FEE2E2', color: '#DC2626' }
                              : { background: accent, color: '#fff', boxShadow: `0 2px 8px ${accent}40` }}>
                            {isSpeaking ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: 2 }} />}
                          </button>
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                            <FaMusic size={12} />
                          </div>
                        )}

                        {/* Remaining time */}
                        <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: accent }}>
                          {audioDuration > 0
                            ? `-${formatDuration(Math.max(0, audioDuration - audioCurrent))}`
                            : formatDuration(selectedPractice.durationSec)}
                        </span>

                        <div className="flex-1" />

                        {/* Speed select */}
                        <select
                          value={playbackRate}
                          onChange={e => setPlaybackRate(Number(e.target.value))}
                          className="text-[11px] font-bold rounded-lg px-1.5 py-1 border outline-none"
                          style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: accent }}>
                          {[0.5, 0.75, 1.0, 1.25, 1.5].map(s => (
                            <option key={s} value={s}>{s}x</option>
                          ))}
                        </select>
                      </div>

                      {/* Row 2: seek bar */}
                      {selectedPractice.audioUrl ? (
                        /* Audio file: time-based seek */
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                            {formatDuration(audioCurrent)}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={audioDuration || selectedPractice.durationSec}
                            step={0.5}
                            value={audioCurrent}
                            onChange={e => {
                              const t = Number(e.target.value);
                              setAudioCurrent(t);
                              if (audioRef.current) audioRef.current.currentTime = t;
                            }}
                            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{ accentColor: accent }}
                          />
                          <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                            {formatDuration(audioDuration || selectedPractice.durationSec)}
                          </span>
                        </div>
                      ) : (
                        /* Speech synthesis: segment-based step bar */
                        <div className="flex items-center gap-1">
                          {selectedPractice.segments.map((seg, i) => (
                            <button
                              key={i}
                              title={`${seg.speaker}: ${seg.text.slice(0, 30)}…`}
                              onClick={() => {
                                if (isSpeaking) {
                                  playTokenRef.current += 1;
                                  synthRef.current?.cancel();
                                  setSpeakingSegIdx(i);
                                  window.setTimeout(() => playDialogue(i), 60);
                                } else {
                                  playDialogue(i);
                                }
                              }}
                              className="flex-1 h-1.5 rounded-full transition-all"
                              style={{
                                background: i < speakingSegIdx
                                  ? accent
                                  : i === speakingSegIdx && isSpeaking
                                    ? accent
                                    : 'var(--border)',
                                opacity: i === speakingSegIdx && isSpeaking ? 1 : i < speakingSegIdx ? 0.7 : 0.35,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Tabs ── */}
                    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex">
                        {([
                          { id: 'quiz',       label: 'Câu hỏi' },
                          { id: 'dictation',  label: '✏️ Chép' },
                          { id: 'transcript', label: 'Hội thoại' },
                        ] as const).map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-2 text-[11px] font-semibold transition-all border-b-2"
                            style={activeTab === tab.id
                              ? { borderColor: accent, color: accent }
                              : { borderColor: 'transparent', color: 'var(--text-muted)' }}>
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab: Transcript */}
                      {activeTab === 'transcript' && (
                        <div className="px-4 py-3 space-y-2">
                          {cfg.hasPinyin && (
                            <div className="flex justify-end">
                              <button onClick={() => setShowPinyin(p => !p)}
                                className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                                style={showPinyin ? { background: accent, color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                拼音 Pinyin {showPinyin ? '✓' : ''}
                              </button>
                            </div>
                          )}
                          {selectedPractice.segments.map((seg, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-lg h-fit mt-0.5"
                                style={{ background: cfg.heroBg, color: accent }}>
                                {seg.speaker}
                              </span>
                              <div>
                                <p className="text-sm leading-relaxed"
                                  style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                                  {seg.text}
                                </p>
                                {showPinyin && seg.pinyin && (
                                  <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{seg.pinyin}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab: Quiz */}
                      {activeTab === 'quiz' && (
                        <div className="px-4 py-3">
                          <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            ❓ {selectedPractice.question}
                          </p>
                          <div className="space-y-2 mb-3">
                            {selectedPractice.options.map((opt, i) => {
                              const isCorrect = showAnswer && opt === selectedPractice.answer;
                              const isWrong   = showAnswer && opt !== selectedPractice.answer;
                              return (
                                <div key={i} className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5 transition-all"
                                  style={{
                                    background: isCorrect ? '#DCFCE7' : 'var(--bg-base)',
                                    color:      isCorrect ? '#15803D' : 'var(--text-secondary)',
                                    border:     `1.5px solid ${isCorrect ? '#86EFAC' : 'var(--border)'}`,
                                    fontWeight: isCorrect ? 700 : 400,
                                    opacity:    isWrong ? 0.5 : 1,
                                  }}>
                                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                    style={{ background: isCorrect ? '#86EFAC' : 'var(--border)', color: isCorrect ? '#15803D' : 'var(--text-muted)' }}>
                                    {isCorrect ? '✓' : String.fromCharCode(65 + i)}
                                  </span>
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                          <button onClick={() => setShowAnswer(p => !p)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={showAnswer
                              ? { background: '#DCFCE7', color: '#15803D' }
                              : { background: accent, color: '#fff' }}>
                            {showAnswer ? '✓ Đáp án đúng' : 'Xem đáp án'}
                          </button>
                          {showAnswer && (
                            <div className="mt-3 px-4 py-3 rounded-2xl text-xs leading-relaxed"
                              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                              💡 {selectedPractice.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab: Dictation */}
                      {activeTab === 'dictation' && (
                        <div className="px-4 py-3">
                          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                            Nghe bài hội thoại rồi chép lại đúng những gì bạn nghe được:
                          </p>
                          {!dictationResult ? (
                            <>
                              <textarea
                                value={dictationText}
                                onChange={e => setDictationText(e.target.value)}
                                rows={4}
                                placeholder={cfg.hasPinyin ? '写出你听到的内容（汉字或拼音）…' : '聴こえた内容を書いてください…'}
                                className="w-full text-sm rounded-2xl border px-4 py-3 resize-y outline-none"
                                style={{
                                  background: 'var(--bg-base)', borderColor: 'var(--border)',
                                  color: 'var(--text-primary)', lineHeight: 2,
                                  fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
                                }}
                              />
                              <div className="flex items-center gap-2 mt-2.5">
                                <button
                                  disabled={!dictationText.trim()}
                                  onClick={() => {
                                    const ref = selectedPractice.segments.map(s => s.text).join('');
                                    setDictationResult(scoreDictation(dictationText, ref));
                                  }}
                                  className="px-5 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-40 transition-all"
                                  style={{ background: accent, color: '#fff' }}>
                                  Chấm điểm
                                </button>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dictationText.length} ký tự</span>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Score ring */}
                              <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl"
                                style={{ background: dictationResult.score >= 80 ? '#DCFCE7' : dictationResult.score >= 50 ? '#FEF9C3' : '#FFE4E6' }}>
                                <div className="relative w-16 h-16 shrink-0">
                                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6"
                                      style={{ color: dictationResult.score >= 80 ? '#86EFAC' : dictationResult.score >= 50 ? '#FDE68A' : '#FCA5A5' }} />
                                    <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6"
                                      strokeDasharray={`${2 * Math.PI * 26}`}
                                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - dictationResult.score / 100)}`}
                                      strokeLinecap="round"
                                      style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C', stroke: 'currentColor' }} />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                                    style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C' }}>
                                    {dictationResult.score}%
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-base mb-0.5"
                                    style={{ color: dictationResult.score >= 80 ? '#15803D' : dictationResult.score >= 50 ? '#92400E' : '#BE123C' }}>
                                    {dictationResult.score >= 90 ? '🎉 Xuất sắc!' : dictationResult.score >= 70 ? '👍 Khá tốt!' : dictationResult.score >= 50 ? '💪 Cố gắng thêm' : '📚 Cần luyện thêm'}
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {dictationResult.tokens.filter(t => t.correct).length}/{dictationResult.tokens.length} ký tự đúng
                                  </div>
                                </div>
                              </div>
                              {/* Char diff */}
                              <div className="p-4 rounded-2xl mb-3 leading-loose text-sm"
                                style={{ background: 'var(--bg-base)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                  Nội dung chuẩn
                                </div>
                                {dictationResult.tokens.map((tok, i) => (
                                  <span key={i} style={{
                                    color: tok.correct ? '#15803D' : '#DC2626',
                                    background: tok.correct ? '#DCFCE7' : '#FEE2E2',
                                    borderRadius: 3, padding: '0 1px',
                                  }}>{tok.char}</span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { setDictationResult(null); setDictationText(''); }}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                                  style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                                  Thử lại
                                </button>
                                <button onClick={() => setActiveTab('transcript')}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                  Xem hội thoại
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })() : (
                <div className="card text-center py-16">
                  <div className="text-5xl mb-4 opacity-25">🎧</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Không có bài nghe phù hợp.</p>
                </div>
              )}
            </div>

            {/* ── Sidebar list ── */}
            <div className="flex flex-col gap-2">
              {filteredPractices.length === 0 ? (
                <div className="card text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài nghe.</div>
              ) : filteredPractices.map((p, idx) => {
                const meta   = cfg.levelMeta[p.level];
                const active = p.id === selectedPractice?.id;
                return (
                  <button key={p.id} onClick={() => setSelectedId(p.id)}
                    className="w-full text-left rounded-2xl p-3.5 border transition-all flex items-center gap-3"
                    style={{
                      background:   active ? cfg.heroBg : 'var(--bg-surface)',
                      borderColor:  active ? accent : 'var(--border)',
                      boxShadow:    active ? `0 0 0 1px ${accent}30` : 'none',
                    }}>
                    {/* Index + level */}
                    <div className="shrink-0 flex flex-col items-center gap-1 w-8">
                      <span className="text-[10px] font-bold" style={{ color: active ? accent : 'var(--text-muted)' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                        style={{ background: meta?.badgeBg ?? 'var(--border)', color: meta?.badgeText ?? 'var(--text-muted)' }}>
                        {p.level}
                      </span>
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate mb-0.5"
                        style={{ color: active ? accent : 'var(--text-primary)' }}>
                        {p.title}
                      </div>
                      {p.titleVi && (
                        <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{p.titleVi}</div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <FaClock size={8} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDuration(p.durationSec)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: cfg.heroBg, color: accent }}>{p.category}</span>
                      </div>
                    </div>
                    {/* Play indicator */}
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        if (active) {
                          isSpeaking ? stopPlayback() : playDialogue(0);
                        } else {
                          autoPlayRef.current = true;
                          setSelectedId(p.id);
                        }
                      }}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                      style={active ? { background: accent } : { background: 'var(--bg-muted)' }}>
                      {active && isSpeaking
                        ? <FaPause size={8} style={{ color: '#fff' }} />
                        : <FaPlay size={8} style={{ color: active ? '#fff' : 'var(--text-muted)', marginLeft: 1 }} />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CSS for sound bar animation */}
      <style>{`
        @keyframes soundBar {
          from { height: 6px; }
          to   { height: 32px; }
        }
      `}</style>
    </main>
  );
}
// ─── Fallback ─────────────────────────────────────────────────────────────────
function ListeningPageFallback() {
  return (
    <main>
      <section className="mx-4 mt-4 mb-0 px-6 py-10 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-9 w-64 rounded-xl mb-4" style={{ background: 'var(--border)' }} />
          <div className="h-12 w-full max-w-2xl rounded-xl mb-3" style={{ background: 'var(--border)' }} />
          <div className="h-5 w-full max-w-3xl rounded-lg" style={{ background: 'var(--border)' }} />
        </div>
      </section>
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl h-40" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      </section>
    </main>
  );
}
