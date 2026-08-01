import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function GlassCard({ children, className = "", interactive = false }: GlassCardProps) {
  return (
    <div
      className={`glass neon-border ${interactive ? "hover:neon-glow transition-all duration-300 cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
