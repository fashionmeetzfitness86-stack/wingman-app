import React from 'react';

export const RouteIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.378 0 .75.19 1.006.502l2.321 2.898M10.125 2.25a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM15.375 12a.75.75 0 0 0-.75-.75H4.5a.75.75 0 0 0 0 1.5h10.125a.75.75 0 0 0 .75-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h3.75a1.5 1.5 0 0 0 1.5-1.5V8.25a1.5 1.5 0 0 0-1.5-1.5H15M18 19.5v-1.5m0-10.5v-1.5" />
    </svg>
);