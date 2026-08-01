export default function Message({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  
  return (
    <div className={`p-4 rounded-lg message-animate ${
      isUser 
        ? "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 ml-8 text-right" 
        : "bg-gradient-to-r from-violet-500/10 to-violet-500/5 border border-violet-500/20 mr-8"
    }`}>
      <div className="text-sm leading-relaxed">{content}</div>
    </div>
  );
}
