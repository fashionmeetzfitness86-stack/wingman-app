import { Venue, Wingman, Booking, Event, Challenge, TableOption, Experience, UserAccessLevel, User, UserRole, Bottle, StoreItem, Transaction, AccessGroup, GroupPost, Itinerary, AppNotification, GuestlistChat, GuestlistChatMessage, WingmanApplication, EventInvitationRequest, EventInvitation, EventChat, EventChatMessage, GuestlistJoinRequest, DataExportRequest, FriendZoneChat, FriendZoneChatMessage, PaymentMethod, WingmanChat, WingmanChatMessage } from '../types';

// Mock Users — only the two real admin accounts are seeded.
// All demo/fake users (example.com records) were removed.
export const users: User[] = [
  {
    id: 998, // Super Admin — secondary email
    name: 'Anderson Correavaz',
    email: 'themainkeys@gmail.com',
    profilePhoto: 'https://i.pravatar.cc/150?u=998',
    accessLevel: UserAccessLevel.ADMIN,
    role: UserRole.ADMIN,
    city: 'Miami',
    joinDate: '2022-01-01',
    status: 'active',
    approvalStatus: 'approved',
    subscriptionStatus: 'active'
  },
  {
    id: 999, // Super Admin — primary email
    name: 'Anderson Correavaz',
    email: 'anderson.correavaz@gmail.com',
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
    weeklySchedule: [{ day: 'Friday', venueId: 208 }, { day: 'Saturday', venueId: 203 }],
    assignedVenueIds: [208, 203],
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
    weeklySchedule: [{ day: 'Thursday', venueId: 211 }, { day: 'Sunday', venueId: 106 }],
    assignedVenueIds: [211, 106],
    earnings: 9800,
    isOnline: false,
    favoritedByCount: 120,
    galleryImages: ['https://picsum.photos/seed/p3/300/300']
  }
];

