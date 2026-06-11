
import { Venue, Wingman, Booking, Event, Challenge, TableOption, Experience, UserAccessLevel, User, UserRole, Bottle, StoreItem, Transaction, AccessGroup, GroupPost, Itinerary, AppNotification, GuestlistChat, GuestlistChatMessage, WingmanApplication, EventInvitationRequest, EventInvitation, EventChat, EventChatMessage, GuestlistJoinRequest, DataExportRequest, FriendZoneChat, FriendZoneChatMessage, PaymentMethod, WingmanChat, WingmanChatMessage } from '../types';

// Mock Users — only the admin and Wingman host seed entries
export const users: User[] = [
  {
    id: 1, // Wingman host
    name: 'Anderson',
    email: 'anderson@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=1',
    accessLevel: UserAccessLevel.PROMO,
    role: UserRole.WINGMAN,
    city: 'Miami',
    joinDate: '2022-11-01',
    instagramHandle: 'anderson_promo',
    phoneNumber: '+15550999',
    status: 'active',
    approvalStatus: 'approved',
    subscriptionStatus: 'active'
  },
  {
    id: 999, // Super Admin
    name: 'Admin User',
    email: 'admin@wingman.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=999',
    accessLevel: UserAccessLevel.ADMIN,
    role: UserRole.ADMIN,
    city: 'Miami',
    joinDate: '2022-01-01',
    status: 'active',
    approvalStatus: 'approved',
    subscriptionStatus: 'active'
  }
];

// Mock Wingmen
export const wingmen: Wingman[] = [
  {
    id: 1,
    name: 'Anderson',
    handle: '@anderson_promo',
    rating: 4.9,
    bio: 'Top wingman for LIV and Story. I can get you the best tables.',
    profilePhoto: 'https://i.pravatar.cc/150?u=1',
    city: 'Miami',
    weeklySchedule: [{ day: 'Friday', venueId: 1 }, { day: 'Saturday', venueId: 2 }],
    assignedVenueIds: [1, 2],
    earnings: 12500,
    isOnline: true,
    favoritedByCount: 150,
    galleryImages: ['https://picsum.photos/seed/p1/300/300', 'https://picsum.photos/seed/p2/300/300']
  },
  {
    id: 2,
    name: 'Jessica',
    handle: '@jess_vip',
    rating: 4.8,
    bio: 'Exclusive access to E11EVEN and Komodo. DM for guestlist.',
    profilePhoto: 'https://i.pravatar.cc/150?u=2',
    city: 'Miami',
    weeklySchedule: [{ day: 'Thursday', venueId: 3 }, { day: 'Sunday', venueId: 1 }],
    assignedVenueIds: [3, 1],
    earnings: 9800,
    isOnline: false,
    favoritedByCount: 120,
    galleryImages: ['https://picsum.photos/seed/p3/300/300']
  }
];

