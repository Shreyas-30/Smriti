"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const NOISE_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Actual image aspect ratios: w/h
// photo-1: 948x664 (1.428)   photo-2: 628x944 (0.665)   photo-3: 636x804 (0.791)
// photo-4: 936x664 (1.410)   photo-5: 648x472 (1.373)   photo-6: 624x412 (1.515)
// photo-7: 936x1300 (0.720)  photo-8: 876x648 (1.352)   photo-9: 840x676 (1.243)
// photo-10: 640x900 (0.711)  photo-11: 1448x976 (1.484) photo-12: 1072x800 (1.340)
// photo-13: 804x1072 (0.750) photo-14: 748x996 (0.751)  stamp: 232x278 (0.835)
const CLUSTERS = {
  "top-left": [
    {
      id: 1,
      src: "/landing/photo-1.png",
      pos: { left: "3%", top: "3%" },
      w: "min(350px, 24.4vw)",
      ar: "948/664",
      rotate: -5,
      z: 0,
    },
    {
      id: 2,
      src: "/landing/photo-2.png",
      pos: { left: "16%", top: "18%" },
      w: "min(231px, 16.1vw)",
      ar: "628/944",
      rotate: -2,
      z: 2,
    },
    {
      id: 3,
      src: "/landing/photo-3.png",
      pos: { left: "19%", top: "3%" },
      w: "min(250px, 17.4vw)",
      ar: "636/804",
      rotate: 4,
      z: 1,
    },
  ],
  "bottom-left": [
    {
      id: 4,
      src: "/landing/photo-4.png",
      pos: { left: "4%", bottom: "7%" },
      w: "min(200px, 13.9vw)",
      ar: "936/664",
      rotate: 3,
      z: 2,
    },
    {
      id: 5,
      src: "/landing/photo-5.png",
      pos: { left: "13%", bottom: "18%" },
      w: "min(231px, 16.1vw)",
      ar: "648/472",
      rotate: -5,
      z: 3,
    },
    {
      id: 6,
      src: "/landing/photo-6.png",
      pos: { left: "12%", bottom: "2%" },
      w: "min(210px, 14.6vw)",
      ar: "624/412",
      rotate: 2,
      z: 1,
    },
  ],
  "top-right": [
    {
      id: 7,
      src: "/landing/photo-7.png",
      pos: { right: "13%", top: "2%" },
      w: "min(250px, 17.4vw)",
      ar: "936/1300",
      rotate: 2,
      z: 2,
    },
    {
      id: 8,
      src: "/landing/photo-8.png",
      pos: { right: "5%", top: "1%" },
      w: "min(215px, 14.9vw)",
      ar: "876/648",
      rotate: 5,
      z: 3,
    },
    {
      id: 9,
      src: "/landing/photo-9.png",
      pos: { right: "8%", top: "22%" },
      w: "min(206px, 14.4vw)",
      ar: "840/676",
      rotate: -4,
      z: 1,
    },
    {
      id: 10,
      src: "/landing/photo-10.png",
      pos: { right: "18%", top: "19%" },
      w: "min(190px, 13.2vw)",
      ar: "640/900",
      rotate: -1,
      z: 4,
    },
  ],
  "bottom-right": [
    {
      id: 11,
      src: "/landing/stamp.png",
      pos: { right: "21%", bottom: "14%" },
      w: "min(126px, 8.8vw)",
      ar: "232/278",
      rotate: -5,
      z: 4,
    },
    {
      id: 12,
      src: "/landing/photo-12.png",
      pos: { right: "12%", bottom: "2%" },
      w: "min(368px, 25.6vw)",
      ar: "1072/800",
      rotate: -3,
      z: 1,
    },
    {
      id: 13,
      src: "/landing/photo-13.png",
      pos: { right: "5%", bottom: "7%" },
      w: "min(237px, 16.5vw)",
      ar: "804/1072",
      rotate: 3,
      z: 2,
    },
    {
      id: 14,
      src: "/landing/photo-14.png",
      pos: { right: "1%", bottom: "0%" },
      w: "min(193px, 13.3vw)",
      ar: "748/996",
      rotate: 6,
      z: 3,
    },
  ],
} as const;

