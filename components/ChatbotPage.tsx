
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { SendIcon } from './icons/SendIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { WingmanChat, WingmanChatMessage, User } from '../types';

interface ChatbotPageProps {
    chatId?: number;
    initialPrompt?: string;
    currentUser: User;
    wingmanChats: WingmanChat[];
    messages: WingmanChatMessage[];
    onSendMessage: (chatId: number | undefined, text: string) => void;
    onBack: () => void;
}

// ── Quick-reply suggestion chips shown on empty state
const QUICK_REPLIES = [
    'Get me on a guestlist 🎟️',
    'Book a table at LIV 🥂',
    'Plan my weekend in Miami 🌴',
    'What yacht packages are available? ⛵',
];

// ── Format ISO timestamp → readable time
function fmtTime(ts: string): string {
    try {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return ts; }
}

// ── Animated dots avatar wrapper
const BotAvatar: React.FC<{ size?: number }> = ({ size = 8 }) => (
    <div
        className={`w-${size} h-${size} rounded-2xl flex-shrink-0 flex items-center justify-center`}
        style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
        }}
    >
        <SparkleIcon className={`w-${Math.round(size * 0.55)} h-${Math.round(size * 0.55)} text-white`} />
    </div>
);

// ── Typing indicator
const TypingDots: React.FC = () => (
    <div className="flex items-center gap-1 px-1 py-0.5">
        {[0, 150, 300].map(delay => (
            <div
                key={delay}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#6366f1', animationDelay: `${delay}ms` }}
            />
        ))}
    </div>
);

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
    chatId, initialPrompt, currentUser, wingmanChats, messages, onSendMessage, onBack,
}) => {
    const [inputValue, setInputValue] = useState(initialPrompt || '');
    const [isTyping,   setIsTyping]   = useState(false);
    const [pulse,      setPulse]      = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef       = useRef<HTMLInputElement>(null);

    const chatMessages = useMemo(
        () => messages.filter(m => m.chatId === chatId),
        [messages, chatId]
    );

    // Online pulse animation
    useEffect(() => {
        const t = setInterval(() => setPulse(p => !p), 1600);
        return () => clearInterval(t);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isTyping]);

    // Typing simulation after user sends
    useEffect(() => {
        const last = chatMessages[chatMessages.length - 1];
        if (last && last.senderId === currentUser.id) {
            setIsTyping(true);
            const t = setTimeout(() => setIsTyping(false), 1500);
            return () => clearTimeout(t);
        } else {
            setIsTyping(false);
        }
    }, [chatMessages, currentUser.id]);

    const handleSend = (e: React.FormEvent, override?: string) => {
        e.preventDefault();
        const text = (override ?? inputValue).trim();
        if (!text) return;
        onSendMessage(chatId, text);
        setInputValue('');
        setIsTyping(true);
        inputRef.current?.focus();
    };

    const isEmpty = chatMessages.length === 0;

    return (
        <div
            className="flex flex-col animate-fade-in"
            style={{ height: 'calc(100vh - 5rem)', background: '#08080A' }}
        >
            {/* ── Sticky header ─────────────────────────────────────────── */}
            <div
                className="flex-shrink-0 flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
                style={{
                    background: 'rgba(8,8,10,0.92)',
                    backdropFilter: 'blur(18px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                {/* Back */}
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
                    aria-label="Go back"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <BotAvatar size={10} />

                {/* Info */}
                <div className="flex-grow min-w-0">
                    <h2
                        className="font-black text-white leading-tight text-sm"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Gaby — Wingman AI
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                            className="w-1.5 h-1.5 rounded-full transition-all duration-700"
                            style={{
                                background: pulse ? '#34d399' : '#10b981',
                                boxShadow: pulse ? '0 0 6px #34d399' : 'none',
                            }}
                        />
                        <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>
                            Always online
                        </span>
                    </div>
                </div>

                {/* Concierge badge */}
                <div
                    className="flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                    AI Concierge
                </div>
            </div>

            {/* ── Message area ──────────────────────────────────────────── */}
            <div className="flex-grow overflow-y-auto px-4 py-5" style={{ scrollbarWidth: 'none' }}>
                {/* Empty state */}
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center min-h-[50%] gap-6 animate-fade-in">
                        {/* Hero avatar */}
                        <div
                            className="w-20 h-20 rounded-3xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg,#6366f1,#a855f7,#06b6d4)',
                                boxShadow: '0 0 48px rgba(99,102,241,0.3)',
                            }}
                        >
                            <SparkleIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center max-w-xs">
                            <h3
                                className="text-xl font-black text-white mb-2"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                Hey, I'm Gaby 👋
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                                Your personal Miami concierge. Ask me anything — guestlists, tables, bookings, or just vibe recommendations.
                            </p>
                        </div>

                        {/* Quick-reply chips */}
                        <div className="flex flex-col gap-2 w-full max-w-xs">
                            {QUICK_REPLIES.map(qr => (
                                <button
                                    key={qr}
                                    onClick={e => { setInputValue(qr); handleSend(e, qr); }}
                                    className="w-full text-left text-sm font-semibold px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        color: '#d1d5db',
                                    }}
                                >
                                    {qr}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {!isEmpty && (
                    <div className="space-y-5">
                        {chatMessages.map((msg, i) => {
                            const isUser   = msg.senderId === currentUser.id;
                            const prevMsg  = chatMessages[i - 1];
                            const showAvatar = !isUser && (!prevMsg || prevMsg.senderId === currentUser.id);

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`flex items-end gap-2.5 max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Bot avatar — only on first in group */}
                                        {!isUser && (
                                            <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                <BotAvatar size={8} />
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div
                                            className="px-4 py-3 text-sm leading-relaxed"
                                            style={isUser ? {
                                                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                                borderRadius: '20px 20px 4px 20px',
                                                color: '#fff',
                                                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                                            } : {
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '20px 20px 20px 4px',
                                                color: '#e5e7eb',
                                            }}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <span
                                        className={`text-[10px] font-medium ${isUser ? 'pr-2' : 'pl-12'}`}
                                        style={{ color: '#374151' }}
                                    >
                                        {fmtTime(msg.timestamp)}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex items-end gap-2.5 max-w-[82%]">
                                <BotAvatar size={8} />
                                <div
                                    className="px-4 py-3"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '20px 20px 20px 4px',
                                    }}
                                >
                                    <TypingDots />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input bar ─────────────────────────────────────────────── */}
            <div
                className="flex-shrink-0 px-4 py-3"
                style={{
                    background: 'rgba(8,8,10,0.95)',
                    backdropFilter: 'blur(18px)',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Message Gaby…"
                        aria-label="Message input"
                        className="flex-grow text-sm text-white placeholder-gray-700 outline-none"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 16,
                            padding: '12px 18px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        aria-label="Send message"
                        className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                        style={{
                            background: inputValue.trim()
                                ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                                : 'rgba(255,255,255,0.07)',
                            boxShadow: inputValue.trim() ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                            color: '#fff',
                        }}
                    >
                        <SendIcon className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
