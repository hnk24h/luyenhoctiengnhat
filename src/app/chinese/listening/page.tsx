'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FaHeadphones, FaCirclePlay, FaStop, FaClock,
  FaCheck, FaWaveSquare, FaRegFileLines, FaChevronRight,
} from 'react-icons/fa6';
import {
  HSK_LEVEL_META, HSK_LISTENING_TYPE_LABELS,
  CHINESE_LISTENING_PRACTICES,
  type HskLevel, type HskListeningType,
} from '@/modules/chineseListeningContent';

const LEVELS: Array<HskLevel | 'ALL'> = ['ALL', 'HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
const TYPES: Array<HskListeningType> = ['Hội thoại', 'Độc thoại', 'Thông báo', 'Phỏng vấn'];

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function ChineseListeningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | 'ALL'>(() => {
    const q = searchParams.get('level') as HskLevel | null;
    return q && LEVELS.includes(q) ? q : 'ALL';
  });
  const [selectedType, setSelectedType] = useState<HskListeningType | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState(CHINESE_LISTENING_PRACTICES[0]?.id ?? '');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const playTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = useMemo(() =>
    CHINESE_LISTENING_PRACTICES.filter(p =>
      (selectedLevel === 'ALL' || p.level === selectedLevel) &&
      (selectedType === 'ALL' || p.type === selectedType)
    ), [selectedLevel, selectedType]
  );

  const selectedPractice = filtered.find(p => p.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (!filtered.find(p => p.id === selectedId) && filtered[0]) {
      setSelectedId(filtered[0].id);
    }
    setShowTranscript(false);
    setShowAnswer(false);
  }, [filtered, selectedId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setSpeechSupported(true);
    const updateVoices = () => { voicesRef.current = synth.getVoices(); };
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    return () => {
      playTokenRef.current += 1;
      synth.cancel();
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  useEffect(() => {
    return () => {
      playTokenRef.current += 1;
      synthRef.current?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    };
  }, []);

  useEffect(() => { stopPlayback(); }, [selectedPractice?.id]);

  function stopPlayback() {
    playTokenRef.current += 1;
    synthRef.current?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsSpeaking(false);
  }

  function pickChineseVoice() {
    return (
      voicesRef.current.find(v => v.lang.toLowerCase().startsWith('zh-cn')) ??
      voicesRef.current.find(v => v.lang.toLowerCase().startsWith('zh')) ??
      null
    );
  }

  function playDialogue() {
    if (!selectedPractice) return;

    if (selectedPractice.audioUrl) {
      if (!audioRef.current || audioRef.current.src !== selectedPractice.audioUrl) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(selectedPractice.audioUrl);
      }
      const audio = audioRef.current;
      audio.playbackRate = playbackRate;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.currentTime = 0;
      audio.play().catch(() => setIsSpeaking(false));
      setIsSpeaking(true);
      return;
    }

    if (!synthRef.current) return;
    const synth = synthRef.current;
    const voice = pickChineseVoice();
    const token = ++playTokenRef.current;
    synth.cancel();
    setIsSpeaking(true);

    const segments = selectedPractice.segments;
    let idx = 0;

    const speakNext = () => {
      if (playTokenRef.current !== token) return;
      if (idx >= segments.length) { setIsSpeaking(false); return; }
      const utt = new SpeechSynthesisUtterance(segments[idx].text);
      utt.lang = 'zh-CN';
      utt.rate = playbackRate;
      if (voice) utt.voice = voice;
      utt.onend = () => { if (playTokenRef.current !== token) return; idx++; window.setTimeout(speakNext, 280); };
      utt.onerror = () => { if (playTokenRef.current !== token) return; setIsSpeaking(false); };
      synth.speak(utt);
    };
    speakNext();
  }

  return (
    <main>
      {/* Hero */}
      <section className="px-4 py-12" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-5"
            style={{ background: '#FFF1F2', color: '#BE123C' }}>
            <FaHeadphones size={14} /> Luyện nghe tiếng Trung theo HSK
          </div>
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Luyện nghe hội thoại HSK1 đến HSK6
              </h1>
              <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Chọn cấp độ, lọc theo dạng bài, nghe hội thoại có pinyin và tự kiểm tra đáp án ngay trên một màn hình.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Bài nghe', value: CHINESE_LISTENING_PRACTICES.length, icon: FaWaveSquare },
                  { label: 'Dạng bài', value: TYPES.length, icon: FaRegFileLines },
                  { label: 'Cấp độ', value: '6 HSK', icon: FaHeadphones },
                  { label: 'Chế độ', value: 'Nghe + pinyin', icon: FaCheck },
                ].map(item => (
                  <div key={item.label} className="rounded-3xl p-4 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <item.icon size={15} style={{ color: '#e53e3e' }} />
                      <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#e53e3e' }}>
                Cách luyện nhanh
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>1. Chọn cấp độ HSK phù hợp với trình độ của bạn.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>2. Nghe và thử trả lời câu hỏi trước khi xem đáp án.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>3. Bật pinyin để đối chiếu cách đọc sau khi nghe.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Practice */}
      <section className="px-4 py-8" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>Cấp độ</div>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(lvl => {
                    const active = selectedLevel === lvl;
                    const meta = lvl !== 'ALL' ? HSK_LEVEL_META[lvl] : null;
                    return (
                      <button key={lvl} onClick={() => setSelectedLevel(lvl)}
                        className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                        style={active
                          ? { background: '#e53e3e', color: '#fff' }
                          : lvl === 'ALL'
                            ? { background: 'var(--bg-muted)', color: 'var(--text-primary)' }
                            : { background: meta?.badgeBg, color: meta?.badgeText }}>
                        {lvl === 'ALL' ? 'Tất cả' : `${lvl} · ${meta?.desc}`}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>Dạng bài</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedType('ALL')}
                    className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                    style={selectedType === 'ALL' ? { background: '#e53e3e', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    Tất cả dạng
                  </button>
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setSelectedType(t)}
                      className="px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
                      style={selectedType === t ? { background: '#e53e3e', color: '#fff' } : { background: '#FFF1F2', color: '#BE123C' }}>
                      {t} <span className="opacity-60">— {HSK_LISTENING_TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.4fr,0.6fr] gap-6 items-start">
            {/* Main practice panel */}
            <div className="xl:sticky xl:top-24">
              {selectedPractice ? (
                <div className="rounded-[28px] border p-5 sm:p-6"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: HSK_LEVEL_META[selectedPractice.level].badgeBg, color: HSK_LEVEL_META[selectedPractice.level].badgeText }}>
                      {selectedPractice.level}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FFF1F2', color: '#BE123C' }}>
                      {selectedPractice.type}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      {HSK_LISTENING_TYPE_LABELS[selectedPractice.type]}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedPractice.title}
                  </h2>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{selectedPractice.titleVi}</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{selectedPractice.situation}</p>

                  <div className="grid sm:grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Thời lượng', value: formatDuration(selectedPractice.durationSec) },
                      { label: 'Trọng tâm', value: selectedPractice.focus },
                      { label: 'Tốc độ', value: `${playbackRate.toFixed(2)}x` },
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                        <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Speed control */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Tốc độ:</span>
                    {[0.75, 1.0, 1.25].map(r => (
                      <button key={r} onClick={() => setPlaybackRate(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={playbackRate === r
                          ? { background: '#e53e3e', color: '#fff' }
                          : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                        {r}x
                      </button>
                    ))}
                  </div>

                  {/* Play button */}
                  {speechSupported || selectedPractice.audioUrl ? (
                    <button
                      onClick={isSpeaking ? stopPlayback : playDialogue}
                      className="flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm mb-5 transition-all"
                      style={{ background: isSpeaking ? '#FEE2E2' : '#e53e3e', color: isSpeaking ? '#DC2626' : '#fff' }}>
                      {isSpeaking ? <FaStop size={14} /> : <FaCirclePlay size={18} />}
                      {isSpeaking ? 'Dừng' : 'Nghe'}
                      <FaClock size={12} style={{ opacity: 0.6 }} />
                      <span style={{ opacity: 0.7 }}>{formatDuration(selectedPractice.durationSec)}</span>
                    </button>
                  ) : (
                    <div className="text-xs mb-5 px-3 py-2 rounded-xl"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                      Trình duyệt không hỗ trợ phát âm tiếng Trung. Vui lòng dùng Chrome hoặc Edge.
                    </div>
                  )}

                  {/* Transcript */}
                  <div className="border rounded-2xl overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => setShowTranscript(p => !p)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                      style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      Xem hội thoại
                      <FaChevronRight size={11} className={showTranscript ? 'rotate-90 transition-transform' : 'transition-transform'} />
                    </button>
                    {showTranscript && (
                      <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: 'var(--bg-surface)' }}>
                        <div className="flex justify-end mb-2">
                          <button onClick={() => setShowPinyin(p => !p)}
                            className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
                            style={showPinyin ? { background: '#e53e3e', color: '#fff' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            拼音 Pinyin {showPinyin ? '✓' : ''}
                          </button>
                        </div>
                        {selectedPractice.segments.map((seg, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-xs font-bold shrink-0 pt-0.5 px-2 py-0.5 rounded-full h-fit"
                              style={{ background: '#FFF1F2', color: '#BE123C' }}>{seg.speaker}</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: '"Noto Sans SC", sans-serif' }}>
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
                  </div>

                  {/* Question */}
                  <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>❓ {selectedPractice.question}</p>
                    <div className="space-y-2">
                      {selectedPractice.options.map((opt, i) => {
                        const isCorrect = showAnswer && opt === selectedPractice.answer;
                        return (
                          <div key={i} className="px-3 py-2 rounded-xl text-sm transition-all"
                            style={{
                              background: isCorrect ? '#DCFCE7' : 'var(--bg-surface)',
                              color: isCorrect ? '#15803D' : 'var(--text-secondary)',
                              border: `1px solid ${isCorrect ? '#86EFAC' : 'var(--border)'}`,
                              fontWeight: isCorrect ? 700 : 400,
                            }}>
                            {isCorrect && <FaCheck size={10} className="inline mr-1.5" />}
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setShowAnswer(p => !p)}
                      className="mt-3 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                      style={showAnswer ? { background: '#DCFCE7', color: '#15803D' } : { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      {showAnswer ? '✓ Đáp án đúng' : 'Xem đáp án'}
                    </button>
                    {showAnswer && (
                      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>💡 {selectedPractice.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-16">
                  <div className="text-4xl mb-3 opacity-30">🎧</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không có bài nghe phù hợp.</p>
                </div>
              )}
            </div>

            {/* Sidebar practice list */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="card text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài nghe.</div>
              ) : filtered.map(p => {
                const meta = HSK_LEVEL_META[p.level];
                const active = p.id === (selectedPractice?.id ?? '');
                return (
                  <button key={p.id} onClick={() => setSelectedId(p.id)}
                    className="w-full text-left rounded-2xl p-4 border transition-all"
                    style={{
                      background: active ? '#FFF1F2' : 'var(--bg-surface)',
                      borderColor: active ? '#e53e3e' : 'var(--border)',
                    }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                        style={{ background: meta.badgeBg, color: meta.badgeText }}>
                        {p.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: active ? '#e53e3e' : 'var(--text-primary)' }}>
                          {p.title}
                        </div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{p.titleVi}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            <FaClock size={9} className="inline mr-0.5" />{formatDuration(p.durationSec)}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#FFF1F2', color: '#BE123C' }}>{p.type}</span>
                        </div>
                      </div>
                      <FaChevronRight size={11} style={{ color: active ? '#e53e3e' : 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
