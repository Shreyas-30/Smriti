"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-[50px] rounded-[20px] border border-[#561d11]/30 bg-transparent px-4 " +
  "font-brand text-lg text-[#561d11] " +
  "placeholder:text-[#561d11]/45 placeholder:font-medium " +
  "focus:outline-none focus:border-[#561d11]/60 transition";

const labelCls = "block font-brand font-bold text-[#561d11] text-base mb-2";

// ── Collage photos (right panel, desktop only) ────────────────────────────────

const PHOTOS = [
  // large landscape — top-left anchor
  {
    src: "/landing/photo-1.png",
    alt: "Family photo",
    ar: "948/664",
    cls: "absolute top-[5%] left-[4%] w-[54%] -rotate-[4deg]",
    grayscale: false,
  },
  // portrait — top-right, overlapping photo-1
  {
    src: "/landing/photo-13.png",
    alt: "Portrait photo",
    ar: "804/1072",
    cls: "absolute top-[2%] right-[3%] w-[33%] rotate-[5deg]",
    grayscale: false,
  },
  // landscape — bottom-left
  {
    src: "/landing/photo-5.png",
    alt: "Memory photo",
    ar: "648/472",
    cls: "absolute bottom-[13%] left-[2%] w-[47%] rotate-[2deg]",
    grayscale: false,
  },
  // tall portrait — bottom-right
  {
    src: "/landing/photo-7.png",
    alt: "Portrait photo",
    ar: "936/1300",
    cls: "absolute bottom-[4%] right-[4%] w-[29%] -rotate-[3deg]",
    grayscale: true,
  },
  // stamp — decorative
  {
    src: "/landing/stamp.png",
    alt: "Vintage stamp",
    ar: "232/278",
    cls: "absolute bottom-[37%] right-[30%] w-[10%] rotate-[8deg]",
    grayscale: false,
  },
] as const;

// ── Inner component (uses useSearchParams — needs Suspense) ───────────────────

function LoginContent() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  const next = params.get("next") || "/dashboard";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      router.push(next);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f0eade] lg:flex-row">

      {/* ── Left: form panel ────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-6 py-12 lg:mx-0 lg:w-[440px] lg:max-w-none lg:shrink-0 lg:px-14">

        {/* Logo */}
        <h1 className="mb-10 text-center font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#4c1815] lg:text-left">
          Smriti
        </h1>

        {/* Heading */}
        <div className="mb-8">
          <p className="font-brand font-bold text-2xl leading-tight tracking-tight text-[#561d11]">
            Welcome back.
          </p>
          <p className="mt-1.5 font-brand text-base text-[#561d11]/60">
            Sign in to continue your story.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="pb-5">
            <label className={labelCls}>Email</label>
            <input
              type="email"
              {...form.register("email")}
              placeholder="you@example.com"
              className={inputCls}
            />
            {errors.email && (
              <p className="mt-1.5 font-brand text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="pb-8">
            <label className={labelCls}>Password</label>
            <input
              type="password"
              {...form.register("password")}
              placeholder="••••••••"
              className={inputCls}
            />
            {errors.password && (
              <p className="mt-1.5 font-brand text-sm text-red-700">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto mb-6 flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center font-brand text-base text-[#561d11] lg:text-left">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 transition hover:opacity-75"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* ── Right: photo collage (desktop only) ─────────────────────────── */}
      <div
        className="relative hidden flex-1 overflow-hidden lg:block"
        style={{ backgroundColor: "#2e1508" }}
      >
        {/* Grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Scattered photos */}
        {PHOTOS.map((photo, i) => (
          <div
            key={i}
            className={`${photo.cls} overflow-hidden rounded-sm shadow-2xl`}
            style={{ aspectRatio: photo.ar }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className={`object-cover${photo.grayscale ? " grayscale" : ""}`}
              sizes="30vw"
            />
          </div>
        ))}

        {/* Quote */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="font-serif text-xl italic leading-snug tracking-[-0.02em] text-[#f0eade]/60">
            &ldquo;Memories preserved, one story at a time.&rdquo;
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Page export (Suspense for useSearchParams) ────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
