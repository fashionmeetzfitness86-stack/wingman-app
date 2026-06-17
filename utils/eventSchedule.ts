/**
 * eventSchedule.ts
 * ─────────────────────────────────────────────────────────────
 * Master weekly schedule + instance generator for the Wingman
 * recurring event engine.
 */

import { EventInstance, Event, Venue, WeeklyScheduleEntry } from '../types';
import { venues as venuesMock } from '../data/mockData';

// ─── IMAGE POOL ──────────────────────────────────────────────
const IMG = {
  nightclub1: 'https://images.unsplash.com/photo-1571265209853-8cf0b7a2c39b?w=800&q=80',
  nightclub2: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  nightclub3: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  dinner1:    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  dinner2:    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  yacht1:     'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
};

// ─── DEFAULT OFFICIAL RECURRING EVENTS ────────────────────────
// Official pricing policy (2025):
//  • Nightclub experiences : $500 per person
//  • Restaurant/Dinner     : $450 flat (includes up to 2 guests)
//  • Yacht experiences     : $400 per person
export const DEFAULT_EVENTS: Event[] = [
  // ── MONDAY (Start: 2026-06-15)
  {
    id: 'rec-mon-vendome',
    title: 'Wingman @ Vendôme',
    description: 'VIP Hosted Nightlife at Vendôme.',
    image: IMG.nightclub1,
    date: '2026-06-15',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 201,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' },
    wingmanId: 1,
    hostId: 1
  },
  {
    id: 'rec-mon-boobytrap',
    title: 'Wingman @ Booby Trap',
    description: 'Hosted Nightlife at Booby Trap.',
    image: IMG.nightclub2,
    date: '2026-06-15',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 202,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' },
    wingmanId: 2,
    hostId: 2
  },
  {
    id: 'rec-mon-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-15',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '12:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── TUESDAY (Start: 2026-06-16)
  {
    id: 'rec-tue-mrjones',
    title: 'Wingman @ Mr. Jones',
    description: 'VIP Hosted Experience at Mr. Jones.',
    image: IMG.nightclub1,
    date: '2026-06-16',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 203,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' },
    wingmanId: 1,
    hostId: 1
  },
  {
    id: 'rec-tue-monaclub',
    title: 'Wingman @ Mona Club',
    description: 'Electronic music nightlife at Mona Club.',
    image: IMG.nightclub2,
    date: '2026-06-16',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 204,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' },
    wingmanId: 2,
    hostId: 2
  },
  {
    id: 'rec-tue-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-16',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '12:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── WEDNESDAY (Start: 2026-06-17)
  {
    id: 'rec-wed-coco',
    title: 'Wingman @ Coco',
    description: 'Boutique nightclub VIP experience.',
    image: IMG.nightclub1,
    date: '2026-06-17',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 205,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-wed-bacara',
    title: 'Wingman @ Bacara',
    description: 'Latin House mid-week energy at Bacara.',
    image: IMG.nightclub2,
    date: '2026-06-17',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 206,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-wed-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-17',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '12:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── THURSDAY (Start: 2026-06-18)
  {
    id: 'rec-thu-mynt',
    title: 'Wingman @ Mynt',
    description: 'Exclusive house music vibe at Mynt.',
    image: IMG.nightclub1,
    date: '2026-06-18',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 207,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-thu-monaclub',
    title: 'Wingman @ Mona Club',
    description: 'Electronic music nightlife at Mona Club.',
    image: IMG.nightclub2,
    date: '2026-06-18',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 204,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-thu-boobytrap',
    title: 'Wingman @ Booby Trap',
    description: 'Hosted Nightlife at Booby Trap.',
    image: IMG.nightclub3,
    date: '2026-06-18',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 202,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-thu-liv',
    title: 'Wingman @ LIV',
    description: 'Mega-club energy at LIV.',
    image: IMG.nightclub1,
    date: '2026-06-18',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 208,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-thu-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-18',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '3:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── FRIDAY (Start: 2026-06-19)
  {
    id: 'rec-fri-mrjones',
    title: 'Wingman @ Mr. Jones',
    description: 'VIP Hosted Experience at Mr. Jones.',
    image: IMG.nightclub1,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 203,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-coco',
    title: 'Wingman @ Coco',
    description: 'Boutique nightclub VIP experience.',
    image: IMG.nightclub2,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 205,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-liv',
    title: 'Wingman @ LIV',
    description: 'Mega-club energy at LIV.',
    image: IMG.nightclub3,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 208,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-clubspace',
    title: 'Wingman @ Club Space',
    description: 'Legendary Terrace electronic music marathon.',
    image: IMG.nightclub1,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 209,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-mynt',
    title: 'Wingman @ Mynt',
    description: 'Exclusive house music vibe at Mynt.',
    image: IMG.nightclub2,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 207,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-vendome',
    title: 'Wingman @ Vendôme',
    description: 'VIP Hosted Nightlife at Vendôme.',
    image: IMG.nightclub3,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 201,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-electriclady',
    title: 'Wingman @ Electric Lady',
    description: 'Nu-disco and retro grooves at Electric Lady.',
    image: IMG.nightclub1,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 210,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '3:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-dinner-marion',
    title: 'Dinner Experience @ Marion',
    description: 'Upscale social dining and nightlife crossover.',
    image: IMG.dinner1,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 450,
    priceGeneral: 450, // $450 flat — covers up to 2 guests
    capacity: 10,
    venueId: 101,
    arrivalTime: '9:45 PM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-fri-yachtparty',
    title: 'Wingman Yacht Party',
    description: 'Premium hosted yacht cruise in Biscayne Bay.',
    image: IMG.yacht1,
    date: '2026-06-19',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 400,
    priceGeneral: 400,
    capacity: 12,
    venueId: 301,
    arrivalTime: '4:00 PM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── SATURDAY (Start: 2026-06-20)
  {
    id: 'rec-sat-mrjones',
    title: 'Wingman @ Mr. Jones',
    description: 'VIP Hosted Experience at Mr. Jones.',
    image: IMG.nightclub1,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 203,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-coco',
    title: 'Wingman @ Coco',
    description: 'Boutique nightclub VIP experience.',
    image: IMG.nightclub2,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 205,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-liv',
    title: 'Wingman @ LIV',
    description: 'Mega-club energy at LIV.',
    image: IMG.nightclub3,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 208,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-clubspace',
    title: 'Wingman @ Club Space',
    description: 'Legendary Terrace electronic music marathon.',
    image: IMG.nightclub1,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 209,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-mynt',
    title: 'Wingman @ Mynt',
    description: 'Exclusive house music vibe at Mynt.',
    image: IMG.nightclub2,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 207,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-vendome',
    title: 'Wingman @ Vendôme',
    description: 'VIP Hosted Nightlife at Vendôme.',
    image: IMG.nightclub3,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 201,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-electriclady',
    title: 'Wingman @ Electric Lady',
    description: 'Nu-disco and retro grooves at Electric Lady.',
    image: IMG.nightclub1,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 210,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub3,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '3:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-dinner-queen',
    title: 'Dinner Experience @ Queen',
    description: 'Luxury dining experience with elegant ambiance.',
    image: IMG.dinner2,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 450,
    priceGeneral: 450, // $450 flat — covers up to 2 guests
    capacity: 10,
    venueId: 102,
    arrivalTime: '9:45 PM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sat-yachtparty',
    title: 'Wingman Yacht Party',
    description: 'Premium hosted yacht cruise in Biscayne Bay.',
    image: IMG.yacht1,
    date: '2026-06-20',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 400,
    priceGeneral: 400,
    capacity: 12,
    venueId: 301,
    arrivalTime: '4:00 PM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },

  // ── SUNDAY (Start: 2026-06-21)
  {
    id: 'rec-sun-liv',
    title: 'Wingman @ LIV',
    description: 'Mega-club energy at LIV.',
    image: IMG.nightclub1,
    date: '2026-06-21',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 208,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sun-monaclub',
    title: 'Wingman @ Mona Club',
    description: 'Electronic music nightlife at Mona Club.',
    image: IMG.nightclub2,
    date: '2026-06-21',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 204,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sun-boobytrap',
    title: 'Wingman @ Booby Trap',
    description: 'Hosted Nightlife at Booby Trap.',
    image: IMG.nightclub3,
    date: '2026-06-21',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 202,
    arrivalTime: '1:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sun-e11even',
    title: 'Wingman @ E11EVEN',
    description: 'Ultra Club After Hours experience at E11EVEN.',
    image: IMG.nightclub2,
    date: '2026-06-21',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 500,
    priceGeneral: 500,
    capacity: 5,
    venueId: 211,
    arrivalTime: '3:00 AM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  },
  {
    id: 'rec-sun-yachtparty',
    title: 'Wingman Yacht Party',
    description: 'Premium hosted yacht cruise in Biscayne Bay.',
    image: IMG.yacht1,
    date: '2026-06-21',
    type: 'EXCLUSIVE',
    priceFemale: 0,
    priceMale: 400,
    priceGeneral: 400,
    capacity: 12,
    venueId: 301,
    arrivalTime: '4:00 PM',
    recurrence: { frequency: 'weekly', endDate: '2028-06-15' }
  }
];

// ─── HELPERS ─────────────────────────────────────────────────

function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return hours * 100 + minutes;
}

export function computeStatus(
  spotsBooked: number,
  totalCapacity: number,
  cancelled: boolean,
  forceSoldOut: boolean,
): EventInstance['status'] {
  if (cancelled) return 'cancelled';
  if (forceSoldOut || spotsBooked >= totalCapacity) return 'sold-out';
  if (spotsBooked >= totalCapacity * 0.7) return 'limited';
  return 'available';
}

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function daysUntilLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((event.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 6) return `In ${diff} days`;
  return formatEventDate(dateStr);
}

// ─── RECURRING ENGINE GENERATOR ────────────────────────────────

export function generateEventFeed(
  bookedMap: Record<string, number> = {},
  cancelMap: Record<string, boolean> = {},
  weeksAhead: number = 4,
  forceSoldOutMap: Record<string, boolean> = {},
  customArrivalMap: Record<string, string> = {},
  customInstanceMap: Record<string, Partial<EventInstance>> = {},
  eventsListOverride?: Event[],
  includeHidden: boolean = false
): EventInstance[] {
  const isBrowser = typeof window !== 'undefined';
  const finalEvents = eventsListOverride ?? (isBrowser ? JSON.parse(localStorage.getItem('wingman_events') ?? 'null') : null) ?? DEFAULT_EVENTS;
  const finalCancelMap = (isBrowser ? JSON.parse(localStorage.getItem('wingman_cancel_map') ?? 'null') : null) ?? cancelMap;
  const finalForceSoldOutMap = (isBrowser ? JSON.parse(localStorage.getItem('wingman_force_soldout_map') ?? 'null') : null) ?? forceSoldOutMap;
  const finalCustomArrivalMap = (isBrowser ? JSON.parse(localStorage.getItem('wingman_custom_arrival_map') ?? 'null') : null) ?? customArrivalMap;
  const finalCustomInstanceMap = (isBrowser ? JSON.parse(localStorage.getItem('wingman_custom_instances') ?? 'null') : null) ?? customInstanceMap;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endLimit = new Date(today);
  endLimit.setDate(endLimit.getDate() + weeksAhead * 7);

  const instances: EventInstance[] = [];

  for (const event of finalEvents) {
    if (event.isHidden && !includeHidden) continue;
    const dates: string[] = [];
    const startDate = new Date(event.date + 'T00:00:00');

    if (!event.recurrence) {
      // One-time event
      dates.push(event.date);
    } else {
      // Recurring event
      const freq = event.recurrence.frequency;
      const recurEndDate = new Date(event.recurrence.endDate + 'T00:00:00');
      const limitDate = recurEndDate < endLimit ? recurEndDate : endLimit;

      let current = new Date(startDate);
      while (current <= limitDate) {
        dates.push(current.toISOString().slice(0, 10));

        if (freq === 'daily') {
          current.setDate(current.getDate() + 1);
        } else if (freq === 'weekly') {
          current.setDate(current.getDate() + 7);
        } else if (freq === 'monthly') {
          current.setMonth(current.getMonth() + 1);
        } else {
          break;
        }
      }
    }

    // Load venue info
    const storedVenues = isBrowser ? localStorage.getItem('wingman_venues') : null;
    const allVenuesList = storedVenues ? JSON.parse(storedVenues) : venuesMock;
    const venueObj = allVenuesList.find((v: any) => v.id === event.venueId);
    if (venueObj?.isHidden && !includeHidden) continue;
    const venueName = venueObj?.name ?? `Venue #${event.venueId}`;
    const venueAddress = venueObj?.address ?? venueObj?.location ?? '';

    // Map experience type: Dinner, Nightclub, Yacht
    let expType: 'Dinner' | 'Nightclub' | 'Yacht' = 'Nightclub';
    if (venueObj?.category?.toLowerCase().includes('dinner') || venueObj?.category?.toLowerCase().includes('restaurant')) {
      expType = 'Dinner';
    } else if (venueObj?.category?.toLowerCase().includes('yacht')) {
      expType = 'Yacht';
    }

    // Price
    // Official pricing: Nightclub $500/person, Dinner $450 flat (≤2 guests), Yacht $400/person
    const pricePerPerson = event.priceGeneral ?? event.priceMale ?? 500;

    for (const dateStr of dates) {
      const instanceId = `${event.id}-${dateStr}`;
      
      // Look up overrides for this specific occurrence
      const overrides = finalCustomInstanceMap[instanceId] || {};
      const cancelled = !!finalCancelMap[instanceId];
      const forceSoldOut = !!finalForceSoldOutMap[instanceId];
      const spotsBooked = bookedMap[instanceId] ?? 0;
      
      const defaultArrival = event.arrivalTime || (expType === 'Dinner' ? '9:45 PM' : expType === 'Yacht' ? '4:00 PM' : '1:00 AM');
      const arrivalTime = overrides.arrivalTime || finalCustomArrivalMap[instanceId] || defaultArrival;

      instances.push({
        instanceId,
        scheduleId: String(event.id),
        title: overrides.title || event.title,
        venue: overrides.venue || venueName,
        address: overrides.address || venueAddress,
        experienceType: overrides.experienceType || expType,
        date: dateStr,
        time: overrides.time || event.time || (expType === 'Dinner' ? '9:45 PM' : expType === 'Yacht' ? '4:00 PM' : '1:00 AM'),
        arrivalTime,
        pricePerPerson: overrides.pricePerPerson ?? pricePerPerson,
        totalCapacity: overrides.totalCapacity ?? event.capacity ?? (expType === 'Dinner' ? 10 : expType === 'Yacht' ? 12 : 5),
        spotsBooked,
        bookingRules: { maxPerBooking: expType === 'Dinner' ? 2 : undefined },
        coverImage: overrides.coverImage || event.image,
        status: overrides.status || computeStatus(spotsBooked, overrides.totalCapacity ?? event.capacity ?? (expType === 'Dinner' ? 10 : expType === 'Yacht' ? 12 : 5), cancelled, forceSoldOut),
        isCancelledByAdmin: cancelled,
        wingmanId: overrides.wingmanId ?? event.wingmanId,
        hostId: overrides.hostId ?? event.hostId,
      });
    }
  }

  // Sort
  instances.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const timeA = parseTime(a.arrivalTime || a.time);
    const timeB = parseTime(b.arrivalTime || b.time);
    return timeA - timeB;
  });

  return instances;
}

export const WEEKLY_SCHEDULE: WeeklyScheduleEntry[] = DEFAULT_EVENTS.map(event => {
  const startDate = new Date(event.date + 'T00:00:00');
  const dayOfWeek = startDate.getDay() as 0|1|2|3|4|5|6;
  const venueObj = venuesMock.find((v: any) => v.id === event.venueId);
  const venueName = venueObj?.name ?? `Venue #${event.venueId}`;
  const venueAddress = venueObj?.address ?? venueObj?.location ?? '';
  let expType: 'Dinner' | 'Nightclub' | 'Yacht' = 'Nightclub';
  if (venueObj?.category?.toLowerCase().includes('dinner') || venueObj?.category?.toLowerCase().includes('restaurant')) {
    expType = 'Dinner';
  } else if (venueObj?.category?.toLowerCase().includes('yacht')) {
    expType = 'Yacht';
  }
  const pricePerPerson = event.priceGeneral ?? event.priceMale ?? 500; // Official: Nightclub $500, Dinner $450 flat, Yacht $400
  return {
    id: String(event.id),
    dayOfWeek,
    experienceType: expType,
    title: event.title,
    venue: venueName,
    address: venueAddress,
    time: event.arrivalTime || (expType === 'Dinner' ? '9:45 PM' : expType === 'Yacht' ? '4:00 PM' : '1:00 AM'),
    arrivalTime: event.arrivalTime,
    pricePerPerson,
    totalCapacity: event.capacity ?? (expType === 'Dinner' ? 10 : expType === 'Yacht' ? 12 : 5),
    bookingRules: { maxPerBooking: expType === 'Dinner' ? 2 : undefined },
    coverImage: event.image,
    isActive: true,
  };
});
