
import React, { useState } from 'react';
import { BookingsIcon } from './icons/BookingsIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { QuestionMarkCircleIcon } from './icons/FeatureIcons';
import { UserIcon } from './icons/UserIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { PlayIcon } from './icons/PlayIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { Page } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface HelpPageProps {
  onNavigate: (page: Page) => void;
}

const HELP_ACCENT   = '#4ade80'; // green
const TOPIC_COLORS  = ['#7B61FF', '#E040FB', '#00D4FF', '#F59E0B', '#4ade80', '#00D4FF'];

const TOPICS = [
  { icon: <BookingsIcon className="w-5 h-5" />, label: 'Payment Methods' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Booking Management' },
  { icon: <LocationMarkerIcon className="w-5 h-5" />, label: 'Location Services' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Account Settings' },
  { icon: <BookingsIcon className="w-5 h-5" />, label: 'Event Tickets' },
  { icon: <QuestionMarkCircleIcon className="w-5 h-5" />, label: 'FAQ' },
];

const FAQ_ITEMS = [
  { q: 'How do I book an experience?', a: 'Browse events and tap "Reserve Spot" on any listing to start the booking flow.' },
  { q: 'Can I cancel a reservation?', a: 'Cancellations must be made at least 24 hours before the event. Check your booking details for the cancellation policy.' },
  { q: 'How do I contact support?', a: 'Use the Report an Issue option in Settings or email support@wingman-app.com.' },
];

const TopicCard: React.FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <button
    onClick={() => (window as any).showAppToast?.(`Navigating to ${label} help topic.`)}
    className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl w-full aspect-square transition-all duration-200 text-left"
    style={{
      background: 'var(--settings-row-bg)',
      border: '1px solid var(--settings-row-border)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-hover)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--settings-row-bg)'; }}
    aria-label={`Go to help topic: ${label}`}
  >
    <div
      className="w-11 h-11 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
    >
      {icon}
    </div>
    <p className="text-xs font-bold text-center leading-tight" style={{ color: 'var(--color-text)' }}>{label}</p>
  </button>
);

const VideoCard: React.FC<{ image: string; title: string }> = ({ image, title }) => (
  <button
    onClick={() => (window as any).showAppToast?.(`Playing tutorial: ${title}`)}
    className="flex-shrink-0 w-56 rounded-2xl overflow-hidden relative group text-left"
    style={{ border: '1px solid var(--color-border)' }}
    aria-label={`Watch tutorial: ${title}`}
  >
    <img src={image} alt={title} className="w-full h-36 object-cover" />
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <PlayIcon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
      <p className="text-white text-xs font-bold">{title}</p>
    </div>
  </button>
);

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen pb-32 animate-fade-in" style={{ background: 'transparent' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 pt-5 pb-4"
        style={{
          background: isDark ? 'rgba(8,8,10,0.92)' : 'rgba(250,248,245,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => onNavigate('settings')}
          className="inline-flex items-center gap-2 transition-colors mb-4 text-sm font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Back to Settings"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Settings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text)' }}
            >
              Help &amp; Support
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>
              FAQs, guides &amp; contact
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${HELP_ACCENT}18`, border: `1px solid ${HELP_ACCENT}30`, color: HELP_ACCENT }}
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search for help…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-2xl py-3 pl-10 pr-4 transition-all"
            style={{
              background: 'var(--settings-row-bg)',
              border: '1px solid var(--settings-row-border)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
            aria-label="Search for help articles"
            onFocus={e => { e.currentTarget.style.borderColor = HELP_ACCENT + '60'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--settings-row-border)'; }}
          />
          <div className="absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-sub)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {/* Popular Topics */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest px-1 pb-3" style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}>
            Popular Topics
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TOPICS.map((topic, i) => (
              <TopicCard key={topic.label} icon={topic.icon} label={topic.label} color={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest px-1 pb-3" style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}>
            Frequently Asked
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--color-border)', background: 'var(--settings-row-bg)' }}
          >
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={item.q}
                style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.02]"
                  aria-expanded={openFaq === i}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.q}</p>
                  </div>
                  <svg
                    className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: 'var(--color-text-sub)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest px-1 pb-3" style={{ color: 'var(--color-text-sub)', letterSpacing: '0.12em' }}>
            Video Tutorials
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 no-scrollbar">
            <VideoCard image="https://picsum.photos/seed/booking-video/400/300" title="Booking a Table" />
            <VideoCard image="https://picsum.photos/seed/nightclub-video/400/300" title="Nightclub Access" />
            <VideoCard image="https://picsum.photos/seed/yacht-video/400/300" title="Yacht Charters" />
          </div>
        </div>

        {/* Contact support CTA */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${HELP_ACCENT}10, ${HELP_ACCENT}05)`,
            border: `1px solid ${HELP_ACCENT}25`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${HELP_ACCENT}18`, color: HELP_ACCENT }}
          >
            <span className="text-lg">💬</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Still need help?</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Our team typically responds within 24 hours.</p>
          </div>
          <button
            onClick={() => onNavigate('reportIssue')}
            className="text-xs font-bold py-2 px-3 rounded-xl flex-shrink-0 transition-all active:scale-95"
            style={{ background: HELP_ACCENT, color: '#000' }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};
