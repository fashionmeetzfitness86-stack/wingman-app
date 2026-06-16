
import React, { useMemo, useState, useEffect } from 'react';
import { CartItem, EventInstance, Venue, User, Page } from '../types';
import { CartItemCard } from './CartItemCard';
import { ReserveSpotModal } from './ReserveSpotModal';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { CartIcon } from './icons/CartIcon';
import { BookingsIcon } from './icons/BookingsIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface CheckoutPageProps {
  currentUser: User;
  watchlist: CartItem[];
  cartItems?: CartItem[];
  bookedItems: CartItem[];
  venues: Venue[];
  onRemoveItem: (itemId: string) => void;
  onUpdatePaymentOption: (itemId: string, option: 'deposit' | 'full') => void;
  onConfirmCheckout: (paymentMethod: 'tokens' | 'usd' | 'cashapp', itemIds: string[]) => void;
  onMoveToCart: (item: CartItem) => void;
  onViewReceipt: (item: CartItem) => void;
  userTokenBalance: number;
  onStartChat: (item: CartItem) => void;
  onCancelRsvp: (item: CartItem) => void;
  initialTab?: 'cart' | 'watchlist' | 'purchased';
  onNavigate: (page: Page) => void;
  /** All live EventInstances — used to resolve instanceId on watchlist cards */
  allInstances?: EventInstance[];
  currentUserCanBook?: boolean;
  isCheckoutLoading?: boolean;
}


