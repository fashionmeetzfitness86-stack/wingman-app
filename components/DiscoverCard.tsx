import React from 'react';

interface DiscoverCardProps {
  onClick: () => void;
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({ onClick }) => {
    return (
        <button onClick={onClick} className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden group text-left" aria-label="Discover and explore Miami">
            <img src="https://picsum.photos/seed/miami-explore/400/600" alt="A vibrant scene of Miami to explore" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Discover</p>
                <h3 className="text-2xl font-bold text-white mt-1">Explore Miami</h3>
            </div>
        </button>
    );
};