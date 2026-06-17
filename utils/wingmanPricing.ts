
// ─── Official Wingman Experience Pricing ─────────────────────────────────────
// This is the SINGLE CLIENT-SIDE SOURCE OF TRUTH for pricing.
// Keep in sync with netlify/functions/create-checkout.ts server-side pricing.
// ─────────────────────────────────────────────────────────────────────────────

export type WingmanExperienceType = 'restaurant' | 'nightclub' | 'yacht';

export const WINGMAN_PRICES = {
  /** $450 flat for up to 2 guests, then $450 per additional 2-person block */
  restaurantBlockPrice: 450,
  restaurantBlockSize: 2,
  /** $500 per person */
  nightclubPerPerson: 500,
  /** $400 per person */
  yachtPerPerson: 400,
} as const;

/**
 * Venue categories that map to each experience type.
 */
const RESTAURANT_CATEGORIES = [
  'restaurant',
  'luxury restaurant',
  'waterfront restaurant',
];
const NIGHTCLUB_CATEGORIES = [
  'nightclub',
  'after hours nightclub',
  'lounge',
];
const YACHT_CATEGORIES = [
  'yacht experience',
  'beach club',
  'pool party',
];

/**
 * Derive the Wingman experience type from a venue category string.
 * Returns null if the category doesn't match a known pricing type.
 */
export function getExperienceTypeFromCategory(
  category: string | undefined | null
): WingmanExperienceType | null {
  if (!category) return null;
  const cat = category.toLowerCase();
  if (RESTAURANT_CATEGORIES.some(c => cat.includes(c))) return 'restaurant';
  if (NIGHTCLUB_CATEGORIES.some(c => cat === c)) return 'nightclub';
  if (YACHT_CATEGORIES.some(c => cat.includes(c))) return 'yacht';
  return null;
}

/**
 * Calculate the total Wingman experience price.
 *
 * @param type  - 'restaurant' | 'nightclub' | 'yacht'
 * @param guestCount - total number of guests (minimum 1)
 * @returns total price in USD
 */
export function calculateWingmanPrice(
  type: WingmanExperienceType,
  guestCount: number
): number {
  const guests = Math.max(1, guestCount);
  switch (type) {
    case 'restaurant':
      return Math.ceil(guests / WINGMAN_PRICES.restaurantBlockSize) * WINGMAN_PRICES.restaurantBlockPrice;
    case 'nightclub':
      return guests * WINGMAN_PRICES.nightclubPerPerson;
    case 'yacht':
      return guests * WINGMAN_PRICES.yachtPerPerson;
  }
}

/**
 * Get a human-readable price label for display in the modal / cart.
 */
export function getPriceLabel(type: WingmanExperienceType): string {
  switch (type) {
    case 'restaurant': return '$450 / up to 2 people';
    case 'nightclub':  return '$500 per person';
    case 'yacht':      return '$400 per person';
  }
}

/**
 * Get the per-unit price for display.
 */
export function getUnitPrice(type: WingmanExperienceType): number {
  switch (type) {
    case 'restaurant': return WINGMAN_PRICES.restaurantBlockPrice;
    case 'nightclub':  return WINGMAN_PRICES.nightclubPerPerson;
    case 'yacht':      return WINGMAN_PRICES.yachtPerPerson;
  }
}

/**
 * Build a breakdown string for the confirmation summary.
 * e.g. "2 blocks × $450" or "3 guests × $500"
 */
export function getPriceBreakdown(type: WingmanExperienceType, guestCount: number): string {
  const guests = Math.max(1, guestCount);
  switch (type) {
    case 'restaurant': {
      const blocks = Math.ceil(guests / WINGMAN_PRICES.restaurantBlockSize);
      return `${blocks} block${blocks !== 1 ? 's' : ''} × $${WINGMAN_PRICES.restaurantBlockPrice.toLocaleString()}`;
    }
    case 'nightclub':
      return `${guests} guest${guests !== 1 ? 's' : ''} × $${WINGMAN_PRICES.nightclubPerPerson.toLocaleString()}`;
    case 'yacht':
      return `${guests} guest${guests !== 1 ? 's' : ''} × $${WINGMAN_PRICES.yachtPerPerson.toLocaleString()}`;
  }
}
