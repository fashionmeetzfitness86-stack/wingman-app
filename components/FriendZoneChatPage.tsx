
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { User, Wingman, FriendZoneChatMessage, FriendZoneChat } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { AddWingmanToChatModal } from './modals/AddWingmanToChatModal';
import { UsersIcon } from './icons/UsersIcon';
import { StarIcon } from './icons/StarIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ManageChatParticipantsModal } from './modals/ManageChatParticipantsModal';

interface FriendZoneChatPageProps {
  chatId: number;
  currentUser: User;
  chats: FriendZoneChat[];
  messages: FriendZoneChatMessage[];
  wingmen: Wingman[];
  users: User[];
  onSendMessage: (chatId: number, text: string) => void;
  onAddWingman: (chatId: number, wingmanId: number) => void;
  onRemoveWingman: (chatId: number, wingmanId: number) => void;
  onBack: () => void;
  onAddMember: (chatId: number, userId: number) => void;
  onRemoveMember: (chatId: number, userId: number) => void;
  onLeaveChat: (chatId: number) => void;
}

// ─── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble: React.FC<{
  message: FriendZoneChatMessage;
  sender: User | Wingman | undefined;
  isCurrentUser: boolean;
}> = ({ message, sender, isCurrentUser }) => (
  <div className={`flex items-end gap-2.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
    {/* Avatar — other side only */}
    {!isCurrentUser && (
      <img
        src={sender?.profilePhoto || `https://i.pravatar.cc/40?u=${sender?.id}`}
        alt={sender?.name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
        onError={e => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/40?u=${sender?.id}`; }}
      />
    )}

    <div className={`flex flex-col max-w-[72%] md:max-w-[55%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {/* Sender name for others */}
      {!isCurrentUser && sender && (
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
          {sender.name}
        </p>
      )}

      {/* Bubble */}
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isCurrentUser
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-orange-500/20'
            : 'bg-white/[0.06] border border-white/[0.08] text-gray-100 rounded-bl-md backdrop-blur-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      {/* Timestamp */}
      <p className="text-[10px] text-gray-600 mt-1 px-1">{message.timestamp}</p>
    </div>
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────────────
export const FriendZoneChatPage: React.FC<FriendZoneChatPageProps> = ({
  chatId,
  currentUser,
  chats,
  messages,
  wingmen,
  users,
  onSendMessage,
  onAddWingman,
  onRemoveWingman,
  onBack,
  onAddMember,
  onRemoveMember,
  onLeaveChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isWingmanModalOpen, setIsWingmanModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [wingmenExpanded, setWingmenExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === chatId);
  const chatMessages = messages.filter(m => m.chatId === chatId);
  const allParticipants = useMemo(() => [...users, ...wingmen], [users, wingmen]);

  const activeWingmen = useMemo(() => {
    if (!currentChat?.wingmanIds) return [];
    return currentChat.wingmanIds
      .map(id => wingmen.find(p => p.id === id))
      .filter(Boolean) as Wingman[];
  }, [currentChat, wingmen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(chatId, inputValue.trim());
    setInputValue('');
  };

  if (!currentChat) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-2xl mb-2">💬</p>
          <p>Chat not found.</p>
          <button onClick={onBack} className="mt-4 text-orange-500 text-sm font-bold hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-[#0A0A0C] animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0 group"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">Back</span>
            </button>

            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <h1 className="font-bold text-white truncate">{currentChat.name}</h1>
              </div>
              <p className="text-[11px] text-gray-500">
                {currentChat.memberIds.length} member{currentChat.memberIds.length !== 1 ? 's' : ''}
                {activeWingmen.length > 0 && ` · ${activeWingmen.length} wingman${activeWingmen.length !== 1 ? 'en' : ''}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Wingman toggle pill */}
            <button
              onClick={() => setWingmenExpanded(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeWingmen.length > 0
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                  : 'bg-white/5 border border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/10'
              }`}
            >
              <StarIcon className="w-3 h-3 fill-current" />
              {activeWingmen.length > 0 ? `${activeWingmen.length} Wingman` : 'Wingmen'}
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Manage chat"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Expandable wingman panel ──────────────────────────── */}
        {wingmenExpanded && (
          <div className="px-4 pb-3 border-t border-white/[0.04] pt-3 animate-fade-in">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Active Wingmen
                </span>
                <button
                  onClick={() => setIsWingmanModalOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full transition-all"
                >
                  + Add Wingman
                </button>
              </div>

              {activeWingmen.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {activeWingmen.map(wingman => (
                    <div
                      key={wingman.id}
                      className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img
                            src={wingman.profilePhoto || `https://i.pravatar.cc/40?u=${wingman.id}`}
                            alt={wingman.name}
                            className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center">
                            <StarIcon className="w-2 h-2 text-black fill-current" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{wingman.name}</p>
                          <p className="text-[10px] text-amber-400/70">{wingman.handle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveWingman(chatId, wingman.id)}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1 rounded-full transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600 py-1.5">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-xs italic">No wingman in this chat yet</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Chat feed ──────────────────────────────────────────────── */}
      <div className="flex-grow overflow-y-auto px-4 py-5 space-y-4 no-scrollbar"
        style={{ background: 'linear-gradient(to bottom, #0A0A0C 0%, #0D0D10 100%)' }}
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center pb-12">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-white font-bold text-lg">Start the conversation</p>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              This is the beginning of <span className="text-orange-400 font-semibold">{currentChat.name}</span>. Say something!
            </p>
          </div>
        ) : (
          chatMessages.map(msg => {
            const sender = allParticipants.find(p => p.id === msg.senderId);
            const isCurrentUser = msg.senderId === currentUser.id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                sender={sender}
                isCurrentUser={isCurrentUser}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Message input ───────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#0A0A0C]/95 backdrop-blur-xl border-t border-white/[0.06]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <div className="flex-grow relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type a message…"
              className="w-full bg-white/[0.05] border border-white/[0.09] hover:border-white/[0.14] focus:border-orange-500/60 text-white placeholder-gray-600 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: inputValue.trim()
                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                : 'rgba(255,255,255,0.05)',
              boxShadow: inputValue.trim() ? '0 4px 20px rgba(249,115,22,0.35)' : 'none',
            }}
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AddWingmanToChatModal
        isOpen={isWingmanModalOpen}
        onClose={() => setIsWingmanModalOpen(false)}
        wingmen={wingmen}
        onAdd={(wingmanId) => {
          onAddWingman(chatId, wingmanId);
          setIsWingmanModalOpen(false);
        }}
      />

      <ManageChatParticipantsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        chat={currentChat}
        currentUser={currentUser}
        allUsers={users}
        onAddMember={(userId) => onAddMember(chatId, userId)}
        onRemoveMember={(userId) => onRemoveMember(chatId, userId)}
        onLeaveChat={() => onLeaveChat(chatId)}
      />
    </div>
  );
};
