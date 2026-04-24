import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block pl-3 text-[10px] font-black tracking-widest text-[var(--primary)] uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`glass-input theme-transition w-full px-5 py-3.5 text-sm font-bold ${
            error ? '!border-[var(--danger)]' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 pl-3 text-[10px] font-black tracking-widest text-[var(--danger)] uppercase">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
