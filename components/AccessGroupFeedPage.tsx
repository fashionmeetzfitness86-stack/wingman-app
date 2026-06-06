
/**
 * AccessGroupFeedPage.tsx — Full glassmorphism group chat
 * Design system: #08080A bg · Space Grotesk · E040FB/7B61FF accents · glass cards
 *
 * States:
 *  1. Non-member  → Locked hero view with join CTA or "Pending" status
 *  2. Member/Admin → Full chat + admin requests panel
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AccessGroup, GroupJoinRequest, User, UserRole, Page, GroupMessage } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const ACCENT  = '#E040FB';
const ACCENT2 = '#7B61FF';
const BG      = '#08080A';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch { return ''; }
}

function fmtDate(iso: string): string {
    try {
        const d   = new Date(iso);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === now.toDateString())       return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface AccessGroupFeedPageProps {
    groupId:           number;
    currentUser:       User;
    allGroups:         AccessGroup[];
    groupJoinRequests: GroupJoinRequest[];
    onApproveRequest:  (requestId: number) => void;
    onRejectRequest:   (requestId: number) => void;
    users:             User[];
    groupMessages:     GroupMessage[];
    onSendMessage:     (groupId: number, text: string) => void;
    onNavigate:        (page: Page) => void;
    onRequestJoin:     (groupId: number) => void;
}

// ─── Locked view (non-member) ─────────────────────────────────────────────────

const LockedView: React.FC<{
    group:         AccessGroup;
    myRequest:     GroupJoinRequest | undefined;
    onRequestJoin: () => void;
    onBack:        () => void;
    members:       User[];
    previewMsgs:   GroupMessage[];
}> = ({ group, myRequest, onRequestJoin, onBack, members, previewMsgs }) => (
    <div className="min-h-screen animate-fade-in" style={{ background: BG }}>
        {/* Back button */}
        <div className="px-5 pt-5 pb-3">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#9ca3af' }}
            >
                <ChevronLeftIcon className="w-4 h-4" /> Back
            </button>
        </div>

        {/* Hero */}
        <div className="relative mx-4 rounded-3xl overflow-hidden mb-6" style={{ height: 260 }}>
            <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{group.name}</h1>
                <p className="text-sm text-gray-300 leading-relaxed">{group.description}</p>
            </div>
        </div>

        {/* Members strip */}
        <div className="px-5 mb-6 flex items-center gap-3">
            <div className="flex -space-x-2">
                {members.slice(0, 6).map(m => (
                    <img key={m.id} src={m.profilePhoto} alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border-2"
                        style={{ borderColor: BG }}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-400 font-semibold">{group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Blurred chat preview */}
        {previewMsgs.length > 0 && (
            <div className="mx-4 mb-6 rounded-2xl overflow-hidden relative"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="filter blur-sm pointer-events-none select-none px-4 py-4 space-y-3"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {previewMsgs.slice(-3).map(m => (
                        <div key={m.id} className="flex gap-2 items-start">
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">{m.userName}</p>
                                <div className="text-sm text-gray-300 rounded-xl px-3 py-2"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    {m.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ background: 'rgba(8,8,10,0.7)', backdropFilter: 'blur(2px)' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
                        🔒
                    </div>
                    <p className="text-sm font-bold text-white">Members only</p>
                    <p className="text-xs text-gray-500">Request to join to see the full conversation</p>
                </div>
            </div>
        )}

        {/* CTA */}
        <div className="px-5">
            {myRequest ? (
                <div className="w-full py-4 rounded-2xl text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="text-sm font-black text-gray-400">⏳ Request Pending</p>
                    <p className="text-xs text-gray-600 mt-1">You'll get a notification when the admin responds.</p>
                </div>
            ) : (
                <button
                    onClick={onRequestJoin}
                    className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-[0.98]"
                    style={{
                        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                        boxShadow: `0 8px 28px ${ACCENT}35`,
                    }}
                >
                    Request to Join
                </button>
            )}
        </div>
    </div>
);

// ─── Admin Requests Panel ─────────────────────────────────────────────────────

const AdminRequestsPanel: React.FC<{
    requests:         GroupJoinRequest[];
    users:            User[];
    onApprove:        (id: number) => void;
    onReject:         (id: number) => void;
}> = ({ requests, users, onApprove, onReject }) => (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(224,64,251,0.07)', border: `1px solid ${ACCENT}25` }}>
        <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-black text-white">Membership Requests</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}35` }}>
                    {requests.length}
                </span>
            </div>
            <div className="space-y-2">
                {requests.map(req => {
                    const user = users.find(u => u.id === req.userId);
                    if (!user) return null;
                    return (
                        <div key={req.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={user.profilePhoto} alt={user.name}
                                    className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {/* Approve */}
                                <button
                                    onClick={() => onApprove(req.id)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                                    title="Approve"
                                >
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                {/* Reject */}
                                <button
                                    onClick={() => onReject(req.id)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                                    title="Decline"
                                >
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
    msg:    GroupMessage;
    isMe:   boolean;
    isFirst: boolean; // first in a run from same user
}> = ({ msg, isMe, isFirst }) => (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar — left side only, first in a run */}
        <div className="w-7 flex-shrink-0">
            {!isMe && isFirst && (
                <img src={msg.userPhoto} alt={msg.userName}
                    className="w-7 h-7 rounded-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.userName)}&background=333&color=fff`; }}
                />
            )}
        </div>

        <div className={`flex flex-col max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
            {/* Name + time — only on first in a run */}
            {isFirst && (
                <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && <span className="text-[11px] font-bold text-gray-400">{msg.userName}</span>}
                    <span className="text-[10px] text-gray-600">{fmtTime(msg.sentAt)}</span>
                </div>
            )}

            {/* Bubble */}
            <div
                className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={isMe ? {
                    background: 'linear-gradient(135deg, #FFFFFF, #E5E7EB)',
                    color: '#000',
                    borderBottomRightRadius: 6,
                } : {
                    background: 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderBottomLeftRadius: 6,
                }}
            >
                {msg.text}
            </div>
        </div>

        {/* Right avatar placeholder (keeps alignment) */}
        {isMe && <div className="w-7 flex-shrink-0" />}
    </div>
);

// ─── Date Separator ──────────────────────────────────────────────────────────

const DateSep: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export const AccessGroupFeedPage: React.FC<AccessGroupFeedPageProps> = ({
    groupId, currentUser, allGroups,
    groupJoinRequests, onApproveRequest, onRejectRequest,
    users, groupMessages, onSendMessage, onNavigate, onRequestJoin,
}) => {
    const [text, setText] = useState('');
    const messagesEndRef  = useRef<HTMLDivElement>(null);
    const inputRef        = useRef<HTMLInputElement>(null);

    const group = allGroups.find(g => g.id === groupId);

    const isMember  = !!(group?.memberIds.includes(currentUser.id));
    const isAdmin   = currentUser.role === UserRole.ADMIN;
    const isCreator = currentUser.id === group?.creatorId;
    const canAccess = isMember || isAdmin || isCreator;

    const pendingRequests = groupJoinRequests.filter(
        r => r.groupId === groupId && r.status === 'pending'
    );
    const myRequest = groupJoinRequests.find(
        r => r.groupId === groupId && r.userId === currentUser.id
    );
    const members = users.filter(u => group?.memberIds.includes(u.id));

    // Messages for this group sorted ascending
    const messages = useMemo(() =>
        groupMessages
            .filter(m => m.groupId === groupId)
            .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
        [groupMessages, groupId]
    );

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSendMessage(groupId, text);
        setText('');
        inputRef.current?.focus();
    };

    // ── Not found ────────────────────────────────────────────────────────────
    if (!group) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
            <p className="text-red-400 font-semibold">Group not found.</p>
        </div>
    );

    // ── Locked view ──────────────────────────────────────────────────────────
    if (!canAccess) return (
        <LockedView
            group={group}
            myRequest={myRequest}
            onRequestJoin={() => onRequestJoin(groupId)}
            onBack={() => onNavigate('back' as Page)}
            members={members}
            previewMsgs={messages}
        />
    );

    // ── Group messages with date separators ──────────────────────────────────
    type MsgItem = { type: 'date'; label: string; key: string } | { type: 'msg'; msg: GroupMessage; isFirst: boolean; key: string };
    const items: MsgItem[] = [];
    let lastDate = '';
    let lastUserId = -1;
    let lastTime   = 0;

    for (const msg of messages) {
        const dateLabel = fmtDate(msg.sentAt);
        if (dateLabel !== lastDate) {
            items.push({ type: 'date', label: dateLabel, key: `sep-${msg.sentAt}` });
            lastDate   = dateLabel;
            lastUserId = -1;
        }
        const msgTime  = new Date(msg.sentAt).getTime();
        const isFirst  = msg.userId !== lastUserId || (msgTime - lastTime) > 5 * 60 * 1000;
        items.push({ type: 'msg', msg, isFirst, key: String(msg.id) });
        lastUserId = msg.userId;
        lastTime   = msgTime;
    }

    // ── Full chat view ───────────────────────────────────────────────────────
    return (
        <div className="flex flex-col animate-fade-in" style={{ background: BG, minHeight: '100vh' }}>

            {/* ── Sticky header ───────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-30 px-4 pt-4 pb-3 flex items-center gap-3"
                style={{
                    background: 'rgba(8,8,10,0.95)',
                    backdropFilter: 'blur(18px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <button
                    onClick={() => onNavigate('back' as Page)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-70 flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ChevronLeftIcon className="w-4 h-4 text-white" />
                </button>

                {/* Group avatar */}
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {group.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                        {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                        {pendingRequests.length > 0 && (isAdmin || isCreator) &&
                            <span className="ml-2 font-bold" style={{ color: ACCENT }}>
                                · {pendingRequests.length} pending
                            </span>
                        }
                    </p>
                </div>

                {/* Admin badge */}
                {(isAdmin || isCreator) && (
                    <span
                        className="text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0"
                        style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                    >
                        ADMIN
                    </span>
                )}
            </div>

            {/* ── Admin requests panel ─────────────────────────────────────── */}
            {(isAdmin || isCreator) && pendingRequests.length > 0 && (
                <div className="pt-4">
                    <AdminRequestsPanel
                        requests={pendingRequests}
                        users={users}
                        onApprove={onApproveRequest}
                        onReject={onRejectRequest}
                    />
                </div>
            )}

            {/* ── Messages area ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-1.5">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div
                            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
                            style={{ background: `${ACCENT2}15`, border: `1px solid ${ACCENT2}25` }}
                        >
                            💬
                        </div>
                        <p className="text-white font-bold text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            No messages yet
                        </p>
                        <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
                            Be the first to say something to {group.name}!
                        </p>
                    </div>
                ) : (
                    items.map(item =>
                        item.type === 'date'
                            ? <DateSep key={item.key} label={item.label} />
                            : <MessageBubble
                                key={item.key}
                                msg={item.msg}
                                isMe={item.msg.userId === currentUser.id}
                                isFirst={item.isFirst}
                              />
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ────────────────────────────────────────────────── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3"
                style={{
                    background: 'rgba(8,8,10,0.97)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div className="flex items-center gap-3">
                    {/* Current user avatar */}
                    <img
                        src={currentUser.profilePhoto}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=333&color=fff`; }}
                    />

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={`Message ${group.name}…`}
                        className="flex-1 text-sm text-white placeholder-gray-600 outline-none bg-transparent"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 14,
                            padding: '10px 14px',
                        }}
                    />

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
                        style={{
                            background: text.trim()
                                ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`
                                : 'rgba(255,255,255,0.07)',
                            border: text.trim() ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        }}
                        aria-label="Send message"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
