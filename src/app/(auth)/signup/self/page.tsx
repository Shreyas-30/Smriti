"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

const schema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const inputCls =
  "w-full h-[50px] rounded-[20px] border border-[#561d11]/30 bg-transparent px-4 " +
  "font-brand text-lg text-[#561d11] " +
  "placeholder:text-[#561d11]/55 placeholder:font-medium " +
  "focus:outline-none focus:border-[#561d11]/60 transition";

const labelCls = "block font-brand font-bold text-[#561d11] text-base mb-2";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="mt-1 font-brand text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function SignupSelfPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            signup_type: "self",
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success("Check your email to confirm your account.");
      form.reset();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <h1 className="mb-6 text-center font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#4c1815]">
        Smriti
      </h1>

      {/* Subtitle */}
      <p className="mb-8 font-brand font-bold text-2xl leading-tight tracking-tight text-[#561d11]">
        Let&apos;s start by getting to know a little more about you!
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Field label="Your First Name" error={errors.firstName?.message}>
          <input
            {...form.register("firstName")}
            placeholder="First Name"
            className={inputCls}
          />
        </Field>

        <Field label="Your Last Name" error={errors.lastName?.message}>
          <input
            {...form.register("lastName")}
            placeholder="Last Name"
            className={inputCls}
          />
        </Field>

        <Field label="Your Email Address" error={errors.email?.message}>
          <input
            type="email"
            {...form.register("email")}
            placeholder="Email Address"
            className={inputCls}
          />
        </Field>

        <Field label="Your Phone Number" error={errors.phone?.message}>
          <input
            type="tel"
            {...form.register("phone")}
            placeholder="Your Phone Number"
            className={inputCls}
          />
          <p className="mt-2 font-brand text-sm leading-snug text-[#561d11]/70">
            We will use this number to send you notifications and Smriti prompts
            for you to respond to.
          </p>
        </Field>

        <Field label="Account Password" error={errors.password?.message}>
          <input
            type="password"
            {...form.register("password")}
            placeholder="Password"
            className={inputCls}
          />
        </Field>

        <Field label="Repeat Password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            {...form.register("confirmPassword")}
            placeholder="Password"
            className={inputCls}
          />
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mx-auto mt-2 flex h-12 w-72 items-center justify-center rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Setting up…" : "Set up my prompts"}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-8 mb-4 text-center font-brand text-base text-[#561d11]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:opacity-75 transition"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
