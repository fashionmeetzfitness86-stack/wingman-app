
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

// ─── Shared styled form elements ───────────────────────────────────────────────
const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/50 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all';
const labelCls = 'block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2';

export const PushNotificationsTab: React.FC<PushNotificationsTabProps> = ({
    events, venues, campaigns, onCreateCampaign, onToggleStatus, onDelete,
}) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<PushCampaign['type']>('general');
    const [targetId, setTargetId] = useState<string>('');
    const [frequency, setFrequency] = useState<PushCampaign['frequency']>('24 Hours');
    const [duration, setDuration] = useState('1 Week');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            (window as any).showAppToast?.('Please fill in title and message.');
            return;
        }
        if ((type === 'event' || type === 'venue') && !targetId) {
            (window as any).showAppToast?.(`Please select a ${type}.`);
            return;
        }
        const newCampaign: PushCampaign = {
            id: `campaign-${Date.now()}`,
            title, message, type,
            targetId: targetId || undefined,
            frequency, duration,
            startDate: new Date().toISOString(),
            status: 'active',
            sentCount: 0,
        };
        onCreateCampaign(newCampaign);
        setTitle(''); setMessage(''); setType('general'); setTargetId(''); setFrequency('24 Hours');
    };

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const inactiveCampaigns = campaigns.filter(c => c.status === 'inactive');

    return (
        <div className="space-y-8">
            {/* ── Create campaign form ─────────────────────────────── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-sm font-bold text-white mb-6">Create New Campaign</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Campaign Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={inputCls}
                                placeholder="e.g. Weekend Special"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Notification Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className={inputCls + ' appearance-none'}
                            >
                                <option value="general">General Announcement</option>
                                <option value="event">Event Promotion</option>
                                <option value="venue">Venue Highlight</option>
                                <option value="guestlist">Guestlist Announcement</option>
                            </select>
                        </div>
                    </div>

                    {(type === 'event' || type === 'venue') && (
                        <div>
                            <label className={labelCls}>Select {type === 'event' ? 'Event' : 'Venue'}</label>
                            <select
                                value={targetId}
                                onChange={e => setTargetId(e.target.value)}
                                className={inputCls + ' appearance-none'}
                            >
                                <option value="">— Select —</option>
                                {type === 'event' && events.map(e => <option key={e.id} value={String(e.id)}>{e.title}</option>)}
                                {type === 'venue' && venues.map(v => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className={labelCls}>Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={3}
                            className={inputCls + ' resize-none'}
                            placeholder="Notification body text…"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Notify Every</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className={inputCls + ' appearance-none'}>
                                {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Stay Activated For</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)} className={inputCls + ' appearance-none'}>
                                {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            className="font-bold py-2.5 px-6 rounded-xl text-sm text-white transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                            }}
                        >
                            Launch Campaign
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Manage Campaigns ────────────────────────────────── */}
            <div className="space-y-6">
                <p className="text-sm font-bold text-white">Manage Campaigns</p>

                {/* Active */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
                        Active <span className="text-emerald-500">({activeCampaigns.length})</span>
                    </p>
                    <div className="space-y-3">
                        {activeCampaigns.length > 0 ? activeCampaigns.map(campaign => (
                            <div
                                key={campaign.id}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in"
                            >
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                                        <h5 className="font-bold text-white truncate">{campaign.title}</h5>
                                        <span className="bg-white/[0.06] text-gray-400 text-[10px] px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                                            {campaign.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2 truncate">{campaign.message}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" /> Every {campaign.frequency}
                                        </span>
                                        <span>Duration: {campaign.duration}</span>
                                        <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => onToggleStatus(campaign.id)}
                                        className="text-xs font-bold px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.10] transition-all"
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={() => onDelete(campaign.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-600 text-sm italic py-2">No active campaigns.</p>
                        )}
                    </div>
                </div>

                {/* Inactive */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
                        Inactive <span className="text-gray-500">({inactiveCampaigns.length})</span>
                    </p>
                    <div className="space-y-3">
                        {inactiveCampaigns.length > 0 ? inactiveCampaigns.map(campaign => (
                            <div
                                key={campaign.id}
                                className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                                        <h5 className="font-bold text-gray-300 truncate">{campaign.title}</h5>
                                        <span className="bg-white/[0.04] text-gray-600 text-[10px] px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                                            {campaign.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm truncate">{campaign.message}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-gray-700">
                                        <span>Every {campaign.frequency}</span>
                                        <span>Duration: {campaign.duration}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => onToggleStatus(campaign.id)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                    >
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Activate
                                    </button>
                                    <button
                                        onClick={() => onDelete(campaign.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-600 text-sm italic py-2">No inactive campaigns.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
