import Link from "next/link";
import StoryCardStack from "@/components/marketing/StoryCardStack";

export default function HomePage() {
  return (
    // flex-row-reverse on desktop: cards (first in DOM) go right, text goes left
    <main className="flex min-h-dvh flex-col bg-[#f0eade] md:flex-row-reverse">
      {/* Card stack — top on mobile, right column on desktop */}
      <div className="relative h-85 shrink-0 md:h-auto md:flex-1 md:flex md:items-center md:justify-center">
        {/* Soft radial glow on desktop */}
        <div className="pointer-events-none absolute inset-0 hidden md:block"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, transparent 68%)" }}
        />
        {/* Fixed-size inner container so cards don't stretch on wide screens */}
        <div className="relative h-full w-full md:h-[420px] md:w-[420px] lg:h-[480px] lg:w-[480px]">
          <StoryCardStack />
        </div>
      </div>

      {/* Branding + CTAs — bottom on mobile, left column on desktop */}
      <div className="md:flex md:w-[46%] md:shrink-0 md:flex-col md:items-start md:justify-center md:px-14 lg:px-20 xl:px-28">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 pb-10 pt-5 md:mx-0 md:max-w-none md:items-start md:p-0 md:gap-6">
          {/* Title + tagline */}
          <div className="text-center md:text-left">
            <h1 className="font-serif leading-none tracking-[-0.04em] text-[#4c1815] text-[5rem] md:text-[6.5rem] lg:text-[7.5rem]">
              Smriti
            </h1>
            <p className="mt-2 font-brand leading-snug tracking-[-0.04em] text-[#561d11] text-lg md:text-xl md:max-w-xs lg:max-w-sm">
              Helping you document your family&apos;s rich stories and history
            </p>
          </div>

          {/* Primary CTA */}
          <Link
            href="/signup"
            className="mt-1 flex h-12 w-72 items-center justify-center rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] md:w-auto md:px-10"
          >
            Sign up for a loved one
          </Link>

          {/* Secondary link */}
          <Link
            href="/signup/self"
            className="font-brand text-base text-[#561d11] underline underline-offset-4 hover:opacity-75 transition"
          >
            I want to capture my own stories →
          </Link>
        </div>
      </div>
    </main>
  );
}
