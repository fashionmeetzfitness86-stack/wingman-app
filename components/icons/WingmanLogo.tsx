
import React from 'react';

/**
 * WingmanLogo — faithful SVG recreation of the official Wingman logo.
 * Wing feather (magenta top) flowing into a location pin (cyan base).
 * Uses the official brand gradient: #C724B1 → #6A4FE8 → #00C8FF
 */
export const WingmanLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-10 h-10', style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 76"
    fill="none"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <defs>
      {/* Vertical gradient: magenta top → indigo mid → cyan bottom — matches the logo */}
      <linearGradient id="wm-logo-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#C724B1" />
        <stop offset="45%"  stopColor="#6A4FE8" />
        <stop offset="100%" stopColor="#00C8FF" />
      </linearGradient>
      <linearGradient id="wm-logo-grad-h" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#C724B1" />
        <stop offset="50%"  stopColor="#6A4FE8" />
        <stop offset="100%" stopColor="#00C8FF" />
      </linearGradient>
    </defs>

    {/* ── Location pin body ── */}
    <path
      d="M32 8C21.5 8 13 16.5 13 27c0 15 19 41 19 41S51 42 51 27C51 16.5 42.5 8 32 8z"
      stroke="url(#wm-logo-grad)"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* ── Pin dot ── */}
    <circle cx="32" cy="27" r="6.5" fill="url(#wm-logo-grad)" />

    {/* ── Wing: large outer sweep (top-left) ── */}
    <path
      d="M22 18 C14 8, 2 10, 4 22 C6 30, 16 31, 22 26"
      stroke="url(#wm-logo-grad-h)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* ── Wing: inner feather detail ── */}
    <path
      d="M20 22 C13 15, 6 17, 8 24"
      stroke="url(#wm-logo-grad-h)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);