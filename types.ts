
export enum UserRole {
  ADMIN = 'Admin',
  PROMOTER = 'Promoter',
  USER = 'User',
}

export type SpenderCategory = '<$5k' | '$5k+' | '$10k+' | '$20k+';

export interface User {
  id: number;
  name: string;
  email: string;
  profilePhoto: string;
  accessLevel: UserAccessLevel;
  role: UserRole;
  bio?: string;
  city?: string;
  joinDate?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  phoneNumber?: string;
  preferences?: {
    music: string[];
    activities: string[];
    personality: string;
    timeOfDay?: 'Daytime' | 'Nighttime' | 'Both';
  };
  approvedByPromoters?: number[];
  accessGroupIds?: number[];
  friends?: number[];
  isOnline?: boolean;
  dob?: string; // YYYY-MM-DD
  ethnicity?: string;
  status: 'active' | 'blocked' | 'suspended';
  appearance?: {
    height: string;
    eyeColor: string;
    hairColor: string;
    build: string;
  };
  favoritePromoterIds?: number[];
  favoriteVenueIds?: number[];
  galleryImages?: string[];
  subscriptionStatus?: 'active' | 'past_due' | 'suspended' | 'free_tier';
  subscriptionDueDate?: string; // YYYY-MM-DD
  autoPayEnabled?: boolean;
  waiveSubscriptionUntil?: string; // 'forever' or a YYYY-MM-DD date
  isNewUser?: boolean;
  referralCode?: string;
  referralsCount?: number;
  referralEarnings?: number;
  referredByPromoterId?: number;
  promoterRatings?: { promoterId: number; rating: number }[];
  hasProfileReward?: boolean;
  notificationsEnabled?: boolean;
}

export interface UserWithAnalytics extends User {
    totalSpend: number;
    spenderCategory: SpenderCategory;
}

export enum UserAccessLevel {
  GENERAL = 'General Access',
  ACCESS_MALE = 'Access Male',
  APPROVED_GIRL = 'Approved Girl',
  ADMIN = 'Admin Access',
  PROMO = 'Promo Access',
}

export interface TableOption {
  id: string;
  name: string;
  area: string;
  minSpend: number;
  description: string;
  capacityHint: 'Small Groups' | 'Large Groups';
  notes?: string;
  totalAvailable?: number;
}

export interface Venue {
  id: number;
  name: string;
  category: 'Nightclub' | 'Restaurant' | 'Lounge' | 'Beach Club' | 'Pool Party';
  location: string;
  musicType: string;
  vibe: string;
  coverImage: string;
  tableOptions?: TableOption[];
  operatingDays: string[]; // e.g., ['Thursday', 'Friday', 'Saturday']
  capacity?: number;
  videoTourUrl?: string;
  amenities?: string[];
  averageRating?: number;
  totalReviews?: number;
  isGuestlistAvailable?: boolean;
  guestlistCapacity?: number;
}

export interface Promoter {
  id: number;
  name: string;
  handle: string;
  rating: number;
  bio: string;
  profilePhoto: string;
  city: string;
  weeklySchedule: { day: string; venueId?: number; eventId?: number | string }[];
  assignedVenueIds: number[];
  earnings?: number;
  isOnline?: boolean;
  favoritedByCount: number;
  galleryImages: string[];
}

export interface PromoterApplication {
  id: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  fullName: string;
  stageName: string;
  email: string;
  phone: string;
  instagram: string;
  city: string;
  dob: string;
  profilePhotoUrl: string;
  experienceYears: string;
  categories: string[];
  venuesList: string;
  avgWeeklyGuests: string;
  worksWithOtherGroups: string;
  otherGroupsNames?: string;
  targetClientele: string;
  instagramFollowers: string;
  otherSocials?: string;
  postsEvents: string;
  mediaLinks: string[];
  daysAvailable: string[];
  preferredVenuesText: string;
  wantsToPromoteAccess: string;
  agreesToTools: string;
  signature: string;
  dateSigned: string;
  submissionDate: string;
}


export interface TableTier {
  name:string;
  price: number;
  description: string;
}

export interface Bottle {
    id: string;
    name: string;
    price: number;
}

