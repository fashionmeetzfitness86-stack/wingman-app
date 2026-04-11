import React from 'react';

export const CookieIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 10.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 15.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
    </svg>
);