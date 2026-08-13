"use client";
import SignInButton from "../../../components/Auth/SignInButton";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"magic" | "password" | "signup">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const result = await signIn("email", {
      redirect: false,
      email,
      callbackUrl: "/login"
    });

    if (result?.error) {
      setStatusMessage("Unable to send sign-in link. Please try again.");
    } else {
      setStatusMessage("If that email is registered, a sign-in link was sent.");
    }
  };

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard"
    });

    if (result?.error) {
      setStatusMessage("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setStatusMessage(data?.error || "Unable to create account.");
    } else {
      setStatusMessage("Account created. You can now sign in with your password.");
      setMode("password");
      setPassword("");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 blur-3xl -z-10" />

        <div className="glass neon-border p-8 md:p-10 rounded-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-glow mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in to your Ghosie AI account</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 mb-8" />

          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`rounded-full px-4 py-2 text-sm transition ${
                mode === "magic" ? "bg-cyan-500 text-slate-900" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Magic link
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`rounded-full px-4 py-2 text-sm transition ${
                mode === "password" ? "bg-cyan-500 text-slate-900" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Password login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-sm transition ${
                mode === "signup" ? "bg-cyan-500 text-slate-900" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === "magic" && (
            <form className="space-y-4 mb-6" onSubmit={handleEmailSignIn}>
              <label className="block text-left text-sm font-medium text-slate-300">
                Sign in with Email
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
                className="w-full button-neon py-3 px-4 font-semibold text-lg hover:scale-105 transition-transform"
              >
                Send magic link
              </button>
            </form>
          )}

          {mode === "password" && (
            <form className="space-y-4 mb-6" onSubmit={handlePasswordSignIn}>
              <label className="block text-left text-sm font-medium text-slate-300">
                Sign in with password
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full button-neon py-3 px-4 font-semibold text-lg hover:scale-105 transition-transform"
              >
                Sign in
              </button>
            </form>
          )}

          {mode === "signup" && (
            <form className="space-y-4 mb-6" onSubmit={handleSignup}>
              <label className="block text-left text-sm font-medium text-slate-300">
                Create an account
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Choose a password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
              <button
                type="submit"
                className="w-full button-neon py-3 px-4 font-semibold text-lg hover:scale-105 transition-transform"
              >
                Create account
              </button>
            </form>
          )}

          {statusMessage && (
            <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
              {statusMessage}
            </div>
          )}

          {/* GitHub Sign In Button */}
          <div className="mb-8">
            <SignInButton />
          </div>

          {/* Footer info */}
          <div className="pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>🔒 Sign in with GitHub or email magic link</p>
        </div>
      </div>
    </main>
  );
}
