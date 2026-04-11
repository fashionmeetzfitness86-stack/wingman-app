import React from 'react';

export const BookmarkIcon: React.FC<{ className?: string; isFilled?: boolean }> = ({ className = "w-6 h-6", isFilled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={isFilled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c.1.128.2.27.2.428V21L12 17.25 6.207 21V3.75c0-.158.1-.3.2-.428.32-.403.87-.672 1.453-.672h7.68c.583 0 1.133.269 1.453.672Z" />
  </svg>
);