// Mock Venues
export const venues: Venue[] = [
  {
    id: 1,
    name: 'LIV',
    category: 'Nightclub',
    location: 'Miami Beach',
    musicType: 'EDM / House',
    vibe: 'High Energy',
    coverImage: 'https://picsum.photos/seed/liv/800/600',
    operatingDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 1500,
    averageRating: 4.7,
    totalReviews: 320,
    isGuestlistAvailable: true,
    dressCode: 'Upscale nightclub attire. Men: dress shirt or blazer, dress pants or dark jeans, dress shoes. No sneakers, no shorts, no hats, no graphic tees. Women: cocktail dress, heels or dressy sandals.',
    entryNotes: 'Arrive with your Wingman confirmation. Give your name at the door — you will be walked to the table, not left at the line. Come groomed and dressed to impress. The door staff make quick decisions.',
    arrivalTip: 'Arrive between 11:00 PM – 12:00 AM. After 1 AM the line is long and entry becomes stricter.',
    tableOptions: [
      { id: 't1', name: 'Dance Floor Table', area: 'Main Room', minSpend: 5000, description: 'Right in the action', capacityHint: 'Small Groups' },
      { id: 't2', name: 'VIP Booth', area: 'Mezzanine', minSpend: 3000, description: 'Private view of the stage', capacityHint: 'Large Groups' }
    ]
  },
  {
    id: 2,
    name: 'Story',
    category: 'Nightclub',
    location: 'South Beach',
    musicType: 'Hip Hop',
    vibe: 'Trendy',
    coverImage: 'https://picsum.photos/seed/story/800/600',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 1200,
    averageRating: 4.5,
    totalReviews: 210,
    isGuestlistAvailable: true,
    dressCode: 'Fashion-forward nightclub look. Men: slim-fit dress shirt, dark trousers or fitted jeans, leather or suede shoes. No athletic wear, no sneakers, no flip-flops. Women: chic dress or stylish separates.',
    entryNotes: 'Story is image-conscious — the door team pays attention to how you present. Arrive as a group with your Wingman booking reference. Look confident, be friendly with door staff. Do not bring large groups or show up underdressed.',
    arrivalTip: 'Best window is 11:30 PM – 12:30 AM. Earlier and the energy is low, later and the door becomes selective.',
    tableOptions: [
       { id: 't3', name: 'Owners Table', area: 'Main Room', minSpend: 8000, description: 'Best table in the house', capacityHint: 'Large Groups' }
    ]
  },
  {
    id: 3,
    name: 'Komodo',
    category: 'Restaurant',
    location: 'Brickell',
    musicType: 'Lounge',
    vibe: 'Sophisticated',
    coverImage: 'https://picsum.photos/seed/komodo/800/600',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 400,
    averageRating: 4.8,
    totalReviews: 450,
    dressCode: 'Smart casual to upscale. Men: collared shirt, chinos or dress pants, loafers or clean dress shoes. Women: a dress, blouse with trousers, or an elegant casual look. Avoid beachwear, athletic wear, or flip-flops.',
    entryNotes: 'Komodo is a dining-first experience. Your Wingman reservation is tied to the table — confirm with the host stand upon arrival. Be on time: tables are held for 10 minutes max. Present yourself calmly and professionally.',
    arrivalTip: 'Dinner is best between 8:00 PM and 9:30 PM. After 10 PM it transitions to a lounge atmosphere — still great but different energy.',
    tableOptions: []
  },
  {
    id: 4,
    name: 'Mr. Jones',
    category: 'Nightclub',
    location: '320 Lincoln Rd, Miami Beach, FL 33139',
    musicType: 'Hip Hop / Top 40',
    vibe: 'Trendy',
    coverImage: 'https://images.unsplash.com/photo-1571265209853-8cf0b7a2c39b?w=800&q=80',
    operatingDays: ['Tuesday', 'Friday', 'Saturday'],
    capacity: 600,
    averageRating: 4.6,
    totalReviews: 180,
    isGuestlistAvailable: true,
    dressCode: 'Stylish and clean. Men: fitted shirt (button-up or premium crew), dark jeans or trousers, clean sneakers or dress shoes accepted. No ripped jeans, no oversized sportswear, no sandals. Women: casual-chic — dress, skirt, or polished separates.',
    entryNotes: 'Mr. Jones runs a tight door — your Wingman booking gets you past the line. Walk up confidently, give your name, and follow the host. Groups should arrive together: split groups may be asked to wait for all members.',
    arrivalTip: 'Ideal arrival is 11:00 PM – 12:00 AM. The venue fills quickly on Fridays and Saturdays — earlier is smoother.',
    tableOptions: [
      { id: 'mj-t1', name: 'Main Floor Table', area: 'Main Room', minSpend: 3000, description: 'Center of the action on the main floor', capacityHint: 'Small Groups' },
      { id: 'mj-t2', name: 'VIP Booth', area: 'VIP Section', minSpend: 5000, description: 'Elevated VIP section with bottle service', capacityHint: 'Large Groups' }
    ]
  }
];

// Mock Bottles
export const bottles: Bottle[] = [
    { id: 'b1', name: 'Grey Goose', price: 350 },
    { id: 'b2', name: 'Dom Perignon', price: 650 },
    { id: 'b3', name: 'Don Julio 1942', price: 700 },
    { id: 'b4', name: 'Tito\'s Vodka', price: 300 },
    { id: 'b5', name: 'Casamigos Blanco', price: 400 },
    { id: 'b6', name: 'Casamigos Reposado', price: 450 },
    { id: 'b7', name: 'Hennessy V.S', price: 350 },
    { id: 'b8', name: 'Moët & Chandon Imperial', price: 250 },
    { id: 'b9', name: 'Clase Azul Reposado', price: 750 }, // New
    { id: 'b10', name: 'Ace of Spades Gold', price: 800 }, // New
];

