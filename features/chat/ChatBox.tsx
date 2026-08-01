"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Message from "./Message";
import LoaderDots from "../../components/ui/LoaderDots";

type Msg = { id?: string; role: string; content: string };

export default function ChatBox() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function loadConversationMessages(conversationId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function ensureConversation() {
    if (activeConversationId) return activeConversationId;

    const convRes = await fetch("/api/conversations");
    const convs = await convRes.json();

    if (Array.isArray(convs) && convs[0]) {
      const firstConversationId = convs[0].id;
      setActiveConversationId(firstConversationId);
      return firstConversationId;
    }

    const createRes = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Conversation" })
    });

    const createdConversation = await createRes.json();
    const createdConversationId = createdConversation?.id;
    if (createdConversationId) {
      setActiveConversationId(createdConversationId);
      window.dispatchEvent(new CustomEvent("conversation:created", { detail: { conversationId: createdConversationId } }));
      return createdConversationId;
    }

    throw new Error("Unable to create or load a conversation");
  }

  useEffect(() => {
    const handleConversationSelection = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>;
      const selectedConversationId = customEvent.detail?.conversationId;
      if (selectedConversationId) {
        void loadConversationMessages(selectedConversationId);
      }
    };

    window.addEventListener("conversation:selected", handleConversationSelection as EventListener);
    return () => {
      window.removeEventListener("conversation:selected", handleConversationSelection as EventListener);
    };
  }, []);

  useEffect(() => {
    async function loadInitialConversation() {
      const convRes = await fetch("/api/conversations");
      const convs = await convRes.json();
      if (Array.isArray(convs) && convs[0]?.id) {
        await loadConversationMessages(convs[0].id);
      }
    }

    void loadInitialConversation();
  }, []);

  async function handleSend() {
    if (!value.trim() || loading) return;

    const prompt = value.trim();
    setValue("");
    setLoading(true);

    try {
      const conversationId = await ensureConversation();
      setMessages((previous) => [...previous, { role: "user", content: prompt }]);

      const res = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, prompt })
      });

      if (!res.body) {
        throw new Error("Streaming response unavailable");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      setMessages((previous) => [...previous, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1] ?? "";

        for (let index = 0; index < lines.length - 1; index += 1) {
          const line = lines[index].trim();
          if (!line || line === "data: [DONE]") continue;

          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6));
              const token = payload?.text || "";
              if (token) {
                assistantText += token;
                setMessages((previous) => {
                  const last = previous[previous.length - 1];
                  if (last && last.role === "assistant") {
                    return [...previous.slice(0, -1), { role: "assistant", content: assistantText }];
                  }
                  return [...previous, { role: "assistant", content: assistantText }];
                });
              }
            } catch {
              // Ignore malformed stream fragments.
            }
          }
        }
      }

      window.dispatchEvent(new CustomEvent("conversation:updated"));
    } catch (error) {
      console.error("Stream error:", error);
      setMessages((previous) => [...previous, { role: "assistant", content: "The assistant could not respond right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-cyan-300">Ghosie AI</h1>
          <p className="mt-0.5 text-xs text-slate-400">AI assistant • live streaming</p>
        </div>
        {session?.user && (
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
            {session.user.image && (
              <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full border border-cyan-400/30" />
            )}
            <span className="text-sm text-slate-300">{session.user.name}</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-xl text-cyan-300">Welcome to Ghosie AI</p>
              <p className="text-sm text-slate-400">Start a conversation and let the assistant respond in real time.</p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`}>
            <Message role={message.role} content={message.content} />
          </div>
        ))}
        {loading && (
          <div className="mr-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-violet-500/5 p-4">
            <LoaderDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <textarea
          className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none ring-0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask anything..."
          disabled={loading}
          rows={2}
        />
        <button
          type="submit"
          className="button-neon flex items-center justify-center gap-2 px-6 py-3 sm:min-w-[140px]"
          disabled={loading || !value.trim()}
        >
          {loading ? <LoaderDots /> : <><span>Send</span><span className="text-lg">→</span></>}
        </button>
      </form>
    </div>
  );
}
