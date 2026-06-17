import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { hasActivePasscodeSession, grantPasscodeAccess, getAccessSession, getPasscodeLeads, formatTimeRemaining, markLeadAsConverted, PasscodeLead } from './utils/accessControl';
import { User, Page, Wingman, Venue, Event, EventInstance, CartItem, AccessGroup, Itinerary, FriendZoneChat, AppNotification, UserRole, UserAccessLevel, Experience, GuestlistJoinRequest, EventInvitation, WingmanApplication, ExperienceInvitationRequest, GroupJoinRequest, PaymentMethod, StoreItem, EventInvitationRequest as EventInvitationReq, FriendZoneChatMessage, Challenge, GuestlistChat, EventChat, GuestlistChatMessage, EventChatMessage, PushCampaign, MembershipRequest, InstanceBooking, WingmanChat, WingmanChatMessage, GroupMessage, WingmanRequest } from './types';
import { users, wingmen, venues, events, experiences, challenges, storeItems, accessGroups, itineraries, mockNotifications, mockFriendZoneChats, mockGuestlistChats, mockEventChats, mockEventChatMessages, mockGuestlistChatMessages, mockFriendZoneChatMessages, mockInvitationRequests, mockEventInvitations, mockGuestlistJoinRequests, mockWingmanApplications, mockDataExportRequests, mockPaymentMethods, mockWingmanChats, mockWingmanChatMessages } from './data/mockData';
import { generateEventFeed, DEFAULT_EVENTS } from './utils/eventSchedule';

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
import { HireWingmanPage, HireRequest } from './components/HireWingmanPage';
import { WelcomePage } from './components/WelcomePage';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { supabase } from './lib/supabase';
import { NewUserOnboarding, ProfileGateBanner, isOnboardingComplete, markOnboardingComplete, verifyUserPassword, hasUserPassword, ONBOARDING_DISMISSED_KEY, type OnboardingProfile } from './components/NewUserOnboarding';

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
            if (!saved) return users;
            // Merge: seed users (e.g. the admin account) are always kept fresh by id,
            // so a stale cached list can never drop or out-date them — while any
            // user-created accounts (non-seed ids) are preserved.
            const parsed: User[] = JSON.parse(saved);
            const seedIds = new Set(users.map(u => u.id));
            const savedNonSeed = parsed.filter(u => !seedIds.has(u.id));
            return [...users, ...savedNonSeed];
        } catch (e) {
            return users;
        }
    });
    // Passcode leads — tracked separately from appUsers for Access Control tab
    const [passcodLeads, setPasscodLeads] = useState<PasscodeLead[]>(() => getPasscodeLeads());
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
            return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
        } catch (e) {
            return DEFAULT_EVENTS;
        }
    });
    const [appVenues, setAppVenues] = useState<Venue[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_venues');
            if (!saved) return venues;
            const parsed: Venue[] = JSON.parse(saved);
            // Merge: ensure all seed venues exist (by id), then append admin-created ones
            const seedIds = new Set(venues.map(v => v.id));
            const savedNonSeed = parsed.filter(v => !seedIds.has(v.id));
            return [...venues, ...savedNonSeed];
        } catch (e) {
            return venues;
        }
    });
    const [appStoreItems, setAppStoreItems] = useState<StoreItem[]>(storeItems);
    // Venues/events visible to non-admin users (hidden items excluded)
    const visibleVenues = React.useMemo(() => appVenues.filter(v => !v.isHidden), [appVenues]);
    const [appChallenges, setAppChallenges] = useState<Challenge[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_challenges');
            return saved ? JSON.parse(saved) : challenges;
        } catch (e) {
            return challenges;
        }
    });
    
    // State
    // ── Guest placeholder — used when no real session exists ──────────────
    // IMPORTANT: id must NOT match any seed user id (1 or 999).
    // This object is never written to localStorage — the gate will fire.
    const GUEST_USER: User = {
        id: 0,
        name: 'Guest',
        email: '',
        profilePhoto: '',
        accessLevel: UserAccessLevel.GENERAL,
        role: UserRole.USER,
        status: 'active',
        approvalStatus: 'pending',
        subscriptionStatus: 'free_tier',
        joinDate: '',
    };

    const [currentUser, setCurrentUser] = useState<User>(() => {
        try {
            // FIX LB-2: check both localStorage (stayLoggedIn=true) and
            // sessionStorage (stayLoggedIn=false) so tab-session logins survive refresh
            const savedId =
                localStorage.getItem('wingman_currentUserId') ||
                sessionStorage.getItem('wingman_currentUserId_session');
            if (savedId) {
                const storedUsers = localStorage.getItem('wingman_users');
                const allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : users;
                const found = allUsers.find(u => u.id === parseInt(savedId, 10));
                if (found) return found;
            }
            // No session → return a neutral guest; gate will show
            return GUEST_USER;
        } catch {
            return GUEST_USER;
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

    const [currentPage, setCurrentPage] = useState<Page>(() => {
        // Deep-link support for /admin and /wingman
        try {
            const path = window.location.pathname.replace(/\/+$/, '');
            if (path === '/admin' && currentUser?.role === UserRole.ADMIN) return 'adminDashboard';
            if (path === '/wingman' && (currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.WINGMAN && currentUser?.accessLevel === UserAccessLevel.PROMO))) return 'wingmanDashboard';
        } catch {}
        return 'home';
    });
    const [pageParams, setPageParams] = useState<any>({});
    // Navigation history stack — enables true "Go Back" from any page
    const [pageHistory, setPageHistory] = useState<Array<{ page: Page; params: any }>>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalState>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showNotificationsPrompt, setShowNotificationsPrompt] = useState(false);
    // Onboarding state — must be declared early (used by handleAccessGranted)
    const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
        // Don't show if: user is logged in, session complete, onboarding already done, or dismissed this session
        const hasUserId = !!localStorage.getItem('wingman_currentUserId') ||
                          !!sessionStorage.getItem('wingman_currentUserId_session');
        if (hasUserId) return false;
        if (!hasActivePasscodeSession()) return false;
        if (isOnboardingComplete()) return false;
        if (sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true') return false;
        return true;
    });
    // Stores the booking the user attempted when the profile gate fired,
    // so we can replay it immediately after onboarding completes.
    const pendingBookingIntent = React.useRef<Omit<InstanceBooking, 'id' | 'bookedAt'> | null>(null);
    const [onboardingDismissed, setOnboardingDismissed] = useState(
        sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
    );
    
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_cart') || '[]'); } catch { return []; }
    });
    const [bookedItems, setBookedItems] = useState<CartItem[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_booked') || '[]'); } catch { return []; }
    });
    const [watchlist, setWatchlist] = useState<CartItem[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_watchlist') || '[]'); } catch { return []; }
    });
    const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
    const [userTokenBalance, setUserTokenBalance] = useState<number>(() => {
        try { return parseInt(localStorage.getItem('wingman_token_balance') ?? '2500', 10) || 2500; }
        catch { return 2500; }
    });
    const [tokenTransactions, setTokenTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('wingman_token_transactions');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
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
    const [groupJoinRequests, setGroupJoinRequests] = useState<GroupJoinRequest[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_group_join_requests') ?? '[]'); } catch { return []; }
    });
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_group_messages') ?? '[]'); } catch { return []; }
    });
    const [wingmanApplications, setWingmanApplications] = useState(mockWingmanApplications);
    // Membership access requests — separate system from WingmanApplication
    const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
    const [appHireRequests, setAppHireRequests] = useState<HireRequest[]>([]);
    const [isMembershipRequestOpen, setIsMembershipRequestOpen] = useState(false);

    const [wingmanRequests, setWingmanRequests] = useState<WingmanRequest[]>(() => {
        try {
            const saved = localStorage.getItem('wingman_requests');
            if (saved) return JSON.parse(saved);
        } catch {}
        return [
            {
                id: 1,
                userId: 10,
                userName: 'Sophia Ross',
                userEmail: 'sophia@example.com',
                userPhone: '+13055550143',
                wingmanId: 1,
                experienceTitle: 'Wingman @ Vendôme',
                dateRequested: '2026-06-22',
                message: 'Hey! I would love to join your table next Monday. Let me know if there is still room.',
                status: 'pending',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
                id: 2,
                userId: 11,
                userName: 'Marcus Vance',
                userEmail: 'marcus@example.com',
                userPhone: '+13055550198',
                wingmanId: 2,
                experienceTitle: 'Wingman @ Mona Club',
                dateRequested: '2026-06-23',
                message: 'Hello, I booked a spot for the Mona Club night, hoping to meet new people!',
                status: 'pending',
                timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
                id: 3,
                userId: 10,
                userName: 'Sophia Ross',
                userEmail: 'sophia@example.com',
                userPhone: '+13055550143',
                wingmanId: 1,
                experienceTitle: 'Wingman @ Mr. Jones',
                dateRequested: '2026-06-16',
                status: 'accepted',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            }
        ];
    });

    useEffect(() => {
        try {
            localStorage.setItem('wingman_requests', JSON.stringify(wingmanRequests));
        } catch {}
    }, [wingmanRequests]);

    // ── Recurring Event System ────────────────────────────────────────────────
    const [instanceBookings, setInstanceBookings] = useState<InstanceBooking[]>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_instance_bookings') || '[]'); }
        catch { return []; }
    });
    // pendingCartReservations: { [instanceId]: partySize } — spots held in cart awaiting payment
    const [pendingCartReservations, setPendingCartReservations] = useState<Record<string, number>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_pending_reservations') ?? '{}'); } catch { return {}; }
    });
    // cartInstanceMeta: { [cartItemId]: { instanceId, partySize } } — used at checkout to create InstanceBookings
    const [cartInstanceMeta, setCartInstanceMeta] = useState<Record<string, { instanceId: string; partySize: number }>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_cart_instance_meta') ?? '{}'); } catch { return {}; }
    });
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
    const [cancelMap, setCancelMap] = useState<Record<string, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_cancel_map') || '{}'); } catch { return {}; }
    });
    // forceSoldOutMap: { [instanceId]: true } — admin force sold-out instances
    const [forceSoldOutMap, setForceSoldOutMap] = useState<Record<string, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_force_soldout') || '{}'); } catch { return {}; }
    });
    // customArrivalMap: { [instanceId]: string } — admin custom meetup arrival times
    const [customArrivalMap, setCustomArrivalMap] = useState<Record<string, string>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_custom_arrival_map') || '{}'); } catch { return {}; }
    });
    // customInstanceMap: { [instanceId]: Partial<EventInstance> } — admin custom event instance overrides
    const [customInstanceMap, setCustomInstanceMap] = useState<Record<string, Partial<EventInstance>>>(() => {
        try { return JSON.parse(localStorage.getItem('wingman_custom_instances') || '{}'); } catch { return {}; }
    });

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
    // FIX LB-2: a user is "logged in" if their ID is in either storage
    // localStorage = stayLoggedIn=true, sessionStorage = stayLoggedIn=false (tab session)
    const isLoggedInUser =
        !!localStorage.getItem('wingman_currentUserId') ||
        !!sessionStorage.getItem('wingman_currentUserId_session');

    const [passcodeAccessActive, setPasscodeAccessActive] = useState<boolean>(() => {
        // Any user with a saved session (login or passcode) bypasses gate
        if (isLoggedInUser) return true;
        return hasActivePasscodeSession();
    });

    // Derived early — must be before any useEffect that references it (avoids TDZ crash)
    const isPasscodeOnlyUser = passcodeAccessActive && !isLoggedInUser;

    // On mount: if a passcode session exists (e.g. after page refresh), ensure the user
    // is registered in appUsers so the admin dashboard can always see them.
    useEffect(() => {
        if (isLoggedInUser) return;
        const session = getAccessSession();
        if (!session?.email) return;
        const normalizedEmail = session.email.trim().toLowerCase();
        setAppUsers(prev => {
            if (prev.some(u => u.email.toLowerCase() === normalizedEmail)) return prev;
            const newId = Date.now();
            return [...prev, {
                id: newId,
                name: session.fullName || session.email,
                email: normalizedEmail,
                profilePhoto: `https://i.pravatar.cc/150?u=${newId}`,
                accessLevel: UserAccessLevel.GENERAL,
                role: UserRole.USER,
                status: 'active' as const,
                approvalStatus: 'pending' as const,
                subscriptionStatus: 'free_tier' as const,
                joinDate: new Date().toISOString().split('T')[0],
            }];
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally once on mount

    // ── One-time purge of test accounts (runs once per device) ──────────────
    useEffect(() => {
        if (localStorage.getItem('wm_purge_v1') === 'done') return;
        const purgeEmails = [
            'djeemo4@gmail.com',
            'fashionmeetzfitness86@gmail.com',
            'andersonjeemo@gmail.com',
        ];
        // 1. Remove from wingman_users
        try {
            const raw = localStorage.getItem('wingman_users');
            if (raw) {
                const arr = JSON.parse(raw) as { email?: string }[];
                const filtered = arr.filter(u => !purgeEmails.includes((u.email || '').toLowerCase()));
                localStorage.setItem('wingman_users', JSON.stringify(filtered));
            }
        } catch {}
        // 2. Remove from wm_passcode_leads
        try {
            const raw = localStorage.getItem('wm_passcode_leads');
            if (raw) {
                const arr = JSON.parse(raw) as { email?: string }[];
                const filtered = arr.filter(l => !purgeEmails.includes((l.email || '').toLowerCase()));
                localStorage.setItem('wm_passcode_leads', JSON.stringify(filtered));
            }
        } catch {}
        // 3. Remove from React state
        setAppUsers(prev => prev.filter(u => !purgeEmails.includes((u.email || '').toLowerCase())));
        // 4. Fire-and-forget: delete from Supabase
        for (const email of purgeEmails) {
            void fetch('/.netlify/functions/delete-profile', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            }).catch(() => null);
        }
        // Mark done so this never runs again
        localStorage.setItem('wm_purge_v1', 'done');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Seed from ALL historical passcode leads (same-device) ───────────────
    // wm_passcode_leads stores every gate entrant permanently (even after
    // the 24h session expires). Merge them all into appUsers so the admin
    // always sees everyone who came through the gate on this device.
    useEffect(() => {
        const leads = getPasscodeLeads();
        if (!leads.length) return;
        setAppUsers(prev => {
            let updated = [...prev];
            let changed = false;
            for (const lead of leads) {
                const email = lead.email.toLowerCase();
                if (!updated.some(u => u.email.toLowerCase() === email)) {
                    const newId = Date.now() + Math.floor(Math.random() * 99999);
                    updated.push({
                        id: newId,
                        name: lead.fullName || lead.email,
                        email,
                        profilePhoto: `https://i.pravatar.cc/150?u=${newId}`,
                        accessLevel: UserAccessLevel.GENERAL,
                        role: UserRole.USER,
                        status: 'active' as const,
                        approvalStatus: 'pending' as const,
                        subscriptionStatus: 'free_tier' as const,
                        joinDate: lead.capturedAt
                            ? new Date(lead.capturedAt).toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0],
                    });
                    changed = true;
                }
            }
            return changed ? [...updated] : prev;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // once on mount

    // ── Fetch server-side leads for admin (cross-device) ─────────────────
    // Calls get-leads Netlify function — works WITHOUT a Supabase session
    // so the local mock admin account can pull cross-device data.
    // Merges both passcode leads and registered user profiles into appUsers.
    const fetchServerLeads = useCallback(async (adminEmail: string) => {
        if (!adminEmail) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            const res = await fetch('/.netlify/functions/get-leads', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) return;
            const json = await res.json();

            type LeadRow    = { email: string; full_name?: string; captured_at?: string };
            type ProfileRow = { id: string; name: string; email: string; phone?: string; city?: string; profile_photo?: string; approval_status?: string; created_at?: string };

            const serverLeads: LeadRow[]       = json.leads    || [];
            const serverProfiles: ProfileRow[] = json.profiles || [];

            setAppUsers(prev => {
                let updated = [...prev];
                let changed = false;

                // Merge passcode leads
                for (const lead of serverLeads) {
                    const email = (lead.email || '').toLowerCase();
                    if (!email) continue;
                    if (!updated.some(u => u.email.toLowerCase() === email)) {
                        const newId = Date.now() + Math.floor(Math.random() * 99999);
                        updated.push({
                            id: newId,
                            name: lead.full_name || lead.email,
                            email,
                            profilePhoto: `https://i.pravatar.cc/150?u=${newId}`,
                            accessLevel: UserAccessLevel.GENERAL,
                            role: UserRole.USER,
                            status: 'active' as const,
                            approvalStatus: 'pending' as const,
                            subscriptionStatus: 'free_tier' as const,
                            joinDate: lead.captured_at
                                ? new Date(lead.captured_at).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                        });
                        changed = true;
                    }
                }

                const rolesMap = json.roles || {};

                // Merge registered user profiles
                for (const profile of serverProfiles) {
                    const email = (profile.email || '').toLowerCase();
                    if (!email) continue;
                    
                    const roleData = rolesMap[email];
                    const serverRole = roleData?.role || UserRole.USER;
                    const serverAccess = roleData?.accessLevel || UserAccessLevel.GENERAL;
                    
                    const existingIdx = updated.findIndex(u => u.email.toLowerCase() === email);
                    if (existingIdx === -1) {
                        // New user not seen on this device — add them
                        const newId = Number(profile.id) || (Date.now() + Math.floor(Math.random() * 99999));
                        updated.push({
                            id: newId,
                            name: profile.name || email,
                            email,
                            phoneNumber: profile.phone,
                            city: profile.city,
                            profilePhoto: profile.profile_photo || `https://i.pravatar.cc/150?u=${newId}`,
                            accessLevel: serverAccess as any,
                            role: serverRole as any,
                            status: 'active' as const,
                            approvalStatus: (profile.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
                            subscriptionStatus: 'free_tier' as const,
                            joinDate: profile.created_at
                                ? new Date(profile.created_at).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0],
                        });
                        changed = true;
                    } else {
                        // FIX: sync ALL user-owned fields from Supabase, not just approvalStatus.
                        // Since register-profile is now called on every profile save,
                        // Supabase always has the freshest name/phone/city/photo.
                        const existing = updated[existingIdx];
                        const serverStatus = (profile.approval_status as 'pending' | 'approved' | 'rejected') || 'pending';
                        const patch: Partial<typeof existing> = {};

                        if (profile.name && profile.name !== existing.name)                       patch.name          = profile.name;
                        if (profile.phone && profile.phone !== existing.phoneNumber)               patch.phoneNumber   = profile.phone;
                        if (profile.city && profile.city !== existing.city)                        patch.city          = profile.city;
                        if (profile.profile_photo && profile.profile_photo !== existing.profilePhoto) patch.profilePhoto = profile.profile_photo;
                        if (existing.approvalStatus !== serverStatus)                              patch.approvalStatus = serverStatus;
                        if (existing.role !== serverRole)                                          patch.role          = serverRole as any;
                        if (existing.accessLevel !== serverAccess)                                  patch.accessLevel   = serverAccess as any;

                        if (Object.keys(patch).length > 0) {
                            updated[existingIdx] = { ...existing, ...patch };
                            changed = true;
                        }
                    }
                }

                return changed ? [...updated] : prev;
            });
        } catch { /* silent fail — function may not be deployed yet */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Run once on mount
    useEffect(() => {
        void fetchServerLeads(currentUser.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch THIS client's own approval status from the server. The admin-only
    // get-leads sync never reaches a regular client, so without this a client
    // can't see that an admin approved them — and the booking gate stays locked.
    useEffect(() => {
        const email = currentUser.email?.trim().toLowerCase();
        if (!email) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/.netlify/functions/get-approval-status?email=${encodeURIComponent(email)}`);
                if (!res.ok) return;
                const { status, role, accessLevel } = await res.json();
                if (cancelled) return;
                
                const updates: Partial<User> = {};
                let changed = false;
                
                if (status && status !== currentUser.approvalStatus) {
                    updates.approvalStatus = status;
                    changed = true;
                }
                if (role && role !== currentUser.role) {
                    updates.role = role as any;
                    changed = true;
                }
                if (accessLevel && accessLevel !== currentUser.accessLevel) {
                    updates.accessLevel = accessLevel as any;
                    changed = true;
                }
                
                if (changed) {
                    setCurrentUser(prev => ({ ...prev, ...updates }));
                    setAppUsers(prev => prev.map(u =>
                        u.email?.toLowerCase() === email ? { ...u, ...updates } : u
                    ));
                }
            } catch { /* ignore — keep local status */ }
        })();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.email]);

    // Keep the logged-in user's own approval status in sync with the synced
    // user list. Without this, an admin approval lands in appUsers but the
    // booking gate (which reads currentUser.approvalStatus) stays locked until
    // a full re-login. Match by email since ids can differ across devices.
    useEffect(() => {
        const email = currentUser.email?.toLowerCase();
        if (!email) return;
        const fresh = appUsers.find(u => u.email?.toLowerCase() === email);
        if (fresh) {
            let changed = false;
            const updates: Partial<User> = {};
            if (fresh.approvalStatus && fresh.approvalStatus !== currentUser.approvalStatus) {
                updates.approvalStatus = fresh.approvalStatus;
                changed = true;
            }
            if (fresh.role && fresh.role !== currentUser.role) {
                updates.role = fresh.role;
                changed = true;
            }
            if (changed) {
                setCurrentUser(prev => ({ ...prev, ...updates }));
            }
        }
    }, [appUsers, currentUser.email, currentUser.approvalStatus, currentUser.role]);

    // Ensure the active logged-in Wingman is present in the appWingmen list
    useEffect(() => {
        if (currentUser && currentUser.role === UserRole.WINGMAN && currentUser.accessLevel === UserAccessLevel.PROMO) {
            setAppWingmen(prev => {
                const exists = prev.some(w => w.id === currentUser.id);
                if (exists) return prev;
                const newWingman: Wingman = {
                    id: currentUser.id,
                    name: currentUser.name,
                    handle: currentUser.instagramHandle ? `@${currentUser.instagramHandle}` : `@${currentUser.name.replace(/\s/g, '').toLowerCase()}`,
                    rating: 5.0,
                    bio: currentUser.bio || `Professional Wingman`,
                    profilePhoto: currentUser.profilePhoto || `https://i.pravatar.cc/150?u=${currentUser.id}`,
                    city: currentUser.city || 'Miami',
                    weeklySchedule: [],
                    assignedVenueIds: [],
                    earnings: 0,
                    isOnline: true,
                    favoritedByCount: 0,
                    galleryImages: currentUser.galleryImages || []
                };
                return [...prev, newWingman];
            });
        }
    }, [currentUser]);


    // Keep the URL in sync with the admin dashboard so /admin is shareable
    // and survives a refresh.
    useEffect(() => {
        try {
            const path = window.location.pathname.replace(/\/+$/, '');
            if (currentPage === 'adminDashboard' && path !== '/admin') {
                window.history.replaceState({}, '', '/admin');
            } else if (currentPage === 'wingmanDashboard' && path !== '/wingman') {
                window.history.replaceState({}, '', '/wingman');
            } else if (currentPage !== 'adminDashboard' && currentPage !== 'wingmanDashboard' && (path === '/admin' || path === '/wingman')) {
                window.history.replaceState({}, '', '/');
            }
        } catch {}
    }, [currentPage]);

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
        // Pre-populate the guest user with the name+email they entered at the gate
        const session = getAccessSession();
        if (session?.fullName || session?.email) {
            setCurrentUser(prev => ({
                ...prev,
                name:  session.fullName  ? session.fullName  : prev.name,
                email: session.email     ? session.email     : prev.email,
            }));
        }

        // ── Register passcode user in appUsers so admin can see & approve them ─
        // Creates a pending record only if this email doesn't already have an account.
        if (session?.email) {
            const normalizedEmail = session.email.trim().toLowerCase();
            setAppUsers(prev => {
                const alreadyExists = prev.some(u => u.email.toLowerCase() === normalizedEmail);
                if (alreadyExists) return prev; // don't duplicate
                const newId = Date.now();
                const pendingUser: User = {
                    id: newId,
                    name: session.fullName || session.email,
                    email: normalizedEmail,
                    profilePhoto: `https://i.pravatar.cc/150?u=${newId}`,
                    accessLevel: UserAccessLevel.GENERAL,
                    role: UserRole.USER,
                    status: 'active',
                    approvalStatus: 'pending',
                    subscriptionStatus: 'free_tier',
                    joinDate: new Date().toISOString().split('T')[0],
                };
                return [...prev, pendingUser];
            });
            // Refresh the passcodLeads state so AdminDashboard sees the new lead immediately
            setPasscodLeads(getPasscodeLeads());
        }

        // Show onboarding only if not already completed AND not dismissed this session
        if (!isOnboardingComplete() && sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) !== 'true') {
            setShowOnboarding(true);
        }
    }, []);

    const handleLoginInstead = useCallback(() => {
        // Grant access for logged-in users — navigate to home
        setPasscodeAccessActive(true);
        setCurrentPage('home');
    }, []);

    // Persistence Effects
    useEffect(() => { localStorage.setItem('wingman_cart', JSON.stringify(cartItems)); }, [cartItems]);
    useEffect(() => { localStorage.setItem('wingman_booked', JSON.stringify(bookedItems)); }, [bookedItems]);
    useEffect(() => { localStorage.setItem('wingman_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
    // Persist booking system state so bookings survive page refresh
    useEffect(() => { try { localStorage.setItem('wingman_instance_bookings', JSON.stringify(instanceBookings)); } catch {} }, [instanceBookings]);
    useEffect(() => { try { localStorage.setItem('wingman_cancel_map', JSON.stringify(cancelMap)); } catch {} }, [cancelMap]);
    useEffect(() => { try { localStorage.setItem('wingman_force_soldout', JSON.stringify(forceSoldOutMap)); } catch {} }, [forceSoldOutMap]);
    useEffect(() => { try { localStorage.setItem('wingman_custom_arrival_map', JSON.stringify(customArrivalMap)); } catch {} }, [customArrivalMap]);
    useEffect(() => { try { localStorage.setItem('wingman_custom_instances', JSON.stringify(customInstanceMap)); } catch {} }, [customInstanceMap]);
    // Fix: persist cart checkout metadata so refresh mid-checkout doesn't break booking
    useEffect(() => { try { localStorage.setItem('wingman_cart_instance_meta', JSON.stringify(cartInstanceMeta)); } catch {} }, [cartInstanceMeta]);
    useEffect(() => { try { localStorage.setItem('wingman_pending_reservations', JSON.stringify(pendingCartReservations)); } catch {} }, [pendingCartReservations]);
    useEffect(() => { try { localStorage.setItem('wingman_group_join_requests', JSON.stringify(groupJoinRequests)); } catch {} }, [groupJoinRequests]);
    useEffect(() => { try { localStorage.setItem('wingman_group_messages', JSON.stringify(groupMessages)); } catch {} }, [groupMessages]);

    // Defensive scroll-lock cleanup: if a modal closed badly and left body in
    // position:fixed (iOS Safari scroll-lock technique), reset it on every nav.
    useEffect(() => {
        const body = document.body;
        const html = document.documentElement;
        const hasLiveModal = !!document.querySelector('[data-modal-backdrop]');
        if (!hasLiveModal) {
            if (body.style.position === 'fixed') body.style.position = '';
            if (body.style.top) body.style.top = '';
            if (body.style.left) body.style.left = '';
            if (body.style.right) body.style.right = '';
            if (body.style.overflow === 'hidden') body.style.overflow = '';
            if (html.style.overflow === 'hidden') html.style.overflow = '';
            body.classList.remove('modal-open');
        }
    }, [currentPage]);
    useEffect(() => { localStorage.setItem('wingman_users', JSON.stringify(appUsers)); }, [appUsers]);
    useEffect(() => { localStorage.setItem('wingman_wingmen', JSON.stringify(appWingmen)); }, [appWingmen]);
    useEffect(() => { localStorage.setItem('wingman_events', JSON.stringify(appEvents)); }, [appEvents]);
    useEffect(() => { localStorage.setItem('wingman_venues', JSON.stringify(appVenues)); }, [appVenues]);
    useEffect(() => { localStorage.setItem('wingman_challenges', JSON.stringify(appChallenges)); }, [appChallenges]);
    useEffect(() => { 
        // Only persist session for real logged-in users (id > 0).
        // Guest (id === 0) must never be written — that would bypass the gate.
        if (currentUser && currentUser.id > 0) {
            localStorage.setItem('wingman_currentUserId', currentUser.id.toString()); 
        }
    }, [currentUser]);
    // Persist token balance and transactions
    useEffect(() => { localStorage.setItem('wingman_token_balance', String(userTokenBalance)); }, [userTokenBalance]);
    useEffect(() => { try { localStorage.setItem('wingman_token_transactions', JSON.stringify(tokenTransactions)); } catch {} }, [tokenTransactions]);

    // Notification Prompt Effect — skip if onboarding is showing or user is in passcode-only session
    useEffect(() => {
        if (showOnboarding) return; // Don't show while onboarding modal is open
        if (isPasscodeOnlyUser) return; // Don't badger passcode users during their 24h window
        if (currentUser && !currentUser.notificationsEnabled) {
             const hasSeenPrompt = sessionStorage.getItem('notifications_prompt_seen');
             if (!hasSeenPrompt) {
                 const timer = setTimeout(() => setShowNotificationsPrompt(true), 3000);
                 return () => clearTimeout(timer);
             }
        }
    }, [currentUser, showOnboarding, isPasscodeOnlyUser]);

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
        if (page === 'back') {
            // Pop the history stack
            if (pageHistory.length > 0) {
                const prev = pageHistory[pageHistory.length - 1];
                setPageHistory(h => h.slice(0, -1));
                setCurrentPage(prev.page);
                setPageParams(prev.params ?? {});
            } else {
                // Nothing in history — fall back to home
                setCurrentPage('home');
                setPageParams({});
            }
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
            return;
        }
        // Push current page to history before navigating (skip home→home thrash)
        if (currentPage !== page) {
            setPageHistory(h => [...h.slice(-19), { page: currentPage, params: pageParams }]);
        }
        setCurrentPage(page);
        setPageParams(params);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStartFriendZoneChat = (userId: number, wingmanId: number) => {
        const existing = friendZoneChats.find(c => 
            (c.creatorId === wingmanId && c.memberIds.includes(userId)) || 
            (c.creatorId === userId && c.memberIds.includes(wingmanId)) ||
            (c.memberIds.includes(wingmanId) && c.memberIds.includes(userId) && c.memberIds.length === 2)
        );
        if (existing) {
            handleNavigate('friendZoneChat', { chatId: existing.id });
        } else {
            const newChatId = Date.now();
            const wingmanObj = appWingmen.find(w => w.id === wingmanId);
            const userObj = appUsers.find(u => u.id === userId);
            const newChat: FriendZoneChat = {
                id: newChatId,
                name: `${userObj?.name || 'User'} & ${wingmanObj?.name || 'Wingman'}`,
                creatorId: wingmanId,
                memberIds: [wingmanId, userId],
                wingmanIds: [wingmanId]
            };
            setFriendZoneChats(prev => [...prev, newChat]);
            handleNavigate('friendZoneChat', { chatId: newChatId });
        }
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

    const finalizeBooking = (
        paymentMethod: 'tokens' | 'usd' | 'cashapp',
        itemIds: string[],
        // When called from the Stripe-return handler after a full page reload,
        // the live cart state is stale/empty, so the caller passes the snapshot
        // captured at checkout time. Reading from these instead of component
        // state avoids the stale-closure bug (C4) that dropped bookings.
        overrides?: { items?: CartItem[]; meta?: Record<string, any> }
    ) => {
        const sourceItems = overrides?.items ?? cartItems;
        const sourceMeta = overrides?.meta ?? cartInstanceMeta;
        const itemsToBook = sourceItems.filter(i => itemIds.includes(i.id));
        const timestamp = Date.now();

        const newBookedItems = itemsToBook.map(item => ({
            ...item,
            bookedTimestamp: timestamp,
            isPlaceholder: false,
            paymentMethod,
        }));

        setBookedItems(prev => [...prev, ...newBookedItems]);
        setCartItems(prev => prev.filter(i => !itemIds.includes(i.id)));

        const newInstanceBookings: InstanceBooking[] = [];
        const allInst = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents, true);
        for (const id of itemIds) {
            const meta = sourceMeta[id];
            if (meta) {
                const matchedInstance = allInst.find(inst => inst.instanceId === meta.instanceId);
                const matchedCartItem = itemsToBook.find(i => i.id === id);
                newInstanceBookings.push({
                    id: `ib-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    instanceId: meta.instanceId,
                    userId: currentUser.id,
                    partySize: meta.partySize,
                    totalPaid: matchedCartItem?.fullPrice ?? 0,
                    bookedAt: new Date().toISOString(),
                    guestName: currentUser.name,
                    guestEmail: currentUser.email ?? '',
                    wingmanId: matchedInstance?.wingmanId,
                    hostId: matchedInstance?.hostId,
                    specialRequests: matchedCartItem?.tableDetails?.specialRequests || (matchedCartItem as any)?.specialRequests,
                });
                setPendingCartReservations(prev => {
                    const n = { ...prev }; delete n[meta.instanceId]; return n;
                });
            }
        }
        if (newInstanceBookings.length > 0) {
            setInstanceBookings(prev => [...prev, ...newInstanceBookings]);
        }
        setCartInstanceMeta(prev => {
            const n = { ...prev };
            itemIds.forEach(id => delete n[id]);
            return n;
        });

        setWatchlist(prev => prev.filter(w => !itemsToBook.some(b =>
            (b.type === 'event' && w.type === 'event' && b.eventDetails?.event.id === w.eventDetails?.event.id) ||
            (b.type === 'experience' && w.type === 'experience' && b.experienceDetails?.experience.id === w.experienceDetails?.experience.id) ||
            (b.id === w.id)
        )));

        handleNavigate('bookingConfirmed', { items: newBookedItems });
    };

    const priceForItem = (item: CartItem): number => {
        if (item.type === 'storeItem' && item.storeItemDetails) {
            return item.storeItemDetails.item.price;
        }
        return item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
    };

    const handleConfirmCheckout = async (paymentMethod: 'tokens' | 'usd' | 'cashapp', itemIds: string[]) => {
        if (paymentMethod === 'usd' || paymentMethod === 'cashapp') {
            const itemsToBook = cartItems.filter(i => itemIds.includes(i.id));
            if (itemsToBook.length === 0) {
                showToast('No items selected.', 'error');
                return;
            }

            // ── Build bookings payload ─────────────────────────────────────────
            // Event-feed items (have cartInstanceMeta) → use scheduleId for server-side pricing
            // Legacy items (table, experience, store) → send as generic line items with client price
            const scheduledBookings: { scheduleId: string; instanceId: string; quantity: number; cartItemId: string }[] = [];
            const genericItems: { cartItemId: string; name: string; unitPrice: number; quantity: number }[] = [];

            for (const item of itemsToBook) {
                const meta = cartInstanceMeta[item.id];
                if (meta?.instanceId) {
                    // Event-feed item — server resolves price from PRICE_SCHEDULE
                    const scheduleId = meta.instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '');
                    scheduledBookings.push({
                        scheduleId,
                        instanceId: meta.instanceId,
                        quantity: meta.partySize || 1,
                        cartItemId: item.id,
                    });
                } else {
                    // Legacy cart item — use client price (table reservation, experience, store item)
                    const unitPrice = priceForItem(item);
                    const quantity = item.quantity || 1;
                    genericItems.push({
                        cartItemId: item.id,
                        name: item.name || 'Wingman Experience',
                        unitPrice,
                        quantity,
                    });
                }
            }

            const totalAmount = [
                ...scheduledBookings, // prices resolved server-side
            ].reduce((s, _) => s, 0) + genericItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

            setIsCheckoutLoading(true);
            try {
                // Store FULL cart item data in pending_checkout so finalizeBooking
                // can reconstruct the booking even after a full page reload (Stripe redirect)
                localStorage.setItem('wingman_pending_checkout', JSON.stringify({
                    itemIds,
                    paymentMethod,
                    // Snapshot the cart items so they survive the Stripe redirect
                    itemsSnapshot: itemsToBook,
                    cartMetaSnapshot: Object.fromEntries(
                        itemIds
                            .filter(id => cartInstanceMeta[id])
                            .map(id => [id, cartInstanceMeta[id]])
                    ),
                }));

                const res = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookings: scheduledBookings,
                        genericItems,
                        userEmail: currentUser.email,
                        userId: String(currentUser.id),
                    }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({ error: 'Server error' }));
                    throw new Error(err.error || `Server error ${res.status}`);
                }

                const data = await res.json();

                if (data.url) {
                    // Paid event — redirect to Stripe
                    window.location.href = data.url;
                    return;
                }

                throw new Error(data.error || 'Could not start checkout. Please try again.');
            } catch (err: any) {
                localStorage.removeItem('wingman_pending_checkout');
                setIsCheckoutLoading(false);
                showToast(err.message || 'Checkout failed. Please try again.', 'error');
                return;
            }
        }

        finalizeBooking(paymentMethod, itemIds);
    };


    // Stripe return handler — runs once on mount when we land back from Stripe

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const sessionId = params.get('session_id');

        if (!paymentStatus) return;

        const cleanUrl = () => {
            const url = new URL(window.location.href);
            url.searchParams.delete('payment');
            url.searchParams.delete('session_id');
            window.history.replaceState({}, '', url.toString());
        };

        if (paymentStatus === 'cancelled') {
            localStorage.removeItem('wingman_pending_checkout');
            showToast('Payment cancelled.', 'error');
            cleanUrl();
            return;
        }

        if (paymentStatus === 'success' && sessionId) {
            (async () => {
                try {
                    const res = await fetch(`/.netlify/functions/verify-session?session_id=${encodeURIComponent(sessionId)}`);
                    const data = await res.json();
                    if (!data.paid) {
                        showToast('Payment not confirmed by Stripe.', 'error');
                        cleanUrl();
                        return;
                    }
                    const pending = JSON.parse(localStorage.getItem('wingman_pending_checkout') || 'null');
                    if (pending?.itemIds?.length) {
                        // Create the booking straight from the snapshot captured at
                        // checkout time. We pass the data explicitly so finalizeBooking
                        // never has to read live cart state (which is empty/stale after
                        // the Stripe redirect reload). No setTimeout — the booking is
                        // built synchronously from data we already hold.
                        finalizeBooking('usd', pending.itemIds, {
                            items: pending.itemsSnapshot,
                            meta: pending.cartMetaSnapshot,
                        });
                        showToast('Payment confirmed! Your booking is confirmed.', 'success');
                    }
                    // Only clear the pending record AFTER the booking was created, so a
                    // failure above leaves it intact for a retry instead of dropping a
                    // paid booking (C3).
                    localStorage.removeItem('wingman_pending_checkout');
                    cleanUrl();
                } catch (err: any) {
                    // Leave BOTH wingman_pending_checkout and the session_id in the URL
                    // intact, so simply reloading the page re-runs verification and
                    // creates the booking — rather than losing a paid booking (C3).
                    showToast(err.message || 'Could not verify payment. Refresh to retry.', 'error');
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                text: 'Thank you for contacting Wingman.\n\nFor immediate assistance, reservations, questions, information, or any concerns, please contact our concierge team directly at:\n\n📞 (305) 764-2406\n\nA member of our team will be happy to assist you with bookings, event details, VIP experiences, and support.\n\nWe look forward to helping elevate your experience.',
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
        const groupName = group?.name || 'group';
        showToast(`Request to join "${groupName}" sent! You'll be notified when approved.`, 'success');

        // Notify admin / group creator in the bell
        setNotifications(prev => [{
            id: Date.now() + 1,
            text: `👤 ${currentUser.name} wants to join "${groupName}"`,
            time: 'Just now',
            read: false,
            link: { page: 'accessGroupFeed' as Page, params: { groupId } },
            targetUserId: group?.creatorId,
        }, ...prev]);
    };

    const handleApproveGroupRequest = (requestId: number) => {
        const request = groupJoinRequests.find(r => r.id === requestId);
        if (!request) return;

        const group = appAccessGroups.find(g => g.id === request.groupId);
        const groupName = group?.name || 'group';

        // Add user to group's memberIds
        setAppAccessGroups(prev => prev.map(g =>
            g.id === request.groupId
                ? { ...g, memberIds: [...g.memberIds, request.userId] }
                : g
        ));

        // Update appUsers so the approved user's accessGroupIds is current
        setAppUsers(prev => prev.map(u =>
            u.id === request.userId
                ? { ...u, accessGroupIds: [...(u.accessGroupIds || []), request.groupId] }
                : u
        ));

        // If the currently logged-in user is the one being approved, update currentUser too
        if (request.userId === currentUser.id) {
            setCurrentUser(prev => ({
                ...prev,
                accessGroupIds: [...(prev.accessGroupIds || []), request.groupId],
            }));
        }

        setGroupJoinRequests(prev => prev.filter(r => r.id !== requestId));

        // Notify the approved user via bell
        setNotifications(prev => [{
            id: Date.now(),
            text: `✅ You've been approved to join "${groupName}"! Welcome to the community.`,
            time: 'Just now',
            read: false,
            link: { page: 'accessGroupFeed' as Page, params: { groupId: request.groupId } },
            targetUserId: request.userId,
        }, ...prev]);

        showToast(`${group ? `"${groupName}"` : 'Member'} approved!`, 'success');
    };

    const handleRejectGroupRequest = (requestId: number) => {
        const request = groupJoinRequests.find(r => r.id === requestId);
        if (!request) return;

        const group = appAccessGroups.find(g => g.id === request.groupId);
        const groupName = group?.name || 'group';

        setGroupJoinRequests(prev => prev.filter(r => r.id !== requestId));

        // Notify the rejected user
        setNotifications(prev => [{
            id: Date.now(),
            text: `Your request to join "${groupName}" was not approved at this time.`,
            time: 'Just now',
            read: false,
            targetUserId: request.userId,
        }, ...prev]);

        showToast('Request declined.', 'success');
    };

    const handleSendGroupMessage = (groupId: number, text: string) => {
        if (!text.trim()) return;
        const msg: GroupMessage = {
            id: Date.now(),
            groupId,
            userId: currentUser.id,
            userName: currentUser.name,
            userPhoto: currentUser.profilePhoto,
            text: text.trim(),
            sentAt: new Date().toISOString(),
        };
        setGroupMessages(prev => [...prev, msg]);
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
            showToast("Profile complete! You're all set. ✓", "success");
        }
        
        // Update global users list
        setAppUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
        // If updating self
        if (currentUser.id === userToSave.id) {
            setCurrentUser(userToSave);
        }

        // FIX: Push profile edits to Supabase so admin dashboard sees latest data
        // from ANY device — fire-and-forget, never blocks the user.
        void (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            await fetch('/.netlify/functions/register-profile', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id:            userToSave.id.toString(),
                    name:          userToSave.name,
                    email:         userToSave.email,
                    phone:         userToSave.phoneNumber || '',
                    city:          userToSave.city || '',
                    profilePhoto:  userToSave.profilePhoto || '',
                    joinDate:      userToSave.joinDate || new Date().toISOString().split('T')[0],
                    approvalStatus: userToSave.approvalStatus || 'pending',
                }),
            });
        })().catch(() => { /* non-fatal — localStorage is still source of truth */ });
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
        // FIX B-2: clear onboarding flag so next user on same device gets fresh onboarding
        localStorage.removeItem('wm_onboarding_complete');
        sessionStorage.removeItem('wingman_currentUserId_session');
        sessionStorage.removeItem(ONBOARDING_DISMISSED_KEY);
        setRealAdminUser(null);
        setPasscodeAccessActive(false);
        setCurrentUser(GUEST_USER);   // re-triggers the passcode/login gate
        setCurrentPage('home');
        setIsMenuOpen(false);
        showToast('Logged out successfully', 'success');
    };

    // ── Passcode 24h deadline enforcement ─────────────────────────────────────
    // isPasscodeOnlyUser is declared at line ~339 to avoid TDZ in useEffects
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

    // ── New-user onboarding (state declared above with other useState hooks to avoid TDZ) ────


    const handleOnboardingComplete = (profile: OnboardingProfile) => {
        // Create a BRAND NEW user record with a fresh unique ID.
        // We must NEVER merge profile data into currentUser (which may be a mock user like John Doe).
        const newId = Date.now();
        const newUser: User = {
            id: newId,
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            email: profile.email,
            phoneNumber: profile.phone,
            city: profile.hometown,
            profilePhoto: profile.photoUrl || `https://i.pravatar.cc/150?u=${newId}`,
            accessLevel: UserAccessLevel.GENERAL,
            role: UserRole.USER,
            status: 'active',
            approvalStatus: 'pending',
            subscriptionStatus: 'free_tier',
            joinDate: new Date().toISOString().split('T')[0],
            isNewUser: true,
        };
        // FIX B-1: replace any existing placeholder with same email (created when
        // the passcode was entered) so admin never sees duplicates for the same person.
        setAppUsers(prev => {
            const withoutPlaceholder = prev.filter(
                u => u.email.toLowerCase() !== newUser.email.toLowerCase()
            );
            return [...withoutPlaceholder, newUser];
        });
        // Set as current user
        setCurrentUser(newUser);
        // Auto-login: persist the new user ID — isLoggedInUser becomes true immediately
        localStorage.setItem('wingman_currentUserId', newUser.id.toString());
        // Reset any token balance to 0 for new users (they'll earn it)
        setUserTokenBalance(0);
        // Clear the session-dismissed flag — no longer needed
        sessionStorage.removeItem(ONBOARDING_DISMISSED_KEY);
        markOnboardingComplete();
        setShowOnboarding(false);
        setOnboardingDismissed(false);

        // ── Mark the passcode lead as converted ──────────────────────────────
        markLeadAsConverted(newUser.email, newUser.id);
        setPasscodLeads(getPasscodeLeads()); // refresh so Admin sees it immediately

        // ── Fire-and-forget: save profile to Supabase so admin sees it cross-device ──
        void (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            await fetch('/.netlify/functions/register-profile', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id:           newId,
                    name:         newUser.name,
                    email:        newUser.email,
                    phone:        newUser.phoneNumber || '',
                    city:         newUser.city || '',
                    profilePhoto: newUser.profilePhoto || '',
                    joinDate:     newUser.joinDate,
                }),
            });
        })().catch(() => { /* non-fatal — localStorage is still the source of truth */ });

        // ── Replay pending booking intent ─────────────────────────────────
        // If the user tapped Reserve before their profile existed, we saved
        // that booking. Now that the profile is created, process it and send
        // them straight to the cart — not back to a blank home screen.
        const intent = pendingBookingIntent.current;
        if (intent) {
            pendingBookingIntent.current = null;
            setPendingCartReservations(prev => ({
                ...prev,
                [intent.instanceId]: (prev[intent.instanceId] ?? 0) + intent.partySize,
            }));
            const cartId = `cart-inst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const allInst = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents);
            const inst = allInst.find(i => i.instanceId === intent.instanceId);
            const newCartItem: CartItem = {
                id: cartId,
                name: inst?.title ?? intent.instanceId,
                type: 'event',
                image: inst?.coverImage ?? '',
                date: inst?.date,
                sortableDate: inst?.date,
                fullPrice: intent.totalPaid,
                depositPrice: intent.totalPaid,
                paymentOption: 'full',
                bookedTimestamp: Date.now(),
                quantity: 1,
            };
            setCartItems(prev => [...prev, newCartItem]);
            setCartInstanceMeta(prev => ({
                ...prev,
                [cartId]: { instanceId: intent.instanceId, partySize: intent.partySize },
            }));
            // Navigate to cart so the user can continue without re-finding the event
            showToast(`Profile created! Your spot for ${inst?.title ?? 'the event'} is in your cart 🎉`, 'success');
            handleNavigate('checkout', { initialTab: 'cart' });
        } else {
            setCurrentPage('home');
            showToast('Profile created! Welcome to WINGMAN 🎉', 'success');
        }
        // ─────────────────────────────────────────────────────────────────
    };

    const handleOnboardingDismiss = () => {
        // Mark as dismissed for this browser session only.
        // The modal won't reappear until the user opens a new session
        // (new tab / after closing the browser), keeping their 24h window intact.
        sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
        setShowOnboarding(false);
        setOnboardingDismissed(true);
    };

    // Re-show onboarding when user navigates to checkout without completing it
    const profileRequired = isPasscodeOnlyUser && !isOnboardingComplete();


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

    // ── Profile completion score (0–100) ──────────────────────────────────
    // Weights: name 15, email 20, phone 25, photo 30, city 10 = 100
    const getProfileCompletion = (u: typeof currentUser): number => {
        if (!u) return 0;
        const nameParts = (u.name || '').trim().split(/\s+/);
        return [
            nameParts.length >= 2 && nameParts[0] && nameParts[1] ? 15 : (nameParts[0] ? 8 : 0),
            u.email ? 20 : 0,
            u.phoneNumber ? 25 : 0,
            (u.profilePhoto && u.profilePhoto.length > 4) ? 30 : 0,
            u.city ? 10 : 0,
        ].reduce((a, b) => a + b, 0);
    };

    // canBook = true for admins/wingmen always.
    // Regular users only need admin approval — phone + photo are already
    // mandatory during onboarding, so we don't re-gate on profile completion
    // (that was re-asking approved users for fields they'd already provided).
    const canBook =
        currentUser?.role === UserRole.ADMIN ||
        currentUser?.role === UserRole.WINGMAN ||
        currentUser?.approvalStatus === 'approved';

    // --- Pass 2: User approval handlers ---
    // These ONLY mutate approvalStatus. They do not touch status, accessLevel, or any other field.
    // Persist an approve/reject decision to Supabase user_profiles so the
    // background sync doesn't pull the old 'pending' status back and revert it.
    const persistApproval = async (userId: number, status: 'approved' | 'rejected' | 'pending') => {
        const user = appUsers.find(u => u.id === userId);
        const email = user?.email?.trim().toLowerCase();
        if (!email) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return; // not signed in as a Supabase admin — local-only fallback
            await fetch('/.netlify/functions/set-approval', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email, status }),
            });
        } catch { /* fire-and-forget: local state already updated */ }
    };

    const handleApproveUser = (userId: number) => {
        setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' as const } : u));
        void persistApproval(userId, 'approved');
        showToast('User approved successfully', 'success');
    };

    const handleRejectUser = (userId: number) => {
        setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'rejected' as const } : u));
        void persistApproval(userId, 'rejected');
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

    const persistUserRoleOnServer = async (userObj: User) => {
        const email = userObj.email?.trim().toLowerCase();
        if (!email) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;
            await fetch('/.netlify/functions/set-user-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email, role: userObj.role, accessLevel: userObj.accessLevel }),
            });
        } catch { /* ignore */ }
    };

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
        void persistUserRoleOnServer(newUser);
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
        
        void persistUserRoleOnServer(updatedUser);
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
        void persistUserRoleOnServer(newUser);
        showToast(`${app.fullName} approved as Wingman!`, 'success');
    };

    const handleInstanceBook = (booking: Omit<InstanceBooking, 'id' | 'bookedAt'>) => {
        // ── Profile gate ─────────────────────────────────────────────────────
        // Passcode users must complete their profile before reserving a spot.
        // Save the booking intent so we can replay it after profile creation.
        if (profileRequired) {
            pendingBookingIntent.current = booking;
            setShowOnboarding(true);
            return;
        }
        // ─────────────────────────────────────────────────────────────────────
        setPendingCartReservations(prev => ({ ...prev, [booking.instanceId]: (prev[booking.instanceId] ?? 0) + booking.partySize }));
        const cartId = `cart-inst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const allInst = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents);
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
                    isPasscodeUser={isPasscodeOnlyUser}
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
                    onBack={() => handleNavigate('back' as Page)} 
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
            case 'featuredVenues': {
                const isUserAdmin = currentUser.role === UserRole.ADMIN || !!realAdminUser;
                return <FeaturedVenuesPage 
                    venues={isUserAdmin ? appVenues : visibleVenues}
                    onBookVenue={handleBookVenue} 
                    favoriteVenueIds={currentUser.favoriteVenueIds || []} 
                    onToggleFavorite={(id) => handleToggleFavorite(id, 'venue')} 
                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })}
                    onViewDetail={(inst) => handleNavigate('eventDetail', { instance: inst })}
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
                        const allInst = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents);
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
            }
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
                    onAdminEditArrival={(id, newTime) => {
                        setCustomArrivalMap(prev => ({ ...prev, [id]: newTime }));
                        showToast(`Meetup time updated to ${newTime}`, 'success');
                    }}
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
                    onAdminEditArrival={(id, newTime) => {
                        setCustomArrivalMap(prev => ({ ...prev, [id]: newTime }));
                        showToast(`Meetup time updated to ${newTime}`, 'success');
                    }}
                />;
            case 'eventDetail': {
                const inst = pageParams.instance || (pageParams.instanceId ? generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents).find(i => i.instanceId === pageParams.instanceId) : null);
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
                        showToast(`Challenge complete: ${title}! 🏆`, 'success');
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
                    bookingHistory={instanceBookings
                        .filter(b => b.userId === currentUser.id)
                        .map(b => ({
                            id: typeof b.id === 'string' ? parseInt(b.id.replace(/\D/g, '').slice(-8), 10) || 0 : 0,
                            userId: b.userId,
                            venueName: b.instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            wingmanName: 'WINGMAN',
                            date: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
                            tableTier: `${b.partySize} spot${b.partySize > 1 ? 's' : ''}`,
                            status: 'Confirmed' as const,
                        }))
                    }
                    favoriteVenueIds={currentUser.favoriteVenueIds || []} 
                    venues={appVenues} 
                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })} 
                    onLogout={handleLogout}
                />;
            case 'adminDashboard': {
                // FIX LB-1: hard route guard — only ADMIN role may render this page
                if (currentUser.role !== UserRole.ADMIN && !realAdminUser) {
                    // Silently redirect any non-admin who somehow reached this case
                    setTimeout(() => setCurrentPage('home'), 0);
                    return null;
                }
                // Refresh cross-device leads every time admin opens the dashboard
                void fetchServerLeads(currentUser.email);
                
                const viewedUserId = pageParams.viewedUserId;
                const viewedUser = viewedUserId ? appUsers.find(u => u.id === viewedUserId) : null;
                
                return (
                    <div className="relative min-h-screen">
                        <AdminDashboard 
                            users={appUsers} 
                            wingmen={appWingmen} 
                            venues={appVenues} 
                            events={appEvents} 
                            storeItems={appStoreItems} 
                            wingmanRequests={wingmanRequests}
                            onViewDashboard={(w) => handleNavigate('wingmanDashboard', { viewAsWingmanId: w.id })} 
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
                            onToggleHideEvent={(e) => { setAppEvents(prev => prev.map(ev => ev.id === e.id ? { ...ev, isHidden: !ev.isHidden } : ev)); showToast(e.isHidden ? 'Event unhidden' : 'Event hidden', 'success'); }}
                            onPreviewEvent={(e) => handleNavigate('eventTimeline')} 
                            onAddVenue={() => { setVenueToEdit(null); setIsAdminEditVenueOpen(true); }} 
                            onEditVenue={(v) => { setVenueToEdit(v); setIsAdminEditVenueOpen(true); }} 
                            onDeleteVenue={(v) => { setAppVenues(prev => prev.filter(ven => ven.id !== v.id)); showToast('Venue deleted', 'success'); }} 
                            onToggleHideVenue={(v) => { setAppVenues(prev => prev.map(ven => ven.id === v.id ? { ...ven, isHidden: !ven.isHidden } : ven)); showToast(v.isHidden ? 'Venue unhidden' : 'Venue hidden', 'success'); }}
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
                            onApproveUser={handleApproveUser}
                            onRejectUser={handleRejectUser}
                            onDeleteUser={(userId) => {
                                const user = appUsers.find(u => u.id === userId);
                                setAppUsers(prev => prev.filter(u => u.id !== userId));
                                // Also remove from Supabase so they don't reappear on next dashboard load
                                if (user?.email) {
                                    void (async () => {
                                        const { data: { session } } = await supabase.auth.getSession();
                                        const token = session?.access_token;
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (token) headers['Authorization'] = `Bearer ${token}`;
                                        await fetch('/.netlify/functions/delete-profile', {
                                            method: 'DELETE',
                                            headers,
                                            body: JSON.stringify({ email: user.email }),
                                        });
                                    })().catch(() => null);
                                }
                            }}
                            onClearAllUsers={() => {
                                setAppUsers(prev => prev.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.WINGMAN));
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

                            membershipRequests={membershipRequests}
                            onApproveMembershipRequest={handleApproveMembershipRequest}
                            onRejectMembershipRequest={handleRejectMembershipRequest}
                            instanceBookings={instanceBookings}
                            passcodLeads={passcodLeads}
                        />
                        {viewedUser && (
                            <div className="fixed inset-0 z-[150] bg-[#080808] overflow-y-auto">
                                <ProfilePage
                                    onNavigate={(page, params) => {
                                        if (page === 'back') {
                                            handleNavigate('adminDashboard', {}); // close overlay
                                        } else {
                                            handleNavigate(page, params);
                                        }
                                    }}
                                    currentUser={viewedUser}
                                    tokenBalance={viewedUser.tokenBalance ?? 0}
                                    bookingHistory={instanceBookings
                                        .filter(b => b.userId === viewedUser.id)
                                        .map(b => ({
                                            id: typeof b.id === 'string' ? parseInt(b.id.replace(/\D/g, '').slice(-8), 10) || 0 : 0,
                                            userId: b.userId,
                                            venueName: b.instanceId.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                                            wingmanName: 'WINGMAN',
                                            date: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
                                            tableTier: `${b.partySize} spot${b.partySize > 1 ? 's' : ''}`,
                                            status: 'Confirmed' as const,
                                        }))
                                    }
                                    favoriteVenueIds={viewedUser.favoriteVenueIds || []}
                                    venues={appVenues}
                                    onViewVenueDetails={(v) => handleNavigate('venueDetails', { venueId: v.id })}
                                    onLogout={undefined}
                                    viewedByAdmin={true}
                                />
                            </div>
                        )}
                    </div>
                );
            }
            case 'wingmanDashboard': {
                const isAuthorizedWingman = currentUser.role === UserRole.WINGMAN && currentUser.accessLevel === UserAccessLevel.PROMO;
                if (!isAuthorizedWingman && currentUser.role !== UserRole.ADMIN && !realAdminUser) {
                    setTimeout(() => setCurrentPage('home'), 0);
                    return null;
                }
                const viewAsWingmanId = pageParams.viewAsWingmanId || ((currentUser.role === UserRole.WINGMAN && currentUser.accessLevel === UserAccessLevel.PROMO) ? currentUser.id : undefined);
                const targetWingmanId = viewAsWingmanId || appWingmen[0]?.id;
                const viewedWingman = appWingmen.find(p => p.id === targetWingmanId);
                if (!viewedWingman) return <div className="p-8 text-white">Wingman dashboard unavailable.</div>;
                const targetWingmanUser = appUsers.find(u => u.id === targetWingmanId) || currentUser;

                return <WingmanDashboard 
                    wingman={viewedWingman} 
                    wingmanUser={targetWingmanUser}
                    currentUser={currentUser}
                    onNavigate={handleNavigate} 
                    onUpdateUser={handleUpdateUserWithRewardCheck} 
                    onUpdateWingman={(w) => setAppWingmen(prev => prev.map(p => p.id === w.id ? w : p))}
                    wingmanRequests={wingmanRequests}
                    setWingmanRequests={setWingmanRequests}
                    instanceBookings={instanceBookings}
                    setInstanceBookings={setInstanceBookings}
                    users={appUsers} 
                    venues={appVenues} 
                    events={appEvents} 
                    bookedMap={bookedMap}
                    cancelMap={cancelMap}
                    forceSoldOutMap={forceSoldOutMap}
                    customArrivalMap={customArrivalMap}
                    customInstanceMap={customInstanceMap}
                    friendZoneChats={friendZoneChats}
                    friendZoneChatMessages={friendZoneChatMessages}
                    guestlistChats={guestlistChats}
                    guestlistChatMessages={guestlistChatMessages}
                    onSendFriendZoneMessage={(id, text) => {
                        const newMsg: FriendZoneChatMessage = {
                            id: Date.now(),
                            chatId: id,
                            senderId: currentUser.id,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setFriendZoneChatMessages(prev => [...prev, newMsg]);
                    }}
                    onSendGuestlistMessage={(id, text) => {
                        const newMsg: GuestlistChatMessage = {
                            id: Date.now(),
                            chatId: id,
                            senderId: currentUser.id,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setGuestlistChatMessages(prev => [...prev, newMsg]);
                    }}
                    onStartDirectChat={handleStartFriendZoneChat}
                    onViewUser={(u) => setPreviewUser(u)} 
                    isViewedByAdmin={currentUser.role === UserRole.ADMIN || !!realAdminUser}
                />;
            }
            case 'bookings': {
                const allInstancesForBookings = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents, true);
                return <BookingsPage
                    onNavigate={handleNavigate}
                    bookedItems={bookedItems}
                    venues={appVenues}
                    instanceBookings={instanceBookings.filter(b => b.userId === currentUser.id)}
                    allInstances={allInstancesForBookings}
                />;}
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
                    onBack={() => handleNavigate('back' as Page)}
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
                    allGroups={appAccessGroups} 
                    groupJoinRequests={groupJoinRequests}
                    onApproveRequest={handleApproveGroupRequest}
                    onRejectRequest={handleRejectGroupRequest}
                    users={appUsers}
                    groupMessages={groupMessages}
                    onSendMessage={handleSendGroupMessage}
                    onNavigate={handleNavigate}
                    onRequestJoin={handleRequestJoinGroup}
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
                    onNavigate={handleNavigate}
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
                        // After save, return to the detail page so the user sees their updated itinerary
                        if (i.id) {
                            handleNavigate('itineraryDetails', { itineraryId: i.id });
                        } else {
                            handleNavigate('myItineraries');
                        }
                    }} 
                    onCancel={() => {
                        // Back → go to itineraryDetails if editing an existing one, otherwise list
                        if (pageParams.itineraryId) {
                            handleNavigate('itineraryDetails', { itineraryId: pageParams.itineraryId });
                        } else {
                            handleNavigate('myItineraries');
                        }
                    }} 
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
                const allInstances = generateEventFeed(bookedMap, cancelMap, 4, forceSoldOutMap, customArrivalMap, customInstanceMap, appEvents);
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
                        instanceId: inst!.instanceId,   // stored so CheckoutPage can open modal
                    } as CartItem & { instanceId: string }));
                // Build purchased list from InstanceBookings + existing bookedItems
                const instancePurchased: CartItem[] = instanceBookings
                    .filter(b => b.userId === currentUser.id)
                    .map(b => {
                        const inst = allInstances.find(i => i.instanceId === b.instanceId);
                        // Clean fallback: strip trailing date, replace hyphens, title-case
                        const cleanName = inst?.title ?? b.instanceId
                            .replace(/-\d{4}-\d{2}-\d{2}$/, '')
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase())
                            .replace(/\[test\]/i, '[TEST]');
                        return {
                            id: b.id,
                            name: cleanName,
                            type: 'event' as const,
                            image: inst?.coverImage ?? '',
                            date: inst?.date ?? b.instanceId.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] ?? b.bookedAt.slice(0, 10),
                            sortableDate: inst?.date ?? b.instanceId.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] ?? b.bookedAt.slice(0, 10),
                            fullPrice: b.totalPaid,
                            depositPrice: b.totalPaid,
                            paymentOption: 'full' as const,
                            bookedTimestamp: new Date(b.bookedAt).getTime(),
                            quantity: b.partySize,
                            // Extra metadata for the receipt card
                            guestDetails: { name: b.guestName || currentUser.name, email: b.guestEmail || currentUser.email } as any,
                            paymentMethod: b.totalPaid > 0 ? 'usd' : 'usd',
                        } as CartItem;
                    });
                // Gate checkout if passcode user hasn't built their profile yet
                if (profileRequired) {
                    return (
                        <div className="min-h-screen bg-black flex items-center justify-center p-6">
                            <div className="w-full max-w-sm space-y-4">
                                <div className="text-center mb-6">
                                    <p className="text-4xl mb-3">🔒</p>
                                    <h2 className="text-xl font-black text-white mb-1">Complete Your Profile First</h2>
                                    <p className="text-sm text-gray-500">You need a profile before you can confirm a reservation.</p>
                                </div>
                                <ProfileGateBanner onSetupProfile={() => setShowOnboarding(true)} />
                                <button
                                    onClick={() => handleNavigate('home')}
                                    className="w-full py-3 rounded-xl text-sm text-gray-500 font-semibold transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    ← Back to Experiences
                                </button>
                            </div>
                        </div>
                    );
                }
                return <CheckoutPage
                    currentUser={currentUser}
                    watchlist={[...instanceWatchlist, ...watchlist]}
                    bookedItems={[...instancePurchased, ...bookedItems]}
                    venues={appVenues}
                    cartItems={cartItems}
                    onRemoveItem={(id) => {
                        setCartItems(prev => prev.filter(i => i.id !== id));
                        setWatchlist(prev => prev.filter(i => i.id !== id));
                        // Also remove from bookmarkedInstanceIds if it was a watchlist instance
                        if (id.startsWith('wl-')) {
                            const instanceId = id.replace(/^wl-/, '');
                            setBookmarkedInstanceIds(prev => prev.filter(bid => bid !== instanceId));
                        }
                    }}
                    onUpdatePaymentOption={(id, opt) => setCartItems(prev => prev.map(i => i.id === id ? { ...i, paymentOption: opt } : i))}
                    onConfirmCheckout={handleConfirmCheckout}
                    isCheckoutLoading={isCheckoutLoading}
                    onMoveToCart={handleMoveToCart}
                    onViewReceipt={(item) => handleNavigate('bookingConfirmed', { items: [item] })}
                    onStartChat={handleStartBookingChat}
                    onCancelRsvp={(item) => {
                        if (item.id.startsWith('ib-')) {
                            setInstanceBookings(prev => prev.filter(b => b.id !== item.id));
                        } else {
                            setBookedItems(prev => prev.filter(b => b.id !== item.id));
                        }
                        showToast('Booking cancelled.', 'success');
                    }}
                    initialTab={pageParams.initialTab ?? 'cart'}
                    onNavigate={handleNavigate}
                    allInstances={allInstances}
                    userTokenBalance={userTokenBalance}
                    currentUserCanBook={
                        currentUser.role === UserRole.ADMIN ||
                        currentUser.role === UserRole.WINGMAN ||
                        currentUser.approvalStatus === 'approved'
                    }
                />;
            }
            case 'eventChatsList':
                return <EventChatsListPage 
                    currentUser={currentUser} 
                    onNavigate={handleNavigate} 
                    eventChats={eventChats} 
                    guestlistChats={guestlistChats} 
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
                    onBack={() => handleNavigate('back' as Page)} 
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
                    onBack={() => handleNavigate('back' as Page)} 
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
                    onBack={() => handleNavigate('back' as Page)} 
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
                const isUserAdmin = currentUser.role === UserRole.ADMIN || !!realAdminUser;
                const venue = appVenues.find(v => v.id === pageParams.venueId);
                if (!venue || (venue.isHidden && !isUserAdmin)) return <div className="text-white p-8">Venue not found</div>;
                return <VenueDetailsPage 
                    venue={venue} 
                    onBack={() => handleNavigate('back' as Page)} 
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
            case 'tokenWallet': return <TokenWalletPage onNavigate={handleNavigate} transactions={tokenTransactions} />;
            case 'editProfile': {
                const targetUserId = pageParams.viewedUserId;
                const viewedUser = targetUserId ? appUsers.find(u => u.id === targetUserId) : null;
                const userToUse = viewedUser || currentUser;
                const isAdminEditing = !!viewedUser && currentUser.role === UserRole.ADMIN;
                return <EditProfilePage 
                    currentUser={userToUse} 
                    onSave={(updatedUser) => {
                        if (isAdminEditing) {
                            handleAdminEditUser(updatedUser);
                        } else {
                            handleUpdateUserWithRewardCheck(updatedUser);
                        }
                    }} 
                    onNavigate={handleNavigate} 
                    showToast={showToast} 
                    isAdminEditing={isAdminEditing}
                />;
            }
            case 'referFriend': return <ReferFriendPage />;
            case 'hireWingman': return <HireWingmanPage
                currentUser={currentUser}
                onNavigate={handleNavigate}
                wingmen={appWingmen}
                showToast={showToast}
                onSubmitRequest={(req: HireRequest) => {
                    // Store request in app state so admin can see it
                    setAppHireRequests(prev => [...prev, { ...req, id: Date.now(), submittedAt: new Date().toISOString(), status: 'pending' }]);
                    // Persist to localStorage so it survives refresh
                    try {
                        const existing = JSON.parse(localStorage.getItem('wingman_hire_requests') ?? '[]');
                        existing.push({ ...req, id: Date.now(), submittedAt: new Date().toISOString(), status: 'pending', userId: currentUser.id, userName: currentUser.name, userEmail: currentUser.email });
                        localStorage.setItem('wingman_hire_requests', JSON.stringify(existing));
                    } catch {}
                    // Fire notification email (fire-and-forget)
                    fetch('/.netlify/functions/send-welcome-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: currentUser.email || req.email || '',
                            name: currentUser.name,
                            subject: 'Wingman Request Received',
                            type: 'hire_request',
                            details: req,
                        }),
                    }).catch(() => {});
                    showToast(`Request sent! A Wingman will contact you shortly.`, 'success');
                }}
            />;
            default: return <HomeScreen
                    onNavigate={handleNavigate}
                    currentUser={currentUser}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onRequestAccess={() => setIsMembershipRequestOpen(true)}
                />;
        }
    };

    // ── Password Recovery Route ──────────────────────────────────
    // Supabase password reset emails redirect here. Show the reset UI
    // before any auth gates so users with no session can complete it.
    if (typeof window !== 'undefined' && window.location.pathname === '/reset-password') {
        return (
            <ResetPasswordScreen
                onDone={() => { window.location.replace('/'); }}
            />
        );
    }

    if (!currentUser) return null; // Render guard

    // ── Gated Access Gate ────────────────────────────────────────
    // This MUST be the first thing unauthenticated users see.
    // It prevents OnboardingModal (z-100) from overlaying the gate.
    if (!isLoggedInUser && !passcodeAccessActive) {
        const handleLogin = async (email: string, password: string, stayLoggedIn: boolean = true): Promise<boolean> => {
            const normalizedEmail = email.toLowerCase();

            // Search in-memory state first, then fall back to the persisted
            // wingman_users store so onboarding-created accounts are always found
            // even if appUsers state hasn't yet merged the new entry.
            let found = appUsers.find(u => u.email.toLowerCase() === normalizedEmail);
            if (!found) {
                try {
                    const raw = localStorage.getItem('wingman_users');
                    if (raw) {
                        const stored: User[] = JSON.parse(raw);
                        found = stored.find(u => u.email.toLowerCase() === normalizedEmail);
                        // If found in storage but not in state, hydrate state
                        if (found) setAppUsers(prev => prev.some(u => u.id === found!.id) ? prev : [...prev, found!]);
                    }
                } catch {}
            }

            // Try Supabase Auth first
            const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            const supabaseOk = !error && !!data?.session;

            // Fallback: localStorage password store for onboarding-created accounts
            const legacyOk = !supabaseOk && hasUserPassword(normalizedEmail) && verifyUserPassword(normalizedEmail, password);

            if (!supabaseOk && !legacyOk) return false;
            if (!found) return false;

            setCurrentUser(found);
            grantPasscodeAccess(found.email);
            if (stayLoggedIn) {
                localStorage.setItem('wingman_currentUserId', found.id.toString());
            } else {
                sessionStorage.setItem('wingman_currentUserId_session', found.id.toString());
                localStorage.removeItem('wingman_currentUserId');
            }
            setPasscodeAccessActive(true);
            const path = (() => { try { return window.location.pathname.replace(/\/+$/, ''); } catch { return ''; } })();
            const isWingmanRole = found.role === UserRole.WINGMAN || found.role === UserRole.ADMIN;
            setCurrentPage(
                path === '/admin' && found.role === UserRole.ADMIN 
                    ? 'adminDashboard' 
                    : path === '/wingman' && isWingmanRole 
                        ? 'wingmanDashboard' 
                        : 'home'
            );
            return true;
        };
        const handleCreateAccount = () => {
            setPasscodeAccessActive(true);
            setShowOnboarding(true);
        };
        return (
            <WelcomePage
                onAccessGranted={handleAccessGranted}
                onLoginInstead={handleLoginInstead}
                onLogin={handleLogin}
                onCreateAccount={handleCreateAccount}
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
                                onClick={() => setShowOnboarding(true)}
                                className="font-bold text-white underline underline-offset-2 whitespace-nowrap"
                            >
                                Create Profile →
                            </button>
                        </div>
                    )}
                    {currentPage !== 'home' && (
                        <Header
                            title={currentPage === 'chatbot' ? 'Chat Room' : currentPage.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()}
                            onOpenMenu={() => setIsMenuOpen(true)} 
                            onOpenNotifications={() => setIsNotificationsOpen(true)} 
                            onOpenGroupChat={() => handleNavigate('accessGroups')} 
                            currentUser={currentUser} 
                            onOpenCart={() => setIsCartOpen(true)} 
                            cartItemCount={cartItems.length}
                            onLogoClick={() => handleNavigate('home')}
                            showMenu={true}
                        />
                    )}
                    
                    <main style={{ paddingBottom: 'max(80px, calc(68px + env(safe-area-inset-bottom, 0px)))' }}>
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
                        notifications={notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser.id)} 
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

                    {/* ── New User Onboarding ── z-[300] so it's above everything */}
                    {showOnboarding && (
                        <NewUserOnboarding
                            onComplete={handleOnboardingComplete}
                            onDismiss={handleOnboardingDismiss}
                            prefillEmail={getAccessSession()?.email ?? ''}
                        />
                    )}


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
                        wingmen={appWingmen}
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
                        onApprove={previewUser ? (uid) => {
                            handleApproveUser(uid);
                            setPreviewUser(prev => prev ? { ...prev, approvalStatus: 'approved' } : null);
                        } : undefined}
                        onReject={previewUser ? (uid) => {
                            handleRejectUser(uid);
                            setPreviewUser(null);
                        } : undefined}
                        onEdit={previewUser ? (u) => {
                            setUserToEdit(u);
                            setPreviewUser(null);
                        } : undefined}
                        onBlock={previewUser ? (u) => {
                            handleAdminEditUser({ ...u, status: u.status === 'blocked' ? 'active' : 'blocked' });
                            setPreviewUser(null);
                        } : undefined}
                        onViewProfile={previewUser ? (u) => {
                            setPreviewUser(null);
                            handleNavigate('adminDashboard', { viewedUserId: u.id });
                        } : undefined}
                    />
                </>
        </div>
    );
};
