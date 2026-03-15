import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("survey_responses").insert({
      email: body.email,
      age_range: body.age,
      family_conversation_frequency: body.frequency,
      family_conversation_frequency_other: body.frequencyOther || null,
      preservation_importance: body.importance,
      has_documented: body.hasDocumented,
      capture_methods: body.captureMethod,
      capture_methods_other: body.captureMethodOther || null,
      difficulties: body.difficulties,
      difficulties_other: body.difficultiesOther || null,
      preferred_formats: body.preferredFormat,
      preferred_formats_other: body.preferredFormatOther || null,
      purchase_intent: body.purchaseIntent,
      anything_else: body.anythingElse || null,
      early_access_info: body.earlyAccess || null,
    });

    if (error) {
      console.error("[survey] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save response." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[survey] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
