
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, UserRole, UserAccessLevel } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { Spinner } from '../icons/Spinner';
import { SparkleIcon } from '../icons/SparkleIcon';
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
    profilePhoto: '',
    bio: '',
    city: 'Miami',
    instagramHandle: '',
    phoneNumber: '',
    dob: '',
    ethnicity: '',
    appearance: { height: '', eyeColor: '', hairColor: '', build: '' },
};

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Credentials', 'Profile', 'Details'];
    return (
        <div className="flex items-center justify-center px-6 pt-4">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= index + 1 ? 'bg-amber-400 border-amber-400 text-black' : 'border-gray-600 text-gray-400'}`}>
                            <span className="font-bold">{index + 1}</span>
                        </div>
                        <p className={`text-xs mt-1 transition-colors ${currentStep >= index + 1 ? 'text-white' : 'text-gray-500'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > index + 1 ? 'bg-amber-400' : 'bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};


export const AdminAddUserModal: React.FC<AdminAddUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [newUser, setNewUser] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isImprovingBio, setIsImprovingBio] = useState(false);
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
  
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
        if (!newUser.name.trim()) newErrors.name = "Name is required.";
        if (!newUser.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(newUser.email)) newErrors.email = "Email is invalid.";
        if (!newUser.password) newErrors.password = "Password is required.";
        else if (newUser.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
        if (newUser.password !== newUser.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    }
    if (currentStep === 2) {
        if (newUser.instagramHandle && !/^[a-zA-Z0-9._]+$/.test(newUser.instagramHandle)) {
            newErrors.instagramHandle = "Invalid Instagram handle format.";
        }
    }
     if (currentStep === 3) {
        if (newUser.dob) {
            const birthDate = new Date(newUser.dob);
            if (birthDate > new Date()) {
                newErrors.dob = 'Date of birth cannot be in the future.';
            } else {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                if (age < 21) newErrors.dob = 'User must be at least 21 years old.';
            }
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
        setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => setStep(prev => prev - 1);

  const handleImproveBio = async () => {
      if (!newUser.bio.trim()) {
          setErrors(prev => ({ ...prev, bio: "Please write a bio first."}));
          return;
      }
      setIsImprovingBio(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `You are a profile writing assistant for a luxury lifestyle app. Rewrite the following user bio to be more engaging, sophisticated, and impressive. Keep it concise (2-3 sentences). BIO: \n\n"${newUser.bio}"`;
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
          });
          handleChange('bio', response.text.trim());
      } catch (error) {
          console.error("Error improving bio:", error);
          setErrors(prev => ({ ...prev, bio: "Couldn't improve bio at this time."}));
      } finally {
          setIsImprovingBio(false);
      }
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleChange('profilePhoto', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = async () => {
    if (!validateStep(3)) return; 
    
    setIsSaving(true);
    const { password, confirmPassword, ...userToSave } = newUser;
    if (!userToSave.profilePhoto) {
        userToSave.profilePhoto = `https://picsum.photos/seed/${userToSave.name.split(' ').join('') || Date.now()}/400/400`;
    }
    
    await onSave(userToSave);
    onClose();
  };
  
  const handleChange = (field: keyof typeof newUser, value: any) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAppearanceChange = (field: keyof typeof newUser.appearance, value: any) => {
    setNewUser(prev => ({ ...prev, appearance: { ...prev.appearance, [field]: value } }));
  }

  if (!isOpen) return null;
  
  const isRoleAdmin = newUser.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bg-[#121212] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Create New User</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800" aria-label="Close">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <Stepper currentStep={step} />
            <div className="p-6 space-y-4 overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <InputField label="Full Name" value={newUser.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} required />
                        <InputField label="Email" type="email" value={newUser.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Password" type="password" value={newUser.password} onChange={e => handleChange('password', e.target.value)} error={errors.password} required />
                            <InputField label="Confirm Password" type="password" value={newUser.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} error={errors.confirmPassword} required />
                        </div>
                        <SelectField label="User Role" value={newUser.role} onChange={e => handleChange('role', e.target.value)}>
                            {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </SelectField>
                        <SelectField label="Access Level" value={newUser.accessLevel} onChange={e => handleChange('accessLevel', e.target.value)} disabled={isRoleAdmin}>
                            {Object.values(UserAccessLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </SelectField>
                        {isRoleAdmin && <p className="text-xs text-gray-500 -mt-2">Admins are automatically granted 'Approved Girl' access.</p>}
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Photo</label>
                            {newUser.profilePhoto ? (
                                <div className="relative w-24 h-24 mx-auto">
                                    <img src={newUser.profilePhoto} alt="Profile preview" className="w-full h-full object-cover rounded-full border-2 border-amber-400" />
                                    <button
                                        type="button"
                                        onClick={() => handleChange('profilePhoto', '')}
                                        className="absolute top-0 right-0 bg-red-600 p-1 rounded-full text-white hover:bg-red-700"
                                        aria-label="Remove photo"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-amber-400 transition-colors"
                                >
                                    <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-amber-400 font-semibold text-sm">Upload Photo</span>
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-400">About Me / Bio</label>
                                <button type="button" onClick={handleImproveBio} disabled={isImprovingBio} className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:text-gray-500">
                                    {isImprovingBio ? <Spinner className="w-4 h-4" /> : <SparkleIcon className="w-4 h-4" />}
                                    Improve with AI
                                </button>
                            </div>
                            <textarea value={newUser.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 resize-none" />
                        </div>
                        <InputField label="City" value={newUser.city} onChange={e => handleChange('city', e.target.value)} />
                        <InputField label="Phone Number (Optional)" value={newUser.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} type="tel" />
                        <InputField label="Instagram Handle (Optional)" value={newUser.instagramHandle} onChange={e => handleChange('instagramHandle', e.target.value)} error={errors.instagramHandle} prefix="@" />
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <InputField label="Date of Birth (Optional)" value={newUser.dob} onChange={e => handleChange('dob', e.target.value)} type="date" error={errors.dob} />
                        <SelectField label="Ethnicity (Optional)" value={newUser.ethnicity} onChange={e => handleChange('ethnicity', e.target.value)}>
                            <option value="">Select...</option>
                            {['Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Other', 'Prefer not to say'].map(e => <option key={e} value={e}>{e}</option>)}
                        </SelectField>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Height (Optional)" value={newUser.appearance.height} onChange={e => handleAppearanceChange('height', e.target.value)} placeholder="e.g., 5'11&quot;" />
                            <InputField label="Build (Optional)" value={newUser.appearance.build} onChange={e => handleAppearanceChange('build', e.target.value)} placeholder="e.g., Athletic" />
                            <InputField label="Eye Color (Optional)" value={newUser.appearance.eyeColor} onChange={e => handleAppearanceChange('eyeColor', e.target.value)} placeholder="e.g., Blue" />
                            <InputField label="Hair Color (Optional)" value={newUser.appearance.hairColor} onChange={e => handleAppearanceChange('hairColor', e.target.value)} placeholder="e.g., Blonde" />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-between gap-3">
                <button onClick={handleBack} disabled={isSaving || step === 1} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Back</button>
                {step < 3 ? (
                    <button onClick={handleNext} disabled={isSaving} className="bg-amber-400 text-black font-bold py-2 px-4 rounded-lg">Next</button>
                ) : (
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg w-32 flex items-center justify-center disabled:bg-green-500/50">
                        {isSaving ? <Spinner className="w-5 h-5" /> : 'Create User'}
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};


const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; error?: string; prefix?: string; placeholder?: string }> = ({ label, error, prefix, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {prefix && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">{prefix}</span>}
            <input {...props} className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 ${prefix ? 'pl-7' : ''}`} />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; disabled?: boolean; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <select {...props} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-700/50 disabled:cursor-not-allowed" />
    </div>
);
