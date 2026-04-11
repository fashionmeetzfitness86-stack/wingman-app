
import React from 'react';

export const FriendsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.289 2.72a3 3 0 0 1-4.682-2.72 9.094 9.094 0 0 1 3.741-.479m7.289 2.72a8.973 8.973 0 0 1-7.289-2.72M12 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 2.25a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0ZM12 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 2.25a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" />
    </svg>
);
