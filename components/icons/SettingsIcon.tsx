import React from 'react';

export const SettingsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.008 1.11-1.226.55-.218 1.19-.243 1.73.063.54.305.94.848 1.11 1.423.17.575.05 1.21-.32 1.695l-.37.482a2.25 2.25 0 0 1-3.414 0l-.37-.482c-.37-.485-.49-1.12-.32-1.695ZM12 7.5a2.25 2.25 0 0 0-2.25 2.25v.75a.75.75 0 0 1-1.5 0v-.75a3.75 3.75 0 1 1 7.5 0v.75a.75.75 0 0 1-1.5 0v-.75A2.25 2.25 0 0 0 12 7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 16.5a1.5 1.5 0 0 0-1.06-2.562c-1.066-.358-2.208.26-2.567 1.328l-.08.24a1.5 1.5 0 0 0 2.828 1.06l.08-.24a1.5 1.5 0 0 0-1.28-1.826ZM5.625 16.5a1.5 1.5 0 0 1 1.06-2.562c1.066-.358 2.208.26 2.567 1.328l.08.24a1.5 1.5 0 0 1-2.828 1.06l-.08-.24a1.5 1.5 0 0 1 1.28-1.826Z" />
  </svg>
);
