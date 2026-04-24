import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'btn-brand-glow',
  secondary:
    'glass-bento !shadow-none hover:!shadow-[var(--shadow-glass-sm)] text-[var(--text-strong)]',
  danger:
    'bg-[var(--danger)] hover:brightness-110 text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--danger)_35%,transparent)]',
  ghost:
    'bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-strong)] border border-transparent hover:border-[var(--surface-glass-border)]',
};

const sizeClasses = {
  sm: 'px-4 h-[46px] !py-0 text-xs tracking-wider',
  md: 'px-6 py-2.5 text-sm tracking-wider',
  lg: 'px-8 py-3.5 text-sm tracking-widest',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`theme-transition inline-flex items-center justify-center rounded-full font-black uppercase transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 -ml-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
