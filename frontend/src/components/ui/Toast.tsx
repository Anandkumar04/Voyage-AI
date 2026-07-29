import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useToastStore, ToastMessage } from '../../store/toastStore';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div 
      aria-live="polite" 
      role="status" 
      aria-atomic="true"
      className="fixed top-20 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-2 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 shadow-xl rounded-[18px] p-4 flex items-start gap-3 backdrop-blur-md relative overflow-hidden group"
          >
            {getIcon(toast.type)}
            <div className="flex-1 pr-6">
              <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100 leading-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-1 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#A8A399] hover:text-[#2D2D2D] dark:hover:text-zinc-100 p-1 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
