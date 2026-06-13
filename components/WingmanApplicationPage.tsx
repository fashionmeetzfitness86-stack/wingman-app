import React, { useState } from 'react';
import { WingmanApplication } from '../types';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Spinner } from './icons/Spinner';

interface WingmanApplicationPageProps {
  onApply: (application: Omit<WingmanApplication, 'id' | 'status' | 'submissionDate' | 'userId'>) => void;
  onCancel: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Sub-components styled to match EditProfilePage ───────────────────────────

const TagPill: React.FC<{ label: string; active: boolean; onClick: () => void; accent?: string }> = ({
  label, active, onClick, accent = '#6366f1',
}) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 border"
    style={active
      ? { background: `${accent}20`, color: accent, borderColor: `${accent}50` }
      : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', borderColor: 'rgba(255,255,255,0.08)' }}
  >
    {label}
  </button>
);

const PillSelectionGroup: React.FC<{
  label: string;
  options: string[];
  selected: string | string[];
  onChange: (val: string) => void;
  required?: boolean;
  accent?: string;
}> = ({ label, options, selected, onChange, required, accent = '#6366f1' }) => {
  const isMulti = Array.isArray(selected);
  const isSelected = (o: string) => isMulti ? (selected as string[]).includes(o) : selected === o;
  
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
        {label} {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {options.map(o => (
          <TagPill
            key={o}
            label={o}
            active={isSelected(o)}
            onClick={() => onChange(o)}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
};

const SectionCard: React.FC<{ title: string; accent?: string; children: React.ReactNode }> = ({
  title, accent = '#6366f1', children,
}) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  }}>
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
      <h2 className="text-base font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const Input: React.FC<{
  label: string;
  id: string;
  name: string;
  type: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  prefix?: string;
  readOnly?: boolean;
  error?: string;
}> = ({ label, id, prefix, error, ...props }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: '12px 14px',
    paddingLeft: prefix ? 32 : 14,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
        {label} {props.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 text-sm font-semibold pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={id}
          style={inputStyle}
          className="focus:border-amber-400/80 transition-all placeholder-gray-700"
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

const Textarea: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
}> = ({ label, id, error, ...props }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
        {label} {props.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        rows={4}
        style={{ ...inputStyle, resize: 'none' }}
        className="focus:border-amber-400/80 transition-all placeholder-gray-700"
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

// ── Main Page Component ──────────────────────────────────────────────────────

export const WingmanApplicationPage: React.FC<WingmanApplicationPageProps> = ({ onApply, onCancel, showToast }) => {
  const [formData, setFormData] = useState({
    fullName: '', stageName: '', email: '', phone: '', instagram: '', city: 'Miami', dob: '',
    experienceYears: '', categories: [] as string[], venuesList: '', avgWeeklyGuests: '',
    worksWithOtherGroups: '', otherGroupsNames: '', targetClientele: '', instagramFollowers: '',
    otherSocials: '', postsEvents: '', mediaLinks: [''], daysAvailable: [] as string[],
    preferredVenuesText: '', wantsToPromoteAccess: '', agreesToTools: '', signature: '',
    dateSigned: new Date().toISOString().split('T')[0],
  });
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (groupKey: 'categories' | 'daysAvailable', value: string) => {
    setFormData(prev => {
      const currentGroup = prev[groupKey];
      const newGroup = currentGroup.includes(value)
        ? currentGroup.filter(item => item !== value)
        : [...currentGroup, value];
      return { ...prev, [groupKey]: newGroup };
    });
  };
  
  const handleMediaLinksChange = (index: number, value: string) => {
    const newLinks = [...formData.mediaLinks];
    newLinks[index] = value;
    setFormData(prev => ({...prev, mediaLinks: newLinks}));
  };
  
  const addMediaLink = () => {
    if(formData.mediaLinks.length < 2) {
      setFormData(prev => ({...prev, mediaLinks: [...prev.mediaLinks, '']}));
    }
  };

  const removeMediaLink = (index: number) => {
    setFormData(prev => ({...prev, mediaLinks: prev.mediaLinks.filter((_, i) => i !== index)}));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`, 'error');
      e.target.value = '';
      return;
    }

    setIsVerifyingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIsVerifyingPhoto(false);
      setProfilePhoto(reader.result as string);
    };
    reader.onerror = () => {
      setIsVerifyingPhoto(false);
      showToast('Failed to read the selected file. Please try another.', 'error');
      e.target.value = '';
    };
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      setIsVerifyingPhoto(false);
      showToast('Error processing file.', 'error');
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePhoto) {
      showToast('Please upload a profile photo.', 'error');
      return;
    }
    const applicationData: Omit<WingmanApplication, 'id' | 'status' | 'submissionDate' | 'userId'> = {
      fullName: formData.fullName,
      stageName: formData.stageName,
      email: formData.email,
      phone: formData.phone,
      instagram: formData.instagram,
      city: formData.city,
      dob: formData.dob,
      profilePhotoUrl: profilePhoto,
      experienceYears: formData.experienceYears,
      categories: formData.categories,
      venuesList: formData.venuesList,
      avgWeeklyGuests: formData.avgWeeklyGuests,
      worksWithOtherGroups: formData.worksWithOtherGroups,
      otherGroupsNames: formData.otherGroupsNames,
      targetClientele: formData.targetClientele,
      instagramFollowers: formData.instagramFollowers,
      otherSocials: formData.otherSocials,
      postsEvents: formData.postsEvents,
      mediaLinks: formData.mediaLinks.filter(link => link.trim() !== ''),
      daysAvailable: formData.daysAvailable,
      preferredVenuesText: formData.preferredVenuesText,
      wantsToPromoteAccess: formData.wantsToPromoteAccess,
      agreesToTools: formData.agreesToTools,
      signature: formData.signature,
      dateSigned: formData.dateSigned,
    };
    onApply(applicationData);
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
      <div className="text-center mb-8">
        <p className="text-[10px] font-black tracking-[0.35em] text-[#E040FB] uppercase mb-3">
          WINGMAN · APPLICATION
        </p>
        <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Become a Wingman
        </h1>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Join our elite team of wingmen. Fill out the application below.
        </p>
        <div className="w-16 h-px mx-auto mt-6 bg-gradient-to-r from-transparent via-[#E040FB]/40 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        
        <SectionCard title="Personal Information" accent="#6366f1">
          <Input label="Full Name" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} required placeholder="First Last" />
          <Input label="Wingman / Host Name" id="stageName" name="stageName" type="text" value={formData.stageName} onChange={handleInputChange} placeholder="Alias or wingman name (if applicable)" />
          <Input label="Email Address" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" />
          <Input label="Phone Number" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+1 (305) 555-0123" />
          <Input label="Instagram Handle" id="instagram" name="instagram" type="text" value={formData.instagram} onChange={handleInputChange} required prefix="@" placeholder="yourhandle" />
          <Input label="City of Operation" id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} required />
          <Input label="Date of Birth" id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Profile Photo Upload <span className="text-red-400 ml-0.5">*</span>
            </label>
            
            {profilePhoto ? (
              <div className="relative w-28 h-28 mx-auto group">
                <img src={profilePhoto} alt="Profile preview" className="w-full h-full object-cover rounded-full border-2 border-amber-400 shadow-lg" />
                <button
                  type="button"
                  onClick={() => setProfilePhoto('')}
                  className="absolute -top-1 -right-1 bg-red-600/90 text-white p-1.5 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-md"
                  aria-label="Remove photo"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="profile_photo" className={`cursor-pointer bg-white/[0.02] border border-dashed border-white/[0.12] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-amber-400/80 hover:bg-white/[0.04] transition-all ${isVerifyingPhoto ? 'opacity-70 cursor-wait' : ''}`}>
                  {isVerifyingPhoto ? (
                    <>
                      <Spinner className="w-8 h-8 text-amber-400 mb-2 animate-spin" />
                      <span className="text-sm text-gray-400">Processing image...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
                        <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-white">Click to upload photo</span>
                      <span className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">PNG or JPG up to 10MB (professional or nightlife-appropriate)</span>
                    </>
                  )}
                </label>
                <input id="profile_photo" name="profile_photo" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/jpeg, image/png" required disabled={isVerifyingPhoto} />
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Experience & Network" accent="#f43f5e">
          <PillSelectionGroup
            label="How long have you been promoting or hosting guests?"
            options={['Less than 1 year', '1–3 years', '3–5 years', '5+ years']}
            selected={formData.experienceYears}
            onChange={(val) => setFormData(prev => ({ ...prev, experienceYears: val }))}
            required
            accent="#f43f5e"
          />
          <PillSelectionGroup
            label="Which types of venues or categories do you currently work with?"
            options={['Nightclubs', 'Restaurants', 'Pool Parties', 'Yachts / Private Events', 'Hotel Rooms / Apartments', 'Private Jets']}
            selected={formData.categories}
            onChange={(val) => handleCheckboxChange('categories', val)}
            required
            accent="#10b981"
          />
          <Textarea label="List 2–3 venues or properties you’ve collaborated with" id="venuesList" name="venuesList" value={formData.venuesList} onChange={handleInputChange} required placeholder="e.g., LIV, Papi Steak, Hyde Beach, etc." />
          <PillSelectionGroup
            label="Average number of guests you bring per week"
            options={['1–10', '10–30', '30–60', '60+']}
            selected={formData.avgWeeklyGuests}
            onChange={(val) => setFormData(prev => ({ ...prev, avgWeeklyGuests: val }))}
            required
            accent="#3b82f6"
          />
          <PillSelectionGroup
            label="Do you currently work with any other wingman groups, agencies, or concierges?"
            options={['Yes', 'No']}
            selected={formData.worksWithOtherGroups}
            onChange={(val) => setFormData(prev => ({ ...prev, worksWithOtherGroups: val }))}
            required
            accent="#a78bfa"
          />
          {formData.worksWithOtherGroups === 'Yes' && (
            <Input label="If yes, please name them" id="otherGroupsNames" name="otherGroupsNames" type="text" value={formData.otherGroupsNames} onChange={handleInputChange} />
          )}
          <Textarea label="Describe your target clientele" id="targetClientele" name="targetClientele" value={formData.targetClientele} onChange={handleInputChange} required placeholder="e.g., travelers, influencers, high spenders, models, etc." />
        </SectionCard>
        
        <SectionCard title="Social Media & Marketing" accent="#ec4899">
          <Input label="Instagram Follower Count" id="instagramFollowers" name="instagramFollowers" type="number" value={formData.instagramFollowers} onChange={handleInputChange} required placeholder="e.g., 12000" />
          <Input label="TikTok / Other Platforms (optional)" id="otherSocials" name="otherSocials" type="text" value={formData.otherSocials} onChange={handleInputChange} />
          <PillSelectionGroup
            label="Do you actively post your events or host experiences on social media?"
            options={['Yes', 'No']}
            selected={formData.postsEvents}
            onChange={(val) => setFormData(prev => ({ ...prev, postsEvents: val }))}
            required
            accent="#ec4899"
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Attach or link 1–2 recent posts, stories, or reels
            </label>
            <div className="space-y-3">
              {formData.mediaLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleMediaLinksChange(index, e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    className="focus:border-amber-400/80 transition-all placeholder-gray-700"
                  />
                  {formData.mediaLinks.length > 1 && (
                    <button type="button" onClick={() => removeMediaLink(index)} className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all flex-shrink-0" aria-label="Remove link">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {formData.mediaLinks.length < 2 && (
                <button type="button" onClick={addMediaLink} className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 hover:text-amber-300 transition-colors pt-1">
                  <PlusIcon className="w-4 h-4" /> Add Link
                </button>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Availability & Focus" accent="#3b82f6">
          <PillSelectionGroup
            label="Preferred Days to Promote / Host"
            options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
            selected={formData.daysAvailable}
            onChange={(val) => handleCheckboxChange('daysAvailable', val)}
            required
            accent="#3b82f6"
          />
          <Textarea label="Preferred Venues / Categories to Work With" id="preferredVenuesText" name="preferredVenuesText" value={formData.preferredVenuesText} onChange={handleInputChange} placeholder="e.g., luxury nightclubs, fine dining, pool lounges, yachts, etc." />
          <PillSelectionGroup
            label="Are you open to promoting TheMainKeys Access experiences (invite-only events, private bookings, etc.)?"
            options={['Yes', 'No']}
            selected={formData.wantsToPromoteAccess}
            onChange={(val) => setFormData(prev => ({ ...prev, wantsToPromoteAccess: val }))}
            required
            accent="#818cf8"
          />
          <PillSelectionGroup
            label="Are you comfortable using TheMainKeys App for guest tracking, QR check-ins, and commission payouts?"
            options={['Yes', 'No']}
            selected={formData.agreesToTools}
            onChange={(val) => setFormData(prev => ({ ...prev, agreesToTools: val }))}
            required
            accent="#a78bfa"
          />
        </SectionCard>

        <SectionCard title="Agreement & Expectations" accent="#10b981">
          <div className="text-sm text-gray-400 space-y-3 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="font-semibold text-white">By submitting this application, you agree to uphold the core values of TheMainKeys:</p>
            <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs text-gray-400">
              <li>Represent the brand with professionalism, elegance, and discretion.</li>
              <li>Respect and manage client relationships within TheMainKeys platform.</li>
              <li>Use the official app for all bookings, guestlists, and reports.</li>
              <li>Understand that earnings and rewards are based on verified bookings and activity.</li>
              <li>Maintain integrity in all collaborations with venues, clients, and partners.</li>
            </ul>
          </div>
          <Input label="Signature" id="signature" name="signature" type="text" value={formData.signature} onChange={handleInputChange} required placeholder="Type your full name to sign" />
          <Input label="Date Signed" id="dateSigned" name="dateSigned" type="date" value={formData.dateSigned} onChange={() => {}} readOnly />
        </SectionCard>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-gray-300 transition-all hover:bg-white/[0.05] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isVerifyingPhoto}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 50%, #374151 100%)',
              color: '#000',
            }}
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
