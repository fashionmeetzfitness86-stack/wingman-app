
import React, { useState } from 'react';
import { Promoter, Page, User, GuestlistJoinRequest, Venue, Event, CartItem, EventInvitation } from '../types';
import { StatCard } from './StatCard';
import { BookingsIcon } from './icons/BookingsIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { StarIcon } from './icons/StarIcon';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { PromoterCard } from './PromoterCard';
import { GiftIcon } from './icons/GiftIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { CheckIcon } from './icons/CheckIcon';
import { GuestlistAttendanceTab } from './admin/GuestlistAttendanceTab';
import { SendInvitations } from './admin/SendInvitations';
import { PromoterNetworkTab } from './admin/PromoterNetworkTab';
import { DownloadIcon } from './icons/DownloadIcon';
import { PromoterDataExportModal } from './modals/PromoterDataExportModal';

interface SubscriptionStatusProps {
    promoterUser: User;
    onToggleAutoPay: (isEnabled: boolean) => void;
    onManagePayment: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ promoterUser, onToggleAutoPay, onManagePayment }) => {
    const { subscriptionStatus, subscriptionDueDate, waiveSubscriptionUntil, autoPayEnabled } = promoterUser;

    const getStatusInfo = () => {
        switch (subscriptionStatus) {
            case 'active':
                return {
                    color: 'text-green-400',
                    bgColor: 'bg-green-900/50',
                    text: 'Active',
                    message: `Next payment of $149.00 due on ${subscriptionDueDate}.`
                };
            case 'past_due':
                return {
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-900/50',
                    text: 'Past Due',
                    message: `Your payment is past due. Please update your payment method.`
                };
            case 'suspended':
                return {
                    color: 'text-red-400',
                    bgColor: 'bg-red-900/50',
                    text: 'Suspended',
                    message: 'Your account is suspended due to non-payment. Please contact support.'
                };
            case 'free_tier':
                const until = waiveSubscriptionUntil === 'forever' ? 'forever' : `until ${waiveSubscriptionUntil}`;
                return {
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-900/50',
                    text: 'Free Tier',
                    message: `Your subscription is waived ${until}.`
                };
            default:
                return {
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-700',
                    text: 'N/A',
                    message: 'Subscription status is not available.'
                };
        }
    };
    
    const statusInfo = getStatusInfo();

    return (
        <div 
            onClick={onManagePayment}
            className={`p-4 rounded-lg border ${statusInfo.bgColor} border-gray-700 cursor-pointer hover:opacity-90 transition-opacity`}
            role="button"
            tabIndex={0}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white">Subscription Status</h3>
                    <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Monthly Fee</p>
                    <p className="font-bold text-white text-lg">$149.00</p>
                </div>
            </div>
            <p className="text-sm text-gray-300 mt-3">{statusInfo.message}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4" onClick={(e) => e.stopPropagation()}>
                 <div className="flex items-center gap-3">
                    <ToggleSwitch 
                        checked={autoPayEnabled || false} 
                        onChange={() => onToggleAutoPay(!autoPayEnabled)}
                        label="Auto-pay"
                    />
                    <label className="font-semibold text-white">Auto-pay</label>
                </div>
                {subscriptionStatus === 'past_due' && (
                    <button onClick={onManagePayment} className="bg-amber-400 text-black font-bold py-2 px-6 rounded-lg text-sm w-full sm:w-auto hover:bg-amber-300 transition-colors">
                        Pay Now
                    </button>
                )}
            </div>
        </div>
    );
};

