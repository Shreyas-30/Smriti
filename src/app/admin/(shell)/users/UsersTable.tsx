"use client";

import { useState } from "react";

const SANS = { fontFamily: "var(--font-instrument-sans)" };

export type AdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  signup_type: string;
  created_at: string;
  storyCount: number;
  recordingCount: number;
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function UsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  // Map of userId → "confirming" | "deleting"
  const [deleteState, setDeleteState] = useState<Record<string, "confirming" | "deleting">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function confirmDelete(userId: string) {
    setDeleteState((prev) => ({ ...prev, [userId]: "confirming" }));
    setErrors((prev) => { const n = { ...prev }; delete n[userId]; return n; });
  }

  function cancelDelete(userId: string) {
    setDeleteState((prev) => { const n = { ...prev }; delete n[userId]; return n; });
  }

  async function executeDelete(userId: string) {
    setDeleteState((prev) => ({ ...prev, [userId]: "deleting" }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setErrors((prev) => ({ ...prev, [userId]: data.error ?? "Delete failed" }));
        setDeleteState((prev) => ({ ...prev, [userId]: "confirming" }));
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteState((prev) => { const n = { ...prev }; delete n[userId]; return n; });
    } catch {
      setErrors((prev) => ({ ...prev, [userId]: "Network error" }));
      setDeleteState((prev) => ({ ...prev, [userId]: "confirming" }));
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5ddd3] overflow-hidden" style={SANS}>
      <div className="px-5 py-4 border-b border-[#e5ddd3]">
        <h2 className="text-[#3d1a0e] font-semibold text-sm">
          All users ({users.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5ddd3] text-[#5c2a18]/50">
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Type</th>
              <th className="text-left px-5 py-3 font-medium">Stories</th>
              <th className="text-left px-5 py-3 font-medium">Recordings</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const name =
                u.first_name || u.last_name
                  ? `${u.first_name} ${u.last_name}`.trim()
                  : null;
              const state = deleteState[u.id];
              const err = errors[u.id];

              return (
                <tr
                  key={u.id}
                  className={`${i % 2 === 1 ? "bg-[#faf8f5]" : ""} ${
                    state === "confirming" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-5 py-3 text-[#3d1a0e]">
                    {name ?? (
                      <span className="text-[#5c2a18]/40 italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.signup_type === "curator"
                          ? "bg-[#f0eade] text-[#5c2a18]"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {u.signup_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#5c2a18]/70">{u.storyCount}</td>
                  <td className="px-5 py-3 text-[#5c2a18]/70">{u.recordingCount}</td>
                  <td className="px-5 py-3 text-[#5c2a18]/60">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    {!state && (
                      <button
                        onClick={() => confirmDelete(u.id)}
                        className="text-[#5c2a18]/30 hover:text-red-500 transition-colors"
                        title="Delete user"
                      >
                        <TrashIcon />
                      </button>
                    )}
                    {state === "confirming" && (
                      <div className="flex items-center gap-2">
                        {err && (
                          <span className="text-red-500 text-xs mr-1">{err}</span>
                        )}
                        <span className="text-red-600 text-xs font-medium">Delete?</span>
                        <button
                          onClick={() => executeDelete(u.id)}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => cancelDelete(u.id)}
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
              );
            })}
            {!users.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-6 text-[#5c2a18]/40 text-center"
                >
                  No users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
