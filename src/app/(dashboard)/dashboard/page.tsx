import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsButton from "./SettingsButton";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function schedulePrompts(prompts: { id: string; custom_text: string }[]) {
  const base = new Date();
  return prompts.map((p, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + 7 * (i + 1));
    return { ...p, scheduledFor: d };
  });
}

// ── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <rect
        x="2"
        y="3.5"
        width="16"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 2v3M14 2v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth redirect handled by (dashboard)/layout.tsx — user is always defined here
  const { data: rawPrompts } = await supabase
    .from("user_prompts")
    .select("id, custom_text, created_at")
    .eq("user_id", user!.id)
    .order("created_at");

  const scheduled = schedulePrompts(rawPrompts ?? []);
  const firstPromptDate = scheduled[0]?.scheduledFor;

  return (
    <main className="min-h-dvh bg-[#f0eade]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <SettingsButton />

        <h1 className="font-serif text-[#4c1815] text-[2.8rem] leading-none tracking-[-0.04em]">
          Smriti
        </h1>

        <Link
          href="/onboarding"
          aria-label="Add prompt"
          className="w-11 h-11 rounded-full bg-[#561d11] flex items-center justify-center text-[#f0eade] text-2xl font-light leading-none transition hover:bg-[#6b2517]"
        >
          +
        </Link>
      </div>

      <div className="px-6 pb-12 flex flex-col gap-8">
        {/* ── Your Chapters ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-brand font-bold text-2xl tracking-[-0.04em] text-[#561d11]">
              Your Chapters
            </h2>
            <span className="font-brand text-sm text-[#561d11]/60">
              0 recordings
            </span>
          </div>

          <div className="rounded-[20px] border-2 border-dashed border-[#561d11]/20 px-6 py-8 flex flex-col items-center gap-3">
            <p className="font-serif text-[#4c1815] text-2xl tracking-[-0.03em] text-center leading-tight">
              Your story starts here.
            </p>
            <p className="font-brand text-sm text-center text-[#561d11]/60 leading-relaxed max-w-[260px]">
              {firstPromptDate
                ? `Your first prompt arrives ${formatDate(firstPromptDate)}. We'll send it over WhatsApp — just reply to record your first chapter.`
                : "Your chapters will appear here after you respond to your first WhatsApp prompt."}
            </p>
          </div>
        </section>

        {/* ── Upcoming ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-brand font-bold text-2xl tracking-[-0.04em] text-[#561d11]">
              Upcoming
            </h2>
            <span className="font-brand text-sm text-[#561d11]/60">
              {scheduled.length} scheduled
            </span>
          </div>

          {scheduled.length === 0 ? (
            <p className="font-brand text-sm text-[#561d11]/60 text-center py-4">
              No prompts yet.{" "}
              <Link href="/onboarding" className="underline underline-offset-4">
                Add some to get started.
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {scheduled.map((prompt) => (
                <div
                  key={prompt.id}
                  className="rounded-[20px] bg-[#561d11] px-5 py-5"
                >
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="shrink-0 mt-0.5 text-[#f0eade]/60" />
                    <div>
                      <p className="font-brand font-medium text-[#f0eade] text-base leading-snug">
                        {prompt.custom_text}
                      </p>
                      <p className="mt-2 font-brand text-sm text-[#f0eade]/70">
                        Scheduled for {formatDate(prompt.scheduledFor)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/onboarding"
            className="mt-3 flex h-[58px] w-full items-center justify-center rounded-[20px] border border-[#561d11] bg-white font-brand text-base font-medium text-[#561d11] transition hover:bg-[#561d11]/5 active:scale-[0.99]"
          >
            + Add a prompt
          </Link>
        </section>
      </div>
    </main>
  );
}
