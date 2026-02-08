import React, { useState, useEffect, useRef } from 'react';
import { FileNode } from '@/types';
import { Smartphone, Tablet, Monitor, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  files: FileNode[];
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

export const Preview = ({ files }: PreviewProps) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [srcDoc, setSrcDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const generateSrcDoc = () => {
      const findFile = (nodes: FileNode[], name: string): string => {
        for (const node of nodes) {
          if (node.name === name) return node.content || '';
          if (node.children) {
            const content = findFile(node.children, name);
            if (content) return content;
          }
        }
        return '';
      };

      const appCode = findFile(files, 'App.tsx') || findFile(files, 'App.js') || 'export default function App() { return <div>No App.tsx found</div> }';
      const cssCode = findFile(files, 'index.css') || findFile(files, 'App.css') || '';

      const cleanedAppCode = appCode.replace(/import\s+.*\s+from\s+['"].*['"];?/g, '');

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
            <script src="https://unpkg.com/lucide@0.284.0/dist/umd/lucide.min.js"></script>
            <style>
              ${cssCode}
              body { margin: 0; background: white; min-height: 100vh; font-family: sans-serif; }
              #root { height: 100%; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              const { useState, useEffect, useMemo, useCallback, useRef } = React;
              const { motion, AnimatePresence } = FramerMotion;

              const Icon = ({ name, ...props }) => {
                const LucideIcon = lucide[name.charAt(0).toUpperCase() + name.slice(1)];
                return LucideIcon ? <LucideIcon {...props} /> : null;
              };

              ${cleanedAppCode}

              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            </script>
          </body>
        </html>
      `;
    };

    const timeout = setTimeout(() => {
      setSrcDoc(generateSrcDoc());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [files]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
          {(['mobile', 'tablet', 'desktop'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewport === v ? "bg-blue-600 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v === 'mobile' && <Smartphone className="w-4 h-4" />}
              {v === 'tablet' && <Tablet className="w-4 h-4" />}
              {v === 'desktop' && <Monitor className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSrcDoc(srcDoc)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-[#18181b] rounded-md transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
          <div className="w-[1px] h-4 bg-[#27272a]" />
          <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-[#18181b] rounded-md transition-colors">
            <ExternalLink className="w-3 h-3" />
            Open
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-[#27272a] overflow-hidden relative shadow-2xl transition-all duration-300 mx-auto"
           style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500 italic">Rendering your project...</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Preview"
          srcDoc={srcDoc}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals"
        />
      </div>
    </div>
  );
};
