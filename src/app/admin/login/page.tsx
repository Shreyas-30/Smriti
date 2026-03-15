"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SANS = { fontFamily: "var(--font-instrument-sans)" };
const SERIF = { fontFamily: "var(--font-instrument-serif)" };

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f0eade" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-[#3d1a0e] mb-1"
            style={{ ...SERIF, fontSize: "32px" }}
          >
            Smriti
          </h1>
          <p
            className="text-[#5c2a18]/60 text-sm"
            style={SANS}
          >
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5ddd3] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#3d1a0e] mb-2"
                style={SANS}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#d4c9b8] bg-[#faf8f5] text-[#3d1a0e] placeholder:text-[#5c2a18]/30 focus:outline-none focus:border-[#5c2a18] transition-colors"
                style={SANS}
                placeholder="admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#3d1a0e] mb-2"
                style={SANS}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#d4c9b8] bg-[#faf8f5] text-[#3d1a0e] placeholder:text-[#5c2a18]/30 focus:outline-none focus:border-[#5c2a18] transition-colors"
                style={SANS}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                className="text-red-600 text-sm"
                style={SANS}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#3d1a0e", ...SANS }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
