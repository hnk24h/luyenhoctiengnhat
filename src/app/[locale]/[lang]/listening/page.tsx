'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { LearnLayout } from '@/components/learn/LearnLayout';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeadphones, FaBookOpen, FaFlaskVial, FaGraduationCap, FaStopwatch, FaBookmark, FaCompactDisc, FaListUl, FaChevronRight, FaChevronLeft, FaBolt, FaFire, FaClock, FaCircleCheck, FaMagnifyingGlass } from 'react-icons/fa6';
import { ListeningPlayer } from '@/components/listening/ListeningPlayer';

import ListeningTabs from '@/components/listening/ListeningTabs';

import type { Segment, GrammarPoint, ListeningPractice, LangConfig, LevelMeta } from '@/types/listening';

// ─── Per-language config ──────────────────────────────────────────────────────

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

  // Playlist sidebar toggle (mobile)
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Current track index for prev/next
  const currentIdx = filteredPractices.findIndex(p => p.id === selectedId);
  const goPrev = () => { if (currentIdx > 0) setSelectedId(filteredPractices[currentIdx - 1].id); };
  const goNext = () => { if (currentIdx < filteredPractices.length - 1) setSelectedId(filteredPractices[currentIdx + 1].id); };

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
      rightPanel={
        <ListeningListPanel
          practices={filteredPractices}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
          isSpeaking={isSpeaking}
          levelMeta={cfg.levelMeta}
          accentColor={cfg.accentColor}
          search={search}
          onSearchChange={setSearch}
        />
      }
    >
      {/* ── Hero section (matching reading page) ── */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
              style={{ background: cfg.accentColor, boxShadow: `0 4px 14px color-mix(in srgb, ${cfg.accentColor} 30%, transparent)` }}>
              <FaHeadphones size={20} style={{ color: '#fff' }} />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: '#FBBF24', color: '#78350F' }}>
                <FaBolt size={8} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {cfg.hasPinyin ? 'Luyện nghe tiếng Trung' : 'Luyện nghe tiếng Nhật'}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {filteredPractices.length > 0
                  ? <><FaFire size={9} className="inline mr-1" style={{ color: '#EF4444' }} />{filteredPractices.length} bài nghe{selectedLevel !== 'ALL' && ` · ${selectedLevel}`} · Chọn bài và bắt đầu luyện nghe!</>
                  : cfg.heroTag}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: passage scroller ── */}
      <div className="mb-4 lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaHeadphones size={12} style={{ color: cfg.accentColor }} />
            Bài nghe
            {!loading && filteredPractices.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${cfg.accentColor}15`, color: cfg.accentColor }}>{filteredPractices.length}</span>
            )}
          </h2>
        </div>
        <div className="overflow-x-auto flex gap-2 pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {filteredPractices.map(p => {
            const isActive = selectedId === p.id;
            const meta = cfg.levelMeta[p.level];
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="snap-start shrink-0 w-44 text-left rounded-xl p-2.5 transition-all"
                style={isActive
                  ? { background: `color-mix(in srgb, ${meta?.accent ?? cfg.accentColor} 10%, var(--bg-surface))`, border: `1.5px solid ${meta?.accent ?? cfg.accentColor}44` }
                  : { background: 'var(--bg-muted)', border: '1.5px solid transparent' }}>
                <p className="text-[11px] font-bold line-clamp-2 leading-tight" style={{ color: isActive ? (meta?.accent ?? cfg.accentColor) : 'var(--text-primary)' }}>
                  {p.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: meta?.badgeBg ?? 'var(--bg-muted)', color: meta?.badgeText ?? 'var(--text-muted)' }}>
                    {p.level}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {formatDuration(p.durationSec)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content: Now Playing + Player + Tabs ── */}
      <div className="min-w-0">
        {selectedPractice ? (
          <>
            {/* Now Playing bar */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                background: `linear-gradient(135deg, ${cfg.accentColor}12 0%, ${cfg.accentColor}06 50%, var(--bg-surface) 100%)`,
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Album cover */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shrink-0 flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.accentColor}30 0%, ${cfg.accentColor} 100%)`,
                    boxShadow: `0 8px 32px ${cfg.accentColor}25`,
                  }}
                >
                  {isSpeaking ? (
                    <div className="flex items-end gap-[3px] h-7">
                      {[5, 8, 12, 7, 10, 14, 6, 9].map((h, i) => (
                        <span key={i} className="w-[3px] rounded-full bg-white sound-bar-anim"
                          style={{ animationDuration: `${0.6 + (i % 4) * 0.15}s`, animationDelay: `${i * 0.06}s` }} />
                      ))}
                    </div>
                  ) : (
                    <FaHeadphones size={28} className="text-white/90" />
                  )}
                </div>
                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: cfg.levelMeta[selectedPractice.level]?.badgeBg ?? `${cfg.accentColor}20`,
                        color: cfg.levelMeta[selectedPractice.level]?.badgeText ?? cfg.accentColor,
                      }}>
                      {selectedPractice.level}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedPractice.category}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>· {formatDuration(selectedPractice.durationSec)}</span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    {selectedPractice.title}
                  </h2>
                  {selectedPractice.titleVi && (
                    <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{selectedPractice.titleVi}</p>
                  )}
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{selectedPractice.situation}</p>
                </div>
                {/* Prev/Next */}
                <div className="hidden md:flex flex-col items-end shrink-0 gap-1">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: cfg.accentColor }}>
                    {currentIdx + 1} / {filteredPractices.length}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={goPrev} disabled={currentIdx <= 0}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
                      style={{ background: `${cfg.accentColor}15`, color: cfg.accentColor }}>
                      <FaChevronLeft size={10} />
                    </button>
                    <button onClick={goNext} disabled={currentIdx >= filteredPractices.length - 1}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
                      style={{ background: `${cfg.accentColor}15`, color: cfg.accentColor }}>
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Player */}
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
            </div>

            {/* Tabs */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
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
            </div>

            {/* Prev / Next navigation (matching reading page) */}
            {filteredPractices.length > 1 && (() => {
              const prev = currentIdx > 0 ? filteredPractices[currentIdx - 1] : null;
              const next = currentIdx < filteredPractices.length - 1 ? filteredPractices[currentIdx + 1] : null;
              return (
                <div className="flex items-center justify-between mt-6 pt-4 max-w-3xl mx-auto"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  {prev ? (
                    <button onClick={() => setSelectedId(prev.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      <FaChevronLeft size={10} />
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">{prev.title}</span>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => setSelectedId(next.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                      style={{ background: `${cfg.accentColor}15`, color: cfg.accentColor }}>
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">{next.title}</span>
                      <FaChevronRight size={10} />
                    </button>
                  ) : <div />}
                </div>
              );
            })()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[45vh] gap-5 px-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${cfg.accentColor}15, ${cfg.accentColor}08)` }}>
                <FaCompactDisc size={48} className="animate-spin" style={{ color: cfg.accentColor, animationDuration: '3s' }} />
              </div>
            </div>
            <div className="text-center max-w-md">
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {loading ? 'Đang tải bài nghe...' : 'Chọn bài nghe để bắt đầu'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Chờ một chút, đang tìm bài phù hợp...' : 'Chọn 1 bài từ danh sách bên phải để bắt đầu luyện nghe'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile: playlist overlay ── */}
      <button
        onClick={() => setShowPlaylist(v => !v)}
        className="lg:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: cfg.accentColor, color: '#fff', boxShadow: `0 4px 20px ${cfg.accentColor}40` }}
      >
        <FaListUl size={18} />
      </button>
      {showPlaylist && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPlaylist(false)} />
          <aside className="absolute inset-y-0 right-0 w-80 flex flex-col" style={{ background: 'var(--bg-surface)' }}>
            <div className="px-4 pt-4 pb-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <FaListUl size={14} style={{ color: cfg.accentColor }} />
              <span className="text-sm font-bold flex-1" style={{ color: 'var(--text-primary)' }}>Danh sách bài nghe</span>
              <button onClick={() => setShowPlaylist(false)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <FaMagnifyingGlass size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm bài nghe…"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[11px] border outline-none"
                  style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5" style={{ scrollbarWidth: 'thin' } as React.CSSProperties}>
              {filteredPractices.map(p => {
                const isActive = selectedId === p.id;
                const meta = cfg.levelMeta[p.level];
                const itemAccent = meta?.accent ?? cfg.accentColor;
                return (
                  <button key={p.id} onClick={() => { setSelectedId(p.id); setShowPlaylist(false); }}
                    className="w-full text-left rounded-xl transition-all p-2.5"
                    style={isActive
                      ? { background: `color-mix(in srgb, ${itemAccent} 8%, transparent)`, border: `1.5px solid ${itemAccent}44` }
                      : { background: 'transparent', border: '1.5px solid transparent' }}>
                    <p className="text-[12px] font-bold leading-tight line-clamp-2" style={{ color: isActive ? itemAccent : 'var(--text-primary)' }}>
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: meta?.badgeBg ?? 'var(--bg-muted)', color: meta?.badgeText ?? 'var(--text-muted)' }}>{p.level}</span>
                      <span className="text-[9px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                        <FaClock size={7} /> {formatDuration(p.durationSec)}
                      </span>
                      {isActive && isSpeaking && (
                        <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#2563EB' }}>● Đang phát</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </LearnLayout>
  );
}

// ─── Right panel: Listening List (matching PassageListPanel style) ────────────
function ListeningListPanel({ practices, selectedId, onSelect, loading, isSpeaking, levelMeta, accentColor, search, onSearchChange }: {
  practices: ListeningPractice[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading: boolean;
  isSpeaking: boolean;
  levelMeta: Record<string, LevelMeta>;
  accentColor: string;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <aside
      className="w-full rounded-2xl flex flex-col transition-all duration-300 sticky top-[72px] self-start overflow-hidden"
      style={{
        zIndex: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        maxHeight: 'calc(100vh - 88px)',
      }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--border)', background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #000) 100%)` }}>
        <FaHeadphones size={11} className="text-white" />
        <span className="text-[12px] font-bold text-white flex-1">Bài nghe</span>
        {!loading && practices.length > 0 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {practices.length}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <FaMagnifyingGlass size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm bài nghe…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[11px] border outline-none"
            style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
        style={{ scrollbarWidth: 'thin' } as React.CSSProperties}>
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-xl animate-pulse p-3"
              style={{ background: 'var(--bg-muted)', height: 60 }}>
              <div className="h-2.5 w-3/4 rounded" style={{ background: 'var(--border)' }} />
              <div className="h-2 w-1/2 rounded mt-2.5" style={{ background: 'var(--border)' }} />
            </div>
          ))
        ) : practices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="text-3xl">🎧</span>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Chưa có bài nghe</p>
          </div>
        ) : (
          practices.map(p => {
            const active = p.id === selectedId;
            const meta = levelMeta[p.level];
            const itemAccent = meta?.accent ?? accentColor;
            return (
              <button key={p.id} onClick={() => onSelect(p.id)}
                className="w-full text-left rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden p-2.5"
                style={active
                  ? { background: `color-mix(in srgb, ${itemAccent} 8%, transparent)`, border: `1.5px solid ${itemAccent}44`, boxShadow: `0 2px 8px ${itemAccent}12` }
                  : { background: 'transparent', border: '1.5px solid transparent' }}>
                <h4 className="text-[12px] font-bold leading-tight line-clamp-2" style={{ color: active ? itemAccent : 'var(--text-primary)' }}>
                  {p.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: meta?.badgeBg ?? 'var(--bg-muted)', color: meta?.badgeText ?? 'var(--text-muted)' }}>
                    {p.level}
                  </span>
                  <span className="text-[9px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                    <FaClock size={7} /> {formatDuration(p.durationSec)}
                  </span>
                  {active && (
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: '#DBEAFE', color: '#2563EB' }}>
                      {isSpeaking ? '● Đang phát' : '● Đang chọn'}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
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
