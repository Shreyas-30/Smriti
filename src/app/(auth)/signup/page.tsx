"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success("Check your email to confirm your account.");
      form.reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle>Create your Smriti account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input {...form.register("fullName")} placeholder="Jhon Doe" />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...form.register("email")} placeholder="you@example.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              {...form.register("password")}
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Sign up"}
          </Button>
        </form>

        <p className="text-sm text-neutral-700">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
