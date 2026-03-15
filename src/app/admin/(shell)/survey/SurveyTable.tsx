"use client";

import React, { useState } from "react";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ExpandedRow({ r }: { r: SurveyRow }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={SANS}>
      {r.family_conversation_frequency && (
        <div>
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Conversation frequency
          </p>
          <p className="text-[#3d1a0e]">
            {r.family_conversation_frequency}
            {r.family_conversation_frequency_other
              ? ` — ${r.family_conversation_frequency_other}`
              : ""}
          </p>
        </div>
      )}
      {r.has_documented && (
        <div>
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Has tried to document
          </p>
          <p className="text-[#3d1a0e]">{r.has_documented}</p>
        </div>
      )}
      {r.capture_methods && r.capture_methods.length > 0 && (
        <div>
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Capture methods
          </p>
          <ul className="text-[#3d1a0e] space-y-0.5">
            {r.capture_methods.map((m) => (
              <li key={m}>• {m}</li>
            ))}
            {r.capture_methods_other && (
              <li className="text-[#5c2a18]/70">
                Other: {r.capture_methods_other}
              </li>
            )}
          </ul>
        </div>
      )}
      {r.difficulties && r.difficulties.length > 0 && (
        <div>
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Difficulties
          </p>
          <ul className="text-[#3d1a0e] space-y-0.5">
            {r.difficulties.map((d) => (
              <li key={d}>• {d}</li>
            ))}
            {r.difficulties_other && (
              <li className="text-[#5c2a18]/70">
                Other: {r.difficulties_other}
              </li>
            )}
          </ul>
        </div>
      )}
      {r.preferred_formats && r.preferred_formats.length > 0 && (
        <div>
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Preferred formats
          </p>
          <ul className="text-[#3d1a0e] space-y-0.5">
            {r.preferred_formats.map((f) => (
              <li key={f}>• {f}</li>
            ))}
            {r.preferred_formats_other && (
              <li className="text-[#5c2a18]/70">
                Other: {r.preferred_formats_other}
              </li>
            )}
          </ul>
        </div>
      )}
      {r.anything_else && (
        <div className="md:col-span-2">
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Anything else
          </p>
          <p className="text-[#3d1a0e]">{r.anything_else}</p>
        </div>
      )}
      {r.early_access_info && (
        <div className="md:col-span-2 bg-[#f0eade] rounded-lg px-4 py-3">
          <p className="text-[#5c2a18]/50 text-xs uppercase tracking-wide mb-1">
            Early access info
          </p>
          <p className="text-[#3d1a0e] font-medium">{r.early_access_info}</p>
        </div>
      )}
    </div>
  );
}

export default function SurveyTable({ responses: initialResponses }: { responses: SurveyRow[] }) {
  const [responses, setResponses] = useState(initialResponses);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteState, setDeleteState] = useState<Record<string, "confirming" | "deleting">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggle(id: string) {
    // Don't expand/collapse while confirming delete
    if (deleteState[id]) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setDeleteState((prev) => ({ ...prev, [id]: "confirming" }));
    setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function cancelDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteState((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function executeDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteState((prev) => ({ ...prev, [id]: "deleting" }));
    try {
      const res = await fetch(`/api/admin/survey/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setErrors((prev) => ({ ...prev, [id]: data.error ?? "Delete failed" }));
        setDeleteState((prev) => ({ ...prev, [id]: "confirming" }));
        return;
      }
      setResponses((prev) => prev.filter((r) => r.id !== id));
      setDeleteState((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch {
      setErrors((prev) => ({ ...prev, [id]: "Network error" }));
      setDeleteState((prev) => ({ ...prev, [id]: "confirming" }));
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5ddd3] overflow-hidden" style={SANS}>
      <div className="px-5 py-4 border-b border-[#e5ddd3]">
        <h2 className="text-[#3d1a0e] font-semibold text-sm">
          All responses ({responses.length})
        </h2>
        <p className="text-[#5c2a18]/50 text-xs mt-0.5">
          Click a row to expand details
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5ddd3] text-[#5c2a18]/50">
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Age</th>
              <th className="text-left px-5 py-3 font-medium">Importance</th>
              <th className="text-left px-5 py-3 font-medium">Purchase intent</th>
              <th className="text-left px-5 py-3 font-medium">Early access</th>
              <th className="text-left px-5 py-3 font-medium">Submitted</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => {
              const isExpanded = expanded.has(r.id);
              const state = deleteState[r.id];
              const err = errors[r.id];
              return (
                <React.Fragment key={r.id}>
                  <tr
                    onClick={() => toggle(r.id)}
                    className={`transition-colors ${state ? "" : "cursor-pointer hover:bg-[#f7f4ef]"} ${
                      i % 2 === 1 && !isExpanded && !state ? "bg-[#faf8f5]" : ""
                    } ${isExpanded ? "bg-[#f0eade]" : ""} ${
                      state === "confirming" ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3 text-[#3d1a0e]">
                      {r.email ?? (
                        <span className="text-[#5c2a18]/40 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#5c2a18]/70">
                      {r.age_range ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#5c2a18]/70">
                      {r.preservation_importance ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#5c2a18]/70 max-w-[200px] truncate">
                      {r.purchase_intent ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {r.early_access_info ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#e5ddd3]" />
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#5c2a18]/60">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      {!state && (
                        <button
                          onClick={(e) => confirmDelete(r.id, e)}
                          className="text-[#5c2a18]/30 hover:text-red-500 transition-colors"
                          title="Delete response"
                        >
                          <TrashIcon />
                        </button>
                      )}
                      {state === "confirming" && (
                        <div className="flex items-center gap-2">
                          {err && (
                            <span className="text-red-500 text-xs mr-1">{err}</span>
                          )}
                          <span className="text-red-600 text-xs font-medium whitespace-nowrap">Delete?</span>
                          <button
                            onClick={(e) => executeDelete(r.id, e)}
                            className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => cancelDelete(r.id, e)}
                            className="text-xs px-2 py-1 rounded border border-[#d4c9b8] text-[#5c2a18] hover:bg-[#f0eade] transition-colors"
                          >
                            No
                          </button>
                        </div>
                      )}
                      {state === "deleting" && (
                        <span className="text-xs text-[#5c2a18]/50">Deleting…</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#f0eade]">
                      <td colSpan={7} className="px-5 py-4 border-t border-[#e5ddd3]/60">
                        <ExpandedRow r={r} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {!responses.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-6 text-[#5c2a18]/40 text-center"
                >
                  No survey responses yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
