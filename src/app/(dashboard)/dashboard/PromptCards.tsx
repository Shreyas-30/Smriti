"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ScheduledPrompt = {
  id: string;
  custom_text: string;
  scheduledFor: string; // ISO string
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="3.5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 2v3M14 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PromptCards({ prompts }: { prompts: ScheduledPrompt[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
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
      {prompts.map((prompt) => {
        const isOpen = openId === prompt.id;
        return (
          <div
            key={prompt.id}
            onClick={() => setOpenId(isOpen ? null : prompt.id)}
            className="rounded-[20px] bg-[#561d11] px-5 py-5 cursor-pointer transition-all active:scale-[0.99] select-none"
          >
            {/* ── Card header ── */}
            <div className="flex items-start gap-3">
              <CalendarIcon className="shrink-0 mt-0.5 text-[#f0eade]/60" />
              <div className="flex-1 min-w-0">
                <p className="font-brand font-medium text-[#f0eade] text-base leading-snug">
                  {prompt.custom_text}
                </p>
                <p className="mt-2 font-brand text-sm text-[#f0eade]/70">
                  Scheduled for {formatDate(prompt.scheduledFor)}
                </p>
              </div>
              {/* Chevron */}
              <svg
                className={`shrink-0 mt-1 w-4 h-4 text-[#f0eade]/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* ── Expanded action ── */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? "80px" : "0px" }}
            >
              <div className="pt-4 border-t border-[#f0eade]/15 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/record/${prompt.id}`);
                  }}
                  className="w-full h-10 rounded-full bg-[#f0eade] font-brand text-sm font-semibold text-[#561d11] transition hover:bg-[#e8e0ce] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <MicIcon />
                  Record now
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
