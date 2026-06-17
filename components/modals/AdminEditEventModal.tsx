
import React, { useState, useEffect, useRef } from 'react';
import { Event, Venue, UserAccessLevel, Wingman } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface AdminEditEventModalProps {
  event: Event | null;
  venues: Venue[];
  wingmen?: Wingman[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
}

// ── Brand token ───────────────────────────────────────────────────────────────
const ACCENT = '#E040FB';

// ── Shared field components ───────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
    {children}{required && <span style={{ color: ACCENT }}> *</span>}
  </label>
);

const baseInput = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#fff',
  padding: '11px 14px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  transition: 'all 0.2s',
} as React.CSSProperties;

const focusStyle = (el: HTMLElement) => {
  el.style.border = `1px solid ${ACCENT}80`;
  el.style.boxShadow = `0 0 0 3px ${ACCENT}15`;
};
const blurStyle = (el: HTMLElement) => {
  el.style.border = '1px solid rgba(255,255,255,0.08)';
  el.style.boxShadow = 'none';
};

const InputField: React.FC<{
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string; min?: string;
}> = ({ label, required, ...props }) => (
  <div>
    <Label required={required}>{label}</Label>
    <input
      {...props}
      style={baseInput}
      className="appearance-none"
      onFocus={e => focusStyle(e.currentTarget)}
      onBlur={e => blurStyle(e.currentTarget)}
    />
  </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ label, ...props }) => (
  <div>
    <Label>{label}</Label>
    <textarea
      rows={3}
      {...props}
      className="resize-none"
      style={{ ...baseInput, lineHeight: 1.6 }}
      onFocus={e => focusStyle(e.currentTarget)}
      onBlur={e => blurStyle(e.currentTarget)}
    />
  </div>
);

