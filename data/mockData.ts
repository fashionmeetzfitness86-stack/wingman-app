
import { Venue, Promoter, Booking, Event, Challenge, TableOption, Experience, UserAccessLevel, User, UserRole, Bottle, StoreItem, Transaction, AccessGroup, GroupPost, Itinerary, AppNotification, GuestlistChat, GuestlistChatMessage, PromoterApplication, EventInvitationRequest, EventInvitation, EventChat, EventChatMessage, GuestlistJoinRequest, DataExportRequest, FriendZoneChat, FriendZoneChatMessage, PaymentMethod } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: 101,
    name: 'John Doe',
    email: 'john@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=101',
    accessLevel: UserAccessLevel.ACCESS_MALE,
    role: UserRole.USER,
    city: 'Miami',
    joinDate: '2023-01-15',
    instagramHandle: 'johndoe',
    phoneNumber: '+15550101',
    preferences: { music: ['House', 'Hip Hop'], activities: ['Nightclub', 'Dining'], personality: 'Social', timeOfDay: 'Nighttime' },
    status: 'active',
    friends: [102]
  },
  {
    id: 102,
    name: 'Jane Smith',
    email: 'jane@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=102',
    accessLevel: UserAccessLevel.APPROVED_GIRL,
    role: UserRole.USER,
    city: 'Miami',
    joinDate: '2023-02-20',
    instagramHandle: 'janesmith',
    phoneNumber: '+15550102',
    preferences: { music: ['Pop', 'EDM'], activities: ['Pool Party', 'Lounge'], personality: 'Energetic', timeOfDay: 'Both' },
    status: 'active',
    friends: [101]
  },
  {
    id: 103,
    name: 'Newbie Nick',
    email: 'nick@general.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=103',
    accessLevel: UserAccessLevel.GENERAL,
    role: UserRole.USER,
    city: 'Miami',
    joinDate: '2024-01-01',
    instagramHandle: 'newbie_nick',
    phoneNumber: '+15550103',
    preferences: { music: ['Top 40'], activities: ['Dining'], personality: 'Observer', timeOfDay: 'Daytime' },
    status: 'active',
    friends: []
  },
  {
    id: 104,
    name: 'Alex Google',
    email: 'alex@google.com',
    profilePhoto: 'https://lh3.googleusercontent.com/a/ACg8ocIq8jF8=s96-c', // Generic google-like placeholder URL
    accessLevel: UserAccessLevel.ACCESS_MALE,
    role: UserRole.USER,
    city: 'New York',
    joinDate: '2023-05-10',
    instagramHandle: 'alex_g',
    phoneNumber: '+15550104',
    status: 'active',
    bio: 'Logged in via Google',
    preferences: { music: ['Tech House'], activities: ['Rooftop'], personality: 'Chill', timeOfDay: 'Nighttime' }
  },
  {
    id: 105,
    name: 'Sarah Facebook',
    email: 'sarah@facebook.com',
    profilePhoto: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=12345&height=200&width=200&ext=12345', // Generic FB-like
    accessLevel: UserAccessLevel.APPROVED_GIRL,
    role: UserRole.USER,
    city: 'Los Angeles',
    joinDate: '2023-06-15',
    instagramHandle: 'sarah_fb',
    phoneNumber: '+15550105',
    status: 'active',
    bio: 'Logged in via Facebook',
    preferences: { music: ['Hip Hop', 'R&B'], activities: ['Nightclub'], personality: 'Social', timeOfDay: 'Both' }
  },
  {
    id: 1, // Matches Promoter Anderson in App.tsx
    name: 'Anderson',
    email: 'anderson@example.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=1',
    accessLevel: UserAccessLevel.PROMO,
    role: UserRole.PROMOTER,
    city: 'Miami',
    joinDate: '2022-11-01',
    instagramHandle: 'anderson_promo',
    phoneNumber: '+15550999',
    status: 'active'
  },
  {
    id: 999, // Admin
    name: 'Admin User',
    email: 'admin@wingman.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=999',
    accessLevel: UserAccessLevel.ADMIN,
    role: UserRole.ADMIN,
    city: 'Miami',
    joinDate: '2022-01-01',
    status: 'active'
  }
];

