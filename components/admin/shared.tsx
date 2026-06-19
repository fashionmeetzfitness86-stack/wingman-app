import React from 'react';

/**
 * Shared admin UI primitives
 * ─────────────────────────────────────────────────────────────
 * Small, reusable building blocks for the admin dashboard tabs so
 * every section (Approvals, Store, …) shares one consistent dark,
 * premium look instead of each tab re-inventing pills and headers.
 */

type PillTone = 'gold' | 'green' | 'red' | 'neutral';

const PILL_TONES: Record<PillTone, string> = {
    gold:    'bg-[#1A1810] border border-[#333020] text-[#B89B4D]',
    green:   'bg-[#051A10] border border-[#0A3A20] text-[#4DB87C]',
    red:     'bg-[#1A0505] border border-[#3A1010] text-[#D45050]',
    neutral: 'bg-[#14151A] border border-[#26272E] text-[#8A8E99]',
};

/** Maps a free-form status string to a coloured tone. */
function toneForStatus(status: string): PillTone {
    const s = status.toLowerCase();
    if (s.includes('approv') || s.includes('profile_created') || s.includes('confirmed')) return 'green';
    if (s.includes('reject') || s.includes('expired') || s.includes('declin')) return 'red';
    if (s.includes('pending') || s.includes('temporary') || s.includes('await')) return 'gold';
    return 'neutral';
}

/** Human-friendly label for the snake_case lead statuses. */
function prettyStatus(status: string): string {
    switch (status) {
        case 'temporary_access': return 'Temporary access';
        case 'profile_created':  return 'Profile created';
        case 'expired':          return 'Expired';
        default:                 return status.replace(/_/g, ' ');
    }
}

export const StatusPill: React.FC<{ status: string; tone?: PillTone }> = ({ status, tone }) => (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap ${PILL_TONES[tone ?? toneForStatus(status)]}`}>
        {prettyStatus(status)}
    </span>
);

export const SectionHeader: React.FC<{
    title: string;
    subtitle?: string;
    count?: number;
    countLabel?: string;
    action?: React.ReactNode;
}> = ({ title, subtitle, count, countLabel, action }) => (
    <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {typeof count === 'number' && (
                    <span className="bg-[#1A1810] border border-[#333020] text-[#B89B4D] text-xs font-bold px-2 py-0.5 rounded-full">
                        {count} {countLabel ?? ''}
                    </span>
                )}
            </div>
            {action}
        </div>
        {subtitle && <p className="text-[11px] text-[#5D616B] mt-1">{subtitle}</p>}
    </div>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-[#0F1014] border border-[#1C1D22] p-8 rounded-xl text-center text-[#5D616B] font-semibold text-sm">
        {message}
    </div>
);
