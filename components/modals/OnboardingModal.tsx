
import React, { useState, useEffect, useRef } from 'react';
import { Page, User, Promoter } from '../../types';
import { HandWavingIcon } from '../icons/HandWavingIcon';
import { ProfileIcon } from '../icons/ProfileIcon';
import { SparkleIcon } from '../icons/SparkleIcon';
import { BellIcon } from '../icons/BellIcon';
import { TokenIcon } from '../icons/TokenIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { PromotersIcon } from '../icons/PromotersIcon';
import { BookIcon } from '../icons/BookIcon';
import { StarIcon } from '../icons/StarIcon';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { ImageCropModal } from './ImageCropModal';
import { PencilIcon } from '../icons/PencilIcon';
import { Spinner } from '../icons/Spinner';
import { UserIcon } from '../icons/UserIcon';
import { MailIcon } from '../icons/MailIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { GoogleIcon } from '../icons/GoogleIcon';
import { FacebookIcon } from '../icons/FacebookIcon';

interface OnboardingModalProps {
  user: User;
  onFinish: (completed: boolean) => void;
  onNavigate: (page: Page) => void;
  promoters: Promoter[];
  onSelectPromoter: (promoterId: number | null) => void;
  onUpdateUser?: (user: User) => void;
  allUsers?: User[];
  onSwitchUser?: (user: User) => void;
}

