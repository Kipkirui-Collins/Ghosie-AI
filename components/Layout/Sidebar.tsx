"use client";
import ConversationList from "../../features/conversations/ConversationList";
import { useCallback, useState } from "react";

export default function Sidebar() {
  const [creating, setCreating] = useState(false);

  const handleNewConversation = useCallback(async () => {
    setCreating(true);
    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" })
      });
      // Refresh list — ideally via a cache invalidation signal
      window.location.reload();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreating(false);
    }
  }, []);

  return (
    <div className="h-full glass neon-border p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-glow">Conversations</h2>
          <p className="text-xs text-slate-400 mt-1">Your chat history</p>
        </div>
      </div>
      
      <button
        onClick={handleNewConversation}
        disabled={creating}
        className="button-neon w-full flex items-center justify-center gap-2 py-2"
      >
        <span className="text-lg">+</span>
        <span>{creating ? "Creating..." : "New Chat"}</span>
      </button>

      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </div>
  );
}
