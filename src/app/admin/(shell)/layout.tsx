import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions, type AdminSession } from "@/lib/admin-session";
import Link from "next/link";

async function AdminLogout() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#5c2a18]/60 hover:text-[#3d1a0e] hover:bg-[#f0eade] transition-colors"
        style={{ fontFamily: "var(--font-instrument-sans)" }}
      >
        Sign out
      </button>
    </form>
  );
}

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fallback session check (middleware is the primary gate)
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(
    cookieStore as any,
    sessionOptions,
  );
  if (!session.isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f0eade" }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r border-[#e5ddd3] bg-white"
        style={{ fontFamily: "var(--font-instrument-sans)" }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#e5ddd3]">
          <p
            className="text-[#3d1a0e] font-semibold text-base"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Smriti
          </p>
          <p className="text-[#5c2a18]/50 text-xs mt-0.5">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#3d1a0e] hover:bg-[#f0eade] transition-colors"
          >
            <span className="text-base">▦</span>
            Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#3d1a0e] hover:bg-[#f0eade] transition-colors"
          >
            <span className="text-base">◎</span>
            Users
          </Link>
          <Link
            href="/admin/survey"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#3d1a0e] hover:bg-[#f0eade] transition-colors"
          >
            <span className="text-base">◈</span>
            Survey
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#e5ddd3]">
          <AdminLogout />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
