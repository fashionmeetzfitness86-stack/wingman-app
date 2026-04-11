
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Venue, User, UserRole, Promoter, UserAccessLevel, GuestlistJoinRequest } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PlayIcon } from './icons/PlayIcon';
import { Spinner } from './icons/Spinner';
import { StarIcon } from './icons/StarIcon';
import { QrIcon } from './icons/QrIcon';
import { QrScanner } from './QrScanner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { FavoriteConfirmationModal } from './modals/FavoriteConfirmationModal';

interface VenueDetailsPageProps {
  venue: Venue;
  onBack: () => void;
  onBookVenue: (venue: Venue) => void;
  isFavorite: boolean;
  onToggleFavorite: (venueId: number) => void;
  currentUser: User;
  onUpdateVenue: (venue: Venue) => void;
  promoters: Promoter[];
  onBookWithSpecificPromoter: (promoter: Promoter, venue: Venue) => void;
  onJoinGuestlist: (promoter: Promoter, venue: Venue) => void;
  guestlistJoinRequests: GuestlistJoinRequest[];
  onCheckIn: (venueId: number, qrData: string) => void;
}

const DetailChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
        <div className="text-amber-400">{icon}</div>
        <span className="text-white font-semibold">{label}</span>
    </div>
);

export const VenueDetailsPage: React.FC<VenueDetailsPageProps> = ({ venue, onBack, onBookVenue, isFavorite, onToggleFavorite, currentUser, onUpdateVenue, promoters, onBookWithSpecificPromoter, onJoinGuestlist, guestlistJoinRequests, onCheckIn }) => {
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isApprovedGirl = currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL;
  const showBottomNav = (currentUser.role === UserRole.USER || currentUser.role === UserRole.ADMIN);
  
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = WEEKDAYS[new Date().getDay()];
  const isOpenToday = venue.operatingDays.includes(dayOfWeek);
  
  const assignedPromoters = promoters.filter(p => p.assignedVenueIds.includes(venue.id));
  
  const activeGuestlistRequest = useMemo(() => {
    if (!isApprovedGirl) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayIndex = today.getDay();
    let daysToAdd = 0;
    let foundDay = false;

    for (let i = 0; i < 7; i++) {
        const dayToCheck = WEEKDAYS[(todayIndex + i) % 7];
        if (venue.operatingDays.includes(dayToCheck)) {
            daysToAdd = i;
            foundDay = true;
            break;
        }
    }
    
    if (!foundDay) return null;

    const nextOpenDate = new Date(today);
    nextOpenDate.setDate(today.getDate() + daysToAdd);
    const dateString = nextOpenDate.toISOString().split('T')[0];

    return guestlistJoinRequests.find(req => 
      req.userId === currentUser.id && 
      req.venueId === venue.id && 
      req.date === dateString
    );
  }, [guestlistJoinRequests, currentUser.id, venue.id, venue.operatingDays, isApprovedGirl]);

  const hasApprovedGuestlist = activeGuestlistRequest?.status === 'approved';
  const isCheckedIn = activeGuestlistRequest?.attendanceStatus === 'show';

  const videoLoadingMessages = [
    "Our AI director is setting up the scene...",
    "Shooting the perfect angles of the venue...",
    "Editing the footage... this can take a few minutes.",
    "Applying final color grading and effects...",
    "Almost ready to premiere!",
  ];

  const handleGenerateImage = async () => {
      setIsImageGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `A professional, high-resolution photograph of a luxurious ${venue.category} in ${venue.location} called "${venue.name}". The vibe is ${venue.vibe} and they play ${venue.musicType} music. The image should be vibrant and show the main area of the venue.`;
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: prompt }] },
              config: { responseModalities: [Modality.IMAGE] },
          });

          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
              onUpdateVenue({...venue, coverImage: imageUrl});
              break;
            }
          }
      } catch (error) {
          console.error("Error generating image:", error);
          alert("Failed to generate image. Please check the console for details.");
      } finally {
          setIsImageGenerating(false);
      }
  };

  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    let messageIndex = 0;
    setVideoLoadingMessage(videoLoadingMessages[messageIndex]);
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
        setVideoLoadingMessage(videoLoadingMessages[messageIndex]);
    }, 8000);

    try {
        await window.aistudio.hasSelectedApiKey() || await window.aistudio.openSelectKey();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `A 5-second, high-energy video tour of "${venue.name}", a ${venue.vibe} nightclub in ${venue.location}. Show dynamic shots of the dance floor, luxury VIP tables, and stylish crowd. Music type is ${venue.musicType}. Cinematic, professional quality.`;

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9',
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        clearInterval(messageInterval);

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            setVideoLoadingMessage("Downloading video...");
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const videoBlob = await response.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            onUpdateVenue({ ...venue, videoTourUrl: videoUrl });
        } else {
            throw new Error("Video generation completed but no download link was provided.");
        }

    } catch (error: any) {
        console.error("Error generating video:", error);
        if (error.message?.includes("Requested entity was not found")) {
            await window.aistudio.openSelectKey();
        }
        alert("Failed to generate video. Please check the console for details.");
        clearInterval(messageInterval);
    } finally {
        setIsVideoGenerating(false);
    }
  };

  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    onCheckIn(venue.id, data);
  };
  
  const handleFavoriteClick = () => {
    if (isFavorite) {
        setIsFavoriteModalOpen(true);
    } else {
        onToggleFavorite(venue.id);
    }
  };

  const confirmFavorite = () => {
    onToggleFavorite(venue.id);
    setIsFavoriteModalOpen(false);
  };

  return (
    <>
    {isVideoGenerating && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-center p-8">
            <Spinner className="w-16 h-16 text-amber-400" />
            <h2 className="text-2xl font-bold text-white mt-6">Generating Video Tour...</h2>
            <p className="text-gray-300 mt-2 max-w-sm">{videoLoadingMessage}</p>
        </div>
    )}
    {isScannerOpen && (
      <QrScanner onClose={() => setIsScannerOpen(false)} onScan={handleScan} />
    )}
    <div className={`animate-fade-in ${showBottomNav ? 'pb-44' : 'pb-24'}`}>
      <div className="relative">
        {showVideo && venue.videoTourUrl ? (
            <video
                src={venue.videoTourUrl}
                controls
                autoPlay
                className="w-full h-80 object-cover"
                onEnded={() => setShowVideo(false)}
            />
        ) : venue.coverImage ? (
            <img src={venue.coverImage} alt={venue.name} className="w-full h-80 object-cover" />
        ) : (
            <div className="w-full h-80 bg-gray-900 flex flex-col items-center justify-center text-center p-4 border-b border-gray-800">
                <SparkleIcon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold text-white">Showcase This Venue</h3>
                <p className="text-gray-400 mt-2 max-w-sm">
                    This venue is missing a cover image. As an admin, you can generate a stunning, AI-powered image based on its details.
                </p>
                {isAdmin && (
                    <button onClick={handleGenerateImage} disabled={isImageGenerating} className="mt-6 flex items-center gap-2 bg-amber-400 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors disabled:bg-gray-500">
                        {isImageGenerating ? <Spinner className="w-5 h-5"/> : <SparkleIcon className="w-5 h-5" />}
                        <span>Generate Cover Image</span>
                    </button>
                )}
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none"></div>

        {venue.coverImage && venue.videoTourUrl && !showVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={() => setShowVideo(true)} className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110" aria-label="Play video tour">
                    <PlayIcon className="w-10 h-10" />
                </button>
            </div>
        )}

        {isAdmin && venue.coverImage && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                 <button onClick={handleGenerateImage} disabled={isImageGenerating} className="flex items-center gap-2 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-black/80 transition-colors disabled:bg-gray-500">
                    {isImageGenerating ? <Spinner className="w-4 h-4"/> : <SparkleIcon className="w-4 h-4 text-amber-400" />}
                    <span>Regenerate Cover</span>
                </button>
                 <button onClick={handleGenerateVideo} disabled={isVideoGenerating} className="flex items-center gap-2 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-black/80 transition-colors disabled:bg-gray-500">
                    {isVideoGenerating ? <Spinner className="w-4 h-4"/> : <PlayIcon className="w-4 h-4 text-amber-400" />}
                    <span>Generate Video</span>
                </button>
            </div>
        )}

        <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center gap-4">
                <h1 className="text-4xl font-extrabold text-white">{venue.name}</h1>
                <button
                    onClick={handleFavoriteClick}
                    className="p-3 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label={isFavorite ? `Remove ${venue.name} from favorites` : `Add ${venue.name} to favorites`}
                >
                    <HeartIcon className="w-6 h-6" isFilled={isFavorite} />
                </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                {venue.averageRating && venue.totalReviews && (
                    <DetailChip icon={<StarIcon className="w-5 h-5" />} label={`${venue.averageRating} (${venue.totalReviews} reviews)`} />
                )}
                <DetailChip icon={<LocationMarkerIcon className="w-5 h-5" />} label={venue.location} />
                <DetailChip icon={<MusicNoteIcon className="w-5 h-5" />} label={venue.musicType} />
                <DetailChip icon={<SparkleIcon className="w-5 h-5" />} label={venue.vibe} />
                {venue.capacity && (
                    <DetailChip icon={<UsersIcon className="w-5 h-5" />} label={`${venue.capacity.toLocaleString()} Capacity`} />
                )}
            </div>
        </div>
      </div>
      
      <div className="p-6">
        {isCheckedIn && (
            <div className="w-full flex items-center justify-center gap-3 bg-green-500/20 text-green-400 font-bold py-3 px-6 rounded-lg mb-8 border border-green-500/50">
                <CheckCircleIcon className="w-6 h-6" />
                Checked In
            </div>
        )}
        {hasApprovedGuestlist && !isCheckedIn && (
            <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full flex items-center justify-center gap-3 bg-white text-blue-600 font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white mb-8 shadow-lg"
                aria-label={`Check-in at ${venue.name}`}
            >
                <QrIcon className="w-6 h-6" />
                Check-in at {venue.name}
            </button>
        )}
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Operating Hours
            </h2>
            <div className="flex flex-wrap gap-2">
                {venue.operatingDays.map(day => (
                    <div key={day} className={`font-semibold px-3 py-1.5 rounded-md text-sm ${day === dayOfWeek ? 'bg-amber-400 text-black' : 'bg-gray-800 text-white'}`}>
                        {day}
                    </div>
                ))}
            </div>
            {isOpenToday ? (
                <p className="flex items-center gap-2 mt-3 text-sm text-green-400 font-semibold">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>
                    Open Today
                </p>
            ) : (
                <p className="flex items-center gap-2 mt-3 text-sm text-red-400 font-semibold">
                    <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                    Closed Today
                </p>
            )}
             <p className="text-xs text-gray-500 mt-3">
                Operating times may vary. Please contact your promoter for specific hours.
            </p>
        </div>

        {venue.amenities && venue.amenities.length > 0 && (
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                    {venue.amenities.map(amenity => (
                        <div key={amenity} className="bg-gray-800 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-full">
                            {amenity}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {isApprovedGirl ? (
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Join a Promoter's Guestlist</h2>
                {assignedPromoters.length > 0 ? (
                    <div className="space-y-3">
                        {assignedPromoters.map(promoter => {
                            const request = guestlistJoinRequests.find(req => req.userId === currentUser.id && req.promoterId === promoter.id && req.venueId === venue.id);
                            const status = request?.status;

                            return (
                                <div key={promoter.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                                    <img src={promoter.profilePhoto} alt={promoter.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{promoter.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-gray-400">{promoter.handle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onJoinGuestlist(promoter, venue)}
                                        disabled={!!status}
                                        className={`font-bold py-2 px-4 rounded-lg text-sm transition-transform hover:scale-105 w-32 text-center ${
                                            status === 'approved' ? 'bg-green-600 text-white cursor-default'
                                            : status === 'pending' ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#EC4899] text-white'
                                        }`}
                                        aria-label={`Join ${promoter.name}'s guestlist`}
                                    >
                                        {status === 'approved' ? 'Approved' : status === 'pending' ? 'Request Sent' : 'Join Guestlist'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                     <p className="text-gray-500 text-center">No promoters available for guestlist at this venue.</p>
                )}
            </div>
        ) : (
            assignedPromoters.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Book with a Promoter</h2>
                    <div className="space-y-3">
                        {assignedPromoters.map(promoter => (
                            <div key={promoter.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                                <img src={promoter.profilePhoto} alt={promoter.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-grow">
                                    <p className="font-bold text-white">{promoter.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-400">{promoter.handle}</p>
                                        <div className="flex items-center gap-1">
                                            <StarIcon className="w-3 h-3 text-amber-400" />
                                            <span className="text-white font-semibold text-xs">{promoter.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onBookWithSpecificPromoter(promoter, venue)}
                                    className="bg-[#EC4899] text-white font-bold py-2 px-4 rounded-lg text-sm transition-transform hover:scale-105 hover:bg-[#d8428a] w-32 text-center"
                                    aria-label={`Book with ${promoter.name}`}
                                >
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        )}
        
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4">Table Options</h2>
            {venue.tableOptions && venue.tableOptions.length > 0 ? (
                <div className="space-y-3">
                    {venue.tableOptions.map(table => (
                        <button 
                            key={table.id} 
                            onClick={() => onBookVenue(venue)}
                            className="w-full text-left bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-amber-400/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white">{table.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{table.description}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-semibold text-amber-400">${table.minSpend.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Min Spend</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No specific table options available. Contact a promoter to book.</p>
            )}
        </div>
      </div>
      
       <div className={`fixed inset-x-0 ${showBottomNav ? 'bottom-20' : 'bottom-0'} bg-black/80 backdrop-blur-lg border-t border-gray-800 p-4 z-30`}>
            <div className="container mx-auto max-w-5xl text-center">
                <button onClick={() => onBookVenue(venue)} className="w-full bg-[#EC4899] text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EC4899] hover:bg-[#d8428a]" aria-label={`Book now at ${venue.name}`}>
                    Book Now
                </button>
                 {isApprovedGirl && hasApprovedGuestlist && !isCheckedIn && (
                    <p className="text-xs text-gray-400 mt-2">Don't forget to check in when you arrive!</p>
                )}
            </div>
        </div>
        <FavoriteConfirmationModal 
            isOpen={isFavoriteModalOpen}
            onClose={() => setIsFavoriteModalOpen(false)}
            onConfirm={confirmFavorite}
            entityName={venue.name}
            entityType="Venue"
            action={isFavorite ? 'remove' : 'add'}
        />
    </div>
    </>
  );
};
