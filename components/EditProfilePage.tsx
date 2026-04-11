


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Page, User } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { Spinner } from './icons/Spinner';
import { TrashIcon } from './icons/TrashIcon';
import { ImageCropModal } from './modals/ImageCropModal';
import { CloudArrowUpIcon } from './icons/CloudArrowUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface EditProfilePageProps {
  currentUser: User;
  onSave: (updatedUser: User) => void;
  onNavigate: (page: Page) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const MUSIC_OPTIONS = ['Hip-Hop', 'EDM', 'Open Format', 'House', 'Lounge'];
const ACTIVITY_OPTIONS = ['Dancing', 'Chic Lounging', 'Rooftop Views', 'Dining & Party', 'Live Music'];
const PERSONALITY_OPTIONS = ['The Center of Attention', 'The Low-Key Observer', 'The Social Connector', 'The Adventurous Explorer'];
const TIME_PREFERENCE_OPTIONS = ['Daytime', 'Nighttime', 'Both'] as const;
const ETHNICITY_OPTIONS = ['Asian', 'Black or African American', 'Hispanic or Latino', 'Native American or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'White', 'Two or more races', 'Prefer not to say'];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const InfoInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string, placeholder?: string; error?: string; required?: boolean, prefix?: string }> = ({ label, value, onChange, type = 'text', placeholder, error, required, prefix }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label} {required && <span className="text-red-400">*</span>}</label>
        <div className="relative">
             {prefix && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">{prefix}</span>}
            <input 
                type={type} 
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 transition-colors ${prefix ? 'pl-8' : ''}`}
            />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
);

const TextAreaInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onImprove: () => void; isImproving: boolean; error?: string; }> = ({ label, value, onChange, onImprove, isImproving, error }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            <button type="button" onClick={onImprove} disabled={isImproving} className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:text-gray-500 transition-colors">
                {isImproving ? <Spinner className="w-4 h-4" /> : <SparkleIcon className="w-4 h-4" />}
                Improve with AI
            </button>
        </div>
        <textarea 
            value={value}
            onChange={onChange}
            rows={3}
            className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none transition-colors`}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
);

const TagSelector: React.FC<{ options: readonly string[], selected: string[], onToggle: (tag: string) => void }> = ({ options, selected, onToggle }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(option => (
            <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    selected.includes(option)
                        ? 'bg-amber-400 text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                {option}
            </button>
        ))}
    </div>
);


