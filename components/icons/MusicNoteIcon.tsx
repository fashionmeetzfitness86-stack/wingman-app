import React from 'react';

export const MusicNoteIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9c0 .524-.136 1.02-.387 1.453l-4.16 7.488a.75.75 0 0 0 .658 1.114h10.378a.75.75 0 0 0 .659-1.114l-4.16-7.488A3.752 3.752 0 0 0 9 9Z" />
    </svg>
);