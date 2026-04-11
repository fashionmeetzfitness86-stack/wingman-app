import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = 'w-full bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-ring)] outline-none resize-none';
    
    return (
      <textarea
        className={`${baseClasses} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
