import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/dashboard" className="font-semibold text-neutral-900">
            Smriti
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-700">
            <Link href="/elders">Elders</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/projects">Projects</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </main>
  );
}
