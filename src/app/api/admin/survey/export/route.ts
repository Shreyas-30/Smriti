import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type AdminSession } from "@/lib/admin-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const tmpRes = new Response();
  const session = await getIronSession<AdminSession>(req, tmpRes, sessionOptions);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: responses } = await supabase
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (responses ?? []).map((r) => {
    const captureMethodsStr = [
      ...(r.capture_methods ?? []),
      ...(r.capture_methods_other ? [`Other: ${r.capture_methods_other}`] : []),
    ].join("; ");

    const difficultiesStr = [
      ...(r.difficulties ?? []),
      ...(r.difficulties_other ? [`Other: ${r.difficulties_other}`] : []),
    ].join("; ");

    const formatsStr = [
      ...(r.preferred_formats ?? []),
      ...(r.preferred_formats_other ? [`Other: ${r.preferred_formats_other}`] : []),
    ].join("; ");

    const frequencyStr = r.family_conversation_frequency_other
      ? `${r.family_conversation_frequency} — ${r.family_conversation_frequency_other}`
      : (r.family_conversation_frequency ?? "");

    return {
      "Email": r.email ?? "",
      "Age Range": r.age_range ?? "",
      "Conversation Frequency": frequencyStr,
      "Preservation Importance (1–5)": r.preservation_importance ?? "",
      "Has Documented": r.has_documented ?? "",
      "Capture Methods": captureMethodsStr,
      "Difficulties": difficultiesStr,
      "Preferred Formats": formatsStr,
      "Purchase Intent": r.purchase_intent ?? "",
      "Anything Else": r.anything_else ?? "",
      "Early Access Info": r.early_access_info ?? "",
      "Submitted At": r.created_at
        ? new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 32 }, // Email
    { wch: 10 }, // Age Range
    { wch: 42 }, // Conversation Frequency
    { wch: 14 }, // Importance
    { wch: 14 }, // Has Documented
    { wch: 64 }, // Capture Methods
    { wch: 64 }, // Difficulties
    { wch: 42 }, // Preferred Formats
    { wch: 44 }, // Purchase Intent
    { wch: 48 }, // Anything Else
    { wch: 48 }, // Early Access Info
    { wch: 22 }, // Submitted At
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Survey Responses");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `smriti-survey-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
