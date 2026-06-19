import React, { useState, useEffect } from 'react';
import { Venue, TableOption } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface AdminEditVenueModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (venue: Venue) => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES: Venue['category'][] = ['Nightclub', 'Restaurant', 'Lounge', 'Beach Club', 'Pool Party', 'Yacht'];

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT = '#E040FB';

// ── Shared field primitives ───────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
    {children}{required && <span style={{ color: ACCENT }}> *</span>}
  </label>
);

const baseInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#fff',
  padding: '11px 14px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  transition: 'all 0.2s',
};

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
  type?: string; required?: boolean; placeholder?: string;
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

const SelectField: React.FC<{
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[]; required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div>
    <Label required={required}>{label}</Label>
    <select
      value={value}
      onChange={onChange}
      className="appearance-none"
      style={{ ...baseInput, cursor: 'pointer' }}
      onFocus={e => focusStyle(e.currentTarget)}
      onBlur={e => blurStyle(e.currentTarget)}
    >
      {options.map(opt => <option key={opt} value={opt} style={{ background: '#1a1a24' }}>{opt}</option>)}
    </select>
  </div>
);

const TextAreaField: React.FC<{
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number; placeholder?: string;
}> = ({ label, rows = 3, ...props }) => (
  <div>
    <Label>{label}</Label>
    <textarea
      rows={rows}
      {...props}
      className="resize-none w-full"
      style={{ ...baseInput, lineHeight: 1.6 }}
      onFocus={e => focusStyle(e.currentTarget)}
      onBlur={e => blurStyle(e.currentTarget)}
    />
  </div>
);

// ── Upload zone ───────────────────────────────────────────────────────────────
const UploadZone: React.FC<{
  label: string; accept: string; hint: string; inputId: string;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, accept, hint, inputId, onFile }) => (
  <label
    htmlFor={inputId}
    className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl py-7 transition-all hover:opacity-80"
    style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.09)' }}
  >
    <svg className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
    <span className="text-sm font-semibold" style={{ color: ACCENT }}>{label}</span>
    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{hint}</span>
    <input id={inputId} type="file" className="sr-only" onChange={onFile} accept={accept} />
  </label>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{title}</p>
    {children}
  </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────
