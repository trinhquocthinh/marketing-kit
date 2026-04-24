'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownOption {
  id: string;
  title: string;
  isSelected?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  label?: string;
  className?: string;
}

export default function Dropdown({ options, onSelect, label, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find((o) => o.isSelected) || options[0];

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScroll = () => setIsOpen(false);
    const scrollParent = ref.current?.closest('.overflow-y-auto');
    scrollParent?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updatePosition);
    return () => {
      scrollParent?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="mb-2 block pl-3 text-[10px] font-black tracking-widest text-[var(--primary)] uppercase">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input theme-transition flex w-full items-center justify-between px-5 py-3 text-sm font-bold text-[var(--text-strong)]"
      >
        <span>{selected?.title}</span>
        <svg
          className={`ml-2 h-4 w-4 text-[var(--primary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
            className="theme-transition z-[9999] overflow-hidden rounded-[var(--radius-bento-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-glass-strong)] p-1 shadow-[var(--shadow-glass-md)] backdrop-blur-[var(--blur-glass)]"
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full rounded-[calc(var(--radius-bento-sm)-0.25rem)] px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-[var(--surface-hover)] ${
                  option.isSelected
                    ? 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option.title}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
