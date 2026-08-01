import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-violet-500/5 blur-3xl -z-10" />

        <div className="glass neon-border p-8 md:p-12 text-center rounded-2xl">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent mb-2">
              Ghosie AI
            </h1>
            <p className="text-xl text-glow">AI Assistant for the Future</p>
          </div>

          {/* Description */}
          <div className="space-y-3 mb-8 text-slate-300">
            <p className="text-lg">
              Experience conversational AI with a futuristic interface
            </p>
            <p className="text-sm text-slate-400">
              Powered by OpenAI • Real-time Streaming • Secure Authentication
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="button-neon px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
            >
              Enter Ghosie AI →
            </Link>
          </div>

          {/* Features grid */}
          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 mb-6">What you get:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div className="font-semibold text-cyan-400 mb-1">⚡ Real-time</div>
                <div className="text-slate-400 text-xs">Streaming responses</div>
              </div>
              <div className="p-3 rounded-lg border border-magenta-500/20 bg-magenta-500/5">
                <div className="font-semibold text-magenta-400 mb-1">🔐 Secure</div>
                <div className="text-slate-400 text-xs">GitHub OAuth</div>
              </div>
              <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5">
                <div className="font-semibold text-violet-400 mb-1">💾 Persistent</div>
                <div className="text-slate-400 text-xs">Save conversations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
