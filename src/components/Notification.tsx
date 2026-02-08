import React, { useState } from 'react';
import { Database, ShieldCheck, X, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  show: boolean;
  type: 'db' | 'auth';
  onClose: () => void;
  onProvision?: () => Promise<void>;
}

export const Notification = ({ show, type, onClose, onProvision }: NotificationProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleProvision = async () => {
    if (!onProvision) return;
    setStatus('loading');
    try {
      await onProvision();
      setStatus('success');
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-24 left-1/2 z-50 bg-[#18181b] border border-blue-500/50 rounded-xl p-4 shadow-2xl flex items-center gap-4 min-w-[320px]"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
            {type === 'db' ? <Database className="w-5 h-5 text-blue-400" /> : <ShieldCheck className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-foreground">
              {type === 'db' ? 'Neon Database Detected' : 'Neon Auth Needed'}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              This project requires {type === 'db' ? 'PostgreSQL' : 'Authentication'}.
            </p>
          </div>
          {status === 'idle' ? (
            <button
              onClick={handleProvision}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md transition-all shrink-0"
            >
              Provision
            </button>
          ) : status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-green-500 shrink-0" />
          )}
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md transition-colors ml-2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
