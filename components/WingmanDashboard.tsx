import React, { useState, useMemo, useRef } from 'react';
import { Wingman, Page, User, Venue, Event, InstanceBooking, WingmanRequest, FriendZoneChat, FriendZoneChatMessage, GuestlistChat, GuestlistChatMessage } from '../types';
import { generateEventFeed } from '../utils/eventSchedule';

interface WingmanDashboardProps {
  wingman: Wingman;
  wingmanUser: User;
  currentUser: User;
  onNavigate: (page: Page, params?: any) => void;
  onUpdateUser: (user: User) => void;
  onUpdateWingman: (wingman: Wingman) => void;
  wingmanRequests: WingmanRequest[];
  setWingmanRequests: React.Dispatch<React.SetStateAction<WingmanRequest[]>>;
  instanceBookings: InstanceBooking[];
  setInstanceBookings: React.Dispatch<React.SetStateAction<InstanceBooking[]>>;
  users: User[];
  venues: Venue[];
  events: Event[];
  bookedMap: Record<string, number>;
  cancelMap: Record<string, boolean>;
  forceSoldOutMap: Record<string, boolean>;
  customArrivalMap: Record<string, string>;
  customInstanceMap: Record<string, Partial<any>>;
  friendZoneChats: FriendZoneChat[];
  friendZoneChatMessages: FriendZoneChatMessage[];
  guestlistChats: GuestlistChat[];
  guestlistChatMessages: GuestlistChatMessage[];
  onSendFriendZoneMessage: (chatId: number, text: string) => void;
  onSendGuestlistMessage: (chatId: number, text: string) => void;
  onStartDirectChat: (userId: number, wingmanId: number) => void;
  onViewUser: (user: User) => void;
  isViewedByAdmin: boolean;
}