const ReferralSection: React.FC<{ referralCode?: string, referralsCount?: number, earnings?: number }> = ({ referralCode, referralsCount, earnings }) => {
    const [copied, setCopied] = useState(false);
    const code = referralCode || 'N/A';

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-purple-900/50 to-gray-900 p-6 rounded-xl border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-purple-500/20 w-24 h-24 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <GiftIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Referral Program</h3>
                    </div>
                    <p className="text-gray-300 text-sm max-w-md">
                        Invite new users or promoters to WINGMAN. Earn 500 points for every new user and $100 for every approved promoter who signs up with your code.
                    </p>
                </div>

                <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 w-full md:w-auto min-w-[280px]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-2 mb-4">
                         <div className="flex-grow bg-black/50 border border-gray-600 rounded-md p-3 text-center font-mono text-lg font-bold text-white tracking-widest">
                            {code}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
                            title="Copy Code"
                        >
                            {copied ? <CheckIcon className="w-6 h-6" /> : <DocumentDuplicateIcon className="w-6 h-6" />}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                         <div className="text-center">
                            <p className="text-2xl font-bold text-white">{referralsCount || 0}</p>
                            <p className="text-xs text-gray-400">Referrals</p>
                        </div>
                        <div className="text-center border-l border-gray-700">
                            <p className="text-2xl font-bold text-green-400">${(earnings || 0).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Earned</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PromoterDashboardProps {
  promoter: Promoter;
  onNavigate: (page: Page, params?: any) => void;
  promoterUser: User;
  onUpdateUser: (user: User) => void;
  guestlistRequests: GuestlistJoinRequest[];
  users: User[];
  venues: Venue[];
  events: Event[];
  onViewUser: (user: User) => void;
  onUpdateRequestStatus: (requestId: number, status: 'pending' | 'show' | 'no-show') => void;
  onReviewGuestlistRequest: (requestId: number, status: 'approved' | 'rejected') => void;
  bookedItems: CartItem[];
  eventInvitations: EventInvitation[];
  onSendDirectInvites: (eventId: number, userIds: number[]) => void;
}

export const PromoterDashboard: React.FC<PromoterDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'guestlists' | 'invitations'>('overview');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { promoter, onNavigate, promoterUser, onUpdateUser, guestlistRequests, users, venues, promoters: allPromoters, onUpdateRequestStatus, onReviewGuestlistRequest, onViewUser, bookedItems } = props;
    
    const handleToggleAutoPay = (isEnabled: boolean) => {
        onUpdateUser({ ...promoterUser, autoPayEnabled: isEnabled });
    };

    // Filter guestlist requests for this promoter's venues or directly assigned to them
    const myGuestlistRequests = guestlistRequests.filter(req => 
        req.promoterId === promoter.id || promoter.assignedVenueIds.includes(req.venueId)
    );

    const pendingRequestsCount = myGuestlistRequests.filter(r => r.status === 'pending').length;

    const myVenues = venues.filter(v => promoter.assignedVenueIds.includes(v.id));
    
    const myReferrals = users.filter(u => u.referredByPromoterId === promoter.id);

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white space-y-8">
             <div className="flex border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'overview' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('network')} 
                    className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'network' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    My Network
                </button>
                <button 
                    onClick={() => setActiveTab('guestlists')} 
                    className={`relative flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'guestlists' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Guestlist Management
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-1 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{pendingRequestsCount}</span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('invitations')} 
                    className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'invitations' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    Send Invitations
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Export Data
                        </button>
                    </div>

                    {promoterUser && (
                        <SubscriptionStatus 
                            promoterUser={promoterUser} 
                            onToggleAutoPay={handleToggleAutoPay}
                            onManagePayment={() => onNavigate('paymentMethods')}
                        />
                    )}
                    
                    <ReferralSection 
                        referralCode={promoterUser.referralCode} 
                        referralsCount={promoterUser.referralsCount} 
                        earnings={promoterUser.referralEarnings}
                    />

                    <div>
                        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-4">My Public Card Preview</h2>
                        <div className="max-w-sm">
                            <PromoterCard
                                promoter={promoter}
                                onViewProfile={() => onNavigate('promoterProfile', { promoterId: promoter.id })}
                                onBook={() => onNavigate('bookATable')}
                                isFavorite={false}
                                onToggleFavorite={() => {}}
                                onJoinGuestlist={() => {}}
                                currentUser={promoterUser}
                                showEarnings={true}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-4">Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard 
                                icon={<CurrencyDollarIcon className="w-7 h-7" />}
                                label="Total Earnings"
                                value={`$${promoter.earnings?.toLocaleString() || 'N/A'}`}
                                change="+5.2%"
                                changeType="positive"
                                onClick={() => onNavigate('promoterStats')}
                            />
                            <StatCard 
                                icon={<BookingsIcon className="w-7 h-7" />}
                                label="Total Bookings"
                                value="128"
                                change="+10"
                                changeType="positive"
                                onClick={() => onNavigate('promoterStats')}
                            />
                            <StatCard 
                                icon={<StarIcon className="w-7 h-7" />}
                                label="Rating"
                                value={promoter.rating.toFixed(1)}
                                change="-0.1"
                                changeType="negative"
                                onClick={() => onNavigate('promoterStats')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'network' && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">My Network</h2>
                    <p className="text-gray-400 mb-6">Review your booked clients and people who joined through your referrals.</p>
                    <PromoterNetworkTab 
                        promoter={promoter}
                        users={users}
                        bookedItems={bookedItems}
                        onViewUser={onViewUser}
                    />
                </div>
            )}

            {activeTab === 'guestlists' && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">Manage Guestlists</h2>
                    <p className="text-gray-400 mb-6">Manage pending requests and track attendance for your guestlists.</p>
                    <GuestlistAttendanceTab 
                        requests={myGuestlistRequests}
                        users={users}
                        venues={myVenues}
                        promoters={[promoter]} 
                        onViewUser={onViewUser}
                        onUpdateRequestStatus={onUpdateRequestStatus}
                        onReviewGuestlistRequest={onReviewGuestlistRequest}
                    />
                </div>
            )}

            {activeTab === 'invitations' && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">Send Direct Invitations</h2>
                    <p className="text-gray-400 mb-6">Invite high-value users to upcoming events.</p>
                    <SendInvitations 
                        users={props.users}
                        events={props.events}
                        bookedItems={props.bookedItems}
                        eventInvitations={props.eventInvitations}
                        onPreviewUser={props.onViewUser}
                        onSendDirectInvites={props.onSendDirectInvites}
                        invitationRequests={[]} // Promoters don't manage requests here, just direct invites
                    />
                </div>
            )}

            <PromoterDataExportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                promoter={promoter}
                bookedItems={bookedItems}
                guestlistRequests={myGuestlistRequests}
                referredUsers={myReferrals}
                venues={venues}
            />
        </div>
    );
};
