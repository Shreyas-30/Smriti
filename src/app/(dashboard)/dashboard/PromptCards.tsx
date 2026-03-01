"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type ScheduledPrompt = {
  id: string;
  custom_text: string;
  scheduledFor: string; // ISO string
};

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3.5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 2v3M14 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function PromptCards({ prompts }: { prompts: ScheduledPrompt[] }) {
  const router = useRouter();

  if (prompts.length === 0) {
    return (
      <p className="font-brand text-sm text-[#561d11]/60 text-center py-4">
        No upcoming prompts.{" "}
        <Link href="/onboarding" className="underline underline-offset-4">
          Add some to get started.
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => router.push(`/record/${prompt.id}`)}
          className="w-full bg-white border border-black/5 rounded-[16px] px-6 py-5 flex items-center gap-5 hover:shadow-sm transition-shadow group text-left"
        >
          {/* Calendar icon in beige square */}
          <div className="shrink-0 w-[52px] h-[52px] rounded-[14px] bg-[#f0eade] flex items-center justify-center text-[#561d11]/60">
            <CalendarIcon />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[#561d11] text-[18px] leading-snug tracking-[-0.2px] truncate mb-1">
              {prompt.custom_text}
            </p>
            <div className="flex items-center gap-1.5 text-[#561d11]/50 text-[14px] font-brand">
              <ClockIcon />
              <span>{formatShortDate(prompt.scheduledFor)}</span>
            </div>
          </div>

          {/* Chevron */}
          <span className="shrink-0 text-[#561d11]/30 group-hover:text-[#561d11]/60 transition">
            <ChevronRightIcon />
          </span>
        </button>
      ))}
    </div>
  );
}
