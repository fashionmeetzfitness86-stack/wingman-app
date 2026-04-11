


import React, { useMemo } from 'react';
import { Page, User, Booking, Venue, UserRole } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { KeyIcon } from './icons/KeyIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { FaInstagram } from './icons/FaInstagram';
import { FaTiktok } from './icons/FaTiktok';
import { AskGabyIcon } from './icons/AskGabyIcon';
import { PencilIcon } from './icons/PencilIcon';
import { WalletIcon } from './icons/FeatureIcons';
import { GroupIcon } from './icons/GroupIcon';
import { RouteIcon } from './icons/RouteIcon';
import { ChatIcon } from './icons/ChatIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { CreditCardIcon } from './icons/CreditCardIcon'; // Added import

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  currentUser: User;
  tokenBalance: number;
  bookingHistory: Booking[];
  favoriteVenueIds: number[];
  venues: Venue[];
  onViewVenueDetails: (venue: Venue) => void;
}

const calculateProfileCompleteness = (user: User): number => {
    let score = 0;
    const totalPoints = 12;

    if (user.name) score++;
    if (user.profilePhoto && !user.profilePhoto.includes('seed')) score++;
    if (user.bio && user.bio.length > 10) score++;
    if (user.city) score++;
    if (user.instagramHandle || user.tiktokHandle) score++;
    if (user.phoneNumber) score++;
    if (user.dob) score++;
    if (user.ethnicity) score++;
    if (user.appearance && (user.appearance.height || user.appearance.build)) score++;
    if (user.preferences && user.preferences.music.length > 0) score++;
    if (user.preferences && user.preferences.activities.length > 0) score++;
    if (user.galleryImages && user.galleryImages.length >= 3) score++;

    return Math.min(100, Math.round((score / totalPoints) * 100));
};

const ProfileSection: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden mb-6 shadow-sm transition-all hover:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
            <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">{title}</h3>
            {action}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const StatBox: React.FC<{ label: string; value: string | number; subtext?: string }> = ({ label, value, subtext }) => (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-4 text-center border border-gray-700/50 hover:border-gray-600 transition-colors">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1 font-semibold">{label}</p>
        {subtext && <p className="text-[10px] text-gray-500 mt-1">{subtext}</p>}
    </div>
);

const PreferenceTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        {children}
    </span>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, currentUser, tokenBalance, bookingHistory, favoriteVenueIds, venues, onViewVenueDetails }) => {
    
    const user = currentUser;
    if (!user) return null;
    
    const completeness = calculateProfileCompleteness(user);
    const userBookings = bookingHistory.filter(b => b.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    const favoriteVenues = venues.filter(v => favoriteVenueIds.includes(v.id)).slice(0, 3);
    
    const totalSpend = userBookings.length * 1500;
    const eventsAttended = userBookings.filter(b => b.status === 'Completed').length;

    const calculateAge = (dob: string | undefined): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    const age = calculateAge(user.dob);

    const getProgressColor = (percent: number) => {
        if (percent < 40) return 'bg-red-500';
        if (percent < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="animate-fade-in pb-4">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-gray-900 to-[#121212] border-b border-gray-800 pb-12 pt-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
                    
                    {/* Profile Photo & Edit */}
                    <div className="relative flex-shrink-0 group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 shadow-2xl">
                             <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-[#121212]" />
                        </div>
                        <button 
                            onClick={() => onNavigate('editProfile')} 
                            className="absolute bottom-1 right-1 bg-gray-800 p-2.5 rounded-full text-white hover:bg-gray-700 border-2 border-[#121212] transition-colors shadow-lg group-hover:scale-110"
                            aria-label="Edit profile"
                        >
                            <PencilIcon className="w-4 h-4 group-hover:text-amber-400" />
                        </button>
                    </div>
                    
                    {/* User Info & Completeness */}
                    <div className="flex-grow text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-700">
                                        <KeyIcon className="w-3 h-3 text-amber-400" />
                                        {user.accessLevel}
                                    </span>
                                    {user.city && (
                                        <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-gray-700">
                                            <LocationMarkerIcon className="w-3 h-3 text-blue-400" />
                                            {user.city}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Profile Strength Indicator */}
                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 min-w-[200px] backdrop-blur-sm shadow-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Profile Strength</span>
                                    <span className={`font-bold text-sm ${completeness === 100 ? 'text-green-400' : 'text-amber-400'}`}>{completeness}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out ${getProgressColor(completeness)}`} 
                                        style={{ width: `${completeness}%` }}
                                    ></div>
                                </div>
                                {completeness < 100 ? (
                                    <button onClick={() => onNavigate('editProfile')} className="text-[10px] text-amber-400 mt-2 hover:underline w-full text-right font-medium">
                                        Complete Profile &rarr;
                                    </button>
                                ) : (
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-green-400 font-bold">
                                        <CheckCircleIcon className="w-3 h-3" /> All Set
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                             {age && (
                                 <div className="flex items-center gap-2 bg-gray-800/30 px-3 py-1.5 rounded-lg border border-gray-700/50">
                                     <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                     <span>{age} years old</span>
                                 </div>
                             )}
                             {user.instagramHandle && (
                                <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-800/30 px-3 py-1.5 rounded-lg hover:text-pink-400 hover:bg-gray-800 transition-colors border border-gray-700/50 hover:border-pink-500/30">
                                    <FaInstagram className="w-4 h-4" />
                                    <span>@{user.instagramHandle}</span>
                                </a>
                             )}
                             {user.tiktokHandle && (
                                <a href={`https://tiktok.com/@${user.tiktokHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-800/30 px-3 py-1.5 rounded-lg hover:text-pink-400 hover:bg-gray-800 transition-colors border border-gray-700/50 hover:border-pink-500/30">
                                    <FaTiktok className="w-4 h-4" />
                                    <span>@{user.tiktokHandle}</span>
                                </a>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl mx-auto p-4 md:p-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8 -mt-12 relative z-10">
                    <StatBox label="Bookings" value={bookingHistory.length} subtext="Lifetime" />
                    <StatBox label="Events" value={eventsAttended} subtext="Attended" />
                    <StatBox label="Est. Spend" value={`$${(totalSpend/1000).toFixed(1)}k`} subtext="Total Value" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Personal Details */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        <ProfileSection title="About Me" action={<button onClick={() => onNavigate('editProfile')} className="text-gray-400 hover:text-white transition-colors"><PencilIcon className="w-4 h-4" /></button>}>
                             <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{user.bio || "Tell us about yourself to get better recommendations."}</p>
                        </ProfileSection>

                        {user.preferences && (
                            <ProfileSection title="Vibe & Preferences" action={<button onClick={() => onNavigate('editProfile')} className="text-gray-400 hover:text-white transition-colors"><PencilIcon className="w-4 h-4" /></button>}>
                                 <div className="space-y-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-3">My Vibe</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.preferences.personality && <PreferenceTag>{user.preferences.personality}</PreferenceTag>}
                                            {user.preferences.timeOfDay && <PreferenceTag>{user.preferences.timeOfDay}</PreferenceTag>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-3">Music</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.preferences.music.length > 0 ? user.preferences.music.map(m => <PreferenceTag key={m}>{m}</PreferenceTag>) : <span className="text-gray-500 text-sm italic">No music preferences selected.</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-3">Activities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.preferences.activities.length > 0 ? user.preferences.activities.map(a => <PreferenceTag key={a}>{a}</PreferenceTag>) : <span className="text-gray-500 text-sm italic">No activities selected.</span>}
                                        </div>
                                    </div>
                                 </div>
                            </ProfileSection>
                        )}
                        
                        {user.appearance && (
                             <ProfileSection title="Appearance" action={<button onClick={() => onNavigate('editProfile')} className="text-gray-400 hover:text-white transition-colors"><PencilIcon className="w-4 h-4" /></button>}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-800"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Height</p><p className="text-white font-medium">{user.appearance.height || '-'}</p></div>
                                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-800"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Build</p><p className="text-white font-medium">{user.appearance.build || '-'}</p></div>
                                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-800"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Hair</p><p className="text-white font-medium">{user.appearance.hairColor || '-'}</p></div>
                                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-800"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Eyes</p><p className="text-white font-medium">{user.appearance.eyeColor || '-'}</p></div>
                                </div>
                             </ProfileSection>
                        )}

                        <ProfileSection title="Gallery" action={<button onClick={() => onNavigate('editProfile')} className="text-amber-400 text-xs font-bold hover:underline">Manage Photos</button>}>
                             {user.galleryImages && user.galleryImages.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {user.galleryImages.map((img, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700 group cursor-pointer">
                                            <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                                    <p className="text-gray-500 text-sm">Add photos to complete your profile.</p>
                                </div>
                            )}
                        </ProfileSection>
                    </div>

                    {/* Right Column: Activity & Menu */}
                    <div className="space-y-8">
                        
                        {/* Recent Activity */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Recent Activity</h3>
                                <button onClick={() => onNavigate('bookings')} className="text-amber-400 text-xs font-bold hover:underline">View All</button>
                            </div>
                             <div className="p-4 space-y-3">
                                {userBookings.length > 0 ? userBookings.map(booking => (
                                    <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-800/40 rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors">
                                        <div>
                                            <p className="font-bold text-white text-sm">{booking.venueName}</p>
                                            <p className="text-xs text-gray-400">{booking.date}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${booking.status === 'Confirmed' ? 'bg-blue-900/50 text-blue-300 border border-blue-800' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}>{booking.status}</span>
                                    </div>
                                )) : <p className="text-gray-500 text-sm text-center py-4">No recent bookings.</p>}
                            </div>
                        </div>
                        
                        {/* Favorites */}
                         <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Favorites</h3>
                                <button onClick={() => onNavigate('favorites')} className="text-amber-400 text-xs font-bold hover:underline">View All</button>
                            </div>
                            <div className="p-4 space-y-3">
                                {favoriteVenues.length > 0 ? favoriteVenues.map(venue => (
                                    <button key={venue.id} onClick={() => onViewVenueDetails(venue)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors border border-transparent hover:border-gray-800">
                                        <img src={venue.coverImage} alt={venue.name} className="w-12 h-12 rounded-md object-cover" />
                                        <div className="text-left flex-grow min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{venue.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{venue.location}</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                                    </button>
                                )) : <p className="text-gray-500 text-sm text-center py-4">No favorites yet.</p>}
                            </div>
                        </div>

                        {/* Quick Links Menu */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                             <button onClick={() => onNavigate('tokenWallet')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-amber-400"><WalletIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">My Wallet</span>
                                <span className="text-gray-400 text-xs font-mono mr-2">{tokenBalance.toLocaleString()} TMKC</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                             {currentUser.role === UserRole.PROMOTER && (
                                <button onClick={() => onNavigate('promoterDashboard')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                    <div className="p-2 bg-gray-800 rounded-full text-purple-400"><ChartPieIcon className="w-4 h-4" /></div>
                                    <span className="text-white text-sm font-bold flex-grow text-left">Promoter Dashboard</span>
                                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                            <button onClick={() => onNavigate('accessGroups')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-blue-400"><GroupIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Access Groups</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => onNavigate('invitations')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-green-400"><UserPlusIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Invitations</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => onNavigate('myItineraries')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-purple-400"><RouteIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Itineraries</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            {user.role === UserRole.PROMOTER && (
                                 <button onClick={() => onNavigate('promoterStats')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                    <div className="p-2 bg-gray-800 rounded-full text-pink-400"><ChartBarIcon className="w-4 h-4" /></div>
                                    <span className="text-white text-sm font-bold flex-grow text-left">Promoter Stats</span>
                                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                            <button onClick={() => onNavigate('eventChatsList')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-indigo-400"><ChatIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Chats</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => onNavigate('paymentMethods')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-green-400"><CreditCardIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Payment Methods</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                             <button onClick={() => onNavigate('settings')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-gray-400"><SettingsIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Settings</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => onNavigate('chatbot')} className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-full text-amber-400"><AskGabyIcon className="w-4 h-4" /></div>
                                <span className="text-white text-sm font-bold flex-grow text-left">Ask Gaby</span>
                                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        
                        {currentUser.role === UserRole.USER && (
                            <div className="text-center pt-4">
                                <button 
                                    onClick={() => onNavigate('promoterApplication')}
                                    className="text-xs text-gray-500 hover:text-amber-400 hover:underline transition-colors"
                                >
                                    Apply to be a Promoter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
