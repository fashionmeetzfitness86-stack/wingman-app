
import React from 'react';

export const CartIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.34 1.087-.835l3.38-7.372a.513.513 0 0 0-.11-1.002H7.5M7.5 14.25 5.106 5.165m0 0a2.25 2.25 0 0 1 2.13-2.31H18M7.5 14.25a3 3 0 0 0 3 3h.536" />
    </svg>
);