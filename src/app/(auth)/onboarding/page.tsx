"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LANGUAGES } from "@/lib/languages";
import toast from "react-hot-toast";

const SUGGESTED_PROMPTS = [
  "What was the home you grew up in like?",
  "What was your favorite food to eat when growing up?",
  "Who was your childhood best friend?",
  "What was your first job like?",
  "What is your happiest childhood memory?",
  "Tell me about a tradition your family had.",
];

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCurator = searchParams.get("mode") === "curator";

  const [language, setLanguage] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptImages, setPromptImages] = useState<Map<string, File>>(new Map());
  const [imagePreviews, setImagePreviews] = useState<Map<string, string>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePromptImageChange(promptText: string, file: File) {
    const oldUrl = imagePreviews.get(promptText);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    const newUrl = URL.createObjectURL(file);
    setPromptImages((prev) => new Map(prev).set(promptText, file));
    setImagePreviews((prev) => new Map(prev).set(promptText, newUrl));
  }

  async function saveToDb(userId: string, lang: string, prompts: string[]) {
    await supabase
      .from("users")
      .update({ preferred_language: lang })
      .eq("id", userId);

    if (prompts.length === 0) return;

    const promptRows = await Promise.all(
      prompts.map(async (text) => {
        const file = promptImages.get(text);
        let image_url: string | null = null;
        if (file) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${userId}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("prompt-images")
            .upload(path, file, { contentType: file.type });
          if (!error) {
            const { data } = supabase.storage
              .from("prompt-images")
              .getPublicUrl(path);
            image_url = data.publicUrl;
          }
        }
        return { user_id: userId, custom_text: text, image_url };
      })
    );

    const { error: insertError } = await supabase.from("user_prompts").insert(promptRows);
    if (insertError) throw insertError;
  }

  function togglePrompt(text: string) {
    const isRemoving = selected.has(text);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
    if (isRemoving) {
      const oldUrl = imagePreviews.get(text);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      setPromptImages((prev) => { const m = new Map(prev); m.delete(text); return m; });
      setImagePreviews((prev) => { const m = new Map(prev); m.delete(text); return m; });
    }
  }

  function addCustomPrompt() {
    const trimmed = customPrompt.trim();
    if (!trimmed) return;
    setSelected((prev) => new Set(prev).add(trimmed));
    setCustomPrompt("");
  }

  async function onSubmit() {
    if (!language) {
      toast.error("Please select a language.");
      return;
    }
    if (selected.size === 0) {
      toast.error("Please select at least one prompt.");
      return;
    }

    const prompts = [...selected];
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      await saveToDb(user.id, language, prompts);
      if (isCurator) {
        router.push("/dashboard?welcome=1");
      } else {
        router.push("/dashboard");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const selectedLang = LANGUAGES.find((l) => l.value === language);

  // Prompts that were typed in as custom (not from the suggested list)
  const customAdded = [...selected].filter(
    (p) => !SUGGESTED_PROMPTS.includes(p)
  );

  return (
    <>
      <h1 className="mb-6 text-center font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#4c1815]">
        Smriti
      </h1>

      <p className="mb-8 font-brand font-bold text-2xl leading-tight tracking-tight text-[#561d11]">
        {isCurator
          ? "Choose your prompts. We\u2019ll send them to your storyteller once a week over WhatsApp to collect their response."
          : "Choose your prompts. We\u2019ll send them to you once a week over WhatsApp to collect your response."}
      </p>

      {/* ── Language ── */}
      <div className="mb-8">
        <p className="mb-1.5 font-brand font-bold text-base text-[#561d11]">
          {isCurator
            ? "Which language will they respond in?"
            : "Which language will you respond in?"}
        </p>
        <p className="mb-4 font-brand text-sm leading-snug text-[#561d11]/70">
          {isCurator
            ? "They can answer in any Indian regional language they\u2019re comfortable with. We\u2019ll tailor their experience to support their preferred language."
            : "You can answer in any language you\u2019re comfortable with. We\u2019ll tailor your experience to support your preferred language."}
        </p>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            className="w-full h-12.5 rounded-4xl border border-[#561d11]/20 bg-white px-5 flex items-center justify-between font-brand text-base transition focus:outline-none focus:border-[#561d11]/50"
          >
            <span
              className={
                selectedLang
                  ? "text-[#561d11] font-medium"
                  : "font-medium text-[#561d11]/40"
              }
            >
              {selectedLang
                ? `${selectedLang.native}${selectedLang.native !== selectedLang.label ? ` · ${selectedLang.label}` : ""}`
                : "Select a language"}
            </span>
            <svg
              className={`shrink-0 w-4 h-4 text-[#561d11]/60 transition-transform duration-200 ${
                langOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 5.5L8 10.5L13 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute left-0 right-0 top-13.5 rounded-3xl border border-[#561d11]/20 bg-white shadow-lg z-10 overflow-hidden">
              {LANGUAGES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.value);
                    setLangOpen(false);
                  }}
                  className={`w-full px-5 py-3 text-left transition hover:bg-[#561d11]/5 ${
                    language === opt.value ? "bg-[#561d11]/5" : ""
                  }`}
                >
                  <span className={`block font-brand text-base font-medium ${language === opt.value ? "text-[#561d11]" : "text-[#561d11]/80"}`}>
                    {opt.native}
                  </span>
                  {opt.native !== opt.label && (
                    <span className="block font-brand text-xs text-[#561d11]/45 mt-0.5">
                      {opt.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Custom prompt ── */}
      <div className="mb-8">
        <p className="mb-2 font-brand font-bold text-base text-[#561d11]">
          Add a custom prompt
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomPrompt();
              }
            }}
            placeholder="Type a question you want to ask..."
            className="flex-1 h-12.5 rounded-4xl border border-[#561d11]/20 bg-white px-5 font-brand text-base text-[#561d11] placeholder:text-[#561d11]/40 placeholder:font-medium focus:outline-none focus:border-[#561d11]/50 transition"
          />
          {customPrompt.trim() && (
            <button
              type="button"
              onClick={addCustomPrompt}
              className="h-12.5 px-5 rounded-4xl bg-[#561d11] text-[#f0eade] font-brand text-sm font-medium transition hover:bg-[#6b2517] active:scale-[0.99]"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* ── Suggested prompts ── */}
      <div className="mb-10">
        <p className="mb-3 font-brand font-bold text-base text-[#561d11]">
          Suggested Prompts
        </p>
        <div className="flex flex-col gap-2">
          {SUGGESTED_PROMPTS.map((prompt, index) => {
            const isSelected = selected.has(prompt);
            const preview = imagePreviews.get(prompt);
            return (
              <div key={prompt} className="relative">
                <button
                  type="button"
                  onClick={() => togglePrompt(prompt)}
                  className={`w-full rounded-4xl px-5 py-3.5 text-left font-brand text-[18px] font-medium leading-snug transition border ${
                    isSelected
                      ? "bg-[#561d11] border-[#561d11] text-[#f0eade] pr-12"
                      : "bg-white border-[#561d11]/20 text-[#561d11] hover:border-[#561d11]/40"
                  }`}
                >
                  {prompt}
                </button>
                {isSelected && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id={`img-s-${index}`}
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePromptImageChange(prompt, file);
                      }}
                    />
                    <label
                      htmlFor={`img-s-${index}`}
                      className="absolute top-2 right-2 z-10 cursor-pointer"
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Prompt image"
                          className="w-8 h-8 rounded-lg object-cover border border-[#f0eade]/40"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f0eade]/15 text-[#f0eade]/70 hover:bg-[#f0eade]/25 transition">
                          <CameraIcon />
                        </span>
                      )}
                    </label>
                  </>
                )}
              </div>
            );
          })}

          {/* User-added custom prompts appear here (always selected) */}
          {customAdded.map((prompt, index) => {
            const preview = imagePreviews.get(prompt);
            return (
              <div key={prompt} className="relative">
                <button
                  type="button"
                  onClick={() => togglePrompt(prompt)}
                  className="w-full rounded-4xl px-5 py-3.5 pr-12 text-left font-brand text-[18px] font-medium leading-snug transition border bg-[#561d11] border-[#561d11] text-[#f0eade] hover:bg-[#6b2517]"
                >
                  {prompt}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  id={`img-c-${index}`}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePromptImageChange(prompt, file);
                  }}
                />
                <label
                  htmlFor={`img-c-${index}`}
                  className="absolute top-2 right-2 z-10 cursor-pointer"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Prompt image"
                      className="w-8 h-8 rounded-lg object-cover border border-[#f0eade]/40"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f0eade]/15 text-[#f0eade]/70 hover:bg-[#f0eade]/25 transition">
                      <CameraIcon />
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mx-auto mb-6 flex h-12 w-full max-w-[291px] items-center justify-center rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? "Saving…" : isCurator ? "Submit & send prompt" : "Submit & receive prompt"}
      </button>
    </>
  );
}
