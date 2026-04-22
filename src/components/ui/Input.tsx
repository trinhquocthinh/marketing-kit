import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-300 focus:outline-none focus:border-[var(--nav-active-border)] focus:shadow-[var(--glow-primary)] focus:bg-[var(--surface-hover)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] backdrop-blur-xl theme-transition ${
            error ? 'border-rose-500 shadow-[var(--glow-rose)]' : 'border-[var(--glass-border)]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
