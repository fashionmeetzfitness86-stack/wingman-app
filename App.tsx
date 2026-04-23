
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { hasActivePasscodeSession, grantPasscodeAccess, getAccessSession, formatTimeRemaining } from './utils/accessControl';
import { User, Page, Wingman, Venue, Event, CartItem, AccessGroup, Itinerary, FriendZoneChat, AppNotification, UserRole, UserAccessLevel, Experience, GuestlistJoinRequest, EventInvitation, WingmanApplication, ExperienceInvitationRequest, GroupJoinRequest, PaymentMethod, StoreItem, EventInvitationRequest as EventInvitationReq, FriendZoneChatMessage, Challenge, GuestlistChat, EventChat, GuestlistChatMessage, EventChatMessage, PushCampaign, MembershipRequest, InstanceBooking } from './types';
import { users, wingmen, venues, events, experiences, challenges, storeItems, accessGroups, itineraries, mockNotifications, mockFriendZoneChats, mockGuestlistChats, mockEventChats, mockEventChatMessages, mockGuestlistChatMessages, mockFriendZoneChatMessages, mockInvitationRequests, mockEventInvitations, mockGuestlistJoinRequests, mockWingmanApplications, mockDataExportRequests, mockPaymentMethods, mockWingmanChats, mockWingmanChatMessages } from './data/mockData';
import { generateEventFeed } from './utils/eventSchedule';

// Component Imports
import { HomeScreen } from './components/HomeScreen';
import { MembershipRequestModal } from './components/modals/MembershipRequestModal';
import { WingmanDirectory } from './components/WingmanDirectory';
import { WingmanProfile } from './components/WingmanProfile';
import { FeaturedVenuesPage } from './components/FeaturedVenuesPage';
import { EventTimeline } from './components/EventTimeline';
import { ExclusiveExperiencesPage } from './components/ExclusiveExperiencesPage';
import { WingmanEventFeed } from './components/WingmanEventFeed';
import { EventDetailPage } from './components/EventDetailPage';
import { ChallengesPage } from './components/ChallengesPage';
import { FriendsZonePage } from './components/FriendsZonePage';
import { StorePage } from './components/StorePage';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';
import { WingmanDashboard } from './components/WingmanDashboard';
import { BookingsPage } from './components/BookingsPage';
import { SettingsPage } from './components/SettingsPage';
import { ChatbotPage } from './components/ChatbotPage';
import { LiveChatPage } from './components/LiveChatPage';
import { AccessGroupsPage } from './components/AccessGroupsPage';
import { AccessGroupFeedPage } from './components/AccessGroupFeedPage';
import { MyItinerariesPage } from './components/MyItinerariesPage';
import { ItineraryDetailsPage } from './components/ItineraryDetailsPage';
import { ItineraryBuilderPage } from './components/ItineraryBuilderPage';
import { BookingConfirmedPage } from './components/BookingConfirmedPage';
import { WingmanApplicationPage } from './components/WingmanApplicationPage';
import { CreateGroupPage } from './components/CreateGroupPage';
import { InvitationsPage } from './components/InvitationsPage';
import { CheckoutPage } from './components/CheckoutPage';
import { EventChatsListPage } from './components/EventChatsListPage';
import { GuestlistChatsPage } from './components/GuestlistChatsPage';
import { EventChatPage } from './components/EventChatPage';
import { GuestlistChatPage } from './components/GuestlistChatPage';
import { FriendZoneChatPage } from './components/FriendZoneChatPage';
import { WingmanStatsPage } from './components/WingmanStatsPage';
import { PaymentMethodsPage } from './components/PaymentMethodsPage';
import { FavoritesPage } from './components/FavoritesPage';
import { VenueDetailsPage } from './components/VenueDetailsPage';
import { HelpPage } from './components/HelpPage';
import { ReportIssuePage } from './components/ReportIssuePage';
import { PrivacyPage } from './components/PrivacyPage';
import { SecurityPage } from './components/SecurityPage';
import { NotificationsSettingsPage } from './components/NotificationsSettingsPage';
import { CookieSettingsPage } from './components/CookieSettingsPage';
import { DataExportPage } from './components/DataExportPage';
import { TokenWalletPage } from './components/TokenWalletPage';
import { EditProfilePage } from './components/EditProfilePage';
import { ReferFriendPage } from './components/ReferFriendPage';
import { WelcomePage } from './components/WelcomePage';

// Layout & Modals
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { BottomNavBar } from './components/BottomNavBar';
import { CartPanel } from './components/CartPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ToastNotification } from './components/ToastNotification';
import { BookingFlow } from './components/BookingFlow';
import { ExperienceBookingFlow } from './components/ExperienceBookingFlow';
import { EventBookingFlow } from './components/EventBookingFlow';
import { GuestlistModal } from './components/modals/GuestlistModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { GuestlistJoinSuccessModal } from './components/modals/GuestlistJoinSuccessModal';
import { WingmanBottomNavBar } from './components/WingmanBottomNavBar';
import { SelectWingmanModal } from './components/SelectWingmanModal';
import { Modal } from './components/ui/Modal';
import { TokenIcon } from './components/icons/TokenIcon';
import { AdminAddUserModal } from './components/modals/AdminAddUserModal';
import { AdminEditUserModal } from './components/modals/AdminEditUserModal';
import { AdminEditWingmanModal } from './components/modals/AdminEditWingmanModal';
import { AdminEditEventModal } from './components/modals/AdminEditEventModal';
import { AdminEditVenueModal } from './components/modals/AdminEditVenueModal';
import { AdminEditStoreItemModal } from './components/modals/AdminEditStoreItemModal';
import { StoreItemPreviewModal } from './components/modals/StoreItemPreviewModal';
import { UserProfilePreviewModal } from './components/modals/UserProfilePreviewModal';

const calculateProfileCompleteness = (user: User): number => {
    let score = 0;
    const totalPoints = 12;

    if (user.name) score++;
    if (user.profilePhoto && !user.profilePhoto.includes('seed')) score++;
    if (user.bio && user.bio.length > 10) score++;
    if (user.city) score++;
    if (user.instagramHandle) score++;
    if (user.phoneNumber) score++;
    if (user.dob) score++;
    if (user.ethnicity) score++;
    if (user.appearance && (user.appearance.height || user.appearance.build)) score++;
    if (user.preferences && user.preferences.music.length > 0) score++;
    if (user.preferences && user.preferences.activities.length > 0) score++;
    if (user.galleryImages && user.galleryImages.length >= 3) score++;

    return Math.min(100, Math.round((score / totalPoints) * 100));
};

const getOriginalEventId = (eventId: number | string) => {
    return typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
};

type ModalState = 
  | { type: 'booking'; wingman: Wingman; venue?: Venue; date?: string }
  | { type: 'experienceBooking'; experience: Experience }
  | { type: 'eventBooking'; event: Event }
  | { type: 'guestlist'; wingman?: Wingman; venue?: Venue; date?: string }
  | { type: 'guestlistSuccess'; venueName: string; date: string; isVip: boolean }
  | { type: 'wingmanSelection'; venue: Venue }
  | null;

