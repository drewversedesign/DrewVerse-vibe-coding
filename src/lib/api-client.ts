import { ChatMessage, FileNode } from "@/types";

export async function generateProject(messages: ChatMessage[], currentFiles: FileNode[]) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentFiles }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate project");
  }

  return response.json();
}