const ONBOARDING_REWARD = 100;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onFinish, onNavigate, promoters, onSelectPromoter, onUpdateUser, allUsers, onSwitchUser }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [selectedPromoterId, setSelectedPromoterId] = useState<number | null>(null);
    
    // Auth State
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Sign Up/Login Data
    const [authData, setAuthData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    
    // Image upload state
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
            setIsNotificationEnabled(true);
        }
    }, []);

    const handleToggleNotification = async () => {
        if (isNotificationEnabled) {
            setIsNotificationEnabled(false);
        } else {
            if ('Notification' in window) {
                try {
                    await Notification.requestPermission();
                    setIsNotificationEnabled(true);
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                    setIsNotificationEnabled(true);
                }
            } else {
                setIsNotificationEnabled(true);
            }
        }
    };
    
    const handlePromoterSelection = (id: number | null) => {
        setSelectedPromoterId(id);
        onSelectPromoter(id);
        if (id !== null) {
            setTimeout(() => {
                goToNext();
            }, 500);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = () => {
            setIsUploading(false);
            if (typeof reader.result === 'string') {
                setImageToCrop(reader.result);
            }
        };
        reader.onerror = () => {
            setIsUploading(false);
            alert('Failed to read file.');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = (croppedImageUrl: string) => {
        setImageToCrop(null);
        if (onUpdateUser) {
            onUpdateUser({ ...user, profilePhoto: croppedImageUrl });
        }
    };

    const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuthData(prev => ({ ...prev, [name]: value }));
    };

    const handleAuthSubmit = () => {
        if (!authData.email || !authData.password) {
            alert("Please fill in all required fields.");
            return;
        }

        if (authMode === 'signup') {
             if (!authData.name) {
                alert("Name is required.");
                return;
             }
             if (authData.password !== authData.confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
        }

        // Login Logic: Check for existing user
        if (authMode === 'login' && allUsers && onSwitchUser) {
            const foundUser = allUsers.find(u => u.email.toLowerCase() === authData.email.toLowerCase());
            
            if (foundUser) {
                 setIsAuthenticating(true);
                 setTimeout(() => {
                    setIsAuthenticating(false);
                    onSwitchUser(foundUser); // Log them in
                    onFinish(true); // Close onboarding
                 }, 1500);
                 return;
            } else {
                 alert("User not found. Please sign up.");
                 return;
            }
        }
        
        setIsAuthenticating(true);
        
        // Signup Simulation
        setTimeout(() => {
            setIsAuthenticating(false);
            if (onUpdateUser) {
                onUpdateUser({
                    ...user,
                    name: authMode === 'signup' ? authData.name : 'Welcome Back User',
                    email: authData.email,
                    phoneNumber: authData.phone || user.phoneNumber
                });
            }
            goToNext();
        }, 1500);
    };

    const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
        setIsAuthenticating(true);

        const mockEmail = provider === 'Google' ? 'alex@google.com' : 'sarah@facebook.com';

        // Check if this social user already exists in our "database"
        const existingUser = allUsers?.find(u => u.email.toLowerCase() === mockEmail.toLowerCase());

        setTimeout(() => {
            setIsAuthenticating(false);
            
            if (existingUser && onSwitchUser) {
                 // Existing user found -> Login
                 onSwitchUser(existingUser);
                 onFinish(true);
            } else {
                 // New user -> Pre-fill profile and continue onboarding
                 if (onUpdateUser) {
                    onUpdateUser({
                        ...user,
                        name: existingUser ? existingUser.name : `Alex ${provider}`,
                        email: mockEmail,
                        profilePhoto: provider === 'Google' 
                            ? 'https://lh3.googleusercontent.com/a/ACg8ocIq8jF8=s96-c' 
                            : 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=12345&height=200&width=200&ext=12345'
                    });
                }
                goToNext();
            }
        }, 1500);
    };

    const steps = [
        {
            id: 'auth',
            icon: <SparkleIcon className="w-12 h-12 text-[#EC4899]" />,
            title: authMode === 'login' ? "Welcome Back" : "Create Account",
            description: authMode === 'login' ? "Log in to access your exclusive nightlife concierge." : "Join Miami's premier nightlife community.",
            customContent: (
                <div className="mt-6 w-full max-w-sm mx-auto space-y-4 text-left">
                     {/* Social Buttons */}
                     <div className="space-y-3 mb-6">
                        <button 
                            onClick={() => handleSocialLogin('Google')}
                            disabled={isAuthenticating}
                            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70"
                        >
                            {isAuthenticating ? <Spinner className="w-5 h-5 text-gray-600" /> : <GoogleIcon className="w-5 h-5" />}
                            Continue with Google
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('Facebook')}
                            disabled={isAuthenticating}
                            className="w-full bg-[#1877F2] text-white font-semibold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-colors disabled:opacity-70"
                        >
                            {isAuthenticating ? <Spinner className="w-5 h-5 text-white" /> : <FacebookIcon className="w-5 h-5" />}
                            Continue with Facebook
                        </button>
                    </div>

                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-grow h-px bg-gray-700"></div>
                        <span className="text-gray-500 text-xs uppercase font-bold">Or</span>
                        <div className="flex-grow h-px bg-gray-700"></div>
                    </div>

                    {/* Auth Form */}
                    {authMode === 'signup' && (
                        <>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={authData.name}
                                        onChange={handleAuthChange}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MailIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <input 
                                type="email" 
                                name="email"
                                value={authData.email}
                                onChange={handleAuthChange}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {authMode === 'signup' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={authData.phone}
                                    onChange={handleAuthChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`grid ${authMode === 'signup' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <input 
                                    type="password" 
                                    name="password"
                                    value={authData.password}
                                    onChange={handleAuthChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        {authMode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm <span className="text-red-500">*</span></label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={authData.confirmPassword}
                                    onChange={handleAuthChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-[#EC4899] focus:border-[#EC4899]"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleAuthSubmit} 
                        disabled={isAuthenticating}
                        className="mt-6 w-full bg-[#EC4899] text-white font-bold py-3 rounded-lg shadow-lg shadow-pink-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAuthenticating && <Spinner className="w-5 h-5" />}
                        {authMode === 'login' ? 'Log In' : 'Create Account'}
                    </button>

                    <div className="text-center mt-4">
                        {authMode === 'login' ? (
                            <p className="text-sm text-gray-400">
                                Don't have an account? {' '}
                                <button onClick={() => setAuthMode('signup')} className="text-[#EC4899] font-bold hover:underline">Sign Up</button>
                            </p>
                        ) : (
                             <p className="text-sm text-gray-400">
                                Already have an account? {' '}
                                <button onClick={() => setAuthMode('login')} className="text-[#EC4899] font-bold hover:underline">Log In</button>
                            </p>
                        )}
                    </div>
                </div>
            ),
            action: null 
        },
        {
            id: 'welcome',
            icon: <HandWavingIcon className="w-12 h-12 text-[#EC4899]" />,
            title: `Welcome, ${user.name ? user.name.split(' ')[0] : 'Guest'}!`,
            description: "You've just unlocked access to Miami's most exclusive nightlife experiences. Let's take a quick tour.",
        },
        {
            id: 'promoter',
            icon: <PromotersIcon className="w-12 h-12 text-[#EC4899]" />,
            title: "Your Personal Wingman",
            description: "Connect with elite promoters for direct access to tables and guestlists.",
            customContent: (
                <div className="mt-6 w-full max-w-md mx-auto">
                    <p className="text-sm text-gray-400 mb-3">Select a promoter to get started (optional)</p>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                        {promoters.slice(0, 4).map(promoter => (
                            <button
                                key={promoter.id}
                                onClick={() => handlePromoterSelection(promoter.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                    selectedPromoterId === promoter.id 
                                    ? 'bg-[#EC4899]/20 border-[#EC4899]' 
                                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                }`}
                            >
                                <img src={promoter.profilePhoto} alt={promoter.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-grow">
                                    <p className="font-bold text-white text-sm">{promoter.name}</p>
                                    <div className="flex items-center gap-1">
                                        <StarIcon className="w-3 h-3 text-amber-400" />
                                        <span className="text-xs text-gray-400">{promoter.rating} • {promoter.city}</span>
                                    </div>
                                </div>
                                {selectedPromoterId === promoter.id && <div className="w-4 h-4 bg-[#EC4899] rounded-full"></div>}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => { handlePromoterSelection(null); goToNext(); }}
                        className="mt-4 text-sm text-gray-400 hover:text-white underline"
                    >
                        Skip for now
                    </button>
                </div>
            )
        },
        {
            id: 'profile',
            icon: <ProfileIcon className="w-12 h-12 text-[#EC4899]" />,
            title: "Build Your Profile",
            description: "Complete your profile to get personalized recommendations and faster approvals.",
            customContent: (
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl bg-gray-800 relative">
                            {user.profilePhoto && !user.profilePhoto.includes('seed') ? (
                                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                    {isUploading ? <Spinner className="w-8 h-8 text-[#EC4899]" /> : <ProfileIcon className="w-16 h-16" />}
                                </div>
                            )}
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <PencilIcon className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/png, image/jpeg" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-sm text-[#EC4899] font-bold hover:underline"
                        >
                            {user.profilePhoto && !user.profilePhoto.includes('seed') ? "Change Photo" : "Upload Photo"}
                        </button>
                    </div>
                </div>
            ),
            action: (
                <div
                    className="mt-6 bg-gray-800/50 border border-gray-700 text-gray-300 font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center gap-2 mx-auto cursor-default pointer-events-none"
                >
                    <TokenIcon className="w-6 h-6 text-[#EC4899]" />
                    <span>500 TMKC for Setting Up Profile</span>
                </div>
            )
        },
        {
            id: 'discover',
            icon: <SparkleIcon className="w-12 h-12 text-[#EC4899]" />,
            title: "Discover & Connect",
            description: "Browse events, book tables, and unlock exclusive experiences curated just for you.",
            visuals: (
                <div className="flex justify-center gap-8 mt-6 opacity-80">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-800 rounded-full"><PromotersIcon className="w-6 h-6 text-white" /></div>
                        <span className="text-xs font-semibold">Promoters</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-800 rounded-full"><BookIcon className="w-6 h-6 text-white" /></div>
                        <span className="text-xs font-semibold">Bookings</span>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-800 rounded-full"><SparkleIcon className="w-6 h-6 text-white" /></div>
                        <span className="text-xs font-semibold">Events</span>
                    </div>
                </div>
            )
        },
        {
            id: 'notifications',
            icon: <BellIcon className="w-12 h-12 text-[#EC4899]" />,
            title: "Don't Miss Out",
            description: "Enable notifications to stay updated on your bookings and exclusive invites.",
            action: (
                <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
                    <div className="flex items-center justify-between w-full bg-gray-900 border border-gray-700 p-4 rounded-xl">
                        <div className="text-left">
                            <p className="font-bold text-white text-sm">Push Notifications</p>
                            <p className="text-xs text-gray-400">
                                {isNotificationEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                        </div>
                        <ToggleSwitch 
                            checked={isNotificationEnabled} 
                            onChange={handleToggleNotification}
                            label="Enable Notifications"
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'reward',
            icon: <TokenIcon className="w-16 h-16 text-[#EC4899] animate-bounce" />,
            title: "You're All Set!",
            description: `As a welcome gift, we've added ${ONBOARDING_REWARD} TMKC tokens to your wallet. Enjoy!`,
            action: <button onClick={() => onFinish(true)} className="mt-8 bg-[#EC4899] text-white font-bold py-3 px-10 rounded-lg text-lg shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform">Start Exploring</button>
        },
    ];

    const goToNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const goToPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const activeStep = steps[currentStep];
    const isAuthStep = activeStep.id === 'auth';

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white font-sans">
            {/* Background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            {imageToCrop && (
                <ImageCropModal 
                    src={imageToCrop} 
                    onClose={() => setImageToCrop(null)} 
                    onCrop={handleCropComplete} 
                />
            )}

            <header className="relative flex-shrink-0 p-6 flex justify-between items-center z-10">
                <div className="flex gap-2">
                    {steps.map((_, index) => (
                        <div key={index} className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-[#EC4899]' : 'w-2 bg-gray-700'}`} />
                    ))}
                </div>
                {!isAuthStep && (
                    <button onClick={() => onFinish(false)} className="text-gray-400 font-semibold text-sm hover:text-white transition-colors">Skip</button>
                )}
            </header>
            
            <main className="relative flex-grow flex flex-col justify-center items-center text-center p-6 z-10 overflow-y-auto">
                <div className="w-full max-w-lg animate-fade-in-up">
                    <div className="w-24 h-24 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700 shadow-2xl shadow-[#EC4899]/10">
                        {activeStep.icon}
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-4">{activeStep.title}</h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">{activeStep.description}</p>
                    
                    {activeStep.visuals}
                    {activeStep.customContent}
                    
                    {activeStep.action && (
                        <div className="flex justify-center">
                            {activeStep.action}
                        </div>
                    )}
                </div>
            </main>

            <footer className="relative flex-shrink-0 p-6 flex justify-between items-center z-10 border-t border-gray-900/50">
                {currentStep > 0 && !isAuthStep ? (
                    <button onClick={goToPrev} className="flex items-center gap-2 text-gray-400 font-semibold hover:text-white transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" /> Back
                    </button>
                ) : <div />}
                
                {currentStep < steps.length - 1 && !isAuthStep && (
                     <button onClick={goToNext} className="flex items-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                        Next <ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}
            </footer>
        </div>
    );
};
