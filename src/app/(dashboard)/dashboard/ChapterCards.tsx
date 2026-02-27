"use client";

import { useRouter } from "next/navigation";

export type Chapter = {
  id: string; // prompt id
  custom_text: string;
  story: {
    content: string;
    language: string;
    updatedAt: string; // ISO string
  };
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChapterCards({ chapters }: { chapters: Chapter[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="rounded-[20px] bg-white border border-[#561d11]/10 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.07)] px-5 py-5"
        >
          {/* Prompt question — small label */}
          <p className="font-brand text-xs font-medium text-[#561d11]/45 mb-2 leading-snug uppercase tracking-wide">
            {chapter.custom_text}
          </p>

          {/* Story preview */}
          <p className="font-brand text-sm text-[#561d11] leading-relaxed line-clamp-3 mb-4">
            {chapter.story.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="font-brand text-xs text-[#561d11]/40">
              Saved {formatDate(chapter.story.updatedAt)}
            </span>
            <button
              onClick={() => router.push(`/record/${chapter.id}`)}
              className="flex items-center gap-1.5 font-brand text-xs font-semibold text-[#561d11]/60 hover:text-[#561d11] transition"
            >
              <PencilIcon />
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
