
import React, { useState, useRef, useMemo } from 'react';
import { Page, User } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { Spinner } from './icons/Spinner';
import { TrashIcon } from './icons/TrashIcon';
import { ImageCropModal } from './modals/ImageCropModal';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { supabase } from '../lib/supabase';
import { saveUserPassword } from './NewUserOnboarding';

interface EditProfilePageProps {
  currentUser: User;
  onSave: (updatedUser: User) => void;
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const MUSIC_OPTIONS      = ['Hip-Hop', 'EDM', 'Open Format', 'House', 'Lounge'];
const ACTIVITY_OPTIONS   = ['Dancing', 'Chic Lounging', 'Rooftop Views', 'Dining & Party', 'Live Music'];
const PERSONALITY_OPTIONS = ['The Center of Attention', 'The Low-Key Observer', 'The Social Connector', 'The Adventurous Explorer'];
const TIME_OPTIONS       = ['Daytime', 'Nighttime', 'Both'] as const;
const ETHNICITY_OPTIONS  = ['Asian', 'Black or African American', 'Hispanic or Latino', 'Native American or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'White', 'Two or more races', 'Prefer not to say'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// ── Design tokens ──────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border:     '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20,
  padding: 24,
};

// ── Sub-components ─────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  prefix?: string;
  children?: never;
} & (
  | { type?: 'input'; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; inputType?: string; placeholder?: string }
  | { type: 'textarea'; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onImprove?: () => void; isImproving?: boolean }
  | { type: 'select'; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }
)> = (props) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${props.error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: '10px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {props.label}{props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {props.type === 'textarea' && props.onImprove && (
          <button
            type="button"
            onClick={props.onImprove}
            disabled={props.isImproving}
            className="flex items-center gap-1 text-[11px] font-bold transition-colors disabled:opacity-40"
            style={{ color: '#818cf8' }}
          >
            {props.isImproving ? <Spinner className="w-3.5 h-3.5" /> : <SparkleIcon className="w-3.5 h-3.5" />}
            Improve with AI
          </button>
        )}
      </div>

      {props.type === 'textarea' ? (
        <textarea
          value={props.value}
          onChange={props.onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          rows={3}
          style={{ ...inputStyle, resize: 'none' }}
          className="placeholder-gray-700"
        />
      ) : props.type === 'select' ? (
        <select
          value={props.value}
          onChange={props.onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="" disabled>Select…</option>
          {(props as { options: string[] }).options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className="relative">
          {props.prefix && (
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-600 text-sm pointer-events-none select-none">
              {props.prefix}
            </span>
          )}
          <input
            type={(props as { inputType?: string }).inputType ?? 'text'}
            value={props.value}
            onChange={props.onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder={(props as { placeholder?: string }).placeholder}
            style={{ ...inputStyle, paddingLeft: props.prefix ? 28 : 14 }}
            className="placeholder-gray-700"
          />
        </div>
      )}
      {props.error && <p className="text-red-400 text-xs mt-1.5">{props.error}</p>}
    </div>
  );
};

const TagPill: React.FC<{ label: string; active: boolean; onClick: () => void; accent?: string }> = ({
  label, active, onClick, accent = '#6366f1',
}) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95"
    style={active
      ? { background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }
      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    {label}
  </button>
);

const SectionCard: React.FC<{ title: string; accent?: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title, accent = '#6366f1', right, children,
}) => (
  <div style={CARD}>
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
        <h2 className="text-base font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
      </div>
      {right}
    </div>
    {children}
  </div>
);

// ── Main ───────────────────────────────────────────────────────
export const EditProfilePage: React.FC<EditProfilePageProps> = ({ currentUser, onSave, onNavigate, showToast }) => {
  const [name,       setName]       = useState(currentUser.name);
  const [bio,        setBio]        = useState(currentUser.bio || '');
  const [instagram,  setInstagram]  = useState(currentUser.instagramHandle || '');
  const [tiktok,     setTikTok]     = useState(currentUser.tiktokHandle || '');
  const [phoneNumber,setPhoneNumber]= useState(currentUser.phoneNumber || '');
  const [city,       setCity]       = useState(currentUser.city || '');
  const [dob,        setDob]        = useState(currentUser.dob || '');
  const [ethnicity,  setEthnicity]  = useState(currentUser.ethnicity || '');
  const [height,     setHeight]     = useState(currentUser.appearance?.height || '');
  const [eyeColor,   setEyeColor]   = useState(currentUser.appearance?.eyeColor || '');
  const [hairColor,  setHairColor]  = useState(currentUser.appearance?.hairColor || '');
  const [build,      setBuild]      = useState(currentUser.appearance?.build || '');
  const [galleryImages, setGalleryImages] = useState(currentUser.galleryImages || []);
  const [selectedMusic,       setSelectedMusic]       = useState(currentUser.preferences?.music || []);
  const [selectedActivities,  setSelectedActivities]  = useState(currentUser.preferences?.activities || []);
  const [selectedPersonality, setSelectedPersonality] = useState(currentUser.preferences?.personality || '');
  const [timePreference,      setTimePreference]      = useState(currentUser.preferences?.timeOfDay || '');

  const [errors,            setErrors]           = useState<Record<string, string>>({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [imageToCrop,       setImageToCrop]       = useState<string | null>(null);
  const [uploadTarget,      setUploadTarget]      = useState<'profile' | 'gallery' | null>(null);
  const [isUploading,       setIsUploading]       = useState(false);
  const [isImprovingBio,    setIsImprovingBio]    = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [pwErrors,  setPwErrors]  = useState<Record<string, string>>({});
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  const fileInputRef        = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // ── Completeness ─────────────────────────────────────────
  const completeness = useMemo(() => {
    let s = 0;
    if (name.trim()) s++;
    const photo = profilePhotoPreview || currentUser.profilePhoto;
    if (photo && !photo.includes('seed')) s++;
    if (bio.trim().length > 10) s++;
    if (city.trim()) s++;
    if (instagram.trim() || tiktok.trim()) s++;
    if (phoneNumber.trim()) s++;
    if (dob) s++;
    if (ethnicity) s++;
    if (height || build) s++;
    if (selectedMusic.length > 0) s++;
    if (selectedActivities.length > 0) s++;
    if (galleryImages.length >= 3) s++;
    return Math.min(100, Math.round((s / 12) * 100));
  }, [name, profilePhotoPreview, currentUser.profilePhoto, city, bio, instagram, tiktok, phoneNumber, dob, ethnicity, height, build, selectedMusic, selectedActivities, galleryImages]);

  const progressColor = completeness === 100 ? '#4ade80' : completeness >= 75 ? '#6366f1' : completeness >= 40 ? '#fbbf24' : '#ef4444';

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!bio.trim()) e.bio = 'Bio is required.';
    if (!dob) {
      e.dob = 'Date of birth is required.';
    } else {
      const bd = new Date(dob);
      if (bd > new Date()) e.dob = 'Date of birth cannot be in the future.';
      else if (new Date().getFullYear() - bd.getFullYear() < 21) e.dob = 'You must be at least 21.';
    }
    if (instagram && !/^[a-zA-Z0-9._]+$/.test(instagram)) e.instagram = 'Invalid Instagram handle.';
    if (tiktok    && !/^[a-zA-Z0-9._]+$/.test(tiktok))    e.tiktok    = 'Invalid TikTok handle.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────
  const toggleTag = (tag: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) =>
    setState(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleImproveBio = () => showToast('AI bio assistant is temporarily unavailable.', 'error');

  const handleRemoveImage = (i: number) => setGalleryImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSaveChanges = () => {
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSave({
      ...currentUser, name, bio, city,
      profilePhoto: profilePhotoPreview || currentUser.profilePhoto,
      instagramHandle: instagram, tiktokHandle: tiktok, phoneNumber, dob, ethnicity,
      appearance: { height, eyeColor, hairColor, build },
      preferences: { music: selectedMusic, activities: selectedActivities, personality: selectedPersonality, timeOfDay: timePreference as 'Daytime' | 'Nighttime' | 'Both' },
      galleryImages,
    });
    onNavigate('back' as Page);
    showToast('Profile updated successfully!', 'success');
  };

  const readFile = (file: File, target: 'profile' | 'gallery') => {
    if (!file.type.startsWith('image/')) { showToast('Please select a valid image file.', 'error'); return; }
    if (file.size > MAX_FILE_SIZE_BYTES) { showToast('File size cannot exceed 10MB.', 'error'); return; }
    setIsUploading(true);
    setUploadTarget(target);
    const reader = new FileReader();
    reader.onload = () => { setIsUploading(false); typeof reader.result === 'string' ? setImageToCrop(reader.result) : showToast('Failed to process image.', 'error'); };
    reader.onerror = () => { setIsUploading(false); showToast('Failed to read file.', 'error'); };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) readFile(f, 'profile'); e.target.value = '';
  };
  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (galleryImages.length >= 10) { showToast('Maximum 10 images allowed.', 'error'); return; }
    const f = e.target.files?.[0]; if (f) readFile(f, 'gallery'); e.target.value = '';
  };
  const handleCropComplete = (url: string) => {
    if (uploadTarget === 'profile') setProfilePhotoPreview(url);
    else if (uploadTarget === 'gallery') setGalleryImages(p => [...p, url]);
    setImageToCrop(null); setUploadTarget(null);
  };

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (!currentPw) errs.currentPw = 'Enter your current password.';
    if (newPw.length < 8) errs.newPw = 'At least 8 characters.';
    if (newPw !== confirmPw) errs.confirmPw = 'Passwords do not match.';
    if (currentPw && newPw && currentPw === newPw) errs.newPw = 'New password must differ from current.';
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({}); setIsUpdatingPw(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPw });
      if (signInErr) { setPwErrors({ currentPw: 'Current password is incorrect.' }); return; }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) { setPwErrors({ newPw: updateErr.message }); return; }
      saveUserPassword(currentUser.email, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password updated successfully.', 'success');
    } finally { setIsUpdatingPw(false); }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {imageToCrop && (
        <ImageCropModal
          src={imageToCrop}
          onClose={() => { setImageToCrop(null); setUploadTarget(null); }}
          onCrop={handleCropComplete}
          onError={msg => showToast(msg, 'error')}
        />
      )}

      <input type="file" ref={fileInputRef}        onChange={onFileChange}     className="hidden" accept="image/*" />
      <input type="file" ref={galleryFileInputRef}  onChange={onGalleryChange}  className="hidden" accept="image/*" />

      <div className="min-h-screen animate-fade-in pb-36 text-white" style={{ background: '#080808' }}>

        {/* ── Sticky header ──────────────────────────────── */}
        <div
          className="sticky top-0 z-30 px-5 pt-5 pb-4"
          style={{ background: 'rgba(8,8,8,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('back' as Page)}
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: '#9ca3af' }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-base font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Edit Profile
            </h1>
            <button
              onClick={handleSaveChanges}
              disabled={isUploading}
              className="text-sm font-black px-4 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#FFFFFF,#9CA3AF)', color: '#000' }}
            >
              Save
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Profile Strength</p>
              <span className="text-xs font-black" style={{ color: progressColor }}>
                {completeness === 100
                  ? <span className="flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5 inline" /> Complete</span>
                  : `${completeness}%`}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completeness}%`, background: `linear-gradient(90deg,${progressColor},${progressColor}80)` }}
              />
            </div>
          </div>
        </div>

        {/* ── Avatar ──────────────────────────────────────── */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-2xl overflow-hidden"
              style={{ border: '2px solid rgba(255,255,255,0.12)' }}
            >
              <img
                src={profilePhotoPreview || currentUser.profilePhoto}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Change profile picture"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
              style={{ background: '#6366f1', border: '2px solid #080808' }}
            >
              {isUploading && uploadTarget === 'profile' ? <Spinner className="w-4 h-4 text-white" /> : <PencilIcon className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">Tap to change photo</p>
        </div>

        {/* ── Sections ────────────────────────────────────── */}
        <div className="px-5 space-y-4 max-w-2xl mx-auto">

          {/* Personal Information */}
          <SectionCard title="Personal Information" accent="#6366f1">
            <div className="space-y-4">
              <Field label="Full Name" value={name} onChange={e => setName(e.target.value)} error={errors.name} required />
              <Field
                type="textarea"
                label="About Me"
                value={bio}
                onChange={e => setBio(e.target.value)}
                onImprove={handleImproveBio}
                isImproving={isImprovingBio}
                error={errors.bio}
              />
              <Field label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Miami" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} prefix="@" error={errors.instagram} />
                <Field label="TikTok"    value={tiktok}    onChange={e => setTikTok(e.target.value)}    prefix="@" error={errors.tiktok} />
              </div>
              <Field label="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} inputType="tel" />
              <Field label="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} inputType="date" error={errors.dob} required />
              <Field
                type="select"
                label="Ethnicity"
                value={ethnicity}
                onChange={e => setEthnicity(e.target.value)}
                options={ETHNICITY_OPTIONS}
              />
            </div>
          </SectionCard>

          {/* Appearance */}
          <SectionCard title="Appearance" accent="#a78bfa">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height" value={height} onChange={e => setHeight(e.target.value)} placeholder="5'11&quot;" />
                <Field label="Build"  value={build}  onChange={e => setBuild(e.target.value)}  placeholder="Athletic" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Eye Color"  value={eyeColor}  onChange={e => setEyeColor(e.target.value)}  placeholder="Blue" />
                <Field label="Hair Color" value={hairColor} onChange={e => setHairColor(e.target.value)} placeholder="Blonde" />
              </div>
            </div>
          </SectionCard>

          {/* Gallery */}
          <SectionCard
            title="My Gallery"
            accent="#fb923c"
            right={<span className="text-xs font-bold text-gray-600">{galleryImages.length}/10</span>}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(239,68,68,0.85)' }}
                  >
                    <TrashIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {galleryImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => !isUploading && galleryFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}
                >
                  {isUploading && uploadTarget === 'gallery'
                    ? <Spinner className="w-6 h-6 text-gray-500" />
                    : <>
                        <CloudArrowUpIcon className="w-6 h-6 text-gray-600" />
                        <span className="text-[10px] font-bold text-gray-600">Add Photo</span>
                      </>
                  }
                </button>
              )}
            </div>
          </SectionCard>

          {/* Nightlife Preferences */}
          <SectionCard title="Nightlife Preferences" accent="#34d399">
            <div className="space-y-6">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">My Vibe</p>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_OPTIONS.map(o => (
                    <TagPill
                      key={o} label={o}
                      active={selectedPersonality === o}
                      onClick={() => setSelectedPersonality(o)}
                      accent="#6366f1"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Time Preference</p>
                <div className="flex gap-2">
                  {TIME_OPTIONS.map(o => (
                    <TagPill
                      key={o} label={o}
                      active={timePreference === o}
                      onClick={() => setTimePreference(o)}
                      accent="#34d399"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Favorite Music</p>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_OPTIONS.map(o => (
                    <TagPill
                      key={o} label={o}
                      active={selectedMusic.includes(o)}
                      onClick={() => toggleTag(o, selectedMusic, setSelectedMusic)}
                      accent="#fb923c"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Activities</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_OPTIONS.map(o => (
                    <TagPill
                      key={o} label={o}
                      active={selectedActivities.includes(o)}
                      onClick={() => toggleTag(o, selectedActivities, setSelectedActivities)}
                      accent="#38bdf8"
                    />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Change Password */}
          <SectionCard
            title="Change Password"
            accent="#9ca3af"
            right={
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors"
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            }
          >
            <div className="space-y-4">
              <Field label="Current Password"  value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwErrors(p => ({ ...p, currentPw: '' })); }} inputType={showPw ? 'text' : 'password'} error={pwErrors.currentPw} required />
              <Field label="New Password"       value={newPw}     onChange={e => { setNewPw(e.target.value);     setPwErrors(p => ({ ...p, newPw: '' }));     }} inputType={showPw ? 'text' : 'password'} placeholder="At least 8 characters" error={pwErrors.newPw} required />
              <Field label="Confirm Password"   value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirmPw: '' })); }} inputType={showPw ? 'text' : 'password'} error={pwErrors.confirmPw} required />
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isUpdatingPw}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                {isUpdatingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </SectionCard>

          {/* Save CTA */}
          <button
            onClick={handleSaveChanges}
            disabled={isUploading}
            className="w-full font-black py-4 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#FFFFFF,#9CA3AF,#374151)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(255,255,255,0.15)',
            }}
          >
            {isUploading ? 'Uploading…' : 'Save Profile Changes'}
          </button>
        </div>
      </div>
    </>
  );
};
