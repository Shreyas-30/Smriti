"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Props = {
  storyId: string;
  promptId: string;
  storyTitle: string;
  onClose: () => void;
};

export default function DeleteStoryDialog({ storyId, promptId, storyTitle, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleDelete(mode: "story" | "both") {
    setDeleting(true);
    try {
      const { error: storyError } = await supabase
        .from("user_stories")
        .delete()
        .eq("id", storyId);
      if (storyError) throw storyError;

      if (mode === "both") {
        const { error: promptError } = await supabase
          .from("user_prompts")
          .delete()
          .eq("id", promptId);
        if (promptError) throw promptError;
      }

      toast.success(mode === "both" ? "Story and prompt deleted." : "Story deleted.");
      onClose();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={!deleting ? onClose : undefined} />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-sm bg-[#f0eade] rounded-3xl p-6">
        <h3 className="font-serif text-[#4c1815] text-[22px] leading-tight tracking-[-0.5px] mb-2">
          Delete this story?
        </h3>
        <p className="font-brand text-sm text-[#561d11]/60 mb-1 leading-relaxed">
          <span className="font-medium text-[#561d11]/80">"{storyTitle}"</span>
        </p>
        <p className="font-brand text-sm text-[#561d11]/60 mb-6 leading-relaxed">
          Would you like to delete just your recorded story, or remove the prompt too?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleDelete("story")}
            disabled={deleting}
            className="w-full h-12 rounded-full border border-[#561d11]/20 bg-white font-brand text-sm font-medium text-[#561d11] hover:bg-[#561d11]/5 transition disabled:opacity-40"
          >
            Delete story, keep prompt
          </button>
          <button
            onClick={() => handleDelete("both")}
            disabled={deleting}
            className="w-full h-12 rounded-full bg-[#561d11] font-brand text-sm font-medium text-[#f0eade] hover:bg-[#6b2517] transition disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete story & prompt"}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="w-full h-10 rounded-full font-brand text-sm text-[#561d11]/45 hover:text-[#561d11]/70 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
