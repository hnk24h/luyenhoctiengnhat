'use client';

import { useRef, useState } from 'react';
import { FaHeadphones, FaPlay, FaPause, FaRotateRight } from 'react-icons/fa6';
import { formatDuration } from '@/lib/utils';

interface Props {
  src: string;
  /** Accent colour for progress bar / play button. Defaults to #C2410C (orange-700) */
  accent?: string;
  /** Background colour for the player card. Defaults to #FFF7ED */
  bg?: string;
}

export function AudioPlayer({ src, accent = '#C2410C', bg = '#FFF7ED' }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur]         = useState(0);
  const [dur, setDur]         = useState(0);
  const [loaded, setLoaded]   = useState(false);

  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  const trackBg = `${accent}30`;

  function toggle() {
    const a = ref.current; if (!a) return;
    playing ? a.pause() : void a.play();
  }

  function replay() {
    const a = ref.current; if (!a) return;
    a.currentTime = 0;
    void a.play();
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = ref.current; if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl select-none"
      style={{ background: bg }}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setCur(ref.current?.currentTime ?? 0)}
        onLoadedMetadata={() => { setDur(ref.current?.duration ?? 0); setLoaded(true); }}
      />

      {/* Icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}25`, color: accent }}>
        <FaHeadphones size={13} />
      </div>

      {/* Play/Pause */}
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:opacity-80 active:scale-95"
        style={{ background: accent, color: '#fff' }}>
        {playing ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: 1 }} />}
      </button>

      {/* Seek + time */}
      <div className="flex-1 min-w-0">
        {/* Track */}
        <div
          className="relative h-1.5 rounded-full cursor-pointer mb-1.5 group"
          style={{ background: trackBg }}
          onClick={seek}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%`, background: accent }}
          />
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${pct}%`, background: accent, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        </div>
        {/* Time */}
        <div className="flex justify-between text-[10px] font-mono" style={{ color: accent }}>
          <span>{formatDuration(Math.floor(cur))}</span>
          <span>{loaded ? formatDuration(Math.floor(dur)) : '—:——'}</span>
        </div>
      </div>

      {/* Replay */}
      <button
        onClick={replay}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 hover:opacity-70 transition-opacity"
        style={{ background: `${accent}25`, color: accent }}>
        <FaRotateRight size={10} />
      </button>
    </div>
  );
}
