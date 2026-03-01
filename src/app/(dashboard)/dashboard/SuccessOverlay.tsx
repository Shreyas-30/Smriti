"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessOverlayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const shouldShow = searchParams.get("welcome") === "1";

  useEffect(() => {
    if (shouldShow) {
      setMounted(true);
      const timer = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  function handleContinue() {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      router.replace("/dashboard");
    }, 400);
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.45 : 0})`,
        transition: "background-color 0.35s ease",
      }}
    >
      <div
        className="w-full max-w-sm rounded-[32px] bg-[#f0eade] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.95)",
          transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="flex flex-col items-center gap-5 px-8 pt-8 pb-8">
          {/* Send icon circle */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.5)",
              transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              transitionDelay: visible ? "120ms" : "0ms",
            }}
            className="w-24 h-24 rounded-full bg-[#561d11] flex items-center justify-center"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="#f0eade"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="#f0eade"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title + subtitle */}
          <div
            className="text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: visible ? "170ms" : "0ms",
            }}
          >
            <p className="font-serif text-[2rem] leading-tight tracking-[-0.04em] text-[#4c1815]">
              Your first prompt is on its way!
            </p>
            <p className="mt-2 font-brand text-sm text-[#561d11]/60">
              Sent via WhatsApp
            </p>
          </div>

          {/* Info box */}
          <div
            className="w-full rounded-[20px] bg-white/60 border border-[#561d11]/10 px-5 py-4 text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: visible ? "220ms" : "0ms",
            }}
          >
            <p className="font-brand text-[15px] text-[#561d11] leading-relaxed">
              Your storyteller will receive a WhatsApp message with their first
              prompt. They can record their response right away—no app download
              or log in needed!
            </p>
          </div>

          {/* Bullet points */}
          <div
            className="w-full flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: visible ? "270ms" : "0ms",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-[5px] shrink-0 w-2 h-2 rounded-full bg-[#561d11]" />
              <p className="font-brand text-[15px] text-[#561d11] leading-snug">
                Next prompts will be sent once a week
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-[5px] shrink-0 w-2 h-2 rounded-full bg-[#561d11]" />
              <p className="font-brand text-[15px] text-[#561d11] leading-snug">
                You&apos;ll be notified when they record a story
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-14 rounded-full bg-[#561d11] font-brand text-base font-medium text-[#f0eade] shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] hover:bg-[#6b2517] active:scale-[0.99] transition-colors"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition:
                "opacity 0.45s ease, transform 0.45s ease, background-color 0.15s ease, scale 0.1s ease",
              transitionDelay: visible ? "320ms" : "0ms",
            }}
          >
            Continue to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessOverlay() {
  return (
    <Suspense>
      <SuccessOverlayInner />
    </Suspense>
  );
}
