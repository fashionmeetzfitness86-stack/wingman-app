import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const baseClasses = 'bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] rounded-lg overflow-hidden';

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};
