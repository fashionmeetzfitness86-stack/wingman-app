import React, { useState } from 'react';
import { WingmanApplication, AccessGroup, EventInvitationRequest, User, Event, Page, CartItem, EventInvitation, MembershipRequest } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { SendInvitations } from './SendInvitations';
import { PlusIcon } from '../icons/PlusIcon';
import { getPasscodeLeads, type PasscodeLead } from '../../utils/accessControl';

// ─── STATUS PILL ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, React.CSSProperties> = {
    pending:          { background: 'rgba(184,155,77,0.12)',  color: '#B89B4D', border: '1px solid rgba(184,155,77,0.25)' },
    approved:         { background: 'rgba(77,184,124,0.12)',  color: '#4DB87C', border: '1px solid rgba(77,184,124,0.25)' },
    rejected:         { background: 'rgba(212,80,80,0.12)',   color: '#D45050', border: '1px solid rgba(212,80,80,0.25)' },
    temporary_access: { background: 'rgba(14,165,233,0.12)',  color: '#38BDF8', border: '1px solid rgba(14,165,233,0.25)' },
    profile_created:  { background: 'rgba(77,184,124,0.12)',  color: '#4DB87C', border: '1px solid rgba(77,184,124,0.25)' },
    expired:          { background: 'rgba(107,114,128,0.12)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.2)'  },
    accepted:         { background: 'rgba(77,184,124,0.12)',  color: '#4DB87C', border: '1px solid rgba(77,184,124,0.25)' },
    completed:        { background: 'rgba(96,165,250,0.12)',  color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' },
};
const STATUS_LABELS: Record<string, string> = {
    temporary_access: 'Gate Access',
    profile_created:  'Profile Created',
};
const StatusPill: React.FC<{ status: string }> = ({ status }) => (
    <span className="inline-block text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wider"
        style={STATUS_STYLES[status] ?? STATUS_STYLES.pending}>
        {STATUS_LABELS[status] ?? status}
    </span>
);

