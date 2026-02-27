import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsButton from "./SettingsButton";
import PromptCards from "./PromptCards";
import ChapterCards, { type Chapter } from "./ChapterCards";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Schedule only prompts that don't yet have a story
function scheduleUpcoming(prompts: { id: string; custom_text: string }[]) {
  const base = new Date();
  return prompts.map((p, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + 7 * (i + 1));
    return { ...p, scheduledFor: d.toISOString() };
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rawPrompts }, { data: rawStories }] = await Promise.all([
    supabase
      .from("user_prompts")
      .select("id, custom_text, created_at")
      .eq("user_id", user!.id)
      .order("created_at"),
    supabase
      .from("user_stories")
      .select("id, prompt_id, content, language, updated_at")
      .eq("user_id", user!.id),
  ]);

  // Build a lookup: promptId → story
  type StoryRow = { id: string; content: string; language: string; updatedAt: string };
  const storyMap = new Map<string, StoryRow>(
    (rawStories ?? []).map((s) => [
      s.prompt_id,
      { id: s.id, content: s.content, language: s.language, updatedAt: s.updated_at },
    ])
  );

  // Split prompts: those with a saved story become chapters; the rest stay upcoming
  const chapters: Chapter[] = [];
  const promptsWithoutStory: { id: string; custom_text: string }[] = [];

  for (const p of rawPrompts ?? []) {
    const story = storyMap.get(p.id);
    if (story) {
      chapters.push({
        id: p.id,
        custom_text: p.custom_text,
        story: { content: story.content, language: story.language, updatedAt: story.updatedAt },
      });
    } else {
      promptsWithoutStory.push(p);
    }
  }

  const upcoming = scheduleUpcoming(promptsWithoutStory);
  const firstUpcomingDate = upcoming[0]?.scheduledFor;

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
              {chapters.length} {chapters.length === 1 ? "story" : "stories"}
            </span>
          </div>

          {chapters.length > 0 ? (
            <ChapterCards chapters={chapters} />
          ) : (
            <div className="rounded-[20px] border-2 border-dashed border-[#561d11]/20 px-6 py-8 flex flex-col items-center gap-3">
              <p className="font-serif text-[#4c1815] text-2xl tracking-[-0.03em] text-center leading-tight">
                Your story starts here.
              </p>
              <p className="font-brand text-sm text-center text-[#561d11]/60 leading-relaxed max-w-[260px]">
                {firstUpcomingDate
                  ? `Your first prompt arrives ${formatDate(new Date(firstUpcomingDate))}. Tap a prompt below to record or write your first chapter.`
                  : "Your chapters will appear here once you've responded to a prompt."}
              </p>
            </div>
          )}
        </section>

        {/* ── Upcoming ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-brand font-bold text-2xl tracking-[-0.04em] text-[#561d11]">
              Upcoming
            </h2>
            <span className="font-brand text-sm text-[#561d11]/60">
              {upcoming.length} scheduled
            </span>
          </div>

          <PromptCards prompts={upcoming} />

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
