import React from 'react';

export const HandWavingIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 17.159c-.19.423-.393.83-.625 1.222-.232.392-.482.766-.75 1.111m-1.112-2.333a52.284 52.284 0 0 1-3.634-2.22m-1.112-2.333c-.344.479-.705.938-1.09 1.373-.386.434-.787.84-1.214 1.214m12.26-9.11a4.5 4.5 0 0 0-6.364-6.364l-1.09 1.09a4.5 4.5 0 0 0 6.364 6.364l1.09-1.09Zm-6.364 6.364a4.5 4.5 0 0 0 6.364-6.364l-1.09 1.09a4.5 4.5 0 0 0-6.364 6.364l1.09-1.09Z" />
    </svg>
);
