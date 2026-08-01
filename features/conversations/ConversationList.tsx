"use client";
import { useEffect, useState } from "react";

type Conv = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selected) {
        const firstId = data[0].id;
        setSelected(firstId);
        window.dispatchEvent(new CustomEvent("conversation:selected", { detail: { conversationId: firstId } }));
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConversations();

    const handleRefresh = () => {
      void loadConversations();
    };

    window.addEventListener("conversation:created", handleRefresh as EventListener);
    window.addEventListener("conversation:updated", handleRefresh as EventListener);

    return () => {
      window.removeEventListener("conversation:created", handleRefresh as EventListener);
      window.removeEventListener("conversation:updated", handleRefresh as EventListener);
    };
  }, []);

  const handleSelect = (conversationId: string) => {
    setSelected(conversationId);
    window.dispatchEvent(new CustomEvent("conversation:selected", { detail: { conversationId } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="loader">
          <span className="loader-dot bg-cyan-400"></span>
          <span className="loader-dot bg-fuchsia-400"></span>
          <span className="loader-dot bg-violet-400"></span>
        </div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-400">
        <p>No conversations yet.</p>
        <p className="mt-2 text-xs">Start a new chat to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => handleSelect(conversation.id)}
          className={`rounded-xl border p-3 text-left transition-all duration-200 ${
            selected === conversation.id
              ? "border-cyan-500/50 bg-gradient-to-r from-cyan-500/15 to-violet-500/10 shadow-[0_0_20px_rgba(0,240,255,0.16)]"
              : "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-white/10"
          }`}
        >
          <div className="truncate text-sm font-medium text-slate-100">{conversation.title}</div>
          <div className="mt-1 text-xs text-slate-500">
            {new Date(conversation.updatedAt).toLocaleDateString()}
          </div>
        </button>
      ))}
    </div>
  );
}
