import React from 'react';
import { PromoterApplication, AccessGroup, EventInvitationRequest, User, Event, Page, CartItem, EventInvitation, MembershipRequest } from '../../types';
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
    membershipRequests: MembershipRequest[];
    onApproveMembershipRequest: (requestId: number) => void;
    onRejectMembershipRequest: (requestId: number) => void;
}
// Member access request card — visually distinct from ApplicationCard (no promoter fields)
const MemberAccessCard: React.FC<{
    request: MembershipRequest;
    onApprove: () => void;
    onReject: () => void;
}> = ({ request, onApprove, onReject }) => (
    <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <img
                    src={request.userPhoto}
                    alt={request.userName}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                    <p className="font-bold text-white truncate">{request.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{request.userEmail}</p>
                    {request.instagramHandle && (
                        <p className="text-xs text-gray-400 mt-0.5">@{request.instagramHandle}</p>
                    )}
                </div>
            </div>
            <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                request.status === 'pending'  ? 'bg-white text-black hover:bg-gray-200/15 text-pink-300' :
                request.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                'bg-red-900/50 text-red-300'
            }`}>
                {request.status}
            </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#FFFFFF]/30 pl-3 italic">
            "{request.message}"
        </p>
        <p className="text-xs text-gray-600">
            Submitted {new Date(request.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        {request.status === 'pending' && (
            <div className="flex gap-3 pt-1">
                <button onClick={onReject} className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 font-bold py-2 rounded-lg text-sm hover:bg-red-600/40 transition-colors">
                    <CloseIcon className="w-4 h-4" /> Reject
                </button>
                <button onClick={onApprove} className="w-full flex items-center justify-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 rounded-lg text-sm hover:bg-green-500/40 transition-colors">
                    <CheckIcon className="w-4 h-4" /> Approve Access
                </button>
            </div>
        )}
    </div>
);

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
        onNavigate,
        membershipRequests,
        onApproveMembershipRequest,
        onRejectMembershipRequest,
    } = props;

    const pendingMembershipRequests = membershipRequests.filter(r => r.status === 'pending');
    const processedMembershipRequests = membershipRequests.filter(r => r.status !== 'pending');

    const pendingApplications = promoterApplications.filter(a => a.status === 'pending');
    const processedApplications = promoterApplications.filter(a => a.status !== 'pending');
    const pendingInviteRequests = invitationRequests.filter(req => req.status === 'pending');

    return (
        <div className="space-y-12">

            {/* ── Member Access Requests (new system) ───────────── */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold">Member Access Requests</h3>
                    {pendingMembershipRequests.length > 0 && (
                        <span className="bg-white text-black hover:bg-gray-200 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingMembershipRequests.length} pending
                        </span>
                    )}
                </div>
                <div className="space-y-3">
                    {pendingMembershipRequests.length > 0
                        ? pendingMembershipRequests.map(r => (
                            <MemberAccessCard
                                key={r.id}
                                request={r}
                                onApprove={() => onApproveMembershipRequest(r.id)}
                                onReject={() => onRejectMembershipRequest(r.id)}
                            />
                        ))
                        : <div className="bg-gray-800 p-8 rounded-xl text-center text-gray-500 text-sm">No pending member access requests.</div>
                    }
                </div>
                {processedMembershipRequests.length > 0 && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-300 transition-colors">
                            View Processed Requests ({processedMembershipRequests.length})
                        </summary>
                        <div className="mt-3 space-y-3">
                            {processedMembershipRequests.map(r => (
                                <MemberAccessCard key={r.id} request={r} onApprove={() => {}} onReject={() => {}} />
                            ))}
                        </div>
                    </details>
                )}
            </div>

            {/* ── Promoter Applications (existing, unchanged) ─── */}
            <div className="border-t border-gray-800 pt-8">
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
                    <button onClick={() => onNavigate('createGroup')} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded-lg text-sm">
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
                                    <p className="font-semibold text-gray-300">{event.title}</p>
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