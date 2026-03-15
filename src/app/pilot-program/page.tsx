"use client";

import { useState } from "react";
import Link from "next/link";

const NOISE_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

type FormData = {
  email: string;
  age: string;
  frequency: string;
  frequencyOther: string;
  importance: number | null;
  hasDocumented: string;
  captureMethod: string[];
  captureMethodOther: string;
  difficulties: string[];
  difficultiesOther: string;
  preferredFormat: string[];
  preferredFormatOther: string;
  purchaseIntent: string;
  anythingElse: string;
  earlyAccess: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL: FormData = {
  email: "",
  age: "",
  frequency: "",
  frequencyOther: "",
  importance: null,
  hasDocumented: "",
  captureMethod: [],
  captureMethodOther: "",
  difficulties: [],
  difficultiesOther: "",
  preferredFormat: [],
  preferredFormatOther: "",
  purchaseIntent: "",
  anythingElse: "",
  earlyAccess: "",
};

const AGE_OPTIONS = ["< 18", "18–24", "25–40", "40–55", "> 55"];

const FREQUENCY_OPTIONS = [
  "Very frequently (Every other week)",
  "Only on special occasions",
  "Rarely",
  "Other",
];

const CAPTURE_METHOD_OPTIONS = [
  "It is not really important to me to document",
  "I would like to but they are not yet documented, live mostly in conversation",
  "Notes or journals",
  "Voice notes or video recordings",
  "WhatsApp messages / family group chats",
  "Printed albums or scrapbooks",
  "Personally written or ghostwritten memoir",
  "Other",
];

const DIFFICULTY_OPTIONS = [
  "They avoid talking about the past",
  "Conversations become emotionally heavy or uncomfortable",
  "Language barriers",
  'Lack of time or the "right moment"',
  "I don't know how to ask without it feeling awkward",
  "I've never tried to ask",
  "Nothing — they're generally open to sharing",
  "Other",
];

const FORMAT_OPTIONS = [
  "Book",
  "Podcast",
  "Website/Blog",
  "Digital Photo Album",
  "Other",
];

const PURCHASE_INTENT_OPTIONS = [
  "I would actively use and likely pay for it",
  "I'd want it as a gift for parents/grandparents",
  "I like the idea, but wouldn't personally use it",
  "Not really interested",
];

// ── Shared style helpers ──────────────────────────────────────────────────────

const SANS = { fontFamily: "var(--font-instrument-sans)" };
const SERIF = { fontFamily: "var(--font-instrument-serif)" };

const inputBase =
  "w-full px-4 py-3 rounded-lg border border-[#d4c9b8] bg-white/60 text-[#3d1a0e] placeholder:text-[#5c2a18]/40 focus:outline-none focus:border-[#5c2a18] transition-colors";

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <span
      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
        selected
          ? "border-[#3d1a0e] bg-[#3d1a0e]"
          : "border-[#b5a89a] group-hover:border-[#5c2a18]"
      }`}
    >
      {selected && <span className="w-2 h-2 rounded-full bg-white" />}
    </span>
  );
}

function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
        checked
          ? "border-[#3d1a0e] bg-[#3d1a0e]"
          : "border-[#b5a89a] group-hover:border-[#5c2a18]"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function OptionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[#3d1a0e] leading-snug"
      style={{ ...SANS, fontSize: "15px" }}
    >
      {children}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-sm mt-2">{msg}</p>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/50 rounded-2xl p-6 border border-[#e5ddd3]">
      {children}
    </div>
  );
}

function QuestionLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <p className="text-[#3d1a0e] font-medium mb-4" style={SANS}>
      {children}
      {!optional && <span className="text-[#5c2a18] ml-0.5"> *</span>}
      {optional && (
        <span className="text-[#5c2a18]/50 font-normal ml-2 text-sm">
          (optional)
        </span>
      )}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleCheckbox(
    key: "captureMethod" | "difficulties" | "preferredFormat",
    value: string,
  ) {
    setForm((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.age) e.age = "Please select your age range.";
    if (!form.frequency) e.frequency = "Please select an option.";
    if (form.frequency === "Other" && !form.frequencyOther.trim())
      e.frequencyOther = "Please specify.";
    if (form.importance === null) e.importance = "Please select a value.";
    if (!form.hasDocumented) e.hasDocumented = "Please select an option.";
    if (form.captureMethod.length === 0)
      e.captureMethod = "Please select at least one option.";
    if (form.captureMethod.includes("Other") && !form.captureMethodOther.trim())
      e.captureMethodOther = "Please specify.";
    if (form.difficulties.length === 0)
      e.difficulties = "Please select at least one option.";
    if (form.difficulties.includes("Other") && !form.difficultiesOther.trim())
      e.difficultiesOther = "Please specify.";
    if (form.preferredFormat.length === 0)
      e.preferredFormat = "Please select at least one option.";
    if (
      form.preferredFormat.includes("Other") &&
      !form.preferredFormatOther.trim()
    )
      e.preferredFormatOther = "Please specify.";
    if (!form.purchaseIntent) e.purchaseIntent = "Please select an option.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{ backgroundColor: "#f2ede4" }}
      >
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: "180px 180px",
            opacity: 0.065,
            mixBlendMode: "multiply",
          }}
        />
        <div className="relative text-center max-w-md">
          <h1
            className="text-[#3d1a0e] mb-4"
            style={{ ...SERIF, fontSize: "clamp(36px, 5vw, 52px)" }}
          >
            Thank you!
          </h1>
          <p
            className="text-[#5c2a18] leading-relaxed mb-8"
            style={{ ...SANS, fontSize: "clamp(15px, 1.3vw, 18px)" }}
          >
            Your responses have been recorded. We truly appreciate you taking
            the time to help shape Smriti.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3d1a0e", ...SANS }}
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: "#f2ede4" }} className="min-h-screen">
      {/* Noise overlay */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: NOISE_URL,
          backgroundSize: "180px 180px",
          opacity: 0.065,
          mixBlendMode: "multiply",
        }}
      />

      {/* Header */}
      <header className="relative pt-12 pb-10 px-6 text-center border-b border-[#e5ddd3]">
        <Link
          href="/"
          className="absolute top-6 left-6 text-[#3d1a0e] hover:opacity-70 transition-opacity"
          style={{ ...SERIF, fontSize: "22px" }}
        >
          Smriti
        </Link>
        <h1
          className="text-[#3d1a0e] mb-3"
          style={{ ...SERIF, fontSize: "clamp(28px, 4vw, 44px)" }}
        >
          Capturing Family Stories
        </h1>
        <p
          className="text-[#5c2a18] max-w-xl mx-auto leading-relaxed"
          style={{ ...SANS, fontSize: "clamp(14px, 1.2vw, 16px)" }}
        >
          I&apos;m working on a project to understand how south asian families
          document the rich cultural histories of their ancestors and loved ones.
          This is a very short (3–5 minutes) anonymous survey to gather data on
          this topic. Thank you for taking the time to fill it out!
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24"
        noValidate
      >
        <div className="space-y-6">
          {/* Q1 — Email */}
          <Card>
            <QuestionLabel>Email</QuestionLabel>
            <input
              type="email"
              className={inputBase}
              style={SANS}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="your@email.com"
            />
            <FieldError msg={errors.email} />
          </Card>

          {/* Q2 — Age */}
          <Card>
            <QuestionLabel>How old are you?</QuestionLabel>
            <div className="space-y-3">
              {AGE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="age"
                    value={opt}
                    checked={form.age === opt}
                    onChange={() => setField("age", opt)}
                    className="sr-only"
                  />
                  <RadioCircle selected={form.age === opt} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            <FieldError msg={errors.age} />
          </Card>

          {/* Q3 — Frequency */}
          <Card>
            <QuestionLabel>
              How often do you engage in conversations with your family about
              their past?
            </QuestionLabel>
            <div className="space-y-3">
              {FREQUENCY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={opt}
                    checked={form.frequency === opt}
                    onChange={() => setField("frequency", opt)}
                    className="sr-only"
                  />
                  <RadioCircle selected={form.frequency === opt} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            {form.frequency === "Other" && (
              <input
                type="text"
                className={`${inputBase} mt-4`}
                style={SANS}
                placeholder="Please specify..."
                value={form.frequencyOther}
                onChange={(e) => setField("frequencyOther", e.target.value)}
              />
            )}
            <FieldError msg={errors.frequency} />
            <FieldError msg={errors.frequencyOther} />
          </Card>

          {/* Q4 — Importance scale */}
          <Card>
            <QuestionLabel>
              On a scale of 1–5, how important is it for you to preserve
              anecdotes your family share with you?
            </QuestionLabel>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setField("importance", n)}
                  className="w-12 h-12 rounded-full border-2 font-medium transition-colors flex items-center justify-center"
                  style={{
                    ...SANS,
                    fontSize: "16px",
                    borderColor:
                      form.importance === n ? "#3d1a0e" : "#d4c9b8",
                    backgroundColor:
                      form.importance === n ? "#3d1a0e" : "transparent",
                    color: form.importance === n ? "white" : "#5c2a18",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 max-w-[15rem]">
              <span
                className="text-[#5c2a18]/60 text-xs"
                style={SANS}
              >
                Not important
              </span>
              <span
                className="text-[#5c2a18]/60 text-xs"
                style={SANS}
              >
                Extremely important
              </span>
            </div>
            <FieldError msg={errors.importance} />
          </Card>

          {/* Q5 — Has documented */}
          <Card>
            <QuestionLabel>
              Have you ever considered or tried to document personal stories or
              traditions from your parents/grandparents/extended family&apos;s
              lives?
            </QuestionLabel>
            <div className="space-y-3">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="hasDocumented"
                    value={opt}
                    checked={form.hasDocumented === opt}
                    onChange={() => setField("hasDocumented", opt)}
                    className="sr-only"
                  />
                  <RadioCircle selected={form.hasDocumented === opt} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            <FieldError msg={errors.hasDocumented} />
          </Card>

          {/* Q6 — Capture methods (multi-select) */}
          <Card>
            <QuestionLabel>
              When stories or memories are shared in your family, how are they
              usually captured, if at all?
            </QuestionLabel>
            <div className="space-y-3">
              {CAPTURE_METHOD_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={form.captureMethod.includes(opt)}
                    onChange={() => toggleCheckbox("captureMethod", opt)}
                    className="sr-only"
                  />
                  <CheckSquare checked={form.captureMethod.includes(opt)} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            {form.captureMethod.includes("Other") && (
              <input
                type="text"
                className={`${inputBase} mt-4`}
                style={SANS}
                placeholder="Please specify..."
                value={form.captureMethodOther}
                onChange={(e) => setField("captureMethodOther", e.target.value)}
              />
            )}
            <FieldError msg={errors.captureMethod} />
            <FieldError msg={errors.captureMethodOther} />
          </Card>

          {/* Q7 — Difficulties (multi-select) */}
          <Card>
            <QuestionLabel>
              When you&apos;ve tried to get family members (especially elders)
              to share stories, what has made this difficult?
            </QuestionLabel>
            <div className="space-y-3">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={form.difficulties.includes(opt)}
                    onChange={() => toggleCheckbox("difficulties", opt)}
                    className="sr-only"
                  />
                  <CheckSquare checked={form.difficulties.includes(opt)} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            {form.difficulties.includes("Other") && (
              <input
                type="text"
                className={`${inputBase} mt-4`}
                style={SANS}
                placeholder="Please specify..."
                value={form.difficultiesOther}
                onChange={(e) => setField("difficultiesOther", e.target.value)}
              />
            )}
            <FieldError msg={errors.difficulties} />
            <FieldError msg={errors.difficultiesOther} />
          </Card>

          {/* Q8 — Preferred format (multi-select) */}
          <Card>
            <QuestionLabel>
              If you were able to easily preserve these memories, what kind of
              format would you like your keepsake to be?
            </QuestionLabel>
            <div className="space-y-3">
              {FORMAT_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={form.preferredFormat.includes(opt)}
                    onChange={() => toggleCheckbox("preferredFormat", opt)}
                    className="sr-only"
                  />
                  <CheckSquare checked={form.preferredFormat.includes(opt)} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            {form.preferredFormat.includes("Other") && (
              <input
                type="text"
                className={`${inputBase} mt-4`}
                style={SANS}
                placeholder="Please specify..."
                value={form.preferredFormatOther}
                onChange={(e) =>
                  setField("preferredFormatOther", e.target.value)
                }
              />
            )}
            <FieldError msg={errors.preferredFormat} />
            <FieldError msg={errors.preferredFormatOther} />
          </Card>

          {/* Q9 — Purchase intent */}
          <Card>
            <QuestionLabel>
              If you found a product that helps you meaningfully document family
              stories, which option would describe you best?
            </QuestionLabel>
            <div className="space-y-3">
              {PURCHASE_INTENT_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="purchaseIntent"
                    value={opt}
                    checked={form.purchaseIntent === opt}
                    onChange={() => setField("purchaseIntent", opt)}
                    className="sr-only"
                  />
                  <RadioCircle selected={form.purchaseIntent === opt} />
                  <OptionLabel>{opt}</OptionLabel>
                </label>
              ))}
            </div>
            <FieldError msg={errors.purchaseIntent} />
          </Card>

          {/* Q10 — Anything else (optional) */}
          <Card>
            <QuestionLabel optional>
              Is there anything else you think is important to mention?
            </QuestionLabel>
            <textarea
              rows={4}
              className={`${inputBase} resize-y`}
              style={SANS}
              placeholder="Your thoughts..."
              value={form.anythingElse}
              onChange={(e) => setField("anythingElse", e.target.value)}
            />
          </Card>

          {/* Q11 — Early access (optional) */}
          <Card>
            <p className="text-[#3d1a0e] font-medium mb-1" style={SANS}>
              Early access sign-up
              <span className="text-[#5c2a18]/50 font-normal ml-2 text-sm">
                (optional)
              </span>
            </p>
            <p
              className="text-[#5c2a18]/70 text-sm mb-4 leading-relaxed"
              style={SANS}
            >
              We are launching our pilot program soon! If you want to start
              capturing your heritage with a free early trial, leave your
              contact info and we&apos;ll reach out.
            </p>
            <textarea
              rows={3}
              className={`${inputBase} resize-y`}
              style={SANS}
              placeholder="Name, email, phone number..."
              value={form.earlyAccess}
              onChange={(e) => setField("earlyAccess", e.target.value)}
            />
          </Card>

          {/* Submit */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full max-w-sm py-4 rounded-full text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#3d1a0e", ...SANS, fontSize: "17px" }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(INITIAL);
                setErrors({});
              }}
              className="text-[#5c2a18]/60 text-sm underline underline-offset-4 hover:text-[#5c2a18] transition-colors"
              style={SANS}
            >
              Clear form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