// SVG noise for the grain overlay on photos
const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

// Subset of photos shown on mobile, with positions relative to the mobile collage container
const MOBILE_PHOTOS = [
  {
    id: 5,
    src: "/landing/photo-5.png",
    style: {
      left: "2%",
      top: "5%",
      width: "55%",
      height: "auto",
      aspectRatio: "4/3",
    },
    rotate: -3,
    z: 2,
  },
  {
    id: 14,
    src: "/landing/photo-14.png",
    style: {
      right: "5%",
      top: "0%",
      width: "35%",
      height: "auto",
      aspectRatio: "3/4",
    },
    rotate: 4,
    z: 3,
  },
  {
    id: 12,
    src: "/landing/photo-12.png",
    style: {
      left: "5%",
      bottom: "2%",
      width: "60%",
      height: "auto",
      aspectRatio: "3/2",
    },
    rotate: 2,
    z: 1,
  },
  {
    id: 11,
    src: "/landing/stamp.png",
    style: {
      right: "18%",
      bottom: "20%",
      width: "18%",
      height: "auto",
      aspectRatio: "5/6",
    },
    rotate: -5,
    z: 4,
  },
] as const;

const STORY_TEXT = [
  `In those days, love travelled by post—and in our house, even the postman felt like a relative.`,
  `I'd leave work and stop at the little post office, still smelling faintly of sweat and Lifebuoy soap, clutching that thin aerogramme sheet like it was something precious. The clerk would lick the stamp, straighten it with too much seriousness, and then— thap — press REGISTERED on the envelope. That sound used to make my heart steady. As if the government itself was saying, "Yes, this love is going."`,
  `I never wrote filmi lines. I wrote like a normal man: that the power cut came again, that the chai was too sweet at the canteen, that the ceiling fan was making that tak-tak sound, and that the entire day somehow felt incomplete without her voice in it. And then, between those ordinary sentences, I would hide the real thing—one small line meant only for her, the kind that could survive distance and nosy eyes.`,
  `Her replies came after a week, sometimes ten days. The paper would be soft at the folds, like it had been opened and closed a hundred times. She'd write about Amma asking too many questions, about the neighbour aunty who noticed everything, about pressing her dupatta between the pages of a book so the letter could stay hidden. But even in all that, she'd end with something that made me smile like an idiot: "Send another soon," or "I'm keeping your envelopes in my drawer."`,
  `Now when I look at those stamps, the old printing, the ink that has faded - I don't just see mail.`,
  `I see the patience we had. The way we loved without hurry. The way we built a life, one letter at a time, between chai, power cuts, and the long wait for footsteps at the gate.`,
];

const STEPS = [
  {
    step: "Step 1",
    text: "Send your loved one a message on Whatsapp, or however they feel most comfortable",
  },
  {
    step: "Step 2",
    text: "They can record themselves telling the story in their own voice and language",
  },
  {
    step: "Step 3",
    text: "We will compile them for you in English and send you a beautiful keepsake when you're ready!",
  },
];

const FAQS = [
  {
    q: "What is Smriti?",
    a: `Smriti (meaning "memory" in Sanskrit) is a platform that helps families preserve their stories and memories. It enables you to send prompts to your loved ones, who can then share their memories through voice or text in any language, which are beautifully formatted and preserved for future generations.`,
  },
  {
    q: "Can my parents/grandparents respond in Hindi or other Indian languages?",
    a: `Absolutely! Smriti supports all Indian languages. Your loved ones can record or type their stories in Hindi, Tamil, Bengali, Marathi, Gujarati, or any language they're comfortable with. We'll preserve their authentic voice and words.`,
  },
  {
    q: "How does voice recording work?",
    a: `Your loved ones can simply record their stories using their phone - no technical knowledge needed. We convert their voice recordings into well-written stories while preserving the original audio, so you can read along or listen to their voice telling the story.`,
  },
  {
    q: "Can I print the stories as a book?",
    a: `We're working on it! Our goal is that once you've collected multiple stories, you can view them online or order a beautifully printed book featuring all your family's memories, complete with photos and stories.`,
  },
  {
    q: "Is my family's data secure?",
    a: `We take privacy very seriously. All stories and recordings are encrypted and stored securely. You have complete control over who can view your family's memories. Your data will never be shared with anyone and you will retain ownership of your story.`,
  },
];