// Booking history starts empty — populated by real user bookings
export const bookingHistory: Booking[] = [];

// Mock Transactions
export const mockTokenTransactions: Transaction[] = [
    { type: 'add', amount: 1000, reason: 'Purchase', date: '2023-12-01', time: '10:00 AM' },
    { type: 'spend', amount: 200, reason: 'Event Ticket', date: '2023-12-05', time: '09:30 PM', itemName: 'Neon Party' }
];

// Access groups start empty
export const accessGroups: AccessGroup[] = [];

// Group posts start empty
export const groupPosts: GroupPost[] = [];

// Itineraries start empty
export const itineraries: Itinerary[] = [];

// Mock Events
export const events: Event[] = [
    // Upcoming Spring Events 2025
    { id: 300, title: 'Spring Break Kickoff', description: 'Start the season with a massive pool party at Strawberry Moon. Top DJs and endless vibes.', image: 'https://picsum.photos/seed/springbreak/800/400', date: '2025-03-10', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 50, venueId: 2 },
    { id: 301, title: 'Miami Music Week Opening', description: 'The official opening party for MMW. Expect surprise guests and cutting-edge electronic music.', image: 'https://picsum.photos/seed/mmwopen/800/400', date: '2025-03-18', type: 'EXCLUSIVE', priceFemale: 40, priceMale: 80, venueId: 1 },
    { id: 302, title: 'Techno Terrace', description: 'Deep melodic techno on the rooftop. An immersive audio-visual experience.', image: 'https://picsum.photos/seed/techno/800/400', date: '2025-03-19', type: 'EXCLUSIVE', priceFemale: 30, priceMale: 60, venueId: 3 },
    { id: 303, title: 'Ultra VIP Experience', description: 'Exclusive access to the VIP decks at the main stage. Best view in the house.', image: 'https://picsum.photos/seed/ultra/800/400', date: '2025-03-21', type: 'INVITE ONLY', priceFemale: 0, priceMale: 500, venueId: 1 },
    { id: 304, title: 'Sunrise Afterhours', description: 'Keep the party going until the sun comes up. The legendary afterparty.', image: 'https://picsum.photos/seed/sunrise/800/400', date: '2025-03-22', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 50, venueId: 2 },
    { id: 305, title: 'Recovery Brunch', description: 'Detox to retox. Bottomless mimosas and gourmet bites by the water.', image: 'https://picsum.photos/seed/brunch/800/400', date: '2025-03-23', type: 'EXCLUSIVE', priceFemale: 50, priceMale: 50, venueId: 3 },
    { id: 306, title: 'Calle Ocho VIP Lounge', description: 'Experience the festival from the comfort of a private VIP lounge with open bar.', image: 'https://picsum.photos/seed/calle/800/400', date: '2025-03-25', type: 'INVITE ONLY', priceFemale: 0, priceMale: 150, venueId: 2 },
    { id: 307, title: 'Rooftop Sunset Sessions', description: 'Chill house beats, golden hour views, and craft cocktails.', image: 'https://picsum.photos/seed/rooftop2/800/400', date: '2025-03-28', type: 'EXCLUSIVE', priceFemale: 0, priceMale: 40, venueId: 3 },
    { id: 308, title: 'Full Moon Beach Party', description: 'Dancing under the stars on the sand. Fire dancers and tribal beats.', image: 'https://picsum.photos/seed/fullmoon2/800/400', date: '2025-03-30', type: 'EXCLUSIVE', priceFemale: 25, priceMale: 60, venueId: 1 },
    { id: 309, title: 'Spring Equinox Gala', description: 'A black-tie celebration of the new season. Elegant, refined, and exclusive.', image: 'https://picsum.photos/seed/equinox/800/400', date: '2025-03-31', type: 'INVITE ONLY', priceFemale: 0, priceMale: 250, venueId: 3 },

    // Existing Events
    { id: 202, title: 'Neon Night', description: 'Experience the ultimate glow-in-the-dark party at LIV. High energy beats and vibrant visuals all night long.', image: 'https://picsum.photos/seed/neon/800/400', date: '2025-06-15', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 50, venueId: 1 },
    { id: 204, title: 'Secret Garden', description: 'An intimate, invite-only gathering at Komodo\'s lounge. Sophisticated vibes and curated cocktails.', image: 'https://picsum.photos/seed/garden/800/400', date: '2025-06-20', type: 'INVITE ONLY', priceFemale: 0, priceMale: 100, venueId: 3 },
    { id: 211, title: 'Summer Splash', description: 'The biggest pool party of the season at Story. Cool off with great music and even better company.', image: 'https://picsum.photos/seed/splash/800/400', date: '2025-07-04', type: 'EXCLUSIVE', priceFemale: 30, priceMale: 60, venueId: 2 },
    { id: 220, title: 'Full Moon Party', description: 'Celebrate under the moonlight with top DJs.', image: 'https://picsum.photos/seed/fullmoon/800/400', date: '2025-06-25', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 60, venueId: 1 },
    { id: 221, title: 'Hip Hop Thursdays', description: 'The best hip hop tracks all night long.', image: 'https://picsum.photos/seed/hiphop/800/400', date: '2025-06-26', type: 'EXCLUSIVE', priceFemale: 10, priceMale: 40, venueId: 2 },
    { id: 222, title: 'Sunday Sunset', description: 'Relaxing vibes and cocktails.', image: 'https://picsum.photos/seed/sunset/800/400', date: '2025-06-29', type: 'INVITE ONLY', priceFemale: 0, priceMale: 80, venueId: 3 },
    // New Events for testing
    { id: 230, title: 'Summer Solstice', description: 'Celebrate the longest day of the year with an epic party at LIV.', image: 'https://picsum.photos/seed/solstice/800/400', date: '2025-06-21', type: 'EXCLUSIVE', priceFemale: 30, priceMale: 80, venueId: 1 },
    { id: 231, title: 'Tech House Sunday', description: 'Deep beats and good vibes at Story.', image: 'https://picsum.photos/seed/techhouse/800/400', date: '2025-06-22', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 50, venueId: 2 },
    { id: 232, title: 'Ladies Night Special', description: 'Complimentary drinks for ladies until midnight at Komodo.', image: 'https://picsum.photos/seed/ladiesnight/800/400', date: '2025-06-26', type: 'INVITE ONLY', priceFemale: 0, priceMale: 100, venueId: 3 },
    // Newly added events for diversity
    { id: 240, title: 'Retro Rewind', description: 'Blast from the past with 80s and 90s hits all night long at Story.', image: 'https://picsum.photos/seed/retro/800/400', date: '2025-07-10', type: 'EXCLUSIVE', priceFemale: 10, priceMale: 30, venueId: 2 },
    { id: 241, title: 'Elite Gala', description: 'A black-tie affair for the city\'s most distinguished guests at LIV.', image: 'https://picsum.photos/seed/gala/800/400', date: '2025-07-12', type: 'INVITE ONLY', priceFemale: 0, priceMale: 200, venueId: 1 },
    { id: 242, title: 'Tropical Beats', description: 'Island vibes and cocktails on the terrace at Komodo.', image: 'https://picsum.photos/seed/tropical/800/400', date: '2025-07-15', type: 'EXCLUSIVE', priceFemale: 25, priceMale: 50, venueId: 3 },
    { id: 243, title: 'Sapphire Lounge Opening', description: 'Grand opening of the new Sapphire VIP section at Story. Dress to impress.', image: 'https://picsum.photos/seed/sapphire/800/400', date: '2025-07-18', type: 'INVITE ONLY', priceFemale: 0, priceMale: 150, venueId: 2 },
    { id: 244, title: 'Midnight Masquerade', description: 'Mystery and music combine for an unforgettable night at LIV.', image: 'https://picsum.photos/seed/masquerade/800/400', date: '2025-07-20', type: 'EXCLUSIVE', priceFemale: 40, priceMale: 100, venueId: 1 },
    // NEW EVENTS
    { id: 250, title: 'Electric Jungle', description: 'Wild beats and immersive decor at LIV. Step into the jungle.', image: 'https://picsum.photos/seed/jungle/800/400', date: '2025-07-25', type: 'EXCLUSIVE', priceFemale: 25, priceMale: 60, venueId: 1 },
    { id: 251, title: 'Rooftop Rhythms', description: 'Chill house music with a view at Komodo.', image: 'https://picsum.photos/seed/rooftop/800/400', date: '2025-07-26', type: 'INVITE ONLY', priceFemale: 0, priceMale: 80, venueId: 3 },
    { id: 252, title: 'Bass Drop Friday', description: 'Heavy hitting bass music at Story. Not for the faint of heart.', image: 'https://picsum.photos/seed/bass/800/400', date: '2025-08-01', type: 'EXCLUSIVE', priceFemale: 20, priceMale: 50, venueId: 2 },
    { id: 253, title: 'White Party', description: 'Annual White Party. Dress code strictly enforced.', image: 'https://picsum.photos/seed/whiteparty/800/400', date: '2025-08-05', type: 'EXCLUSIVE', priceFemale: 50, priceMale: 100, venueId: 1 }
];

