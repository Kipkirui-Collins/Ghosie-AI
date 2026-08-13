"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setStatusMessage(data?.error || "Unable to send reset link.");
      } else {
        setStatusMessage("If that email is registered, a password reset link has been sent.");
      }
    } catch {
      setIsError(true);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 blur-3xl -z-10" />

        <div className="glass neon-border p-8 md:p-10 rounded-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-glow mb-2">Reset Password</h2>
            <p className="text-sm text-slate-400">Enter your email to receive a reset link</p>
          </div>

          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 mb-8" />

          <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
            <label className="block text-left text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              required
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full button-neon py-3 px-4 font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {statusMessage && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                isError
                  ? "border-red-500/20 bg-red-500/5 text-red-200"
                  : "border-cyan-500/20 bg-cyan-500/5 text-cyan-100"
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="pt-6 border-t border-slate-700/50 text-center">
            <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300 transition">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}