import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type AdminSession } from "@/lib/admin-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const AUDIO_BUCKET = "audio-recordings";

/** Extract `{ bucket, filePath }` from a Supabase public storage URL, or null. */
function parseStorageUrl(
  url: string,
  supabaseUrl: string,
): { bucket: string; filePath: string } | null {
  const prefix = `${supabaseUrl}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  return { bucket: rest.slice(0, slash), filePath: rest.slice(slash + 1) };
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth check
  const tmpRes = new Response();
  const session = await getIronSession<AdminSession>(req, tmpRes, sessionOptions);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;
  const supabase = createSupabaseAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // 1. Delete audio recordings from storage (`audio-recordings/{userId}/`)
  const { data: audioFiles } = await supabase.storage
    .from(AUDIO_BUCKET)
    .list(userId);

  if (audioFiles && audioFiles.length > 0) {
    const paths = audioFiles.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from(AUDIO_BUCKET).remove(paths);
  }

  // 2. Delete any prompt images stored in Supabase storage
  const { data: userPrompts } = await supabase
    .from("user_prompts")
    .select("image_url")
    .eq("user_id", userId)
    .not("image_url", "is", null);

  if (userPrompts && userPrompts.length > 0) {
    // Group file paths by bucket
    const byBucket = new Map<string, string[]>();
    for (const prompt of userPrompts) {
      const parsed = parseStorageUrl(prompt.image_url!, supabaseUrl);
      if (!parsed) continue;
      const list = byBucket.get(parsed.bucket) ?? [];
      list.push(parsed.filePath);
      byBucket.set(parsed.bucket, list);
    }
    for (const [bucket, paths] of byBucket) {
      await supabase.storage.from(bucket).remove(paths);
    }
  }

  // 3. Delete auth user — cascades to all public.* tables via FK constraints
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
