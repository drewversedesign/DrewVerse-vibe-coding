"use client";

import { FileNode } from "@/types";
import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode;
}

export function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  return (
    <div className="flex flex-col h-full bg-[#09090b] border-r border-[#27272a] w-64">
      <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Files
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {files.map((node) => (
          <FileNodeItem
            key={node.name}
            node={node}
            level={0}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
}

function FileNodeItem({
  node,
  level,
  onFileSelect,
  selectedFile
}: {
  node: FileNode;
  level: number;
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedFile?.name === node.name;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-full gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-[#18181b] rounded-md transition-colors"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Folder className="w-4 h-4 text-blue-400" />
          <span>{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <FileNodeItem
            key={child.name}
            node={child}
            level={level + 1}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node)}
      className={cn(
        "flex items-center w-full gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
        isSelected ? "bg-[#18181b] text-blue-400" : "text-muted-foreground hover:bg-[#18181b] hover:text-foreground"
      )}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
    >
      <File className="w-4 h-4" />
      <span>{node.name}</span>
    </button>
  );
}
