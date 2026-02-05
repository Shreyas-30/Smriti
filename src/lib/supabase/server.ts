import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  // ✅ Next 15+: cookies() is async
  const cookieStore = await cookies();

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !anon) {
    console.error("[Supabase env missing on server]", {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      ),
    });
    throw new Error(
      "Missing Supabase server env vars (SUPABASE_URL / SUPABASE_ANON_KEY).",
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components this may throw; safe no-op
        try {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // no-op
        }
      },
    },
  });
}
