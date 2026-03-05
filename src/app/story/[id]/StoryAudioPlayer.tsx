"use client";

import { useRef, useState } from "react";

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function StoryAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-4xl bg-white border border-[#561d11]/10 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] px-5 py-4">
      <p className="font-brand text-xs font-medium text-[#561d11]/45 mb-3 uppercase tracking-wide">
        Voice recording
      </p>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="shrink-0 w-9 h-9 rounded-full bg-[#561d11] flex items-center justify-center text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.97]"
        >
          {isPlaying ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="0" y="0" width="3.5" height="12" rx="1" />
              <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
              <path d="M1 0.5L10.5 6.5L1 12.5V0.5Z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #561d11 ${progress}%, rgba(86,29,17,0.15) ${progress}%)`,
          }}
        />

        <span className="shrink-0 font-brand tabular-nums text-xs text-[#561d11]/50 min-w-[2.5rem] text-right">
          {formatTime(Math.floor(currentTime))}
          {duration > 0 && (
            <span className="text-[#561d11]/30"> / {formatTime(Math.floor(duration))}</span>
          )}
        </span>
      </div>
    </div>
  );
}