const SelectField: React.FC<{
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { label: string; value: any })[];
  required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div>
    <Label required={required}>{label}</Label>
    <select
      value={value}
      onChange={onChange}
      className="appearance-none"
      style={baseInput}
      onFocus={e => focusStyle(e.currentTarget)}
      onBlur={e => blurStyle(e.currentTarget)}
    >
      <option value="" disabled>— Select —</option>
      {options.map(opt =>
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  </div>
);

// ── Upload zone ───────────────────────────────────────────────────────────────
const UploadZone: React.FC<{
  label: string; accept: string; required?: boolean;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode; hint: string;
  inputId: string;
}> = ({ label, accept, required, onFile, hint, inputId }) => (
  <label
    htmlFor={inputId}
    className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl py-6 transition-all hover:opacity-80"
    style={{ background: 'rgba(255,255,255,0.03)', border: `2px dashed rgba(255,255,255,0.09)` }}
  >
    <svg className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
    <span className="text-sm font-semibold" style={{ color: ACCENT }}>{label}</span>
    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{hint}</span>
    {required && <span className="text-[10px]" style={{ color: ACCENT }}>Required</span>}
    <input id={inputId} type="file" className="sr-only" onChange={onFile} accept={accept} />
  </label>
);

// ── Section divider ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{title}</p>
    {children}
  </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────
export const AdminEditEventModal: React.FC<AdminEditEventModalProps> = ({ event, venues, wingmen = [], isOpen, onClose, onSave }) => {
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>(event || {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
    setEditedEvent(event ? {
      ...event,
      accessLevels: event.accessLevels || Object.values(UserAccessLevel),
    } : {
      type: 'EXCLUSIVE',
      priceFemale: 0,
      priceMale: 100,
      accessLevels: Object.values(UserAccessLevel),
    });
  }, [event, isOpen]);

  const handleSave = () => {
    if (!editedEvent.title || !editedEvent.date || !editedEvent.venueId || !editedEvent.image) {
      (window as any).showAppToast?.('Please fill out all required fields, including an image.');
      return;
    }
    if (editedEvent.recurrence && (!editedEvent.recurrence.frequency || !editedEvent.recurrence.endDate)) {
      (window as any).showAppToast?.('Please provide frequency and end date for recurring events.');
      return;
    }
    if ((editedEvent.priceFemale ?? 0) < 0 || (editedEvent.priceMale ?? 0) < 0 || (editedEvent.priceGeneral ?? 0) < 0) {
      (window as any).showAppToast?.('Prices cannot be negative.');
      return;
    }
    if ((editedEvent.capacity ?? 0) < 0) {
      (window as any).showAppToast?.('Capacity cannot be negative.');
      return;
    }
    onSave(editedEvent as Event);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handleChange = (field: keyof Event, value: any) =>
    setEditedEvent(prev => ({ ...prev, [field]: value }));

  const handleAccessLevelToggle = (level: UserAccessLevel) => {
    setEditedEvent(prev => {
      const current = prev.accessLevels || [];
      return { ...prev, accessLevels: current.includes(level) ? current.filter(l => l !== level) : [...current, level] };
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange('image', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (editedEvent.videoUrl?.startsWith('blob:')) URL.revokeObjectURL(editedEvent.videoUrl);
      handleChange('videoUrl', URL.createObjectURL(file));
    }
  };

  const handleRecurrenceChange = (isRecurring: boolean) => {
    setEditedEvent(prev => {
      const e = { ...prev };
      if (isRecurring) { if (!e.recurrence) e.recurrence = { frequency: 'weekly', endDate: '' }; }
      else { delete e.recurrence; }
      return e;
    });
  };

  const handleRecurrenceDetailChange = (field: 'frequency' | 'endDate', value: any) => {
    setEditedEvent(prev => ({ ...prev, recurrence: { ...prev.recurrence!, [field]: value } }));
  };

  if (!isOpen) return null;

  const isNew = !event;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full m-4 flex flex-col"
        style={{
          maxWidth: 560,
          maxHeight: '92vh',
          background: '#0F0F14',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 22,
          boxShadow: `0 0 100px rgba(0,0,0,0.9), 0 0 40px ${ACCENT}15`,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: ACCENT }}>
              {isNew ? 'New Event' : 'Edit Event'}
            </p>
            <h2 className="text-xl font-black text-white leading-tight">
              {editedEvent.title || (isNew ? 'Create Event' : 'Edit Event')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: 'none' }}>

          {/* Basic info */}
          <Section title="Basic Info">
            <InputField label="Event Title" value={editedEvent.title || ''} onChange={e => handleChange('title', e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Venue" value={String(editedEvent.venueId || '')} onChange={e => handleChange('venueId', parseInt(e.target.value, 10))} options={venues.map(v => ({ label: v.name, value: v.id }))} required />
              <SelectField label="Event Type" value={editedEvent.type || 'EXCLUSIVE'} onChange={e => handleChange('type', e.target.value as 'EXCLUSIVE' | 'INVITE ONLY')} options={['EXCLUSIVE', 'INVITE ONLY']} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Start Date" type="date" value={editedEvent.date || ''} onChange={e => handleChange('date', e.target.value)} required />
              <SelectField label="Host Wingman" value={String(editedEvent.wingmanId || '')} onChange={e => {
                const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                handleChange('wingmanId', val);
                handleChange('hostId', val);
              }} options={wingmen.map(w => ({ label: w.name, value: w.id }))} />
            </div>
            <TextAreaField label="Description" value={editedEvent.description || ''} onChange={e => handleChange('description', e.target.value)} />
          </Section>

          {/* Access levels */}
          <Section title="Permitted Access Levels">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(UserAccessLevel).map(level => {
                const checked = editedEvent.accessLevels?.includes(level) ?? true;
                return (
                  <label
                    key={level}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all"
                    style={{
                      background: checked ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${checked ? `${ACCENT}35` : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: checked ? ACCENT : 'rgba(255,255,255,0.08)', border: `1px solid ${checked ? ACCENT : 'rgba(255,255,255,0.15)'}` }}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={checked} onChange={() => handleAccessLevelToggle(level)} className="sr-only" />
                    <span className="text-xs font-semibold truncate" style={{ color: checked ? '#fff' : 'rgba(255,255,255,0.4)' }}>{level}</span>
                  </label>
                );
              })}
            </div>
          </Section>

          {/* Media */}
          <Section title="Media">
            {/* Image */}
            <div>
              <Label required>Event Image</Label>
              {editedEvent.image ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={editedEvent.image} alt="Event" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleChange('image', '')}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <UploadZone label="Click to upload image" accept="image/png,image/jpeg" required onFile={handleImageFileChange} hint="PNG or JPG recommended" inputId="event-image-upload" />
              )}
            </div>

            {/* Video */}
            <div>
              <Label>Event Video <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', fontSize: 11, letterSpacing: 'normal' }}>(Optional)</span></Label>
              {editedEvent.videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <video src={editedEvent.videoUrl} controls className="w-full h-44 bg-black" />
                  <button
                    type="button"
                    onClick={() => handleChange('videoUrl', '')}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <UploadZone label="Click to upload video" accept="video/*" onFile={handleVideoFileChange} hint="MP4, MOV, etc." inputId="event-video-upload" />
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Female Price ($)" type="number" min="0" value={String(editedEvent.priceFemale ?? 0)} onChange={e => handleChange('priceFemale', parseFloat(e.target.value))} />
              <InputField label="Male Price ($)" type="number" min="0" value={String(editedEvent.priceMale ?? 0)} onChange={e => handleChange('priceMale', parseFloat(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="General Price ($)" type="number" min="0" value={String(editedEvent.priceGeneral ?? '')} onChange={e => handleChange('priceGeneral', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="Optional" />
              <InputField label="Capacity" type="number" min="0" value={String(editedEvent.capacity ?? '')} onChange={e => handleChange('capacity', e.target.value ? parseInt(e.target.value, 10) : undefined)} placeholder="Optional" />
            </div>
          </Section>

          {/* Recurrence */}
          <Section title="Schedule">
            <label
              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
              style={{
                background: editedEvent.recurrence ? `${ACCENT}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${editedEvent.recurrence ? `${ACCENT}30` : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: editedEvent.recurrence ? ACCENT : 'rgba(255,255,255,0.08)', border: `1px solid ${editedEvent.recurrence ? ACCENT : 'rgba(255,255,255,0.15)'}` }}
              >
                {editedEvent.recurrence && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={!!editedEvent.recurrence} onChange={e => handleRecurrenceChange(e.target.checked)} className="sr-only" />
              <div>
                <p className="text-sm font-bold text-white">Recurring event</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Repeat this event on a schedule</p>
              </div>
            </label>

            {editedEvent.recurrence && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <SelectField label="Frequency" value={editedEvent.recurrence.frequency} onChange={e => handleRecurrenceDetailChange('frequency', e.target.value)} options={['daily', 'weekly', 'monthly']} required />
                <InputField label="End Date" type="date" value={editedEvent.recurrence.endDate} onChange={e => handleRecurrenceDetailChange('endDate', e.target.value)} required />
              </div>
            )}
          </Section>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{
              background: saved
                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                : `linear-gradient(135deg, ${ACCENT}, #7B61FF)`,
              boxShadow: saved ? '0 4px 20px rgba(34,197,94,0.35)' : `0 4px 20px ${ACCENT}35`,
              minWidth: 140,
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 3v4H7V3" /></svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