// Mock Venues
export const venues: Venue[] = [
  {
    id: 101,
    name: 'Marion',
    category: 'Restaurant',
    location: '1111 SW 1st Ave, Miami, FL 33130',
    musicType: 'Open Format / Lounge House',
    vibe: 'Upscale social dining, nightlife crossover',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    operatingDays: ['Friday'],
    capacity: 250,
    dressCode: 'Chic & elegant cocktail attire. Strictly enforced.',
    entryNotes: 'Dinner reservations transition to high-energy party after 11 PM.',
    arrivalTip: 'Recommended arrival by 9:45 PM for host seating.',
    isGuestlistAvailable: false,
    averageRating: 4.8,
    totalReviews: 195,
    description: "Marion is Brickell's premier dining destination, where chic upscale dining meets high-energy nightlife.",
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'brickell', 'upscale', 'party-brunch'],
    isFeatured: true,
    adminNotes: 'Hosted table requires minimum 2 bottles for VIP experience.'
  },
  {
    id: 102,
    name: 'Queen',
    category: 'Restaurant',
    location: '550 Washington Ave, Miami Beach, FL 33139',
    musicType: 'Deep House / Lounge',
    vibe: 'Luxury dining experience, elegant ambiance',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    operatingDays: ['Saturday'],
    capacity: 300,
    dressCode: 'Strict upscale dress code. Blazers/heels strongly recommended.',
    entryNotes: 'Arrive at the host stand with your booking confirmation.',
    arrivalTip: 'Arrival by 9:45 PM is essential for coordinated seating.',
    isGuestlistAvailable: false,
    averageRating: 4.9,
    totalReviews: 120,
    description: 'Located in the historic Paris Theater, Queen is a luxury Japanese dining destination of unparalleled elegance.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'south-beach', 'luxury', 'japanese'],
    isFeatured: true,
    adminNotes: 'VIP table reservation at the mezzanine overlooks the main theater floor.'
  },
  {
    id: 103,
    name: 'Baoli',
    category: 'Luxury Restaurant',
    location: '1906 Collins Ave, Miami Beach, FL 33139',
    musicType: 'Open Format',
    vibe: 'Fine dining transitioning into nightlife',
    coverImage: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 200,
    dressCode: 'Fashion-forward cocktail attire.',
    entryNotes: 'Ideal for networking and late-night social scenes.',
    arrivalTip: 'Recommended table booking by 10:00 PM.',
    isGuestlistAvailable: true,
    averageRating: 4.6,
    totalReviews: 240,
    description: 'Baoli imports the chic sophistication of the French Riviera to Miamiʼs South Beach.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'south-beach', 'international', 'nightlife'],
    isFeatured: false,
    adminNotes: 'High-volume bookings on weekends.'
  },
  {
    id: 104,
    name: 'Sexy Fish',
    category: 'Luxury Restaurant',
    location: '1001 S Miami Ave, Miami, FL 33130',
    musicType: 'Lounge House',
    vibe: 'High-end dining, premium cocktails, glamorous aesthetic',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    operatingDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    capacity: 300,
    dressCode: 'Strictly glamorous. No caps, sportswear, or shorts.',
    entryNotes: 'Prepare for a visual and culinary feast.',
    arrivalTip: 'Late dinner seating starts around 10:00 PM.',
    isGuestlistAvailable: false,
    averageRating: 4.7,
    totalReviews: 310,
    description: 'Glamorous Asian restaurant and bar in Brickell serving high-end sushi, cocktails, and late-night vibes.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'brickell', 'sushi', 'glamour'],
    isFeatured: true,
    adminNotes: 'Must-try destination for upscale clients.'
  },
  {
    id: 105,
    name: 'Negroni Midtown',
    category: 'Restaurant',
    location: '3201 Buena Vista Blvd, Miami, FL 33127',
    musicType: 'Deep House / Lounge',
    vibe: 'Modern social dining',
    coverImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 180,
    dressCode: 'Smart casual to upscale.',
    entryNotes: 'Lively bar area with signature cocktails.',
    arrivalTip: 'Happy hour and dinner seatings are popular.',
    isGuestlistAvailable: false,
    averageRating: 4.5,
    totalReviews: 160,
    description: 'Midtown\'s premier destination for fusion dining, hand-crafted cocktails, and a lively social scene.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'midtown', 'cocktails', 'fusion'],
    isFeatured: false
  },
  {
    id: 106,
    name: 'Komodo',
    category: 'Restaurant',
    location: '801 Brickell Ave, Miami, FL 33131',
    musicType: 'Open Format',
    vibe: 'Contemporary upscale Asian-inspired dining',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 450,
    dressCode: 'Upscale fashionable attire.',
    entryNotes: 'Three-story indoor/outdoor dining temple.',
    arrivalTip: 'Dine early, then head to the lounge upstairs.',
    isGuestlistAvailable: true,
    averageRating: 4.8,
    totalReviews: 540,
    description: 'Komodo connects Southeast Asian cuisine with a vibrant Brickell neighborhood energy.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'brickell', 'asian', 'lounge'],
    isFeatured: false
  },
  {
    id: 107,
    name: 'Zuma',
    category: 'Restaurant',
    location: '270 Biscayne Blvd Way, Miami, FL 33131',
    musicType: 'Minimal Lounge',
    vibe: 'Premium Japanese dining experience',
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 250,
    dressCode: 'Elegant smart casual.',
    entryNotes: 'Located in the Kimpton Epic Hotel by the river.',
    arrivalTip: 'Arrive on time; tables are held for 15 minutes.',
    isGuestlistAvailable: false,
    averageRating: 4.8,
    totalReviews: 290,
    description: 'World-class contemporary Japanese Izakaya dining in the heart of Downtown Miami.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'downtown', 'japanese', 'sushi'],
    isFeatured: false
  },
  {
    id: 108,
    name: 'Amazonico',
    category: 'Restaurant',
    location: '801 Brickell Ave, Miami, FL 33131',
    musicType: 'Electro-Pical / Latin House',
    vibe: 'Luxury destination dining',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 350,
    dressCode: 'Smart chic dress code. Highly fashionable.',
    entryNotes: 'Lush rainforest decor with high-energy lounge.',
    arrivalTip: 'Enjoy live jazz at the bar beforehand.',
    isGuestlistAvailable: false,
    averageRating: 4.7,
    totalReviews: 170,
    description: 'A sensory journey through the Amazon rainforest with upscale fusion cuisine and vibrant beats.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'brickell', 'latin', 'jungle'],
    isFeatured: false
  },
  {
    id: 109,
    name: 'Kiki on the River',
    category: 'Waterfront Restaurant',
    location: '460 NW North River Dr, Miami, FL 33128',
    musicType: 'Greek / Open Format',
    vibe: 'Mediterranean-inspired Greek social scene',
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    operatingDays: ['Friday', 'Saturday', 'Sunday'],
    capacity: 220,
    dressCode: 'Stylish waterfront dress code.',
    entryNotes: 'Lively Sunday afternoon scene with Greek music.',
    arrivalTip: 'Dine waterfront for the best river views.',
    isGuestlistAvailable: true,
    averageRating: 4.6,
    totalReviews: 380,
    description: 'Kiki on the River brings Greek island charm and celebration to the historic Miami River.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'river', 'waterfront', 'greek'],
    isFeatured: false
  },
  {
    id: 110,
    name: 'Seaspice',
    category: 'Waterfront Restaurant',
    location: '422 NW North River Dr, Miami, FL 33128',
    musicType: 'Lounge House / Melodic',
    vibe: 'Luxury waterfront dining and lounge',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    operatingDays: ['Friday', 'Saturday', 'Sunday'],
    capacity: 300,
    dressCode: 'Upscale waterfront chic.',
    entryNotes: 'Elegant riverside dock hosting yachts and dining.',
    arrivalTip: 'Popular on Saturday and Sunday afternoons.',
    isGuestlistAvailable: false,
    averageRating: 4.7,
    totalReviews: 290,
    description: 'A stylishly designed riverfront brasserie offering seafood, wood-fired cooking, and yacht dockage.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'river', 'waterfront', 'seafood'],
    isFeatured: false
  },
  {
    id: 111,
    name: 'Habibi',
    category: 'Restaurant',
    location: 'Miami Design District, FL',
    musicType: 'Middle Eastern / House',
    vibe: 'Premium Middle Eastern social dining',
    coverImage: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 150,
    dressCode: 'Glamorous and upscale.',
    entryNotes: 'Exotic Middle Eastern hospitality and music.',
    arrivalTip: 'Late evening dining transitions to nightlife.',
    isGuestlistAvailable: false,
    averageRating: 4.6,
    totalReviews: 80,
    description: 'A premium Middle Eastern dining concept that transforms dinners into sensory nightlife celebrations.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'design-district', 'arabic', 'hookah'],
    isFeatured: false
  },
  {
    id: 112,
    name: 'Casa Neos',
    category: 'Restaurant',
    location: 'Miami River, FL',
    musicType: 'Organic House',
    vibe: 'Elevated beach club and restaurant crossover',
    coverImage: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800&q=80',
    operatingDays: ['Friday', 'Saturday', 'Sunday'],
    capacity: 250,
    dressCode: 'Riviera chic dress code.',
    entryNotes: 'Aegean hospitality on the riverbank.',
    arrivalTip: 'Arrive early for sunset cocktails.',
    isGuestlistAvailable: false,
    averageRating: 4.7,
    totalReviews: 95,
    description: 'Casa Neos is a luxury riverfront beach club and restaurant offering Aegean-inspired hospitality.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'river', 'waterfront', 'beachclub'],
    isFeatured: false
  },
  {
    id: 113,
    name: 'Pluma',
    category: 'Restaurant',
    location: 'Coconut Grove, FL',
    musicType: 'Soft Lounge',
    vibe: 'Boutique luxury dining',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 120,
    dressCode: 'Smart elegant.',
    entryNotes: 'Intimate setting, valet parking available.',
    arrivalTip: 'Table reservations recommended.',
    isGuestlistAvailable: false,
    averageRating: 4.8,
    totalReviews: 60,
    description: 'Refined modern dining in the heart of Coconut Grove.',
    experienceType: 'Dinner',
    arrivalTime: '9:45 PM',
    searchTags: ['dinner', 'coconut-grove', 'intimate', 'boutique'],
    isFeatured: false
  },
  {
    id: 201,
    name: 'Vendôme',
    category: 'Nightclub',
    location: 'Miami Beach, FL',
    musicType: 'Hip Hop / Open Format',
    vibe: 'VIP Hosted Nightlife',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    operatingDays: ['Monday', 'Friday', 'Saturday'],
    capacity: 400,
    dressCode: 'Strictly upscale nightlife attire.',
    entryNotes: 'Bespoke boutique club experience for VIPs.',
    arrivalTip: 'Meet the Wingman at the VIP rope at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.7,
    totalReviews: 120,
    description: 'An intimate boutique nightclub bringing luxury design and upscale crowds to South Beach.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'south-beach', 'hiphop', 'vip'],
    isFeatured: false
  },
  {
    id: 202,
    name: 'Booby Trap',
    category: 'Nightclub',
    location: 'Miami, FL',
    musicType: 'Hip Hop / Latin',
    vibe: 'Hosted Lounge & Nightlife',
    coverImage: 'https://images.unsplash.com/photo-1489641499538-be02ed38ac99?w=800&q=80',
    operatingDays: ['Monday', 'Thursday', 'Sunday'],
    capacity: 300,
    dressCode: 'Chic / fashionable streetwear.',
    entryNotes: 'Laid-back yet highly energetic local lounge.',
    arrivalTip: 'Wingman hosted meetup starts at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.4,
    totalReviews: 95,
    description: 'A legendary local late-night hosted lounge experience with top-tier vibes.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'local', 'lounge', 'hiphop'],
    isFeatured: false
  },
  {
    id: 203,
    name: 'Mr. Jones',
    category: 'Nightclub',
    location: '320 Lincoln Rd, Miami Beach, FL 33139',
    musicType: 'Hip Hop / Top 40',
    vibe: 'VIP Hosted Nightclub Experience',
    coverImage: 'https://images.unsplash.com/photo-1571265209853-8cf0b7a2c39b?w=800&q=80',
    operatingDays: ['Tuesday', 'Friday', 'Saturday'],
    capacity: 600,
    dressCode: 'Clean, stylish nightclub look.',
    entryNotes: 'Skip the lines with direct hosted check-in.',
    arrivalTip: 'Hosted check-in begins at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.6,
    totalReviews: 180,
    description: 'Miami Beach\'s premier hip-hop nightclub hosting world-class artists and high-energy crowds.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'south-beach', 'hiphop', 'celebrities'],
    isFeatured: true
  },
  {
    id: 204,
    name: 'Mona Club',
    category: 'Nightclub',
    location: 'Miami Beach, FL',
    musicType: 'Techno / House',
    vibe: 'High Energy Electronic Nightlife',
    coverImage: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80',
    operatingDays: ['Tuesday', 'Thursday', 'Sunday'],
    capacity: 1200,
    dressCode: 'Dark chic / avant-garde.',
    entryNotes: 'State-of-the-art visual production and massive sound.',
    arrivalTip: 'Meet the host at the entrance by 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.5,
    totalReviews: 310,
    description: 'Replaces M2. Mona Club is the new epicenter of electronic music on Miami Beach.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'south-beach', 'techno', 'house'],
    isFeatured: false
  },
  {
    id: 205,
    name: 'Coco',
    category: 'Nightclub',
    location: 'Miami, FL',
    musicType: 'Open Format',
    vibe: 'High Energy / Exclusive Boutique Clubbing',
    coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    operatingDays: ['Wednesday', 'Friday', 'Saturday'],
    capacity: 500,
    dressCode: 'Fashionable, upscale nightlife attire.',
    entryNotes: 'Intimate room with premium bottle service.',
    arrivalTip: 'Meet the Wingman at the VIP rope at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.7,
    totalReviews: 110,
    description: 'Coco combines sleek modern design with the energy of a premium global boutique club.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'boutique', 'exclusive', 'fashion'],
    isFeatured: false
  },
  {
    id: 206,
    name: 'Bacara',
    category: 'Nightclub',
    location: 'Brickell, FL',
    musicType: 'Latin House / Open Format',
    vibe: 'Sophisticated Late Night Vibe',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    operatingDays: ['Wednesday'],
    capacity: 350,
    dressCode: 'Smart elegant nightlife.',
    entryNotes: 'Brickell\'s premier mid-week nightlife option.',
    arrivalTip: 'Meet the host at the side door by 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.5,
    totalReviews: 70,
    description: 'Brickell\'s premier mid-week nightlife experience combining global beats and chic crowds.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'brickell', 'latin', 'midweek'],
    isFeatured: false
  },
  {
    id: 207,
    name: 'Mynt',
    category: 'Nightclub',
    location: '1921 Collins Ave, Miami Beach, FL 33139',
    musicType: 'House / EDM',
    vibe: 'Elite Nightlife / High Fashion',
    coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday'],
    capacity: 400,
    dressCode: 'Strict ultra-chic dress code. Collared shirts for men.',
    entryNotes: 'Ultra-exclusive lounge with a strict door policy.',
    arrivalTip: 'Hosted check-in is strictly at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.6,
    totalReviews: 190,
    description: 'A legendary South Beach lounge renowned for its strict door and premium EDM vibe.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'south-beach', 'house', 'models'],
    isFeatured: false
  },
  {
    id: 208,
    name: 'LIV',
    category: 'Nightclub',
    location: '4441 Collins Ave, Miami Beach, FL 33140',
    musicType: 'EDM / Open Format',
    vibe: 'High Energy Festival Production',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    operatingDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 1500,
    dressCode: 'Strict upscale dress code. No sneakers/shorts.',
    entryNotes: 'World-famous megaclub located at the Fontainebleau.',
    arrivalTip: 'Hosted entry is coordinated at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.8,
    totalReviews: 680,
    description: 'LIV stands as the global standard for mega-clubs, combining high-energy production and world-famous artists.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'megaclub', 'edm', 'fontainebleau'],
    isFeatured: true
  },
  {
    id: 209,
    name: 'Club Space',
    category: 'Nightclub',
    location: '34 NE 11th St, Miami, FL 33132',
    musicType: 'Techno / Tech House / Minimal',
    vibe: 'Legendary Multi-Room Marathon',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    operatingDays: ['Friday', 'Saturday'],
    capacity: 2000,
    dressCode: 'Club/festival casual. Sunglasses encouraged.',
    entryNotes: 'Terrace is open all night and morning.',
    arrivalTip: 'Meet host at 1:00 AM at the VIP line.',
    isGuestlistAvailable: true,
    averageRating: 4.9,
    totalReviews: 920,
    description: 'The global capital of marathon clubbing, where electronic music runs from midnight to afternoon.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'terrace', 'techno', 'house'],
    isFeatured: true
  },
  {
    id: 210,
    name: 'Electric Lady',
    category: 'Nightclub',
    location: 'Miami, FL',
    musicType: 'Indie Dance / Nu-Disco',
    vibe: 'Trendy, Retro Nightlife Vibe',
    coverImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
    operatingDays: ['Friday', 'Saturday'],
    capacity: 350,
    dressCode: 'Trendy, fashionable street/clubwear.',
    entryNotes: 'Bespoke sound and retro cocktail lounge.',
    arrivalTip: 'Hosted check-in begins at 1:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.5,
    totalReviews: 65,
    description: 'An intimate dance club offering an alternative nu-disco soundscape and high-end cocktails.',
    experienceType: 'Nightclub',
    arrivalTime: '1:00 AM',
    searchTags: ['club', 'indie', 'disco', 'cocktails'],
    isFeatured: false
  },
  {
    id: 211,
    name: 'E11EVEN',
    category: 'After Hours Nightclub',
    location: '29 NE 11th St, Miami, FL 33132',
    musicType: 'Open Format / EDM',
    vibe: '24/7 Theatrical Show Club',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    capacity: 1000,
    dressCode: 'Stylish nightlife attire.',
    entryNotes: '24-hour ultra club with circus-style acts.',
    arrivalTip: 'Standard entry at 12:00 AM (Midnight). Hosted nights (Thu-Sun) have meetup at 3:00 AM.',
    isGuestlistAvailable: true,
    averageRating: 4.8,
    totalReviews: 810,
    description: 'E11EVEN is the premier 24/7 after-hours ultra club, featuring theatrical shows and top DJs in a festival atmosphere.',
    experienceType: 'Nightclub',
    arrivalTime: '12:00 AM',
    searchTags: ['club', 'afterhours', '24-7', 'show'],
    isFeatured: true
  },
  {
    id: 301,
    name: 'Wingman Yacht Party',
    category: 'Yacht Experience',
    location: 'Miami Beach Marina, FL',
    musicType: 'Summer House / Afro House',
    vibe: 'Premium hosted social yacht cruise',
    coverImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    operatingDays: ['Friday', 'Saturday', 'Sunday'],
    capacity: 12,
    dressCode: 'Boating chic / swimwear with cover-ups.',
    entryNotes: 'Boarding begins at Marina dock. Drinks provided.',
    arrivalTip: 'Boarding strictly at 4:00 PM.',
    isGuestlistAvailable: false,
    averageRating: 4.9,
    totalReviews: 140,
    description: 'A premium hosted Yacht Experience sailing around Miami\'s beautiful Biscayne Bay with champagne and house beats.',
    experienceType: 'Yacht',
    arrivalTime: '4:00 PM',
    searchTags: ['yacht', 'bay', 'cruise', 'champagne'],
    isFeatured: true
  }
];

