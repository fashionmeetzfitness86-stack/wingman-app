import React from 'react';
import { PromoterApplication, AccessGroup, EventInvitationRequest, User, Event, Page, CartItem, EventInvitation } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { SendInvitations } from './SendInvitations';
import { PlusIcon } from '../icons/PlusIcon';

interface ManagementTabProps {
    promoterApplications: PromoterApplication[];
    onApprovePromoterApplication: (appId: number) => void;
    onRejectPromoterApplication: (appId: number, feedback?: string) => void;
    pendingGroups: AccessGroup[];
    onApproveGroup: (groupId: number) => void;
    invitationRequests: EventInvitationRequest[];
    onApproveRequest: (requestId: number) => void;
    onRejectRequest: (requestId: number) => void;
    users: User[];
    events: Event[];
    onNavigate: (page: Page) => void;
    bookedItems: CartItem[];
    eventInvitations: EventInvitation[];
    onPreviewUser: (user: User) => void;
    onSendDirectInvites: (eventId: number, userIds: number[]) => void;
}

const ApplicationCard: React.FC<{
    app: PromoterApplication;
    onApprove: () => void;
    onReject: () => void;
}> = ({ app, onApprove, onReject }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-white text-lg">{app.stageName || app.fullName}</p>
                <p className="text-sm text-gray-400">Applied on: {new Date(app.submissionDate).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                app.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                app.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                'bg-red-900/50 text-red-300'
            }`}>{app.status}</span>
        </div>
        <div className="mt-4 text-sm text-gray-300 space-y-1">
            <p><strong>Experience:</strong> {app.experienceYears}</p>
            <p><strong>Instagram:</strong> @{app.instagram} ({app.instagramFollowers} followers)</p>
            <p><strong>Weekly Guests:</strong> {app.avgWeeklyGuests}</p>
        </div>
        {app.status === 'pending' && (
            <div className="mt-4 flex gap-3">
                <button onClick={onReject} className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 font-bold py-2 rounded-lg text-sm hover:bg-red-600/40">
                    <CloseIcon className="w-5 h-5"/> Reject
                </button>
                <button onClick={onApprove} className="w-full flex items-center justify-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 rounded-lg text-sm hover:bg-green-500/40">
                    <CheckIcon className="w-5 h-5"/> Approve
                </button>
            </div>
        )}
    </div>
);


export const ManagementTab: React.FC<ManagementTabProps> = (props) => {
    const { 
        promoterApplications, 
        onApprovePromoterApplication, 
        onRejectPromoterApplication,
        pendingGroups,
        onApproveGroup,
        invitationRequests,
        onApproveRequest,
        onRejectRequest,
        users,
        events,
        onNavigate
    } = props;

    const pendingApplications = promoterApplications.filter(a => a.status === 'pending');
    const processedApplications = promoterApplications.filter(a => a.status !== 'pending');
    const pendingInviteRequests = invitationRequests.filter(req => req.status === 'pending');

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-xl font-bold mb-4">Promoter Applications ({pendingApplications.length} pending)</h3>
                <div className="space-y-3">
                    {pendingApplications.length > 0 ? pendingApplications.map(app => (
                        <ApplicationCard 
                            key={app.id} 
                            app={app} 
                            onApprove={() => onApprovePromoterApplication(app.id)} 
                            onReject={() => onRejectPromoterApplication(app.id)}
                        />
                    )) : <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">No pending promoter applications.</div>}
                </div>

                {processedApplications.length > 0 && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-400">View Processed Applications ({processedApplications.length})</summary>
                        <div className="mt-3 space-y-3">
                            {processedApplications.map(app => <ApplicationCard key={app.id} app={app} onApprove={()=>{}} onReject={()=>{}} />)}
                        </div>
                    </details>
                )}
            </div>
            
            <div className="border-t border-gray-800 pt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Group Management</h3>
                    <button onClick={() => onNavigate('createGroup')} className="flex items-center gap-2 bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5"/>
                        Create Group
                    </button>
                </div>
                <h4 className="text-lg font-semibold text-gray-300 mb-4">Pending Group Approvals ({pendingGroups.length})</h4>
                {pendingGroups.length > 0 ? pendingGroups.map(group => (
                    <div key={group.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                        <img className="w-16 h-16 rounded-lg object-cover" src={group.coverImage} alt={group.name} />
                        <div className="flex-grow">
                            <p className="font-bold text-white">{group.name}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{group.description}</p>
                        </div>
                        <button onClick={() => onApproveGroup(group.id)} className="flex items-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-500/40">
                            <CheckIcon className="w-5 h-5"/> Approve
                        </button>
                    </div>
                )) : <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">No groups are pending approval.</div>}
            </div>

            <div className="border-t border-gray-800 pt-8">
                <h3 className="text-xl font-bold mb-4">Send Invitations</h3>
                <SendInvitations {...props} />
            </div>

            <div className="border-t border-gray-800 pt-8">
                <h3 className="text-xl font-bold mb-4">Event Invitation Queue ({pendingInviteRequests.length})</h3>
                <div className="space-y-3">
                    {pendingInviteRequests.length > 0 ? pendingInviteRequests.map(req => {
                        const user = users.find(u => u.id === req.userId);
                        const event = events.find(e => e.id === req.eventId);
                        if (!user || !event) return null;
                        return (
                            <div key={req.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                                <img className="w-14 h-14 rounded-full object-cover" src={user.profilePhoto} alt={user.name} />
                                <div className="flex-grow">
                                    <p><span className="font-bold text-white">{user.name}</span> requested an invite to</p>
                                    <p className="font-semibold text-[#EC4899]">{event.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onApproveRequest(req.id)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Approve</button>
                                    <button onClick={() => onRejectRequest(req.id)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Reject</button>
                                </div>
                            </div>
                        );
                    }) : <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">No pending invitation requests.</div>}
                </div>
            </div>
        </div>
    );
};