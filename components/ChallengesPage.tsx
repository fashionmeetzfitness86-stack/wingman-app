
import React from 'react';
import wingmanIcon from '../assets/wingman-icon.png';

interface ChallengesPageProps {
  challenges?: unknown[];
  onToggleTask?: (challengeId: number, taskId: number) => void;
  onDeleteTask?: (challengeId: number, taskId: number) => void;
  onRewardClaimed?: (rewardAmount: number, challengeTitle: string) => void;
}

const CITY_SPOTS = [
  { icon: '🌊', label: 'Wynwood Walls' },
  { icon: '🛥', label: 'Biscayne Bay' },
  { icon: '🌴', label: 'South Beach' },
  { icon: '🍽', label: 'Brickell Dining' },
  { icon: '🎶', label: 'Little Havana' },
  { icon: '🚤', label: 'Key Biscayne' },
];

export const ChallengesPage: React.FC<ChallengesPageProps> = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-28 text-center animate-fade-in" style={{ background: 'transparent' }}>

      {/* ── Map pin icon ── */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            transform: 'scale(2.2)',
          }}
        />
        <div className="w-24 h-24 flex items-center justify-center relative">
          <img src={wingmanIcon} alt="WINGMAN" className="w-20 h-auto" />
        </div>
      </div>

      {/* ── Headline ── */}
      <h1
        className="font-black text-4xl leading-tight mb-2 text-white"
        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
      >
        Wingman will make you<br />
        <span style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          explore the city.
        </span>
      </h1>

      {/* ── City ── */}
      <p
        className="text-lg font-bold tracking-widest uppercase mb-3"
        style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em' }}
      >
        Miami
      </p>

      {/* ── Subtext ── */}
      <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed mb-10">
        Challenges, missions, and city drops are coming. Every week, a new reason to go out.
      </p>

      {/* ── City spots grid ── */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-10">
        {CITY_SPOTS.map(({ icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Coming soon indicator ── */}
      <div className="flex items-center gap-2.5 text-xs text-gray-600">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, #FFFFFF, #374151)' }}
        />
        <span>Coming soon</span>
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, #FFFFFF, #374151)', animationDelay: '0.5s' }}
        />
      </div>
    </div>
  );
};