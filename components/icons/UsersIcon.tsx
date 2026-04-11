import React from 'react';

export const UsersIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.253 9.5 9.5 0 0 0-1.025-1.025 4.875 4.875 0 0 0-6.175-1.125 4.875 4.875 0 0 0-6.175 1.125 9.5 9.5 0 0 0-1.025 1.025 9.337 9.337 0 0 0 4.121 2.253A9.38 9.38 0 0 0 12 19.5a9.38 9.38 0 0 0 3-1.372Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
    </svg>
);
