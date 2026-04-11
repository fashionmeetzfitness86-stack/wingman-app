import React from 'react';

export const AskGabyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.375L9.75 4.5l-.75 1.875M10.5 6.375V8.25m0-1.875h1.875m-1.875 0L8.625 4.5M16.5 11.25l-1.875-1.875-1.875 1.875m3.75 0h-3.75m3.75 0V9.375m0 1.875l-1.875 1.875M7.5 15.75l1.875 1.875 1.875-1.875m-3.75 0v-1.875m0 1.875h3.75m-3.75 0L5.625 13.875" />
    </svg>
);