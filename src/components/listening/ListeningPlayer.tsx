import React from 'react';
import { FaPause, FaPlay, FaMusic, FaRepeat } from 'react-icons/fa6';

interface ListeningPlayerProps {
  isSpeaking: boolean;
  speechSupported: boolean;
  selectedPractice: any;
  appMode: string;
  examReplayCount: number;
  MAX_EXAM_REPLAYS: number;
  examTimerActive: boolean;
  accent: string;
  audioDuration: number;
  audioCurrent: number;
  playbackRate: number;
  setPlaybackRate: (v: number) => void;
  stopPlayback: () => void;
  playDialogue: (fromIdx?: number) => void;
  setExamReplayCount: (fn: (p: number) => number) => void;
  setExamTimerActive: (v: boolean) => void;
  speakingSegIdx: number;
  setSpeakingSegIdx: (idx: number) => void;
  playTokenRef: React.MutableRefObject<number>;
  synthRef: React.MutableRefObject<SpeechSynthesis | null>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  getSegmentStartSec: (idx: number) => number;
  estimatedAudioSegIdx: number;
  showPinyin: boolean;
  setShowPinyin: (fn: (p: boolean) => boolean) => void;
  cfg: any;
}

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({
  isSpeaking,
  speechSupported,
  selectedPractice,
  appMode,
  examReplayCount,
  MAX_EXAM_REPLAYS,
  examTimerActive,
  accent,
  audioDuration,
  audioCurrent,
  playbackRate,
  setPlaybackRate,
  stopPlayback,
  playDialogue,
  setExamReplayCount,
  setExamTimerActive,
  speakingSegIdx,
  setSpeakingSegIdx,
  playTokenRef,
  synthRef,
  audioRef,
  getSegmentStartSec,
  estimatedAudioSegIdx,
  showPinyin,
  setShowPinyin,
  cfg,
}) => {
  return (
    <div className="mx-4 mb-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-base)' }}>
      {/* Row 1: play + time + speed */}
      <div className="flex items-center gap-2 mb-2">
        {/* Sound bars (animated) */}
        <div className="flex items-end gap-[2px] h-5 shrink-0">
          {[4, 7, 10, 6, 9, 12, 5, 8].map((h, i) => (
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
            ? `${Math.floor(audioCurrent / 60)}:${(Math.floor(audioCurrent) % 60).toString().padStart(2, '0')} / ${Math.floor(audioDuration / 60)}:${(Math.floor(audioDuration) % 60).toString().padStart(2, '0')}`
            : selectedPractice ? `${Math.floor(selectedPractice.durationSec / 60)}:${(selectedPractice.durationSec % 60).toString().padStart(2, '0')}` : ''}
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
      {/* Row 2: seekbar or segment pills */}
      {selectedPractice && selectedPractice.audioUrl ? (
        <div
          className="relative h-8 flex items-center cursor-pointer group select-none"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const t = pct * (audioDuration || selectedPractice.durationSec);
            // setAudioCurrent(t); // parent must handle
            if (audioRef.current) audioRef.current.currentTime = t;
          }}>
          {/* Track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: `${accent}25` }}>
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
      ) : selectedPractice ? (
        <div className="flex items-center gap-1 py-2">
          {selectedPractice.segments.map((seg: any, i: number) => {
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
      ) : null}
    </div>
  );
};
