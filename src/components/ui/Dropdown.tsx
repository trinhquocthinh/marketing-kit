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
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FA875B]"
      >
        <span>{selected?.title}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                option.isSelected ? 'text-[#FA875B] font-medium bg-orange-50' : 'text-gray-700'
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
