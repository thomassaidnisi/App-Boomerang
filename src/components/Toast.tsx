import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgClass = {
    success: 'bg-white border-l-4 border-l-emerald-500 border-y border-r border-gray-100 text-neutral-800',
    error: 'bg-white border-l-4 border-l-[#CC0000] border-y border-r border-gray-100 text-neutral-800',
    info: 'bg-white border-l-4 border-l-gray-400 border-y border-r border-gray-100 text-neutral-800',
  }[message.type];

  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#CC0000] shrink-0" />,
    info: <Info className="w-5 h-5 text-gray-400 shrink-0" />,
  }[message.type];

  return (
    <div
      id={`toast-${message.id}`}
      className={`flex items-center gap-3 p-4 rounded-xl shadow-xl ${bgClass} transition-all duration-300 max-w-sm w-full animate-slide-in`}
    >
      {icon}
      <p className="text-xs font-extrabold flex-1 pr-2 leading-snug">{message.text}</p>
      <button
        id={`btn-close-toast-${message.id}`}
        onClick={() => onClose(message.id)}
        className="text-gray-400 hover:text-neutral-800 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast message={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
