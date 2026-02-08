"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeViewerProps {
  code: string;
  language?: string;
}

export function CodeViewer({ code, language = "typescript" }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col relative group">
      <button
        onClick={handleCopy}
        className="absolute right-4 top-4 p-2 bg-[#18181b] border border-[#27272a] rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-[#27272a]"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "20px",
            minHeight: "100%",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
