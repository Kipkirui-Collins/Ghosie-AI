"use client";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setStatusMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setStatusMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setStatusMessage(data?.error || "Unable to reset password.");
      } else {
        setStatusMessage("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch {
      setIsError(true);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-300 mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
      <label className="block text-left text-sm font-medium text-slate-300">
        New password
      </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        required
        minLength={8}
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm new password"
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        required
        minLength={8}
      />
      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="w-full button-neon py-3 px-4 font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 blur-3xl -z-10" />

        <div className="glass neon-border p-8 md:p-10 rounded-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-glow mb-2">Set New Password</h2>
            <p className="text-sm text-slate-400">Choose a new password for your account</p>
          </div>

          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 mb-8" />

          <Suspense fallback={<div className="text-center text-sm text-slate-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

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