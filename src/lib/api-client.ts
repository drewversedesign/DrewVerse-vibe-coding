import { ChatMessage, FileNode, BrandConfig } from "@/types";

export async function generateProject(messages: ChatMessage[], currentFiles: FileNode[], brandConfig: BrandConfig) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentFiles, brandConfig }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate project");
  }

  return response.json();
}
