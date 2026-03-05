import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractTitle } from "@/lib/storyUtils";
import StoryAudioPlayer from "./StoryAudioPlayer";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: prompt } = await supabase
    .from("user_prompts")
    .select("custom_text")
    .eq("id", id)
    .maybeSingle();

  const { data: story } = await supabase
    .from("user_stories")
    .select("title, content")
    .eq("prompt_id", id)
    .maybeSingle();

  if (!prompt || !story) return { title: "Story · Smriti" };

  const title = story.title || extractTitle(story.content);

  return {
    title: `${title} · Smriti`,
    description: prompt.custom_text,
    openGraph: {
      title,
      description: prompt.custom_text,
    },
  };
}

export default async function PublicStoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: prompt }, { data: story }] = await Promise.all([
    supabase
      .from("user_prompts")
      .select("custom_text, image_url")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("user_stories")
      .select("title, content, audio_url, language")
      .eq("prompt_id", id)
      .maybeSingle(),
  ]);

  if (!prompt || !story) notFound();

  const title = story.title || extractTitle(story.content);

  return (
    <main className="min-h-dvh bg-[#f0eade]">
      {/* ── Top bar ── */}
      <div className="border-b border-[#561d11]/10 bg-[#f0eade]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-[1.4rem] leading-none tracking-[-0.04em] text-[#4c1815]"
          >
            Smriti
          </Link>
          <span className="font-brand text-xs text-[#561d11]/40 uppercase tracking-wide">
            A shared memory
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* Prompt label + question */}
        <div>
          <p className="font-brand text-xs font-medium text-[#561d11]/40 uppercase tracking-widest mb-3">
            Prompt
          </p>
          <p className="font-brand text-base text-[#561d11]/60 leading-relaxed">
            {prompt.custom_text}
          </p>
        </div>

        {/* Prompt image */}
        {prompt.image_url && (
          <div className="rounded-3xl overflow-hidden bg-[#561d11]/5">
            <Image
              src={prompt.image_url}
              alt="Prompt image"
              width={0}
              height={0}
              sizes="(max-width: 672px) 100vw, 672px"
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-[#4c1815] text-[2.5rem] md:text-[3rem] leading-none tracking-[-0.04em]">
          {title}
        </h1>

        {/* Audio player */}
        {story.audio_url && <StoryAudioPlayer src={story.audio_url} />}

        {/* Story text */}
        <div className="bg-white rounded-[20px] border border-[#561d11]/8 px-7 py-6">
          <p className="font-brand text-[17px] text-[#561d11]/85 leading-[1.75] whitespace-pre-wrap">
            {story.content}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="max-w-2xl mx-auto px-6 pb-12 flex flex-col items-center gap-3">
        <div className="w-full border-t border-[#561d11]/10 mb-6" />
        <p className="font-brand text-sm text-[#561d11]/40">
          Preserved with{" "}
          <a
            href="https://www.smritistories.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[#561d11]/60 transition"
          >
            Smriti
          </a>
        </p>
      </div>
    </main>
  );
}
