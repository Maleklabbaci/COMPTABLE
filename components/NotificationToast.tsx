import React, { useEffect } from 'react';
import { X, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'ai';
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100', 
      text: 'text-emerald-900',
      icon: <CheckCircle className="text-emerald-500" size={24} /> 
    },
    error: { 
      bg: 'bg-rose-50', 
      border: 'border-rose-100', 
      text: 'text-rose-900',
      icon: <AlertCircle className="text-rose-500" size={24} /> 
    },
    ai: { 
      bg: 'bg-indigo-50', 
      border: 'border-indigo-100', 
      text: 'text-indigo-900',
      icon: <Sparkles className="text-indigo-500" size={24} /> 
    }
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100] animate-slide-down pointer-events-none">
      <div className={`pointer-events-auto ${style.bg} border ${style.border} rounded-2xl p-4 shadow-xl shadow-slate-200/50 flex items-start gap-4 relative overflow-hidden backdrop-blur-xl`}>
        <div className="shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${style.text} text-sm mb-1`}>
            {type === 'ai' ? 'Vision IA' : type === 'error' ? 'Erreur' : 'Succès'}
          </h4>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-black/5"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;