const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{subtitle}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  currentUser, watchlist, cartItems = [], bookedItems, venues,
  onRemoveItem, onUpdatePaymentOption, onConfirmCheckout, onMoveToCart,
  onViewReceipt, userTokenBalance, onStartChat, onCancelRsvp,
  initialTab = 'cart', onNavigate, allInstances = [], currentUserCanBook = true,
  isCheckoutLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'watchlist' | 'purchased'>(initialTab);
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'cashapp'>('usd');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<EventInstance | null>(null);
  const [agreedToDisclosure, setAgreedToDisclosure] = useState<Record<string, boolean>>({});
  const [disclosureExpanded, setDisclosureExpanded] = useState(false);

  // ── Disclosure gate (legal) ───────────────────────────────────────────────
  // All seven acknowledgements are REQUIRED before checkout. We check explicit
  // keys — NOT Object.values(...).every(Boolean), which returns true for an
  // empty {} and would let users pay without agreeing to anything.
  const REQUIRED_DISCLOSURE_KEYS = ['chk1', 'chk2', 'chk3', 'chk4', 'chk5', 'chk6', 'chk7'];
  const allDisclosuresAgreed = REQUIRED_DISCLOSURE_KEYS.every(
    key => agreedToDisclosure[key] === true
  );
  const disclosuresCheckedCount = REQUIRED_DISCLOSURE_KEYS.filter(
    key => agreedToDisclosure[key] === true
  ).length;

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'cart') {
      setSelectedItemIds(cartItems.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  }, [activeTab, cartItems]);

  const watchlistItems = useMemo(() =>
    [...watchlist].sort((a, b) => new Date(a.sortableDate || 0).getTime() - new Date(b.sortableDate || 0).getTime()),
  [watchlist]);

  const sortedBookedItems = useMemo(() =>
    [...bookedItems].sort((a, b) => (b.bookedTimestamp || 0) - (a.bookedTimestamp || 0)),
  [bookedItems]);

  const selectedItems = useMemo(() => cartItems.filter(item => selectedItemIds.includes(item.id)), [cartItems, selectedItemIds]);

  const totalCostUSD = useMemo(() =>
    selectedItems.reduce((total, item) => {
      const price = item.paymentOption === 'full' ? item.fullPrice ?? 0 : item.depositPrice ?? 0;
      return total + price;
    }, 0),
  [selectedItems]);


  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const TABS = [
    { key: 'cart' as const, label: 'Cart', count: cartItems.length, color: '#FFFFFF' },
    { key: 'watchlist' as const, label: 'Watchlist', count: watchlistItems.length, color: '#9CA3AF' },
    { key: 'purchased' as const, label: 'Purchased', count: sortedBookedItems.length, color: '#22C55E' },
  ];

  return (
    <div className="animate-fade-in text-white min-h-screen">
      {/* ── Page Header ── */}
      <div className="px-4 md:px-8 pt-6 pb-0 max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-0.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            My{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Plans</span>
          </h1>
          <p className="text-xs text-gray-600">Manage your reservations &amp; purchases</p>
        </div>

        {/* Tab Bar */}
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              id={`plans-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                activeTab === tab.key
                  ? { background: 'linear-gradient(135deg, rgba(224,64,251,0.18), rgba(123,97,255,0.18), rgba(0,212,255,0.10))', color: '#fff', boxShadow: 'inset 0 0 0 1px rgba(224,64,251,0.2)' }
                  : { color: '#4B5563' }
              }
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className="text-[9px] font-black rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: activeTab === tab.key
                      ? 'linear-gradient(135deg, #E040FB, #7B61FF)'
                      : 'rgba(255,255,255,0.07)',
                    color: activeTab === tab.key ? '#fff' : '#6B7280',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pt-6 pb-36 max-w-7xl mx-auto">

        {/* ── CART TAB ── */}
        {activeTab === 'cart' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left: Items List */}
            <div className="flex-1 min-w-0">
              {cartItems.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-gray-500">
                      <span className="text-white font-black">{cartItems.length}</span>
                      <span className="ml-1">item{cartItems.length !== 1 ? 's' : ''} in cart</span>
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedItemIds(cartItems.map(i => i.id))}
                        className="text-[11px] font-bold transition-colors"
                        style={{ color: '#7B61FF' }}
                      >Select All</button>
                      <button
                        onClick={() => setSelectedItemIds([])}
                        className="text-[11px] font-bold text-gray-600 hover:text-gray-400 transition-colors"
                      >Clear</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        venues={venues}
                        onRemove={onRemoveItem}
                        onUpdatePaymentOption={onUpdatePaymentOption}
                        onMoveToCart={onMoveToCart}
                        isSelected={selectedItemIds.includes(item.id)}
                        onToggleSelection={handleToggleItemSelection}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<CartIcon className="w-9 h-9 text-gray-600" />}
                  title="Your Cart is Empty"
                  subtitle="Reserve an event or experience to get started. They'll appear here ready for checkout."
                  action={
                    <button
                      onClick={() => onNavigate('eventTimeline')}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF)' }}
                    >
                      Browse Events
                    </button>
                  }
                />
              )}
            </div>

            {/* Right: Sticky Order Summary (only on desktop when items exist) */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-6 space-y-4">

                {/* Payment Method */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h2 className="text-base font-bold text-white mb-4">Payment Method</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod('usd')}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3"
                      style={paymentMethod === 'usd'
                        ? { background: 'rgba(255,255,255,0.1)', borderColor: '#FFFFFF' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                    >
                      <CreditCardIcon className="w-5 h-5 flex-shrink-0 text-gray-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Card</p>
                        <p className="text-xs text-gray-500">Visa ···· 4567</p>
                      </div>
                      <span className="text-sm font-bold text-white">${totalCostUSD.toFixed(2)}</span>
                    </button>

                    {/* Cash App */}
                    <button
                      onClick={() => setPaymentMethod('cashapp')}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3"
                      style={paymentMethod === 'cashapp'
                        ? { background: 'rgba(255,255,255,0.1)', borderColor: '#FFFFFF' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <CurrencyDollarIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Cash App</p>
                        <p className="text-xs text-gray-500">Pay with balance</p>
                      </div>
                      <span className="text-sm font-bold text-white">${totalCostUSD.toFixed(2)}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('paymentMethods')}
                    className="w-full mt-3 text-center text-xs font-semibold hover:underline transition-colors"
                    style={{ color: '#374151' }}
                  >
                    + Add a new card
                  </button>
                </div>

                {/* Order Summary */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h2 className="text-base font-bold text-white mb-4">Order Summary</h2>
                  <div className="space-y-2 text-sm mb-4">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <p className="text-gray-400 truncate pr-3 flex-1">{item.name}</p>
                        <p className="text-white font-semibold flex-shrink-0">
                          ${(item.paymentOption === 'full' ? item.fullPrice : item.depositPrice)?.toLocaleString() ?? '0'}
                        </p>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <p className="text-gray-600 text-xs">No items selected.</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                    <p className="font-bold text-white">Total</p>
                    <p className="text-xl font-black text-white">${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
              
                  {/* ── Experience Disclosure & Participation Agreement ── */}
                  <div
                    className="rounded-xl overflow-hidden mt-4"
                    style={{ border: '1px solid rgba(184,155,77,0.3)', background: 'rgba(184,155,77,0.04)' }}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setDisclosureExpanded(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#B89B4D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div>
                          <p className="text-[11px] font-black text-white">Experience Disclosure & Agreement</p>
                          <p className="text-[9px] font-semibold mt-0.5" style={{ color: '#B89B4D' }}>⚠ Required — read before payment</p>
                        </div>
                      </div>
                      <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform flex-shrink-0 ${disclosureExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" /></svg>
                    </button>

                    {/* Full agreement text */}
                    {disclosureExpanded && (
                      <div
                        className="px-4 pb-4 space-y-4 text-[11px] leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(184,155,77,0.15)' }}
                      >
                        <p className="pt-3 font-black text-white/80 text-[10px] uppercase tracking-widest text-center">
                          WINGMAN EXPERIENCE DISCLOSURE &amp; PARTICIPATION AGREEMENT
                        </p>
                        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          IMPORTANT: PLEASE READ CAREFULLY BEFORE COMPLETING YOUR PURCHASE.
                        </p>

                        {[
                          {
                            title: '1. EXPERIENCE PURCHASE',
                            body: 'Wingman provides hosted lifestyle, nightlife, hospitality, yacht, dining, entertainment, and social experiences. Your purchase grants you access to participate in a Wingman-hosted experience alongside a designated Wingman host and other approved guests.',
                            notList: ['A VIP table', 'A nightclub table reservation', 'A yacht charter', 'A restaurant reservation', 'Ownership or exclusive control of any venue space', 'Alcohol or beverage packages', 'Transportation services', 'Escort, companionship, dating, or matchmaking services'],
                            notLabel: 'You are NOT purchasing:',
                            footer: 'All experiences remain under the management and coordination of the assigned Wingman host.',
                          },
                          {
                            title: '2. WINGMAN HOSTED TABLES',
                            body: 'For nightlife experiences, participants join a hosted Wingman VIP table experience. The VIP table remains under the control and management of the assigned Wingman host at all times. Guests are purchasing access to the hosted experience and social environment, not ownership, control, or exclusivity of the table. The assigned Wingman host determines table logistics, guest flow, seating arrangements, and operational decisions in coordination with the venue.',
                          },
                          {
                            title: '3. BEVERAGE & HOSPITALITY SERVICES',
                            body: 'Certain experiences may include beverages, hospitality amenities, or hosted services. Any beverages or hospitality offerings provided during an experience are determined by the Wingman host and may vary based on number of participants, venue policies, event type, capacity limitations, and operational considerations. Wingman does not guarantee specific brands, bottle quantities, beverage selections, seating positions, or hospitality inclusions unless explicitly stated in the experience description.',
                          },
                          {
                            title: '3A. ALCOHOL & BOTTLE SERVICE POLICY',
                            body: 'YOUR PAYMENT DOES NOT INCLUDE THE PURCHASE OF BOTTLES, BOTTLE SERVICE, PREMIUM LIQUOR PACKAGES, OR GUARANTEED DRINK QUANTITIES. If you or your guests wish to order additional bottles, premium spirits, food, cocktails, champagne, or any other items beyond what is being offered by the Wingman host, those purchases are entirely optional and must be paid directly by you at your own expense at the venue. The Wingman platform is not responsible for optional purchases you choose to make at the venue.',
                          },
                          {
                            title: '4. SOCIAL INTRODUCTIONS',
                            body: 'Wingman hosts may facilitate social introductions and networking opportunities during experiences.',
                            notList: ['Specific individuals will attend', 'Social outcomes', 'Business opportunities', 'Personal relationships', 'Dating outcomes', 'Introductions to any specific guest'],
                            notLabel: 'Wingman does not guarantee:',
                            footer: 'All social interactions remain voluntary and subject to venue rules and participant conduct.',
                          },
                          {
                            title: '5. EXPERIENCE AVAILABILITY',
                            body: 'All experiences are subject to venue capacity, weather conditions, venue policies, government regulations, safety requirements, and operational changes. Wingman reserves the right to modify, substitute, reschedule, relocate, or cancel an experience when necessary.',
                          },
                          {
                            title: '6. REFUND POLICY',
                            body: 'All bookings are final. No refunds are provided for missed arrivals, late arrivals, personal scheduling conflicts, changes of preference, or failure to attend. If an experience becomes unavailable due to circumstances within Wingman\'s control, Wingman may reschedule the experience, transfer the booking, issue account credit, or issue a refund at its sole discretion.',
                          },
                          {
                            title: '7. USER CONDUCT',
                            body: 'Wingman reserves the right to remove, deny entry to, suspend, or permanently ban participants who engage in illegal conduct, harassment, violence, excessive intoxication, disruptive behavior, unsafe conduct, or violations of venue policies. No refund will be provided in these circumstances.',
                          },
                          {
                            title: '8. LIABILITY',
                            body: 'Participation in all experiences is voluntary. Participants assume responsibility for their own decisions, transportation, purchases, conduct, health, safety, and interactions during any Wingman experience.',
                          },
                        ].map(section => (
                          <div key={section.title} className="space-y-1.5">
                            <p className="font-black text-white/80">{section.title}</p>
                            <p>{section.body}</p>
                            {section.notLabel && section.notList && (
                              <>
                                <p className="font-semibold text-white/60">{section.notLabel}</p>
                                <ul className="space-y-0.5 pl-2">
                                  {section.notList.map(item => <li key={item}>• {item}</li>)}
                                </ul>
                              </>
                            )}
                            {section.footer && <p>{section.footer}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Six required checkboxes ─────────────────────────────── */}
                    <div
                      className="space-y-0 divide-y"
                      style={{ borderTop: '1px solid rgba(184,155,77,0.15)' }}
                    >
                      {[
                        { id: 'chk-1', key: 'chk1', label: 'I understand that I am purchasing access to a hosted Wingman Experience.' },
                        { id: 'chk-2', key: 'chk2', label: 'I understand that I am not purchasing ownership or exclusive control of a VIP table, yacht, restaurant reservation, or venue space.' },
                        { id: 'chk-3', key: 'chk3', label: 'I understand that all experiences are managed by the assigned Wingman host.' },
                        { id: 'chk-4', key: 'chk4', label: 'I understand that hospitality offerings may vary based on the event and participation levels.' },
                        { id: 'chk-5', key: 'chk5', label: 'I understand that my payment does NOT include bottles, bottle service, additional drinks, food, or any extra venue purchases — those are my personal responsibility.' },
                        { id: 'chk-6', key: 'chk6', label: 'I agree to the Wingman Terms & Conditions and Refund Policy.' },
                        { id: 'chk-7', key: 'chk7', label: 'I voluntarily choose to participate in this experience.' },
                      ].map(({ id, key, label }) => {
                        const checked = (agreedToDisclosure as any)[key] ?? false;
                        return (
                          <label
                            key={id}
                            htmlFor={`${id}-desktop`}
                            className="flex items-start gap-3 px-4 py-2.5 cursor-pointer"
                            style={{ background: checked ? 'rgba(184,155,77,0.04)' : 'transparent' }}
                          >
                            <div className="relative flex-shrink-0 mt-0.5">
                              <input
                                type="checkbox"
                                id={`${id}-desktop`}
                                checked={checked}
                                onChange={e => setAgreedToDisclosure((prev: any) => ({ ...prev, [key]: e.target.checked }))}
                                className="sr-only"
                              />
                              <div
                                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                                style={checked
                                  ? { background: '#B89B4D', border: '2px solid #B89B4D' }
                                  : { background: 'transparent', border: '2px solid rgba(255,255,255,0.2)' }
                                }
                              >
                                {checked && (
                                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] leading-relaxed" style={{ color: checked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                              {label}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Short-form blurb above pay button */}
                  <p className="mt-4 text-[9px] leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    By proceeding, you acknowledge that you are purchasing access to a hosted Wingman Experience.
                    You are not purchasing ownership or exclusive control of a VIP table, yacht charter, restaurant
                    reservation, or venue space. All experiences are managed by the assigned Wingman host and are
                    subject to venue policies, availability, and operational conditions.
                  </p>

                  <button
                    onClick={() => onConfirmCheckout(paymentMethod, selectedItemIds)}
                    disabled={selectedItemIds.length === 0 || !allDisclosuresAgreed || isCheckoutLoading}
                    className="mt-3 w-full text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                      background: allDisclosuresAgreed && selectedItemIds.length > 0
                        ? 'linear-gradient(135deg, #E040FB, #7B61FF, #00D4FF)'
                        : 'rgba(255,255,255,0.07)',
                      boxShadow: allDisclosuresAgreed && selectedItemIds.length > 0
                        ? '0 8px 28px rgba(224,64,251,0.35)'
                        : 'none',
                    }}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    {isCheckoutLoading
                      ? 'Processing…'
                      : `Confirm & Pay${selectedItemIds.length > 0 ? ` · $${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WATCHLIST TAB ── */}
        {activeTab === 'watchlist' && (
          watchlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {watchlistItems.map(item => {
                // Resolve full EventInstance if we have the instanceId
                const instId = (item as CartItem & { instanceId?: string }).instanceId;
                const resolvedInstance = instId ? allInstances.find(i => i.instanceId === instId) ?? null : null;
                return (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer"
                    onClick={() => resolvedInstance && setSelectedInstance(resolvedInstance)}
                  >
                    {/* Clickable overlay hint */}
                    {resolvedInstance && (
                      <div
                        className="absolute top-3 right-10 z-10 text-[10px] font-bold text-white/70 px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                      >
                        Tap to Reserve
                      </div>
                    )}
                    <CartItemCard
                      item={item}
                      venues={venues}
                      onRemove={onRemoveItem}
                      onUpdatePaymentOption={onUpdatePaymentOption}
                      onMoveToCart={onMoveToCart}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<CartIcon className="w-9 h-9 text-gray-600" />}
              title="Watchlist is Empty"
              subtitle="Bookmark events you're interested in — they'll appear here so you can decide later."
              action={
                <button
                  onClick={() => onNavigate('eventTimeline')}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #9CA3AF, #374151)' }}
                >
                  Browse Events
                </button>
              }
            />
          )
        )}

        {/* ── PURCHASED TAB ── */}
        {activeTab === 'purchased' && (
          sortedBookedItems.length > 0 ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Summary strip */}
              <div
                className="flex items-center justify-between rounded-2xl px-5 py-4"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-0.5">Confirmed Bookings</p>
                  <p className="text-2xl font-black text-white">{sortedBookedItems.length} Experience{sortedBookedItems.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Total Spent</p>
                  <p className="text-2xl font-black text-white">
                    ${sortedBookedItems.reduce((s, i) => s + (i.fullPrice || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Receipt cards */}
              {sortedBookedItems.map((item, idx) => {
                const bookingId = item.id.split('-').slice(-2).join('').toUpperCase().slice(0, 8);
                const bookedDate = item.bookedTimestamp
                  ? new Date(item.bookedTimestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—';
                const eventDate = item.date
                  ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : '—';
                const amount = item.fullPrice || 0;
                const isFree = amount === 0;
                const partySize = item.quantity || 1;
                const guestName = (item as any).guestDetails?.name || currentUser.name || '—';
                const eventType = item.type.replace(/([A-Z])/g, ' $1').trim();

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {/* Card Header — event image + name */}
                    <div className="relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-full h-32 flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}
                        >
                          <span className="text-4xl">⚓</span>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,19,1) 0%, rgba(17,17,19,0.4) 60%, transparent 100%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="text-lg font-black text-white leading-tight">{item.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{eventDate}</p>
                          </div>
                          <span
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{
                              background: isFree ? 'rgba(34,197,94,0.15)' : 'rgba(184,155,77,0.15)',
                              color: isFree ? '#22C55E' : '#B89B4D',
                              border: `1px solid ${isFree ? 'rgba(34,197,94,0.3)' : 'rgba(184,155,77,0.3)'}`,
                            }}
                          >
                            {isFree ? 'Complimentary' : 'Paid'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Receipt body */}
                    <div className="p-5 space-y-4">
                      {/* Status banner */}
                      <div
                        className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-green-400">Booking Confirmed</p>
                          <p className="text-[10px] text-gray-500">Confirmed on {bookedDate}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Booking ID</p>
                          <p className="text-xs font-black text-white font-mono">#{bookingId}</p>
                        </div>
                      </div>

                      {/* Detail rows */}
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {[
                          { label: 'Guest Name', value: guestName },
                          { label: 'Party Size', value: `${partySize} guest${partySize > 1 ? 's' : ''}` },
                          { label: 'Experience Type', value: eventType.charAt(0).toUpperCase() + eventType.slice(1) },
                          { label: 'Payment Method', value: isFree ? 'Complimentary' : 'Credit / Debit Card' },
                          { label: 'Amount Paid', value: isFree ? 'FREE' : `$${amount.toFixed(2)}`, highlight: true },
                        ].map(({ label, value, highlight }, i) => (
                          <div
                            key={label}
                            className="flex justify-between items-center px-4 py-3"
                            style={{
                              background: i % 2 === 0 ? '#141416' : '#111113',
                              borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}
                          >
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</span>
                            <span
                              className={`text-sm font-bold ${highlight ? (isFree ? 'text-green-400' : 'text-white') : 'text-white'}`}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* QR + booking ref */}
                      <div
                        className="flex items-center gap-4 rounded-xl p-4"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=WINGMAN-${bookingId}&bgcolor=111113&color=FFFFFF&qzone=1`}
                          alt="Booking QR"
                          className="w-16 h-16 rounded-lg flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">Entry Pass</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed">Show this QR to your Wingman host at the venue entrance.</p>
                          <p className="text-[10px] font-mono text-gray-600 mt-1">WINGMAN-{bookingId}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onNavigate('eventChatsList' as Page)}
                          className="flex-1 text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                          💬 Event Chat
                        </button>
                        <button
                          onClick={() => onViewReceipt(item)}
                          className="flex-1 text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                          style={{ background: 'rgba(184,155,77,0.1)', color: '#B89B4D', border: '1px solid rgba(184,155,77,0.25)' }}
                        >
                          🧾 Full Receipt
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<BookingsIcon className="w-9 h-9 text-gray-600" />}
              title="No Purchases Yet"
              subtitle="Your confirmed bookings and receipts will appear here after you complete checkout."
            />
          )
        )}

      </div>

      {/* Mobile sticky checkout bar (only on small screens — desktop uses sidebar) */}
      {activeTab === 'cart' && cartItems.length > 0 && (
        <div
          className="fixed bottom-16 left-0 right-0 z-20 lg:hidden"
          style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">{selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected</p>
              <p className="text-xl font-black text-white">${totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            {/* Mobile disclosure status — shares state with desktop checkboxes */}
            {(() => {
              const allChecked = allDisclosuresAgreed;
              const checkedCount = disclosuresCheckedCount;
              return (
                <div
                  className="flex items-center gap-2 mb-3 rounded-xl px-3 py-2.5"
                  style={{ background: allChecked ? 'rgba(184,155,77,0.08)' : 'rgba(255,255,255,0.04)', border: allChecked ? '1px solid rgba(184,155,77,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: allChecked ? '#B89B4D' : '#4B5563' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-[10px] leading-relaxed flex-1" style={{ color: allChecked ? 'rgba(184,155,77,0.9)' : 'rgba(255,255,255,0.35)' }}>
                    {allChecked
                      ? 'Experience Disclosure agreed ✓'
                      : `Scroll up to agree to Experience Disclosure (${checkedCount}/6 confirmed)`}
                  </p>
                </div>
              );
            })()}
            {/* Short blurb */}
            <p className="text-[9px] leading-relaxed text-center mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              By proceeding, you acknowledge you are purchasing access to a hosted Wingman Experience, not ownership of a table, yacht, or venue space.
            </p>
            <button
              onClick={() => onConfirmCheckout(paymentMethod, selectedItemIds)}
              disabled={selectedItemIds.length === 0 || !allDisclosuresAgreed || isCheckoutLoading}
              className="w-full text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #FFFFFF, #9CA3AF, #374151)', boxShadow: '0 8px 24px rgba(255,255,255,0.25)' }}
            >
              <CreditCardIcon className="w-5 h-5" />
              {isCheckoutLoading ? 'Processing…' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      )}

      {/* ── Reserve Spot Modal — opens when a watchlist card is tapped ── */}
      <ReserveSpotModal
        event={selectedInstance}
        isOpen={!!selectedInstance}
        onClose={() => setSelectedInstance(null)}
        onConfirm={() => { /* booking handled upstream */ }}
        currentUser={currentUser}
        canBook={currentUserCanBook}
      />
    </div>
  );
};
