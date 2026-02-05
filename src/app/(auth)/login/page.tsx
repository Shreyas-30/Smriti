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
import { useSearchParams, useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  const next = params.get("next") || "/dashboard";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      router.push(next);
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle>Log in to Smriti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-neutral-700">
          New here?{" "}
          <Link href="/signup" className="text-primary-600 underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
