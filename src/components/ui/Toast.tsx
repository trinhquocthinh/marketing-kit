'use client';

import { useEffect, useState } from 'react';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const config = {
  success: {
    icon: CheckCircle2,
    color: 'var(--success)',
  },
  error: {
    icon: AlertCircle,
    color: 'var(--danger)',
  },
  info: {
    icon: Info,
    color: 'var(--info)',
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

  const { icon: Icon, color } = config[type];

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-full border border-[var(--surface-glass-border)] bg-[var(--surface-glass-strong)] py-3 pr-6 pl-3 shadow-[var(--shadow-glass-md)] backdrop-blur-[var(--blur-glass)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      >
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <span className="text-sm font-bold text-[var(--text-strong)]">{message}</span>
    </div>
  );
}
