'use client';

import { useState, useEffect } from 'react';
import { Check, X, Copy } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      case 'info':
        return <Copy className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-success-foreground border-success/20';
      case 'error':
        return 'bg-destructive text-destructive-foreground border-destructive/20';
      case 'info':
        return 'bg-primary text-primary-foreground border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-2 px-3 py-2 rounded-md border
        shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${getColors()}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
