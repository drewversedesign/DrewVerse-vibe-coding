import { ChatMessage, FileNode, BrandConfig } from "@/types";

export async function generateProject(messages: ChatMessage[], currentFiles: FileNode[], brandConfig: BrandConfig) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentFiles, brandConfig }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate project");
  }

  return data;
}
