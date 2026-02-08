"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface ChatProps {
  onSend: (message: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
}

export function Chat({ onSend, messages, isLoading }: ChatProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-[#27272a]">
        Activity
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "p-3 rounded-lg text-sm",
            msg.role === "user" ? "bg-[#18181b] ml-4" : "bg-blue-600/10 border border-blue-500/20 mr-4"
          )}>
            <div className="font-bold mb-1 text-[10px] uppercase opacity-50">
              {msg.role === "user" ? "You" : "Builder"}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Building...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#27272a]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
