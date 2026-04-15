'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
        ref.current && !ref.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
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
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-white/10 rounded-lg bg-black/20 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/50 backdrop-blur-sm"
      >
        <span>{selected?.title}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          className="z-[9999] bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg ${
                option.isSelected ? 'text-orange-400 font-medium bg-white/5' : 'text-slate-300'
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
        document.body
      )}
    </div>
  );
}
