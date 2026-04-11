import React from 'react';
import { EventInvitation, Event, User } from '../types';

interface InvitationCardProps {
    invitation: EventInvitation;
    event: Event | undefined;
    inviter: User | undefined;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, event, inviter, onAccept, onDecline }) => {
    if (!event || !inviter) {
        return (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400">Loading invitation details...</p>
            </div>
        );
    }
    
    const eventDate = new Date(event.date + 'T00:00:00');

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <img src={inviter.profilePhoto} alt={inviter.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="text-white"><span className="font-bold">{inviter.name}</span> invited you to</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                    <img src={event.image} alt={event.title} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-bold text-white text-lg">{event.title}</p>
                        <p className="text-sm text-gray-400">{eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
            {invitation.status === 'pending' && (
                <div className="p-4 border-t border-gray-800 bg-black/30 flex gap-3">
                    <button onClick={() => onDecline(invitation.id)} className="w-full bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors">Decline</button>
                    <button onClick={() => onAccept(invitation.id)} className="w-full bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-400 transition-colors">Accept</button>
                </div>
            )}
        </div>
    );
};
