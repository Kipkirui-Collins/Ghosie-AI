"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const [theme, setTheme] = useState("cyber");

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <>
      {/* Settings button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-3 rounded-full glass neon-border hover:scale-110 transition-transform duration-200 text-lg"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed right-6 top-24 w-96 glass neon-border p-6 z-50 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-glow">Settings</h3>
              <p className="text-xs text-slate-400 mt-1">Configure your experience</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xl text-slate-400 hover:text-slate-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 mb-6" />

          {/* Settings */}
          <div className="space-y-6">
            {/* Model selection */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                🤖 AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full glass neon-border px-3 py-2 rounded-lg text-sm"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                <option value="gpt-4o">GPT-4o (Powerful)</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                🎨 Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full glass neon-border px-3 py-2 rounded-lg text-sm"
              >
                <option value="cyber">Cyber (Default)</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                🟢 Status
              </label>
              <select className="w-full glass neon-border px-3 py-2 rounded-lg text-sm">
                <option>🟢 Available</option>
                <option>🔴 Do not disturb</option>
                <option>🟡 Away</option>
              </select>
            </div>

            {/* Info section */}
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 mb-3">ℹ️ About</p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Version: 1.0.0</p>
                <p>Backend: Next.js 14</p>
                <p>Database: PostgreSQL + Redis</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 my-6" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </>
  );
}
