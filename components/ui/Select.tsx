import React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const baseClasses = 'w-full bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-lg p-3 appearance-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-ring)] outline-none pr-8';

    return (
      <div className="relative">
        <select
          className={`${baseClasses} ${className}`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="w-5 h-5 text-[var(--color-text-muted)] absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }
);
