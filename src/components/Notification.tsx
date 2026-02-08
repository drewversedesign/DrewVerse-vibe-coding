import React from 'react';
import { Database, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  show: boolean;
  type: 'db' | 'auth';
  onClose: () => void;
}

export const Notification = ({ show, type, onClose }: NotificationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-24 left-1/2 z-50 bg-[#18181b] border border-blue-500/50 rounded-xl p-4 shadow-2xl flex items-center gap-4 min-w-[300px]"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
            {type === 'db' ? <Database className="w-5 h-5 text-blue-400" /> : <ShieldCheck className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-foreground">
              {type === 'db' ? 'Neon Database Provisioned' : 'Neon Auth Configured'}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              I've automatically set up the {type === 'db' ? 'PostgreSQL database' : 'authentication service'} for your project.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
