"use client";

import { useState, useEffect } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeViewer } from "@/components/CodeViewer";
import { Preview } from "@/components/Preview";
import { Chat } from "@/components/Chat";
import { StarterPrompts } from "@/components/StarterPrompts";
import { Notification } from "@/components/Notification";
import { DeployModal } from "@/components/DeployModal";
import { FileNode, ChatMessage, BrandConfig, ProjectVersion } from "@/types";
import { generateProject } from "@/lib/api-client";
import {
  Download,
  Layout,
  Code as CodeIcon,
  Monitor,
  Rocket,
  History,
  Palette,
  Search,
  ChevronLeft,
  Menu,
  MessageSquare,
  Briefcase
} from "lucide-react";
import JSZip from "jszip";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  // New States for Features
  const [showHistory, setShowHistory] = useState(false);
  const [showDesign, setShowDesign] = useState(false);
  const [history, setHistory] = useState<ProjectVersion[]>([]);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    primaryColor: "#2563eb",
    borderRadius: "md",
    fontFamily: "Inter, sans-serif"
  });
  const [notification, setNotification] = useState<"db" | "auth" | null>(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview" | "code" | "project">("chat");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSend = async (content: string, isAudit = false) => {
    const userMsg: ChatMessage = { role: "user", content, isAudit };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await generateProject([...messages, userMsg], files, brandConfig);

      if (files.length > 0) {
        setHistory(prev => [{
          timestamp: Date.now(),
          files: [...files],
          message: messages[messages.length - 1]?.content || "Update"
        }, ...prev]);
      }

      setFiles(result.files);
      setMessages(prev => [...prev, { role: "assistant", content: result.explanation }]);

      if (result.requiresNeonDb) setNotification("db");
      else if (result.requiresNeonAuth) setNotification("auth");

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
      setMessages(prev => [...prev, { role: "assistant", content: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreVersion = (version: ProjectVersion) => {
    setFiles(version.files);
    setMessages(prev => [...prev, { role: "assistant", content: "Restored version from " + new Date(version.timestamp).toLocaleTimeString() }]);
    setShowHistory(false);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const addToZip = (nodes: FileNode[], path = "") => {
      nodes.forEach(node => {
        const currentPath = path ? path + "/" + node.name : node.name;
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSend("Audit the design and suggest improvements.", true)}
            disabled={files.length === 0 || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#18181b] hover:bg-[#27272a] rounded-md border border-[#27272a] transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">AI Audit</span>
          </button>
          <button
            onClick={() => setShowDeploy(true)}
            disabled={files.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Deploy</span>
          </button>
          <div className="w-[1px] h-4 bg-[#27272a] mx-1" />
          <button
            onClick={handleDownload}
            disabled={files.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#18181b] hover:bg-[#27272a] rounded-md border border-[#27272a] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Tabs */}
        <div className={cn("border-r border-[#27272a] flex", isMobile ? (mobileTab === "project" ? "fixed inset-0 z-50 bg-[#020202] pt-14 pb-16" : "hidden") : "flex")}>
          <div className="w-12 border-r border-[#27272a] flex flex-col items-center py-4 gap-4">
            <button
              onClick={() => {setShowHistory(false); setShowDesign(false)}}
              className={cn("p-2 rounded-lg transition-colors", !showHistory && !showDesign ? "bg-blue-600/10 text-blue-400" : "text-muted-foreground hover:text-foreground")}
            >
              <CodeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {setShowHistory(true); setShowDesign(false)}}
              className={cn("p-2 rounded-lg transition-colors", showHistory ? "bg-blue-600/10 text-blue-400" : "text-muted-foreground hover:text-foreground")}
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => {setShowDesign(true); setShowHistory(false)}}
              className={cn("p-2 rounded-lg transition-colors", showDesign ? "bg-blue-600/10 text-blue-400" : "text-muted-foreground hover:text-foreground")}
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>

          <div className={cn("overflow-hidden", isMobile ? "flex-1" : "w-64")}>
            {showHistory ? (
              <div className="h-full flex flex-col">
                <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-[#27272a]">History</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">No versions yet</div>
                  ) : (
                    history.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => restoreVersion(v)}
                        className="w-full text-left p-3 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-blue-500/50 transition-all"
                      >
                        <div className="text-[10px] text-blue-400 font-mono mb-1">{new Date(v.timestamp).toLocaleTimeString()}</div>
                        <div className="text-xs text-foreground line-clamp-2">{v.message}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : showDesign ? (
              <div className="h-full flex flex-col">
                <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-[#27272a]">Brand Tuning</div>
                <div className="p-4 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase">Primary Color</label>
                    <input
                      type="color"
                      value={brandConfig.primaryColor}
                      onChange={(e) => setBrandConfig(prev => ({...prev, primaryColor: e.target.value}))}
                      className="w-full h-8 rounded bg-[#18181b] border border-[#27272a] cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase">Font Family</label>
                    <select
                      value={brandConfig.fontFamily}
                      onChange={(e) => setBrandConfig(prev => ({...prev, fontFamily: e.target.value}))}
                      className="w-full px-2 py-1.5 text-xs rounded bg-[#18181b] border border-[#27272a] text-foreground outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="Inter, sans-serif">Inter (Modern)</option>
                      <option value="serif">Merriweather (Classic)</option>
                      <option value="monospace">JetBrains Mono (Tech)</option>
                      <option value="system-ui">System Default</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase">Rounding</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setBrandConfig(prev => ({...prev, borderRadius: r}))}
                          className={cn(
                            "px-2 py-1.5 text-xs rounded border transition-all",
                            brandConfig.borderRadius === r ? "bg-blue-600 border-blue-500 text-white" : "bg-[#18181b] border-[#27272a] text-muted-foreground"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <FileExplorer files={files} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
            )}
          </div>
        </div>

        <div className={cn("flex-1 flex flex-col bg-[#020202]", isMobile ? (mobileTab === "preview" || mobileTab === "code" ? "flex" : "hidden") : "flex")}>
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
        <div className={cn(isMobile ? (mobileTab === "chat" ? "fixed inset-0 z-50 bg-[#020202] pt-14 pb-16" : "hidden") : "w-96 flex flex-col border-l border-[#27272a] bg-[#09090b]")}><Chat messages={messages} onSend={handleSend} isLoading={isLoading} /></div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#09090b] border-t border-[#27272a] flex items-center justify-around z-[60] px-2">
          <button
            onClick={() => setMobileTab("chat")}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", mobileTab === "chat" ? "text-blue-400" : "text-muted-foreground")}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Chat</span>
          </button>
          <button
            onClick={() => {setMobileTab("preview"); setActiveTab("preview")}}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", mobileTab === "preview" ? "text-blue-400" : "text-muted-foreground")}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-[10px]">Preview</span>
          </button>
          <button
            onClick={() => {setMobileTab("code"); setActiveTab("code")}}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", mobileTab === "code" ? "text-blue-400" : "text-muted-foreground")}
          >
            <CodeIcon className="w-5 h-5" />
            <span className="text-[10px]">Code</span>
          </button>
          <button
            onClick={() => setMobileTab("project")}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", mobileTab === "project" ? "text-blue-400" : "text-muted-foreground")}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px]">Project</span>
          </button>
        </div>
      )}
      </main>

      <Notification show={!!notification} type={notification || "db"} onClose={() => setNotification(null)} />
      <DeployModal show={showDeploy} onClose={() => setShowDeploy(false)} projectName={files.length > 0 ? files[0].name : "My Project"} files={files} />
    </div>
  );
}
