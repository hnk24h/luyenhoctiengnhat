'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaHeadphones, FaCirclePlay, FaStop, FaVolumeHigh,
  FaClock, FaCheck, FaWaveSquare, FaRegFileLines, FaChevronRight,
  FaBookmark, FaKeyboard, FaPlay, FaPause, FaMusic,
  FaTrophy, FaThumbsUp, FaDumbbell, FaBook,
  FaRotate, FaRepeat, FaMagnifyingGlass, FaXmark,
  FaGraduationCap, FaFlaskVial, FaStopwatch, FaArrowRotateLeft,
  FaStar, FaRegStar,
} from 'react-icons/fa6';
import { AppSidebar } from '@/components/AppSidebar';

// ─── Unified practice type (matches /api/listening?lang= response) ────────────
interface Segment { speaker: string; text: string; pinyin?: string }

interface GrammarPoint {
  pattern: string;
  reading: string | null;
  meaning: string;
  example: string;
  exampleReading: string | null;
  exampleVi: string;
  searchIn: string;
  levelCode: string;
  order: number;
  foundInText: boolean;
}

interface ListeningPractice {
  id: string; lang: string; level: string; category: string;
  title: string; titleVi?: string | null;
  summary: string; situation: string; durationSec: number;
  focus: string; question: string; options: string[];
  answer: string; explanation: string; audioUrl?: string | null;
  segments: Segment[];
  grammarPoints: GrammarPoint[];
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
  const router = useRouter();
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
  const [activeTab, setActiveTab]               = useState<'transcript'|'quiz'|'dictation'|'grammar'>('quiz');
  const [favoriteGrammarKeys, setFavoriteGrammarKeys] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(typeof localStorage !== 'undefined' ? (localStorage.getItem('favGrammar') ?? '[]') : '[]')); }
    catch { return new Set<string>(); }
  });
  const [audioCurrent, setAudioCurrent]         = useState(0);
  const [audioDuration, setAudioDuration]       = useState(0);
  const [speakingSegIdx, setSpeakingSegIdx]     = useState(0);
  // Quiz flow
  const [selectedAnswer, setSelectedAnswer]     = useState<string | null>(null);
  const [quizChecked, setQuizChecked]           = useState(false);
  // Word lookup
  const [lookupWord, setLookupWord]             = useState<string | null>(null);
  const [lookupPos, setLookupPos]               = useState<{ x: number; y: number } | null>(null);
  // Practice / Exam mode
  const [appMode, setAppMode]                   = useState<'practice' | 'exam'>('practice');
  const [examReplayCount, setExamReplayCount]   = useState(0);
  const [examTimeLeft, setExamTimeLeft]         = useState(600);
  const [examTimerActive, setExamTimerActive]   = useState(false);
  const [examFinished, setExamFinished]         = useState(false);
  // Grammar expanded rows
  const [expandedGrammarIdxs, setExpandedGrammarIdxs] = useState<Set<number>>(new Set());

  const synthRef     = useRef<SpeechSynthesis | null>(null);
  const voicesRef    = useRef<SpeechSynthesisVoice[]>([]);
  const playTokenRef = useRef(0);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const autoPlayRef  = useRef(false);
  const mainRef      = useRef<HTMLDivElement>(null);

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

  // ── 10. URL persistence ────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedLevel !== 'ALL') params.set('level', selectedLevel); else params.delete('level');
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory); else params.delete('category');
    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedLevel, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPractice = useMemo(() =>
    filteredPractices.find(p => p.id === selectedId) ?? filteredPractices[0] ?? null,
    [filteredPractices, selectedId]);

  // Grammar points already pre-derived by the API
  const grammarPoints = selectedPractice?.grammarPoints ?? [];

  function toggleFavoriteGrammar(pattern: string) {
    setFavoriteGrammarKeys(prev => {
      const next = new Set(prev);
      if (next.has(pattern)) next.delete(pattern); else next.add(pattern);
      try { localStorage.setItem('favGrammar', JSON.stringify([...next])); } catch {}
      return next;
    });
  }

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
    setSelectedAnswer(null);
    setQuizChecked(false);
    setLookupWord(null);
    setLookupPos(null);
    setExpandedGrammarIdxs(new Set());
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

  // ── Exam timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!examTimerActive || examFinished) return;
    if (examTimeLeft <= 0) { setExamTimerActive(false); setExamFinished(true); return; }
    const t = setTimeout(() => setExamTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [examTimerActive, examTimeLeft, examFinished]);

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
  const activeMeta = selectedPractice ? cfg.levelMeta[selectedPractice.level] : null;
  const isActiveSaved = selectedPractice ? savedIds.has(selectedPractice.id) : false;

  // Estimate segment start time for audio-file seek (by char ratio)
  function getSegmentStartSec(segIdx: number): number {
    if (!selectedPractice) return 0;
    const totalChars = selectedPractice.segments.reduce((s, seg) => s + seg.text.length, 0);
    if (totalChars === 0) return 0;
    const charsBefore = selectedPractice.segments.slice(0, segIdx).reduce((s, seg) => s + seg.text.length, 0);
    return (charsBefore / totalChars) * (audioDuration || selectedPractice.durationSec);
  }

  // Current segment index estimated from audio time
  const estimatedAudioSegIdx = useMemo(() => {
    if (!selectedPractice || !selectedPractice.audioUrl || audioDuration === 0) return speakingSegIdx;
    const totalChars = selectedPractice.segments.reduce((s, seg) => s + seg.text.length, 0);
    if (totalChars === 0) return 0;
    const progress = audioCurrent / audioDuration;
    let acc = 0;
    for (let i = 0; i < selectedPractice.segments.length; i++) {
      acc += selectedPractice.segments[i].text.length / totalChars;
      if (progress < acc) return i;
    }
    return selectedPractice.segments.length - 1;
  }, [audioCurrent, audioDuration, selectedPractice, speakingSegIdx]);

  function formatExamTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startExamMode() {
    setAppMode('exam');
    setExamTimeLeft(600);
    setExamTimerActive(false);
    setExamFinished(false);
    setExamReplayCount(0);
    setSelectedAnswer(null);
    setQuizChecked(false);
    stopPlayback();
  }

  function exitExamMode() {
    setAppMode('practice');
    setExamTimerActive(false);
    setExamFinished(false);
    stopPlayback();
  }

  const MAX_EXAM_REPLAYS = 3;

  return (
    <>
      <div className="flex" style={{ height: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

        {/* ── Left sidebar ── */}
        <AppSidebar
          headerIcon={<FaHeadphones size={16} color="#fff" />}
          title={cfg.hasPinyin ? 'Nghe tiếng Trung' : 'Nghe tiếng Nhật'}
          subtitle={
            loading ? '…'
            : `${filteredPractices.length} bài nghe`
              + (selectedLevel !== 'ALL' ? ` · ${selectedLevel}` : '')
              + (selectedCategory !== 'ALL' ? ` · ${selectedCategory}` : '')
          }
          accentColor={accent}
          loading={loading}
          emptyText="Không có bài nghe nào"
          filters={[
            {
              label: 'Cấp độ',
              value: selectedLevel,
              onChange: (v) => { setSelectedLevel(v); setSelectedCategory('ALL'); },
              chips: [
                { value: 'ALL', label: 'Tất cả' },
                ...cfg.levelCodes.map(lvl => {
                  const m = cfg.levelMeta[lvl];
                  return { value: lvl, label: lvl, bg: m?.badgeBg, color: m?.badgeText, activeColor: m?.accent ?? accent };
                }),
              ],
            },
            ...(availableCategories.length > 1 ? [{
              label: cfg.categoryLabel,
              value: selectedCategory,
              onChange: (v: string) => setSelectedCategory(v),
              chips: [
                { value: 'ALL', label: 'Tất cả' },
                ...availableCategories.map(cat => ({ value: cat, label: cat, bg: cfg.heroBg, color: accent })),
              ],
            }] : []),
          ]}
          items={filteredPractices.map(p => {
            const m = cfg.levelMeta[p.level];
            return {
              id: p.id,
              title: p.title,
              levelLabel: p.level,
              levelBg: m?.badgeBg,
              levelColor: m?.badgeText,
              tag: p.category,
              meta: formatDuration(p.durationSec),
              metaIcon: <FaClock size={7} />,
              fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif',
              progress: savedIds.has(p.id) ? 'done' as const : undefined,
            };
          })}
          selectedId={selectedId}
          onSelect={setSelectedId}
          showSoundBars
          searchable
          searchPlaceholder={cfg.hasPinyin ? '找找标题…' : 'タイトル検索…'}
        />

        {/* ── Main content panel ── */}
        <div ref={mainRef} className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 rounded-full border-4 animate-spin"
                style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            </div>
          ) : !selectedPractice ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${accent} 12%, var(--bg-base))` }}>
                <FaHeadphones size={36} style={{ color: accent, opacity: 0.7 }} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-base)' }}>Chọn bài từ danh sách</p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>Lựa chọn mức độ và dạng bài phù hợp với trình độ của bạn</p>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-5 max-w-[900px] mx-auto">

              {/* ── Mode toggle ── */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => { setAppMode('practice'); setExamTimerActive(false); setExamFinished(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={appMode === 'practice'
                    ? { background: accent, color: '#fff', boxShadow: `0 2px 8px ${accent}40` }
                    : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  <FaFlaskVial size={11} />
                  Practice
                </button>
                <button
                  onClick={startExamMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={appMode === 'exam'
                    ? { background: '#7C3AED', color: '#fff', boxShadow: '0 2px 8px #7C3AED40' }
                    : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                  <FaGraduationCap size={11} />
                  Exam
                </button>
                {appMode === 'exam' && (
                  <div className="ml-auto flex items-center gap-2">
                    {!examTimerActive && !examFinished ? (
                      <button
                        onClick={() => setExamTimerActive(true)}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: '#7C3AED20', color: '#7C3AED' }}>
                        Bắt đầu thi
                      </button>
                    ) : (
                      <span className={`flex items-center gap-1 text-sm font-bold tabular-nums px-3 py-1 rounded-xl ${examTimeLeft <= 60 ? 'animate-pulse' : ''}`}
                        style={{ background: examTimeLeft <= 60 ? '#FEE2E2' : '#7C3AED15', color: examTimeLeft <= 60 ? '#DC2626' : '#7C3AED' }}>
                        <FaStopwatch size={11} />
                        {examFinished ? 'Hết giờ' : formatExamTime(examTimeLeft)}
                      </span>
                    )}
                    <button onClick={exitExamMode} className="text-[10px] px-2 py-1 rounded-lg"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      Thoát
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${appMode === 'exam' ? '#7C3AED40' : 'var(--border)'}`, boxShadow: appMode === 'exam' ? '0 4px 20px -4px #7C3AED25' : '0 4px 20px -4px rgba(0,0,0,0.10)' }}>

                    {/* Coloured top bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${activeMeta?.accent ?? accent}, ${accent})` }} />

                    {/* ── Compact header: badges + title + save ── */}
                    <div className="px-4 pt-3 pb-3 flex items-start gap-3">
                      {/* Left: meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {activeMeta && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: activeMeta.badgeBg, color: activeMeta.badgeText }}>
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
                          style={isActiveSaved
                            ? { background: '#DCFCE7', color: '#15803D' }
                            : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                          <FaBookmark size={9} />
                          {isActiveSaved ? 'Đã lưu' : 'Lưu'}
                        </button>
                      )}
                    </div>

                    {/* ── Inline player bar ── */}
                    <div className="mx-4 mb-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-base)' }}>
                      {/* Row 1: play + time + speed */}
                      <div className="flex items-center gap-2 mb-2">
                        {/* Sound bars (animated) */}
                        <div className="flex items-end gap-[2px] h-5 shrink-0">
                          {[4,7,10,6,9,12,5,8].map((h, i) => (
                            <div key={i} className="w-[3px] rounded-full"
                              style={{
                                height: isSpeaking ? undefined : `${h * 2}px`,
                                minHeight: 3,
                                background: accent,
                                opacity: isSpeaking ? 1 : 0.25,
                                animation: isSpeaking ? `soundBar ${0.5 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite alternate` : 'none',
                              }} />
                          ))}
                        </div>

                        {/* Play / Stop */}
                        {(speechSupported || selectedPractice.audioUrl) ? (
                          <button
                            disabled={appMode === 'exam' && examReplayCount >= MAX_EXAM_REPLAYS && !isSpeaking}
                            onClick={() => {
                              if (isSpeaking) {
                                stopPlayback();
                              } else {
                                if (appMode === 'exam') {
                                  setExamReplayCount(p => p + 1);
                                  if (!examTimerActive) setExamTimerActive(true);
                                }
                                playDialogue(0);
                              }
                            }}
                            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all active:scale-95 disabled:opacity-40"
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

                        {/* Time */}
                        <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: accent }}>
                          {audioDuration > 0
                            ? `${formatDuration(Math.floor(audioCurrent))} / ${formatDuration(Math.floor(audioDuration))}`
                            : formatDuration(selectedPractice.durationSec)}
                        </span>

                        {appMode === 'exam' && (
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                            {examReplayCount}/{MAX_EXAM_REPLAYS} lần nghe
                          </span>
                        )}

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

                      {/* Row 2: Simple seekbar */}
                      {selectedPractice.audioUrl ? (
                        /* Audio file: click/drag to seek */
                        <div
                          className="relative h-8 flex items-center cursor-pointer group select-none"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            const t = pct * (audioDuration || selectedPractice.durationSec);
                            setAudioCurrent(t);
                            if (audioRef.current) audioRef.current.currentTime = t;
                          }}>
                          {/* Track */}
                          <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: `${accent}25` }}>
                            {/* Fill */}
                            <div className="h-full rounded-full"
                              style={{
                                width: `${audioDuration > 0 ? (audioCurrent / audioDuration) * 100 : 0}%`,
                                background: accent,
                                transition: 'width 0.1s linear',
                              }} />
                          </div>
                          {/* Thumb */}
                          <div
                            className="absolute w-3.5 h-3.5 rounded-full shadow-md transition-transform group-hover:scale-125"
                            style={{
                              left: `${audioDuration > 0 ? (audioCurrent / audioDuration) * 100 : 0}%`,
                              transform: 'translateX(-50%)',
                              background: accent,
                              top: '50%',
                              marginTop: '-7px',
                              boxShadow: `0 0 0 3px ${accent}30`,
                            }} />
                        </div>
                      ) : (
                        /* TTS: segment pills */
                        <div className="flex items-center gap-1 py-2">
                          {selectedPractice.segments.map((seg, i) => {
                            const isPlayed = i < speakingSegIdx;
                            const isCurrent = i === speakingSegIdx && isSpeaking;
                            return (
                              <button
                                key={i}
                                title={`${seg.speaker}: ${seg.text.slice(0, 24)}…`}
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
                                className="flex-1 h-1.5 rounded-full transition-all hover:h-2.5"
                                style={{
                                  background: isCurrent ? accent : isPlayed ? `${accent}80` : `${accent}25`,
                                  animation: isCurrent ? `soundBar ${0.4 + (i % 3) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
                                }} />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* ── Tabs ── */}
                    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex">
                        {([
                          { id: 'quiz',       label: 'Câu hỏi' },
                          ...(appMode === 'practice' ? [
                            { id: 'dictation',  label: '✏️ Nghe và viết' },
                            { id: 'transcript', label: 'Hội thoại' },
                            { id: 'grammar',    label: '文法' },
                          ] : []),
                        ] as const).map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className="flex-1 py-2 text-[11px] font-semibold transition-all border-b-2"
                            style={activeTab === tab.id
                              ? { borderColor: appMode === 'exam' ? '#7C3AED' : accent, color: appMode === 'exam' ? '#7C3AED' : accent }
                              : { borderColor: 'transparent', color: 'var(--text-muted)' }}>
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab: Transcript */}
                      {activeTab === 'transcript' && appMode === 'practice' && (
                        <div className="px-4 py-3 space-y-1.5">
                          {cfg.hasPinyin && (
                            <div className="flex justify-end mb-2">
                              <button onClick={() => setShowPinyin(p => !p)}
                                className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                                style={showPinyin ? { background: accent, color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                拼音 Pinyin {showPinyin ? '✓' : ''}
                              </button>
                            </div>
                          )}
                          {selectedPractice.segments.map((seg, i) => {
                            const activeIdx = selectedPractice.audioUrl ? estimatedAudioSegIdx : speakingSegIdx;
                            const isActive = isSpeaking && i === activeIdx;
                            return (
                              <div key={i}
                                className="flex gap-2 px-3 py-2 rounded-xl transition-all"
                                style={{
                                  background: isActive ? `color-mix(in srgb, ${accent} 10%, var(--bg-muted))` : 'transparent',
                                  borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                                }}>
                                {/* Speaker badge + repeat button */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg h-fit"
                                    style={{ background: cfg.heroBg, color: accent }}>
                                    {seg.speaker}
                                  </span>
                                  <button
                                    title="Nghe lại câu này"
                                    onClick={() => {
                                      if (selectedPractice.audioUrl) {
                                        const startSec = getSegmentStartSec(i);
                                        if (!audioRef.current || audioRef.current.src !== selectedPractice.audioUrl) {
                                          const a = new Audio(selectedPractice.audioUrl);
                                          a.addEventListener('loadedmetadata', () => setAudioDuration(a.duration));
                                          a.addEventListener('timeupdate', () => setAudioCurrent(a.currentTime));
                                          audioRef.current = a;
                                        }
                                        audioRef.current.currentTime = startSec;
                                        audioRef.current.play().catch(() => {});
                                        setIsSpeaking(true);
                                      } else {
                                        if (isSpeaking) { playTokenRef.current += 1; synthRef.current?.cancel(); }
                                        window.setTimeout(() => playDialogue(i), 60);
                                      }
                                    }}
                                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: `${accent}20`, color: accent }}>
                                    <FaRepeat size={7} />
                                  </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm leading-relaxed"
                                    style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                                    {seg.text.split('').map((char, ci) => (
                                      /[\u3000-\u9FFF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(char) ? (
                                        <span
                                          key={ci}
                                          className="cursor-pointer rounded px-px transition-colors hover:bg-yellow-100"
                                          onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setLookupWord(char);
                                            setLookupPos({ x: rect.left + rect.width / 2, y: rect.top });
                                          }}>
                                          {char}
                                        </span>
                                      ) : <span key={ci}>{char}</span>
                                    ))}
                                  </p>
                                  {showPinyin && seg.pinyin && (
                                    <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{seg.pinyin}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tab: Quiz */}
                      {activeTab === 'quiz' && (
                        <div className="px-4 py-3">
                          {examFinished && appMode === 'exam' && (
                            <div className="mb-3 p-3 rounded-2xl text-center"
                              style={{ background: '#7C3AED15', color: '#7C3AED' }}>
                              <p className="font-bold text-sm">⏰ Hết giờ thi!</p>
                              {quizChecked && (
                                <p className="text-xs mt-1">
                                  {selectedAnswer === selectedPractice.answer ? '🎉 Bạn đã trả lời đúng!' : '😔 Chưa đúng — xem giải thích bên dưới'}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            ❓ {selectedPractice.question}
                          </p>
                          <div className="space-y-2 mb-3">
                            {selectedPractice.options.map((opt, i) => {
                              const isSelected = selectedAnswer === opt;
                              const isCorrect  = quizChecked && opt === selectedPractice.answer;
                              const isWrong    = quizChecked && isSelected && opt !== selectedPractice.answer;
                              return (
                                <button
                                  key={i}
                                  disabled={quizChecked}
                                  onClick={() => !quizChecked && setSelectedAnswer(opt)}
                                  className="w-full px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5 transition-all text-left"
                                  style={{
                                    background: isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : isSelected ? `color-mix(in srgb, ${accent} 12%, var(--bg-base))` : 'var(--bg-base)',
                                    color:      isCorrect ? '#15803D' : isWrong ? '#DC2626' : 'var(--text-secondary)',
                                    border:     `1.5px solid ${isCorrect ? '#86EFAC' : isWrong ? '#FCA5A5' : isSelected ? accent : 'var(--border)'}`,
                                    fontWeight: isCorrect || isSelected ? 600 : 400,
                                    cursor:     quizChecked ? 'default' : 'pointer',
                                  }}>
                                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                    style={{
                                      background: isCorrect ? '#86EFAC' : isWrong ? '#FCA5A5' : isSelected ? accent : 'var(--border)',
                                      color: isCorrect ? '#15803D' : isWrong ? '#DC2626' : isSelected ? '#fff' : 'var(--text-muted)',
                                    }}>
                                    {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + i)}
                                  </span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* CTA button: changes per quiz step */}
                          {!quizChecked ? (
                            <button
                              disabled={!selectedAnswer}
                              onClick={() => { if (selectedAnswer) setQuizChecked(true); }}
                              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                              style={{ background: selectedAnswer ? (appMode === 'exam' ? '#7C3AED' : accent) : 'var(--bg-muted)', color: selectedAnswer ? '#fff' : 'var(--text-muted)' }}>
                              Kiểm tra
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold`}
                                style={selectedAnswer === selectedPractice.answer
                                  ? { background: '#DCFCE7', color: '#15803D' }
                                  : { background: '#FEE2E2', color: '#DC2626' }}>
                                {selectedAnswer === selectedPractice.answer ? '✔ Đúng rồi!' : '✖ Chưa đúng'}
                              </div>
                              <button
                                onClick={() => { setSelectedAnswer(null); setQuizChecked(false); }}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
                                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                <FaArrowRotateLeft size={10} /> Thử lại
                              </button>
                            </div>
                          )}

                          {/* Explanation — only show after check */}
                          {quizChecked && (
                            <div className="mt-3 px-4 py-3 rounded-2xl text-xs leading-relaxed"
                              style={{ background: appMode === 'exam' ? '#7C3AED12' : 'var(--primary-light)', color: appMode === 'exam' ? '#7C3AED' : 'var(--primary)' }}>
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
                                    {dictationResult.score >= 90 ? <><FaTrophy size={14} color="#F59E0B"/> Xuất sắc!</> : dictationResult.score >= 70 ? <><FaThumbsUp size={14} color="#10B981"/> Khá tốt!</> : dictationResult.score >= 50 ? <><FaDumbbell size={14} color="#D97706"/> Cố gắng thêm</> : <><FaBook size={14} color="#6B7280"/> Cần luyện thêm</>}
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

                      {/* Tab: Grammar */}
                      {activeTab === 'grammar' && appMode === 'practice' && (
                        <div className="px-4 py-3 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGraduationCap size={12} style={{ color: accent }} />
                            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              Ngữ pháp trong bài — {selectedPractice.level}
                            </span>
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>
                              {grammarPoints.filter(g => g.foundInText).length} tìm thấy
                            </span>
                            <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              ⭐ {favoriteGrammarKeys.size} đã lưu
                            </span>
                          </div>

                          {grammarPoints.map((gp, i) => {
                            const isFav = favoriteGrammarKeys.has(gp.pattern);
                            const expanded = expandedGrammarIdxs.has(i);
                            const levelMeta = cfg.levelMeta[gp.levelCode];
                            // Show divider before first "not found in text" entry (if there are some found ones)
                            const hasSomFound = grammarPoints.some(g => g.foundInText);
                            const showDivider = hasSomFound && !gp.foundInText && (i === 0 || grammarPoints[i - 1].foundInText);
                            return (
                              <div key={i}>
                                {showDivider && (
                                  <div className="flex items-center gap-2 my-2">
                                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                    <span className="text-[10px] font-semibold px-2" style={{ color: 'var(--text-muted)' }}>Cũng hữu ích ở level này</span>
                                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                  </div>
                                )}
                              <div className="rounded-2xl border overflow-hidden transition-all"
                                style={{ borderColor: gp.foundInText ? `${accent}55` : isFav ? '#FDE68A' : 'var(--border)', background: gp.foundInText ? `color-mix(in srgb, ${accent} 4%, var(--bg-base))` : 'var(--bg-base)' }}>
                                {/* Header row */}
                                <div
                                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                                  onClick={() => setExpandedGrammarIdxs(prev => {
                                    const next = new Set(prev);
                                    if (next.has(i)) next.delete(i); else next.add(i);
                                    return next;
                                  })}>
                                  {/* Found badge */}
                                  {gp.foundInText && (
                                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ background: `${accent}20`, color: accent }}>✦ BÀI</span>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm"
                                      style={{ color: gp.foundInText ? accent : 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                                      {gp.pattern}
                                    </span>
                                    {gp.reading && !cfg.hasPinyin && (
                                      <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>{gp.reading}</span>
                                    )}
                                    <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>— {gp.meaning}</span>
                                  </div>
                                  {/* Level badge when it differs from lesson level */}
                                  {gp.levelCode !== selectedPractice.level && levelMeta && (
                                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ background: levelMeta.badgeBg, color: levelMeta.badgeText }}>{gp.levelCode}</span>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavoriteGrammar(gp.pattern); }}
                                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={isFav
                                      ? { background: '#FEF9C3', color: '#D97706' }
                                      : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                    {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
                                  </button>
                                  <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                                    {expanded ? '▲' : '▼'}
                                  </span>
                                </div>
                                {/* Expanded: example */}
                                {expanded && (
                                  <div className="px-4 pb-3 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-start gap-2">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                                          style={{ background: `${accent}18`, color: accent }}>例</span>
                                        <p className="text-sm leading-relaxed"
                                          style={{ color: 'var(--text-primary)', fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif' }}>
                                          {gp.example}
                                        </p>
                                      </div>
                                      {gp.exampleReading && (
                                        <p className="text-xs italic pl-8" style={{ color: 'var(--text-muted)' }}>{gp.exampleReading}</p>
                                      )}
                                      <p className="text-xs pl-8" style={{ color: 'var(--text-secondary)' }}>→ {gp.exampleVi}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            );
                          })}

                          {grammarPoints.length === 0 && (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                              Chưa có dữ liệu ngữ pháp cho bài này.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for sound bar animation */}
      <style>{`
        @keyframes soundBar {
          from { height: 6px; }
          to   { height: 32px; }
        }
      `}</style>

      {/* ── Word Lookup Popup ── */}
      {lookupWord && lookupPos && (
        <div
          className="fixed z-50 pointer-events-auto"
          style={{ top: lookupPos.y - 8, left: lookupPos.x, transform: 'translate(-50%, -100%)' }}>
          <div className="rounded-2xl shadow-xl border px-4 py-3 min-w-[160px] max-w-[220px]"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.18)' }}>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-2 overflow-hidden">
              <div className="w-4 h-4 rotate-45 border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', marginTop: -8, marginLeft: 0 }} />
            </div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xl font-bold" style={{ fontFamily: cfg.hasPinyin ? '"Noto Sans SC", sans-serif' : '"Noto Sans JP", serif', color: accent }}>
                {lookupWord}
              </span>
              <button onClick={() => { setLookupWord(null); setLookupPos(null); }}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-50"
                style={{ color: 'var(--text-muted)' }}>
                <FaXmark size={10} />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={cfg.hasPinyin
                  ? `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(lookupWord)}`
                  : `https://jisho.org/search/${encodeURIComponent(lookupWord)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: `${accent}18`, color: accent }}>
                {cfg.hasPinyin ? 'MDBG' : 'Jisho'} →
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(lookupWord!).catch(() => {}); }}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dismiss lookup on backdrop click */}
      {lookupWord && (
        <div className="fixed inset-0 z-40" onClick={() => { setLookupWord(null); setLookupPos(null); }} />
      )}
    </>
  );
}
// ─── Fallback ─────────────────────────────────────────────────────────────────
function ListeningPageFallback() {
  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r animate-pulse"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--border)' }} />
          <div className="flex gap-1 flex-wrap">
            {[...Array(6)].map((_, i) => <div key={i} className="h-6 w-10 rounded-lg" style={{ background: 'var(--border)' }} />)}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 px-3 pt-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      </aside>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    </div>
  );
}
