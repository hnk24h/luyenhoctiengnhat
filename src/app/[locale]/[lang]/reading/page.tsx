'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaAlignLeft, FaAlignJustify, FaNewspaper,
  FaBookOpen, FaBolt, FaFire, FaBook,
  FaChevronLeft, FaChevronRight, FaRocket, FaLightbulb,
} from 'react-icons/fa6';
import { LearnLayout } from '@/components/learn/LearnLayout';

import type { PassageSummary, PassageDetail } from './_components/types';
import { LEVEL_META } from './_components/constants';
import {
  ReadingStatsBadge,
  FilterChips,
  PassageScroller,
} from './_components/ReadingComponents';
import { ReadingDetail } from './_components/ReadingDetail';
import { PassageListPanel } from './_components/PassageListPanel';

// ── Page export ───────────────────────────────────────────────────────────────

export default function ReadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ReadingPageContent />
    </Suspense>
  );
}

// ── Page content ──────────────────────────────────────────────────────────────

function ReadingPageContent() {
  const routeParams  = useParams();
  const lang         = (routeParams?.lang as string) ?? 'ja';
  const locale       = (routeParams?.locale as string) ?? 'vi';
  const isChinese    = lang === 'zh';
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session } = useSession();

  const [passages,      setPassages]      = useState<PassageSummary[]>([]);
  const [listLoading,   setListLoading]   = useState(true);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [loadedPassage, setLoadedPassage] = useState<PassageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [level,  setLevel]  = useState(searchParams.get('level') ?? '');
  const [type,   setType]   = useState(searchParams.get('type')  ?? '');
  const [savedWords,  setSavedWords]  = useState<string[]>([]);
  const [savedCount,  setSavedCount]  = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [readIds,     setReadIds]     = useState<string[]>([]);

  // ── Sidebar config ────────────────────────────────────────────────────────

  const JA_LEVELS = [
    { code: 'N5', label: 'N5', desc: 'So cap' },
    { code: 'N4', label: 'N4', desc: 'So trung cap' },
    { code: 'N3', label: 'N3', desc: 'Trung cap' },
    { code: 'N2', label: 'N2', desc: 'Trung cao cap' },
    { code: 'N1', label: 'N1', desc: 'Cao cap' },
  ];
  const ZH_LEVELS = [
    { code: 'HSK1', label: 'HSK1' }, { code: 'HSK2', label: 'HSK2' },
    { code: 'HSK3', label: 'HSK3' }, { code: 'HSK4', label: 'HSK4' },
    { code: 'HSK5', label: 'HSK5' }, { code: 'HSK6', label: 'HSK6' },
  ];
  const READING_SKILLS = [
    { key: 'all',   label: 'Tat ca', icon: <FaBook /> },
    { key: 'short', label: 'Doan ngan', icon: <FaAlignLeft /> },
    { key: 'long',  label: 'Bai dai', icon: <FaAlignJustify /> },
    { key: 'news',  label: 'Tin tuc', icon: <FaNewspaper /> },
  ];
  const ZH_SKILLS = [{ key: 'all', label: 'Tat ca', icon: <FaBook /> }];
  const DEFAULT_LEVELS_JA = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const DEFAULT_LEVELS_ZH = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];

  const sidebarLevels = isChinese ? ZH_LEVELS : JA_LEVELS;
  const sidebarSkills = isChinese ? ZH_SKILLS : READING_SKILLS;
  const selectedLevel = level;
  const setSelectedLevel = (lv: string) => { setLevel(lv); setSelectedId(null); setLoadedPassage(null); };
  const selectedSkill = type || 'all';
  const setSelectedSkill = (sk: string) => { setType(sk === 'all' ? '' : sk); setSelectedId(null); setLoadedPassage(null); };

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem('reading-stats');
      if (raw) setReadIds(JSON.parse(raw).readIds || []);
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    if (loadedPassage) {
      setReadIds(prev => prev.includes(loadedPassage.id) ? prev : [...prev, loadedPassage.id]);
    }
  }, [loadedPassage]);

  useEffect(() => {
    if (initialized || searchParams.get('level')) {
      if (!initialized) setInitialized(true);
      return;
    }
    const defaults = isChinese ? DEFAULT_LEVELS_ZH : DEFAULT_LEVELS_JA;
    if (session?.user?.id) {
      fetch('/api/study-profile')
        .then(r => r.ok ? r.json() : null)
        .then(() => {
          if (!initialized) setLevel(defaults[0]);
          setInitialized(true);
        })
        .catch(() => { setLevel(defaults[0]); setInitialized(true); });
    } else {
      setLevel(defaults[0]);
      setInitialized(true);
    }
  }, [session, isChinese, initialized, searchParams]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    const p = new URLSearchParams();
    if (level) p.set('level', level);
    if (type && !isChinese) p.set('type', type);
    p.set('lang', lang);
    const res = await fetch(`/api/reading?${p}`);
    if (res.ok) {
      const data = await res.json();
      setPassages(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    }
    setListLoading(false);
  }, [level, type, lang, isChinese, selectedId]);

  useEffect(() => { if (level) loadList(); }, [level, type, loadList]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadedPassage(null);
    setDetailLoading(true);
    setSavedCount(0);
    fetch(`/api/reading/${selectedId}?lang=${lang}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: PassageDetail | null) => { setLoadedPassage(d); setDetailLoading(false); });
  }, [selectedId, lang]);

  useEffect(() => {
    if (!session || isChinese) return;
    fetch('/api/words')
      .then(r => r.ok ? r.json() : [])
      .then((words: { content: { term: string } }[]) =>
        setSavedWords(words.map(w => w.content.term))
      );
  }, [session, isChinese]);

  const handleWordSaved = useCallback((w: { term: string; contentId: string }) => {
    setSavedWords(prev => [...prev, w.term]);
    setSavedCount(n => n + 1);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams(window.location.search);
    if (level) params.set('level', level); else params.delete('level');
    if (type && !isChinese) params.set('type', type); else params.delete('type');
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [level, type, initialized, isChinese, router]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LearnLayout
      sidebarProps={{
        mode: 'level' as const,
        setMode: () => {},
        selectedLevel,
        setSelectedLevel,
        selectedSkill,
        setSelectedSkill,
        levels: sidebarLevels,
        skills: [],
        title: isChinese ? 'Doc tieng Trung' : 'Doc hieu',
      }}
      bottomBarProps={{
        levels: sidebarLevels,
        selectedLevel,
        setSelectedLevel,
        skills: [],
        selectedSkill,
        setSelectedSkill,
      }}
      rightPanel={
        <PassageListPanel
          passages={passages}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          loading={listLoading}
          isChinese={isChinese}
          selectedType={type}
          onTypeSelect={(t) => { setType(t); setSelectedId(null); setLoadedPassage(null); }}
          readIds={readIds}
          currentPassage={loadedPassage}
        />
      }
    >
      {/* Header + stats */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
              <FaBookOpen size={20} style={{ color: '#fff' }} />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: '#FBBF24', color: '#78350F' }}>
                <FaBolt size={8} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {isChinese ? 'Doc hieu tieng Trung' : 'Doc hieu tieng Nhat'}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {passages.length > 0
                  ? <><FaFire size={9} className="inline mr-1" style={{ color: '#EF4444' }} />{passages.length} bai doc{level && ` . ${level}`} . Chon bai va bat dau luyen doc!</>
                  : 'Chon cap do de kham pha bai doc thu vi'}
              </p>
            </div>
          </div>
        </div>
        <ReadingStatsBadge />
      </div>

      {/* Filter chips + passage scroller -- mobile/tablet only */}
      <div className="mb-6 lg:hidden">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaNewspaper size={12} style={{ color: 'var(--primary)' }} />
            Bai doc
            {!listLoading && passages.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{passages.length}</span>
            )}
          </h2>
          <FilterChips selectedType={type} onSelect={(t) => {
            setType(t); setSelectedId(null); setLoadedPassage(null);
          }} isChinese={isChinese} />
        </div>
        <PassageScroller passages={passages} selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)} loading={listLoading} isChinese={isChinese} />
      </div>

      {/* Article area */}
      <div className="min-w-0">
        {detailLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Dang tai bai doc...</p>
            </div>
          </div>
        ) : !loadedPassage ? (
          <EmptyState
            listLoading={listLoading}
            level={level}
            isChinese={isChinese}
            setSelectedLevel={setSelectedLevel}
          />
        ) : (
          <>
            <ReadingDetail
              key={loadedPassage.id}
              passage={loadedPassage}
              lang={lang}
              locale={locale}
              savedWords={savedWords}
              onWordSaved={handleWordSaved}
              savedCount={savedCount}
            />
            {/* Prev / Next navigation */}
            {passages.length > 1 && (() => {
              const idx = passages.findIndex(p => p.id === selectedId);
              const prev = idx > 0 ? passages[idx - 1] : null;
              const next = idx < passages.length - 1 ? passages[idx + 1] : null;
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
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">{next.title}</span>
                      <FaChevronRight size={10} />
                    </button>
                  ) : <div />}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </LearnLayout>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ listLoading, level, isChinese, setSelectedLevel }: {
  listLoading: boolean; level: string; isChinese: boolean;
  setSelectedLevel: (lv: string) => void;
}) {
  const DEFAULT_LEVELS_JA = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const DEFAULT_LEVELS_ZH = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[45vh] gap-5 px-4">
      <div className="relative">
        <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--primary-light), color-mix(in srgb, var(--primary) 12%, var(--bg-surface)))' }}>
          <span className="text-5xl">&#128218;</span>
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#FEF9C3', border: '2px solid #FDE68A' }}>
          <FaRocket size={16} style={{ color: '#D97706' }} />
        </div>
      </div>
      <div className="text-center max-w-md">
        <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {listLoading ? 'Dang tai bai doc...' : level ? 'Chon bai doc de bat dau' : 'Trinh do cua ban la gi?'}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {listLoading
            ? 'Cho mot chut, dang tim bai phu hop...'
            : level
              ? 'Chon 1 bai tu danh sach o tren de bat dau luyen doc hieu'
              : 'Chon cap do phu hop de chung toi goi y bai doc vua suc voi ban'}
        </p>
      </div>
      {!level && !listLoading && (
        <>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {isChinese ? 'Chon trinh do HSK:' : 'Chon trinh do JLPT:'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {(isChinese ? DEFAULT_LEVELS_ZH : DEFAULT_LEVELS_JA).map(lv => {
              const lm = LEVEL_META[lv];
              return (
                <button key={lv} onClick={() => setSelectedLevel(lv)}
                  className="flex flex-col items-center gap-1 w-20 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: lm.gradient, color: lm.color, border: `2px solid ${lm.color}33`,
                    boxShadow: `0 4px 12px ${lm.color}15` }}>
                  <span className="text-xl">{lm.emoji}</span>
                  <span>{lv}</span>
                  <span className="text-[9px] font-medium opacity-70">{lm.desc}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 p-3 rounded-xl text-xs"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <FaLightbulb size={11} style={{ color: '#D97706' }} />
            <span><strong>Meo:</strong> Neu ban moi bat dau, hay chon {isChinese ? 'HSK1' : 'N5'}. Neu ban da hoc duoc 1-2 nam, thu {isChinese ? 'HSK3' : 'N3'}!</span>
          </div>
        </>
      )}
      {!listLoading && level && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chua co bai doc cho cap {level}. Thu cap khac nhe!
          </p>
          <div className="flex gap-2">
            {(isChinese ? DEFAULT_LEVELS_ZH : DEFAULT_LEVELS_JA).filter(l => l !== level).slice(0, 3).map(lv => {
              const lm = LEVEL_META[lv];
              return (
                <button key={lv} onClick={() => setSelectedLevel(lv)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: lm.bg, color: lm.color }}>
                  {lv}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
