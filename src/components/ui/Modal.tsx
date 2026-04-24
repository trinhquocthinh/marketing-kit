'use client';

import { type ReactNode, useCallback, useEffect } from 'react';

import { X } from 'lucide-react';

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
  xl: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

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
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay-bg)] backdrop-blur-md duration-200 md:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-in slide-in-from-bottom-10 md:zoom-in-95 md:slide-in-from-bottom-0 relative mx-0 flex w-full flex-col overflow-hidden rounded-t-[var(--radius-bento-lg)] border border-[var(--surface-glass-border)] bg-[var(--surface-glass-strong)] shadow-[var(--shadow-glass-lg)] backdrop-blur-[var(--blur-glass-strong)] duration-300 md:mx-4 md:rounded-[var(--radius-bento-lg)] ${sizeClasses[size]} max-h-[90vh]`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--surface-glass-border)] px-6 py-5">
            <h3 className="text-lg font-black tracking-tight text-[var(--text-strong)] uppercase">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
              aria-label="Close"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        )}
        <div className="custom-scrollbar overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
