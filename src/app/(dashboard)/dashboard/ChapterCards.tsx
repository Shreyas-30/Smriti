"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShareOverlay, { type ShareData } from "./ShareOverlay";

export type Chapter = {
  id: string; // prompt id
  custom_text: string;
  story: {
    content: string;
    language: string;
    updatedAt: string; // ISO string
  };
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractTitle(content: string): string {
  const firstSentence = content.split(/[.!?]/)[0].trim();
  const words = firstSentence.split(/\s+/);
  if (words.length <= 6) return firstSentence;
  return words.slice(0, 5).join(" ") + "…";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3.5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 2v3M14 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export default function ChapterCards({ chapters }: { chapters: Chapter[] }) {
  const router = useRouter();
  const [shareData, setShareData] = useState<ShareData | null>(null);

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {chapters.map((chapter) => {
        const wc = wordCount(chapter.story.content);
        const title = extractTitle(chapter.story.content);

        return (
          <div
            key={chapter.id}
            onClick={() => router.push(`/record/${chapter.id}`)}
            className="bg-white border border-black/5 rounded-[16px] p-8 text-left hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
          >
            {/* Word count + share */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareData({
                    title,
                    subtitle: `Story · ${wc} words`,
                    storyUrl: `${window.location.origin}/story/${chapter.id}`,
                  });
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#561d11]/30 hover:text-[#561d11]/60 hover:bg-[#561d11]/5 transition opacity-0 group-hover:opacity-100"
                aria-label="Share story"
              >
                <ShareIcon />
              </button>
              <span className="font-brand text-[12px] text-[#561d11]/30">{wc} words</span>
            </div>

            {/* Title */}
            <h4 className="font-serif text-[#561d11] text-[24px] leading-tight tracking-[-0.6px] mb-3">
              {title}
            </h4>

            {/* Prompt question */}
            <p className="font-brand text-[14px] text-[#561d11]/50 leading-snug mb-4 line-clamp-2">
              {chapter.custom_text}
            </p>

            {/* Content preview */}
            <p className="font-brand text-[16px] text-[#561d11]/70 leading-relaxed line-clamp-3 mb-6 flex-1">
              {chapter.story.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#561d11]/40 text-[12px] font-brand">
                <CalendarIcon />
                {formatDate(chapter.story.updatedAt)}
              </div>
              <span className="text-[#561d11]/30 group-hover:text-[#561d11]/60 transition">
                <ChevronRightIcon />
              </span>
            </div>
          </div>
        );
      })}
    </div>

    {shareData && (
      <ShareOverlay data={shareData} onClose={() => setShareData(null)} />
    )}
    </>
  );
}
