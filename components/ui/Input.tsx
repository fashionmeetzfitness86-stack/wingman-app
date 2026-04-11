import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixIcon, ...props }, ref) => {
    const baseClasses = 'w-full bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-ring)] outline-none';
    const prefixClasses = prefixIcon ? 'pl-10' : '';

    return (
      <div className="relative">
        {prefixIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            {prefixIcon}
          </div>
        )}
        <input
          type={type}
          className={`${baseClasses} ${prefixClasses} ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);