export const suggestedEvents = [events[0], events[13], events[15]];
export const timelineEvents = [events[1], events[2], events[14], events[16]];

// Mock Experiences — VIP scheduled experiences hosted by the Wingman
export const experiences: Experience[] = [
    {
        id: 1,
        title: 'Sunset Yacht Cruise',
        category: 'Yacht',
        description: 'Cruise around Biscayne Bay on a private yacht with an open bar, sunset views, and curated music. The ultimate VIP on-water experience.',
        coverImage: 'https://picsum.photos/seed/yacht/800/600',
        location: 'Miami Marina',
        duration: '4 Hours',
        pricing: { unit: 'person', general: 600 },
        access: 'invite-only',
        capacity: 12,
        hostId: 1,
        // VIP Platform fields
        scheduledDate: '2025-04-19',
        scheduledTime: '6:00 PM',
        spotsRemaining: 5,
        flatRate: 600,
        isSoldOut: false,
    },
    {
        id: 2,
        title: 'Private Island Dinner',
        category: 'Dining',
        description: 'An exclusive candlelit dinner on a private island accessible only by boat. Chef-curated tasting menu, fine wine, and unforgettable ambiance.',
        coverImage: 'https://picsum.photos/seed/island/800/600',
        location: 'Private Island, Biscayne Bay',
        duration: '3 Hours',
        pricing: { unit: 'person', general: 600 },
        access: 'invite-only',
        capacity: 8,
        hostId: 1,
        // VIP Platform fields
        scheduledDate: '2025-04-26',
        scheduledTime: '8:00 PM',
        spotsRemaining: 3,
        flatRate: 600,
        isSoldOut: false,
    },
    {
        id: 3,
        title: 'Rooftop Nightlife Experience',
        category: 'Nightlife',
        description: 'Skip the line and join an elite crew at the most exclusive rooftop venue in Miami. VIP table, bottle service, and a curated guest list.',
        coverImage: 'https://picsum.photos/seed/rooftop/800/600',
        location: 'Brickell, Miami',
        duration: '5 Hours',
        pricing: { unit: 'person', general: 600 },
        access: 'invite-only',
        capacity: 15,
        hostId: 1,
        // VIP Platform fields
        scheduledDate: '2025-04-25',
        scheduledTime: '10:00 PM',
        spotsRemaining: 0,
        flatRate: 600,
        isSoldOut: true,
    },
    {
        id: 4,
        title: 'VIP Beach Day',
        category: 'Adventure',
        description: 'Private cabana access, premium beach setup, chef-prepared lunch, and Wingman-curated activities on South Beach. Exclusive access only.',
        coverImage: 'https://picsum.photos/seed/beach/800/600',
        location: 'South Beach, Miami',
        duration: '6 Hours',
        pricing: { unit: 'person', general: 600 },
        access: 'invite-only',
        capacity: 10,
        hostId: 1,
        // VIP Platform fields
        scheduledDate: '2025-05-03',
        scheduledTime: '11:00 AM',
        spotsRemaining: 7,
        flatRate: 600,
        isSoldOut: false,
    },
];

