"use client";

import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeViewer } from "@/components/CodeViewer";
import { Preview } from "@/components/Preview";
import { Chat } from "@/components/Chat";
import { StarterPrompts } from "@/components/StarterPrompts";
import { FileNode, ChatMessage } from "@/types";
import { generateProject } from "@/lib/api-client";
import { Download, Layout, Code as CodeIcon, Monitor, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

export default function Home() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! I'm your Personal AI Software Builder. What would you like to build today?" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const handleSend = async (content: string) => {
    const userMsg: ChatMessage = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await generateProject([...messages, userMsg], files);
      setFiles(result.files);
      setMessages(prev => [...prev, { role: "assistant", content: result.explanation }]);

      if (!selectedFile) {
        const findApp = (nodes: FileNode[]): FileNode | undefined => {
          for (const node of nodes) {
            if (node.name === "App.tsx") return node;
            if (node.children) {
              const f = findApp(node.children);
              if (f) return f;
            }
          }
        };
        const app = findApp(result.files);
        if (app) setSelectedFile(app);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please check your API key and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const addToZip = (nodes: FileNode[], path = "") => {
      nodes.forEach(node => {
        const currentPath = path ? `${path}/${node.name}` : node.name;
        if (node.type === "file") {
          zip.file(currentPath, node.content || "");
        } else if (node.children) {
          addToZip(node.children, currentPath);
        }
      });
    };
    addToZip(files);
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090b] text-foreground">
      <header className="h-14 border-b border-[#27272a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold tracking-tight">Personal AI Builder</h1>
          <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-medium ml-2">PRO</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={files.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#18181b] hover:bg-[#27272a] rounded-md border border-[#27272a] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export ZIP
          </button>
          <a href="https://github.com" target="_blank" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <FileExplorer files={files} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
        <div className="flex-1 flex flex-col bg-[#020202]">
          <div className="flex items-center gap-1 p-2 border-b border-[#27272a]">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === "preview" ? "bg-[#18181b] text-foreground" : "text-muted-foreground hover:bg-[#18181b]"
              )}
            >
              <Monitor className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === "code" ? "bg-[#18181b] text-foreground" : "text-muted-foreground hover:bg-[#18181b]"
              )}
            >
              <CodeIcon className="w-4 h-4" />
              Code
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            {activeTab === "preview" ? (
              files.length > 0 ? <Preview files={files} /> : (
                <div className="h-full flex flex-col items-center justify-center space-y-8 p-6 text-center">
                  <div className="space-y-2">
                    <div className="inline-block p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-4">
                      <Layout className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">What are we building today?</h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">I can help you build full-stack web applications, tools, and landing pages with professional, human-quality code.</p>
                  </div>
                  <StarterPrompts onSelect={handleSend} />
                </div>
              )
            ) : (
              selectedFile ? (
                <div className="h-full rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden">
                  <CodeViewer code={selectedFile.content || ""} language={selectedFile.name.endsWith(".css") ? "css" : "typescript"} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Select a file to view its code
                </div>
              )
            )}
          </div>
        </div>
        <Chat messages={messages} onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}
