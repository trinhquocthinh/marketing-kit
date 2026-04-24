'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Compound Component pattern cho Dropdown.
 *
 * Usage:
 * ```tsx
 * <Dropdown onSelect={(val) => ...}>
 *   <Dropdown.Trigger>
 *     {({ selectedLabel, isOpen }) => <button>{selectedLabel ?? 'Chọn'} ▾</button>}
 *   </Dropdown.Trigger>
 *   <Dropdown.Content>
 *     <Dropdown.Item value="a">A</Dropdown.Item>
 *     <Dropdown.Separator />
 *     <Dropdown.Item value="b">B</Dropdown.Item>
 *   </Dropdown.Content>
 * </Dropdown>
 * ```
 *
 * Ưu điểm so với API `{ options, onSelect }` cũ:
 *  - Cấu trúc item linh hoạt (có thể chèn icon, description, separator).
 *  - Không ép buộc shape `{ id, title, isSelected }`.
 *  - Keyboard navigation (↑ ↓ Enter Esc) built-in.
 */

interface DropdownContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectedValue: string | null;
  selectedLabel: string | null;
  setSelected: (value: string, label: string) => void;
  onSelect?: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuPos: { top: number; left: number; width: number };
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  registerItem: (value: string) => number;
  items: React.MutableRefObject<string[]>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Dropdown>.`);
  }
  return ctx;
}

// ── Root ──────────────────────────────────────────────────

export interface DropdownRootProps {
  children: ReactNode;
  /** Giá trị khởi tạo (uncontrolled). */
  defaultValue?: string;
  defaultLabel?: string;
  /** Controlled value — nếu set thì Dropdown sẽ sync với props này. */
  value?: string | null;
  label?: string | null;
  /** Callback khi chọn. */
  onSelect?: (value: string) => void;
  className?: string;
}

function DropdownRoot({
  children,
  defaultValue = null as unknown as string,
  defaultLabel = null as unknown as string,
  value,
  label,
  onSelect,
  className,
}: DropdownRootProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(value ?? defaultValue ?? null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(label ?? defaultLabel ?? null);

  // Sync controlled props during render (React's "storing previous props" pattern)
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevValue, setPrevValue] = useState(value);
  const [prevLabel, setPrevLabel] = useState(label);
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setSelectedValue(value);
  }
  if (label !== undefined && label !== prevLabel) {
    setPrevLabel(label);
    setSelectedLabel(label);
  }
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const items = useRef<string[]>([]);

  const open = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, close, open]);

  const setSelected = useCallback(
    (value: string, label: string) => {
      setSelectedValue(value);
      setSelectedLabel(label);
      onSelect?.(value);
      close();
    },
    [close, onSelect],
  );

  const registerItem = useCallback((value: string) => {
    if (!items.current.includes(value)) items.current.push(value);
    return items.current.indexOf(value);
  }, []);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menuEl = document.getElementById('dropdown-menu-portal');
      if (menuEl?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          close();
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(items.current.length - 1, i + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(0, i - 1));
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Reset items registry khi mount/unmount (Content re-render)
  useEffect(() => {
    items.current = [];
  }, []);

  const contextValue = useMemo<DropdownContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      selectedValue,
      selectedLabel,
      setSelected,
      onSelect,
      triggerRef,
      menuPos,
      activeIndex,
      setActiveIndex,
      registerItem,
      items,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      selectedValue,
      selectedLabel,
      setSelected,
      onSelect,
      menuPos,
      activeIndex,
      registerItem,
    ],
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={rootRef} className={className}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// ── Trigger ───────────────────────────────────────────────

export interface DropdownTriggerProps {
  children: ReactNode | ((state: { isOpen: boolean; selectedLabel: string | null }) => ReactNode);
  className?: string;
  asChild?: boolean;
}

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { triggerRef, toggle, isOpen, selectedLabel } = useDropdownContext('Dropdown.Trigger');
  const rendered = typeof children === 'function' ? children({ isOpen, selectedLabel }) : children;

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={toggle}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      className={className}
    >
      {rendered}
    </button>
  );
}

// ── Content ───────────────────────────────────────────────

export interface DropdownContentProps {
  children: ReactNode;
  className?: string;
}

function DropdownContent({ children, className = '' }: DropdownContentProps) {
  const ctx = useDropdownContext('Dropdown.Content');

  if (!ctx.isOpen) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      id="dropdown-menu-portal"
      role="listbox"
      style={{
        position: 'fixed',
        top: ctx.menuPos.top,
        left: ctx.menuPos.left,
        minWidth: ctx.menuPos.width,
      }}
      className={`theme-transition z-[9999] overflow-hidden rounded-[var(--radius-bento-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-glass-strong)] p-1 shadow-[var(--shadow-glass-md)] backdrop-blur-[var(--blur-glass)] ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}

// ── Item ──────────────────────────────────────────────────

export interface DropdownItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

function DropdownItem({ value, children, disabled, className = '' }: DropdownItemProps) {
  const ctx = useDropdownContext('Dropdown.Item');
  const index = ctx.registerItem(value);
  const isActive = ctx.activeIndex === index;
  const isSelected = ctx.selectedValue === value;

  const label = typeof children === 'string' ? children : value;

  return (
    <button
      type="button"
      role="option"
      disabled={disabled}
      aria-selected={isSelected}
      onMouseEnter={() => ctx.setActiveIndex(index)}
      onClick={() => ctx.setSelected(value, label)}
      className={`w-full rounded-[calc(var(--radius-bento-sm)-0.25rem)] px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50 ${
        isActive ? 'bg-[var(--surface-hover)]' : ''
      } ${
        isSelected
          ? 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]'
          : 'text-[var(--text-secondary)]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ── Separator ─────────────────────────────────────────────

function DropdownSeparator({ className = '' }: { className?: string }) {
  return (
    <div
      className={`my-1 h-px bg-[var(--surface-glass-border)] ${className}`}
      role="separator"
    />
  );
}

// ── TriggerButton (convenience) ───────────────────────────

export interface DropdownTriggerButtonProps {
  /** Text hiển thị khi chưa chọn gì. */
  placeholder?: string;
  className?: string;
}

/**
 * Trigger có sẵn style pill + chevron — tiện để migrate từ API `<Dropdown options />` cũ.
 * Dùng khi bạn chỉ cần hiển thị label đã chọn + icon mũi tên.
 */
function DropdownTriggerButton({
  placeholder = 'Chọn',
  className = '',
}: DropdownTriggerButtonProps) {
  return (
    <DropdownTrigger
      className={`glass-input theme-transition flex w-full items-center justify-between px-5 py-3 text-sm font-bold text-[var(--text-strong)] ${className}`}
    >
      {({ isOpen, selectedLabel }) => (
        <>
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <svg
            className={`ml-2 h-4 w-4 shrink-0 text-[var(--primary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </>
      )}
    </DropdownTrigger>
  );
}

// ── Compound export ───────────────────────────────────────

type DropdownComponent = typeof DropdownRoot & {
  Trigger: typeof DropdownTrigger;
  TriggerButton: typeof DropdownTriggerButton;
  Content: typeof DropdownContent;
  Item: typeof DropdownItem;
  Separator: typeof DropdownSeparator;
};

const Dropdown = DropdownRoot as DropdownComponent;
Dropdown.Trigger = DropdownTrigger;
Dropdown.TriggerButton = DropdownTriggerButton;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;

export default Dropdown;
