import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SERIF = { fontFamily: "var(--font-instrument-serif)" };
const SANS = { fontFamily: "var(--font-instrument-sans)" };

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5"
      style={SANS}
    >
      <p
        className="text-[#3d1a0e] font-semibold"
        style={{ fontSize: "36px", lineHeight: 1 }}
      >
        {value}
      </p>
      <p className="text-[#5c2a18]/60 text-sm mt-2">{label}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminOverviewPage() {
  const supabase = createSupabaseAdminClient();

  const [usersCount, storiesCount, recordingsCount, surveyCount] =
    await Promise.all([
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabase
        .from("user_stories")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabase
        .from("recordings")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
    ]);

  // Recent signups
  const { data: recentUsers } = await supabase
    .from("users")
    .select("id, first_name, last_name, signup_type, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // Recent stories with user info
  const { data: recentStories } = await supabase
    .from("user_stories")
    .select("id, content, language, updated_at, user_id, users(first_name, last_name)")
    .order("updated_at", { ascending: false })
    .limit(10);

  // Count early access signups
  const { count: earlyAccessCount } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact", head: true })
    .not("early_access_info", "is", null)
    .neq("early_access_info", "");

  return (
    <div style={SANS}>
      <h1
        className="text-[#3d1a0e] mb-6"
        style={{ ...SERIF, fontSize: "28px" }}
      >
        Overview
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Registered users" value={usersCount} />
        <StatCard label="Stories written" value={storiesCount} />
        <StatCard label="Recordings" value={recordingsCount} />
        <StatCard
          label={`Survey responses (${earlyAccessCount ?? 0} early access)`}
          value={surveyCount}
        />
      </div>

      {/* Preview tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="bg-white rounded-xl border border-[#e5ddd3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5ddd3]">
            <h2 className="text-[#3d1a0e] font-semibold text-sm">
              Recent signups
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5ddd3] text-[#5c2a18]/50">
                <th className="text-left px-5 py-2.5 font-medium">Name</th>
                <th className="text-left px-5 py-2.5 font-medium">Type</th>
                <th className="text-left px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u, i) => (
                <tr
                  key={u.id}
                  className={i % 2 === 1 ? "bg-[#faf8f5]" : ""}
                >
                  <td className="px-5 py-2.5 text-[#3d1a0e]">
                    {u.first_name || u.last_name
                      ? `${u.first_name} ${u.last_name}`.trim()
                      : <span className="text-[#5c2a18]/40 italic">—</span>}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-[#5c2a18]/60">{u.signup_type}</span>
                  </td>
                  <td className="px-5 py-2.5 text-[#5c2a18]/60">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
              {!recentUsers?.length && (
                <tr>
                  <td colSpan={3} className="px-5 py-4 text-[#5c2a18]/40 text-center">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent stories */}
        <div className="bg-white rounded-xl border border-[#e5ddd3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5ddd3]">
            <h2 className="text-[#3d1a0e] font-semibold text-sm">
              Recent stories
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5ddd3] text-[#5c2a18]/50">
                <th className="text-left px-5 py-2.5 font-medium">User</th>
                <th className="text-left px-5 py-2.5 font-medium">Words</th>
                <th className="text-left px-5 py-2.5 font-medium">Lang</th>
                <th className="text-left px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentStories ?? []).map((s, i) => {
                const user = (s as any).users;
                const name = user
                  ? `${user.first_name} ${user.last_name}`.trim() || "—"
                  : "—";
                const words = s.content
                  .split(/\s+/)
                  .filter(Boolean).length;
                return (
                  <tr key={s.id} className={i % 2 === 1 ? "bg-[#faf8f5]" : ""}>
                    <td className="px-5 py-2.5 text-[#3d1a0e]">{name}</td>
                    <td className="px-5 py-2.5 text-[#5c2a18]/60">{words}</td>
                    <td className="px-5 py-2.5 text-[#5c2a18]/60 uppercase text-xs">
                      {s.language}
                    </td>
                    <td className="px-5 py-2.5 text-[#5c2a18]/60">
                      {formatDate(s.updated_at)}
                    </td>
                  </tr>
                );
              })}
              {!recentStories?.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-[#5c2a18]/40 text-center">
                    No stories yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
