import React from 'react';
import { ShareIcon } from './icons/ShareIcon';

const NftCard: React.FC<{ image: string, title: string, description: string, tag: string }> = ({ image, title, description, tag }) => (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
        <img src={image} alt={title} className="w-full h-64 object-cover" />
        <div className="p-5">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 mt-2">{description}</p>
            <div className="flex justify-between items-center mt-4">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase">{tag}</span>
                <button className="text-gray-400 hover:text-white"><ShareIcon className="w-5 h-5" /></button>
            </div>
        </div>
    </div>
);

export const NftGalleryPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
        <h1 className="text-4xl font-bold text-white mb-6">My Collection</h1>
        <div className="space-y-6">
            <NftCard 
                image="https://picsum.photos/seed/yacht-nft/800/600"
                title="Exclusive Yacht Party Access"
                description="Unlock VIP access to our annual yacht party, featuring top DJs and a premium open bar."
                tag="Legendary"
            />
             <NftCard 
                image="https://picsum.photos/seed/dinner-nft/800/600"
                title="Celebrity Dinner Invite"
                description="A seat at an intimate dining experience with A-list celebrities and influencers."
                tag="Rare"
            />
        </div>
    </div>
  );
};
