
/**
 * eventSchedule.ts
 * ─────────────────────────────────────────────────────────────
 * Master weekly schedule + instance generator for the Wingman
 * recurring event system.
 *
 * Rules:
 *   Nightclub  – 5 seats, min 2 men per booking, $500/person
 *   Dinner     – 10 seats (5 tables of 2), max 2/booking, $400/person
 *   Yacht      – Fri–Sun only, 3:00 PM, $350/person
 */

import { WeeklyScheduleEntry, EventInstance } from '../types';

// ─── IMAGE POOL ──────────────────────────────────────────────
const IMG = {
  nightclub1: 'https://images.unsplash.com/photo-1571265209853-8cf0b7a2c39b?w=800&q=80',
  nightclub2: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  nightclub3: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  dinner1:    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  dinner2:    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
  dinner3:    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  yacht1:     'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
  yacht2:     'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=800&q=80',
};

// ─── MASTER WEEKLY SCHEDULE ───────────────────────────────────
// dayOfWeek: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
export const WEEKLY_SCHEDULE: WeeklyScheduleEntry[] = [
  // ── MONDAY ── Dinner
  {
    id: 'mon-dinner-nobu',
    dayOfWeek: 1,
    experienceType: 'Dinner',
    title: 'Wingman Dinner @ Nobu',
    venue: 'Nobu Miami Beach',
    address: '4525 Collins Ave, Miami Beach',
    time: '8:00 PM',
    pricePerPerson: 400,
    totalCapacity: 10,
    bookingRules: { maxPerBooking: 2 },
    coverImage: IMG.dinner1,
    isActive: true,
  },

  // ── TUESDAY ── Nightclub
  {
    id: 'tue-nightclub-mr-jones',
    dayOfWeek: 2,
    experienceType: 'Nightclub',
    title: 'Wingman @ Mr. Jones',
    venue: 'Mr. Jones Miami',
    address: '151 NE 41st St, Miami',
    time: '11:00 PM',
    pricePerPerson: 500,
    totalCapacity: 5,
    bookingRules: { minMenPerBooking: 2 },
    coverImage: IMG.nightclub1,
    isActive: true,
  },

  // ── WEDNESDAY ── Dinner
  {
    id: 'wed-dinner-sexy-fish',
    dayOfWeek: 3,
    experienceType: 'Dinner',
    title: 'Wingman Dinner @ Sexy Fish',
    venue: 'Sexy Fish Miami',
    address: '1701 Collins Ave, Miami Beach',
    time: '9:00 PM',
    pricePerPerson: 400,
    totalCapacity: 10,
    bookingRules: { maxPerBooking: 2 },
    coverImage: IMG.dinner2,
    isActive: true,
  },

  // ── THURSDAY ── Nightclub
  {
    id: 'thu-nightclub-liv',
    dayOfWeek: 4,
    experienceType: 'Nightclub',
    title: 'Wingman @ LIV',
    venue: 'LIV Miami',
    address: '4441 Collins Ave, Miami Beach',
    time: '11:00 PM',
    pricePerPerson: 500,
    totalCapacity: 5,
    bookingRules: { minMenPerBooking: 2 },
    coverImage: IMG.nightclub2,
    isActive: true,
  },

  // ── FRIDAY ── Nightclub + Yacht
  {
    id: 'fri-nightclub-e11even',
    dayOfWeek: 5,
    experienceType: 'Nightclub',
    title: 'Wingman @ E11EVEN',
    venue: 'E11EVEN Miami',
    address: '29 NE 11th St, Miami',
    time: '10:00 PM',
    pricePerPerson: 500,
    totalCapacity: 5,
    bookingRules: { minMenPerBooking: 2 },
    coverImage: IMG.nightclub3,
    isActive: true,
  },
  {
    id: 'fri-yacht-biscayne',
    dayOfWeek: 5,
    experienceType: 'Yacht',
    title: 'Friday Yacht — Biscayne Bay',
    venue: 'Island Queen Cruises Dock',
    address: 'Bayside Marketplace, Miami',
    time: '3:00 PM',
    pricePerPerson: 350,
    totalCapacity: 12,
    bookingRules: {},
    coverImage: IMG.yacht1,
    isActive: true,
  },

  // ── SATURDAY ── Nightclub + Yacht
  {
    id: 'sat-nightclub-story',
    dayOfWeek: 6,
    experienceType: 'Nightclub',
    title: 'Wingman @ Story',
    venue: 'Story Miami',
    address: '136 Collins Ave, Miami Beach',
    time: '11:00 PM',
    pricePerPerson: 500,
    totalCapacity: 5,
    bookingRules: { minMenPerBooking: 2 },
    coverImage: IMG.nightclub1,
    isActive: true,
  },
  {
    id: 'sat-yacht-miami-beach',
    dayOfWeek: 6,
    experienceType: 'Yacht',
    title: 'Saturday Yacht — Miami Beach',
    venue: 'Miami Beach Marina',
    address: '300 Alton Rd, Miami Beach',
    time: '3:00 PM',
    pricePerPerson: 350,
    totalCapacity: 12,
    bookingRules: {},
    coverImage: IMG.yacht2,
    isActive: true,
  },

  // ── SUNDAY ── Dinner + Yacht
  {
    id: 'sun-dinner-komodo',
    dayOfWeek: 0,
    experienceType: 'Dinner',
    title: 'Sunday Dinner @ Komodo',
    venue: 'Komodo Miami',
    address: '801 Brickell Ave, Miami',
    time: '8:00 PM',
    pricePerPerson: 400,
    totalCapacity: 10,
    bookingRules: { maxPerBooking: 2 },
    coverImage: IMG.dinner3,
    isActive: true,
  },
  {
    id: 'sun-yacht-key-biscayne',
    dayOfWeek: 0,
    experienceType: 'Yacht',
    title: 'Sunday Yacht — Key Biscayne',
    venue: 'Crandon Marina',
    address: '4000 Crandon Blvd, Key Biscayne',
    time: '3:00 PM',
    pricePerPerson: 350,
    totalCapacity: 12,
    bookingRules: {},
    coverImage: IMG.yacht1,
    isActive: true,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────

/** Returns 'YYYY-MM-DD' for the next occurrence of dayOfWeek at/after baseDate */
function nextOccurrenceFrom(baseDate: Date, dayOfWeek: number): Date {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Derive status from spotsBooked vs totalCapacity */
export function computeStatus(
  spotsBooked: number,
  totalCapacity: number,
  cancelled: boolean,
): EventInstance['status'] {
  if (cancelled) return 'cancelled';
  if (spotsBooked >= totalCapacity) return 'sold-out';
  if (spotsBooked >= totalCapacity * 0.7) return 'limited';
  return 'available';
}

// ─── GENERATOR ───────────────────────────────────────────────

/**
 * generateEventFeed
 *
 * Produces EventInstance[] for every active WeeklyScheduleEntry,
 * from today through `weeksAhead` weeks in the future.
 *
 * Instances start from todayʼs date (inclusive) — if todayʼs
 * event time has already passed, it is still included (Wingman
 * may still accept people).
 *
 * @param bookedMap   { [instanceId]: spotsBooked } — live override
 * @param cancelMap   { [instanceId]: true }        — cancelled instances
 * @param weeksAhead  how many full weeks to generate (default 4)
 */
export function generateEventFeed(
  bookedMap: Record<string, number> = {},
  cancelMap: Record<string, boolean> = {},
  weeksAhead = 4,
): EventInstance[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const instances: EventInstance[] = [];

  for (const entry of WEEKLY_SCHEDULE) {
    if (!entry.isActive) continue;

    // Find the first occurrence at/after today
    const first = nextOccurrenceFrom(today, entry.dayOfWeek);

    for (let w = 0; w <= weeksAhead; w++) {
      const d = new Date(first);
      d.setDate(d.getDate() + w * 7);

      const dateStr = toYMD(d);
      const instanceId = `${entry.id}-${dateStr}`;
      const spotsBooked = bookedMap[instanceId] ?? 0;
      const cancelled = cancelMap[instanceId] ?? false;

      instances.push({
        instanceId,
        scheduleId: entry.id,
        title: entry.title,
        venue: entry.venue,
        address: entry.address,
        experienceType: entry.experienceType,
        date: dateStr,
        time: entry.time,
        pricePerPerson: entry.pricePerPerson,
        totalCapacity: entry.totalCapacity,
        spotsBooked,
        bookingRules: entry.bookingRules,
        coverImage: entry.coverImage,
        status: computeStatus(spotsBooked, entry.totalCapacity, cancelled),
        isCancelledByAdmin: cancelled,
      });
    }
  }

  // Sort: soonest first, then by time
  instances.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return instances;
}

/** Format date for display: "Tue, Apr 22" */
export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Days until event: "Today" | "Tomorrow" | "in 3 days" | "Apr 22" */
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