export const App: React.FC = () => {
    // Data State with Persistence
    const [appUsers, setAppUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_users');
            return saved ? JSON.parse(saved) : users;
        } catch (e) {
            return users;
        }
    });
    const [appWingmen, setAppWingmen] = useState<Wingman[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_wingmen');
            return saved ? JSON.parse(saved) : wingmen;
        } catch (e) {
            return wingmen;
        }
    });
    const [appEvents, setAppEvents] = useState<Event[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_events');
            return saved ? JSON.parse(saved) : events;
        } catch (e) {
            return events;
        }
    });
    const [appVenues, setAppVenues] = useState<Venue[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_venues');
            return saved ? JSON.parse(saved) : venues;
        } catch (e) {
            return venues;
        }
    });
    const [appStoreItems, setAppStoreItems] = useState<StoreItem[]>(storeItems);
    const [appChallenges, setAppChallenges] = useState<Challenge[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_challenges');
            return saved ? JSON.parse(saved) : challenges;
        } catch (e) {
            return challenges;
        }
    });
    
    // State
    const [currentUser, setCurrentUser] = useState<User>(() => {
        try {
            // Try to find the last logged in user ID
            const savedId = localStorage.getItem('wingman_currentUserId');
            if (savedId) {
                // Look up the fresh user data from appUsers using the ID
                const found = appUsers.find(u => u.id === parseInt(savedId, 10));
                if (found) return found;
            }
            // Fallback to first user if no saved ID or user not found
            return appUsers[0] || users[0];
        } catch (e) {
             return users[0];
        }
    });

    // Real Admin Session State (for "Switch Account" feature)
    const [realAdminUser, setRealAdminUser] = useState<User | null>(() => {
        try {
            const savedId = localStorage.getItem('wingman_realAdminUserId');
            if (savedId) {
                const storedUsers = localStorage.getItem('wingman_users');
                const allUsers = storedUsers ? JSON.parse(storedUsers) : users;
                const found = allUsers.find((u: User) => u.id === parseInt(savedId, 10));
                if (found && found.role === UserRole.ADMIN) return found;
            }
            return null;
        } catch (e) {
            return null;
        }
    });

    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [pageParams, setPageParams] = useState<any>({});
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalState>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showNotificationsPrompt, setShowNotificationsPrompt] = useState(false);
    
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [bookedItems, setBookedItems] = useState<CartItem[]>([]);
    const [watchlist, setWatchlist] = useState<CartItem[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
    const [userTokenBalance, setUserTokenBalance] = useState(2500); // Mock balance
    const [appAccessGroups, setAppAccessGroups] = useState<AccessGroup[]>(accessGroups);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
    const [pushCampaigns, setPushCampaigns] = useState<PushCampaign[]>([]);
    const [appItineraries, setAppItineraries] = useState<Itinerary[]>(itineraries);

    // Group notification preferences: { [groupId]: notificationsOn }
    const [groupNotificationSettings, setGroupNotificationSettings] = useState<Record<number, boolean>>(() => {
        try {
            const saved = localStorage.getItem('wingman_group_notif_settings');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const handleToggleGroupNotification = (groupId: number) => {
        setGroupNotificationSettings(prev => {
            const updated = { ...prev, [groupId]: !prev[groupId] };
            try { localStorage.setItem('wingman_group_notif_settings', JSON.stringify(updated)); } catch {}
            return updated;
        });
        showToast('Group notification preference updated.', 'success');
    };
    
    // Specific Data State
    const [guestlistJoinRequests, setGuestlistJoinRequests] = useState(mockGuestlistJoinRequests);
    const [invitationRequests, setInvitationRequests] = useState(mockInvitationRequests);
    const [experienceInvitationRequests, setExperienceInvitationRequests] = useState<ExperienceInvitationRequest[]>([]);
    const [friendZoneChats, setFriendZoneChats] = useState<FriendZoneChat[]>(mockFriendZoneChats);
    const [friendZoneChatMessages, setFriendZoneChatMessages] = useState<FriendZoneChatMessage[]>(mockFriendZoneChatMessages);
    const [wingmanChats, setWingmanChats] = useState<WingmanChat[]>(mockWingmanChats);
    const [wingmanChatMessages, setWingmanChatMessages] = useState<WingmanChatMessage[]>(mockWingmanChatMessages);
    const [groupJoinRequests, setGroupJoinRequests] = useState<GroupJoinRequest[]>([]);
    const [wingmanApplications, setWingmanApplications] = useState(mockWingmanApplications);
    // Membership access requests — separate system from WingmanApplication
    const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
    const [isMembershipRequestOpen, setIsMembershipRequestOpen] = useState(false);

    // ── Recurring Event System ────────────────────────────────────────────────
    const [instanceBookings, setInstanceBookings] = useState<InstanceBooking[]>([]);
    // pendingCartReservations: { [instanceId]: partySize } — spots held in cart awaiting payment
    const [pendingCartReservations, setPendingCartReservations] = useState<Record<string, number>>({});
    // cartInstanceMeta: { [cartItemId]: { instanceId, partySize } } — used at checkout to create InstanceBookings
    const [cartInstanceMeta, setCartInstanceMeta] = useState<Record<string, { instanceId: string; partySize: number }>>({});
    // bookedMap: { [instanceId]: total spots taken (confirmed + cart-pending) }

    // Notification preferences — persisted to localStorage
    const [notificationSettings, setNotificationSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('wingman_notification_settings');
            return saved ? JSON.parse(saved) : {
                eventAnnouncements: true,
                bookingUpdates: true,
                recommendations: true,
                promotionalOffers: false,
                communityActivity: false,
                friendActivity: false,
            };
        } catch { return { eventAnnouncements: true, bookingUpdates: true, recommendations: true, promotionalOffers: false, communityActivity: false, friendActivity: false }; }
    });
    const handleNotificationSettingsChange = (s: typeof notificationSettings) => {
        setNotificationSettings(s);
        try { localStorage.setItem('wingman_notification_settings', JSON.stringify(s)); } catch {}
    };
    const bookedMap = useMemo(() => {
        const m: Record<string, number> = {};
        for (const b of instanceBookings) {
            m[b.instanceId] = (m[b.instanceId] ?? 0) + b.partySize;
        }
        // Also count spots held in cart (reserved but not yet paid)
        for (const [instId, size] of Object.entries(pendingCartReservations)) {
            m[instId] = (m[instId] ?? 0) + size;
        }
        return m;
    }, [instanceBookings, pendingCartReservations]);
    // cancelMap: { [instanceId]: true } — admin-cancelled instances
    const [cancelMap, setCancelMap] = useState<Record<string, boolean>>({});
    // forceSoldOutMap: { [instanceId]: true } — admin force sold-out instances
    const [forceSoldOutMap, setForceSoldOutMap] = useState<Record<string, boolean>>({});

    // Chat State
    const [guestlistChats, setGuestlistChats] = useState<GuestlistChat[]>(mockGuestlistChats);
    const [guestlistChatMessages, setGuestlistChatMessages] = useState<GuestlistChatMessage[]>(mockGuestlistChatMessages);
    const [eventChats, setEventChats] = useState<EventChat[]>(mockEventChats);
    const [eventChatMessages, setEventChatMessages] = useState<EventChatMessage[]>(mockEventChatMessages);
    
    // Interaction State
    const [likedEventIds, setLikedEventIds] = useState<number[]>([]);
    const [bookmarkedEventIds, setBookmarkedEventIds] = useState<number[]>([]);
    const [rsvpedEventIds, setRsvpedEventIds] = useState<number[]>([]);
    
    // Experience Interaction State
    const [likedExperienceIds, setLikedExperienceIds] = useState<number[]>([]);
    const [bookmarkedExperienceIds, setBookmarkedExperienceIds] = useState<number[]>([]);
    // Event-instance bookmark state — drives Watchlist tab in My Plans
    const [bookmarkedInstanceIds, setBookmarkedInstanceIds] = useState<string[]>([]);

    // Admin Modal States
    const [isAdminAddUserOpen, setIsAdminAddUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [wingmanToEdit, setWingmanToEdit] = useState<{wingman: Wingman, user: User} | null>(null);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [isAdminEditEventOpen, setIsAdminEditEventOpen] = useState(false);
    const [venueToEdit, setVenueToEdit] = useState<Venue | null>(null);
    const [isAdminEditVenueOpen, setIsAdminEditVenueOpen] = useState(false);
    const [storeItemToEdit, setStoreItemToEdit] = useState<StoreItem | null>(null);
    const [isAdminEditStoreItemOpen, setIsAdminEditStoreItemOpen] = useState(false);
    const [previewStoreItem, setPreviewStoreItem] = useState<StoreItem | null>(null);
    const [previewUser, setPreviewUser] = useState<User | null>(null);

    // Flags
    // TODO: Re-enable auth flow when email-approval login system is ready.

    // ── Gated Access System ─────────────────────────────────────────────────
    // Determines whether we show the WelcomePage gate.
    // Logged-in admin/user accounts bypass the gate entirely.
    // A user is considered "logged in" if they have a saved ID in localStorage
    // (meaning they previously authenticated via login or were pre-seeded).
    const isLoggedInUser = !!localStorage.getItem('wingman_currentUserId');

    const [passcodeAccessActive, setPasscodeAccessActive] = useState<boolean>(() => {
        // Any user with a saved session (login or passcode) bypasses gate
        if (isLoggedInUser) return true;
        return hasActivePasscodeSession();
    });

    // Re-validate session every minute (handles expiry while app is open)
    useEffect(() => {
        if (isLoggedInUser) return;
        const interval = setInterval(() => {
            const stillValid = hasActivePasscodeSession();
            if (!stillValid && passcodeAccessActive) {
                setPasscodeAccessActive(false);
            }
        }, 60_000);
        return () => clearInterval(interval);
    }, [isLoggedInUser, passcodeAccessActive]);

    const handleAccessGranted = useCallback(() => {
        setPasscodeAccessActive(true);
    }, []);

    const handleLoginInstead = useCallback(() => {
        // Grant access for logged-in users — navigate to home
        setPasscodeAccessActive(true);
        setCurrentPage('home');
    }, []);

    // Persistence Effects
    useEffect(() => { localStorage.setItem('wingman_users', JSON.stringify(appUsers)); }, [appUsers]);
    useEffect(() => { localStorage.setItem('wingman_wingmen', JSON.stringify(appWingmen)); }, [appWingmen]);
    useEffect(() => { localStorage.setItem('wingman_events', JSON.stringify(appEvents)); }, [appEvents]);
    useEffect(() => { localStorage.setItem('wingman_venues', JSON.stringify(appVenues)); }, [appVenues]);
    useEffect(() => { localStorage.setItem('wingman_challenges', JSON.stringify(appChallenges)); }, [appChallenges]);
    useEffect(() => { 
        // Always update persisted current user data when currentUser state changes
        if (currentUser) {
            localStorage.setItem('wingman_currentUserId', currentUser.id.toString()); 
        }
    }, [currentUser]);

    // Notification Prompt Effect
    useEffect(() => {
        if (currentUser && !currentUser.notificationsEnabled) {
             const hasSeenPrompt = sessionStorage.getItem('notifications_prompt_seen');
             if (!hasSeenPrompt) {
                 const timer = setTimeout(() => setShowNotificationsPrompt(true), 3000);
                 return () => clearTimeout(timer);
             }
        }
    }, [currentUser]);

    // URL Parsing Effect for Shared Links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        // Handle Wingman Profile Sharing
        const wingmanId = params.get('wingman');
        if (wingmanId) {
            const id = parseInt(wingmanId, 10);
            if (!isNaN(id)) {
                const wingman = appWingmen.find(p => p.id === id);
                if (wingman) {
                    handleNavigate('wingmanProfile', { wingmanId: id });
                }
            }
        }

        // Handle Venue Sharing
        const venueId = params.get('venue');
        if (venueId) {
            const id = parseInt(venueId, 10);
            if (!isNaN(id)) {
                const venue = appVenues.find(v => v.id === id);
                if (venue) {
                    handleNavigate('venueDetails', { venueId: id });
                }
            }
        }

        // Handle Event Sharing
        const eventId = params.get('event');
        if (eventId) {
             handleNavigate('eventTimeline');
        }

    }, [appWingmen, appVenues]);

    const handleNavigate = (page: Page, params: any = {}) => {
        setCurrentPage(page);
        setPageParams(params);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    React.useEffect(() => {
        (window as any).showAppToast = showToast;
    }, []);

    const handleAddToCart = (item: CartItem) => {
        setCartItems([...cartItems, item]);
        showToast(`${item.name} added to cart`, 'success');
    };

    const handleRemoveCartItem = (itemId: string) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        handleNavigate('checkout');
    };

    const handleMoveToCart = (item: CartItem) => {
        // Move item from watchlist to cart (real item now)
        const cartItem = { ...item, isPlaceholder: false };
        setCartItems(prev => [...prev, cartItem]);
        setWatchlist(prev => prev.filter(i => i.id !== item.id));
        showToast("Moved to Cart", "success");
    };

    const handleConfirmCheckout = (paymentMethod: 'tokens' | 'usd' | 'cashapp', itemIds: string[]) => {
        const itemsToBook = cartItems.filter(i => itemIds.includes(i.id));
        const timestamp = Date.now();

        const newBookedItems = itemsToBook.map(item => ({
            ...item,
            bookedTimestamp: timestamp,
            isPlaceholder: false,
            paymentMethod: paymentMethod
        }));

        setBookedItems(prev => [...prev, ...newBookedItems]);
        setCartItems(prev => prev.filter(i => !itemIds.includes(i.id)));

        // Convert any pending instance cart items to confirmed InstanceBookings
        const newInstanceBookings: InstanceBooking[] = [];
        for (const id of itemIds) {
            const meta = cartInstanceMeta[id];
            if (meta) {
                newInstanceBookings.push({
                    id: `ib-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    instanceId: meta.instanceId,
                    userId: currentUser.id,
                    partySize: meta.partySize,
                    totalPaid: itemsToBook.find(i => i.id === id)?.fullPrice ?? 0,
                    bookedAt: new Date().toISOString(),
                    guestName: currentUser.name,
                    guestEmail: currentUser.email ?? '',
                });
                // Release the pending reservation (now confirmed)
                setPendingCartReservations(prev => {
                    const n = { ...prev }; delete n[meta.instanceId]; return n;
                });
            }
        }
        if (newInstanceBookings.length > 0) {
            setInstanceBookings(prev => [...prev, ...newInstanceBookings]);
        }
        // Clear meta for paid items
        setCartInstanceMeta(prev => {
            const n = { ...prev };
            itemIds.forEach(id => delete n[id]);
            return n;
        });

        // Ensure items are removed from watchlist if they were also bookmarked
        setWatchlist(prev => prev.filter(w => !itemsToBook.some(b =>
            (b.type === 'event' && w.type === 'event' && b.eventDetails?.event.id === w.eventDetails?.event.id) ||
            (b.type === 'experience' && w.type === 'experience' && b.experienceDetails?.experience.id === w.experienceDetails?.experience.id) ||
            (b.id === w.id)
        )));

        handleNavigate('bookingConfirmed', { items: newBookedItems });
    };


    const handleSendWingmanMessage = (chatId: number | undefined, text: string) => {
        let actualChatId = chatId;
        
        // If no chatId is provided, check if an open chat exists or create one
        if (!actualChatId) {
            const existingChat = wingmanChats.find(c => c.userId === currentUser.id && c.status === 'open');
            if (existingChat) {
                actualChatId = existingChat.id;
            } else {
                actualChatId = Math.max(0, ...wingmanChats.map(c => c.id)) + 1;
                const newChat: WingmanChat = {
                    id: actualChatId,
                    userId: currentUser.id,
                    title: 'Concierge Request',
                    status: 'open',
                    createdAt: new Date().toISOString()
                };
                setWingmanChats(prev => [...prev, newChat]);
            }
        }

        const newMessage: WingmanChatMessage = {
            id: wingmanChatMessages.length > 0 ? Math.max(...wingmanChatMessages.map(m => m.id)) + 1 : 1,
            chatId: actualChatId!,
            senderId: currentUser.id,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setWingmanChatMessages(prev => [...prev, newMessage]);

        // Auto-reply simulation
        setTimeout(() => {
            const replyMessage: WingmanChatMessage = {
                id: newMessage.id + 1,
                chatId: actualChatId!,
                senderId: 'wingman',
                text: 'A Wingman concierge will be with you shortly. How can we elevate your experience?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setWingmanChatMessages(prev => [...prev, replyMessage]);
        }, 1500);
    };

    const handleStartBookingChat = (item: CartItem) => {
        if (item.type === 'table' || item.type === 'guestlist') {
            const venue = item.tableDetails?.venue || item.guestlistDetails?.venue;
            const wingman = item.tableDetails?.wingman || item.guestlistDetails?.wingman;
            const date = item.sortableDate || item.date;

            if (!venue || !wingman || !date) {
                showToast("Cannot start chat: Missing booking details.", "error");
                return;
            }

            let chat = guestlistChats.find(c => 
                c.venueId === venue.id && 
                c.wingmanId === wingman.id && 
                c.date === date && 
                c.memberIds.includes(currentUser.id)
            );

            if (!chat) {
                const newId = Math.max(...guestlistChats.map(c => c.id), 0) + 1;
                chat = {
                    id: newId,
                    venueId: venue.id,
                    date: date,
                    wingmanId: wingman.id,
                    memberIds: [currentUser.id, wingman.id],
                    meetupTime: '11:00 PM'
                };
                setGuestlistChats(prev => [...prev, chat!]);
            }

            handleNavigate('guestlistChat', { chatId: chat.id });
        } else if (item.type === 'event' && item.eventDetails) {
            const event = item.eventDetails.event;
            const originalEventId = getOriginalEventId(event.id);
            let chat = eventChats.find(c => c.eventId === originalEventId && c.memberIds.includes(currentUser.id));
            
             if (!chat) {
                chat = eventChats.find(c => c.eventId === originalEventId);
                if (chat) {
                    if (!chat.memberIds.includes(currentUser.id)) {
                        const updatedChat = { ...chat, memberIds: [...chat.memberIds, currentUser.id] };
                        setEventChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
                        chat = updatedChat;
                    }
                } else {
                     const newId = Math.max(...eventChats.map(c => c.id), 0) + 1;
                     chat = {
                         id: newId,
                         eventId: originalEventId,
                         memberIds: [currentUser.id]
                     };
                     setEventChats(prev => [...prev, chat!]);
                }
            }
            handleNavigate('eventChat', { chatId: chat.id });
        } else {
             showToast("Chat not available for this item type.", "error");
        }
    };

    const handleOpenGuestlistModal = (context: { wingman?: Wingman; venue?: Venue; date?: string }) => {
        setActiveModal({ type: 'guestlist', ...context });
    };

    const handleJoinGuestlistConfirm = (wingmanId: number, venueId: number, date: string, maleGuests: number, femaleGuests: number) => {
        const venue = venues.find(v => v.id === venueId);
        const wingman = wingmen.find(p => p.id === wingmanId);

        const newRequest: GuestlistJoinRequest = {
            id: Date.now(),
            userId: currentUser.id,
            venueId,
            wingmanId,
            date,
            status: currentUser.accessLevel === UserAccessLevel.APPROVED_GIRL || currentUser.role === UserRole.ADMIN ? 'approved' : 'pending',
            attendanceStatus: 'pending',
            isVip: currentUser.role === UserRole.ADMIN
        };
        
        // Update request tracking state
        setGuestlistJoinRequests([...guestlistJoinRequests, newRequest]);
        
        // Create a CartItem for the guestlist entry so it appears in checkout/receipts
        if (venue && wingman) {
            const cartItem: CartItem = {
                id: `guestlist-${venueId}-${date}-${Date.now()}`,
                type: 'guestlist',
                name: `${venue.name} Guestlist`,
                image: venue.coverImage,
                date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                sortableDate: date,
                quantity: 1,
                fullPrice: 0,
                paymentOption: 'full',
                isPlaceholder: false,
                guestlistDetails: {
                    venue,
                    wingman,
                    numberOfGuests: maleGuests + femaleGuests,
                    status: newRequest.status
                }
            };
            handleAddToCart(cartItem);
        }

        setActiveModal({ 
            type: 'guestlistSuccess', 
            venueName: venue?.name || 'Venue', 
            date, 
            isVip: newRequest.isVip || false 
        });
    };

    const handleBookVenue = (venue: Venue) => {
        setActiveModal({ type: 'wingmanSelection', venue });
    };
    
    const handleBookEvent = (event: Event) => {
        setActiveModal({ type: 'eventBooking', event });
    };

    const handleToggleFavorite = (id: number, type: 'wingman' | 'venue' | 'event') => {
        let updatedUser = { ...currentUser };
        if (type === 'wingman') {
            const current = currentUser.favoriteWingmanIds || [];
            const isFavoriting = !current.includes(id);
            updatedUser.favoriteWingmanIds = isFavoriting ? [...current, id] : current.filter(i => i !== id);
            
            // Update wingman count
            setAppWingmen(prev => prev.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        favoritedByCount: isFavoriting ? p.favoritedByCount + 1 : Math.max(0, p.favoritedByCount - 1)
                    };
                }
                return p;
            }));

        } else if (type === 'venue') {
            const current = currentUser.favoriteVenueIds || [];
            updatedUser.favoriteVenueIds = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
        }
        handleUpdateUserWithRewardCheck(updatedUser); // Use central updater to persist
        showToast(type === 'wingman' ? 'Wingman updated' : 'Favorites updated', 'success');
    };

    const handleRequestExperienceAccess = (experienceId: number) => {
        const newReq: ExperienceInvitationRequest = {
            id: Date.now(),
            userId: currentUser.id,
            experienceId,
            status: 'pending'
        };
        setExperienceInvitationRequests([...experienceInvitationRequests, newReq]);
        showToast('Access requested', 'success');
    };

    const handleRequestInvite = (eventId: number | string) => {
        const originalId = typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
        if (invitationRequests.some(r => r.userId === currentUser.id && r.eventId === originalId)) {
            showToast('Request already sent', 'error');
            return;
        }
        const newRequest: EventInvitationReq = {
            id: Date.now(),
            userId: currentUser.id,
            eventId: originalId,
            status: 'pending'
        };
        setInvitationRequests([...invitationRequests, newRequest]);
        showToast('Invitation request sent', 'success');
    };

    const handleToggleLikeEvent = (eventId: number | string) => {
        const id = typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
        setLikedEventIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleBookmarkEvent = (eventId: number | string) => {
        const id = typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
        const event = appEvents.find(e => {
            const origId = typeof e.id === 'string' ? parseInt(e.id.split('-')[0], 10) : e.id;
            return origId === id;
        });

        setBookmarkedEventIds(prev => {
            const isBookmarked = prev.includes(id);
            if (isBookmarked) {
                // Remove from watchlist
                setWatchlist(current => current.filter(item => {
                    if (item.type !== 'event' || !item.eventDetails) return true;
                    const itemEventId = typeof item.eventDetails.event.id === 'string' ? parseInt(item.eventDetails.event.id.split('-')[0], 10) : item.eventDetails.event.id;
                    return itemEventId !== id;
                }));
                showToast('Removed from bookmarks', 'success');
                return prev.filter(i => i !== id);
            } else {
                // Add to watchlist
                if (event) {
                    const watchlistItem: CartItem = {
                        id: `watchlist-event-${event.id}-${Date.now()}`,
                        type: 'event',
                        name: event.title,
                        image: event.image,
                        date: event.date,
                        sortableDate: event.date,
                        quantity: 1,
                        fullPrice: event.priceGeneral || event.priceMale || 0,
                        isPlaceholder: true,
                        eventDetails: {
                            event: event,
                            guestDetails: { name: currentUser.name, email: currentUser.email }
                        }
                    };
                    setWatchlist(current => [...current, watchlistItem]);
                }
                showToast('Added to bookmarks', 'success');
                return [...prev, id];
            }
        });
    };
    
    // --- Experience Interaction Handlers ---
    const handleToggleLikeExperience = (experienceId: number) => {
        setLikedExperienceIds(prev => prev.includes(experienceId) ? prev.filter(id => id !== experienceId) : [...prev, experienceId]);
    };

    const handleToggleBookmarkExperience = (experienceId: number) => {
        const experience = experiences.find(e => e.id === experienceId);
        if (!experience) return;

        setBookmarkedExperienceIds(prev => {
            const isBookmarked = prev.includes(experienceId);
            if (isBookmarked) {
                // Remove from watchlist
                setWatchlist(current => current.filter(item => {
                    if (item.type !== 'experience' || !item.experienceDetails) return true;
                    return item.experienceDetails.experience.id !== experienceId;
                }));
                showToast('Removed from bookmarks', 'success');
                return prev.filter(id => id !== experienceId);
            } else {
                // Add to watchlist
                const watchlistItem: CartItem = {
                    id: `watchlist-experience-${experience.id}-${Date.now()}`,
                    type: 'experience',
                    name: experience.title,
                    image: experience.coverImage,
                    // Experiences might not have a single date in this context, using placeholder
                    date: 'Flexible', 
                    quantity: 1,
                    fullPrice: 0, 
                    isPlaceholder: true,
                    experienceDetails: {
                        experience: experience,
                        guestDetails: { name: currentUser.name, email: currentUser.email, phone: currentUser.phoneNumber || '' }
                    }
                };
                setWatchlist(current => [...current, watchlistItem]);
                showToast('Added to bookmarks', 'success');
                return [...prev, experienceId];
            }
        });
    };

    const handleRsvpEvent = (eventId: number | string) => {
        const id = typeof eventId === 'string' ? parseInt(eventId.split('-')[0], 10) : eventId;
        setRsvpedEventIds(prev => {
            const isRsvped = prev.includes(id);
            if (isRsvped) {
                showToast('RSVP cancelled', 'success');
                return prev.filter(i => i !== id);
            } else {
                showToast('RSVP confirmed', 'success');
                return [...prev, id];
            }
        });
    };

    const handleRequestJoinGroup = (groupId: number) => {
        const group = appAccessGroups.find(g => g.id === groupId);
        if (group?.memberIds.includes(currentUser.id)) return;

        const existing = groupJoinRequests.find(r => r.groupId === groupId && r.userId === currentUser.id);
        if (existing) return;

        const newReq: GroupJoinRequest = {
            id: Date.now(),
            groupId,
            userId: currentUser.id,
            status: 'pending',
            timestamp: Date.now()
        };
        setGroupJoinRequests(prev => [...prev, newReq]);
        showToast('Request to join sent!', 'success');
    };

    const handleApproveGroupRequest = (requestId: number) => {
        const request = groupJoinRequests.find(r => r.id === requestId);
        if (!request) return;

        setAppAccessGroups(prev => prev.map(g => {
            if (g.id === request.groupId) {
                return { ...g, memberIds: [...g.memberIds, request.userId] };
            }
            return g;
        }));

        setGroupJoinRequests(prev => prev.filter(r => r.id !== requestId));
        showToast('Member approved', 'success');
    };

    const handleRejectGroupRequest = (requestId: number) => {
        setGroupJoinRequests(prev => prev.filter(r => r.id !== requestId));
        showToast('Request rejected', 'success');
    };
    
    const handleToggleTask = (challengeId: number, taskId: number) => {
        setAppChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                return { 
                    ...c, 
                    tasks: c.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) 
                };
            }
            return c;
        }));
    };

    const handleDeleteTask = (challengeId: number, taskId: number) => {
         setAppChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                return { 
                    ...c, 
                    tasks: c.tasks.filter(t => t.id !== taskId) 
                };
            }
            return c;
        }));
        showToast('Task deleted', 'success');
    };

    const handleUpdateUserWithRewardCheck = (updatedUser: User) => {
        const completeness = calculateProfileCompleteness(updatedUser);
        let userToSave = { ...updatedUser };
        
        if (completeness === 100 && !userToSave.hasProfileReward) {
            userToSave.hasProfileReward = true;
            setUserTokenBalance(prev => prev + 500);
            showToast("Profile Completed! You earned 500 TMKC.", "success");
        }
        
        // Update global users list
        setAppUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
        // If updating self
        if (currentUser.id === userToSave.id) {
            setCurrentUser(userToSave);
        }
    };

    const handleEnableNotifications = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    handleUpdateUserWithRewardCheck({ ...currentUser, notificationsEnabled: true });
                    showToast("Notifications enabled!", "success");
                }
            });
        }
        setShowNotificationsPrompt(false);
        sessionStorage.setItem('notifications_prompt_seen', 'true');
    };

    const handleCloseNotificationsPrompt = () => {
        setShowNotificationsPrompt(false);
        sessionStorage.setItem('notifications_prompt_seen', 'true');
    };

    const handleSwitchUser = (targetUser: User) => {
        // If initiating a switch from an actual Admin account, save the session
        if (currentUser.role === UserRole.ADMIN && !realAdminUser) {
            setRealAdminUser(currentUser);
            localStorage.setItem('wingman_realAdminUserId', currentUser.id.toString());
        }
        
        // If switching back to the admin user (self), clear session
        if (realAdminUser && targetUser.id === realAdminUser.id) {
             setRealAdminUser(null);
             localStorage.removeItem('wingman_realAdminUserId');
        }

        setCurrentUser(targetUser);
        handleNavigate('home');
        
        // Optional: Show a different toast message
        if (currentUser.role === UserRole.ADMIN || realAdminUser) {
             showToast(`Viewing as: ${targetUser.name}`, 'success');
        } else {
             showToast(`Switched to user: ${targetUser.name}`, 'success');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('wingman_currentUserId');
        localStorage.removeItem('wingman_realAdminUserId');
        localStorage.removeItem('wm_access');
        sessionStorage.removeItem('wingman_currentUserId_session');
        setRealAdminUser(null);
        setPasscodeAccessActive(false);
        setCurrentUser(appUsers[0]);
        setIsMenuOpen(false);
        showToast('Logged out', 'success');
    };

    // ── Passcode 24h deadline enforcement ─────────────────────────────────────
    const isPasscodeOnlyUser = passcodeAccessActive && !isLoggedInUser;
    const [passcodeTimeRemaining, setPasscodeTimeRemaining] = useState<number>(() => {
        const session = getAccessSession();
        return session ? Math.max(0, session.expiresAt - Date.now()) : 0;
    });
    useEffect(() => {
        if (!isPasscodeOnlyUser) return;
        const interval = setInterval(() => {
            const session = getAccessSession();
            if (!session) { handleLogout(); return; }
            setPasscodeTimeRemaining(Math.max(0, session.expiresAt - Date.now()));
        }, 30_000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPasscodeOnlyUser]);


    // --- Push Campaigns ---
    const handleCreatePushCampaign = (campaign: PushCampaign) => {
        setPushCampaigns(prev => [campaign, ...prev]);
        showToast('Push notification campaign started!', 'success');
        // Simulate immediate notification for demo
        setNotifications(prev => [{
            id: Date.now(),
            text: `[TEST] ${campaign.title}: ${campaign.message}`,
            time: 'Just now',
            read: false,
            isPush: true
        }, ...prev]);
    };

    // --- Pass 2: Booking access guard ---
    // canBook = true only when the current user is approved AND has an active subscription.
    // Used to gate booking actions — browsing remains unrestricted.
    const canBook =
        currentUser?.approvalStatus === 'approved' &&
        currentUser?.subscriptionStatus === 'active';

    // --- Pass 2: User approval handlers ---
    // These ONLY mutate approvalStatus. They do not touch status, accessLevel, or any other field.
    const handleApproveUser = (userId: number) => {
        setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' as const } : u));
        showToast('User approved successfully', 'success');
    };

    const handleRejectUser = (userId: number) => {
        setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'rejected' as const } : u));
        showToast('User rejected', 'success');
    };

    // Membership request handlers (separate from approveUser — requests come from the modal flow)
    const handleSubmitMembershipRequest = (req: Omit<MembershipRequest, 'id'>) => {
        const newReq: MembershipRequest = { ...req, id: Date.now() };
        setMembershipRequests(prev => [newReq, ...prev]);
        // Mark the user as having a pending request (in case they had no approvalStatus yet)
        setAppUsers(prev => prev.map(u => u.id === req.userId && !u.approvalStatus ? { ...u, approvalStatus: 'pending' as const } : u));
        showToast('Access request submitted — admin will review shortly', 'success');
    };

    const handleApproveMembershipRequest = (requestId: number) => {
        setMembershipRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r));
        const req = membershipRequests.find(r => r.id === requestId);
        if (req) handleApproveUser(req.userId);
    };

    const handleRejectMembershipRequest = (requestId: number) => {
        setMembershipRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r));
        const req = membershipRequests.find(r => r.id === requestId);
        if (req) handleRejectUser(req.userId);
    };
    
    const handleToggleCampaignStatus = (campaignId: string) => {
        setPushCampaigns(prev => prev.map(c => 
            c.id === campaignId ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
        ));
    };

    const handleDeleteCampaign = (campaignId: string) => {
        setPushCampaigns(prev => prev.filter(c => c.id !== campaignId));
        showToast('Campaign deleted.', 'success');
    };

    // --- Admin Functions ---

    const handleAdminAddUser = async (user: Omit<User, 'id' | 'joinDate'>) => {
        const newUser: User = {
            ...user,
            id: Date.now(),
            joinDate: new Date().toISOString().split('T')[0]
        };
        setAppUsers(prev => [...prev, newUser]);
        
        // If added as wingman directly
        if (newUser.role === UserRole.WINGMAN) {
             const newWingman: Wingman = {
                id: newUser.id,
                name: newUser.name,
                handle: newUser.instagramHandle ? `@${newUser.instagramHandle}` : `@${newUser.name.replace(/\s/g, '').toLowerCase()}`,
                rating: 5.0,
                bio: newUser.bio || 'New Wingman',
                profilePhoto: newUser.profilePhoto,
                city: newUser.city || 'Miami',
                weeklySchedule: [],
                assignedVenueIds: [],
                earnings: 0,
                isOnline: false,
                favoritedByCount: 0,
                galleryImages: []
            };
            setAppWingmen(prev => [...prev, newWingman]);
        }
        showToast('User created successfully', 'success');
    };

    const handleAdminEditUser = (updatedUser: User) => {
        // 1. Update User List
        setAppUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        // 2. Handle Role Changes (Wingman Logic)
        if (updatedUser.role === UserRole.WINGMAN) {
            setAppWingmen(prev => {
                const exists = prev.find(p => p.id === updatedUser.id);
                if (exists) {
                    // Update existing wingman basics
                    return prev.map(p => p.id === updatedUser.id ? { ...p, name: updatedUser.name, profilePhoto: updatedUser.profilePhoto } : p);
                } else {
                    // Create new wingman entry
                    const newWingman: Wingman = {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        handle: updatedUser.instagramHandle ? `@${updatedUser.instagramHandle}` : `@${updatedUser.name.replace(/\s/g, '').toLowerCase()}`,
                        rating: 5.0,
                        bio: updatedUser.bio || 'Wingman',
                        profilePhoto: updatedUser.profilePhoto,
                        city: updatedUser.city || 'Miami',
                        weeklySchedule: [],
                        assignedVenueIds: [],
                        earnings: 0,
                        isOnline: false,
                        favoritedByCount: 0,
                        galleryImages: updatedUser.galleryImages || []
                    };
                    return [...prev, newWingman];
                }
            });
        } else {
            // If role changed from Wingman to User/Admin, remove from wingmen list
            setAppWingmen(prev => prev.filter(p => p.id !== updatedUser.id));
        }

        // 3. Update Current User if it's the one being edited
        if (currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        
        setUserToEdit(null);
        showToast('User updated successfully', 'success');
    };

    const handleAdminEditWingman = (updatedWingman: Wingman, updatedUser: User) => {
        setAppWingmen(prev => prev.map(p => p.id === updatedWingman.id ? updatedWingman : p));
        handleAdminEditUser(updatedUser); // Reuse user update logic
        setWingmanToEdit(null);
        showToast('Wingman updated successfully', 'success');
    };

    const handleApproveWingmanApplication = (appId: number) => {
        const app = wingmanApplications.find(a => a.id === appId);
        if (!app) return;

        const newUserId = app.userId || Date.now();
        
        const newUser: User = {
            id: newUserId,
            name: app.fullName,
            email: app.email,
            profilePhoto: app.profilePhotoUrl,
            accessLevel: UserAccessLevel.GENERAL,
            role: UserRole.WINGMAN, // Set role to Wingman
            city: app.city,
            joinDate: new Date().toISOString().split('T')[0],
            instagramHandle: app.instagram,
            phoneNumber: app.phone,
            status: 'active',
            galleryImages: app.mediaLinks,
            bio: `Professional Wingman in ${app.city}`
        };

        const newWingman: Wingman = {
            id: newUserId,
            name: app.stageName || app.fullName,
            handle: `@${app.instagram}`,
            rating: 5.0,
            bio: `Wingman in ${app.city}. Specializing in ${app.categories.join(', ')}.`,
            profilePhoto: app.profilePhotoUrl,
            city: app.city,
            weeklySchedule: [],
            assignedVenueIds: [], // Needs manual assignment later
            earnings: 0,
            isOnline: true,
            favoritedByCount: 0,
            galleryImages: app.mediaLinks
        };

        setAppUsers(prev => [...prev, newUser]);
        setAppWingmen(prev => [...prev, newWingman]);
        
        setWingmanApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
        showToast(`${app.fullName} approved as Wingman!`, 'success');
    };

    const handleInstanceBook = (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => {
        setPendingCartReservations(prev => ({ ...prev, [booking.instanceId]: (prev[booking.instanceId] ?? 0) + booking.partySize }));
        const cartId = `cart-inst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const allInst = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap);
        const inst = allInst.find(i => i.instanceId === booking.instanceId);
        const newCartItem: CartItem = {
            id: cartId,
            name: inst?.title ?? booking.instanceId,
            type: 'event',
            image: inst?.coverImage ?? '',
            date: inst?.date,
            sortableDate: inst?.date,
            fullPrice: booking.totalPaid,
            depositPrice: booking.totalPaid,
            paymentOption: 'full',
            bookedTimestamp: Date.now(),
            quantity: 1,
        };
        setCartItems(prev => [...prev, newCartItem]);
        setCartInstanceMeta(prev => ({ ...prev, [cartId]: { instanceId: booking.instanceId, partySize: booking.partySize } }));
    };

    // --- Render ---

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomeScreen
                    onNavigate={handleNavigate}
                    currentUser={currentUser}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onRequestAccess={() => setIsMembershipRequestOpen(true)}
               />;
            case 'directory':
                return <WingmanDirectory 
                    wingmen={appWingmen} 
                    isLoading={false} 
                    onViewProfile={(p) => handleNavigate('wingmanProfile', { wingmanId: p.id })} 
                    onBookWingman={(p) => setActiveModal({ type: 'booking', wingman: p })} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'wingman')} 
                    currentUser={currentUser} 
                    onNavigate={handleNavigate}
                    onJoinGuestlist={(p) => handleOpenGuestlistModal({ wingman: p })}
                />;
            case 'wingmanProfile': {
                const wingman = appWingmen.find(p => p.id === (pageParams.wingmanId || 1));
                if (!wingman) return <div>Wingman not found</div>;
                return <WingmanProfile 
                    wingman={wingman} 
                    onBack={() => handleNavigate('directory')} 
                    onBook={(p, v, d) => setActiveModal({ type: 'booking', wingman: p, venue: v, date: d })} 
                    isFavorite={(currentUser.favoriteWingmanIds || []).includes(wingman.id)} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'wingman')} 
                    onViewVenue={(v) => handleNavigate('venueDetails', { venueId: v.id })} 
                    onJoinGuestlist={(p, v, d) => handleOpenGuestlistModal({ wingman: p, venue: v, date: d })} 
                    currentUser={currentUser} 
                    onUpdateUser={handleUpdateUserWithRewardCheck} 
                    onUpdateWingman={(p) => setAppWingmen(prev => prev.map(pr => pr.id === p.id ? p : pr))}
                    onEditProfile={() => handleNavigate('editProfile')}
                    onNavigate={handleNavigate}
                    tokenBalance={userTokenBalance}
                    events={appEvents}
                />;
            }
            case 'featuredVenues':
                return <FeaturedVenuesPage 
                    onBookVenue={handleBookVenue} 
                    favoriteVenueIds={currentUser.favoriteVenueIds || []} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'venue')} 
                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })}
                    currentUser={currentUser}
                    wingmen={appWingmen}
                    onJoinGuestlist={(p, v) => handleOpenGuestlistModal({ wingman: p, venue: v })}
                    guestlistJoinRequests={guestlistJoinRequests}
                    bookedMap={bookedMap}
                    cancelMap={cancelMap}
                    instanceBookings={instanceBookings}
                    bookmarkedInstanceIds={bookmarkedInstanceIds}
                    onToggleBookmark={(id) => setBookmarkedInstanceIds(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    )}
                    onBook={(booking) => {
                        // 1. Reserve spots immediately
                        setPendingCartReservations(prev => ({
                            ...prev,
                            [booking.instanceId]: (prev[booking.instanceId] ?? 0) + booking.partySize,
                        }));
                        // 2. Build CartItem for payment step
                        const cartId = `cart-inst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                        const allInst = generateEventFeed(bookedMap, cancelMap, 4);
                        const inst = allInst.find(i => i.instanceId === booking.instanceId);
                        const newCartItem: CartItem = {
                            id: cartId,
                            name: inst?.title ?? booking.instanceId,
                            type: 'event',
                            image: inst?.coverImage ?? '',
                            date: inst?.date,
                            sortableDate: inst?.date,
                            fullPrice: booking.totalPaid,
                            depositPrice: booking.totalPaid,
                            paymentOption: 'full',
                            bookedTimestamp: Date.now(),
                            quantity: 1,
                        };
                        setCartItems(prev => [...prev, newCartItem]);
                        // 3. Store meta for checkout conversion
                        setCartInstanceMeta(prev => ({
                            ...prev,
                            [cartId]: { instanceId: booking.instanceId, partySize: booking.partySize },
                        }));
                    }}
                    onNavigateToPlans={() => handleNavigate('checkout', { initialTab: 'cart' })}
                    pendingCartMap={pendingCartReservations}
                />;
            case 'eventTimeline':
                return <WingmanEventFeed
                    currentUser={currentUser}
                    bookedMap={bookedMap}
                    instanceBookings={instanceBookings}
                    bookmarkedInstanceIds={bookmarkedInstanceIds}
                    onToggleBookmark={(id) => setBookmarkedInstanceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onBook={handleInstanceBook}
                    onNavigateToPlans={() => handleNavigate('checkout', { initialTab: 'cart' })}
                    onViewDetail={(inst) => handleNavigate('eventDetail', { instance: inst })}
                    cancelMap={cancelMap}
                    onAdminCancel={(id) => { setCancelMap(prev => ({ ...prev, [id]: true })); showToast('Event instance cancelled.', 'success'); }}
                    onAdminRestore={(id) => { setCancelMap(prev => { const n = { ...prev }; delete n[id]; return n; }); showToast('Event instance restored.', 'success'); }}
                    onAdminForceSoldOut={(id) => { setForceSoldOutMap(prev => ({ ...prev, [id]: true })); showToast('Event marked sold out.', 'success'); }}
                />;
            case 'exclusiveExperiences':
                return <WingmanEventFeed
                    currentUser={currentUser}
                    bookedMap={bookedMap}
                    instanceBookings={instanceBookings}
                    bookmarkedInstanceIds={bookmarkedInstanceIds}
                    onToggleBookmark={(id) => setBookmarkedInstanceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onBook={handleInstanceBook}
                    onNavigateToPlans={() => handleNavigate('checkout', { initialTab: 'cart' })}
                    onViewDetail={(inst) => handleNavigate('eventDetail', { instance: inst })}
                    cancelMap={cancelMap}
                    onAdminCancel={(id) => { setCancelMap(prev => ({ ...prev, [id]: true })); showToast('Event instance cancelled.', 'success'); }}
                    onAdminRestore={(id) => { setCancelMap(prev => { const n = { ...prev }; delete n[id]; return n; }); showToast('Event instance restored.', 'success'); }}
                    onAdminForceSoldOut={(id) => { setForceSoldOutMap(prev => ({ ...prev, [id]: true })); showToast('Event marked sold out.', 'success'); }}
                />;
            case 'eventDetail': {
                const inst = pageParams.instance || (pageParams.instanceId ? generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap).find(i => i.instanceId === pageParams.instanceId) : null);
                if (!inst) return <div className="text-white p-8">Event not found</div>;
                return <EventDetailPage
                    instance={inst}
                    currentUser={currentUser}
                    bookedMap={bookedMap}
                    instanceBookings={instanceBookings}
                    onNavigate={handleNavigate}
                    onBook={handleInstanceBook}
                    onNavigateToPlans={() => handleNavigate('checkout', { initialTab: 'cart' })}
                />;
            }
            case 'challenges':
                return <ChallengesPage 
                    challenges={appChallenges} 
                    onToggleTask={handleToggleTask} 
                    onDeleteTask={handleDeleteTask} 
                    onRewardClaimed={(amt, title) => {
                        setUserTokenBalance(prev => prev + amt);
                        showToast(`Claimed ${amt} TMKC for ${title}!`, 'success');
                    }} 
                />;
            case 'friendsZone':
                return <FriendsZonePage 
                    currentUser={currentUser} 
                    allUsers={appUsers} 
                    allItineraries={itineraries} 
                    onNavigate={handleNavigate} 
                    onAddFriend={(id) => handleUpdateUserWithRewardCheck({...currentUser, friends: [...(currentUser.friends || []), id]})} 
                    onRemoveFriend={(id) => handleUpdateUserWithRewardCheck({...currentUser, friends: (currentUser.friends || []).filter(f => f !== id)})} 
                    onViewProfile={(u) => setPreviewUser(u)} 
                    friendZoneChats={friendZoneChats} 
                    onCreateChat={(name) => {
                        const newChat: FriendZoneChat = { id: Date.now(), name, creatorId: currentUser.id, memberIds: [currentUser.id] };
                        setFriendZoneChats([...friendZoneChats, newChat]);
                        showToast('Chat created', 'success');
                    }} 
                    onDeleteChat={(id) => {
                        setFriendZoneChats(friendZoneChats.filter(c => c.id !== id));
                        showToast('Chat deleted', 'success');
                    }} 
                    onOpenChat={(id) => handleNavigate('friendZoneChat', { chatId: id })} 
                />;
            case 'store':
                return <StorePage 
                    currentUser={currentUser} 
                    onPurchase={(item) => {
                        if (userTokenBalance >= item.price) {
                            setUserTokenBalance(prev => prev - item.price);
                            return true;
                        }
                        return false;
                    }} 
                    userTokenBalance={userTokenBalance} 
                    showToast={showToast} 
                    onAddToCart={(item) => {
                        handleAddToCart({
                            id: `store-${item.id}-${Date.now()}`,
                            type: 'storeItem',
                            name: item.title,
                            image: item.image,
                            quantity: 1,
                            fullPrice: item.priceUSD, 
                            paymentOption: 'full',
                            storeItemDetails: { item }
                        });
                    }} 
                />;
            case 'userProfile':
                return <ProfilePage 
                    onNavigate={handleNavigate} 
                    currentUser={currentUser} 
                    tokenBalance={userTokenBalance} 
                    bookingHistory={[]}
                    favoriteVenueIds={currentUser.favoriteVenueIds || []} 
                    venues={appVenues} 
                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })} 
                />;
            case 'adminDashboard':
                return <AdminDashboard 
                    users={appUsers} 
                    wingmen={appWingmen} 
                    venues={appVenues} 
                    events={appEvents} 
                    storeItems={appStoreItems} 
                    pendingGroups={appAccessGroups.filter(g => g.status === 'pending')} 
                    invitationRequests={invitationRequests} 
                    pendingTableReservations={cartItems.filter(i => i.type === 'table')} 
                    onEditUser={(u) => setUserToEdit(u)} 
                    onAddUser={() => setIsAdminAddUserOpen(true)} 
                    onBlockUser={(u) => handleAdminEditUser({ ...u, status: u.status === 'blocked' ? 'active' : 'blocked' })} 
                    onViewUser={(u) => setPreviewUser(u)} 
                    onEditWingman={(p, u) => setWingmanToEdit({wingman: p, user: u})} 
                    onDeleteWingman={(p) => {
                        setAppWingmen(prev => prev.filter(prom => prom.id !== p.id));
                        setAppUsers(prev => prev.map(u => u.id === p.id ? { ...u, role: UserRole.USER } : u));
                        showToast('Wingman removed', 'success');
                    }} 
                    onSuspendWingman={(u) => handleAdminEditUser({ ...u, status: u.status === 'suspended' ? 'active' : 'suspended' })} 
                    onPreviewWingman={(p) => handleNavigate('wingmanProfile', { wingmanId: p.id })} 
                    onApproveGroup={(id) => {
                         setAppAccessGroups(prev => prev.map(g => g.id === id ? { ...g, status: 'approved' } : g));
                         showToast('Group approved', 'success');
                    }} 
                    onApproveRequest={(id) => {
                        setInvitationRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
                        showToast('Request approved', 'success');
                    }} 
                    onRejectRequest={(id) => {
                        setInvitationRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
                         showToast('Request rejected', 'success');
                    }} 
                    onSendDirectInvites={(eId, uIds) => { showToast(`Invitations sent to ${uIds.length} member${uIds.length !== 1 ? 's' : ''}.`, 'success'); }} 
                    onNavigate={handleNavigate} 
                    onAddEvent={() => { setEventToEdit(null); setIsAdminEditEventOpen(true); }} 
                    onEditEvent={(e) => { setEventToEdit(e); setIsAdminEditEventOpen(true); }} 
                    onDeleteEvent={(e) => { setAppEvents(prev => prev.filter(ev => ev.id !== e.id)); showToast('Event deleted', 'success'); }} 
                    onPreviewEvent={(e) => handleNavigate('eventTimeline')} 
                    onAddVenue={() => { setVenueToEdit(null); setIsAdminEditVenueOpen(true); }} 
                    onEditVenue={(v) => { setVenueToEdit(v); setIsAdminEditVenueOpen(true); }} 
                    onDeleteVenue={(v) => { setAppVenues(prev => prev.filter(ven => ven.id !== v.id)); showToast('Venue deleted', 'success'); }} 
                    onPreviewVenue={(v) => handleNavigate('venueDetails', { venueId: v.id })} 
                    onAddStoreItem={() => { setStoreItemToEdit(null); setIsAdminEditStoreItemOpen(true); }} 
                    onEditStoreItem={(i) => { setStoreItemToEdit(i); setIsAdminEditStoreItemOpen(true); }} 
                    onDeleteStoreItem={(i) => { setAppStoreItems(prev => prev.filter(it => it.id !== i.id)); showToast('Item deleted', 'success'); }} 
                    onPreviewStoreItem={(i) => setPreviewStoreItem(i)} 
                    wingmanApplications={wingmanApplications} 
                    onApproveWingmanApplication={handleApproveWingmanApplication} 
                    onRejectWingmanApplication={(id) => {
                        setWingmanApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
                        showToast('Application rejected', 'success');
                    }} 
                    bookedItems={bookedItems} 
                    guestlistRequests={guestlistJoinRequests} 
                    allRsvps={[]} 
                    onPreviewUser={(u) => setPreviewUser(u)} 
                    eventInvitations={mockEventInvitations} 
                    onSendPushNotification={(n) => showToast('Push notification sent', 'success')}
                    pushCampaigns={pushCampaigns}
                    onCreatePushCampaign={handleCreatePushCampaign}
                    onToggleCampaignStatus={handleToggleCampaignStatus}
                    onDeleteCampaign={handleDeleteCampaign}
                    onBulkDeleteEvents={(ids) => { setAppEvents(prev => prev.filter(e => !ids.includes(e.id))); showToast(`${ids.length} events deleted`, 'success'); }}
                    onBulkUpdateEvents={(ids, updates) => { setAppEvents(prev => prev.map(e => ids.includes(e.id) ? { ...e, ...updates } : e)); showToast('Events updated', 'success'); }}
                    onApproveUser={handleApproveUser}
                    onRejectUser={handleRejectUser}
                    membershipRequests={membershipRequests}
                    onApproveMembershipRequest={handleApproveMembershipRequest}
                    onRejectMembershipRequest={handleRejectMembershipRequest}
                />;
            case 'wingmanDashboard': {
                const myWingman = appWingmen.find(p => p.id === currentUser.id);
                if (!myWingman) return <div>Wingman dashboard unavailable.</div>;
                return <WingmanDashboard 
                    wingman={myWingman} 
                    onNavigate={handleNavigate} 
                    wingmanUser={currentUser} 
                    onUpdateUser={handleUpdateUserWithRewardCheck} 
                    guestlistRequests={guestlistJoinRequests} 
                    users={appUsers} 
                    venues={appVenues} 
                    events={appEvents} 
                    onViewUser={(u) => setPreviewUser(u)} 
                    onUpdateRequestStatus={(id, status) => setGuestlistJoinRequests(prev => prev.map(r => r.id === id ? { ...r, attendanceStatus: status } : r))} 
                    onReviewGuestlistRequest={(id, status) => setGuestlistJoinRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))} 
                    bookedItems={bookedItems} 
                    eventInvitations={mockEventInvitations} 
                    onSendDirectInvites={(eId, uIds) => { showToast(`Invitations sent to ${uIds.length} member${uIds.length !== 1 ? 's' : ''}.`, 'success'); }} 
                    wingmen={appWingmen}
                />;
            }
            case 'bookings':
                return <BookingsPage 
                    onNavigate={handleNavigate} 
                    bookedItems={bookedItems} 
                    venues={appVenues} 
                />;
            case 'settings': {
                // Check if the current user is admin OR if we have a persistent admin session active
                const isAdminSession = currentUser.role === UserRole.ADMIN || !!realAdminUser;
                return <SettingsPage 
                    onNavigate={handleNavigate} 
                    users={isAdminSession ? appUsers : undefined} 
                    onSwitchUser={isAdminSession ? handleSwitchUser : undefined} 
                />;
            }
            case 'chatbot': {
                let activeChatId = pageParams.chatId;
                if (!activeChatId) {
                    const openChat = wingmanChats.find(c => c.userId === currentUser.id && c.status === 'open');
                    if (openChat) {
                        activeChatId = openChat.id;
                    }
                }
                return <ChatbotPage 
                    chatId={activeChatId}
                    initialPrompt={pageParams.initialPrompt}
                    currentUser={currentUser}
                    wingmanChats={wingmanChats}
                    messages={wingmanChatMessages}
                    onSendMessage={handleSendWingmanMessage}
                    onBack={() => handleNavigate('eventChatsList')}
                />;
            }
            case 'liveChat':
                return <LiveChatPage />;
            case 'accessGroups':
                return <AccessGroupsPage 
                    currentUser={currentUser} 
                    allGroups={appAccessGroups} 
                    onViewGroup={(id) => handleNavigate('accessGroupFeed', { groupId: id })} 
                    onRequestJoinGroup={handleRequestJoinGroup}
                    onLeaveGroup={(g) => {
                        setAppAccessGroups(prev => prev.map(ag => ag.id === g.id
                            ? { ...ag, memberIds: ag.memberIds.filter(id => id !== currentUser.id) }
                            : ag
                        ));
                        showToast('You have left the group.', 'success');
                        handleNavigate('accessGroups');
                    }} 
                    groupNotificationSettings={groupNotificationSettings}
                    onToggleGroupNotification={(id) => handleToggleGroupNotification(id)} 
                    onNavigate={handleNavigate}
                    groupJoinRequests={groupJoinRequests} 
                />;
            case 'accessGroupFeed':
                return <AccessGroupFeedPage 
                    groupId={pageParams.groupId} 
                    currentUser={currentUser} 
                    allPosts={[]} 
                    allGroups={appAccessGroups} 
                    onToggleLike={(id) => {
                        setAppAccessGroups(prev => prev.map(g => g.id === id
                            ? { ...g, likeCount: ((g as any).likeCount ?? 0) + 1 }
                            : g
                        ));
                    }} 
                    groupJoinRequests={groupJoinRequests}
                    onApproveRequest={handleApproveGroupRequest}
                    onRejectRequest={handleRejectGroupRequest}
                    users={appUsers}
                />;
            case 'myItineraries':
                return <MyItinerariesPage 
                    currentUser={currentUser} 
                    itineraries={appItineraries} 
                    onNavigate={handleNavigate} 
                    onViewItinerary={(id) => handleNavigate('itineraryDetails', { itineraryId: id })} 
                />;
            case 'itineraryDetails': {
                const itinerary = appItineraries.find(i => i.id === pageParams.itineraryId);
                if (!itinerary) return <div>Itinerary not found</div>;
                return <ItineraryDetailsPage 
                    itinerary={itinerary} 
                    currentUser={currentUser} 
                    onEdit={(i) => handleNavigate('itineraryBuilder', { itineraryId: i.id })} 
                    onClone={(i) => {
                        const cloned = { ...i, id: Date.now(), title: `${i.title} (Copy)` };
                        setAppItineraries(prev => [...prev, cloned as any]);
                        showToast('Itinerary cloned.', 'success');
                    }} 
                />;
            }
            case 'itineraryBuilder': {
                const existingItinerary = appItineraries.find(i => i.id === pageParams.itineraryId);
                return <ItineraryBuilderPage 
                    onSave={(i) => {
                        setAppItineraries(prev => {
                            const exists = prev.find(it => it.id === i.id);
                            return exists ? prev.map(it => it.id === i.id ? i as any : it) : [...prev, i as any];
                        });
                        showToast('Itinerary saved.', 'success');
                        handleNavigate('myItineraries');
                    }} 
                    onCancel={() => handleNavigate('myItineraries')} 
                    itinerary={existingItinerary} 
                    venues={appVenues} 
                    events={appEvents} 
                    experiences={experiences} 
                    users={appUsers} 
                    currentUser={currentUser} 
                />;
            }
            case 'bookingConfirmed':
                return <BookingConfirmedPage 
                    items={pageParams.items || []}
                    onNavigate={handleNavigate} 
                    onStartChat={(details) => {
                        // Navigate to event chats so user can find their booking chat
                        handleNavigate('eventChatsList');
                    }} 
                />;
            case 'wingmanApplication':
                return <WingmanApplicationPage 
                    onApply={(app) => {
                        setWingmanApplications(prev => [...prev, { ...app, id: Date.now(), userId: currentUser.id, status: 'pending', submissionDate: new Date().toISOString() }]);
                        showToast('Application submitted successfully!', 'success');
                        handleNavigate('home'); 
                    }} 
                    onCancel={() => handleNavigate('home')} 
                    showToast={showToast} 
                />;
            case 'createGroup':
                return <CreateGroupPage 
                    onSave={(g) => { 
                         const newGroup: AccessGroup = { ...g, id: Date.now(), memberIds: [currentUser.id], creatorId: currentUser.id, status: 'pending', creationDate: new Date().toISOString().split('T')[0] };
                         setAppAccessGroups(prev => [...prev, newGroup]);
                         handleNavigate('accessGroups'); 
                    }} 
                    onCancel={() => handleNavigate('accessGroups')} 
                />;
            case 'invitations':
                return <InvitationsPage 
                    currentUser={currentUser} 
                    invitations={mockEventInvitations} 
                    events={appEvents} 
                    allUsers={appUsers} 
                    onAccept={(id) => {
                        showToast('Invitation accepted! Check your upcoming events.', 'success');
                    }} 
                    onDecline={(id) => {
                        showToast('Invitation declined.', 'success');
                    }} 
                    onNavigate={handleNavigate} 
                />;
            case 'checkout': {
                // Build watchlist from bookmarked EventInstances + existing CartItem watchlist
                const allInstances = generateEventFeed(bookedMap, cancelMap, 4);
                const instanceWatchlist: CartItem[] = bookmarkedInstanceIds
                    .map(id => allInstances.find(i => i.instanceId === id))
                    .filter(Boolean)
                    .map(inst => ({
                        id: `wl-${inst!.instanceId}`,
                        name: inst!.title,
                        type: 'event' as const,
                        image: inst!.coverImage,
                        date: inst!.date,
                        sortableDate: inst!.date,
                        fullPrice: inst!.pricePerPerson,
                        depositPrice: inst!.pricePerPerson,
                        paymentOption: 'full' as const,
                        bookedTimestamp: 0,
                        quantity: 1,
                    }));
                // Build purchased list from InstanceBookings + existing bookedItems
                const instancePurchased: CartItem[] = instanceBookings
                    .filter(b => b.userId === currentUser.id)
                    .map(b => {
                        const inst = allInstances.find(i => i.instanceId === b.instanceId);
                        return {
                            id: b.id,
                            name: inst?.title ?? b.instanceId,
                            type: 'event' as const,
                            image: inst?.coverImage ?? '',
                            date: inst?.date ?? b.bookedAt.slice(0, 10),
                            sortableDate: inst?.date ?? b.bookedAt.slice(0, 10),
                            fullPrice: b.totalPaid,
                            depositPrice: b.totalPaid,
                            paymentOption: 'full' as const,
                            bookedTimestamp: new Date(b.bookedAt).getTime(),
                            quantity: 1,
                        };
                    });
                return <CheckoutPage
                    currentUser={currentUser}
                    watchlist={[...instanceWatchlist, ...watchlist]}
                    bookedItems={[...instancePurchased, ...bookedItems]}
                    venues={appVenues}
                    cartItems={cartItems}
                    onRemoveItem={(id) => {
                        setCartItems(prev => prev.filter(i => i.id !== id));
                        setWatchlist(prev => prev.filter(i => i.id !== id));
                    }}
                    onUpdatePaymentOption={(id, opt) => setCartItems(prev => prev.map(i => i.id === id ? { ...i, paymentOption: opt } : i))}
                    onConfirmCheckout={handleConfirmCheckout}
                    onMoveToCart={handleMoveToCart}
                    onViewReceipt={(item) => handleNavigate('bookingConfirmed', { items: [item] })}
                    userTokenBalance={userTokenBalance}
                    onStartChat={handleStartBookingChat}
                    onCancelRsvp={(item) => {
                        // Remove from instanceBookings if it was a confirmed event
                        const meta = Object.entries(cartInstanceMeta).find(([cId]) => cId === item.id || item.id.startsWith('ib-'));
                        if (item.id.startsWith('ib-')) {
                            setInstanceBookings(prev => prev.filter(b => b.id !== item.id));
                        } else {
                            setBookedItems(prev => prev.filter(b => b.id !== item.id));
                        }
                        showToast('Booking cancelled.', 'success');
                    }}
                    initialTab={pageParams.initialTab ?? 'cart'}
                    onNavigate={handleNavigate}
                />;}
            case 'eventChatsList':
                return <EventChatsListPage 
                    currentUser={currentUser} 
                    onNavigate={handleNavigate} 
                    eventChats={mockEventChats} 
                    guestlistChats={mockGuestlistChats} 
                    wingmanChats={wingmanChats}
                    allEvents={appEvents} 
                    venues={appVenues} 
                    wingmen={appWingmen} 
                    allUsers={appUsers} 
                />;
            case 'guestlistChats':
                return <GuestlistChatsPage 
                    currentUser={currentUser} 
                    guestlistChats={guestlistChats} 
                    venues={appVenues} 
                    wingmen={appWingmen} 
                    onViewChat={(id) => handleNavigate('guestlistChat', { chatId: id })} 
                />;
            case 'eventChat':
                return <EventChatPage 
                    chatId={pageParams.chatId} 
                    currentUser={currentUser} 
                    messages={eventChatMessages} 
                    allParticipants={[...appUsers, ...appWingmen]} 
                    allEvents={appEvents} 
                    eventChats={eventChats} 
                    onSendMessage={(id, text) => {
                        const newMsg: EventChatMessage = {
                            id: Date.now(),
                            chatId: id,
                            senderId: currentUser.id,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setEventChatMessages(prev => [...prev, newMsg]);
                    }} 
                    onBack={() => handleNavigate('eventChatsList')} 
                />;
            case 'guestlistChat':
                return <GuestlistChatPage 
                    chatId={pageParams.chatId} 
                    currentUser={currentUser} 
                    messages={guestlistChatMessages} 
                    allUsers={appUsers} 
                    allWingmen={appWingmen} 
                    guestlistChats={guestlistChats} 
                    venues={appVenues} 
                    onSendMessage={(id, text) => {
                        const newMsg: GuestlistChatMessage = {
                            id: Date.now(),
                            chatId: id,
                            senderId: currentUser.id,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setGuestlistChatMessages(prev => [...prev, newMsg]);
                    }} 
                    onBack={() => handleNavigate('guestlistChats')} 
                    bookedItems={bookedItems}
                />;
            case 'friendZoneChat':
                return <FriendZoneChatPage 
                    chatId={pageParams.chatId} 
                    currentUser={currentUser} 
                    chats={friendZoneChats} 
                    messages={friendZoneChatMessages} 
                    wingmen={appWingmen} 
                    users={appUsers} 
                    onSendMessage={(id, text) => {
                        const newMsg: FriendZoneChatMessage = {
                            id: Date.now(),
                            chatId: id,
                            senderId: currentUser.id,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setFriendZoneChatMessages(prev => [...prev, newMsg]);
                    }} 
                    onAddWingman={(cId, pId) => {
                         setFriendZoneChats(prev => prev.map(c => {
                             if (c.id === cId) {
                                 const currentWingmen = c.wingmanIds || [];
                                 if (!currentWingmen.includes(pId)) {
                                     return { ...c, wingmanIds: [...currentWingmen, pId] };
                                 }
                             }
                             return c;
                         }));
                         const wingman = appWingmen.find(p => p.id === pId);
                         if (wingman) {
                             const msg: FriendZoneChatMessage = {
                                 id: Date.now(),
                                 chatId: cId,
                                 senderId: pId,
                                 text: `Joined the chat. Let's make some plans! 🥂`,
                                 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                             };
                             setFriendZoneChatMessages(prev => [...prev, msg]);
                         }
                         showToast('Wingman added', 'success');
                    }} 
                    onRemoveWingman={(cId, pId) => {
                        setFriendZoneChats(prev => prev.map(c => {
                            if (c.id === cId) {
                                const currentWingmen = c.wingmanIds || [];
                                return { ...c, wingmanIds: currentWingmen.filter(id => id !== pId) };
                            }
                            return c;
                        }));
                        showToast('Wingman removed', 'success');
                    }} 
                    onBack={() => handleNavigate('friendsZone')} 
                    onAddMember={(cId, uId) => {
                        setFriendZoneChats(prev => prev.map(c => c.id === cId && !c.memberIds.includes(uId) ? { ...c, memberIds: [...c.memberIds, uId] } : c));
                        showToast('Member added', 'success');
                    }} 
                    onRemoveMember={(cId, uId) => {
                        setFriendZoneChats(prev => prev.map(c => c.id === cId ? { ...c, memberIds: c.memberIds.filter(id => id !== uId) } : c));
                        showToast('Member removed', 'success');
                    }} 
                    onLeaveChat={(cId) => {
                        setFriendZoneChats(prev => prev.map(c => c.id === cId ? { ...c, memberIds: c.memberIds.filter(id => id !== currentUser.id) } : c));
                        handleNavigate('friendsZone');
                        showToast('Left chat', 'success');
                    }} 
                />;
            case 'wingmanStats':
                return <WingmanStatsPage 
                    currentUser={currentUser} 
                    bookedItems={bookedItems} 
                    guestlistRequests={guestlistJoinRequests} 
                    users={appUsers} 
                    onNavigate={handleNavigate} 
                />;
            case 'paymentMethods':
                return <PaymentMethodsPage 
                    onNavigate={handleNavigate} 
                    showToast={showToast} 
                    paymentMethods={paymentMethods}
                    onUpdateMethods={setPaymentMethods}
                />;
            case 'favorites':
                return <FavoritesPage 
                    wingmen={appWingmen} 
                    onSelectWingman={(p) => handleNavigate('wingmanProfile', { wingmanId: p.id })} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'wingman')} 
                    onNavigate={handleNavigate} 
                    favoriteVenueIds={currentUser.favoriteVenueIds || []} 
                    onToggleVenueFavorite={(id) => handleToggleFavorite(id, 'venue')} 
                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })} 
                    currentUser={currentUser} 
                    events={appEvents}
                    venues={appVenues}
                    likedEventIds={likedEventIds}
                    onToggleLikeEvent={handleToggleLikeEvent}
                    bookmarkedEventIds={bookmarkedEventIds}
                    onToggleBookmarkEvent={handleToggleBookmarkEvent}
                    onViewEvent={(e) => handleNavigate('eventTimeline')}
                    likedExperienceIds={likedExperienceIds}
                    experiences={experiences}
                    onToggleLikeExperience={handleToggleLikeExperience}
                    bookmarkedExperienceIds={bookmarkedExperienceIds}
                    onToggleBookmarkExperience={handleToggleBookmarkExperience}
                />;
            case 'venueDetails': {
                const venue = appVenues.find(v => v.id === pageParams.venueId);
                if (!venue) return <div>Venue not found</div>;
                return <VenueDetailsPage 
                    venue={venue} 
                    onBack={() => handleNavigate('home')} 
                    onBookVenue={handleBookVenue} 
                    isFavorite={(currentUser.favoriteVenueIds || []).includes(venue.id)} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'venue')} 
                    currentUser={currentUser} 
                    onUpdateVenue={(v) => setAppVenues(prev => prev.map(old => old.id === v.id ? v : old))} 
                    wingmen={appWingmen} 
                    onBookWithSpecificWingman={(p, v) => setActiveModal({ type: 'booking', wingman: p, venue: v })} 
                    onJoinGuestlist={(p, v) => handleOpenGuestlistModal({ wingman: p, venue: v })} 
                    guestlistJoinRequests={guestlistJoinRequests} 
                    onCheckIn={(vId, data) => {
                        // Mark the active guestlist request for this venue as checked-in
                        setGuestlistJoinRequests(prev => prev.map(r =>
                            r.venueId === vId && r.userId === currentUser.id
                                ? { ...r, attendanceStatus: 'show' as const }
                                : r
                        ));
                        showToast('Check-in successful! Welcome. 🎉', 'success');
                    }} 
                />;
            }
            case 'help': return <HelpPage onNavigate={handleNavigate} />;
            case 'reportIssue': return <ReportIssuePage onNavigate={handleNavigate} />;
            case 'privacy': return <PrivacyPage onNavigate={handleNavigate} onDeleteAccountRequest={() => showToast('Account deletion request submitted. Our team will follow up via email.', 'success')} />;
            case 'security': return <SecurityPage onNavigate={handleNavigate} />;
            case 'notificationsSettings': return <NotificationsSettingsPage
                settings={notificationSettings}
                onSettingsChange={(s) => { handleNotificationSettingsChange(s); showToast('Notification preferences saved.', 'success'); }}
                onNavigate={handleNavigate}
                pushEnabled={currentUser?.notificationsEnabled ?? false}
                onEnablePush={handleEnableNotifications}
            />;
            case 'cookieSettings': return <CookieSettingsPage onNavigate={handleNavigate} onSave={() => showToast('Cookie preferences saved.', 'success')} />;
            case 'dataExport': return <DataExportPage requests={mockDataExportRequests} onNewRequest={() => showToast('Data export request submitted. You will receive an email within 48 hours.', 'success')} onNavigate={handleNavigate} />;
            case 'tokenWallet': return <TokenWalletPage onNavigate={handleNavigate} transactions={[]} />;
            case 'editProfile': return <EditProfilePage 
                currentUser={currentUser} 
                onSave={handleUpdateUserWithRewardCheck} 
                onNavigate={handleNavigate} 
                showToast={showToast} 
            />;
            case 'referFriend': return <ReferFriendPage />;
            default: return <HomeScreen
                    onNavigate={handleNavigate}
                    currentUser={currentUser}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onRequestAccess={() => setIsMembershipRequestOpen(true)}
                />;
        }
    };

    if (!currentUser) return null; // Render guard

    // ── Gated Access Gate ────────────────────────────────────────
    // This MUST be the first thing unauthenticated users see.
    // It prevents OnboardingModal (z-100) from overlaying the gate.
    if (!isLoggedInUser && !passcodeAccessActive) {
        const handleLogin = (email: string, _password: string, stayLoggedIn: boolean = true): boolean => {
            // Match user by email (password check is simulated — replace with real auth when backend is ready)
            const found = appUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (found) {
                setCurrentUser(found);
                grantPasscodeAccess(found.email);
                // Only persist session to localStorage if "Stay logged in" is checked
                if (stayLoggedIn) {
                    localStorage.setItem('wingman_currentUserId', found.id.toString());
                } else {
                    sessionStorage.setItem('wingman_currentUserId_session', found.id.toString());
                    localStorage.removeItem('wingman_currentUserId');
                }
                setPasscodeAccessActive(true);
                setCurrentPage('home');
                return true;
            }
            return false;
        };
        return (
            <WelcomePage
                onAccessGranted={handleAccessGranted}
                onLoginInstead={handleLoginInstead}
                onLogin={handleLogin}
            />
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <>
                    {/* ── Passcode 24h deadline banner ── */}
                    {isPasscodeOnlyUser && passcodeTimeRemaining > 0 && (
                        <div
                            className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between gap-2 px-4 py-2 text-[11px]"
                            style={{ background: 'rgba(14,165,233,0.95)', backdropFilter: 'blur(8px)' }}
                        >
                            <span className="text-white font-semibold">
                                ⏱ {formatTimeRemaining(passcodeTimeRemaining)} · Create your profile to keep access
                            </span>
                            <button
                                onClick={() => handleNavigate('profile')}
                                className="font-bold text-white underline underline-offset-2 whitespace-nowrap"
                            >
                                Create Profile →
                            </button>
                        </div>
                    )}
                    {currentPage !== 'home' && (
                        <Header 
                            title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} 
                            onOpenMenu={() => setIsMenuOpen(true)} 
                            onOpenNotifications={() => setIsNotificationsOpen(true)} 
                            onOpenGroupChat={() => handleNavigate('accessGroups')} 
                            currentUser={currentUser} 
                            onOpenCart={() => setIsCartOpen(true)} 
                            cartItemCount={cartItems.length} 
                            tokenBalance={userTokenBalance} 
                            balanceJustUpdated={false}
                            showMenu={true}
                        />
                    )}
                    
                    <main className="pb-20">
                        {renderPage()}
                    </main>

                    {currentUser.role === UserRole.WINGMAN ? (
                        <WingmanBottomNavBar currentPage={currentPage} onNavigate={handleNavigate} cartItemCount={cartItems.length} />
                    ) : (
                        <BottomNavBar 
                            currentUser={currentUser} 
                            currentPage={currentPage} 
                            onNavigate={handleNavigate} 
                            cartItemCount={cartItems.length} 
                            onOpenMenu={() => setIsMenuOpen(true)} 
                        />
                    )}

                    <SideMenu 
                        isOpen={isMenuOpen} 
                        onClose={() => setIsMenuOpen(false)} 
                        onNavigate={handleNavigate} 
                        currentPage={currentPage} 
                        currentUser={currentUser} 
                        onLogout={handleLogout}
                    />

                    <CartPanel 
                        isOpen={isCartOpen} 
                        onClose={() => setIsCartOpen(false)} 
                        cartItems={cartItems} 
                        onRemoveItem={handleRemoveCartItem} 
                        onNavigateToCheckout={() => {
                            setIsCartOpen(false);
                            handleCheckout();
                        }}
                        totalPrice={cartItems.reduce((sum, item) => sum + (item.paymentOption === 'full' ? (item.fullPrice || 0) : (item.depositPrice || 0)), 0)} 
                    />

                    <NotificationsPanel 
                        isOpen={isNotificationsOpen} 
                        onClose={() => setIsNotificationsOpen(false)} 
                        notifications={notifications} 
                        onNavigate={(link) => { 
                            setIsNotificationsOpen(false); 
                            if (link) handleNavigate(link.page, link.params); 
                        }} 
                    />

                    {/* Membership Access Request Modal — separate from wingman application flow */}
                    <MembershipRequestModal
                        isOpen={isMembershipRequestOpen}
                        onClose={() => setIsMembershipRequestOpen(false)}
                        currentUser={currentUser}
                        onSubmit={handleSubmitMembershipRequest}
                        alreadySubmitted={membershipRequests.some(r => r.userId === currentUser.id && r.status === 'pending')}
                    />

                    {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}


                    {/* Global Modals */}
                    {activeModal?.type === 'booking' && (
                        <BookingFlow 
                            wingman={activeModal.wingman} 
                            onClose={() => setActiveModal(null)} 
                            onAddToCart={handleAddToCart} 
                            currentUser={currentUser} 
                            initialVenue={activeModal.venue} 
                            initialDate={activeModal.date} 
                            tableBookings={{}} 
                            onNavigateToCheckout={() => {
                                setActiveModal(null);
                                handleNavigate('checkout');
                            }}
                            onKeepBooking={() => setActiveModal(null)} 
                            venues={appVenues} 
                        />
                    )}
                    
                    {activeModal?.type === 'experienceBooking' && (
                        <ExperienceBookingFlow 
                            experience={activeModal.experience} 
                            user={currentUser} 
                            onClose={() => setActiveModal(null)} 
                            onAddToCart={handleAddToCart} 
                            onNavigateToCheckout={() => {
                                setActiveModal(null);
                                handleNavigate('checkout');
                            }}
                            onKeepBooking={() => setActiveModal(null)} 
                        />
                    )}

                    {activeModal?.type === 'eventBooking' && (
                        <EventBookingFlow
                            event={activeModal.event}
                            currentUser={currentUser}
                            onClose={() => setActiveModal(null)} 
                            onAddToCart={handleAddToCart} 
                            onNavigateToCheckout={() => {
                                setActiveModal(null);
                                handleNavigate('checkout');
                            }}
                            onKeepBooking={() => setActiveModal(null)}
                        />
                    )}

                    {activeModal?.type === 'guestlist' && (
                        <GuestlistModal 
                            isOpen={true} 
                            onClose={() => setActiveModal(null)} 
                            context={{ wingman: activeModal.wingman, venue: activeModal.venue, date: activeModal.date }} 
                            onConfirmJoin={handleJoinGuestlistConfirm} 
                            currentUser={currentUser} 
                            bookedItems={bookedItems} 
                            onViewProfile={(u) => handleNavigate('userProfile')} 
                        />
                    )}

                    {activeModal?.type === 'guestlistSuccess' && (
                        <GuestlistJoinSuccessModal 
                            isOpen={true} 
                            onClose={() => setActiveModal(null)} 
                            onNavigateToPlans={() => {
                                setActiveModal(null);
                                handleNavigate('checkout', { initialTab: 'cart' });
                            }}
                            venueName={activeModal.venueName} 
                            date={activeModal.date} 
                            isVip={activeModal.isVip} 
                        />
                    )}

                    {activeModal?.type === 'wingmanSelection' && (
                        <SelectWingmanModal
                            isOpen={true}
                            onClose={() => setActiveModal(null)} 
                            venue={activeModal.venue}
                            wingmen={appWingmen}
                            onSelectWingman={(wingman) => {
                                if (activeModal?.type === 'wingmanSelection' && activeModal.venue) {
                                    const currentVenue = activeModal.venue;
                                    setActiveModal({ type: 'booking', wingman, venue: currentVenue });
                                }
                            }}
                        />
                    )}

                    {showNotificationsPrompt && (
                        <NotificationsModal
                            onClose={handleCloseNotificationsPrompt}
                            onEnable={handleEnableNotifications}
                            onManagePreferences={() => {
                                handleCloseNotificationsPrompt();
                                handleNavigate('notificationsSettings');
                            }}
                        />
                    )}

                    <AdminAddUserModal 
                        isOpen={isAdminAddUserOpen}
                        onClose={() => setIsAdminAddUserOpen(false)}
                        onSave={handleAdminAddUser}
                    />
                    
                    {userToEdit && (
                        <AdminEditUserModal 
                            user={userToEdit}
                            isOpen={!!userToEdit}
                            onClose={() => setUserToEdit(null)}
                            onSave={handleAdminEditUser}
                        />
                    )}
                    
                    <AdminEditWingmanModal 
                        isOpen={!!wingmanToEdit}
                        onClose={() => setWingmanToEdit(null)}
                        data={wingmanToEdit}
                        onSave={handleAdminEditWingman}
                    />
                    
                    <AdminEditEventModal 
                        isOpen={isAdminEditEventOpen}
                        onClose={() => setIsAdminEditEventOpen(false)}
                        event={eventToEdit}
                        venues={appVenues}
                        onSave={(e) => {
                            if (eventToEdit) {
                                setAppEvents(prev => prev.map(ev => ev.id === e.id ? e : ev));
                            } else {
                                setAppEvents(prev => [...prev, { ...e, id: Date.now() }]);
                            }
                            setIsAdminEditEventOpen(false);
                            showToast('Event saved successfully', 'success');
                        }}
                    />
                    
                    <AdminEditVenueModal 
                        isOpen={isAdminEditVenueOpen}
                        onClose={() => setIsAdminEditVenueOpen(false)}
                        venue={venueToEdit}
                        onSave={(v) => {
                             if (venueToEdit) {
                                setAppVenues(prev => prev.map(vn => vn.id === v.id ? v : vn));
                            } else {
                                setAppVenues(prev => [...prev, { ...v, id: Date.now() }]);
                            }
                            setIsAdminEditVenueOpen(false);
                            showToast('Venue saved successfully', 'success');
                        }}
                    />
                    
                    <AdminEditStoreItemModal 
                        isOpen={isAdminEditStoreItemOpen}
                        onClose={() => setIsAdminEditStoreItemOpen(false)}
                        item={storeItemToEdit}
                        onSave={(item) => {
                            if (storeItemToEdit) {
                                setAppStoreItems(prev => prev.map(it => it.id === item.id ? item : it));
                            } else {
                                setAppStoreItems(prev => [...prev, { ...item, id: `item-${Date.now()}` }]);
                            }
                            setIsAdminEditStoreItemOpen(false);
                            showToast('Store item saved', 'success');
                        }}
                    />
                    
                    <StoreItemPreviewModal 
                        isOpen={!!previewStoreItem}
                        onClose={() => setPreviewStoreItem(null)}
                        item={previewStoreItem}
                    />
                    
                    <UserProfilePreviewModal 
                        isOpen={!!previewUser}
                        onClose={() => setPreviewUser(null)}
                        user={previewUser}
                    />
                </>
        </div>
    );
};
