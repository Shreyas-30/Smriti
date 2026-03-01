import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardShell from "./DashboardShell";
import SuccessOverlay from "./SuccessOverlay";
import FeaturedCard from "./FeaturedCard";
import ChapterCards, { type Chapter } from "./ChapterCards";
import PromptCards from "./PromptCards";

// ── Helpers ─────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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

  // Build lookup: promptId → story
  type StoryRow = { id: string; content: string; language: string; updatedAt: string };
  const storyMap = new Map<string, StoryRow>(
    (rawStories ?? []).map((s) => [
      s.prompt_id,
      { id: s.id, content: s.content, language: s.language, updatedAt: s.updated_at },
    ])
  );

  // Split prompts: those with a saved story become chapters; rest stay upcoming
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

  // Stats
  const totalWords = chapters.reduce((sum, c) => sum + wordCount(c.story.content), 0);

  // Featured = most recently updated; recent = the rest
  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(b.story.updatedAt).getTime() - new Date(a.story.updatedAt).getTime()
  );
  const featured = sortedChapters[0] ?? null;
  const recent = sortedChapters.slice(1);

  return (
    <DashboardShell
      storyCount={chapters.length}
      totalWords={totalWords}
      upcomingCount={upcoming.length}
    >
      <SuccessOverlay />

      {/* ── Your Stories header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[#561d11] text-[40px] md:text-[48px] leading-none tracking-[-1.2px]">
            Your Stories
          </h2>
          {chapters.length > 0 && (
            <p className="font-brand text-[#561d11]/50 text-base mt-2">
              {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"} written,{" "}
              {totalWords.toLocaleString()} words preserved
            </p>
          )}
        </div>

        {/* Desktop: New Story button */}
        <Link
          href="/onboarding"
          className="hidden md:flex items-center gap-2 px-5 h-11 rounded-full bg-[#561d11] font-brand text-sm font-medium text-white hover:bg-[#6b2517] transition shrink-0"
        >
          <span className="text-lg font-light leading-none">+</span>
          New Story
        </Link>
      </div>

      {/* ── Featured story or empty state ── */}
      {featured ? (
        <FeaturedCard chapter={featured} />
      ) : (
        <div className="rounded-[24px] border-2 border-dashed border-[#561d11]/20 px-6 py-12 flex flex-col items-center gap-3">
          <p className="font-serif text-[#4c1815] text-2xl tracking-[-0.03em] text-center leading-tight">
            Your story starts here.
          </p>
          <p className="font-brand text-sm text-center text-[#561d11]/60 leading-relaxed max-w-[260px]">
            {upcoming.length > 0
              ? "Tap a prompt below to record or write your first chapter."
              : "Add some prompts to get started on your story."}
          </p>
          {upcoming.length === 0 && (
            <Link
              href="/onboarding"
              className="mt-2 flex h-10 w-full max-w-[200px] items-center justify-center rounded-full bg-[#561d11] font-brand text-sm font-medium text-[#f0eade] hover:bg-[#6b2517] transition"
            >
              + Add prompts
            </Link>
          )}
        </div>
      )}

      {/* ── Recent Stories grid ── */}
      {recent.length > 0 && (
        <section>
          <h3 className="font-serif text-[#561d11] text-[30px] leading-none tracking-[-0.75px] mb-6">
            Recent Stories
          </h3>
          <ChapterCards chapters={recent} />
        </section>
      )}

      {/* ── Upcoming Prompts ── */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-[#561d11] text-[30px] leading-none tracking-[-0.75px]">
              Upcoming Prompts
            </h3>
            <span className="font-brand text-sm text-[#561d11]/50">
              {upcoming.length} scheduled
            </span>
          </div>
          <PromptCards prompts={upcoming} />
          <Link
            href="/onboarding"
            className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[16px] border border-[#561d11] bg-white font-brand text-sm font-medium text-[#561d11] hover:bg-[#561d11]/5 transition active:scale-[0.99]"
          >
            + Add a prompt
          </Link>
        </section>
      )}
    </DashboardShell>
  );
}
