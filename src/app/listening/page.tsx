'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FaHeadphones,
  FaCirclePlay,
  FaStop,
  FaVolumeHigh,
  FaClock,
  FaCheck,
  FaWaveSquare,
  FaRegFileLines,
  FaChevronRight,
} from 'react-icons/fa6';
import {
  LISTENING_LEVEL_META,
  LISTENING_MONDAI_LABELS,
  LISTENING_PRACTICES,
  type ListeningLevel,
  type ListeningMondai,
} from '@/modules/listeningContent';
import { cn } from '@/lib/utils';

const LEVELS: Array<ListeningLevel | 'ALL'> = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ListeningPage() {
  return (
    <Suspense fallback={<ListeningPageFallback />}>
      <ListeningPageContent />
    </Suspense>
  );
}

function ListeningPageContent() {
  const searchParams = useSearchParams();
  const queryLevel = searchParams.get('level');
  const queryMondai = searchParams.get('mondai');
  const queryPractice = searchParams.get('practice');
  const [practices, setPractices] = useState(LISTENING_PRACTICES);
  const [selectedLevel, setSelectedLevel] = useState<ListeningLevel | 'ALL'>(() => {
    if (queryLevel && LEVELS.includes(queryLevel as ListeningLevel)) return queryLevel as ListeningLevel;
    return 'ALL';
  });
  const [selectedMondai, setSelectedMondai] = useState<ListeningMondai | 'ALL'>(() => {
    if (queryMondai && ['Mondai 1', 'Mondai 2', 'Mondai 3', 'Mondai 4'].includes(queryMondai)) return queryMondai as ListeningMondai;
    return 'ALL';
  });
  const [selectedId, setSelectedId] = useState(queryPractice ?? LISTENING_PRACTICES[0]?.id ?? '');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.92);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [usingRemoteData, setUsingRemoteData] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const playTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredPractices = useMemo(() => {
    return practices.filter((practice) => {
      if (selectedLevel !== 'ALL' && practice.level !== selectedLevel) return false;
      if (selectedMondai !== 'ALL' && practice.mondai !== selectedMondai) return false;
      return true;
    });
  }, [practices, selectedLevel, selectedMondai]);

  const availableMondai = useMemo(() => {
    const list = practices.filter((practice) => selectedLevel === 'ALL' || practice.level === selectedLevel)
      .map((practice) => practice.mondai);

    return Array.from(new Set(list));
  }, [practices, selectedLevel]);

  const selectedPractice = useMemo(() => {
    return filteredPractices.find((practice) => practice.id === selectedId) ?? filteredPractices[0] ?? null;
  }, [filteredPractices, selectedId]);

  useEffect(() => {
    if (!availableMondai.includes(selectedMondai as ListeningMondai)) {
      setSelectedMondai('ALL');
    }
  }, [availableMondai, selectedMondai]);

  useEffect(() => {
    if (queryLevel && LEVELS.includes(queryLevel as ListeningLevel)) {
      setSelectedLevel(queryLevel as ListeningLevel);
    }
    if (queryMondai && ['Mondai 1', 'Mondai 2', 'Mondai 3', 'Mondai 4'].includes(queryMondai)) {
      setSelectedMondai(queryMondai as ListeningMondai);
    }
  }, [queryLevel, queryMondai]);

  useEffect(() => {
    if (selectedPractice && selectedPractice.id !== selectedId) {
      setSelectedId(selectedPractice.id);
    }
    if (!selectedPractice && filteredPractices[0]) {
      setSelectedId(filteredPractices[0].id);
    }
    setShowTranscript(false);
    setShowAnswer(false);
  }, [filteredPractices, selectedId, selectedPractice]);

  useEffect(() => {
    if (!queryPractice) return;
    const matched = practices.find((practice) => practice.id === queryPractice);
    if (matched) {
      setSelectedLevel(matched.level);
      setSelectedMondai(matched.mondai);
      setSelectedId(matched.id);
    }
  }, [practices, queryPractice]);

  useEffect(() => {
    let cancelled = false;

    async function loadRemotePractices() {
      try {
        const res = await fetch('/api/listening', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPractices(data);
          setSelectedId(data[0].id);
          setUsingRemoteData(true);
        }
      } catch {
        return;
      }
    }

    loadRemotePractices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setSpeechSupported(true);

    const updateVoices = () => {
      voicesRef.current = synth.getVoices();
    };

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    stopPlayback();
  }, [selectedPractice?.id]);

  function stopPlayback() {
    playTokenRef.current += 1;
    synthRef.current?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }

  function pickJapaneseVoice() {
    return voicesRef.current.find((voice) => voice.lang.toLowerCase().startsWith('ja')) ?? null;
  }

  function playDialogue() {
    if (!selectedPractice) return;

    if (selectedPractice.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(selectedPractice.audioUrl);
      } else if (audioRef.current.src !== selectedPractice.audioUrl) {
        audioRef.current.pause();
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
    const voice = pickJapaneseVoice();
    const token = playTokenRef.current + 1;
    playTokenRef.current = token;

    synth.cancel();
    setIsSpeaking(true);

    const segments = selectedPractice.segments;
    let index = 0;

    const speakNext = () => {
      if (playTokenRef.current !== token) return;
      if (index >= segments.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segments[index].text);
      utterance.lang = 'ja-JP';
      utterance.rate = playbackRate;
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (playTokenRef.current !== token) return;
        index += 1;
        window.setTimeout(speakNext, 220);
      };
      utterance.onerror = () => {
        if (playTokenRef.current !== token) return;
        setIsSpeaking(false);
      };

      synth.speak(utterance);
    };

    speakNext();
  }

  const totalMondai = useMemo(() => new Set(practices.map((practice) => `${practice.level}-${practice.mondai}`)).size, [practices]);

  return (
    <main>
      <section className="px-4 py-12" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-5"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FaHeadphones size={14} /> Luyen nghe JLPT theo level va mondai
          </div>
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Luyện nghe hội thoại N5 đến N1
              </h1>
              <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Chọn cấp độ, lọc theo từng mondai, nghe hội thoại mẫu và tự kiểm tra đáp án ngay trên một màn hình.
                Nếu bài nghe có `audioUrl` thì sẽ phát audio thật. Nếu không có, page tự động fallback sang Web Speech.
              </p>
              <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                {usingRemoteData ? 'Đang dùng dữ liệu bài nghe từ admin.' : 'Đang dùng bộ bài nghe mẫu mặc định trong code.'}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Bài nghe', value: practices.length, icon: FaWaveSquare },
                  { label: 'Mondai phụ', value: totalMondai, icon: FaRegFileLines },
                  { label: 'Cấp độ', value: 5, icon: FaHeadphones },
                  { label: 'Chế độ', value: 'Nghe + giải thích', icon: FaCheck },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl p-4 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <item.icon size={15} style={{ color: 'var(--primary)' }} />
                      <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <div className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--primary)' }}>
                Cách luyện nhanh
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>1. Chọn level phù hợp với mục tiêu thi JLPT.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>2. Lọc mondai để luyện đúng dạng bài nghe bạn muốn tập trung.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>3. Nghe hội thoại, tự tra transcript và đáp án sau khi đã thử một lần.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="card">
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Lọc theo cấp độ
                </div>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => {
                    const active = selectedLevel === level;
                    const meta = level === 'ALL' ? null : LISTENING_LEVEL_META[level];

                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                        style={active
                          ? { background: 'var(--primary)', color: '#fff' }
                          : level === 'ALL'
                            ? { background: 'var(--bg-muted)', color: 'var(--text-primary)' }
                            : { background: meta?.badgeBg, color: meta?.badgeText }}>
                        {level === 'ALL' ? 'Tat ca level' : `${level} · ${meta?.desc}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Lọc theo mondai
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMondai('ALL')}
                    className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                    style={selectedMondai === 'ALL'
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    Tất cả mondai
                  </button>
                  {availableMondai.map((mondai) => (
                    <button
                      key={mondai}
                      onClick={() => setSelectedMondai(mondai)}
                      className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                      style={selectedMondai === mondai
                        ? { background: 'var(--primary)', color: '#fff' }
                        : { background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {mondai}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.4fr,0.6fr] gap-6 items-start">
            <div className="xl:sticky xl:top-24">
              {selectedPractice && (
                <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: LISTENING_LEVEL_META[selectedPractice.level].badgeBg, color: LISTENING_LEVEL_META[selectedPractice.level].badgeText }}>
                      {selectedPractice.level}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {selectedPractice.mondai}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      {LISTENING_MONDAI_LABELS[selectedPractice.mondai]}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{selectedPractice.title}</h2>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{selectedPractice.situation}</p>

                  <div className="grid sm:grid-cols-3 gap-3 mb-5">
                    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Thời lượng</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDuration(selectedPractice.durationSec)}</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Trọng tâm</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedPractice.focus}</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Tốc độ</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{playbackRate.toFixed(2)}x</div>
                    </div>
                  </div>

                  <div className="rounded-[24px] p-4 sm:p-5 mb-5" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, var(--bg-base)), var(--bg-base))' }}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <button
                        onClick={playDialogue}
                        disabled={!selectedPractice.audioUrl && !speechSupported}
                        className={cn('btn-primary', !selectedPractice.audioUrl && !speechSupported && 'opacity-60 cursor-not-allowed')}
                      >
                        <FaCirclePlay size={14} /> {selectedPractice.audioUrl ? 'Phát audio' : isSpeaking ? 'Nghe lại' : 'Nghe hội thoại'}
                      </button>
                      <button onClick={stopPlayback} className="btn-secondary">
                        <FaStop size={12} /> Dừng
                      </button>
                      <button onClick={() => setShowTranscript((value) => !value)} className="btn-secondary">
                        <FaRegFileLines size={12} /> {showTranscript ? 'Ẩn lời thoại' : 'Xem lời thoại'}
                      </button>
                      <button onClick={() => setShowAnswer((value) => !value)} className="btn-secondary">
                        <FaCheck size={12} /> {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaVolumeHigh size={14} style={{ color: 'var(--primary)' }} />
                      <input
                        type="range"
                        min="0.75"
                        max="1.1"
                        step="0.05"
                        value={playbackRate}
                        onChange={(event) => setPlaybackRate(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>
                    {selectedPractice.audioUrl && (
                      <audio controls src={selectedPractice.audioUrl} className="w-full mt-4" />
                    )}
                    <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                      {selectedPractice.audioUrl
                        ? 'Bài này đang ưu tiên audioUrl. Nếu link audio không tồn tại, bạn có thể xóa audioUrl trong admin để quay lại Web Speech.'
                        : speechSupported
                          ? 'Bài này không có audioUrl, vì vậy page đang dùng Web Speech API để đọc hội thoại.'
                          : 'Trình duyệt hiện tại không hỗ trợ speech synthesis. Bạn vẫn có thể xem transcript và đáp án.'}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--primary)' }}>
                      Câu hỏi
                    </div>
                    <div className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      {selectedPractice.question}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedPractice.options.map((option) => {
                        const correct = showAnswer && option === selectedPractice.answer;
                        const muted = showAnswer && option !== selectedPractice.answer;

                        return (
                          <div key={option} className="rounded-2xl border px-4 py-3 text-sm font-medium"
                            style={correct
                              ? { borderColor: '#16A34A', background: '#F0FDF4', color: '#166534' }
                              : muted
                                ? { borderColor: 'var(--border)', background: 'var(--bg-base)', color: 'var(--text-secondary)' }
                                : { borderColor: 'var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {showAnswer && (
                    <div className="rounded-[24px] p-4 mb-5" style={{ background: 'var(--accent-light)' }}>
                      <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--accent)' }}>
                        Giải thích
                      </div>
                      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Đáp án: {selectedPractice.answer}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedPractice.explanation}</div>
                    </div>
                  )}

                  {showTranscript && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--primary)' }}>
                        Transcript
                      </div>
                      <div className="space-y-3">
                        {selectedPractice.segments.map((segment, index) => (
                          <div key={`${segment.speaker}-${index}`} className="rounded-2xl border px-4 py-3"
                            style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                            <div className="text-xs font-bold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--text-muted)' }}>
                              {segment.speaker}
                            </div>
                            <div className="text-base leading-7 font-jp" style={{ color: 'var(--text-primary)' }}>{segment.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {filteredPractices.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-3 opacity-35">🎧</div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Chua co bai nghe phu hop</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Thu doi bo loc level hoac mondai.</div>
                </div>
              ) : (
                filteredPractices.map((practice) => {
                  const active = selectedPractice?.id === practice.id;
                  const meta = LISTENING_LEVEL_META[practice.level];

                  return (
                    <button
                      key={practice.id}
                      onClick={() => setSelectedId(practice.id)}
                      className="w-full text-left rounded-[24px] border p-4 transition-all"
                      style={active
                        ? { borderColor: meta.accent, background: 'color-mix(in srgb, var(--primary-light) 64%, var(--bg-surface))', boxShadow: 'var(--shadow)' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: meta.badgeBg, color: meta.badgeText }}>
                            {practice.level}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {practice.mondai}
                          </span>
                        </div>
                        <FaChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>

                      <div className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{practice.title}</div>
                      <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{practice.summary}</div>

                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-flex items-center gap-1"><FaClock size={11} /> {formatDuration(practice.durationSec)}</span>
                        <span>{practice.focus}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ListeningPageFallback() {
  return (
    <main>
      <section className="px-4 py-12" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-9 w-64 rounded-xl mb-4" style={{ background: 'var(--border)' }} />
          <div className="h-12 w-full max-w-2xl rounded-xl mb-3" style={{ background: 'var(--border)' }} />
          <div className="h-5 w-full max-w-3xl rounded-lg" style={{ background: 'var(--border)' }} />
        </div>
      </section>
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl h-40" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      </section>
    </main>
  );
}