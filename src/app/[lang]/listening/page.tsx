'use client';
import { FaBars, FaTimes } from 'react-icons/fa';


import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaHeadphones,
  FaClock,
  FaBookmark,
  FaGraduationCap, FaFlaskVial, FaStopwatch,
} from 'react-icons/fa6';
import { AppSidebar } from '@/components/AppSidebar';
import { LevelFilterBar } from '@/components/listening/LevelFilterBar';
import { SearchInput } from '@/components/listening/SearchInput';
import { ListeningList } from '@/components/listening/ListeningList';
import { ListeningPlayer } from '@/components/listening/ListeningPlayer';
import ListeningTabs from '@/components/listening/ListeningTabs';
import { WordLookupPopup } from '@/components/WordLookupPopup';

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

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [practices, setPractices] = useState<ListeningPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(() => searchParams.get('level') ?? cfg.levelCodes[0]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(lang === 'ja' ? 0.92 : 1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showDictation, setShowDictation] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [dictationResult, setDictationResult] = useState<DictResult | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'quiz' | 'dictation' | 'grammar'>('quiz');
  const [favoriteGrammarKeys, setFavoriteGrammarKeys] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(typeof localStorage !== 'undefined' ? (localStorage.getItem('favGrammar') ?? '[]') : '[]')); }
    catch { return new Set<string>(); }
  });
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [speakingSegIdx, setSpeakingSegIdx] = useState(0);
  // Quiz flow
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  // Word lookup
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [lookupPos, setLookupPos] = useState<{ x: number; y: number } | null>(null);
  // Practice / Exam mode
  const [appMode, setAppMode] = useState<'practice' | 'exam'>('practice');
  const [examReplayCount, setExamReplayCount] = useState(0);
  const [examTimeLeft, setExamTimeLeft] = useState(600);
  const [examTimerActive, setExamTimerActive] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  // Grammar expanded rows
  const [expandedGrammarIdxs, setExpandedGrammarIdxs] = useState<Set<number>>(new Set());

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const playTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayRef = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

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

  // Filter by level, category, and search
  const filteredPractices = useMemo(() =>
    practices.filter(p =>
      (selectedLevel === 'ALL' || p.level === selectedLevel) &&
      (selectedCategory === 'ALL' || p.category === selectedCategory) &&
      (!search.trim() ||
        p.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        (p.titleVi && p.titleVi.toLowerCase().includes(search.trim().toLowerCase())) ||
        (p.situation && p.situation.toLowerCase().includes(search.trim().toLowerCase()))
      )
    ), [practices, selectedLevel, selectedCategory, search]);

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
      try { localStorage.setItem('favGrammar', JSON.stringify([...next])); } catch { }
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
      <div className="flex flex-col-reverse md:flex-row h-full min-h-screen bg-[var(--bg-base)]">
        {/* Sidebar: bottom on mobile, left on desktop */}
        {/* Sidebar: toggle mobile, sticky desktop */}
        {/* Backdrop mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 md:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
        )}
        {/* Sidebar mobile: fixed bottom, only on mobile */}
        <aside
          className={`w-full fixed bottom-0 left-0 z-40 md:hidden border-t bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-base)] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} rounded-t-2xl border shadow-xl h-full`}
          style={{ borderColor: 'var(--border)', minHeight: 'auto', boxShadow: '0 -2px 16px 0 rgba(80,80,120,0.04), 2px 0 16px 0 rgba(80,80,120,0.04)' }}
          tabIndex={-1}
        >
          {/* Nút đóng sidebar mobile */}
          {sidebarOpen && (
            <button
              className="fixed top-12 right-4 md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white/90 shadow-xl border border-white/80 z-50"
              style={{ color: accent }}
              aria-label="Đóng menu bài nghe"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes size={22} />
            </button>
          )}
          <div className="z-10 bg-[var(--bg-surface)]/80 backdrop-blur-md shadow-sm px-4 pt-3 pb-2 rounded-t-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#a18fff] to-[#6C5CE7] shadow-md">
                <FaHeadphones size={18} color="#fff" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold leading-snug truncate tracking-tight" style={{ color: '#6C5CE7', letterSpacing: '-0.5px' }}>{cfg.hasPinyin ? 'Nghe tiếng Trung' : 'Nghe tiếng Nhật'}</div>
                <div className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {loading ? 'Đang tải…' : `${filteredPractices.length} bài${selectedLevel !== 'ALL' ? ` · ${selectedLevel}` : ''}${selectedCategory !== 'ALL' ? ` · ${selectedCategory}` : ''}`}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <SearchInput
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={cfg.hasPinyin ? '找找标题…' : 'Tìm kiếm tiêu đề…'}
              />
              <LevelFilterBar
                levels={cfg.levelCodes}
                selected={selectedLevel}
                onSelect={lvl => { setSelectedLevel(lvl); setSelectedCategory('ALL'); }}
                allLabel="Tất cả"
                colorMap={Object.fromEntries(cfg.levelCodes.map(lvl => [lvl, { bg: cfg.levelMeta[lvl].badgeBg, color: cfg.levelMeta[lvl].badgeText, activeColor: cfg.levelMeta[lvl].accent }]))}
                accent={accent}
              />
              {availableCategories.length > 1 && (
                <LevelFilterBar
                  levels={availableCategories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  allLabel="Tất cả"
                  colorMap={Object.fromEntries(availableCategories.map(cat => [cat, { bg: cfg.heroBg, color: accent }]))}
                  accent={accent}
                />
              )}
            </div>
          </div>
          {/* List section */}
          <div className="overflow-y-auto px-1 pb-2 pt-1 mt-1 max-h-[40vh]">
            <div className="p-1">
              <ListeningList
                items={filteredPractices}
                selectedId={selectedId}
                onSelect={id => {
                  setSelectedId(id);
                  setSidebarOpen(false);
                }}
                onPlay={(id: string) => {
                  if (selectedId === id && isSpeaking) {
                    stopPlayback();
                  } else if (selectedId === id) {
                    playDialogue(0);
                  } else {
                    autoPlayRef.current = true;
                    setSelectedId(id);
                  }
                  setSidebarOpen(false);
                }}
                isPlayingId={isSpeaking ? selectedId : undefined}
                levelMeta={cfg.levelMeta}
                heroBg={cfg.heroBg}
                accent={accent}
              />
            </div>
          </div>
        </aside>

        {/* Sidebar desktop: sticky left, only on desktop */}
        <aside
          className={`hidden md:block md:w-80 shrink-0 md:sticky md:top-[80px] border-r md:max-h-[calc(100vh-10rem)] z-20 rounded-2xl border shadow-xl`}
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', minHeight: 'auto', boxShadow: '2px 0 16px 0 rgba(80,80,120,0.04)' }}
          tabIndex={-1}
        >
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#a18fff] to-[#6C5CE7] shadow-md">
                <FaHeadphones size={20} color="#fff" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold leading-snug truncate tracking-tight" style={{ color: '#6C5CE7', letterSpacing: '-0.5px' }}>{cfg.hasPinyin ? 'Nghe tiếng Trung' : 'Nghe tiếng Nhật'}</div>
                <div className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {loading ? 'Đang tải…' : `${filteredPractices.length} bài${selectedLevel !== 'ALL' ? ` · ${selectedLevel}` : ''}${selectedCategory !== 'ALL' ? ` · ${selectedCategory}` : ''}`}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SearchInput
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={cfg.hasPinyin ? '找找标题…' : 'Tìm kiếm tiêu đề…'}
              />
              <LevelFilterBar
                levels={cfg.levelCodes}
                selected={selectedLevel}
                onSelect={lvl => { setSelectedLevel(lvl); setSelectedCategory('ALL'); }}
                allLabel="Tất cả"
                colorMap={Object.fromEntries(cfg.levelCodes.map(lvl => [lvl, { bg: cfg.levelMeta[lvl].badgeBg, color: cfg.levelMeta[lvl].badgeText, activeColor: cfg.levelMeta[lvl].accent }]))}
                accent={accent}
              />
              {availableCategories.length > 1 && (
                <LevelFilterBar
                  levels={availableCategories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  allLabel="Tất cả"
                  colorMap={Object.fromEntries(availableCategories.map(cat => [cat, { bg: cfg.heroBg, color: accent }]))}
                  accent={accent}
                />
              )}
            </div>
          </div>
          {/* List section */}
          <div className="overflow-y-auto px-2 pb-4 pt-2 mt-2 max-h-none">
            <ListeningList
              items={filteredPractices}
              selectedId={selectedId}
              onSelect={id => setSelectedId(id)}
              onPlay={(id: string) => {
                if (selectedId === id && isSpeaking) {
                  stopPlayback();
                } else if (selectedId === id) {
                  playDialogue(0);
                } else {
                  autoPlayRef.current = true;
                  setSelectedId(id);
                }
              }}
              isPlayingId={isSpeaking ? selectedId : undefined}
              levelMeta={cfg.levelMeta}
              heroBg={cfg.heroBg}
              accent={accent}
            />
          </div>
        </aside>

        {/* Main content panel: responsive */}
        <div ref={mainRef} className="flex-1 overflow-y-auto px-0 md:px-2 pb-[180px] md:pb-0">
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
            <div className="p-2 sm:p-4 lg:p-5 max-w-full md:max-w-[900px] mx-auto">
              {/* ── Mode toggle ── */}
              <div className="flex items-center gap-2 mb-3">
                {/* Nút mở sidebar mobile trong header main content */}
                <button
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 shadow border border-white/80 mr-1"
                  style={{ color: accent }}
                  aria-label="Mở menu bài nghe"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FaBars size={20} />
                </button>
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
                {/* Player bar */}
                <ListeningPlayer
                  isSpeaking={isSpeaking}
                  speechSupported={speechSupported}
                  selectedPractice={selectedPractice}
                  appMode={appMode}
                  examReplayCount={examReplayCount}
                  MAX_EXAM_REPLAYS={MAX_EXAM_REPLAYS}
                  examTimerActive={examTimerActive}
                  accent={accent}
                  audioDuration={audioDuration}
                  audioCurrent={audioCurrent}
                  playbackRate={playbackRate}
                  setPlaybackRate={setPlaybackRate}
                  stopPlayback={stopPlayback}
                  playDialogue={playDialogue}
                  setExamReplayCount={setExamReplayCount}
                  setExamTimerActive={setExamTimerActive}
                  speakingSegIdx={speakingSegIdx}
                  setSpeakingSegIdx={setSpeakingSegIdx}
                  playTokenRef={playTokenRef}
                  synthRef={synthRef}
                  audioRef={audioRef}
                  getSegmentStartSec={getSegmentStartSec}
                  estimatedAudioSegIdx={estimatedAudioSegIdx}
                  showPinyin={showPinyin}
                  setShowPinyin={setShowPinyin}
                  cfg={cfg}
                />
                {/* Tabs */}
                <ListeningTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  appMode={appMode}
                  selectedPractice={selectedPractice}
                  accent={accent}
                  cfg={cfg}
                  showPinyin={showPinyin}
                  setShowPinyin={setShowPinyin}
                  estimatedAudioSegIdx={estimatedAudioSegIdx}
                  speakingSegIdx={speakingSegIdx}
                  isSpeaking={isSpeaking}
                  getSegmentStartSec={getSegmentStartSec}
                  audioRef={audioRef}
                  playDialogue={playDialogue}
                  synthRef={synthRef}
                  playTokenRef={playTokenRef}
                  dictationText={dictationText}
                  setDictationText={setDictationText}
                  dictationResult={dictationResult}
                  setDictationResult={setDictationResult}
                  scoreDictation={scoreDictation}
                  quizChecked={quizChecked}
                  setQuizChecked={setQuizChecked}
                  selectedAnswer={selectedAnswer}
                  setSelectedAnswer={setSelectedAnswer}
                  examFinished={examFinished}
                  examTimeLeft={examTimeLeft}
                  formatExamTime={formatExamTime}
                  grammarPoints={grammarPoints}
                  favoriteGrammarKeys={favoriteGrammarKeys}
                  toggleFavoriteGrammar={toggleFavoriteGrammar}
                  expandedGrammarIdxs={expandedGrammarIdxs}
                  setExpandedGrammarIdxs={setExpandedGrammarIdxs}
                />
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
        <>
          <WordLookupPopup
            word={lookupWord}
            pos={lookupPos}
            accent={accent}
            hasPinyin={cfg.hasPinyin}
            onClose={() => { setLookupWord(null); setLookupPos(null); }}
          />
          {/* Dismiss lookup on backdrop click */}
          <div className="fixed inset-0 z-40" onClick={() => { setLookupWord(null); setLookupPos(null); }} />
        </>
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
