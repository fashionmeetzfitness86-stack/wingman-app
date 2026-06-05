import React, { useState, useMemo } from 'react';
import { EventInvitation, Event, User, Page } from '../types';
import { InvitationCard } from './InvitationCard';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface InvitationsPageProps {
  currentUser: User;
  invitations: EventInvitation[];
  events: Event[];
  allUsers: User[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onNavigate: (page: Page) => void;
}

const TABS = ['pending', 'accepted', 'declined'] as const;
type Tab = typeof TABS[number];

const TAB_ACCENT: Record<Tab, string> = {
  pending:  '#6366f1',
  accepted: '#4ade80',
  declined: '#ef4444',
};

export const InvitationsPage: React.FC<InvitationsPageProps> = ({
  currentUser, invitations, events, allUsers, onAccept, onDecline, onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const myInvitations = useMemo(
    () => invitations.filter(inv => inv.inviteeId === currentUser.id),
    [invitations, currentUser.id]
  );

  const filteredInvitations = myInvitations.filter(inv => inv.status === activeTab);
  const counts: Record<Tab, number> = {
    pending:  myInvitations.filter(i => i.status === 'pending').length,
    accepted: myInvitations.filter(i => i.status === 'accepted').length,
    declined: myInvitations.filter(i => i.status === 'declined').length,
  };

  const accent = TAB_ACCENT[activeTab];

  return (
    <div className="min-h-screen animate-fade-in pb-32 text-white" style={{ background: '#080808' }}>

      {/* ── Sticky header ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-5 pt-5 pb-4"
        style={{ background: 'rgba(8,8,8,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('back' as Page)}
            className="flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: '#9ca3af' }}
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
          <h1
            className="text-lg font-black text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Invitations
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200"
              style={activeTab === tab
                ? { background: `${TAB_ACCENT[tab]}18`, color: TAB_ACCENT[tab], border: `1px solid ${TAB_ACCENT[tab]}30` }
                : { color: '#6b7280' }}
            >
              {tab}
              {counts[tab] > 0 && (
                <span
                  className="text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center"
                  style={activeTab === tab
                    ? { background: `${TAB_ACCENT[tab]}30`, color: TAB_ACCENT[tab] }
                    : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="px-5 pt-5 space-y-4">
        {filteredInvitations.length > 0 ? (
          filteredInvitations.map(invitation => {
            const event   = events.find(e => e.id === invitation.eventId);
            const inviter = allUsers.find(u => u.id === invitation.inviterId);
            return (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                event={event}
                inviter={inviter}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
              style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
            >
              {activeTab === 'pending' ? '📬' : activeTab === 'accepted' ? '✅' : '❌'}
            </div>
            <p className="text-sm font-bold text-white mb-1">
              No {activeTab} invitations
            </p>
            <p className="text-xs text-gray-600">
              {activeTab === 'pending'
                ? 'You\'re all caught up!'
                : `No ${activeTab} invitations yet.`}
            </p>
            {activeTab === 'pending' && (
              <button
                onClick={() => onNavigate('eventTimeline')}
                className="mt-5 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}30` }}
              >
                Browse Events →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
