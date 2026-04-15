'use client';

import { useState, useRef, useEffect } from 'react';

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
  const selected = options.find((o) => o.isSelected) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-white/10 rounded-lg bg-black/20 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/50 backdrop-blur-sm"
      >
        <span>{selected?.title}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
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
        </div>
      )}
    </div>
  );
}
