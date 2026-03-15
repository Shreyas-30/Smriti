import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import SurveyTable from "./SurveyTable";

const SERIF = { fontFamily: "var(--font-instrument-serif)" };
const SANS = { fontFamily: "var(--font-instrument-sans)" };

type SurveyRow = {
  id: string;
  email: string | null;
  age_range: string | null;
  family_conversation_frequency: string | null;
  family_conversation_frequency_other: string | null;
  preservation_importance: number | null;
  has_documented: string | null;
  capture_methods: string[] | null;
  capture_methods_other: string | null;
  difficulties: string[] | null;
  difficulties_other: string | null;
  preferred_formats: string[] | null;
  preferred_formats_other: string | null;
  purchase_intent: string | null;
  anything_else: string | null;
  early_access_info: string | null;
  created_at: string;
};

function countBy<T>(
  arr: T[],
  key: keyof T,
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const v = String(item[key] ?? "Unknown");
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function SummarySection({
  label,
  items,
}: {
  label: string;
  items: { value: string; count: number }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#5c2a18]/60 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {items.map(({ value, count }) => (
          <div key={value} className="flex items-center gap-3">
            <span className="text-sm text-[#3d1a0e] flex-1 truncate">
              {value}
            </span>
            <span className="text-sm font-semibold text-[#3d1a0e] tabular-nums">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminSurveyPage() {
  const supabase = createSupabaseAdminClient();

  const { data: rows } = await supabase
    .from("survey_responses")
    .select(
      "id, email, age_range, family_conversation_frequency, family_conversation_frequency_other, preservation_importance, has_documented, capture_methods, capture_methods_other, difficulties, difficulties_other, preferred_formats, preferred_formats_other, purchase_intent, anything_else, early_access_info, created_at",
    )
    .order("created_at", { ascending: false });

  const responses = (rows ?? []) as SurveyRow[];
  const total = responses.length;
  const earlyAccess = responses.filter(
    (r) => r.early_access_info && r.early_access_info.trim(),
  ).length;

  const avgImportance =
    total > 0
      ? (
          responses.reduce(
            (sum, r) => sum + (r.preservation_importance ?? 0),
            0,
          ) / total
        ).toFixed(1)
      : "—";

  const ageBreakdown = countBy(responses, "age_range");
  const purchaseBreakdown = countBy(responses, "purchase_intent");

  return (
    <div style={SANS}>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[#3d1a0e]"
          style={{ ...SERIF, fontSize: "28px" }}
        >
          Survey Responses
        </h1>
        <a
          href="/api/admin/survey/export"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#3d1a0e" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Excel
        </a>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5">
          <p
            className="text-[#3d1a0e] font-semibold"
            style={{ fontSize: "36px", lineHeight: 1 }}
          >
            {total}
          </p>
          <p className="text-[#5c2a18]/60 text-sm mt-2">Total responses</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5">
          <p
            className="text-[#3d1a0e] font-semibold"
            style={{ fontSize: "36px", lineHeight: 1 }}
          >
            {earlyAccess}
          </p>
          <p className="text-[#5c2a18]/60 text-sm mt-2">Early access signups</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5">
          <p
            className="text-[#3d1a0e] font-semibold"
            style={{ fontSize: "36px", lineHeight: 1 }}
          >
            {avgImportance}
          </p>
          <p className="text-[#5c2a18]/60 text-sm mt-2">
            Avg preservation importance (1–5)
          </p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5">
          <SummarySection label="Age range" items={ageBreakdown} />
        </div>
        <div className="bg-white rounded-xl border border-[#e5ddd3] px-6 py-5">
          <SummarySection label="Purchase intent" items={purchaseBreakdown} />
        </div>
      </div>

      {/* Full responses table */}
      <SurveyTable responses={responses} />
    </div>
  );
}
