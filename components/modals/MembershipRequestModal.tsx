
import React, { useState, useEffect } from 'react';
import { User, MembershipRequest } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface MembershipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSubmit: (request: Omit<MembershipRequest, 'id'>) => void;
    alreadySubmitted: boolean;
}

export const MembershipRequestModal: React.FC<MembershipRequestModalProps> = ({
    isOpen,
    onClose,
    currentUser,
    onSubmit,
    alreadySubmitted,
}) => {
    const [instagram, setInstagram] = useState(currentUser.instagramHandle ?? '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Reset form when re-opened
    useEffect(() => {
        if (isOpen) {
            setInstagram(currentUser.instagramHandle ?? '');
            setMessage('');
            setError('');
            setSubmitted(false);
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!message.trim() || message.trim().length < 20) {
            setError('Please write at least 20 characters about why you want access.');
            return;
        }
        setError('');
        onSubmit({
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            userPhoto: currentUser.profilePhoto,
            instagramHandle: instagram.replace(/^@/, '').trim() || undefined,
            message: message.trim(),
            submittedAt: new Date().toISOString(),
            status: 'pending',
        });
        setSubmitted(true);
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Request platform access"
        >
            <div
                className="bg-[#121212] border border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md mx-0 sm:mx-4 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(236,72,153,0.12)' }}
                        >
                            <ShieldCheckIcon className="w-5 h-5" style={{ color: '#EC4899' }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Request Platform Access</h2>
                            <p className="text-xs text-gray-500">Reviewed by admin within 24–48 hrs</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5 overflow-y-auto">
                    {alreadySubmitted || submitted ? (
                        /* ── Already submitted state ── */
                        <div className="flex flex-col items-center py-8 text-center gap-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(236,72,153,0.12)' }}
                            >
                                <ShieldCheckIcon className="w-8 h-8" style={{ color: '#EC4899' }} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg mb-1">Request Submitted</p>
                                <p className="text-sm text-gray-400">
                                    Your access request is under review. You'll be notified once the admin makes a decision.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 text-sm font-semibold text-white border border-gray-700 rounded-full px-6 py-2 hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        /* ── Form ── */
                        <>
                            {/* User context strip */}
                            <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                                <img
                                    src={currentUser.profilePhoto}
                                    alt={currentUser.name}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                </div>
                            </div>

                            {/* Instagram (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Instagram Handle <span className="text-gray-600 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">@</span>
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={e => setInstagram(e.target.value.replace(/^@/, ''))}
                                        placeholder="yourhandle"
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none transition-colors"
                                        style={{ '--tw-ring-color': '#EC4899' } as React.CSSProperties}
                                        onFocus={e => (e.currentTarget.style.borderColor = '#EC4899')}
                                        onBlur={e => (e.currentTarget.style.borderColor = '')}
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Why do you want access? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => { setMessage(e.target.value); setError(''); }}
                                    placeholder="Tell us a bit about yourself and why you'd like to join the Wingman platform..."
                                    rows={4}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-colors"
                                    onFocus={e => (e.currentTarget.style.borderColor = '#EC4899')}
                                    onBlur={e => (e.currentTarget.style.borderColor = '')}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {error
                                        ? <p className="text-xs text-red-400">{error}</p>
                                        : <span />
                                    }
                                    <p className={`text-xs ml-auto ${message.length < 20 ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {message.length} / 20 min
                                    </p>
                                </div>
                            </div>

                            {/* What happens next */}
                            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
                                <p className="font-semibold text-gray-400 mb-1">What happens next</p>
                                <p>① Your request is sent directly to the admin queue</p>
                                <p>② Admin reviews and approves or rejects</p>
                                <p>③ On approval, your account is activated for booking</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!alreadySubmitted && !submitted && (
                    <div className="p-5 border-t border-gray-800 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 font-bold py-3 rounded-xl text-white text-sm transition-all active:scale-[0.98]"
                            style={{ background: '#EC4899' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#db2777')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#EC4899')}
                        >
                            Submit Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
