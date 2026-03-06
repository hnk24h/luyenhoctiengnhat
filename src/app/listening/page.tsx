'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [practices, setPractices] = useState(LISTENING_PRACTICES);
  const [selectedLevel, setSelectedLevel] = useState<ListeningLevel | 'ALL'>('ALL');
  const [selectedMondai, setSelectedMondai] = useState<ListeningMondai | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState(LISTENING_PRACTICES[0]?.id ?? '');
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
                Luyen nghe hoi thoai N5 den N1
              </h1>
              <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Chon cap do, loc theo tung mondai, nghe hoi thoai mau va tu kiem tra dap an ngay tren mot man hinh.
                Neu bai nghe co `audioUrl` thi se phat audio that. Neu khong co, page tu dong fallback sang Web Speech.
              </p>
              <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                {usingRemoteData ? 'Dang dung du lieu bai nghe tu admin.' : 'Dang dung bo bai nghe mau mac dinh trong code.'}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Bai nghe', value: practices.length, icon: FaWaveSquare },
                  { label: 'Mondai phu', value: totalMondai, icon: FaRegFileLines },
                  { label: 'Cap do', value: 5, icon: FaHeadphones },
                  { label: 'Che do', value: 'Nghe + giai thich', icon: FaCheck },
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
                Cach luyen nhanh
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>1. Chon level phu hop voi muc tieu thi JLPT.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>2. Loc mondai de luyen dung dang bai nghe ban muon tap trung.</div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-surface)' }}>3. Nghe hoi thoai, tu tra transcript va dap an sau khi da thu mot lan.</div>
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
                  Loc theo cap do
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
                  Loc theo mondai
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMondai('ALL')}
                    className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
                    style={selectedMondai === 'ALL'
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    Tat ca mondai
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

          <div className="grid xl:grid-cols-[0.9fr,1.1fr] gap-6 items-start">
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
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Thoi luong</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDuration(selectedPractice.durationSec)}</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Trong tam</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedPractice.focus}</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: 'var(--bg-base)' }}>
                      <div className="text-[11px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-muted)' }}>Toc do</div>
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
                        <FaCirclePlay size={14} /> {selectedPractice.audioUrl ? 'Phat audio' : isSpeaking ? 'Nghe lai' : 'Nghe hoi thoai'}
                      </button>
                      <button onClick={stopPlayback} className="btn-secondary">
                        <FaStop size={12} /> Dung
                      </button>
                      <button onClick={() => setShowTranscript((value) => !value)} className="btn-secondary">
                        <FaRegFileLines size={12} /> {showTranscript ? 'An loi thoai' : 'Xem loi thoai'}
                      </button>
                      <button onClick={() => setShowAnswer((value) => !value)} className="btn-secondary">
                        <FaCheck size={12} /> {showAnswer ? 'An dap an' : 'Xem dap an'}
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
                        ? 'Bai nay dang uu tien audioUrl. Neu link audio khong ton tai, ban co the xoa audioUrl trong admin de quay lai Web Speech.'
                        : speechSupported
                          ? 'Bai nay khong co audioUrl, vi vay page dang dung Web Speech API de doc hoi thoai.'
                          : 'Trinh duyet hien tai khong ho tro speech synthesis. Ban van co the xem transcript va dap an.'}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--primary)' }}>
                      Cau hoi
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
                        Giai thich
                      </div>
                      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Dap an: {selectedPractice.answer}</div>
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
          </div>
        </div>
      </section>
    </main>
  );
}