export const WingmanDashboard: React.FC<WingmanDashboardProps> = ({
  wingman,
  wingmanUser,
  currentUser,
  onNavigate,
  onUpdateUser,
  onUpdateWingman,
  wingmanRequests,
  setWingmanRequests,
  instanceBookings,
  setInstanceBookings,
  users,
  venues,
  events,
  bookedMap,
  cancelMap,
  forceSoldOutMap,
  customArrivalMap,
  customInstanceMap,
  friendZoneChats,
  friendZoneChatMessages,
  guestlistChats,
  guestlistChatMessages,
  onSendFriendZoneMessage,
  onSendGuestlistMessage,
  onStartDirectChat,
  onViewUser,
  isViewedByAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'attendees' | 'requests' | 'chats' | 'profile'>('overview');
  
  // Chat state
  const [selectedChat, setSelectedChat] = useState<{ type: 'direct' | 'guestlist'; id: number } | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Profile Form state
  const [bio, setBio] = useState(wingman.bio);
  const [handle, setHandle] = useState(wingman.handle);
  const [profilePhoto, setProfilePhoto] = useState(wingman.profilePhoto);
  const [city, setCity] = useState(wingman.city || 'Miami');
  const [selectedVenues, setSelectedVenues] = useState<number[]>(wingman.assignedVenueIds || []);
  const [availability, setAvailability] = useState<string>(
    wingman.weeklySchedule?.map(s => `${s.day}: ${venues.find(v => v.id === s.venueId)?.name || s.venueId}`).join(', ') || ''
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setProfilePhoto(dataUrl);
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Generate event occurrences for the next 4 weeks
  const allInstances = useMemo(() => {
    return generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, events, true);
  }, [bookedMap, cancelMap, forceSoldOutMap, customArrivalMap, customInstanceMap, events]);

  // Filter instances hosted by this wingman
  const myInstances = useMemo(() => {
    return allInstances.filter(inst => inst.wingmanId === wingman.id || inst.hostId === wingman.id);
  }, [allInstances, wingman.id]);

  // Filter bookings associated with this wingman's hosted instances
  const myBookings = useMemo(() => {
    const instIds = new Set(myInstances.map(i => i.instanceId));
    return instanceBookings.filter(booking => 
      booking.wingmanId === wingman.id || booking.hostId === wingman.id || instIds.has(booking.instanceId)
    );
  }, [instanceBookings, myInstances, wingman.id]);

  // Filter requests for this wingman
  const myRequests = useMemo(() => {
    return wingmanRequests.filter(r => r.wingmanId === wingman.id);
  }, [wingmanRequests, wingman.id]);

  // Chats list where this wingman is a participant
  const myFriendZoneChats = useMemo(() => {
    return friendZoneChats.filter(c => 
      (c.wingmanIds && c.wingmanIds.includes(wingman.id)) || 
      c.memberIds.includes(wingman.id)
    );
  }, [friendZoneChats, wingman.id]);

  const myGuestlistChats = useMemo(() => {
    return guestlistChats.filter(c => c.wingmanId === wingman.id);
  }, [guestlistChats, wingman.id]);

  const activeRequestsCount = myRequests.filter(r => r.status === 'pending').length;

  // Stats Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayInstances = myInstances.filter(i => i.date === todayStr);
  const upcomingInstances = myInstances.filter(i => i.date >= todayStr);
  const totalGuests = myBookings.reduce((sum, b) => sum + b.partySize, 0);
  const confirmedBookingsCount = myBookings.length;
  const estimatedRevenue = myBookings.reduce((sum, b) => sum + b.totalPaid, 0);

  const handleRequestStatus = (id: number, status: 'accepted' | 'declined' | 'completed') => {
    setWingmanRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleToggleCheckIn = (bookingId: string) => {
    setInstanceBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedIn: !b.checkedIn } : b));
  };

  const handleSendMessage = () => {
    if (!selectedChat || !chatInput.trim()) return;
    if (selectedChat.type === 'direct') {
      onSendFriendZoneMessage(selectedChat.id, chatInput.trim());
    } else {
      onSendGuestlistMessage(selectedChat.id, chatInput.trim());
    }
    setChatInput('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWingman: Wingman = {
      ...wingman,
      bio,
      handle,
      profilePhoto,
      city,
      assignedVenueIds: selectedVenues,
    };
    onUpdateWingman(updatedWingman);
    
    const updatedUser: User = {
      ...wingmanUser,
      profilePhoto,
      bio,
      city,
    };
    onUpdateUser(updatedUser);

    // Persist changes to Supabase so they sync cross-device (same as EditProfilePage).
    // Fire-and-forget — never blocks the UI.
    void (async () => {
      try {
        const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
        const token = session?.access_token;
        void fetch('/.netlify/functions/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            id: String(wingmanUser.id),
            name: wingmanUser.name,
            email: wingmanUser.email,
            phone: wingmanUser.phoneNumber,
            city,
            profilePhoto: profilePhoto.startsWith('data:') ? undefined : profilePhoto,
          }),
        }).catch(() => null);
      } catch { /* silent — local state already updated */ }
    })();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Admin Oversight Mode Banner */}
      {isViewedByAdmin && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 px-6 py-3 border-b border-purple-500/30 flex justify-between items-center text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <p className="font-bold text-purple-200">
              Oversight Mode: Viewing Wingman dashboard for <span className="underline text-white font-extrabold">{wingman.name}</span>
            </p>
          </div>
          <button 
            onClick={() => onNavigate('adminDashboard')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-4 rounded border border-white/25 transition-all text-xs active:scale-[0.98]"
          >
            Return to Admin Dashboard
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Profile header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <img 
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/50 shadow-md shadow-orange-500/20" 
              src={wingman.profilePhoto || 'https://i.pravatar.cc/150'} 
              alt={wingman.name} 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">{wingman.name}</h1>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Wingman Host
                </span>
              </div>
              <p className="text-gray-400 text-sm">{wingman.handle}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-bold uppercase">Rating</p>
              <p className="text-lg font-black text-amber-400">★ {wingman.rating.toFixed(1)}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-bold uppercase">Today</p>
              <p className="text-lg font-black text-white">{todayInstances.length} Hosted</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'events', label: 'My Hosted Events', icon: '🎪' },
            { id: 'attendees', label: 'Attendees', icon: '👥' },
            { id: 'requests', label: 'Wingman Requests', icon: '🎟️', badge: activeRequestsCount },
            { id: 'chats', label: 'Chats', icon: '💬' },
            { id: 'profile', label: 'Profile Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-orange-400 border-orange-500 bg-white/[0.02]'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-orange-500 text-black text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Today's Experiences</p>
                <p className="text-2xl font-black mt-2 text-white">{todayInstances.length}</p>
                <p className="text-xs text-gray-400 mt-1">{todayInstances.map(i => i.venue).join(', ') || 'None scheduled'}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Upcoming Bookings</p>
                <p className="text-2xl font-black mt-2 text-white">{confirmedBookingsCount}</p>
                <p className="text-xs text-gray-400 mt-1">Across all occurrences</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Total Attending</p>
                <p className="text-2xl font-black mt-2 text-orange-400">{totalGuests}</p>
                <p className="text-xs text-gray-400 mt-1">Guests & Clients</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Estimated Revenue</p>
                <p className="text-2xl font-black mt-2 text-green-400">${estimatedRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">From booking fees</p>
              </div>
            </div>

            {/* Today's schedule section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Today's Operating Details</h2>
                {todayInstances.length === 0 ? (
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    No events scheduled for today. Spend some time reviewing upcoming bookings or answering chats.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayInstances.map(inst => {
                      const instBookings = myBookings.filter(b => b.instanceId === inst.instanceId);
                      const totalInstGuests = instBookings.reduce((sum, b) => sum + b.partySize, 0);
                      return (
                        <div key={inst.instanceId} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-white">{inst.title}</h3>
                              <p className="text-xs text-orange-400 font-bold mt-1">📍 {inst.venue} • meetup {inst.arrivalTime || inst.time}</p>
                            </div>
                            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full font-bold">
                              {inst.experienceType}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 text-center">
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Meetup Arrival</p>
                              <p className="text-sm font-semibold text-white mt-1">{inst.arrivalTime || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Spots Booked</p>
                              <p className="text-sm font-semibold text-white mt-1">{inst.spotsBooked} / {inst.totalCapacity}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase font-black">Attending Guests</p>
                              <p className="text-sm font-black text-orange-400 mt-1">{totalInstGuests}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Quick checklist */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white">Daily Checklist</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-400">✓</span>
                    <span>Check arrival/meetup details for tonight's venues.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-400">✓</span>
                    <span>Review pending wingman requests ({activeRequestsCount} waiting).</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-400">✓</span>
                    <span>Check direct chats and reply to queries.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-400">✓</span>
                    <span>Prepare check-in sheets for events.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY HOSTED EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Hosted Event Occurrences</h2>
              <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">4-Week Projection</span>
            </div>

            {myInstances.length === 0 ? (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
                You have no hosted events scheduled. Check with the administrator to request assignment.
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#0F1014] border border-white/5 rounded-xl">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs uppercase bg-white/[0.03] text-gray-400">
                    <tr>
                      <th className="px-6 py-3.5">Event Name</th>
                      <th className="px-6 py-3.5">Venue</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Meetup Time</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Booked Spots</th>
                      <th className="px-6 py-3.5">Remaining</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myInstances.map(inst => {
                      const remaining = inst.totalCapacity - inst.spotsBooked;
                      return (
                        <tr key={inst.instanceId} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{inst.title}</td>
                          <td className="px-6 py-4 text-gray-300">{inst.venue}</td>
                          <td className="px-6 py-4 text-xs font-semibold">{inst.date}</td>
                          <td className="px-6 py-4 text-gray-400">{inst.arrivalTime || inst.time}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded">
                              {inst.experienceType}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">{inst.spotsBooked} / {inst.totalCapacity}</td>
                          <td className="px-6 py-4 font-semibold text-orange-400">{remaining}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                              inst.status === 'available' ? 'bg-green-950 text-green-400 border border-green-800' :
                              inst.status === 'limited' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                              inst.status === 'sold-out' ? 'bg-red-950 text-red-400 border border-red-800' :
                              'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>
                              {inst.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. ATTENDEES TAB */}
        {activeTab === 'attendees' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">Attendees & Guests Check-in</h2>

            {myInstances.length === 0 ? (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
                No hosted occurrences scheduled.
              </div>
            ) : (
              <div className="space-y-8">
                {myInstances.map(inst => {
                  const instBookings = myBookings.filter(b => b.instanceId === inst.instanceId);
                  
                  return (
                    <div key={inst.instanceId} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
                        <div>
                          <h3 className="text-lg font-black text-white">{inst.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">📅 {inst.date} • 📍 {inst.venue} • meetup {inst.arrivalTime || inst.time}</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-1.5 text-center">
                          <span className="text-xs text-gray-500 font-bold uppercase mr-2">Booked Guests:</span>
                          <span className="text-sm font-black text-orange-400">
                            {instBookings.reduce((sum, b) => sum + b.partySize, 0)}
                          </span>
                        </div>
                      </div>

                      {instBookings.length === 0 ? (
                        <p className="text-center py-6 text-gray-500 text-sm">No clients booked for this occurrence yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-300">
                            <thead className="text-xs uppercase bg-white/[0.02] text-gray-500">
                              <tr>
                                <th className="px-4 py-3">Guest Name</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Party Size</th>
                                <th className="px-4 py-3">Booking Date</th>
                                <th className="px-4 py-3">Special Requests</th>
                                <th className="px-4 py-3 text-right">Check-in Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {instBookings.map(booking => {
                                return (
                                  <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-4 py-4 font-bold text-white">{booking.guestName}</td>
                                    <td className="px-4 py-4">
                                      <p className="text-xs text-gray-400">{booking.guestEmail}</p>
                                      {booking.guestEmail && (
                                        <p className="text-[10px] text-gray-500">
                                          {users.find(u => u.email === booking.guestEmail)?.phoneNumber || 'No phone'}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 font-bold">{booking.partySize}</td>
                                    <td className="px-4 py-4 text-xs text-gray-400">
                                      {new Date(booking.bookedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-400 max-w-xs truncate" title={booking.specialRequests}>
                                      {booking.specialRequests || '—'}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <button
                                        onClick={() => handleToggleCheckIn(booking.id)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                          booking.checkedIn
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-orange-500 text-black border-transparent hover:bg-orange-400 active:scale-[0.98]'
                                        }`}
                                      >
                                        {booking.checkedIn ? '✓ Attended' : 'Mark Attended'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. WINGMAN REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold">Incoming Wingman Book Requests</h2>
            <p className="text-sm text-gray-400">These members explicitly requested you to host them for their experience bookings.</p>

            {myRequests.length === 0 ? (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
                No requests found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myRequests.map(req => (
                  <div key={req.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-base">{req.userName}</h3>
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${
                            req.status === 'pending' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                            req.status === 'accepted' ? 'bg-green-950 text-green-400 border border-green-800' :
                            req.status === 'completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                            'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{req.userEmail} • {req.userPhone || 'No phone'}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase">Requested date</p>
                        <p className="text-sm font-semibold text-orange-400 mt-0.5">{req.dateRequested}</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Title</p>
                      <p className="text-sm font-bold text-white">{req.experienceTitle}</p>
                      {req.message && (
                        <div className="pt-2 border-t border-white/5 mt-2">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message from Guest</p>
                          <p className="text-xs text-gray-300 italic">"{req.message}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2">
                      <button
                        onClick={() => onStartDirectChat(req.userId, wingman.id)}
                        className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all active:scale-[0.98]"
                      >
                        💬 Message User
                      </button>
                      
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'accepted')}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all active:scale-[0.98]"
                          >
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'declined')}
                            className="bg-red-900/50 hover:bg-red-900 text-red-400 font-bold py-2 px-4 rounded-lg text-xs border border-red-500/20 transition-all active:scale-[0.98]"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleRequestStatus(req.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all active:scale-[0.98]"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 bg-[#0F1014] border border-white/5 rounded-2xl overflow-hidden min-h-[500px] animate-fade-in">
            {/* Sidebar list */}
            <div className="border-r border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-base text-white">Active Channels</h3>
                <p className="text-xs text-gray-500 mt-1">Communicate with booking clients</p>
              </div>
              
              <div className="flex-grow overflow-y-auto divide-y divide-white/5">
                {/* Guestlist group chats */}
                {myGuestlistChats.map(c => {
                  const venue = venues.find(v => v.id === c.venueId);
                  const isActive = selectedChat?.type === 'guestlist' && selectedChat?.id === c.id;
                  return (
                    <div
                      key={`gl-${c.id}`}
                      onClick={() => setSelectedChat({ type: 'guestlist', id: c.id })}
                      className={`p-4 cursor-pointer transition-colors text-left ${isActive ? 'bg-orange-500/10' : 'hover:bg-white/[0.01]'}`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-white">🎟️ {venue?.name || 'Guestlist Group'}</p>
                        <span className="text-[10px] text-gray-500">{c.date}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">Group Chat Room ({c.memberIds.length} members)</p>
                    </div>
                  );
                })}

                {/* Direct chats */}
                {myFriendZoneChats.map(c => {
                  const otherUser = users.find(u => c.memberIds.includes(u.id) && u.id !== wingman.id);
                  const isActive = selectedChat?.type === 'direct' && selectedChat?.id === c.id;
                  return (
                    <div
                      key={`dm-${c.id}`}
                      onClick={() => setSelectedChat({ type: 'direct', id: c.id })}
                      className={`p-4 cursor-pointer transition-colors text-left ${isActive ? 'bg-orange-500/10' : 'hover:bg-white/[0.01]'}`}
                    >
                      <div className="flex items-center gap-3">
                        {otherUser?.profilePhoto && (
                          <img className="w-8 h-8 rounded-full object-cover" src={otherUser.profilePhoto} alt={otherUser.name} />
                        )}
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-sm text-white truncate">{otherUser?.name || 'Direct Chat'}</p>
                          <p className="text-xs text-gray-400 truncate">Direct Messages</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {myGuestlistChats.length === 0 && myFriendZoneChats.length === 0 && (
                  <p className="text-center text-gray-500 text-xs py-8">No active chats found.</p>
                )}
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 flex flex-col h-[500px]">
              {selectedChat ? (() => {
                const isDirect = selectedChat.type === 'direct';
                const activeId = selectedChat.id;
                
                const msgs = isDirect 
                  ? friendZoneChatMessages.filter(m => m.chatId === activeId)
                  : guestlistChatMessages.filter(m => m.chatId === activeId);

                const chatTitle = isDirect 
                  ? users.find(u => friendZoneChats.find(c => c.id === activeId)?.memberIds.includes(u.id) && u.id !== wingman.id)?.name || 'Direct Chat'
                  : venues.find(v => v.id === guestlistChats.find(c => c.id === activeId)?.venueId)?.name || 'Guestlist group';

                return (
                  <>
                    <div className="p-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                      <p className="font-extrabold text-white text-sm">{chatTitle}</p>
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase">
                        {isDirect ? 'Direct DM' : 'Group Chat'}
                      </span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col no-scrollbar">
                      {msgs.length === 0 ? (
                        <p className="text-center text-gray-600 text-xs py-12">No messages in this chat yet. Start the conversation!</p>
                      ) : (
                        msgs.map(m => {
                          const isMe = m.senderId === wingman.id;
                          const sender = users.find(u => u.id === m.senderId);
                          return (
                            <div key={m.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                              <p className="text-[10px] text-gray-500 mb-0.5">{isMe ? 'You' : sender?.name || 'Guest'}</p>
                              <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-orange-500 text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/5'}`}>
                                {m.text}
                              </div>
                              <span className="text-[9px] text-gray-600 mt-1">{m.timestamp}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-3 border-t border-white/5 bg-[#0F1014] flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        className="flex-grow bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-orange-500 hover:bg-orange-400 text-black font-extrabold px-5 rounded-xl text-sm transition-colors active:scale-[0.98]"
                      >
                        Send
                      </button>
                    </div>
                  </>
                );
              })() : (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-500 p-8">
                  <span className="text-3xl mb-2">💬</span>
                  <p className="text-sm font-semibold">Select a chat thread from the sidebar</p>
                  <p className="text-xs text-gray-600 mt-1">Connect directly with attendees and booking requests</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 animate-fade-in max-w-2xl">
            <h2 className="text-xl font-bold">Edit Wingman Public Card & Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Stage Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="w-full bg-[#0F1014] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 text-white"
                  required
                />
              </div>

              {/* ── Profile Photo Upload ── */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {/* Clickable avatar preview */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative flex-shrink-0 group"
                    title="Click to upload photo"
                  >
                    <img
                      src={profilePhoto || 'https://i.pravatar.cc/150?u=wingman'}
                      alt="Profile"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-orange-500 transition-colors"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=wingman'; }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {photoUploading ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="flex-grow space-y-2">
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 hover:border-orange-500 text-orange-400 font-bold text-sm rounded-lg px-4 py-2.5 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      {photoUploading ? 'Uploading…' : 'Upload Photo'}
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoFileChange}
                    />
                    {/* URL fallback */}
                    <input
                      type="text"
                      value={profilePhoto}
                      onChange={e => setProfilePhoto(e.target.value)}
                      placeholder="Or paste an image URL…"
                      className="w-full bg-[#0F1014] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Public Bio Description</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-[#0F1014] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 text-white min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Operating City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-[#0F1014] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Operating Hours / Availability Description</label>
                <input
                  type="text"
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full bg-[#0F1014] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 text-white"
                  placeholder="e.g. Thu-Sun Nights"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase block">Host Venues Access</label>
              <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto no-scrollbar bg-[#0F1014] p-3 rounded-lg border border-white/10">
                {venues.map(v => {
                  const checked = selectedVenues.includes(v.id);
                  return (
                    <label key={v.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer p-1 rounded hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedVenues(prev => prev.filter(id => id !== v.id));
                          } else {
                            setSelectedVenues(prev => [...prev, v.id]);
                          }
                        }}
                        className="rounded border-white/10 text-orange-500 bg-transparent focus:ring-transparent"
                      />
                      <span className="truncate">{v.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-black font-extrabold py-3 px-6 rounded-lg text-sm transition-colors active:scale-[0.98]"
            >
              Save Profile Updates
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
