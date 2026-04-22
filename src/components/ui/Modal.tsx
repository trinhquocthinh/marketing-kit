'use client';

import { ReactNode, useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`glass-card relative rounded-2xl w-full theme-transition ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[var(--primary)]/50 to-transparent" />
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
