import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed top-24 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between w-full p-4 rounded-xl shadow-glass border border-slate-800 bg-dark-900/90 backdrop-blur-md animate-[slideIn_0.2s_ease-out]"
          >
            <div className="flex items-center space-x-3">
              {/* Type Icons */}
              {toast.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-brand-400 shrink-0" />
              )}
              <span className="text-sm font-medium text-slate-100">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-slate-500 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
