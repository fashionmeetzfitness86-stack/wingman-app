import React, { useState, useEffect } from 'react';
import { User, UserRole, UserAccessLevel } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';

interface AdminEditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const WAIVER_OPTIONS = {
    none: 'No Waiver',
    '1_month': '1 Month Free',
    '3_months': '3 Months Free',
    '6_months': '6 Months Free',
    '1_year': '1 Year Free',
    forever: 'Forever Free',
};

const getWaiverValue = (waiveUntil?: string): keyof typeof WAIVER_OPTIONS => {
    if (waiveUntil === 'forever') return 'forever';
    if (!waiveUntil) return 'none';
    const today = new Date();
    const untilDate = new Date(waiveUntil);
    if (untilDate < today) return 'none';
    const diffDays = Math.ceil((untilDate.getTime() - today.getTime()) / 86_400_000);
    if (diffDays > 300) return '1_year';
    if (diffDays > 150) return '6_months';
    if (diffDays > 60) return '3_months';
    if (diffDays > 0) return '1_month';
    return 'none';
};

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT = '#E040FB';

// ── Tiny select ───────────────────────────────────────────────────────────────
const Field: React.FC<{
    label: string;
    hint?: string;
    children: React.ReactNode;
}> = ({ label, hint, children }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {label}
            </label>
            {hint && <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{hint}</span>}
        </div>
        {children}
    </div>
);

