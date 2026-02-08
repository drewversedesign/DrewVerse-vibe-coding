import React, { useState, useEffect } from 'react';
import { Rocket, Check, Loader2, Globe, Github, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeployModalProps {
  show: boolean;
  onClose: () => void;
  projectName: string;
}

export const DeployModal = ({ show, onClose, projectName }: DeployModalProps) => {
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState('');

  const steps = [
    "Preparing project bundle...",
    "Creating GitHub repository...",
    "Configuring Render static site...",
    "Initializing build pipeline...",
    "Deploying to global CDN..."
  ];

  useEffect(() => {
    if (show) {
      setStep(0);
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setStep(currentStep);
        } else {
          setUrl(`https://${projectName.toLowerCase().replace(/\s+/g, '-')}.onrender.com`);
          clearInterval(interval);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [show, projectName]);

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
                <h3 className="font-bold">Deploy to Production</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!url ? (
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
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 py-4"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-foreground">Deployment Successful!</h4>
                    <p className="text-xs text-muted-foreground">Your project is now live on the global CDN.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-[#18181b] rounded-lg border border-[#27272a] flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-xs font-mono text-blue-400 truncate">{url}</span>
                      </div>
                      <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-foreground hover:underline">VISIT</a>
                    </div>
                    <div className="p-3 bg-[#18181b] rounded-lg border border-[#27272a] flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">repo: {projectName.toLowerCase().replace(/\s+/g, '-')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-[#18181b]/50 border-t border-[#27272a]">
              <button
                onClick={url ? onClose : undefined}
                className={cn(
                  "w-full py-2.5 rounded-xl text-xs font-bold transition-all",
                  url ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#27272a] text-muted-foreground cursor-not-allowed"
                )}
              >
                {url ? "Close" : "Deployment in Progress..."}
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
