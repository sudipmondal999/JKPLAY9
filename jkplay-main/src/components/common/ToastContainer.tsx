import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../stores/toastStore.js';
import { X, Moon, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSleep = toast.title.includes('🌙') || toast.title.toLowerCase().includes('sleep');

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
                isSleep
                  ? 'bg-[#10101C]/95 border-indigo-500/40 shadow-indigo-950/50 text-white'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-rose-950/40'
                  : toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/40'
                  : 'bg-[#12121C]/95 border-white/10 text-white shadow-purple-950/40'
              }`}
            >
              {/* Icon */}
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSleep
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : toast.type === 'error'
                    ? 'bg-rose-500/20 text-rose-300'
                    : toast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}
              >
                {isSleep ? (
                  <Moon className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-xs font-semibold leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-300/90 mt-0.5 leading-snug whitespace-pre-line">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