// Mock Promoters
export const promoters: Promoter[] = [
  {
    id: 1,
    name: 'Anderson',
    handle: '@anderson_promo',
    rating: 4.9,
    bio: 'Top promoter for LIV and Story. I can get you the best tables.',
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
    tableOptions: []
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

// Mock Booking History
export const bookingHistory: Booking[] = [
    { id: 1, userId: 101, venueName: 'LIV', promoterName: 'Anderson', date: '2023-10-15', tableTier: 'Dance Floor Table', status: 'Completed' },
    { id: 2, userId: 102, venueName: 'Story', promoterName: 'Anderson', date: '2023-11-20', tableTier: 'VIP Booth', status: 'Confirmed' }
];

// Mock Transactions
export const mockTokenTransactions: Transaction[] = [
    { type: 'add', amount: 1000, reason: 'Purchase', date: '2023-12-01', time: '10:00 AM' },
    { type: 'spend', amount: 200, reason: 'Event Ticket', date: '2023-12-05', time: '09:30 PM', itemName: 'Neon Party' }
];

// Mock Access Groups
export const accessGroups: AccessGroup[] = [
    { id: 1, name: 'Miami VIPs', description: 'Exclusive group for high rollers', coverImage: 'https://picsum.photos/seed/g1/400/300', memberIds: [101, 102], creatorId: 1, status: 'approved', creationDate: '2023-01-01', isFeatured: true },
    { id: 2, name: 'Techno Lovers', description: 'For those who love the beat', coverImage: 'https://picsum.photos/seed/g2/400/300', memberIds: [102], creatorId: 102, status: 'approved', creationDate: '2023-03-15' }
];

// Mock Group Posts
export const groupPosts: GroupPost[] = [
    { id: 1, groupId: 1, authorId: 1, content: 'Welcome everyone! Get ready for the weekend.', timestamp: '2h ago', likes: [101, 102] }
];

// Mock Itineraries
export const itineraries: Itinerary[] = [
    {
        id: 1, creatorId: 101, title: 'My Birthday Bash', description: 'Planning for next month', date: '2024-05-20', sharedWithUserIds: [], isPublic: false,
        items: [
            { id: 'i1', type: 'venue', itemId: 1, startTime: '11:00 PM' },
            { id: 'i2', type: 'note', customTitle: 'After party', startTime: '03:00 AM', notes: 'At the villa' }
        ]
    }
];

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

// Mock Experiences
export const experiences: Experience[] = [
    {
        id: 1, title: 'Sunset Yacht Cruise', category: 'Yacht', description: 'Cruise around Biscayne Bay', coverImage: 'https://picsum.photos/seed/yacht/800/600', location: 'Miami Marina', duration: '4 Hours',
        pricing: { unit: 'group', general: 2500 }, access: 'open'
    },
    {
        id: 2, title: 'Private Island Dinner', category: 'Dining', description: 'Exclusive dining experience', coverImage: 'https://picsum.photos/seed/island/800/600', location: 'Private Island', duration: '3 Hours',
        pricing: { unit: 'person', general: 500 }, access: 'invite-only'
    }
];

// Mock Notifications
export const mockNotifications: AppNotification[] = [
    { id: 1, text: 'Your booking at LIV is confirmed', time: '1h ago', read: false },
    { id: 2, text: 'New event: Neon Night', time: '3h ago', read: true, link: { page: 'eventTimeline' } }
];

// Mock Chats
export const mockGuestlistChats: GuestlistChat[] = [
    { id: 1, venueId: 1, date: '2025-06-15', promoterId: 1, memberIds: [101, 1] }
];

export const mockGuestlistChatMessages: GuestlistChatMessage[] = [
    { id: 1, chatId: 1, senderId: 1, text: 'Hey! Looking forward to seeing you.', timestamp: '10:00 AM' }
];

export const mockEventChats: EventChat[] = [
    { id: 1, eventId: 202, memberIds: [101, 102] }
];

export const mockEventChatMessages: EventChatMessage[] = [
    { id: 1, chatId: 1, senderId: 101, text: 'Is anyone else going?', timestamp: '09:00 AM' }
];

// Mock Friend Zone Chats
export const mockFriendZoneChats: FriendZoneChat[] = [
    {
        id: 1,
        name: "Weekend Plans 🥂",
        creatorId: 101,
        memberIds: [101, 102],
        promoterIds: []
    },
    {
        id: 2,
        name: "Birthday Trip 🌴",
        creatorId: 102,
        memberIds: [102, 101],
        promoterIds: [1] // Anderson added
    }
];

export const mockFriendZoneChatMessages: FriendZoneChatMessage[] = [
    { id: 1, chatId: 1, senderId: 101, text: "Are we going out this Saturday?", timestamp: "10:00 AM" },
    { id: 2, chatId: 1, senderId: 102, text: "Yes! I want to go to LIV.", timestamp: "10:05 AM" },
    { id: 3, chatId: 2, senderId: 102, text: "Hey guys, planning my bday for next month.", timestamp: "Yesterday" },
    { id: 4, chatId: 2, senderId: 1, text: "Let me know the dates, I can sort you out with a table.", timestamp: "Yesterday" }
];

export const mockGroupChatMessages: any[] = [
    { senderId: 101, text: 'Hey everyone!', timestamp: '10:00 AM' }
];

// Mock Requests
export const mockInvitationRequests: EventInvitationRequest[] = [
    { id: 1, userId: 101, eventId: 204, status: 'pending' }
];

export const mockEventInvitations: EventInvitation[] = [
    { id: 1, eventId: 202, inviterId: 102, inviteeId: 101, status: 'pending', timestamp: '2024-01-01T10:00:00Z' }
];

export const mockGuestlistJoinRequests: GuestlistJoinRequest[] = [
    { id: 1, userId: 102, venueId: 1, promoterId: 1, date: '2025-06-15', status: 'pending', attendanceStatus: 'pending', isVip: true }
];

export const mockPromoterApplications: PromoterApplication[] = [
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
    { id: 's1', category: 'Merchandise', title: 'Wingman Cap', description: 'Official cap', image: 'https://picsum.photos/seed/cap/400/400', price: 1000, priceUSD: 25 },
    { id: 's2', category: 'Perk', title: 'Skip the Line Pass', description: 'One time use', image: 'https://picsum.photos/seed/pass/400/400', price: 5000, priceUSD: 100 }
];

// Mock Payment Methods
export const mockPaymentMethods: PaymentMethod[] = [
    { id: '1', category: 'cards', type: 'Visa', last4: '4567', expiry: '03/2026', isDefault: true, cardholderName: 'John Doe' },
    { id: '2', category: 'cards', type: 'Mastercard', last4: '1234', expiry: '01/2025', isDefault: false, cardholderName: 'John Doe' },
    { id: '3', category: 'cards', type: 'American Express', last4: '7890', expiry: '05/2027', isDefault: false, cardholderName: 'John Doe' },
    { id: '4', category: 'other', type: 'PayPal', icon: 'https://picsum.photos/seed/paypal/40/40', isDefault: false },
    { id: '5', category: 'other', type: 'Cash App', icon: 'https://picsum.photos/seed/cashapp/40/40', isDefault: false },
    { id: '6', category: 'other', type: 'Crypto Wallet', icon: 'https://picsum.photos/seed/crypto/40/40', isDefault: false },
];
