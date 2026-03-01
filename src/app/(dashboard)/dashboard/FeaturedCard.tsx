"use client";

import { useRouter } from "next/navigation";
import type { Chapter } from "./ChapterCards";

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
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3.5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 2v3M14 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function BookOpenDecorIcon() {
  return (
    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="rgba(240,234,222,0.25)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function FeaturedCard({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const wc = wordCount(chapter.story.content);
  const title = extractTitle(chapter.story.content);

  return (
    <div className="rounded-[24px] border border-black/5 bg-white shadow-sm overflow-hidden">
      <div className="flex">
        {/* Left: content */}
        <div className="flex-1 min-w-0 p-8 md:p-10">
          <p className="font-brand text-[12px] text-[#561d11]/50 tracking-[1.2px] uppercase mb-4">
            Featured
          </p>
          <h3 className="font-serif text-[#561d11] text-[30px] md:text-[36px] leading-none tracking-[-0.9px] mb-3">
            {title}
          </h3>
          <p className="font-brand text-[14px] text-[#561d11]/50 mb-5 leading-snug">
            {chapter.custom_text}
          </p>
          <p className="font-brand text-[17px] text-[#561d11]/80 leading-[1.65] line-clamp-5 mb-6">
            {chapter.story.content}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-[#561d11]/50 text-[14px] font-brand">
              <CalendarIcon />
              {formatDate(chapter.story.updatedAt)}
            </div>
            <div className="flex items-center gap-2 text-[#561d11]/50 text-[14px] font-brand">
              <BookIcon />
              {wc} words
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 h-10 rounded-full bg-[#f0eade] font-brand text-[14px] font-medium text-[#561d11] hover:bg-[#e5ddd0] transition active:scale-[0.98]">
              <ShareIcon />
              Share
            </button>
            <button
              onClick={() => router.push(`/record/${chapter.id}`)}
              className="flex items-center gap-2 px-5 h-10 rounded-full bg-[#561d11] font-brand text-[14px] font-medium text-white hover:bg-[#6b2517] transition active:scale-[0.98]"
            >
              <EditIcon />
              Continue Writing
            </button>
          </div>
        </div>

        {/* Right: gradient panel (desktop only) */}
        <div className="hidden md:flex w-[280px] shrink-0 items-center justify-center bg-gradient-to-b from-[#561d11] to-[#7a2a1a]">
          <BookOpenDecorIcon />
        </div>
      </div>
    </div>
  );
}