const StyledSelect: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    accent?: string;
}> = ({ value, onChange, children, accent }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl text-sm font-semibold text-white outline-none appearance-none transition-all"
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${accent ? `${accent}40` : 'rgba(255,255,255,0.08)'}`,
            padding: '11px 14px',
            color: accent || '#fff',
        }}
        onFocus={e => { e.currentTarget.style.border = `1px solid ${ACCENT}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`; }}
        onBlur={e => { e.currentTarget.style.border = `1px solid ${accent ? `${accent}40` : 'rgba(255,255,255,0.08)'}`; e.currentTarget.style.boxShadow = 'none'; }}
    >
        {children}
    </select>
);

// ── Status chip colours ───────────────────────────────────────────────────────
const approvalColor = (s?: string) => {
    if (s === 'approved') return '#4ade80';
    if (s === 'rejected') return '#f87171';
    return '#fbbf24';
};
const statusColor = (s?: string) => s === 'blocked' ? '#f87171' : '#4ade80';
const roleColor   = (r: string) => r === UserRole.ADMIN ? '#a78bfa' : r === UserRole.WINGMAN ? '#fb923c' : '#60a5fa';

// ── Main ──────────────────────────────────────────────────────────────────────
export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [editedUser, setEditedUser] = useState<User | null>(user);
    const [saved, setSaved] = useState(false);

    useEffect(() => { setEditedUser(user); setSaved(false); }, [user]);

    const handleSave = () => {
        if (!editedUser) return;
        onSave(editedUser);
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 800);
    };

    const handleChange = (field: keyof User, value: any) => {
        if (editedUser) setEditedUser(prev => ({ ...prev!, [field]: value }));
    };

    const handleWaiverChange = (waiverKey: keyof typeof WAIVER_OPTIONS) => {
        if (!editedUser) return;
        if (waiverKey === 'none') {
            const { waiveSubscriptionUntil, ...rest } = editedUser;
            setEditedUser({ ...rest, subscriptionStatus: 'active' });
            return;
        }
        if (waiverKey === 'forever') {
            setEditedUser({ ...editedUser, waiveSubscriptionUntil: 'forever', subscriptionStatus: 'free_tier' });
            return;
        }
        const months = { '1_month': 1, '3_months': 3, '6_months': 6, '1_year': 12 }[waiverKey] || 1;
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        setEditedUser({ ...editedUser, waiveSubscriptionUntil: d.toISOString().split('T')[0], subscriptionStatus: 'free_tier' });
    };

    if (!isOpen || !editedUser) return null;

    const isWingman = editedUser.role === UserRole.WINGMAN;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full m-4 flex flex-col"
                style={{
                    maxWidth: 460,
                    maxHeight: '92vh',
                    background: '#0F0F14',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    boxShadow: `0 0 80px rgba(0,0,0,0.8), 0 0 40px ${ACCENT}12`,
                    fontFamily: "'Space Grotesk', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-6 pt-5 pb-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user?.profilePhoto ? (
                            <img
                                src={user.profilePhoto}
                                alt={user.name}
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                style={{ border: `2px solid ${roleColor(editedUser.role)}30` }}
                            />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                                style={{ background: `${roleColor(editedUser.role)}15`, color: roleColor(editedUser.role) }}
                            >
                                {user?.name?.[0] ?? '?'}
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: ACCENT }}>
                                Edit User
                            </p>
                            <h2 className="text-lg font-black text-white leading-tight">{user?.name}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Live badge strip ──────────────────────────────── */}
                <div className="flex gap-2 px-6 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Role badge */}
                    <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: `${roleColor(editedUser.role)}15`, color: roleColor(editedUser.role), border: `1px solid ${roleColor(editedUser.role)}30` }}
                    >
                        {editedUser.role}
                    </span>
                    {/* Approval badge */}
                    <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-full capitalize"
                        style={{ background: `${approvalColor(editedUser.approvalStatus)}12`, color: approvalColor(editedUser.approvalStatus), border: `1px solid ${approvalColor(editedUser.approvalStatus)}30` }}
                    >
                        {editedUser.approvalStatus ?? 'pending'}
                    </span>
                    {/* Status badge */}
                    <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-full capitalize"
                        style={{ background: `${statusColor(editedUser.status)}12`, color: statusColor(editedUser.status), border: `1px solid ${statusColor(editedUser.status)}30` }}
                    >
                        {editedUser.status || 'active'}
                    </span>
                </div>

                {/* ── Form fields ───────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="User Role">
                            <StyledSelect value={editedUser.role} onChange={e => handleChange('role', e.target.value)} accent={roleColor(editedUser.role)}>
                                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </StyledSelect>
                        </Field>

                        <Field label="Access Level">
                            <StyledSelect value={editedUser.accessLevel} onChange={e => handleChange('accessLevel', e.target.value)}>
                                {Object.values(UserAccessLevel).map(l => <option key={l} value={l}>{l}</option>)}
                            </StyledSelect>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Status">
                            <StyledSelect value={editedUser.status || 'active'} onChange={e => handleChange('status', e.target.value as 'active' | 'blocked')} accent={statusColor(editedUser.status)}>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </StyledSelect>
                        </Field>

                        <Field label="Approval Status">
                            <StyledSelect value={editedUser.approvalStatus ?? 'pending'} onChange={e => handleChange('approvalStatus', e.target.value as 'pending' | 'approved' | 'rejected')} accent={approvalColor(editedUser.approvalStatus)}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </StyledSelect>
                        </Field>
                    </div>

                    {/* Wingman-only: subscription waiver */}
                    {isWingman && (
                        <div
                            className="rounded-2xl p-4 space-y-3"
                            style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)' }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#fb923c' }}>
                                    🔥 Wingman — Subscription
                                </span>
                            </div>
                            <Field label="Waive Monthly Fee" hint="Grants free access for duration">
                                <StyledSelect value={getWaiverValue(editedUser.waiveSubscriptionUntil)} onChange={e => handleWaiverChange(e.target.value as keyof typeof WAIVER_OPTIONS)} accent="#fb923c">
                                    {Object.entries(WAIVER_OPTIONS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                                </StyledSelect>
                            </Field>
                            {editedUser.waiveSubscriptionUntil && editedUser.waiveSubscriptionUntil !== 'none' && (
                                <p className="text-[11px] font-semibold" style={{ color: '#fb923c' }}>
                                    {editedUser.waiveSubscriptionUntil === 'forever'
                                        ? '♾️ Free forever'
                                        : `⏱ Waived until ${editedUser.waiveSubscriptionUntil}`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email preview */}
                    {user?.email && (
                        <div
                            className="rounded-xl px-4 py-3 flex items-center gap-3"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.email}</span>
                        </div>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between gap-3 px-6 py-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                        style={{
                            background: saved
                                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                                : `linear-gradient(135deg, ${ACCENT}, #7B61FF)`,
                            boxShadow: saved
                                ? '0 4px 20px rgba(34,197,94,0.35)'
                                : `0 4px 20px ${ACCENT}35`,
                            minWidth: 130,
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {saved ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Saved!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3v4H7V3M12 12v5m-2-2.5h4" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
