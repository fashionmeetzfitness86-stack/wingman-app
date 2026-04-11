import React from 'react';

export const ChatBubbleLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227l.173.034a17.42 17.42 0 0 0 11.22 0l.173-.034c1.584-.233 2.707-1.626 2.707-3.227V6.741c0-1.602-1.123-2.995-2.707-3.228a17.421 17.421 0 0 0-11.22 0C4.123 3.746 3 5.14 3 6.741v6.018Z" />
    </svg>
);