// Mock Notifications
export const mockNotifications: AppNotification[] = [
    { id: 1, text: 'Your booking at LIV is confirmed', time: '1h ago', read: false },
    { id: 2, text: 'New event: Neon Night', time: '3h ago', read: true, link: { page: 'eventTimeline' } }
];

// Guestlist chats start empty
export const mockGuestlistChats: GuestlistChat[] = [];

export const mockGuestlistChatMessages: GuestlistChatMessage[] = [];

// Event chats start empty
export const mockEventChats: EventChat[] = [];

export const mockEventChatMessages: EventChatMessage[] = [];

// Friend zone chats start empty
export const mockFriendZoneChats: FriendZoneChat[] = [];

export const mockFriendZoneChatMessages: FriendZoneChatMessage[] = [];

// Group chat messages start empty
export const mockGroupChatMessages: any[] = [];

// Wingman chats start empty
export const mockWingmanChats: WingmanChat[] = [];

export const mockWingmanChatMessages: WingmanChatMessage[] = [];

// Invitation requests start empty
export const mockInvitationRequests: EventInvitationRequest[] = [];

export const mockEventInvitations: EventInvitation[] = [];

// Guestlist join requests start empty
export const mockGuestlistJoinRequests: GuestlistJoinRequest[] = [];

export const mockWingmanApplications: WingmanApplication[] = [
    {
        id: 1, userId: 0, status: 'pending', fullName: 'Mike Ross', stageName: 'Mikey', email: 'mike@test.com', phone: '1234567890', instagram: 'mike_promo', city: 'Miami', dob: '1995-05-05', profilePhotoUrl: '', experienceYears: '3-5 years', categories: ['Nightclubs'], venuesList: 'Space, E11even', avgWeeklyGuests: '30-60', worksWithOtherGroups: 'No', targetClientele: 'Tourists', instagramFollowers: '5000', postsEvents: 'Yes', mediaLinks: [], daysAvailable: ['Friday', 'Saturday'], preferredVenuesText: '', wantsToPromoteAccess: 'Yes', agreesToTools: 'Yes', signature: 'Mike Ross', dateSigned: '2024-01-01', submissionDate: '2024-01-01'
    }
];

