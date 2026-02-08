"use client";

import { FileNode } from "@/types";
import { useEffect, useRef, useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

interface PreviewProps {
  files: FileNode[];
}

export function Preview({ files }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!iframeRef.current) return;

    const findFile = (nodes: FileNode[], name: string): FileNode | undefined => {
      for (const node of nodes) {
        if (node.name === name) return node;
        if (node.children) {
          const found = findFile(node.children, name);
          if (found) return found;
        }
      }
      return undefined;
    };

    const appFile = findFile(files, "App.tsx") || findFile(files, "App.jsx");
    const indexCss = findFile(files, "index.css");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { background: white; margin: 0; padding: 0; }
            ${indexCss?.content || ""}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              ${appFile?.content || "const App = () => <div>No App.tsx found</div>;"}

              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            } catch (err) {
              document.getElementById('root').innerHTML = "Runtime Error: " + err.message;
              console.error(err);
            }
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [files, refreshKey]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] text-muted-foreground font-mono">localhost:3000</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1 hover:bg-[#18181b] rounded text-muted-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-[#18181b] rounded text-muted-foreground transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-[#27272a] shadow-2xl">
        <iframe ref={iframeRef} className="w-full h-full border-none" title="Preview" />
      </div>
    </div>
  );
}
