'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeClasses = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
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

  return (
    <div
      className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg text-white text-sm shadow-lg transition-all duration-300 ${
        typeClasses[type]
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      {message}
    </div>
  );
}
