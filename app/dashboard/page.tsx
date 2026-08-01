import ChatBox from "../../features/chat/ChatBox";

export default function DashboardPage() {
  return (
    <div className="h-[calc(100vh-2rem)] rounded-3xl border border-white/10 bg-slate-950/50 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-4 lg:h-[calc(100vh-3rem)]">
      <ChatBox />
    </div>
  );
}
