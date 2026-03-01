"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Props = {
  children: React.ReactNode;
  storyCount: number;
  totalWords: number;
  upcomingCount: number;
};

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type SidebarContentProps = {
  storyCount: number;
  totalWords: number;
  upcomingCount: number;
  onClose?: () => void;
};

function SidebarContent({ storyCount, totalWords, upcomingCount, onClose }: SidebarContentProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-8 pt-8 pb-5">
        {onClose && (
          <button
            onClick={onClose}
            className="mb-4 text-[#561d11]/40 hover:text-[#561d11] transition"
            aria-label="Close menu"
          >
            <XIcon />
          </button>
        )}
        <p className="font-serif text-[#561d11] text-[30px] leading-none tracking-[-0.75px]">
          Smriti
        </p>
        <p className="font-brand text-[#561d11]/50 text-[14px] mt-1 leading-snug">
          Your family&apos;s memories, preserved
        </p>
      </div>

      {/* Stats */}
      <div className="mx-8 mb-6 pb-6 border-b border-[#561d11]/8 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-[#561d11] text-[24px] leading-none">{storyCount}</p>
          <p className="font-brand text-[#561d11]/50 text-[12px]">Stories</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-[#561d11] text-[24px] leading-none">
            {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
          </p>
          <p className="font-brand text-[#561d11]/50 text-[12px]">Words</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-[#561d11] text-[24px] leading-none">{upcomingCount}</p>
          <p className="font-brand text-[#561d11]/50 text-[12px]">Upcoming</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-8 flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="block px-4 py-2.5 rounded-[10px] bg-[#561d11] text-white font-brand font-medium text-base leading-snug"
        >
          All Stories
        </Link>
        <button className="px-4 py-2.5 rounded-[10px] text-left font-brand font-medium text-base text-[#561d11]/70 hover:bg-[#561d11]/5 transition leading-snug">
          Favorites
        </button>
        <button className="px-4 py-2.5 rounded-[10px] text-left font-brand font-medium text-base text-[#561d11]/70 hover:bg-[#561d11]/5 transition leading-snug">
          Categories
        </button>
        <button className="px-4 py-2.5 rounded-[10px] text-left font-brand font-medium text-base text-[#561d11]/70 hover:bg-[#561d11]/5 transition leading-snug">
          Timeline
        </button>
      </nav>

      <div className="flex-1" />

      {/* Bottom actions */}
      <div className="px-8 pb-8 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] font-brand text-sm font-medium text-[#561d11]/70 hover:bg-[#561d11]/5 transition">
          <SettingsIcon />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] font-brand text-sm font-medium text-[#561d11]/70 hover:bg-[#561d11]/5 transition"
        >
          <LogOutIcon />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardShell({ children, storyCount, totalWords, upcomingCount }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#f0eade]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[320px] shrink-0 bg-white border-r border-black/5 h-dvh sticky top-0 overflow-y-auto">
        <SidebarContent
          storyCount={storyCount}
          totalWords={totalWords}
          upcomingCount={upcomingCount}
        />
      </aside>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] bg-white z-50 overflow-y-auto transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          storyCount={storyCount}
          totalWords={totalWords}
          upcomingCount={upcomingCount}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Right side */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile sticky header */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-black/5 h-[60px] px-5 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-[#561d11]"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
          <p className="font-serif text-[#561d11] text-2xl tracking-[-0.6px] leading-none">
            Smriti
          </p>
          <Link
            href="/onboarding"
            aria-label="Add prompt"
            className="w-9 h-9 rounded-full bg-[#561d11] flex items-center justify-center text-[#f0eade] text-xl font-light leading-none"
          >
            +
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 px-5 md:px-12 pt-6 md:pt-10 pb-12 flex flex-col gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