export const AdminEditVenueModal: React.FC<AdminEditVenueModalProps> = ({ venue, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Venue['category']>('Nightclub');
  const [location, setLocation] = useState('');
  const [musicType, setMusicType] = useState('');
  const [vibe, setVibe] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoTourUrl, setVideoTourUrl] = useState('');
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<number | ''>('');
  const [amenities, setAmenities] = useState('');
  const [isGuestlistAvailable, setIsGuestlistAvailable] = useState(false);
  const [guestlistCapacity, setGuestlistCapacity] = useState<number | ''>('');
  const [tableOptions, setTableOptions] = useState<TableOption[]>([]);
  const [saved, setSaved] = useState(false);
  const [yachtPrice4Hours, setYachtPrice4Hours] = useState<number | ''>('');

  useEffect(() => {
    setSaved(false);
    setName(venue?.name || '');
    setCategory(venue?.category || 'Nightclub');
    setLocation(venue?.location || '');
    setMusicType(venue?.musicType || '');
    setVibe(venue?.vibe || '');
    setCoverImage(venue?.coverImage || '');
    setVideoTourUrl(venue?.videoTourUrl || '');
    setOperatingDays(venue?.operatingDays || []);
    setCapacity(venue?.capacity || '');
    setAmenities(venue?.amenities?.join(', ') || '');
    setIsGuestlistAvailable(venue?.isGuestlistAvailable || false);
    setGuestlistCapacity(venue?.guestlistCapacity || '');
    setTableOptions(venue?.tableOptions ? JSON.parse(JSON.stringify(venue.tableOptions)) : []);
    setYachtPrice4Hours(venue?.yachtPrice4Hours ?? '');
  }, [venue, isOpen]);

  const handleDayToggle = (day: string) => {
    setOperatingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoTourUrl.startsWith('blob:')) URL.revokeObjectURL(videoTourUrl);
      setVideoTourUrl(URL.createObjectURL(file));
    }
  };

  const handleTableChange = (index: number, field: keyof TableOption, value: any) => {
    const newOptions = [...tableOptions];
    const updatedTable = { ...newOptions[index] };
    if (field === 'minSpend' || field === 'totalAvailable') {
      (updatedTable as any)[field] = value === '' ? undefined : parseInt(value, 10);
    } else {
      (updatedTable as any)[field] = value;
    }
    newOptions[index] = updatedTable;
    setTableOptions(newOptions);
  };

  const handleAddTable = () => {
    setTableOptions([...tableOptions, {
      id: `new-table-${Date.now()}`,
      name: '', area: '', minSpend: 0, description: '', capacityHint: 'Small Groups',
    }]);
  };

  const handleRemoveTable = (index: number) => {
    setTableOptions(tableOptions.filter((_, i) => i !== index));
  };

  const handleSaveChanges = () => {
    if (!name || !location) {
      (window as any).showAppToast?.('Please fill out Name and Location.');
      return;
    }
    const venueData: Venue = {
      id: venue?.id || 0,
      name, category, location, musicType, vibe, coverImage,
      videoTourUrl: videoTourUrl || undefined,
      operatingDays,
      capacity: Number(capacity) || undefined,
      amenities: amenities.split(',').map(a => a.trim()).filter(Boolean),
      tableOptions,
      isGuestlistAvailable,
      guestlistCapacity: Number(guestlistCapacity) || undefined,
      yachtPrice4Hours: category === 'Yacht' ? (Number(yachtPrice4Hours) || undefined) : undefined,
    };
    onSave(venueData);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  if (!isOpen) return null;

  const isNew = !venue;

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
          maxWidth: 600,
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
              {isNew ? 'New Venue' : 'Edit Venue'}
            </p>
            <h2 className="text-xl font-black text-white leading-tight">
              {name || (isNew ? 'Add New Venue' : venue?.name)}
            </h2>
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

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: 'none' }}>

          {/* Basic Info */}
          <Section title="Basic Info">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Venue Name" value={name} onChange={e => setName(e.target.value)} required />
              <SelectField label="Category" value={category} onChange={e => setCategory(e.target.value as Venue['category'])} options={CATEGORIES} />
            </div>
            <InputField label="Location" value={location} onChange={e => setLocation(e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Music Type" value={musicType} onChange={e => setMusicType(e.target.value)} placeholder="e.g. Hip-Hop, EDM" />
              <InputField label="Vibe" value={vibe} onChange={e => setVibe(e.target.value)} placeholder="e.g. Upscale, Chill" />
            </div>
            <InputField label="Capacity" type="number" value={String(capacity)} onChange={e => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder="Max guest count" />
            <TextAreaField label="Amenities (comma-separated)" value={amenities} onChange={e => setAmenities(e.target.value)} rows={2} placeholder="e.g. VIP Tables, Bottle Service, Valet" />
          </Section>

          {/* Yacht Pricing — shown only when Yacht category is selected */}
          {category === 'Yacht' && (
            <Section title="⚓ Yacht Pricing">
              <div
                className="rounded-2xl p-4 space-y-4"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚓</span>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#00D4FF' }}>
                    Charter Pricing
                  </p>
                </div>
                <div>
                  <Label>Full Charter Price (4 Hours)</Label>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black"
                      style={{ color: '#00D4FF' }}
                    >$</span>
                    <input
                      type="number"
                      value={String(yachtPrice4Hours)}
                      onChange={e => setYachtPrice4Hours(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="appearance-none w-full"
                      style={{ ...baseInput, paddingLeft: 28 }}
                      onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Full yacht charter · 4-hr block · $600 deposit at checkout</p>
                </div>
                {yachtPrice4Hours !== '' && (
                  <div
                    className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)' }}
                  >
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Pricing preview</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-white">${Number(yachtPrice4Hours).toLocaleString()}<span className="text-[10px] font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}> full · </span><span style={{ color: '#00D4FF' }}>$600 deposit</span></p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Operating Days */}
          <Section title="Operating Days">
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => {
                const active = operatingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide transition-all duration-200"
                    style={active
                      ? { background: `linear-gradient(135deg, ${ACCENT}, #7B61FF)`, color: '#fff', boxShadow: `0 0 12px ${ACCENT}40` }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Media */}
          <Section title="Media">
            <div>
              <Label>Cover Image</Label>
              {coverImage ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={coverImage} alt="Cover preview" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                    aria-label="Remove image"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <UploadZone label="Click to upload image" hint="PNG or JPG" inputId="venue-image-upload" accept="image/png, image/jpeg" onFile={handleImageFileChange} />
              )}
            </div>

            <div>
              <Label>Video Tour</Label>
              {videoTourUrl ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <video src={videoTourUrl} controls className="w-full h-44 bg-black rounded-2xl" />
                  <button
                    type="button"
                    onClick={() => setVideoTourUrl('')}
                    className="absolute top-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
                    aria-label="Remove video"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <UploadZone label="Click to upload video" hint="MP4, MOV, etc." inputId="venue-video-upload" accept="video/*" onFile={handleVideoFileChange} />
              )}
            </div>
          </Section>

          {/* Guestlist */}
          <Section title="Guestlist">
            <button
              type="button"
              onClick={() => setIsGuestlistAvailable(v => !v)}
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all"
              style={{
                background: isGuestlistAvailable ? `${ACCENT}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isGuestlistAvailable ? `${ACCENT}40` : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{isGuestlistAvailable ? '🎟' : '🚫'}</span>
                <div className="text-left">
                  <p className="text-sm font-black text-white">Enable Guestlist</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {isGuestlistAvailable ? 'Guestlist is active for this venue' : 'Guestlist is disabled'}
                  </p>
                </div>
              </div>
              <div
                className="w-10 h-6 rounded-full transition-all flex items-center px-0.5"
                style={{ background: isGuestlistAvailable ? ACCENT : 'rgba(255,255,255,0.12)' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-all duration-200"
                  style={{ transform: isGuestlistAvailable ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </div>
            </button>

            {isGuestlistAvailable && (
              <div className="animate-fade-in">
                <InputField
                  label="Guestlist Spots Available"
                  type="number"
                  value={String(guestlistCapacity)}
                  onChange={e => setGuestlistCapacity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 100"
                />
              </div>
            )}
          </Section>

          {/* Table Options */}
          <Section title="Table Options">
            <div className="space-y-3">
              {tableOptions.map((table, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-4 space-y-3 relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Table {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveTable(index)}
                      className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-110"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                      aria-label="Remove table"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Table Name" value={table.name} onChange={e => handleTableChange(index, 'name', e.target.value)} />
                    <InputField label="Area" value={table.area} onChange={e => handleTableChange(index, 'area', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Min Spend ($)" type="number" value={String(table.minSpend)} onChange={e => handleTableChange(index, 'minSpend', e.target.value)} />
                    <SelectField label="Capacity Hint" value={table.capacityHint} onChange={e => handleTableChange(index, 'capacityHint', e.target.value)} options={['Small Groups', 'Large Groups']} />
                  </div>
                  <InputField label="Total Available" type="number" value={String(table.totalAvailable ?? '')} onChange={e => handleTableChange(index, 'totalAvailable', e.target.value)} placeholder="Optional" />
                  <TextAreaField label="Description" value={table.description} onChange={e => handleTableChange(index, 'description', e.target.value)} rows={2} />
                  <div>
                    <Label>Notes (Optional)</Label>
                    <input
                      type="text"
                      value={table.notes || ''}
                      onChange={e => handleTableChange(index, 'notes', e.target.value)}
                      style={baseInput}
                      className="appearance-none"
                      onFocus={e => focusStyle(e.currentTarget)}
                      onBlur={e => blurStyle(e.currentTarget)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddTable}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black uppercase tracking-wide transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}
            >
              <PlusIcon className="w-4 h-4" />
              Add Table Option
            </button>
          </Section>

        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: saved
                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                : `linear-gradient(135deg, ${ACCENT}, #7B61FF)`,
              color: '#fff',
              boxShadow: saved ? '0 0 20px #22c55e40' : `0 0 20px ${ACCENT}30`,
            }}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