export interface ConfirmedBookingDetails {
  bookingId?: string;
  promoter?: Promoter;
  venue?: Venue;
  date: string;
  tableOption?: TableOption;
  event?: Event;
  experience?: Experience;
  numberOfGuests: number;
  totalPrice: number;
  guestDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Booking {
  id: number;
  userId: number;
  venueName: string;
  promoterName: string;
  date: string;
  tableTier: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface Event {
  id: number | string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
  date: string; // YYYY-MM-DD
  type: 'EXCLUSIVE' | 'INVITE ONLY';
  priceFemale: number;
  priceMale: number;
  priceGeneral?: number;
  capacity?: number;
  currentAttendees?: number;
  venueId: number;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate: string; // YYYY-MM-DD
  };
  accessLevels?: UserAccessLevel[];
}

export interface EventInvitationRequest {
  id: number;
  userId: number;
  eventId: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ExperienceInvitationRequest {
  id: number;
  userId: number;
  experienceId: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EventInvitation {
  id: number;
  eventId: number;
  inviterId: number;
  inviteeId: number;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string; // ISO String
}

export interface ChallengeTask {
  id: number;
  description: string;
  isCompleted: boolean;
  details?: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  tasks: ChallengeTask[];
  reward: {
    amount: number;
    currency: string;
  };
}

export interface Experience {
  id: number;
  title: string;
  category: 'Yacht' | 'Dining' | 'Adventure' | 'Wellness' | 'Nightlife' | 'Stays';
  description: string;
  coverImage: string;
  location: string;
  duration: string;
  pricing: {
      unit: 'person' | 'group' | 'hour' | 'night' | 'week';
      male?: number;
      female?: number;
      general?: number;
      promoter?: number;
  };
  access: 'open' | 'restricted' | 'invite-only';
  requiredAccessLevel?: UserAccessLevel;
  promoterId?: number;
  capacity?: number;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  venueId?: number;
}

export interface ConfirmedExperienceBookingDetails {
  experienceTitle: string;
  total: number;
  paymentMethod: 'tokens' | 'usd';
  guestDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  quantity: number;
}

export interface StoreItem {
  id: string;
  category: 'Merchandise' | 'NFT' | 'Perk';
  title: string;
  description: string;
  image: string;
  video?: string;
  price: number; // Token price
  priceUSD: number;
}

export interface Transaction {
  type: 'add' | 'spend';
  amount: number;
  reason: string;
  date: string;
  time: string;
  itemName?: string;
}

export interface AccessGroup {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  memberIds: number[];
  isFeatured?: boolean;
  creationDate: string; // e.g., '2024-07-01'
  creatorId: number;
  status: 'approved' | 'pending';
}

export interface GroupPost {
  id: number;
  groupId: number;
  authorId: number; // Promoter or Admin ID
  content: string;
  image?: string;
  likes: number[]; // Array of user IDs who liked
  timestamp: string; // e.g., "2h ago"
}

export interface ItineraryItem {
  id: string; // unique id for the item in the list
  type: 'venue' | 'event' | 'experience' | 'note';
  itemId?: number; // Corresponds to venue/event/experience ID
  startTime: string; // e.g., "08:00 PM"
  endTime?: string;
  notes?: string;
  customTitle?: string; // For 'note' type
}

export interface Itinerary {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  items: ItineraryItem[];
  sharedWithUserIds: number[];
  isPublic: boolean;
}

export interface GuestlistChat {
  id: number;
  venueId: number;
  date: string;
  promoterId: number;
  memberIds: number[];
  meetupTime?: string;
}

export interface GuestlistChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  timestamp: string;
}

export interface GuestlistJoinRequest {
  id: number;
  userId: number;
  venueId: number;
  promoterId: number;
  date: string; // "YYYY-MM-DD"
  status: 'pending' | 'approved' | 'rejected';
  attendanceStatus: 'pending' | 'show' | 'no-show';
  isVip?: boolean;
}

export interface EventChat {
  id: number;
  eventId: number;
  memberIds: number[];
}

export interface EventChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  timestamp: string;
}

// --- NEW TYPES FOR FRIEND ZONE CHAT ---
export interface FriendZoneChat {
    id: number;
    name: string;
    creatorId: number;
    memberIds: number[];
    promoterIds?: number[]; // Array of promoter IDs added to chat
}

export interface FriendZoneChatMessage {
    id: number;
    chatId: number;
    senderId: number;
    text: string;
    timestamp: string;
}
// --------------------------------------

export interface GroupJoinRequest {
  id: number;
  groupId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface VenueReview {
  id: number;
  venueId: number;
  userId: number;
  rating: number;
  text: string;
  timestamp: string;
}

export interface CartItem {
  id: string; // unique id for the cart item, e.g., `table-${venueId}-${date}-${tableOptionId}`
  type: 'table' | 'event' | 'experience' | 'storeItem' | 'guestlist';
  
