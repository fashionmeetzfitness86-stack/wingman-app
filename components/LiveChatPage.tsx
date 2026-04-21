
import React from 'react';

export const LiveChatPage: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-black animate-fade-in">
            <div className="p-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <h1 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Live Voice
                </h1>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                {/* Pulsing branded mic icon */}
                <div className="relative mb-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
                        style={{
                            background: 'linear-gradient(135deg, #9CA3AF, #374151)',
                            boxShadow: '0 0 40px rgba(55,65,81,0.2)',
                        }}
                    >
                        <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Voice Concierge
                </h2>
                <p className="text-[11px] font-bold tracking-widest uppercase mb-4"
                    style={{
                        background: 'linear-gradient(90deg, #9CA3AF, #374151)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Live Voice — Coming Soon
                </p>
                <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
                    Speak directly with your Wingman concierge. Real-time voice booking and event discovery launching soon.
                </p>

                <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#374151' }} />
                    In development
                </div>
            </div>
        </div>
    );
};
