
import React, { useState } from 'react';
import { Event, Venue, User, PushCampaign } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface PushNotificationsTabProps {
    events: Event[];
    venues: Venue[];
    users: User[];
    campaigns: PushCampaign[];
    onCreateCampaign: (campaign: PushCampaign) => void;
    onToggleStatus: (campaignId: string) => void;
    onDelete: (campaignId: string) => void;
}

const FREQUENCY_OPTIONS = ['6 Hours', '12 Hours', '24 Hours', '48 Hours', '72 Hours', '5 Days', '7 Days', '15 Days'] as const;
const DURATION_OPTIONS = ['24 Hours', '3 Days', '1 Week', '2 Weeks', '1 Month', 'Until Stopped'];

export const PushNotificationsTab: React.FC<PushNotificationsTabProps> = ({ events, venues, campaigns, onCreateCampaign, onToggleStatus, onDelete }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<PushCampaign['type']>('general');
    const [targetId, setTargetId] = useState<string>('');
    const [frequency, setFrequency] = useState<PushCampaign['frequency']>('24 Hours');
    const [duration, setDuration] = useState('1 Week');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            alert('Please fill in title and message.');
            return;
        }
        if ((type === 'event' || type === 'venue') && !targetId) {
            alert(`Please select a ${type}.`);
            return;
        }

        const newCampaign: PushCampaign = {
            id: `campaign-${Date.now()}`,
            title,
            message,
            type,
            targetId: targetId || undefined,
            frequency,
            duration,
            startDate: new Date().toISOString(),
            status: 'active',
            sentCount: 0
        };
        
        onCreateCampaign(newCampaign);
        
        // Reset form
        setTitle('');
        setMessage('');
        setType('general');
        setTargetId('');
        setFrequency('24 Hours');
    };
    
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const inactiveCampaigns = campaigns.filter(c => c.status === 'inactive');

    return (
        <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Create New Campaign</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3" placeholder="e.g. Weekend Special" required />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Notification Type</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3">
                                <option value="general">General Announcement</option>
                                <option value="event">Event Promotion</option>
                                <option value="venue">Venue Highlight</option>
                                <option value="guestlist">Guestlist Announcement</option>
                            </select>
                        </div>
                    </div>

                    {(type === 'event' || type === 'venue') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select {type === 'event' ? 'Event' : 'Venue'}</label>
                            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3">
                                <option value="">-- Select --</option>
                                {type === 'event' && events.map(e => <option key={e.id} value={String(e.id)}>{e.title}</option>)}
                                {type === 'venue' && venues.map(v => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 resize-none" placeholder="Notification body text..." required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Notify Every</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3">
                                {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Stay Activated For</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3">
                                {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-[#EC4899] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#d8428a] transition-colors">Launch Campaign</button>
                    </div>
                </form>
            </div>

            {/* Campaign List */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Manage Campaigns</h3>
                
                {/* Active Campaigns */}
                <div>
                     <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Active ({activeCampaigns.length})</h4>
                     <div className="space-y-3">
                        {activeCampaigns.length > 0 ? activeCampaigns.map(campaign => (
                             <div key={campaign.id} className="bg-gray-900 border-l-4 border-green-500 rounded-r-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <h5 className="font-bold text-white text-lg">{campaign.title}</h5>
                                         <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded capitalize">{campaign.type}</span>
                                     </div>
                                     <p className="text-gray-400 text-sm mt-1">{campaign.message}</p>
                                     <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                         <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Every {campaign.frequency}</span>
                                         <span>Duration: {campaign.duration}</span>
                                         <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <button onClick={() => onToggleStatus(campaign.id)} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                         Deactivate
                                     </button>
                                     <button onClick={() => onDelete(campaign.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                         <TrashIcon className="w-5 h-5" />
                                     </button>
                                 </div>
                             </div>
                        )) : <p className="text-gray-500 text-sm italic">No active campaigns.</p>}
                     </div>
                </div>

                {/* Inactive Campaigns */}
                 <div>
                     <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Inactive ({inactiveCampaigns.length})</h4>
                     <div className="space-y-3">
                        {inactiveCampaigns.length > 0 ? inactiveCampaigns.map(campaign => (
                             <div key={campaign.id} className="bg-gray-900 border-l-4 border-gray-600 rounded-r-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <h5 className="font-bold text-gray-300 text-lg">{campaign.title}</h5>
                                          <span className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded capitalize">{campaign.type}</span>
                                     </div>
                                     <p className="text-gray-500 text-sm mt-1">{campaign.message}</p>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                         <span>Every {campaign.frequency}</span>
                                         <span>Duration: {campaign.duration}</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <button onClick={() => onToggleStatus(campaign.id)} className="text-green-500 hover:text-green-400 font-semibold text-sm flex items-center gap-1">
                                         <CheckCircleIcon className="w-4 h-4"/> Activate
                                     </button>
                                     <button onClick={() => onDelete(campaign.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                         <TrashIcon className="w-5 h-5" />
                                     </button>
                                 </div>
                             </div>
                        )) : <p className="text-gray-500 text-sm italic">No inactive campaigns.</p>}
                     </div>
                </div>
            </div>
        </div>
    );
};
