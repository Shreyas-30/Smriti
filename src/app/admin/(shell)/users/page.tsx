import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import UsersTable, { type AdminUser } from "./UsersTable";

const SERIF = { fontFamily: "var(--font-instrument-serif)" };
const SANS = { fontFamily: "var(--font-instrument-sans)" };

export default async function AdminUsersPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: users }, { data: storytellers }] = await Promise.all([
    supabase
      .from("users")
      .select("id, first_name, last_name, signup_type, created_at, user_stories(count)")
      .order("created_at", { ascending: false }),
    supabase
      .from("storytellers")
      .select("user_id, recordings(count)"),
  ]);

  // Sum recording counts per user_id
  const recordingsByUser: Record<string, number> = {};
  for (const st of storytellers ?? []) {
    const count = (st as any).recordings?.[0]?.count ?? 0;
    recordingsByUser[st.user_id] =
      (recordingsByUser[st.user_id] ?? 0) + count;
  }

  const tableUsers: AdminUser[] = (users ?? []).map((u) => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    signup_type: u.signup_type,
    created_at: u.created_at,
    storyCount: (u as any).user_stories?.[0]?.count ?? 0,
    recordingCount: recordingsByUser[u.id] ?? 0,
  }));

  return (
    <div style={SANS}>
      <h1
        className="text-[#3d1a0e] mb-6"
        style={{ ...SERIF, fontSize: "28px" }}
      >
        Users
      </h1>
      <UsersTable initialUsers={tableUsers} />
    </div>
  );
}
