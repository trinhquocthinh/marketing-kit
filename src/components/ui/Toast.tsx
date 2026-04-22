'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<NonNullable<ToastProps['type']>, { accent: string; glow: string; icon: string }> = {
  success: {
    accent: 'border-l-4 border-l-emerald-400',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    icon: '✓',
  },
  error: {
    accent: 'border-l-4 border-l-rose-400',
    glow: 'shadow-[var(--glow-rose)]',
    icon: '✕',
  },
  info: {
    accent: 'border-l-4 border-l-[var(--primary)]',
    glow: 'shadow-[var(--glow-primary)]',
    icon: 'i',
  },
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = typeStyles[type];

  return (
    <div
      className={`glass-card fixed top-4 right-4 z-[100] flex items-center gap-3 pl-4 pr-5 py-3 rounded-xl text-[var(--text-primary)] text-sm font-medium transition-all duration-300 ${style.accent} ${style.glow} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-[var(--surface-hover)] font-bold text-xs">
        {style.icon}
      </span>
      <span>{message}</span>
    </div>
  );
}
