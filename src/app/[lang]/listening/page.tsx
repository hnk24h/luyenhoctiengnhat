'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { LearnLayout } from '@/components/learn/LearnLayout';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeadphones, FaBookOpen, FaFlaskVial, FaGraduationCap, FaStopwatch, FaBookmark } from 'react-icons/fa6';
import { ListeningPlayer } from '@/components/listening/ListeningPlayer';
import { ListeningList } from '@/components/listening/ListeningList';

import { SearchInput } from '@/components/listening/SearchInput';
import ListeningTabs from '@/components/listening/ListeningTabs';

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
  const { data: session } = useSession();

  // State
  const [practices, setPractices] = useState<ListeningPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(() => searchParams.get('level') ?? cfg.levelCodes[0]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<'quiz' | 'transcript' | 'dictation' | 'grammar'>('quiz');
  // ListeningTabs state
  const [showPinyin, setShowPinyin] = useState(false);
  const [dictationText, setDictationText] = useState('');
  // DictResult type for ListeningTabs
  interface DictResult { score: number; tokens: { char: string; correct: boolean }[] }
  const [dictationResult, setDictationResult] = useState<DictResult | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [favoriteGrammarKeys, setFavoriteGrammarKeys] = useState<Set<string>>(new Set());
  const [expandedGrammarIdxs, setExpandedGrammarIdxs] = useState<Set<number>>(new Set());

  // Grammar helpers (must be after selectedPractice)
  // (moved below selectedPractice definition)
  // Exam helpers
  const examTimeLeft = 0;
  const formatExamTime = (secs: number) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  const [playbackRate, setPlaybackRate] = useState(lang === 'ja' ? 0.92 : 1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [examReplayCount, setExamReplayCount] = useState(0);
  const [examTimerActive, setExamTimerActive] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Fetch practices
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/listening?lang=${lang}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ListeningPractice[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setPractices(data);
        setSelectedId(data[0]?.id ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [lang]);

  // Derived state
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

  const selectedPractice = useMemo(() =>
    filteredPractices.find(p => p.id === selectedId) ?? filteredPractices[0] ?? null,
    [filteredPractices, selectedId]);

  // Grammar helpers (now after selectedPractice)
  const grammarPoints = selectedPractice?.grammarPoints || [];
  const toggleFavoriteGrammar = (pattern: string) => {
    setFavoriteGrammarKeys(prev => {
      const next = new Set(prev);
      if (next.has(pattern)) next.delete(pattern); else next.add(pattern);
      return next;
    });
  };

  // Sidebar/BottomBar config
  const LEVELS_OBJ = cfg.levelCodes.map(lv => ({ code: lv, label: lv, desc: cfg.levelMeta[lv]?.desc }));
  const SKILLS = [
    { key: 'textbook', label: 'Nghe theo giáo trình', icon: <FaBookOpen /> },
    { key: 'basic', label: 'Nghe hội thoại cơ bản', icon: <FaHeadphones /> },
    { key: 'shadowing', label: 'Shadowing', icon: <FaGraduationCap /> },
  ];

  // Player logic (simplified)
  function stopPlayback() {
    playTokenRef.current += 1;
    synthRef.current?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsSpeaking(false);
    setAudioCurrent(0);
    setAudioDuration(0);
  }
  function playDialogue() {
    if (!selectedPractice) return;
    if (selectedPractice.audioUrl && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsSpeaking(true);
    }
  }

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'level',
        setMode: () => {},
        selectedLevel,
        setSelectedLevel,
        selectedSkill,
        setSelectedSkill,
        levels: LEVELS_OBJ,
        skills: SKILLS,
        title: cfg.hasPinyin ? 'Nghe tiếng Trung' : 'Nghe tiếng Nhật',
      }}
      bottomBarProps={{
        levels: LEVELS_OBJ,
        selectedLevel,
        setSelectedLevel,
        skills: SKILLS,
        selectedSkill,
        setSelectedSkill,
      }}
    >
      <LearnHeader icon={<FaHeadphones />} title={cfg.heroTitle} subtitle={cfg.heroTag} />
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar: danh sách bài nghe */}
        <aside className="md:w-72">
          <ListeningList
            items={filteredPractices}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isPlayingId={isSpeaking ? selectedId : undefined}
            levelMeta={cfg.levelMeta}
            heroBg={cfg.heroBg}
            accent={cfg.accentColor}
          />
        </aside>
        {/* Main content: 2 sections: (1) Search/Filter, (2) Player+Tabs */}
        <main className="flex-1 flex flex-col gap-4 rounded-xl border-border shadow-lg p-2 bg-surface">
          {/* Section 1: Search & Filter */}
          <section className="mb-2">
            <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm tiêu đề…" />
            {/* Có thể thêm filter bar ở đây sau */}
          </section>
          {/* Section 2: Player & Tabs */}
          <section className="flex-1">
            {selectedPractice && (
              <>
                <ListeningPlayer
                  isSpeaking={isSpeaking}
                  speechSupported={true}
                  selectedPractice={selectedPractice}
                  appMode={"practice"}
                  examReplayCount={examReplayCount}
                  MAX_EXAM_REPLAYS={3}
                  examTimerActive={examTimerActive}
                  accent={cfg.accentColor}
                  audioDuration={audioDuration}
                  audioCurrent={audioCurrent}
                  playbackRate={playbackRate}
                  setPlaybackRate={setPlaybackRate}
                  stopPlayback={stopPlayback}
                  playDialogue={playDialogue}
                  setExamReplayCount={setExamReplayCount}
                  setExamTimerActive={setExamTimerActive}
                  speakingSegIdx={0}
                  setSpeakingSegIdx={() => {}}
                  playTokenRef={playTokenRef}
                  synthRef={synthRef}
                  audioRef={audioRef}
                  getSegmentStartSec={() => 0}
                  estimatedAudioSegIdx={0}
                  showPinyin={false}
                  setShowPinyin={() => false}
                  cfg={cfg}
                />
                <ListeningTabs
                  activeTab={selectedSkill}
                  setActiveTab={setSelectedSkill}
                  appMode={"practice"}
                  selectedPractice={selectedPractice}
                  accent={cfg.accentColor}
                  cfg={cfg}
                  showPinyin={showPinyin}
                  setShowPinyin={setShowPinyin}
                  estimatedAudioSegIdx={0}
                  speakingSegIdx={0}
                  isSpeaking={isSpeaking}
                  getSegmentStartSec={() => 0}
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
              </>
            )}
          </section>
        </main>
      </div>
    </LearnLayout>
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