  // Common details
  name: string;
  image: string;
  date?: string; // Formatted date for display
  sortableDate?: string; // "YYYY-MM-DD" for sorting
  quantity: number;
  
  // Pricing
  fullPrice?: number;
  depositPrice?: number;
  paymentOption?: 'deposit' | 'full';
  paymentMethod?: 'tokens' | 'usd' | 'cashapp';

  isPlaceholder?: boolean;
  bookedTimestamp?: number;

  // Table-specific details
  tableDetails?: {
      venue: Venue;
      tableOption?: TableOption;
      promoter?: Promoter;
      guestDetails?: { name: string; email: string; phone: string; };
      numberOfGuests?: number;
      selectedBottles?: { id: string; name: string; price: number; quantity: number; }[];
      specialRequests?: string;
  };

  // Event/Experience details can be added later
  eventDetails?: {
      event: Event;
      guestDetails?: { name: string; email: string; };
  };
  experienceDetails?: {
      experience: Experience;
      guestDetails?: { name: string; email: string; phone: string; };
  };
  storeItemDetails?: {
    item: StoreItem;
  };
  guestlistDetails?: {
    venue: Venue;
    promoter: Promoter;
    numberOfGuests: number;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

export interface AppNotification {
  id: number;
  text: string;
  time: string;
  read: boolean;
  link?: { page: Page; params?: { [key: string]: any } };
  isPush?: boolean;
  itemId?: number | string;
  itemType?: 'event' | 'venue';
}

export interface PushCampaign {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'venue' | 'guestlist' | 'general';
  targetId?: string;
  frequency: '6 Hours' | '12 Hours' | '24 Hours' | '48 Hours' | '72 Hours' | '5 Days' | '7 Days' | '15 Days';
  duration: string; // e.g., 'Until Stopped' or a date
  startDate: string;
  status: 'active' | 'inactive';
  sentCount: number;
}

export interface DataExportRequest {
  id: string;
  requestDate: string; // ISO String
  status: 'pending' | 'completed' | 'failed' | 'expired';
  downloadUrl?: string;
  expiryDate?: string; // ISO string for download link expiry
}

export interface PaymentMethod {
    id: string;
    category: 'cards' | 'other';
    type: string;
    last4?: string;
    expiry?: string;
    icon?: string;
    isDefault: boolean;
    brand?: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
    cardholderName?: string;
    detail?: string; // e.g., email for PayPal, wallet address for Crypto
}

export type Page =
  | 'home'
  | 'directory'
  | 'promoterProfile'
  | 'userProfile'
  | 'editProfile'
  | 'favorites'
  | 'eventTimeline'
  | 'challenges'
  | 'bookings'
  | 'settings'
  | 'security'
  | 'privacy'
  | 'notificationsSettings'
  | 'help'
  | 'reportIssue'
  | 'cookieSettings'
  | 'dataExport'
  | 'bookATable'
  | 'chatbot'
  | 'liveChat'
  | 'exclusiveExperiences'
  | 'adminDashboard'
  | 'promoterDashboard'
  | 'groupChat'
  | 'store'
  | 'tokenWallet'
  | 'venueDetails'
  | 'accessGroups'
  | 'accessGroupFeed'
  | 'myItineraries'
  | 'itineraryDetails'
  | 'itineraryBuilder'
  | 'bookingConfirmed'
  | 'promoterApplication'
  | 'createGroup'
  | 'guestlistChats'
  | 'guestlistChat'
  | 'invitations'
  | 'checkout'
  | 'eventChat'
  | 'eventChatsList'
  | 'startBookingChat'
  | 'promoterStats'
  | 'paymentMethods'
  | 'friendsZone'
  | 'friendZoneChat'; // Added friendZoneChat