// Photos used in the Section 2 collage (left column)
const STORY_PHOTOS = [
  {
    src: "/landing/photo-11.png",
    ar: "1448/976",
    style: { top: "0%", left: "4%", width: "74%" },
    rotate: -4,
    z: 1,
  },
  {
    src: "/landing/photo-2.png",
    ar: "628/944",
    style: { top: "22%", left: "0%", width: "56%" },
    rotate: 3,
    z: 2,
  },
  {
    src: "/landing/photo-5.png",
    ar: "648/472",
    style: { bottom: "0%", left: "18%", width: "74%" },
    rotate: -2,
    z: 3,
  },
] as const;

function StoryAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  function fmt(s: number) {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  // Update the slider and timestamp directly via DOM — no React re-render per frame
  function tick() {
    const el = audioRef.current;
    if (!el) return;
    const cur = el.currentTime;
    const dur = el.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;
    if (inputRef.current) {
      inputRef.current.value = String(cur);
      inputRef.current.style.background = `linear-gradient(to right, #3d1a0e ${pct}%, rgba(61,26,14,0.18) ${pct}%)`;
    }
    if (timeRef.current) {
      timeRef.current.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    function onPlay() {
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }
    function onPause() {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    }
    function onEnded() {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
      if (inputRef.current) {
        inputRef.current.value = "0";
        inputRef.current.style.background = `linear-gradient(to right, #3d1a0e 0%, rgba(61,26,14,0.18) 0%)`;
      }
      if (timeRef.current) timeRef.current.textContent = `00:00 / ${fmt(el?.duration ?? 0)}`;
      if (el) el.currentTime = 0;
    }
    function onDuration() {
      const dur = el?.duration ?? 0;
      if (!isFinite(dur)) return;
      setDuration(dur);
      if (inputRef.current) inputRef.current.max = String(dur);
      if (timeRef.current) timeRef.current.textContent = `00:00 / ${fmt(dur)}`;
    }

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onDuration);
    el.addEventListener("durationchange", onDuration);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onDuration);
      el.removeEventListener("durationchange", onDuration);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause(); else void el.play();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
  }

  const THUMB =
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3d1a0e] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3d1a0e] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 rounded-lg"
      style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
        style={{ backgroundColor: "#3d1a0e" }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="#f2ede4">
            <rect x="0" y="0" width="3.5" height="12" rx="1" />
            <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="#f2ede4">
            <path d="M1 0.5L10.5 6.5L1 12.5V0.5Z" />
          </svg>
        )}
      </button>

      {/* Uncontrolled input — DOM updated directly by rAF, React never touches value */}
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={duration || 100}
        step={0.01}
        defaultValue={0}
        onChange={handleSeek}
        disabled={duration === 0}
        className={`flex-1 h-1.5 appearance-none rounded-full cursor-pointer ${THUMB}`}
        style={{ background: `linear-gradient(to right, #3d1a0e 0%, rgba(61,26,14,0.18) 0%)` }}
      />

      <span
        ref={timeRef}
        className="text-sm shrink-0 tabular-nums"
        style={{
          fontFamily: "var(--font-instrument-sans)",
          color: "rgba(92,42,24,0.6)",
          minWidth: "5.5rem",
          textAlign: "right",
        }}
      >
        00:00 / —:——
      </span>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e5ddd3]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        style={{ fontFamily: "var(--font-instrument-sans)" }}
      >
        <span className="text-[#3d1a0e] text-base sm:text-lg font-medium">
          {q}
        </span>
        <span
          className="text-[#5c2a18] text-2xl shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "300px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p
          className="pb-5 text-[#5c2a18]/80 text-sm sm:text-base leading-relaxed"
          style={{ fontFamily: "var(--font-instrument-sans)" }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Hero with photo collage
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="paper-texture relative min-h-screen overflow-hidden flex flex-col md:flex-row md:items-center md:justify-center"
        style={{ backgroundColor: "#f2ede4" }}
      >
        {/* Paper noise */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.065,
            mixBlendMode: "multiply",
          }}
        />
        {/* Vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(140,110,70,0.22) 100%)",
          }}
        />

        {/* ── Desktop photo collage (grouped by cluster) ── */}
        {Object.entries(CLUSTERS).map(([cluster, photos]) => (
          <div
            key={cluster}
            className="photo-cluster absolute inset-0 hidden md:block"
          >
            {photos.map(({ id, src, pos, w, ar, rotate, z }) => (
              <div
                key={id}
                className="photo-card absolute overflow-hidden"
                style={{
                  "--base-transform": `rotate(${rotate}deg)`,
                  ...pos,
                  width: w,
                  aspectRatio: ar,
                  zIndex: z,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={src}
                    alt={`Family photo ${id}`}
                    fill
                    unoptimized
                    className="object-cover"
                    priority={id <= 3}
                  />
                </div>
                {/* Grain overlay */}
                <div
                  className="photo-grain absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: GRAIN_URL,
                    backgroundSize: "200px 200px",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
            ))}
          </div>
        ))}

        {/* ── Mobile photo collage ── */}
        <div
          className="relative w-full md:hidden"
          style={{ paddingTop: "48px", paddingBottom: "85%" }}
        >
          {MOBILE_PHOTOS.map(({ id, src, style, rotate, z }) => (
            <div
              key={id}
              className="photo-card absolute overflow-hidden"
              style={
                {
                  "--base-transform": `rotate(${rotate}deg)`,
                  ...style,
                  zIndex: z,
                } as React.CSSProperties
              }
            >
              <Image
                src={src}
                alt={`Family photo ${id}`}
                width={400}
                height={400}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div
                className="photo-grain absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: GRAIN_URL,
                  backgroundSize: "200px 200px",
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Center content ── */}
        <div className="relative z-10 flex flex-col items-center text-center gap-5 px-8 pb-16 pt-4 md:py-0">
          <h1
            className="text-[#3d1a0e] leading-none"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(72px, 9vw, 130px)",
              letterSpacing: "0.03em",
            }}
          >
            Smriti
          </h1>

          <p
            className="text-[#5c2a18] leading-relaxed max-w-[320px] sm:max-w-100"
            style={{
              fontFamily: "var(--font-instrument-sans)",
              fontSize: "clamp(17px, 1.5vw, 21px)",
            }}
          >
            Helping you document your family&apos;s rich stories and history
          </p>

          <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-sm">
            <Link
              href="/signup"
              className="w-full py-4 rounded-full text-center text-white font-medium transition-opacity duration-200 hover:opacity-90"
              style={{
                backgroundColor: "#3d1a0e",
                fontFamily: "var(--font-instrument-sans)",
                fontSize: "clamp(16px, 1.3vw, 19px)",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Story example (two-column)
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="paper-texture relative py-20 md:py-28 px-6 overflow-hidden"
        style={{ backgroundColor: "#f2ede4" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.045,
            mixBlendMode: "multiply",
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-16">

            {/* ── Left: stacked photo collage ── */}
            <div
              className="shrink-0 w-full md:w-[44%] relative"
              style={{ height: "clamp(360px, 55vw, 660px)" }}
            >
              {STORY_PHOTOS.map(({ src, ar, style, rotate, z }, i) => (
                <div
                  key={i}
                  className="photo-card absolute overflow-hidden shadow-md"
                  style={{
                    "--base-transform": `rotate(${rotate}deg)`,
                    ...style,
                    aspectRatio: ar,
                    zIndex: z,
                    borderRadius: "6px",
                  } as React.CSSProperties}
                >
                  <Image
                    src={src}
                    alt="Family photo"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div
                    className="photo-grain absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: GRAIN_URL,
                      backgroundSize: "200px 200px",
                      mixBlendMode: "multiply",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* ── Right: attribution + audio + story ── */}
            <div className="flex-1 min-w-0">
              {/* Attribution — large italic serif at top */}
              <p
                className="text-[#3d1a0e] leading-snug mb-7"
                style={{
                  fontFamily: "var(--font-instrument-serif)",
                  fontSize: "clamp(20px, 2vw, 30px)",
                  fontStyle: "italic",
                }}
              >
                A glimpse of the kind of story your family could have, like
                Binod and Shraddha&apos;s, collected through guided prompts and
                turned into a keepsake book.
              </p>

              {/* Functional audio player */}
              <div className="mb-8">
                <StoryAudioPlayer src="/landing/story.mp3" />
              </div>

              {/* Story paragraphs */}
              <div className="space-y-5">
                {STORY_TEXT.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[#3d1a0e] leading-relaxed"
                    style={{
                      fontFamily: "var(--font-instrument-sans)",
                      fontSize: "clamp(15px, 1.2vw, 18px)",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — How does it work?
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="paper-texture relative py-20 md:py-28 px-6"
        style={{ backgroundColor: "#ece5d8" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.045,
            mixBlendMode: "multiply",
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <h2
            className="text-[#3d1a0e] mb-14"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontStyle: "italic",
            }}
          >
            How does it work?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
            {STEPS.map(({ step, text }, i) => (
              <div key={step} className="flex flex-col gap-6">
                {/* Step image — natural aspect ratio, no crop */}
                <Image
                  src={`/landing/step_${i + 1}.png`}
                  alt={step}
                  width={400}
                  height={866}
                  unoptimized
                  className="w-full h-auto max-w-[260px] md:max-w-none mx-auto md:mx-0"
                  style={{ borderRadius: "46px" }}
                />

                {/* Step label — italic serif with underline */}
                <span
                  className="text-[#3d1a0e]"
                  style={{
                    fontFamily: "var(--font-instrument-serif)",
                    fontSize: "clamp(22px, 2vw, 30px)",
                    fontStyle: "italic",
                    textDecoration: "underline",
                    textUnderlineOffset: "5px",
                  }}
                >
                  {step}
                </span>

                <p
                  className="text-[#3d1a0e] leading-relaxed"
                  style={{
                    fontFamily: "var(--font-instrument-sans)",
                    fontSize: "clamp(14px, 1.2vw, 18px)",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — FAQ
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="paper-texture relative py-20 md:py-28 px-6"
        style={{ backgroundColor: "#f2ede4" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.045,
            mixBlendMode: "multiply",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <h2
            className="text-[#3d1a0e] text-center mb-12"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(32px, 4vw, 52px)",
            }}
          >
            Frequently Asked Questions
          </h2>

          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Footer CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <footer
        className="paper-texture relative py-16 px-6 text-center"
        style={{ backgroundColor: "#ece5d8" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.045,
            mixBlendMode: "multiply",
          }}
        />
        <div className="relative flex flex-col items-center gap-5">
          <h2
            className="text-[#3d1a0e]"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(28px, 3.5vw, 44px)",
            }}
          >
            Helping you document your family&apos;s rich stories and history
          </h2>
          <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-sm">
            <Link
              href="/signup"
              className="w-full py-4 rounded-full text-center text-white font-medium transition-opacity duration-200 hover:opacity-90"
              style={{
                backgroundColor: "#3d1a0e",
                fontFamily: "var(--font-instrument-sans)",
                fontSize: "clamp(16px, 1.3vw, 19px)",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
