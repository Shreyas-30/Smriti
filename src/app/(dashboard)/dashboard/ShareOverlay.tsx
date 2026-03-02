"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export type ShareData = {
  title: string;
  subtitle: string; // e.g. "Story · 342 words"
  storyUrl: string;
};

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FacebookSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.878-1.42A9.945 9.945 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 0 1-4.031-1.1l-.29-.172-2.895.843.872-2.833-.188-.298A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
    </svg>
  );
}

function MailSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,4 12,13 2,4" />
    </svg>
  );
}

const CHANNELS = [
  {
    name: "Facebook",
    bg: "#1877f2",
    icon: <FacebookSvg />,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter",
    bg: "#000000",
    icon: <TwitterSvg />,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`"${title}" — shared from Smriti`)}`,
  },
  {
    name: "WhatsApp",
    bg: "#25d366",
    icon: <WhatsAppSvg />,
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`"${title}" — shared from Smriti\n${url}`)}`,
  },
  {
    name: "Email",
    bg: "#561d11",
    icon: <MailSvg />,
    href: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`I'd like to share this story with you: "${title}"\n\n${url}`)}`,
  },
] as const;

export default function ShareOverlay({
  data,
  onClose,
}: {
  data: ShareData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.storyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] w-full max-w-[480px] p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[#561d11] text-[24px] leading-none tracking-[-0.6px]">
            Share Story
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#561d11]/40 hover:text-[#561d11]/70 hover:bg-[#561d11]/5 transition"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Story info */}
        <div className="bg-[#f0eade] rounded-[16px] px-4 py-4 flex flex-col gap-1">
          <p className="font-brand text-[14px] text-[#561d11]/50 truncate">{data.title}</p>
          <p className="font-brand text-[12px] text-[#561d11]/40">{data.subtitle}</p>
        </div>

        {/* Share link */}
        <div className="flex flex-col gap-2">
          <p className="font-brand font-medium text-[14px] text-[#561d11]/70">Share Link</p>
          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-0 bg-[#f0eade] rounded-[14px] px-4 h-11 flex items-center overflow-hidden">
              <p className="font-brand text-[14px] text-[#561d11]/70 truncate">{data.storyUrl}</p>
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 bg-[#561d11] text-[#f0eade] rounded-[14px] px-5 h-11 font-brand text-[14px] font-medium flex items-center gap-2 hover:bg-[#6b2517] transition active:scale-[0.98]"
            >
              <LinkIcon />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Share via */}
        <div className="flex flex-col gap-3">
          <p className="font-brand font-medium text-[14px] text-[#561d11]/70">Share via</p>
          <div className="grid grid-cols-4 gap-3">
            {CHANNELS.map(({ name, bg, icon, href }) => (
              <a
                key={name}
                href={href(data.storyUrl, data.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 py-4 rounded-[16px] hover:bg-[#561d11]/5 transition"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: bg }}
                >
                  {icon}
                </div>
                <span className="font-brand font-medium text-[12px] text-[#561d11]/60 text-center">
                  {name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
