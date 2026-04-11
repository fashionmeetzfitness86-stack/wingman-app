import React from 'react';

export const PencilSquareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 19.82a2.25 2.25 0 0 1-1.06.621l-3.375 1.05a.75.75 0 0 1-.92-1.026l1.05-3.375a2.25 2.25 0 0 1 .622-1.06l11.096-11.096Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.872 6.803 3.328 3.328" />
    </svg>
);