export const mockDataExportRequests: DataExportRequest[] = [];

// Mock Challenges
export const challenges: Challenge[] = [
    {
        id: 1, title: 'Weekend Warrior', description: 'Attend 2 events this weekend', tasks: [{ id: 1, description: 'Attend Friday event', isCompleted: false }, { id: 2, description: 'Attend Saturday event', isCompleted: false }],
        reward: { amount: 500, currency: 'TMKC' }
    }
];

// Mock Store Items
export const storeItems: StoreItem[] = [
    {
        id: 's1', category: 'Merchandise', title: 'Wingman Cap',
        description: 'Premium embroidered cap. Members-only edition with gradient logo.',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
        price: 1000, priceUSD: 25,
    },
    {
        id: 's2', category: 'Perk', title: 'Skip the Line Pass',
        description: 'Priority entry to any Wingman nightclub event. One-time use.',
        image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80',
        price: 5000, priceUSD: 100,
    },
    {
        id: 's3', category: 'Merchandise', title: 'Wingman Hoodie',
        description: 'Oversized premium hoodie. Black on black. Gradient logo chest print.',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
        price: 2500, priceUSD: 65,
    },
    {
        id: 's4', category: 'NFT', title: 'Wingman Genesis Pass',
        description: 'Founding member digital collectible. Unlocks exclusive drops & early access.',
        image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&q=80',
        price: 10000, priceUSD: 250,
    },
    {
        id: 's5', category: 'Perk', title: 'Table Upgrade Token',
        description: 'Upgrade any dinner booking to the best table in the house. One-time use.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        price: 3500, priceUSD: 80,
    },
    {
        id: 's6', category: 'NFT', title: 'Miami Nights #001',
        description: 'Limited edition generative art. Wingman Miami Nights founding series.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        price: 7500, priceUSD: 175,
    },
];

// Payment methods are managed by Stripe at checkout — no saved cards in-app yet.
export const mockPaymentMethods: PaymentMethod[] = [];