export const EditProfilePage: React.FC<EditProfilePageProps> = ({ currentUser, onSave, onNavigate, showToast }) => {
    const [name, setName] = useState(currentUser.name);
    const [bio, setBio] = useState(currentUser.bio || '');
    const [isImprovingBio, setIsImprovingBio] = useState(false);
    const [instagram, setInstagram] = useState(currentUser.instagramHandle || '');
    const [tiktok, setTikTok] = useState(currentUser.tiktokHandle || '');
    const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
    const [city, setCity] = useState(currentUser.city || '');
    const [selectedMusic, setSelectedMusic] = useState(currentUser.preferences?.music || []);
    const [selectedActivities, setSelectedActivities] = useState(currentUser.preferences?.activities || []);
    const [selectedPersonality, setSelectedPersonality] = useState(currentUser.preferences?.personality || '');
    const [timePreference, setTimePreference] = useState(currentUser.preferences?.timeOfDay || '');
    const [dob, setDob] = useState(currentUser.dob || '');
    const [ethnicity, setEthnicity] = useState(currentUser.ethnicity || '');
    const [height, setHeight] = useState(currentUser.appearance?.height || '');
    const [eyeColor, setEyeColor] = useState(currentUser.appearance?.eyeColor || '');
    const [hairColor, setHairColor] = useState(currentUser.appearance?.hairColor || '');
    const [build, setBuild] = useState(currentUser.appearance?.build || '');
    const [galleryImages, setGalleryImages] = useState(currentUser.galleryImages || []);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<'profile' | 'gallery' | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const completeness = useMemo(() => {
        let score = 0;
        const totalPoints = 12;

        if (name.trim()) score++;
        if ((profilePhotoPreview || currentUser.profilePhoto) && !(profilePhotoPreview || currentUser.profilePhoto).includes('seed')) score++;
        if (bio.trim().length > 10) score++;
        if (city.trim()) score++; 
        if (instagram.trim() || tiktok.trim()) score++;
        if (phoneNumber.trim()) score++;
        if (dob) score++;
        if (ethnicity) score++;
        if (height || build) score++;
        if (selectedMusic.length > 0) score++;
        if (selectedActivities.length > 0) score++;
        if (galleryImages.length >= 3) score++;

        return Math.min(100, Math.round((score / totalPoints) * 100));
    }, [name, profilePhotoPreview, currentUser.profilePhoto, city, bio, instagram, tiktok, phoneNumber, dob, ethnicity, height, build, selectedMusic, selectedActivities, galleryImages]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Name is required.';
        if (!bio.trim()) newErrors.bio = 'Bio is required.';
        if (!dob) {
            newErrors.dob = 'Date of birth is required.';
        } else {
            const birthDate = new Date(dob);
            if (birthDate > new Date()) {
                newErrors.dob = 'Date of birth cannot be in the future.';
            } else {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                if (age < 21) newErrors.dob = 'You must be at least 21 years old.';
            }
        }
        if (instagram && !/^[a-zA-Z0-9._]+$/.test(instagram)) {
            newErrors.instagram = "Invalid Instagram handle format.";
        }
        if (tiktok && !/^[a-zA-Z0-9._]+$/.test(tiktok)) {
            newErrors.tiktok = "Invalid TikTok handle format.";
        }
        if (galleryImages.length < 3) {
            newErrors.galleryImages = 'A minimum of 3 images is required for better visibility.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const toggleTag = (tag: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
        setState(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    const handleImproveBio = async () => {
        if (!bio.trim()) {
            setErrors(prev => ({ ...prev, bio: "Please write a bio first."}));
            return;
        }
        setIsImprovingBio(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are a profile writing assistant for a luxury lifestyle app. Rewrite the following user bio to be more engaging, sophisticated, and impressive. Keep it concise (2-3 sentences). BIO: \n\n"${bio}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setBio(response.text.trim());
        } catch (error) {
            console.error("Error improving bio:", error);
            showToast("Sorry, I couldn't improve the bio at this time.", "error");
        } finally {
            setIsImprovingBio(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        if (galleryImages.length > 0) {
            setGalleryImages(galleryImages.filter((_, i) => i !== index));
        }
    };

    const handleSaveChanges = () => {
        if (!validate()) {
            showToast("Please fix the errors before saving.", "error");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const updatedUser: User = {
            ...currentUser,
            name,
            bio,
            city,
            profilePhoto: profilePhotoPreview || currentUser.profilePhoto,
            instagramHandle: instagram,
            tiktokHandle: tiktok,
            phoneNumber: phoneNumber,
            dob,
            ethnicity,
            appearance: {
                height,
                eyeColor,
                hairColor,
                build,
            },
            preferences: {
                music: selectedMusic,
                activities: selectedActivities,
                personality: selectedPersonality,
                timeOfDay: timePreference as 'Daytime' | 'Nighttime' | 'Both',
            },
            galleryImages,
        };
        onSave(updatedUser);
        onNavigate('userProfile');
        showToast("Profile updated successfully!", "success");
    };
    
    const handleProfilePhotoClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file (PNG, JPG).', 'error');
                e.target.value = '';
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                showToast(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`, 'error');
                e.target.value = '';
                return;
            }

            setIsUploading(true);
            setUploadTarget('profile');
            
            const reader = new FileReader();
            reader.onload = () => {
                setIsUploading(false);
                if (typeof reader.result === 'string') {
                    setImageToCrop(reader.result);
                } else {
                    showToast('Failed to process image data.', 'error');
                }
            };
            reader.onerror = () => {
                setIsUploading(false);
                showToast('Failed to read the selected file. Please try another image.', 'error');
            };
            
            try {
                reader.readAsDataURL(file);
            } catch (err) {
                setIsUploading(false);
                console.error(err);
                showToast('An unexpected error occurred while reading the file.', 'error');
            }
        }
        e.target.value = ''; 
    };
    
    const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (galleryImages.length >= 10) {
            showToast('You can upload a maximum of 10 images.', 'error');
            return;
        }
        const file = e.target.files?.[0];
        if (file) {
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
            
            setIsUploading(true);
            setUploadTarget('gallery');

            const reader = new FileReader();
            reader.onload = () => {
                setIsUploading(false);
                if (typeof reader.result === 'string') {
                    setImageToCrop(reader.result);
                } else {
                    showToast('Failed to process image data.', 'error');
                }
            };
            reader.onerror = () => {
                setIsUploading(false);
                showToast('Failed to read the selected file.', 'error');
            };
            
            try {
                 reader.readAsDataURL(file);
            } catch (err) {
                setIsUploading(false);
                console.error(err);
                 showToast('An unexpected error occurred while reading the file.', 'error');
            }
        }
        e.target.value = '';
    };

    const handleCropComplete = (croppedImageUrl: string) => {
        if (uploadTarget === 'profile') {
            setProfilePhotoPreview(croppedImageUrl);
        } else if (uploadTarget === 'gallery') {
            setGalleryImages(prev => [...prev, croppedImageUrl]);
            if (galleryImages.length + 1 >= 3) {
                setErrors(prev => ({...prev, galleryImages: undefined}));
            }
        }
        setImageToCrop(null);
        setUploadTarget(null);
    };
    
    const handleCropError = (message: string) => {
        showToast(message, 'error');
    };

    const getProgressColor = (percent: number) => {
        if (percent < 40) return 'bg-red-500';
        if (percent < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

  return (
    <>
    {imageToCrop && (
        <ImageCropModal 
            src={imageToCrop}
            onClose={() => {
                setImageToCrop(null);
                setUploadTarget(null);
            }}
            onCrop={handleCropComplete}
            onError={handleCropError}
        />
    )}
    <div className="p-4 md:p-8 animate-fade-in text-white pb-24">
      <button onClick={() => onNavigate('userProfile')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-semibold">
        <ChevronLeftIcon className="w-5 h-5"/>
        Cancel & Go Back
      </button>

      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
      <input type="file" ref={galleryFileInputRef} onChange={handleGalleryImageUpload} className="hidden" accept="image/*" />
      
      {/* Completeness Bar - Sticky */}
      <div className="sticky top-20 z-30 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl p-4 mb-8 shadow-xl">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h3 className="font-bold text-white">Profile Strength</h3>
                <p className="text-xs text-gray-400">{completeness === 100 ? "Perfect! Your profile is top-tier." : "Complete more fields to unlock full access."}</p>
            </div>
            <span className={`text-2xl font-bold ${completeness === 100 ? 'text-green-400' : 'text-amber-400'}`}>{completeness}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ease-out ${getProgressColor(completeness)}`} 
                style={{ width: `${completeness}%` }}
            ></div>
        </div>
        {completeness === 100 && (
            <div className="mt-2 flex items-center gap-2 text-green-400 text-sm font-bold justify-center animate-pulse">
                <CheckCircleIcon className="w-5 h-5" />
                All set!
            </div>
        )}
      </div>


      <div className="text-center mb-10">
        <div className="relative inline-block group">
          <img src={profilePhotoPreview || currentUser.profilePhoto} alt={currentUser.name} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-800 shadow-lg" />
          <button 
            onClick={handleProfilePhotoClick} 
            disabled={isUploading}
            className="absolute bottom-1 right-1 bg-amber-400 text-black p-2 rounded-full flex items-center justify-center border-2 border-[#121212] hover:scale-110 transition-transform disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md"
            aria-label="Change profile picture"
          >
            {isUploading && uploadTarget === 'profile' ? <Spinner className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-3">Tap icon to change photo</p>
      </div>

      <div className="space-y-10 max-w-3xl mx-auto">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-400 rounded-full"></span>
                Personal Information
            </h2>
            <div className="space-y-5">
                <InfoInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
                <TextAreaInput label="About Me" value={bio} onChange={(e) => setBio(e.target.value)} onImprove={handleImproveBio} isImproving={isImprovingBio} error={errors.bio} />
                <InfoInput label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Miami, New York" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoInput label="Instagram Handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} error={errors.instagram} prefix="@" />
                    <InfoInput label="TikTok Handle" value={tiktok} onChange={(e) => setTikTok(e.target.value)} error={errors.tiktok} prefix="@" />
                </div>
                <InfoInput label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="tel" />
                <InfoInput label="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} type="date" error={errors.dob} required />
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ethnicity</label>
                    <select
                        value={ethnicity}
                        onChange={(e) => setEthnicity(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                    >
                        <option value="" disabled>Select your ethnicity</option>
                        {ETHNICITY_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                Appearance
            </h2>
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <InfoInput label="Height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 5'11\"" />
                    <InfoInput label="Build" value={build} onChange={(e) => setBuild(e.target.value)} placeholder="e.g., Athletic" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InfoInput label="Eye Color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} placeholder="e.g., Blue" />
                    <InfoInput label="Hair Color" value={hairColor} onChange={(e) => setHairColor(e.target.value)} placeholder="e.g., Blonde" />
                </div>
            </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    My Gallery
                </h2>
                <span className="text-sm text-gray-400">{galleryImages.length}/10 (Min 3)</span>
            </div>
            
            {errors.galleryImages && <p className="text-red-400 text-sm mb-4 bg-red-900/30 p-3 rounded-lg border border-red-900/50">{errors.galleryImages}</p>}
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryImages.map((url, index) => (
                    <div key={index} className="relative aspect-square group rounded-lg overflow-hidden bg-black">
                        <img src={url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)} 
                            className="absolute top-1 right-1 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {galleryImages.length < 10 && (
                    <button
                        type="button"
                        onClick={() => !isUploading && galleryFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="aspect-square bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center text-gray-500 hover:border-amber-400 hover:text-amber-400 transition-all hover:bg-gray-800/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading && uploadTarget === 'gallery' ? (
                            <Spinner className="w-8 h-8" />
                        ) : (
                            <>
                                <CloudArrowUpIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs font-semibold">Add Photo</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Nightlife Preferences
            </h2>
            <div className="space-y-8">
                <div>
                    <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide text-gray-400">My Vibe</h3>
                    <div className="flex flex-wrap gap-2">
                        {PERSONALITY_OPTIONS.map(option => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setSelectedPersonality(option)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedPersonality === option
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide text-gray-400">Time Preference</h3>
                    <div className="flex flex-wrap gap-2">
                        {TIME_PREFERENCE_OPTIONS.map(option => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setTimePreference(option)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    timePreference === option
                                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-900/30'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide text-gray-400">Favorite Music</h3>
                    <TagSelector options={MUSIC_OPTIONS} selected={selectedMusic} onToggle={(tag) => toggleTag(tag, selectedMusic, setSelectedMusic)} />
                </div>
                 <div>
                    <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide text-gray-400">Activities</h3>
                    <TagSelector options={ACTIVITY_OPTIONS} selected={selectedActivities} onToggle={(tag) => toggleTag(tag, selectedActivities, setSelectedActivities)} />
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <button onClick={handleSaveChanges} disabled={isUploading} className="w-full max-w-md bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-4 px-8 rounded-xl text-lg transition-transform duration-200 hover:scale-105 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {isUploading ? 'Uploading Images...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
    </>
  );
};
