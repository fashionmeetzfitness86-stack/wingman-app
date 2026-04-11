import React from 'react';

export const ChallengesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75h7.5" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M9 15.75h6" />
    </svg>
);