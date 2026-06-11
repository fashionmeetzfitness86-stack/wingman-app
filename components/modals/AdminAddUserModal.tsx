
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, UserAccessLevel } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { Spinner } from '../icons/Spinner';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface AdminAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'joinDate'>) => Promise<void>;
}

const initialFormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.USER,
    accessLevel: UserAccessLevel.GENERAL,
    status: 'active' as 'active' | 'blocked' | 'suspended',
    approvalStatus: 'pending' as 'pending' | 'approved' | 'rejected',
    profilePhoto: '',
    bio: '',
    city: 'Miami',
    instagramHandle: '',
    phoneNumber: '',
    dob: '',
    ethnicity: '',
    appearance: { height: '', eyeColor: '', hairColor: '', build: '' },
};

// ── Brand accent ──────────────────────────────────────────────────────────────
const ACCENT = '#E040FB';
const ACCENT_GLOW = 'rgba(224,64,251,0.18)';

// ── Stepper ───────────────────────────────────────────────────────────────────
const STEPS = ['Credentials', 'Profile', 'Details'];

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center px-8 pt-6 pb-4">
        {STEPS.map((label, i) => {
            const n = i + 1;
            const done = currentStep > n;
            const active = currentStep === n;
            return (
                <React.Fragment key={n}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300"
                            style={{
                                background: done ? ACCENT : active ? ACCENT_GLOW : 'rgba(255,255,255,0.05)',
                                border: `2px solid ${done || active ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                                color: done ? '#fff' : active ? ACCENT : 'rgba(255,255,255,0.3)',
                                boxShadow: active ? `0 0 14px ${ACCENT}55` : 'none',
                            }}
                        >
                            {done ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : n}
                        </div>
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                            style={{ color: active ? ACCENT : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                        >
                            {label}
                        </p>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className="flex-1 h-px mx-3 transition-all duration-500"
                            style={{ background: currentStep > n ? ACCENT : 'rgba(255,255,255,0.08)' }}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    error?: string;
    prefix?: string;
    placeholder?: string;
    disabled?: boolean;
}> = ({ label, error, prefix, required, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {label}{required && <span style={{ color: ACCENT }}> *</span>}
        </label>
        <div className="relative">
            {prefix && (
                <span className="absolute inset-y-0 left-3.5 flex items-center text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {prefix}
                </span>
            )}
            <input
                {...props}
                className="w-full rounded-xl text-sm text-white outline-none transition-all"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
                    padding: prefix ? '12px 14px 12px 28px' : '12px 14px',
                    // focus handled via JS below
                }}
                onFocus={e => { e.currentTarget.style.border = `1px solid ${ACCENT}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}18`; }}
                onBlur={e => { e.currentTarget.style.border = `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.08)'}`; e.currentTarget.style.boxShadow = 'none'; }}
            />
        </div>
        {error && <p className="text-[11px] font-semibold" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ label, disabled, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {label}
        </label>
        <select
            {...props}
            disabled={disabled}
            className="w-full rounded-xl text-sm text-white outline-none appearance-none transition-all"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '12px 14px',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onFocus={e => { e.currentTarget.style.border = `1px solid ${ACCENT}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}18`; }}
            onBlur={e => { e.currentTarget.style.border = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
    </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────
export const AdminAddUserModal: React.FC<AdminAddUserModalProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [newUser, setNewUser] = useState(initialFormState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setNewUser(initialFormState);
            setErrors({});
            setIsSaving(false);
            setStep(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (newUser.role === UserRole.ADMIN) {
            setNewUser(prev => ({ ...prev, accessLevel: UserAccessLevel.APPROVED_GIRL }));
        }
    }, [newUser.role]);

    const validateStep = (s: number) => {
        const e: Record<string, string> = {};
        if (s === 1) {
            if (!newUser.name.trim()) e.name = 'Name is required.';
            if (!newUser.email.trim()) e.email = 'Email is required.';
            else if (!/\S+@\S+\.\S+/.test(newUser.email)) e.email = 'Email is invalid.';
            if (!newUser.password) e.password = 'Password is required.';
            else if (newUser.password.length < 8) e.password = 'At least 8 characters.';
            if (newUser.password !== newUser.confirmPassword) e.confirmPassword = 'Passwords do not match.';
        }
        if (s === 2) {
            if (newUser.instagramHandle && !/^[a-zA-Z0-9._]+$/.test(newUser.instagramHandle)) {
                e.instagramHandle = 'Invalid Instagram handle format.';
            }
        }
        if (s === 3) {
            if (newUser.dob) {
                const bd = new Date(newUser.dob);
                if (bd > new Date()) e.dob = 'Cannot be in the future.';
                else if (new Date().getFullYear() - bd.getFullYear() < 21) e.dob = 'Must be at least 21.';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => { if (validateStep(step)) setStep(p => p + 1); };
    const handleBack = () => setStep(p => p - 1);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => handleChange('profilePhoto', reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!validateStep(3)) return;
        setIsSaving(true);
        const { password, confirmPassword, ...userToSave } = newUser;
        if (!userToSave.profilePhoto) {
            userToSave.profilePhoto = `https://i.pravatar.cc/150?u=${Date.now()}`;
        }
        await onSave(userToSave);
        onClose();
    };

    const handleChange = (field: keyof typeof newUser, value: any) =>
        setNewUser(prev => ({ ...prev, [field]: value }));

    const handleAppearanceChange = (field: keyof typeof newUser.appearance, value: any) =>
        setNewUser(prev => ({ ...prev, appearance: { ...prev.appearance, [field]: value } }));

    if (!isOpen) return null;
    const isRoleAdmin = newUser.role === UserRole.ADMIN;

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
                    maxWidth: 520,
                    maxHeight: '92vh',
                    background: '#0F0F14',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    boxShadow: `0 0 80px rgba(0,0,0,0.8), 0 0 40px ${ACCENT}18`,
                    fontFamily: "'Space Grotesk', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-6 pt-5 pb-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="pb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: ACCENT }}>
                            Admin
                        </p>
                        <h2 className="text-xl font-black text-white">Create New User</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                        aria-label="Close"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Stepper ───────────────────────────────────────── */}
                <Stepper currentStep={step} />

                {/* ── Form body ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 pb-2" style={{ scrollbarWidth: 'none' }}>

                    {/* Step 1 — Credentials */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <InputField label="Full Name" value={newUser.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} required />
                            <InputField label="Email" type="email" value={newUser.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} required />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Password" type="password" value={newUser.password} onChange={e => handleChange('password', e.target.value)} error={errors.password} required />
                                <InputField label="Confirm Password" type="password" value={newUser.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} error={errors.confirmPassword} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField label="User Role" value={newUser.role} onChange={e => handleChange('role', e.target.value)}>
                                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </SelectField>
                                <SelectField label="Access Level" value={newUser.accessLevel} onChange={e => handleChange('accessLevel', e.target.value)} disabled={isRoleAdmin}>
                                    {Object.values(UserAccessLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                </SelectField>
                            </div>
                            {isRoleAdmin && (
                                <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: `${ACCENT}10`, color: `${ACCENT}cc`, border: `1px solid ${ACCENT}25` }}>
                                    Admins are automatically granted Approved Girl access.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 2 — Profile */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Photo upload */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Profile Photo</p>
                                {newUser.profilePhoto ? (
                                    <div className="relative w-24 h-24 mx-auto">
                                        <img src={newUser.profilePhoto} alt="Preview" className="w-full h-full object-cover rounded-2xl" style={{ border: `2px solid ${ACCENT}50` }} />
                                        <button
                                            type="button"
                                            onClick={() => handleChange('profilePhoto', '')}
                                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                                            style={{ background: '#ef4444', border: '2px solid #0F0F14' }}
                                        >
                                            <TrashIcon className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="cursor-pointer rounded-2xl p-6 flex flex-col items-center gap-2 transition-all hover:opacity-80"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: `2px dashed rgba(255,255,255,0.1)` }}
                                    >
                                        <CloudArrowUpIcon className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.25)' } as any} />
                                        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Upload Photo</span>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>About / Bio</label>
                                <textarea
                                    value={newUser.bio}
                                    onChange={e => handleChange('bio', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl text-sm text-white outline-none resize-none transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px' }}
                                    onFocus={e => { e.currentTarget.style.border = `1px solid ${ACCENT}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}18`; }}
                                    onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="City" value={newUser.city} onChange={e => handleChange('city', e.target.value)} />
                                <InputField label="Phone (Optional)" value={newUser.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} type="tel" />
                            </div>
                            <InputField label="Instagram Handle (Optional)" value={newUser.instagramHandle} onChange={e => handleChange('instagramHandle', e.target.value)} error={errors.instagramHandle} prefix="@" />
                        </div>
                    )}

                    {/* Step 3 — Details */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Date of Birth (Optional)" value={newUser.dob} onChange={e => handleChange('dob', e.target.value)} type="date" error={errors.dob} />
                                <SelectField label="Ethnicity (Optional)" value={newUser.ethnicity} onChange={e => handleChange('ethnicity', e.target.value)}>
                                    <option value="">Select...</option>
                                    {['Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Other', 'Prefer not to say'].map(e => <option key={e} value={e}>{e}</option>)}
                                </SelectField>
                            </div>

                            {/* Appearance */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Appearance</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Height" value={newUser.appearance.height} onChange={e => handleAppearanceChange('height', e.target.value)} placeholder="e.g. 5'11&quot;" />
                                    <InputField label="Build" value={newUser.appearance.build} onChange={e => handleAppearanceChange('build', e.target.value)} placeholder="e.g. Athletic" />
                                    <InputField label="Eye Color" value={newUser.appearance.eyeColor} onChange={e => handleAppearanceChange('eyeColor', e.target.value)} placeholder="e.g. Brown" />
                                    <InputField label="Hair Color" value={newUser.appearance.hairColor} onChange={e => handleAppearanceChange('hairColor', e.target.value)} placeholder="e.g. Black" />
                                </div>
                            </div>

                            {/* Summary preview */}
                            <div
                                className="rounded-2xl p-4 space-y-1"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Summary</p>
                                <p className="text-sm font-bold text-white">{newUser.name || '—'}</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{newUser.email}</p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                                        {newUser.role}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                                        {newUser.accessLevel}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                                        {newUser.city}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────── */}
                <div
                    className="flex justify-between items-center gap-3 px-6 py-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <button
                        onClick={handleBack}
                        disabled={isSaving || step === 1}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-30"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Step dots */}
                        <div className="flex gap-1.5 mr-2">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-full transition-all"
                                    style={{
                                        width: step === i + 1 ? 16 : 6,
                                        height: 6,
                                        background: step === i + 1 ? ACCENT : step > i + 1 ? `${ACCENT}60` : 'rgba(255,255,255,0.1)',
                                    }}
                                />
                            ))}
                        </div>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                                style={{
                                    background: `linear-gradient(135deg, ${ACCENT}, #7B61FF)`,
                                    boxShadow: `0 4px 20px ${ACCENT}40`,
                                }}
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
                                    minWidth: 130,
                                    justifyContent: 'center',
                                }}
                            >
                                {isSaving ? <Spinner className="w-4 h-4" /> : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                        Create User
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
