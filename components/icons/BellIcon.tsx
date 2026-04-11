import React from 'react';

export const BellIcon: React.FC<{ className?: string; isFilled?: boolean }> = ({ className = "w-6 h-6", isFilled = false }) => (
    isFilled ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M14 18.5a2.5 2.5 0 0 1-4 0" />
            <path fillRule="evenodd" d="M12 2.25c-4.97 0-9 4.03-9 9v.258a.75.75 0 0 0 .15.463l1.405 2.458a3.75 3.75 0 0 0 5.44 1.571 6.75 6.75 0 0 1 3.996 0 3.75 3.75 0 0 0 5.44-1.571l1.405-2.458a.75.75 0 0 0 .15-.463V11.25c0-4.97-4.03-9-9-9Z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
    )
);