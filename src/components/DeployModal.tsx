import React, { useState, useEffect } from 'react';
import { Rocket, Check, Loader2, Globe, Github, X, AlertCircle, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeployModalProps {
  show: boolean;
  onClose: () => void;
  projectName: string;
  files: any[];
}

export const DeployModal = ({ show, onClose, projectName, files }: DeployModalProps) => {
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [view, setView] = useState<'form' | 'progress' | 'success'>('form');

  const steps = [
    "Preparing project bundle...",
    "Validating GitHub repository...",
    "Configuring Render service...",
    "Initializing build pipeline...",
    "Deploying to global CDN..."
  ];

  const handleDeploy = async () => {
    if (!repoUrl) {
      setError("Please provide a GitHub Repository URL");
      return;
    }

    setIsDeploying(true);
    setError('');
    setView('progress');
    setStep(0);

    try {
      // Step-by-step UI progress
      for (let i = 0; i < steps.length; i++) {
        setStep(i);

        if (i === 2) { // The actual API call happens at configuration step
          const res = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, files, repoUrl })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Deployment failed");
          setUrl(data.url);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      setView('success');
    } catch (err: any) {
      setError(err.message);
      setView('form');
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setView('form');
      setUrl('');
      setError('');
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold">Deploy to Render</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {view === 'form' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GitHub Repository</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="https://github.com/user/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Ensure your code is pushed to this repo before deploying.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleDeploy}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Start Deployment
                  </button>
                </div>
              )}

              {view === 'progress' && (
                <div className="space-y-4">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center border text-[10px]",
                        step > i ? "bg-green-500/10 border-green-500/50 text-green-500" :
                        step === i ? "bg-blue-500/10 border-blue-500/50 text-blue-500" :
                        "border-[#27272a] text-muted-foreground"
                      )}>
                        {step > i ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        step === i ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s}
                      </span>
                      {step === i && <Loader2 className="w-3 h-3 animate-spin text-blue-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}

              {view === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Deployment Successful!</h4>
                      <p className="text-xs text-muted-foreground mt-1">Your project has been successfully provisioned on Render.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#18181b] rounded-xl border border-[#27272a] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-xs font-mono text-blue-400 truncate">{url}</span>
                      </div>
                      <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-foreground hover:underline shrink-0">VISIT SITE</a>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-[#18181b]/50 border-t border-[#27272a]">
              <button
                onClick={view === 'success' ? onClose : undefined}
                disabled={view === 'progress'}
                className={cn(
                  "w-full py-3 rounded-xl text-xs font-bold transition-all",
                  view === 'success' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#27272a] text-muted-foreground cursor-not-allowed"
                )}
              >
                {view === 'success' ? "Done" : view === 'progress' ? "Deploying..." : "Waiting for Configuration..."}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
