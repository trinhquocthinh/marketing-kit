import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary:
    'bg-linear-to-br from-orange-400 to-rose-400 text-white shadow-[var(--glow-primary)] hover:shadow-[var(--glow-primary-strong)] hover:brightness-110 border border-white/10',
  secondary:
    'glass-card text-[var(--text-primary)] hover:border-[var(--border-bright)] hover:bg-[var(--surface-hover)]',
  danger:
    'bg-linear-to-br from-rose-500 to-red-600 text-white shadow-[var(--glow-rose)] hover:brightness-110 border border-white/10',
  ghost:
    'bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]',
  neon:
    'bg-[var(--surface)] text-[var(--primary)] border border-[var(--nav-active-border)] shadow-[var(--glow-primary)] hover:shadow-[var(--glow-primary-strong)] hover:bg-[var(--surface-hover)]',
};

const sizeClasses = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed theme-transition ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
