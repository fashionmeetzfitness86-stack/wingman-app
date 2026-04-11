
import React, { useState } from 'react';
import { Experience, UserAccessLevel, User, UserRole } from '../types';
import { KeyIcon } from './icons/KeyIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { TokenIcon } from './icons/TokenIcon';
import { HeartIcon } from './icons/HeartIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface ExperienceCardProps {
  experience: Experience;
  currentUser: User;
  onViewDetails: (experience: Experience) => void;
  onBook: (experience: Experience) => void;
  invitationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestAccess?: (experienceId: number) => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const USD_TO_TMKC_RATE = 100;

const getPriceForUser = (experience: Experience, user: User): { price?: number; text: string } => {
    const { pricing } = experience;

    const format = (price: number) => ({ price, text: `$${price.toLocaleString()}` });

    if (user.role === UserRole.PROMOTER || user.role === UserRole.ADMIN) {
        if (typeof pricing.promoter === 'number') {
            return format(pricing.promoter);
        }
    }
    if (user.accessLevel === UserAccessLevel.APPROVED_GIRL) {
        if (typeof pricing.female === 'number') {
            return pricing.female === 0 ? { price: 0, text: 'Complimentary' } : format(pricing.female);
        }
    }
    if (user.accessLevel === UserAccessLevel.ACCESS_MALE) {
        if (typeof pricing.male === 'number') {
            return format(pricing.male);
        }
    }
    if (typeof pricing.general === 'number') {
        return pricing.general === 0 ? { price: 0, text: 'Complimentary' } : format(pricing.general);
    }
    
    // Fallback if no specific price matches
    const fallbackPrice = pricing.general ?? pricing.male ?? pricing.female;
    if (typeof fallbackPrice === 'number') {
        return fallbackPrice === 0 ? { price: 0, text: 'Complimentary' } : format(fallbackPrice);
    }

    return { text: 'Invite Only' };
};


const getAccessLevelPriority = (level: UserAccessLevel) => {
    switch (level) {
        case UserAccessLevel.GENERAL: return 0;
        case UserAccessLevel.ACCESS_MALE: return 1;
        case UserAccessLevel.APPROVED_GIRL: return 2;
        case UserAccessLevel.ADMIN: return 3;
        default: return 0;
    }
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ 
    experience, 
    currentUser, 
    onViewDetails, 
    onBook, 
    invitationStatus = 'none', 
    onRequestAccess,
    isLiked,
    onToggleLike,
    isBookmarked,
    onToggleBookmark
}) => {
    
    const priceDetails = getPriceForUser(experience, currentUser);
    const tokenPrice = priceDetails.price !== undefined && priceDetails.price > 0 ? priceDetails.price * USD_TO_TMKC_RATE : undefined;

    const renderActionButton = () => {
        if (experience.access === 'invite-only') {
            if (invitationStatus === 'approved') {
                 return (
                    <button onClick={(e) => { e.stopPropagation(); onBook(experience); }} className="w-full text-center bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 group-hover:bg-[#d8428a]" aria-label={`Book ${experience.title} now`}>
                        Book Now
                    </button>
                );
            }
            if (invitationStatus === 'pending') {
                 return (
                    <button disabled className="w-full text-center bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                        Request Sent
                    </button>
                );
            }
            // If status is 'none' or 'rejected' (maybe allow re-request if rejected? usually no)
            return (
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (onRequestAccess) onRequestAccess(experience.id); 
                        else onViewDetails(experience);
                    }} 
                    className="w-full text-center bg-purple-600/20 border-2 border-purple-500 text-purple-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600/30 transition-colors" 
                    aria-label={`Request invite for ${experience.title}`}
                >
                    <LockClosedIcon className="w-4 h-4" />
                    {invitationStatus === 'rejected' ? 'Request Rejected' : 'Request Invite'}
                </button>
            );
        }
        
        return (
             <button onClick={(e) => { e.stopPropagation(); onBook(experience); }} className="w-full text-center bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 group-hover:bg-[#d8428a]" aria-label={`Book ${experience.title} now`}>
                Book Now
            </button>
        );
    };

    const renderTag = () => {
        if (experience.access === 'invite-only') {
            return <div className="absolute top-3 right-3 bg-purple-900/80 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Invite Only</div>
        }
        if (experience.access === 'restricted' && experience.requiredAccessLevel) {
             return (
                <div className="absolute top-3 right-3 bg-red-900/80 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <KeyIcon className="w-3 h-3" />
                    <span>{experience.requiredAccessLevel}</span>
                </div>
            );
        }
        return null;
    }

    return (
        <div onClick={() => onViewDetails(experience)} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 group cursor-pointer relative">
            <div className="relative">
                <img className="w-full h-56 object-cover" src={experience.coverImage} alt={experience.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {renderTag()}
                
                {/* Like/Bookmark Actions */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {onToggleLike && (
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike();
                            }}
                            className={`p-2 rounded-full transition-all active:scale-95 backdrop-blur-sm ${isLiked ? 'bg-pink-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                            aria-label={isLiked ? `Unlike ${experience.title}` : `Like ${experience.title}`}
                        >
                            <HeartIcon className="w-4 h-4" isFilled={isLiked} />
                        </button>
                    )}
                     {onToggleBookmark && (
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark();
                            }}
                            className={`p-2 rounded-full transition-all active:scale-95 backdrop-blur-sm ${isBookmarked ? 'bg-amber-400/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                            aria-label={isBookmarked ? `Remove ${experience.title} from bookmarks` : `Bookmark ${experience.title}`}
                        >
                            <BookmarkIcon className="w-4 h-4" isFilled={isBookmarked} />
                        </button>
                    )}
                </div>
            </div>
            <div className="p-4 flex flex-col h-56 justify-between">
                <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{experience.category}</p>
                    <h3 className="text-lg font-bold text-white mt-1 leading-tight">{experience.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{experience.description}</p>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <p className="text-lg text-gray-300">Price <span className="text-xs">/ {experience.pricing.unit}</span></p>
                        <div className="text-right">
                           <p className="text-2xl font-bold text-amber-400">{priceDetails.text}</p>
                           {tokenPrice && (
                               <div className="flex items-center justify-end gap-1 text-gray-400">
                                   <TokenIcon className="w-4 h-4"/>
                                   <p>{tokenPrice.toLocaleString()}</p>
                               </div>
                           )}
                        </div>
                    </div>
                   {renderActionButton()}
                </div>
            </div>
        </div>
    );
};
