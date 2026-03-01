"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LANGUAGES } from "@/lib/languages";
import toast from "react-hot-toast";

type RecordingState = "idle" | "recording" | "transcribing" | "done";
type InputMode = "voice" | "text";

function MicIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [promptText, setPromptText] = useState<string | null>(null);
  const [existingStoryId, setExistingStoryId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [language, setLanguage] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [storyText, setStoryText] = useState("");
  const [saving, setSaving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const LANG_TO_SARVAM: Record<string, string> = {
    en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", ta: "ta-IN",
  };

  // Fetch prompt + any existing story
  useEffect(() => {
    async function load() {
      const [{ data: prompt, error: promptErr }, { data: story }] =
        await Promise.all([
          supabase.from("user_prompts").select("custom_text").eq("id", id).single(),
          supabase
            .from("user_stories")
            .select("id, content, language")
            .eq("prompt_id", id)
            .maybeSingle(),
        ]);

      if (promptErr || !prompt) {
        toast.error("Prompt not found.");
        router.push("/dashboard");
        return;
      }

      setPromptText(prompt.custom_text);

      if (story) {
        setExistingStoryId(story.id);
        setStoryText(story.content);
        setLanguage(story.language);
        setInputMode("text");
      }
    }

    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close language dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Recording timer
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingState === "idle" || recordingState === "done") setSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  async function handleStartRecording() {
    if (!language) {
      toast.error("Please select a language first.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone access denied. Please allow microphone access and try again.");
      return;
    }

    streamRef.current = stream;
    audioChunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.start();
    setRecordingState("recording");
  }

  function handleStopRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      setRecordingState("transcribing");

      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      const baseMimeType = mediaRecorder.mimeType.split(";")[0];
      const blob = new Blob(audioChunksRef.current, { type: baseMimeType });
      audioChunksRef.current = [];

      const form = new FormData();
      form.append("file", blob);
      const sarvamCode = LANG_TO_SARVAM[language];
      if (sarvamCode) form.append("language_code", sarvamCode);

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok || data.error) {
          const errMsg = typeof data.error === "string" ? data.error : "Transcription failed. Please try again.";
          toast.error(errMsg);
          setRecordingState("idle");
          return;
        }

        setStoryText(data.transcript);
        setInputMode("text");
        setRecordingState("done");
      } catch {
        toast.error("Transcription failed. Please try again.");
        setRecordingState("idle");
      }
    };

    mediaRecorder.stop();
  }

  function handleModeSwitch(mode: InputMode) {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setInputMode(mode);
    setRecordingState("idle");
    setSeconds(0);
  }

  async function handleSaveStory() {
    if (!storyText.trim()) return;
    if (!language) {
      toast.error("Please select a language.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("user_stories").upsert(
        {
          ...(existingStoryId ? { id: existingStoryId } : {}),
          user_id: user.id,
          prompt_id: id,
          content: storyText.trim(),
          language,
        },
        { onConflict: "user_id,prompt_id" }
      );

      if (error) throw error;

      toast.success(existingStoryId ? "Story updated!" : "Story saved!");
      router.push("/dashboard");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to save story.");
    } finally {
      setSaving(false);
    }
  }

  const selectedLang = LANGUAGES.find((l) => l.value === language);
  const isEditing = !!existingStoryId;

  return (
    <main className="min-h-dvh bg-[#f0eade] px-6 pt-12 pb-10 flex flex-col">
      {/* ── Back ── */}
      <button
        onClick={() => router.back()}
        className="mb-6 self-start flex items-center gap-1.5 font-brand text-sm text-[#561d11]/60 hover:text-[#561d11] transition"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* ── Logo ── */}
      <h1 className="mb-8 text-center font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#4c1815]">
        Smriti
      </h1>

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="font-serif text-[2rem] leading-tight tracking-[-0.03em] text-[#4c1815] mb-3">
          {isEditing ? "Edit your story" : "Share a memory"}
        </p>
        <p className="font-brand text-base text-[#561d11]/70 leading-relaxed">
          {isEditing
            ? "Update your story below and save when you're done."
            : "Record a short story in your own voice. Any language is welcome."}
        </p>
      </div>

      {/* ── Language selector ── */}
      <div className="mb-6">
        <p className="mb-2 font-brand font-bold text-sm text-[#561d11]">
          {inputMode === "voice"
            ? "What language would you like to record in?"
            : "What language will you write in?"}
        </p>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => recordingState === "idle" && setLangOpen((o) => !o)}
            disabled={recordingState !== "idle"}
            className="w-full h-[50px] rounded-[20px] border border-[#561d11]/20 bg-white px-5 flex items-center justify-between font-brand text-base transition focus:outline-none focus:border-[#561d11]/50 disabled:opacity-50"
          >
            <span className={selectedLang ? "text-[#561d11] font-medium" : "font-medium text-[#561d11]/40"}>
              {selectedLang
                ? `${selectedLang.native}${selectedLang.native !== selectedLang.label ? ` · ${selectedLang.label}` : ""}`
                : "Select a language"}
            </span>
            <svg
              className={`shrink-0 w-4 h-4 text-[#561d11]/60 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute left-0 right-0 top-[54px] rounded-[16px] border border-[#561d11]/20 bg-white shadow-lg z-10 overflow-hidden">
              {LANGUAGES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setLanguage(opt.value); setLangOpen(false); }}
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

      {/* ── Prompt card ── */}
      <div className="mb-6 rounded-[20px] bg-white border border-[#561d11]/10 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] px-5 py-4">
        <p className="font-brand font-medium text-[#561d11] text-[18px] leading-snug">
          {promptText ?? <span className="text-[#561d11]/30">Loading prompt…</span>}
        </p>
      </div>

      {/* ── Mode toggle ── */}
      <div className="mb-6 flex rounded-full bg-[#561d11]/10 p-1">
        <button
          type="button"
          onClick={() => handleModeSwitch("voice")}
          className={`flex-1 rounded-full py-2.5 font-brand text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            inputMode === "voice"
              ? "bg-[#561d11] text-[#f0eade] shadow-sm"
              : "text-[#561d11]/55 hover:text-[#561d11]/80"
          }`}
        >
          <MicIcon className="w-4 h-4" />
          Voice
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("text")}
          className={`flex-1 rounded-full py-2.5 font-brand text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            inputMode === "text"
              ? "bg-[#561d11] text-[#f0eade] shadow-sm"
              : "text-[#561d11]/55 hover:text-[#561d11]/80"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Write
        </button>
      </div>

      {/* ── Text input (write mode) ── */}
      {inputMode === "text" && (
        <div className="mb-6">
          <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="Write your story here…"
            rows={8}
            className="w-full rounded-[20px] border border-[#561d11]/20 bg-white px-5 py-4 font-brand text-base text-[#561d11] placeholder:text-[#561d11]/35 focus:outline-none focus:border-[#561d11]/50 transition resize-none leading-relaxed"
          />
          <p className="mt-1.5 text-right font-brand text-xs text-[#561d11]/35">
            {storyText.length} characters
          </p>
        </div>
      )}

      {/* ── Recording state visual (voice mode only) ── */}
      {inputMode === "voice" && recordingState === "recording" && (
        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="relative flex items-center justify-center w-24 h-24">
            <span className="absolute inset-0 rounded-full bg-[#561d11]/15 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-[#561d11]/10" />
            <div className="relative w-16 h-16 rounded-full bg-[#561d11] flex items-center justify-center z-10">
              <MicIcon className="text-[#f0eade]" />
            </div>
          </div>
          <p className="font-brand text-3xl font-medium tabular-nums tracking-widest text-[#561d11]">
            {formatTime(seconds)}
          </p>
        </div>
      )}

      {/* ── Transcribing visual ── */}
      {inputMode === "voice" && recordingState === "transcribing" && (
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#561d11]/10 flex items-center justify-center animate-pulse">
            <MicIcon className="text-[#561d11]/50" />
          </div>
          <p className="font-brand text-sm text-[#561d11]/60">Transcribing…</p>
        </div>
      )}

      {/* ── Voice idle hint ── */}
      {inputMode === "voice" && recordingState === "idle" && !language && (
        <p className="mb-6 text-center font-brand text-sm text-[#561d11]/40">
          Select a language above to start recording
        </p>
      )}

      {/* ── CTAs ── */}
      <div className="mt-auto flex flex-col gap-3">
        {/* Voice mode */}
        {inputMode === "voice" && recordingState === "idle" && (
          <button
            onClick={handleStartRecording}
            className="w-full h-14 rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <MicIcon className="text-[#f0eade]" />
            Start recording
          </button>
        )}

        {inputMode === "voice" && recordingState === "recording" && (
          <button
            onClick={handleStopRecording}
            className="w-full h-14 rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <StopIcon />
            Stop recording
          </button>
        )}

        {inputMode === "voice" && recordingState === "transcribing" && (
          <button
            disabled
            className="w-full h-14 rounded-full bg-[#561d11]/40 font-brand text-lg font-medium text-[#f0eade] flex items-center justify-center cursor-not-allowed"
          >
            Transcribing…
          </button>
        )}

        {/* Text mode */}
        {inputMode === "text" && (
          <button
            onClick={handleSaveStory}
            disabled={!storyText.trim() || !language || saving}
            className="w-full h-14 rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? "Saving…" : isEditing ? "Update story" : "Save story"}
          </button>
        )}

        <button className="text-center font-brand text-sm text-[#561d11]/40 underline underline-offset-4 transition hover:text-[#561d11]/60 py-1">
          Learn how it works
        </button>
      </div>

      {/* ── Footer ── */}
      <p className="mt-8 text-center font-brand text-xs text-[#561d11]/40">
        Powered by Smriti
      </p>
    </main>
  );
}
