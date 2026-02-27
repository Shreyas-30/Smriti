"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

type Mode = "self" | "caregiver";

// All conditional fields are optional in the schema.
// Mode-specific required validation is enforced in onSubmit.
const schema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
    storytellerFirstName: z.string().optional(),
    storytellerLastName: z.string().optional(),
    storytellerPhone: z.string().optional(),
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

// Each field is wrapped in pb-6 so that spacing collapses with the field
// when inside a FadeSection. Using flex-col with no gap on the parent.
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
    <div className="pb-6">
      <label className={labelCls}>{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 font-brand text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

// Height + opacity + subtle slide animation.
// The pb-6 on child Fields is inside overflow-hidden so it collapses cleanly.
function FadeSection({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden transition-all duration-500 ease-in-out"
      style={{ maxHeight: show ? "800px" : "0px", opacity: show ? 1 : 0 }}
    >
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: show ? "translateY(0)" : "translateY(-10px)" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("caregiver");
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
      storytellerFirstName: "",
      storytellerLastName: "",
      storytellerPhone: "",
    },
  });

  const errors = form.formState.errors;

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    // Clear errors for fields that are now hidden
    if (newMode === "self") {
      form.clearErrors(["storytellerFirstName", "storytellerLastName", "storytellerPhone"]);
    } else {
      form.clearErrors(["phone"]);
    }
  }

  async function onSubmit(values: FormValues) {
    // Enforce required fields for the active mode
    if (mode === "self") {
      if (!values.phone?.trim()) {
        form.setError("phone", { message: "Required" });
        return;
      }
    } else {
      let hasError = false;
      if (!values.storytellerFirstName?.trim()) {
        form.setError("storytellerFirstName", { message: "Required" });
        hasError = true;
      }
      if (!values.storytellerLastName?.trim()) {
        form.setError("storytellerLastName", { message: "Required" });
        hasError = true;
      }
      if (!values.storytellerPhone?.trim()) {
        form.setError("storytellerPhone", { message: "Required" });
        hasError = true;
      }
      if (hasError) return;
    }

    setLoading(true);
    try {
      const metadata =
        mode === "self"
          ? {
              first_name: values.firstName,
              last_name: values.lastName,
              phone: values.phone,
              signup_type: "self",
            }
          : {
              first_name: values.firstName,
              last_name: values.lastName,
              storyteller_first_name: values.storytellerFirstName,
              storyteller_last_name: values.storytellerLastName,
              storyteller_phone: values.storytellerPhone,
              signup_type: "caregiver",
            };

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: metadata,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/onboarding");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-center font-serif text-[3rem] leading-none tracking-[-0.04em] text-[#4c1815]">
        Smriti
      </h1>

      {/* Pill mode toggle */}
      <div className="mb-8 flex rounded-full bg-[#561d11]/10 p-1">
        <button
          type="button"
          onClick={() => handleModeChange("self")}
          className={`flex-1 rounded-full py-2.5 font-brand text-sm font-medium transition-all duration-200 ${
            mode === "self"
              ? "bg-[#561d11] text-[#f0eade] shadow-sm"
              : "text-[#561d11]/55 hover:text-[#561d11]/80"
          }`}
        >
          For myself
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("caregiver")}
          className={`flex-1 rounded-full py-2.5 font-brand text-sm font-medium transition-all duration-200 ${
            mode === "caregiver"
              ? "bg-[#561d11] text-[#f0eade] shadow-sm"
              : "text-[#561d11]/55 hover:text-[#561d11]/80"
          }`}
        >
          For a loved one
        </button>
      </div>

      <p className="mb-8 font-brand font-bold text-2xl leading-tight tracking-tight text-[#561d11]">
        Let&apos;s start by getting to know a little more about you!
      </p>

      {/* flex-col with no gap — spacing lives inside each Field as pb-6 */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
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

        {/* Self-only: user's own phone */}
        <FadeSection show={mode === "self"}>
          <Field label="Your Phone Number" error={errors.phone?.message}>
            <input
              type="tel"
              {...form.register("phone")}
              placeholder="Your Phone Number"
              className={inputCls}
            />
            <p className="mt-2 font-brand text-sm leading-snug text-[#561d11]/70">
              We will use this number to send you notifications and Smriti
              prompts for you to respond to.
            </p>
          </Field>
        </FadeSection>

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

        {/* Caregiver-only: storyteller details */}
        <FadeSection show={mode === "caregiver"}>
          <Field
            label="Storyteller's First Name"
            error={errors.storytellerFirstName?.message}
          >
            <input
              {...form.register("storytellerFirstName")}
              placeholder="Storyteller's First Name"
              className={inputCls}
            />
          </Field>

          <Field
            label="Storyteller's Last Name"
            error={errors.storytellerLastName?.message}
          >
            <input
              {...form.register("storytellerLastName")}
              placeholder="Storyteller's Last Name"
              className={inputCls}
            />
          </Field>

          <Field
            label="Storyteller's Phone Number"
            error={errors.storytellerPhone?.message}
          >
            <input
              type="tel"
              {...form.register("storytellerPhone")}
              placeholder="Storyteller's Phone Number"
              className={inputCls}
            />
            <p className="mt-2 font-brand text-sm leading-snug text-[#561d11]/70">
              We will use this number to send them notifications and Smriti
              prompts for them to respond to.
            </p>
          </Field>
        </FadeSection>

        <button
          type="submit"
          disabled={loading}
          className="mx-auto mb-6 mt-2 flex h-12 w-72 items-center justify-center rounded-full bg-[#561d11] font-brand text-lg font-medium text-[#f0eade] transition hover:bg-[#6b2517] active:scale-[0.99] disabled:opacity-60"
        >
          {loading
            ? "Setting up…"
            : mode === "self"
              ? "Set up my prompts"
              : "Set up weekly prompts"}
        </button>
      </form>

      <p className="mb-4 text-center font-brand text-base text-[#561d11]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 transition hover:opacity-75"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
