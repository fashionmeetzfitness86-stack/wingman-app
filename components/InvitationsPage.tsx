import React, { useState, useMemo } from 'react';
import { EventInvitation, Event, User, Page } from '../types';
import { InvitationCard } from './InvitationCard';

interface InvitationsPageProps {
    currentUser: User;
    invitations: EventInvitation[];
    events: Event[];
    allUsers: User[];
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
    onNavigate: (page: Page) => void;
}

export const InvitationsPage: React.FC<InvitationsPageProps> = ({ currentUser, invitations, events, allUsers, onAccept, onDecline, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');

    const myInvitations = useMemo(() => {
        return invitations.filter(inv => inv.inviteeId === currentUser.id);
    }, [invitations, currentUser.id]);

    const filteredInvitations = myInvitations.filter(inv => inv.status === activeTab);

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="flex border-b border-gray-700 mb-6">
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'pending' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>
                    Pending
                </button>
                <button onClick={() => setActiveTab('accepted')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'accepted' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>
                    Accepted
                </button>
                <button onClick={() => setActiveTab('declined')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'declined' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>
                    Declined
                </button>
            </div>
            
            <div className="space-y-4">
                {filteredInvitations.length > 0 ? (
                    filteredInvitations.map(invitation => {
                        const event = events.find(e => e.id === invitation.eventId);
                        const inviter = allUsers.find(u => u.id === invitation.inviterId);
                        return <InvitationCard key={invitation.id} invitation={invitation} event={event} inviter={inviter} onAccept={onAccept} onDecline={onDecline} />;
                    })
                ) : (
                    <p className="text-center text-gray-500 py-16">No {activeTab} invitations.</p>
                )}
            </div>
        </div>
    );
};
