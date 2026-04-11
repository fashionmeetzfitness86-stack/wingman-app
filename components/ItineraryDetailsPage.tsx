
import React, { useState } from 'react';
import { Itinerary, User } from '../types';
import { venues, events, experiences } from '../data/mockData';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { FriendsIcon } from './icons/FriendsIcon';

interface ItineraryDetailsPageProps {
    itinerary: Itinerary;
    currentUser: User;
    onEdit: (itinerary: Itinerary) => void;
    onClone?: (itinerary: Itinerary) => void;
}

const itemIcons = {
    venue: <LocationMarkerIcon className="w-5 h-5" />,
    event: <CalendarIcon className="w-5 h-5" />,
    experience: <SparkleIcon className="w-5 h-5" />,
    note: <PencilIcon className="w-5 h-5" />,
};

export const ItineraryDetailsPage: React.FC<ItineraryDetailsPageProps> = ({ itinerary, currentUser, onEdit, onClone }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSharedToFriends, setIsSharedToFriends] = useState(false);
    
    const getItemDetails = (type: string, id?: number) => {
        if (!id) return null;
        switch (type) {
            case 'venue': return venues.find(i => i.id === id);
            case 'event': return events.find(i => i.id === id);
            case 'experience': return experiences.find(i => i.id === id);
            default: return null;
        }
    };

    const isOwner = itinerary.creatorId === currentUser.id;

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}?itinerary=${itinerary.id}`;
        const shareData = {
            title: `Check out my itinerary: ${itinerary.title}`,
            text: itinerary.description,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Could not share itinerary.');
            }
        }
    };

    const handleShareToFriendsZone = () => {
        // In a real app, this would call an API endpoint
        setIsSharedToFriends(true);
        setTimeout(() => setIsSharedToFriends(false), 2000);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{itinerary.title}</h1>
                    <p className="text-gray-400 mt-1">{new Date(itinerary.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                {isOwner ? (
                    <button 
                        onClick={() => onEdit(itinerary)}
                        className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    onClone && (
                        <button 
                            onClick={() => onClone(itinerary)}
                            className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[#d8428a] transition-colors"
                        >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                            Copy to My Itineraries
                        </button>
                    )
                )}
            </div>
            
            <p className="text-gray-300 mt-4">{itinerary.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                    onClick={handleShare}
                    className="flex-1 bg-amber-400 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
                >
                    {isCopied ? <CheckIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                    {isCopied ? 'Copied Link' : 'Share Link'}
                </button>
                 <button 
                    onClick={handleShareToFriendsZone}
                    className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                    {isSharedToFriends ? <CheckIcon className="w-5 h-5" /> : <FriendsIcon className="w-5 h-5" />}
                    {isSharedToFriends ? 'Shared!' : 'Share to Friends Zone'}
                </button>
            </div>

            <div className="mt-8">
                {itinerary.items.map((item, index) => {
                    const details = getItemDetails(item.type, item.itemId);
                    const title = item.customTitle || (details && 'name' in details ? details.name : details && 'title' in details ? details.title : 'Custom Note');
                    const isLast = index === itinerary.items.length - 1;

                    return (
                        <div key={item.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-amber-400">
                                    {itemIcons[item.type]}
                                </div>
                                {!isLast && <div className="w-0.5 flex-grow bg-gray-700 my-2"></div>}
                            </div>
                            <div className="pb-8 flex-grow">
                                <p className="text-sm font-semibold text-gray-400">{item.startTime}{item.endTime && ` - ${item.endTime}`}</p>
                                <h3 className="font-bold text-white text-lg mt-1">{title}</h3>
                                {details && 'location' in details && <p className="text-sm text-gray-400">{details.location}</p>}
                                {item.notes && <p className="text-sm text-gray-300 mt-2 p-3 bg-gray-900/50 rounded-md border border-gray-800">{item.notes}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