// ─── SECTION HEADER ──────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; count?: number; countColor?: string; sub?: string }> = ({
    title, count, countColor = '#B89B4D', sub,
}) => (
    <div className="mb-5">
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
            {count !== undefined && (
                <span className="text-xs font-bold rounded-full px-2.5 py-0.5"
                    style={{ background: countColor + '18', color: countColor, border: '1px solid ' + countColor + '30' }}>
                    {count}
                </span>
            )}
        </div>
        {sub && <p className="text-[11px] text-gray-600 mt-1">{sub}</p>}
    </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────
const EmptyState: React.FC<{ icon: string; message: string }> = ({ icon, message }) => (
    <div className="rounded-2xl p-10 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-3xl mb-3">{icon}</div>
        <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
);

interface ManagementTabProps {
    wingmanApplications: WingmanApplication[];
    onApproveWingmanApplication: (appId: number) => void;
    onRejectWingmanApplication: (appId: number, feedback?: string) => void;
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
// ─── MEMBER ACCESS CARD ──────────────────────────────────────
const MemberAccessCard: React.FC<{
    request: MembershipRequest;
    onApprove: () => void;
    onReject: () => void;
}> = ({ request, onApprove, onReject }) => (
    <div className="rounded-2xl p-4 transition-all"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
        <div className="flex items-start gap-4">
            <img src={request.userPhoto} alt={request.userName}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                style={{ outline: '2px solid rgba(255,255,255,0.1)', outlineOffset: '2px' }} />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-bold text-white text-sm">{request.userName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{request.userEmail}</p>
                        {request.instagramHandle && (
                            <p className="text-xs mt-0.5" style={{ color: '#E040FB' }}>@{request.instagramHandle}</p>
                        )}
                    </div>
                    <StatusPill status={request.status} />
                </div>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed border-l-2 pl-3"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    "{request.message}"
                </p>
                <p className="text-[10px] text-gray-700 mt-2 font-semibold uppercase tracking-wider">
                    Submitted {new Date(request.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>
        {request.status === 'pending' && (
            <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={onReject} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(212,80,80,0.08)', color: '#D45050', border: '1px solid rgba(212,80,80,0.2)' }}>
                    <CloseIcon className="w-4 h-4" /> Reject
                </button>
                <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(77,184,124,0.08)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' }}>
                    <CheckIcon className="w-4 h-4" /> Approve Access
                </button>
            </div>
        )}
    </div>
);

// ─── WINGMAN APPLICATION CARD ─────────────────────────────────
const ApplicationCard: React.FC<{
    app: WingmanApplication;
    onApprove: () => void;
    onReject: () => void;
}> = ({ app, onApprove, onReject }) => (
    <div className="rounded-2xl p-4 transition-all"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
            <div>
                <p className="font-black text-white text-base">{app.stageName || app.fullName}</p>
                <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider mt-0.5">
                    Applied {new Date(app.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
            <StatusPill status={app.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Experience</p>
                <p className="text-white font-semibold text-xs">{app.experienceYears}</p>
            </div>
            <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Instagram</p>
                <p className="text-white font-semibold text-xs">@{app.instagram} · {app.instagramFollowers} followers</p>
            </div>
            <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Weekly Guests</p>
                <p className="text-white font-semibold text-xs">{app.avgWeeklyGuests}</p>
            </div>
        </div>
        {app.status === 'pending' && (
            <div className="flex gap-3">
                <button onClick={onReject} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(212,80,80,0.08)', color: '#D45050', border: '1px solid rgba(212,80,80,0.2)' }}>
                    <CloseIcon className="w-4 h-4" /> Reject
                </button>
                <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(77,184,124,0.08)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' }}>
                    <CheckIcon className="w-4 h-4" /> Approve
                </button>
            </div>
        )}
    </div>
);


export const ManagementTab: React.FC<ManagementTabProps> = (props) => {
    const {
        wingmanApplications,
        onApproveWingmanApplication,
        onRejectWingmanApplication,
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

    // Read passcode leads from localStorage (captured at the gate)
    const [passcodeleads] = useState<PasscodeLead[]>(() => {
        try { return getPasscodeLeads().sort((a, b) => b.capturedAt - a.capturedAt); }
        catch { return []; }
    });

    const pendingMembershipRequests = membershipRequests.filter(r => r.status === 'pending');
    const processedMembershipRequests = membershipRequests.filter(r => r.status !== 'pending');

    const pendingApplications = wingmanApplications.filter(a => a.status === 'pending');
    const processedApplications = wingmanApplications.filter(a => a.status !== 'pending');
    const pendingInviteRequests = invitationRequests.filter(req => req.status === 'pending');

    return (
        <div className="space-y-12 pb-8">

            {/* ── Passcode Gate Leads ── */}
            <div>
                <SectionHeader
                    title="Passcode Gate Leads"
                    count={passcodeleads.length}
                    countColor="#B89B4D"
                    sub="Names and emails captured at the passcode gate. Synced locally — Supabase stores cross-device records."
                />
                {passcodeleads.length > 0 ? (
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                        {/* Header */}
                        <div className="grid px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider"
                            style={{ gridTemplateColumns: '28px 1fr 1fr 108px 118px', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            <span>#</span>
                            <span>Name</span>
                            <span>Email</span>
                            <span>Status</span>
                            <span className="text-right">Captured</span>
                        </div>
                        {/* Rows */}
                        {passcodeleads.map((lead, i) => (
                            <div key={lead.email}
                                className="grid items-center px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                                style={{ gridTemplateColumns: '28px 1fr 1fr 108px 118px', gap: '12px', borderBottom: i < passcodeleads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span className="text-xs text-gray-700 font-semibold">{i + 1}</span>
                                <div className="min-w-0">
                                    {lead.fullName
                                        ? <p className="text-sm font-bold text-white truncate">{lead.fullName}</p>
                                        : <p className="text-xs text-gray-600 italic">—</p>
                                    }
                                </div>
                                <p className="text-sm text-gray-300 truncate min-w-0">{lead.email}</p>
                                <StatusPill status={lead.status} />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">{new Date(lead.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] text-gray-700">{new Date(lead.capturedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon="📧" message="No leads yet. Names and emails appear here when users enter them at the passcode gate." />
                )}
            </div>

            {/* ── Member Access Requests ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
                <SectionHeader
                    title="Member Access Requests"
                    count={pendingMembershipRequests.length > 0 ? pendingMembershipRequests.length : undefined}
                    countColor="#D45050"
                    sub="Users requesting membership approval to access the platform."
                />
                <div className="space-y-3">
                    {pendingMembershipRequests.length > 0
                        ? pendingMembershipRequests.map(r => (
                            <MemberAccessCard key={r.id} request={r}
                                onApprove={() => onApproveMembershipRequest(r.id)}
                                onReject={() => onRejectMembershipRequest(r.id)} />
                        ))
                        : <EmptyState icon="✅" message="No pending member access requests." />
                    }
                </div>
                {processedMembershipRequests.length > 0 && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-400 transition-colors">
                            View Processed Requests ({processedMembershipRequests.length})
                        </summary>
                        <div className="mt-3 space-y-3">
                            {processedMembershipRequests.map(r => <MemberAccessCard key={r.id} request={r} onApprove={() => {}} onReject={() => {}} />)}
                        </div>
                    </details>
                )}
            </div>

            {/* ── Wingman Applications ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
                <SectionHeader
                    title="Wingman Applications"
                    count={pendingApplications.length > 0 ? pendingApplications.length : undefined}
                    countColor="#B89B4D"
                    sub="Promoters applying to join the Wingman network."
                />
                <div className="space-y-3">
                    {pendingApplications.length > 0
                        ? pendingApplications.map(app => (
                            <ApplicationCard key={app.id} app={app}
                                onApprove={() => onApproveWingmanApplication(app.id)}
                                onReject={() => onRejectWingmanApplication(app.id)} />
                        ))
                        : <EmptyState icon="🎯" message="No pending wingman applications." />
                    }
                </div>
                {processedApplications.length > 0 && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-400 transition-colors">View Processed Applications ({processedApplications.length})</summary>
                        <div className="mt-3 space-y-3">{processedApplications.map(app => <ApplicationCard key={app.id} app={app} onApprove={() => {}} onReject={() => {}} />)}</div>
                    </details>
                )}
            </div>
            
            {/* ── Group Management ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
                <div className="flex items-start justify-between mb-5">
                    <SectionHeader title="Group Management" sub="Approve or manage pending access group requests." />
                    <button onClick={() => onNavigate('createGroup')} className="flex items-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl transition-all flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <PlusIcon className="w-4 h-4" /> Create Group
                    </button>
                </div>
                <div className="space-y-3">
                    {pendingGroups.length > 0
                        ? pendingGroups.map(group => (
                            <div key={group.id} className="rounded-2xl p-4 flex items-center gap-4"
                                style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <img className="w-16 h-16 rounded-xl object-cover flex-shrink-0" src={group.coverImage} alt={group.name} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white">{group.name}</p>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{group.description}</p>
                                </div>
                                <button onClick={() => onApproveGroup(group.id)} className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-xl transition-all flex-shrink-0"
                                    style={{ background: 'rgba(77,184,124,0.08)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' }}>
                                    <CheckIcon className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        ))
                        : <EmptyState icon="👥" message="No groups pending approval." />
                    }
                </div>
            </div>

            {/* ── Send Invitations ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
                <SectionHeader title="Send Invitations" sub="Send direct event invitations to approved members." />
                <SendInvitations {...props} />
            </div>

            {/* ── Event Invitation Queue ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
                <SectionHeader
                    title="Event Invitation Queue"
                    count={pendingInviteRequests.length > 0 ? pendingInviteRequests.length : undefined}
                    countColor="#60A5FA"
                    sub="Members who requested a direct event invitation."
                />
                <div className="space-y-3">
                    {pendingInviteRequests.length > 0
                        ? pendingInviteRequests.map(req => {
                            const user = users.find(u => u.id === req.userId);
                            const event = events.find(e => e.id === req.eventId);
                            if (!user || !event) return null;
                            return (
                                <div key={req.id} className="rounded-2xl p-4 flex items-center gap-4"
                                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <img className="w-10 h-10 rounded-full object-cover flex-shrink-0" src={user.profilePhoto} alt={user.name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Requested invite to <span className="text-white font-semibold">{event.title}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => onRejectRequest(req.id)} className="text-sm font-semibold py-2 px-3 rounded-xl transition-all"
                                            style={{ background: 'rgba(212,80,80,0.08)', color: '#D45050', border: '1px solid rgba(212,80,80,0.2)' }}>Reject</button>
                                        <button onClick={() => onApproveRequest(req.id)} className="text-sm font-semibold py-2 px-3 rounded-xl transition-all"
                                            style={{ background: 'rgba(77,184,124,0.08)', color: '#4DB87C', border: '1px solid rgba(77,184,124,0.2)' }}>Approve</button>
                                    </div>
                                </div>
                            );
                        })
                        : <EmptyState icon="📨" message="No pending invitation requests." />
                    }
                </div>
            </div>
        </div>
    );
};