// Mock Bottles
export const bottles: Bottle[] = [
  { id: 'b1', name: 'Grey Goose', price: 350 },
  { id: 'b2', name: 'Dom Perignon', price: 650 },
  { id: 'b3', name: 'Don Julio 1942', price: 700 },
  { id: 'b4', name: "Tito's Vodka", price: 300 },
  { id: 'b5', name: 'Casamigos Blanco', price: 400 },
  { id: 'b6', name: 'Casamigos Reposado', price: 450 },
  { id: 'b7', name: 'Hennessy V.S', price: 350 },
  { id: 'b8', name: 'Moët & Chandon Imperial', price: 250 },
  { id: 'b9', name: 'Clase Azul Reposado', price: 750 },
  { id: 'b10', name: 'Ace of Spades Gold', price: 800 }
];

// Booking history starts empty
export const bookingHistory: Booking[] = [];

// Mock Transactions
export const mockTokenTransactions: Transaction[] = [
  { type: 'add', amount: 1000, reason: 'Purchase', date: '2023-12-01', time: '10:00 AM' },
  { type: 'spend', amount: 200, reason: 'Event Ticket', date: '2023-12-05', time: '09:30 PM', itemName: 'Neon Party' }
];

// Empty starts for other records
export const accessGroups: AccessGroup[] = [];
export const groupPosts: GroupPost[] = [];
export const itineraries: Itinerary[] = [];
export const events: Event[] = [];
export const suggestedEvents: any[] = [];
export const timelineEvents: any[] = [];
export const experiences: Experience[] = [];

// Mock Notifications
export const mockNotifications: AppNotification[] = [
  { id: 1, text: 'Your booking at LIV is confirmed', time: '1h ago', read: false },
  { id: 2, text: 'New event available', time: '3h ago', read: true, link: { page: 'eventTimeline' } }
];

// Chat lists
export const mockGuestlistChats: GuestlistChat[] = [];
export const mockGuestlistChatMessages: GuestlistChatMessage[] = [];
export const mockEventChats: EventChat[] = [];
export const mockEventChatMessages: EventChatMessage[] = [];
export const mockFriendZoneChats: FriendZoneChat[] = [];
export const mockFriendZoneChatMessages: FriendZoneChatMessage[] = [];
export const mockGroupChatMessages: any[] = [];
export const mockWingmanChats: WingmanChat[] = [];
export const mockWingmanChatMessages: WingmanChatMessage[] = [];

// Invitations
export const mockInvitationRequests: EventInvitationRequest[] = [];
export const mockEventInvitations: EventInvitation[] = [];
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

export const mockPaymentMethods: PaymentMethod[] = [];
