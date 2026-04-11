import React from 'react';

export const ChatIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.05 1.05 0 0 1-1.664-1.223l1.223-4.286c-.43-.162-.833-.374-1.2-.642M12 9.75a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 0A2.25 2.25 0 1 0 12 5.25v4.5Z" />
    </svg>
);