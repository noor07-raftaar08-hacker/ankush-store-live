import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DEFAULT_STORE_CATEGORIES,
  DEFAULT_STORE_BANNERS,
  DEFAULT_CUSTOMER_REVIEWS,
  DEFAULT_DAILY_DEALS_CONFIG,
  getSmartRecommendations,
  getBestSellersList
} from './services/storeDesignService';

export const SHOP_WHATSAPP_NUMBER = "8817425506";
export const SHOP_WHATSAPP_INTL = "918817425506";
export const SHOP_UPI_ID = "8817425506@axl";
export const STORE_ADDRESS_TEXT = "Khorma, Pratappur, District Surajpur";
export const STORE_COORDS = { lat: 23.4865, lng: 83.2085 };

export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (window.location.port === '5173' || window.location.port === '3000') {
    return `http://${window.location.hostname}:5000`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://ankush-store-live.onrender.com';
  }
  return '';
};
export const API_BASE_URL = getApiBaseUrl();

export const OFFER_COLOR_THEMES = {
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple & Pink',
    gradient: 'from-purple-800 via-fuchsia-700 to-rose-600',
    accent: 'bg-yellow-400 text-purple-950',
    border: 'border-purple-400/40',
    glow: 'shadow-purple-500/30'
  },
  'emerald-forest': {
    id: 'emerald-forest',
    name: 'Emerald Forest Green',
    gradient: 'from-emerald-900 via-green-700 to-teal-600',
    accent: 'bg-amber-300 text-emerald-950',
    border: 'border-emerald-400/40',
    glow: 'shadow-emerald-500/30'
  },
  'sunset-gold': {
    id: 'sunset-gold',
    name: 'Sunset Orange & Gold',
    gradient: 'from-red-700 via-orange-600 to-amber-500',
    accent: 'bg-white text-red-900',
    border: 'border-amber-300/40',
    glow: 'shadow-orange-500/30'
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Royal Blue',
    gradient: 'from-slate-900 via-blue-800 to-cyan-600',
    accent: 'bg-yellow-300 text-blue-950',
    border: 'border-cyan-400/40',
    glow: 'shadow-blue-500/30'
  },
  'crimson-rose': {
    id: 'crimson-rose',
    name: 'Crimson Festive Rose',
    gradient: 'from-rose-900 via-pink-700 to-red-600',
    accent: 'bg-yellow-300 text-rose-950',
    border: 'border-pink-400/40',
    glow: 'shadow-rose-500/30'
  }
};

// Realistic Metallic Coin Sound Synthesizer (No external MP3 needed)
export function playRealCoinSound(coinCount = 5) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const chimes = Math.min(8, Math.max(3, coinCount));
    for (let i = 0; i < chimes; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1350 + i * 110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2600 + i * 90, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.16, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.23);
      }, i * 95);
    }
  } catch (e) {}
}

// Reusable 3D Metallic Gold Coin Component
export function RealGoldCoinIcon({ size = "md", animateSpin = false }) {
  const dims = size === "lg" ? "w-12 h-12 text-lg" : size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs";
    return (
    <motion.div
      animate={animateSpin ? { rotateY: [0, 360] } : {}}
      transition={animateSpin ? { duration: 2.2, repeat: Infinity, ease: "linear" } : {}}
      className={`${dims} rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 p-[2px] shadow-[0_3px_0_#b45309,0_4px_12px_rgba(245,158,11,0.65)] inline-flex items-center justify-center shrink-0 select-none relative overflow-hidden`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-full h-full rounded-full border border-yellow-100/80 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center font-black text-amber-950 shadow-inner">
        ₹
      </div>
    </motion.div>
  );
}

export function createDefaultPackagesForProduct(p) {
  if (Array.isArray(p.packages) && p.packages.length > 0) return p.packages;
  const basePrice = Number(p.price) || 40;
  const status = p.stockStatus || (p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity < 50 ? 'Few Available' : 'Full Stock');

  if (p.name === "Surf Excel") {
    return [
      { packageId: `${p.id}-10rs`, packageName: "₹10 wala packet", weight: "80g", price: 10, stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-20rs`, packageName: "₹20 wala packet", weight: "180g", price: 20, stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-50rs`, packageName: "₹50 wala packet", weight: "400g", price: 50, stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-500g`, packageName: "500 gram wala packet", weight: "500g", price: Math.round(basePrice * 0.5), stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-1kg`, packageName: "1 kg wala packet", weight: "1 kg", price: basePrice, stockStatus: status, isAvailable: true },
      { packageId: `${p.id}-5kg`, packageName: "5 kg Family Pack", weight: "5 kg", price: Math.round(basePrice * 4.8), stockStatus: "Few Available", isAvailable: true },
    ];
  }

  if (p.unit === "kg") {
    return [
      { packageId: `${p.id}-250g`, packageName: "1 Pao (250g) Packet", weight: "250g", price: Math.max(5, Math.round(basePrice * 0.25)), stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-500g`, packageName: "Aadha Kg (500g) Packet", weight: "500g", price: Math.max(10, Math.round(basePrice * 0.5)), stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-1kg`, packageName: "1 Kg Full Packet", weight: "1 kg", price: basePrice, stockStatus: status, isAvailable: true },
      { packageId: `${p.id}-5kg`, packageName: "5 Kg Bulk Pack", weight: "5 kg", price: Math.round(basePrice * 5), stockStatus: status, isAvailable: true },
    ];
  }

  if (p.unit === "liter") {
    return [
      { packageId: `${p.id}-500ml`, packageName: "500 ml (Aadha Liter)", weight: "500ml", price: Math.round(basePrice * 0.5), stockStatus: "Full Stock", isAvailable: true },
      { packageId: `${p.id}-1l`, packageName: "1 Liter Bottle/Pouch", weight: "1 Liter", price: basePrice, stockStatus: status, isAvailable: true },
      { packageId: `${p.id}-5l`, packageName: "5 Liter Family Jar", weight: "5 Liter", price: Math.round(basePrice * 4.9), stockStatus: status, isAvailable: true },
    ];
  }

  return [
    { packageId: `${p.id}-std`, packageName: `Standard (1 ${p.unit || 'pc'})`, weight: `1 ${p.unit || 'packet'}`, price: basePrice, stockStatus: status, isAvailable: true },
    { packageId: `${p.id}-pack3`, packageName: `Value Pack of 3 (${p.unit || 'pc'})`, weight: `3 ${p.unit || 'packet'}`, price: Math.round(basePrice * 3), stockStatus: "Full Stock", isAvailable: true },
  ];
}

export function calculateItemOfferDetails(item, productRef) {
  const qty = Number(item.quantity) || 1;
  const unitPrice = Number(item.price) || 0;
  const rawTotal = unitPrice * qty;
  const discountConfig = productRef?.discountConfig || item.discountConfig;
  const unitLabel = productRef?.unit || item.unit || 'unit';

  if (!discountConfig || !discountConfig.isActive || discountConfig.offerType === 'NONE') {
    return { rawTotal, discountAmount: 0, finalItemTotal: rawTotal, freeQuantity: 0, appliedOfferText: '' };
  }

  if (discountConfig.offerType === 'QUANTITY_BASED' && Array.isArray(discountConfig.quantityRules)) {
    const eligibleRules = discountConfig.quantityRules
      .filter(r => qty >= Number(r.minQty) && Number(r.discountAmount) > 0)
      .sort((a, b) => Number(b.minQty) - Number(a.minQty));

    if (eligibleRules.length > 0) {
      const bestRule = eligibleRules[0];
      const disc = Math.min(rawTotal, Number(bestRule.discountAmount));
      return {
        rawTotal,
        discountAmount: disc,
        finalItemTotal: Math.max(0, rawTotal - disc),
        freeQuantity: 0,
        appliedOfferText: bestRule.label || `${bestRule.minQty} ${unitLabel} par ₹${disc} OFF`
      };
    }
  }

  if (discountConfig.offerType === 'BOGO' && discountConfig.bogoConfig) {
    const buyQty = Math.max(1, Number(discountConfig.bogoConfig.buyQty) || 1);
    const getFreeQty = Math.max(1, Number(discountConfig.bogoConfig.getFreeQty) || 1);
    if (qty >= buyQty) {
      const multiplier = Math.floor(qty / buyQty);
      const totalFree = multiplier * getFreeQty;
      return {
        rawTotal,
        discountAmount: 0,
        finalItemTotal: rawTotal,
        freeQuantity: totalFree,
        appliedOfferText: `🎁 ${discountConfig.bogoConfig.conditionText || `Buy ${buyQty} Get ${getFreeQty} Free`} (+${totalFree} ${unitLabel} FREE!)`
      };
    }
  }

  if (discountConfig.offerType === 'PERCENT' || (discountConfig.offerType === 'CUSTOM' && Number(discountConfig.percentDiscount) > 0)) {
    const pct = Number(discountConfig.percentDiscount) || 0;
    if (pct > 0) {
      const disc = Math.min(rawTotal, Math.round((rawTotal * pct) / 100));
      return {
        rawTotal,
        discountAmount: disc,
        finalItemTotal: Math.max(0, rawTotal - disc),
        freeQuantity: 0,
        appliedOfferText: discountConfig.customConditionText || discountConfig.badgeText || `Special Savings: ${pct}% OFF (-₹${disc})`
      };
    }
  }

  if (discountConfig.offerType === 'CUSTOM') {
    let disc = 0;
    if (Number(discountConfig.flatDiscountAmount) > 0) {
      disc = Number(discountConfig.flatDiscountAmount) * qty;
    } else if (Number(discountConfig.percentDiscount) > 0) {
      disc = Math.round((rawTotal * Number(discountConfig.percentDiscount)) / 100);
    }
    disc = Math.min(rawTotal, disc);
    if (disc > 0) {
      return {
        rawTotal,
        discountAmount: disc,
        finalItemTotal: Math.max(0, rawTotal - disc),
        freeQuantity: 0,
        appliedOfferText: discountConfig.customConditionText || discountConfig.badgeText || `Special Savings: -₹${disc} (${unitLabel})`
      };
    }
  }

  return { rawTotal, discountAmount: 0, finalItemTotal: rawTotal, freeQuantity: 0, appliedOfferText: '' };
}

const initialProductsRaw = [
  { id: 1, name: "Basmati Rice", category: "Groceries", price: 85, mrp: 100, unit: "kg", stock_quantity: 200, image_url: "🍚", bestseller: true, soldCount: 145 },
  { id: 2, name: "Toor Dal", category: "Groceries", price: 140, mrp: 160, unit: "kg", stock_quantity: 150, image_url: "🫘", bestseller: true, soldCount: 112 },
  { id: 3, name: "Wheat Flour (Atta)", category: "Groceries", price: 45, mrp: 52, unit: "kg", stock_quantity: 300, image_url: "🌾", bestseller: true, soldCount: 210 },
  { id: 4, name: "Sugar", category: "Groceries", price: 42, mrp: 48, unit: "kg", stock_quantity: 250, image_url: "🍬", soldCount: 165 },
  { id: 5, name: "Mustard Oil", category: "Groceries", price: 180, mrp: 210, unit: "liter", stock_quantity: 100, image_url: "🫒", bestseller: true, soldCount: 98 },
  { id: 6, name: "Salt", category: "Groceries", price: 25, mrp: 28, unit: "kg", stock_quantity: 400, image_url: "🧂", soldCount: 190 },
  { id: 7, name: "Turmeric Powder", category: "Groceries", price: 60, mrp: 70, unit: "packet", stock_quantity: 180, image_url: "🟡", soldCount: 84 },
  { id: 8, name: "Red Chilli Powder", category: "Groceries", price: 55, mrp: 65, unit: "packet", stock_quantity: 160, image_url: "🌶️", soldCount: 79 },
  { id: 9, name: "Moong Dal", category: "Groceries", price: 120, mrp: 135, unit: "kg", stock_quantity: 130, image_url: "🫘", soldCount: 88 },
  { id: 10, name: "Groundnut Oil", category: "Groceries", price: 210, mrp: 240, unit: "liter", stock_quantity: 80, image_url: "🥜", soldCount: 64 },
  { id: 11, name: "Coca Cola", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 200, image_url: "🥤", bestseller: true, soldCount: 175 },
  { id: 12, name: "Pepsi", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 180, image_url: "🥤", soldCount: 120 },
  { id: 13, name: "Sprite", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 150, image_url: "🍋", soldCount: 110 },
  { id: 14, name: "Fanta", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 120, image_url: "🍊", soldCount: 95 },
  { id: 15, name: "Mineral Water (1L)", category: "Cold Drinks", price: 20, mrp: 20, unit: "piece", stock_quantity: 500, image_url: "💧", soldCount: 260 },
  { id: 16, name: "Mango Juice", category: "Cold Drinks", price: 30, mrp: 35, unit: "piece", stock_quantity: 100, image_url: "🥭", soldCount: 92 },
  { id: 17, name: "Lassi", category: "Cold Drinks", price: 35, mrp: 40, unit: "piece", stock_quantity: 80, image_url: "🥛", soldCount: 74 },
  { id: 18, name: "Buttermilk", category: "Cold Drinks", price: 15, mrp: 20, unit: "piece", stock_quantity: 60, image_url: "🥛", soldCount: 68 },
  { id: 19, name: "Surf Excel", category: "Household", price: 120, mrp: 135, unit: "kg", stock_quantity: 90, image_url: "🧴", bestseller: true, soldCount: 154 },
  { id: 20, name: "Vim Bar", category: "Household", price: 30, mrp: 35, unit: "piece", stock_quantity: 200, image_url: "🧽", soldCount: 130 },
  { id: 21, name: "Dettol Soap", category: "Household", price: 45, mrp: 50, unit: "piece", stock_quantity: 150, image_url: "🧼", soldCount: 142 },
  { id: 22, name: "Toothpaste", category: "Household", price: 80, mrp: 95, unit: "piece", stock_quantity: 100, image_url: "🪥", soldCount: 86 },
  { id: 23, name: "Shampoo", category: "Household", price: 150, mrp: 175, unit: "piece", stock_quantity: 70, image_url: "🧴", soldCount: 62 },
  { id: 24, name: "Floor Cleaner", category: "Household", price: 95, mrp: 110, unit: "liter", stock_quantity: 60, image_url: "🧹", soldCount: 55 },
  { id: 25, name: "Dishwash Gel", category: "Household", price: 110, mrp: 125, unit: "piece", stock_quantity: 85, image_url: "🫧", soldCount: 59 },
  { id: 26, name: "Garbage Bags", category: "Household", price: 60, mrp: 75, unit: "packet", stock_quantity: 120, image_url: "🗑️", soldCount: 48 },
  { id: 27, name: "Tissue Paper", category: "Household", price: 40, mrp: 50, unit: "packet", stock_quantity: 200, image_url: "🧻", soldCount: 70 },
  { id: 28, name: "Incense Sticks", category: "Household", price: 35, mrp: 40, unit: "packet", stock_quantity: 180, image_url: "🪔", soldCount: 115 }
];

export const initialProducts = initialProductsRaw.map(p => ({
  ...p,
  stockStatus: p.stockStatus || 'Full Stock',
  packages: createDefaultPackagesForProduct(p),
  discountConfig: p.discountConfig || {
    isActive: p.id === 1 || p.id === 19,
    badgeText: p.id === 19 ? 'Extra Savings' : 'Special Offer',
    badgeColor: p.id === 19 ? 'purple' : 'red',
    offerType: p.id === 1 || p.id === 19 ? 'QUANTITY_BASED' : 'NONE',
    productUnit: p.unit,
    quantityRules: [
      { minQty: 3, discountAmount: 10, unitLabel: p.unit, label: `3 ${p.unit} par ₹10 Discount` },
      { minQty: 5, discountAmount: 25, unitLabel: p.unit, label: `5 ${p.unit} par ₹25 Discount` }
    ],
    bogoConfig: { buyQty: 1, getFreeQty: 1, applicablePackageWeight: 'ALL', conditionText: `Buy 1 ${p.unit} Get 1 ${p.unit} Free` },
    flatDiscountAmount: 0,
    percentDiscount: 0,
    customConditionText: ''
  },
  rating: 4.8,
  reviews: [{ id: 1, user: "Pratappur Customer", stars: 5, comment: "100% Asli saman aur sahi daam!" }]
}));

export const initialOffers = [
  { id: 1, title: "🪔 Festival Special Mega Discount!", description: "Flat 20% OFF on selected Groceries & Family Packs! Stock up today!", is_active: true, tag: "MEGA SALE", highlight: "UP TO 20% OFF" },
  { id: 2, title: "🎉 Buy 1 Get 1 & Combo Deals!", description: "Cold Drinks aur Household Packs par special quantity discounts!", is_active: true, tag: "COMBO BONANZA", highlight: "BUY MORE SAVE MORE" },
  { id: 3, title: "🚚 100% Free Home Delivery!", description: "₹1,500 ya usse upar ke order par 2 km ke andar bilkul FREE Home Delivery!", is_active: true, tag: "FREE DELIVERY", highlight: "₹0 DELIVERY FEE" }
];

const defaultStoreSettings = {
  storeName: "Ankush General Store",
  storeAddress: "Khorma, Pratappur, District Surajpur",
  mapLocationUrl: "https://www.google.com/maps/search/?api=1&query=23.4865,83.2085",
  logoUrl: "",
  firstOfferColorTheme: "royal-purple",
  isStoreOpen: true,
  closureReason: "",
  closureMessage: "Aaj Hamari Dukaan Band Hai. Kripya thodi der baad ya kal subah dobara padharein. Dhanyawad!",
  aboutContent: {
    title: "Welcome to Ankush General Store",
    subtitle: "Khorma, Pratappur, District Surajpur ka sabse bharosemand online & offline grocery superstore.",
    description: "Ankush General Store me aapko rozmarra ki zaroorat ka har saman — ताज़ा राशन (Groceries), ठंडी कोल्ड ड्रिंक्स (Cold Drinks), और घरेलू सामान (Household Essentials) — 100% शुद्धता और सबसे सही दाम पर मिलता है। हमारा उद्देश्य प्रतापपुर और खोरमा के हर परिवार को घर बैठे तेज़ और भरोसेमंद होम डिलीवरी देना है।",
    highlights: [
      "100% Asli aur Fresh Saman ki Guarantee",
      "2 km ke andar Fast Local Home Delivery (₹1500+ par FREE)",
      "Har Kharidi par VIP Ankush Loyalty Coins aur Special Offers",
      "Direct WhatsApp aur Phone Call Support"
    ],
    storeTimings: "Subah 7:00 AM se Raat 9:30 PM tak (Rozana)",
    ownerNote: "Aapka vishwas hi hamari sabse badi poonji hai. — Ankush General Store"
  },
  socialLinks: {
    instagram: "https://instagram.com/",
    whatsapp: "8817425506",
    telegram: "https://t.me/",
    phone: "8817425506"
  },
  carouselEnabled: true,
  carouselImages: [
    {
      id: "slide-1",
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
      title: "Fresh Daily Groceries & Grains",
      subtitle: "Basmati Chawal, Toor Dal aur Shudh Atta sabse kam daam par!",
      tag: "🔥 Up to 25% Savings",
      order: 1,
      isActive: true
    },
    {
      id: "slide-2",
      url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1000&q=80",
      title: "Ankush Superstore — Khorma, Pratappur",
      subtitle: "₹1,500+ ke order par 2 km tak 100% FREE Home Delivery!",
      tag: "🚚 Free Delivery Zone",
      order: 2,
      isActive: true
    },
    {
      id: "slide-3",
      url: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1000&q=80",
      title: "Household & Family Combo Deals",
      subtitle: "Surf Excel, Dettol, Oils aur Spices ke har size ke packets uplabdh!",
      tag: "🎁 Bulk Savings",
      order: 3,
      isActive: true
    },
    {
      id: "slide-4",
      url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1000&q=80",
      title: "Chilled Cold Drinks & Refreshments",
      subtitle: "Coca-Cola, Sprite, Mango Juice aur Lassi par party discounts!",
      tag: "🥤 Chilled & Ready",
      order: 4,
      isActive: true
    }
  ],
  coinRules: {
    isEnabled: true,
    spendPerCoin: 100,
    coinsEarnedPerSpend: 2,
    minOrderToEarn: 200
  },
  monthlyRankingBars: [
    {
      id: 1,
      title: "Silver Milestone",
      targetSpend: 2000,
      rewardCoins: 50,
      themeName: "Emerald Mint",
      gradient: "from-emerald-500 via-teal-500 to-green-400",
      accentBg: "bg-emerald-500",
      icon: "🥈"
    },
    {
      id: 2,
      title: "Gold VIP Milestone",
      targetSpend: 5000,
      rewardCoins: 150,
      themeName: "Royal Gold",
      gradient: "from-amber-500 via-orange-500 to-yellow-400",
      accentBg: "bg-amber-500",
      icon: "🥇"
    },
    {
      id: 3,
      title: "Diamond Royal Milestone",
      targetSpend: 10000,
      rewardCoins: 300,
      themeName: "Cosmic Diamond",
      gradient: "from-fuchsia-600 via-purple-600 to-indigo-500",
      accentBg: "bg-fuchsia-600",
      icon: "💎"
    }
  ],
  deliveryDistanceConfig: {
    maxRadiusKm: 15,
    freeDeliveryMinOrder: 1500,
    slabs: [
      { id: 1, maxKm: 2, charge: 0, label: "Khorma Local (Under 2 km)" },
      { id: 2, maxKm: 5, charge: 40, label: "Pratappur Town (2 to 5 km)" },
      { id: 3, maxKm: 10, charge: 70, label: "Outer Area (5 to 10 km)" },
      { id: 4, maxKm: 15, charge: 120, label: "Far Suburbs (10 to 15 km)" }
    ]
  }
};

export const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [currentView, setCurrentViewRaw] = useState(() => {
    return localStorage.getItem('ankush_current_view') || 'home';
  });
  const setCurrentView = useCallback((view) => {
    setCurrentViewRaw(view);
    try {
      localStorage.setItem('ankush_current_view', view);
    } catch (e) {}
  }, []);

  const [isAdminAuth, setIsAdminAuth] = useState(() => localStorage.getItem('ankush_admin_auth') === 'true');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalInitialTab, setLoginModalInitialTab] = useState('customer');

  // Global Light / Dark Theme Mode (Controlled directly from Header)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('ankush_theme_mode') || 'light');
  const toggleThemeMode = () => {
    setThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ankush_theme_mode', next);
      return next;
    });
  };

  // Real 3D Gold Coin Flying Animation State
  const [coinFlight, setCoinFlight] = useState(null); // { id, amount, reason }
  const [walletPulse, setWalletPulse] = useState(false);

  const triggerCoinFlyAnimation = (amount = 10, reason = "Coins Credited to Your Account!") => {
    const cleanAmt = Math.max(1, Number(amount) || 10);
    playRealCoinSound(cleanAmt);
    setCoinFlight({ id: Date.now(), amount: cleanAmt, reason });
    setTimeout(() => {
      setWalletPulse(true);
      setTimeout(() => setWalletPulse(false), 1200);
    }, 650);
    setTimeout(() => {
      setCoinFlight(null);
    }, 2800);
  };

  // Store Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('ankush_store_settings');
    if (saved) {
      try {
        return { ...defaultStoreSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultStoreSettings;
      }
    }
    return defaultStoreSettings;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          const merged = { ...defaultStoreSettings, ...data.settings };
          setStoreSettings(merged);
          localStorage.setItem('ankush_store_settings', JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  const updateStoreSettings = async (newPartialSettings) => {
    const updated = { ...storeSettings, ...newPartialSettings };
    setStoreSettings(updated);
    localStorage.setItem('ankush_store_settings', JSON.stringify(updated));
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}
    return updated;
  };

  // Products State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ankush_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p, idx) => ({
          ...p,
          soldCount: p.soldCount || initialProductsRaw[idx % initialProductsRaw.length]?.soldCount || 50,
          stockStatus: p.stockStatus || (p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity < 50 ? 'Few Available' : 'Full Stock'),
          packages: createDefaultPackagesForProduct(p),
          discountConfig: {
            isActive: false,
            badgeText: 'Special Offer',
            badgeColor: 'red',
            offerType: 'NONE',
            productUnit: p.unit || 'kg',
            quantityRules: [
              { minQty: 3, discountAmount: 10, unitLabel: p.unit || 'kg', label: `3 ${p.unit || 'kg'} par ₹10 Discount` },
              { minQty: 5, discountAmount: 25, unitLabel: p.unit || 'kg', label: `5 ${p.unit || 'kg'} par ₹25 Discount` }
            ],
            bogoConfig: { buyQty: 1, getFreeQty: 1, applicablePackageWeight: 'ALL', conditionText: 'Buy 1 Get 1 Free' },
            flatDiscountAmount: 0,
            percentDiscount: 0,
            customConditionText: '',
            ...(p.discountConfig || {}),
            productUnit: p.unit || 'kg'
          }
        }));
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    }).catch(() => {});
  }, []);

  const saveProductsList = (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem('ankush_products', JSON.stringify(updatedList));
  };

  const addProduct = (prodData) => {
    const basePrice = Number(prodData.price) || 0;
    const newId = Date.now();
    const unitVal = prodData.unit || 'kg';
    const customPackages = Array.isArray(prodData.packages) && prodData.packages.length > 0
      ? prodData.packages
      : createDefaultPackagesForProduct({ ...prodData, id: newId, price: basePrice, unit: unitVal });

    const newProd = {
      ...prodData,
      id: newId,
      price: basePrice,
      unit: unitVal,
      mrp: prodData.mrp ? Number(prodData.mrp) : Math.round(basePrice * 1.15),
      stock_quantity: Number(prodData.stock_quantity) || 100,
      stockStatus: prodData.stockStatus || 'Full Stock',
      soldCount: Number(prodData.soldCount) || 25,
      packages: customPackages,
      discountConfig: {
        isActive: false,
        badgeText: 'Special Offer',
        badgeColor: 'red',
        offerType: 'NONE',
        productUnit: unitVal,
        quantityRules: [
          { minQty: 3, discountAmount: 10, unitLabel: unitVal, label: `3 ${unitVal} par ₹10 Discount` },
          { minQty: 5, discountAmount: 25, unitLabel: unitVal, label: `5 ${unitVal} par ₹25 Discount` }
        ],
        bogoConfig: { buyQty: 1, getFreeQty: 1, applicablePackageWeight: 'ALL', conditionText: `Buy 1 ${unitVal} Get 1 ${unitVal} Free` },
        flatDiscountAmount: 0,
        percentDiscount: 0,
        customConditionText: ''
      },
      rating: 5.0,
      reviews: [{ id: Date.now(), user: "Store Assured", stars: 5, comment: "Fresh stock available!" }]
    };

    const updated = [newProd, ...products];
    saveProductsList(updated);

    fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd)
    }).catch(() => {});
  };

  const updateProduct = (productId, updatedFields) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const nextPrice = updatedFields.price !== undefined ? Number(updatedFields.price) : p.price;
        const nextUnit = updatedFields.unit || p.unit || 'kg';
        const nextDiscountConfig = p.discountConfig ? {
          ...p.discountConfig,
          productUnit: nextUnit,
          quantityRules: (p.discountConfig.quantityRules || []).map(r => ({
            ...r,
            unitLabel: nextUnit,
            label: `${r.minQty} ${nextUnit} par ₹${r.discountAmount} Discount`
          }))
        } : p.discountConfig;

        return {
          ...p,
          ...updatedFields,
          unit: nextUnit,
          price: nextPrice,
          mrp: updatedFields.mrp !== undefined ? Number(updatedFields.mrp) : Math.round(nextPrice * 1.15),
          discountConfig: nextDiscountConfig
        };
      }
      return p;
    });
    saveProductsList(updated);

    const target = updated.find(p => p.id === productId);
    if (target) {
      fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      }).catch(() => {});
    }
  };

  const deleteProduct = (productId) => {
    const updated = products.filter(p => p.id !== productId);
    saveProductsList(updated);
    fetch(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateProductDiscount = (productId, discountConfig) => {
    const updated = products.map(p => (p.id === productId ? { ...p, discountConfig: { ...discountConfig, productUnit: p.unit } } : p));
    saveProductsList(updated);
    fetch(`${API_BASE_URL}/api/products/${productId}/discount`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountConfig })
    }).catch(() => {});
  };

  const addProductReview = (productId, userName, stars, comment) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const nextReviews = [{ id: Date.now(), user: userName || 'Customer', stars: Number(stars), comment }, ...(p.reviews || [])];
        const avg = nextReviews.reduce((s, r) => s + r.stars, 0) / nextReviews.length;
        return { ...p, reviews: nextReviews, rating: Number(avg.toFixed(1)) };
      }
      return p;
    });
    saveProductsList(updated);
  };

  const [activePackageModalProduct, setActivePackageModalProduct] = useState(null);

  // Customers & VIP Auth State
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('ankush_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ankush_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Customer Monthly Rashan List & Price/Stock Watchlist
  const [rashanList, setRashanList] = useState(() => {
    const saved = localStorage.getItem('ankush_rashan_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { productId: 1, qty: 2 },
      { productId: 2, qty: 1 },
      { productId: 3, qty: 5 },
      { productId: 5, qty: 1 },
      { productId: 19, qty: 1 }
    ];
  });

  const saveRashanList = (nextList) => {
    setRashanList(nextList);
    localStorage.setItem('ankush_rashan_list', JSON.stringify(nextList));
  };

  const [watchlistIds, setWatchlistIds] = useState(() => {
    const saved = localStorage.getItem('ankush_watchlist_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [1, 5, 19, 11];
  });

  const toggleWatchlistProduct = (prodId) => {
    setWatchlistIds(prev => {
      const exists = prev.includes(prodId);
      const next = exists ? prev.filter(id => id !== prodId) : [...prev, prodId];
      localStorage.setItem('ankush_watchlist_ids', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/customers/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
          localStorage.setItem('ankush_customers', JSON.stringify(data.customers));
          if (currentUser) {
            const freshMe = data.customers.find(c => c.phone === currentUser.phone);
            if (freshMe) {
              setCurrentUser(freshMe);
              localStorage.setItem('ankush_current_user', JSON.stringify(freshMe));
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const saveCustomers = (updatedList, updatedCurrent = currentUser) => {
    setCustomers(updatedList);
    localStorage.setItem('ankush_customers', JSON.stringify(updatedList));
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
      localStorage.setItem('ankush_current_user', JSON.stringify(updatedCurrent));
    }
  };

  const registerCustomer = async (name, phone, pin, address) => {
    if (customers.find(c => c.phone === phone)) {
      return { success: false, message: "Ye mobile number pehle se registered hai! Kripya Login karein." };
    }
    const newCustomer = {
      id: `CUST${Date.now()}`,
      name,
      phone,
      pin,
      address: address || '',
      savedAddresses: address ? [{ id: Date.now(), label: 'Home', fullAddress: address, distanceKm: 1.2 }] : [],
      coins: 20,
      unseenReward: {
        hasUnseen: true,
        rewardId: `WELCOME-${Date.now()}`,
        amount: 20,
        message: "Welcome to Ankush General Store VIP Club! Aapko +20 Welcome Bonus Coins mile hain!",
        awardedAt: new Date().toISOString()
      },
      coinHistory: [
        { id: `CH-${Date.now()}`, type: 'WELCOME_BONUS', amount: 20, note: 'Welcome Signup Bonus Coins', date: new Date().toISOString() }
      ],
      joinedAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, pin, address })
      });
      const data = await res.json();
      if (data.success && data.user) {
        const updated = [data.user, ...customers.filter(c => c.phone !== phone)];
        saveCustomers(updated, data.user);
        triggerCoinFlyAnimation(20, "Welcome Bonus +20 Gold Coins Credited!");
        return { success: true, user: data.user };
      }
      if (!data.success && data.message) {
        return { success: false, message: data.message };
      }
    } catch (e) {}

    const updated = [newCustomer, ...customers];
    saveCustomers(updated, newCustomer);
    triggerCoinFlyAnimation(20, "Welcome Bonus +20 Gold Coins Credited!");
    return { success: true, user: newCustomer };
  };

  const loginCustomer = async (phone, pin) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('ankush_current_user', JSON.stringify(data.user));
        fetchOrders();
        return { success: true, user: data.user };
      }
      if (res.status === 401 || (data && data.success === false)) {
        return { success: false, message: data.message || "Galat Mobile Number ya 4-Digit PIN!" };
      }
    } catch (e) {}

    const found = customers.find(c => c.phone === phone && c.pin === pin);
    if (!found) {
      return { success: false, message: "Galat Mobile Number ya 4-Digit PIN!" };
    }
    setCurrentUser(found);
    localStorage.setItem('ankush_current_user', JSON.stringify(found));
    fetchOrders();
    return { success: true, user: found };
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
    localStorage.removeItem('ankush_current_user');
    setCurrentView('home');
  };

  const updateCustomerData = async (phone, deltaCoins, newPin = null, customMessage = null) => {
    const rewardMsg = customMessage || `Special VIP Reward (+${deltaCoins} Coins) from Ankush General Store!`;
    if (Number(deltaCoins) > 0 && currentUser && currentUser.phone === phone) {
      triggerCoinFlyAnimation(Number(deltaCoins), rewardMsg);
    }

    try {
      if (deltaCoins > 0 && !newPin) {
        const res = await fetch(`${API_BASE_URL}/api/customers/${phone}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: deltaCoins, message: rewardMsg })
        });
        const data = await res.json();
        if (data.success && data.customer) {
          const updatedList = customers.map(c => (c.phone === phone ? data.customer : c));
          const updatedCurr = currentUser && currentUser.phone === phone ? data.customer : currentUser;
          saveCustomers(updatedList, updatedCurr);
          return;
        }
      }
    } catch (e) {}

    const updated = customers.map(c => {
      if (c.phone === phone) {
        const nextCoins = Math.max(0, (Number(c.coins) || 0) + Number(deltaCoins));
        const pendingAmt = deltaCoins > 0
          ? (c.unseenReward?.hasUnseen ? (Number(c.unseenReward.amount) || 0) + Number(deltaCoins) : Number(deltaCoins))
          : (c.unseenReward?.amount || 0);

        return {
          ...c,
          coins: nextCoins,
          pin: newPin ? newPin : c.pin,
          unseenReward: deltaCoins > 0 ? {
            hasUnseen: true,
            rewardId: `REW-${Date.now()}`,
            amount: pendingAmt,
            message: rewardMsg,
            awardedBy: "Ankush General Store Admin",
            awardedAt: new Date().toISOString()
          } : c.unseenReward,
          coinHistory: [
            {
              id: `CH-${Date.now()}`,
              type: deltaCoins >= 0 ? 'ADMIN_REWARD' : 'REDEEMED',
              amount: deltaCoins,
              note: rewardMsg,
              date: new Date().toISOString()
            },
            ...(c.coinHistory || [])
          ]
        };
      }
      return c;
    });
    const updatedCurr = currentUser && currentUser.phone === phone
      ? updated.find(c => c.phone === phone)
      : currentUser;
    saveCustomers(updated, updatedCurr);
  };

  const acknowledgeCoinReward = async () => {
    if (!currentUser) return;
    const rewardAmt = Number(currentUser.unseenReward?.amount) || 20;
    triggerCoinFlyAnimation(rewardAmt, `+${rewardAmt} VIP Gold Coins Added to Wallet!`);

    const phone = currentUser.phone;
    const updatedList = customers.map(c => {
      if (c.phone === phone) {
        return { ...c, unseenReward: { ...c.unseenReward, hasUnseen: false, amount: 0 } };
      }
      return c;
    });
    const updatedMe = { ...currentUser, unseenReward: { ...currentUser.unseenReward, hasUnseen: false, amount: 0 } };
    saveCustomers(updatedList, updatedMe);

    try {
      await fetch(`${API_BASE_URL}/api/customers/${phone}/acknowledge-reward`, { method: 'POST' });
    } catch (e) {}
  };

  const updateCustomerProfile = async (phone, profileUpdates) => {
    const updated = customers.map(c => (c.phone === phone ? { ...c, ...profileUpdates } : c));
    const updatedCurr = currentUser && currentUser.phone === phone ? { ...currentUser, ...profileUpdates } : currentUser;
    saveCustomers(updated, updatedCurr);
    try {
      await fetch(`${API_BASE_URL}/api/customers/${phone}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileUpdates)
      });
    } catch (e) {}
  };

  // Cart & Checkout State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerDistanceKm, setCustomerDistanceKm] = useState(1.2);
  const [distanceZoneLabel, setDistanceZoneLabel] = useState('Khorma / Pratappur Town (Under 2 km)');
  const [useCoins, setUseCoins] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);
  const [flyingCartItem, setFlyingCartItem] = useState(null);

  const triggerFlyToCart = (startX, startY, imageOrEmoji) => {
    const sX = Number(startX) || (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const sY = Number(startY) || (typeof window !== 'undefined' ? window.innerHeight / 2 : 300);
    setFlyingCartItem({
      id: Date.now(),
      startX: sX,
      startY: sY,
      img: imageOrEmoji || '🛒'
    });
    setTimeout(() => {
      setFlyingCartItem(null);
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 350);
    }, 650);
  };

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerPhone(currentUser.phone || '');
      if (currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  // Orders State with strict Array validation & corrupted cache purge
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('ankush_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    try { localStorage.removeItem('ankush_orders'); } catch (e) {}
    return [];
  });

  const fetchOrders = async () => {
    if (!API_BASE_URL) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        localStorage.setItem('ankush_orders', JSON.stringify(data));
      } else {
        console.warn('API returned non-array orders:', data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Sanitize any invalid legacy localStorage items
    try {
      const savedOrders = localStorage.getItem('ankush_orders');
      if (savedOrders && !Array.isArray(JSON.parse(savedOrders))) {
        localStorage.removeItem('ankush_orders');
      }
      const savedCustomers = localStorage.getItem('ankush_customers');
      if (savedCustomers && !Array.isArray(JSON.parse(savedCustomers))) {
        localStorage.removeItem('ankush_customers');
      }
    } catch (e) {
      localStorage.removeItem('ankush_orders');
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, []);

  // Offers State
  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('ankush_offers');
    return saved ? JSON.parse(saved) : initialOffers;
  });

  const addToCart = (product, selectedPkg = null, addQty = 1) => {
    let effectivePkg = selectedPkg;
    let effectiveQty = addQty;
    if (typeof selectedPkg === 'number') {
      effectiveQty = selectedPkg;
      effectivePkg = null;
    }
    if (!storeSettings.isStoreOpen) {
      alert(storeSettings.closureMessage || "Aaj Hamari Dukaan Band Hai!");
      return;
    }

    const pkg = effectivePkg || (product.packages && product.packages.find(pk => pk.stockStatus !== 'Out of Stock' && pk.isAvailable !== false)) || {
      packageId: `${product.id}-default`,
      packageName: `Standard (${product.unit})`,
      weight: `1 ${product.unit}`,
      price: product.price,
      stockStatus: product.stockStatus || 'Full Stock'
    };

    if (pkg.stockStatus === 'Out of Stock' || product.stockStatus === 'Out of Stock') {
      alert('⚠️ Sorry! Ye package abhi Out of Stock hai.');
      return;
    }

    const cartEntryId = `${product.id}__${pkg.packageId}`;
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);

    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartEntryId);
      if (existing) {
        return prev.map(item =>
          item.id === cartEntryId ? { ...item, quantity: item.quantity + Number(effectiveQty) } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          id: cartEntryId,
          productId: product.id,
          name: `${product.name} (${pkg.weight})`,
          baseProductName: product.name,
          packageId: pkg.packageId,
          packageName: pkg.packageName,
          weight: pkg.weight,
          price: Number(pkg.price),
          mrp: Math.round(Number(pkg.price) * 1.15),
          unit: product.unit || pkg.weight,
          stockStatus: pkg.stockStatus || 'Full Stock',
          quantity: Number(effectiveQty)
        }
      ];
    });
  };

  // Add Entire Monthly Rashan List in 1-Click
  const addFullRashanListToCart = () => {
    if (!storeSettings.isStoreOpen) {
      alert(storeSettings.closureMessage || "Aaj Hamari Dukaan Band Hai!");
      return;
    }
    let addedCount = 0;
    rashanList.forEach(entry => {
      const prod = products.find(p => p.id === entry.productId);
      if (prod && prod.stockStatus !== 'Out of Stock') {
        addToCart(prod, null, Number(entry.qty) || 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      setIsCartOpen(true);
    } else {
      alert("Rashan list me abhi koi available product nahi hai!");
    }
  };

  // Authenticated User-Only Repeat Order
  const repeatLastOrder = (orderToRepeat = null) => {
    if (!currentUser) {
      alert("Apna order repeat karne ke liye kripya pehle Login karein!");
      setIsLoginModalOpen(true);
      return;
    }

    const myOwnOrders = orders.filter(o => o.customerPhone === currentUser.phone);
    const targetOrder = orderToRepeat || myOwnOrders[0];

    if (!targetOrder) {
      alert("Aapke account me abhi koi pichhla order nahi mila!");
      return;
    }

    if (targetOrder.customerPhone !== currentUser.phone) {
      alert("🚫 Security Alert: Aap sirf apna hi order repeat kar sakte hain!");
      return;
    }

    setCartItems((targetOrder.items || []).map(it => ({ ...it })));
    setIsCartOpen(true);
  };

  const removeFromCart = (cartEntryId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartEntryId));
  };

  const updateQuantity = (cartEntryId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartEntryId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === cartEntryId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setUseCoins(false);
    if (!currentUser) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  };

  const detailedCartItems = useMemo(() => {
    return cartItems.map(item => {
      const prodRef = products.find(p => p.id === item.productId || p.id === item.id);
      const offerCalc = calculateItemOfferDetails(item, prodRef);
      return {
        ...item,
        rawItemTotal: offerCalc.rawTotal,
        itemDiscount: offerCalc.discountAmount,
        finalItemTotal: offerCalc.finalItemTotal,
        freeQuantity: offerCalc.freeQuantity,
        appliedOfferText: offerCalc.appliedOfferText
      };
    });
  }, [cartItems, products]);

  const totalItems = detailedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotalPrice = detailedCartItems.reduce((sum, item) => sum + item.rawItemTotal, 0);
  const totalProductDiscount = detailedCartItems.reduce((sum, item) => sum + item.itemDiscount, 0);
  const totalPrice = Math.max(0, rawSubtotalPrice - totalProductDiscount);
  const totalMRP = detailedCartItems.reduce((sum, item) => sum + (item.mrp || Math.round(item.price * 1.15)) * item.quantity, 0);

  const isDistanceEligible = customerDistanceKm <= (storeSettings.deliveryDistanceConfig?.maxRadiusKm || 15.0);
  const isWithinFreeDeliveryRange = customerDistanceKm <= 2.0;
  const isMinOrderMet = totalPrice >= 700;

  const deliveryCharge = useMemo(() => {
    if (totalPrice === 0) return 0;
    const freeMin = storeSettings.deliveryDistanceConfig?.freeDeliveryMinOrder || 1500;
    if (totalPrice >= freeMin && customerDistanceKm <= 2.0) return 0;
    const slabs = storeSettings.deliveryDistanceConfig?.slabs || [
      { maxKm: 2, charge: 0 },
      { maxKm: 5, charge: 40 },
      { maxKm: 10, charge: 70 },
      { maxKm: 15, charge: 120 }
    ];
    const match = slabs.find(s => customerDistanceKm <= s.maxKm);
    return match !== undefined ? match.charge : 40;
  }, [totalPrice, customerDistanceKm, storeSettings.deliveryDistanceConfig]);

  const amountNeededForMinOrder = Math.max(0, 700 - totalPrice);
  const amountNeededForFreeDelivery = Math.max(0, (storeSettings.deliveryDistanceConfig?.freeDeliveryMinOrder || 1500) - totalPrice);

  const availableCoins = currentUser ? currentUser.coins : 0;
  const coinsDiscount = (currentUser && useCoins) ? Math.min(availableCoins, Math.floor(totalPrice * 0.5)) : 0;
  const finalAmount = Math.max(0, totalPrice + deliveryCharge - coinsDiscount);
  const totalSavings = (totalMRP - rawSubtotalPrice) + totalProductDiscount + (deliveryCharge === 0 && totalPrice >= 1500 ? 30 : 0) + coinsDiscount;

  const isCoinEarningActive = storeSettings.coinRules?.isEnabled !== false;
  const spendPerCoin = Number(storeSettings.coinRules?.spendPerCoin) || 100;
  const coinsMultiplier = Number(storeSettings.coinRules?.coinsEarnedPerSpend) || 2;
  const minEarnOrder = Number(storeSettings.coinRules?.minOrderToEarn) || 200;

  const coinsEarnedOnOrder = (currentUser && isCoinEarningActive && finalAmount >= minEarnOrder)
    ? Math.floor(finalAmount / spendPerCoin) * coinsMultiplier
    : 0;

  const addOrder = async (orderData) => {
    if (!storeSettings.isStoreOpen) {
      alert(storeSettings.closureMessage || "Aaj Hamari Dukaan Band Hai!");
      return null;
    }

    const orderNumber = 1001 + orders.length;
    const secureOrderId = `AGS-${orderNumber}`;
    const newOrder = {
      ...orderData,
      id: secureOrderId,
      orderId: secureOrderId,
      customerId: currentUser?.id || '',
      orderDate: new Date().toISOString(),
      status: 'pending',
      rawSubtotal: rawSubtotalPrice,
      totalDiscount: totalProductDiscount,
      distanceKm: customerDistanceKm,
      distanceZoneLabel,
      isFreeDeliveryApplied: deliveryCharge === 0 && totalPrice >= 1500,
      advancePaid: orderData.paymentMethod === 'cash' ? 0 : finalAmount,
      balanceDue: orderData.paymentMethod === 'cash' ? finalAmount : 0
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.status === 403) {
        const errData = await res.json();
        alert(errData.error || "Dukaan abhi band hai!");
        return null;
      }
    } catch (e) {}

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('ankush_orders', JSON.stringify(updated));

    if (currentUser) {
      const netCoinChange = (orderData.coinsEarned || 0) - (orderData.coinsUsed || 0);
      if (netCoinChange !== 0) {
        updateCustomerData(currentUser.phone, netCoinChange, null, netCoinChange > 0 ? `Order ${secureOrderId} Loyalty Bonus` : `Redeemed on Order ${secureOrderId}`);
      }
    }

    const itemsList = newOrder.items.map(i => {
      const freeTag = i.freeQuantity > 0 ? ` [+${i.freeQuantity} FREE]` : '';
      const discTag = i.itemDiscount > 0 ? ` (-₹${i.itemDiscount} Off)` : '';
      return `• ${i.name} ×${i.quantity}${freeTag} = ₹${i.finalItemTotal || (i.price * i.quantity)}${discTag}`;
    }).join('\n');

    const paymentNote = newOrder.paymentMethod === 'cash'
      ? `💵 Cash on Delivery (Pay ₹${newOrder.finalAmount} to delivery agent on arrival)`
      : `📱 UPI Full Payment (₹${newOrder.finalAmount} Paid via QR)`;

    const googleMapsUrl = (orderData.coords && orderData.coords.lat && orderData.coords.lng)
      ? `https://maps.google.com/?q=${orderData.coords.lat},${orderData.coords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newOrder.customerAddress)}`;

    const waText =
      `🏪 *Ankush General Store (${STORE_ADDRESS_TEXT})*\n` +
      `🔒 *Verified Website Order ID:* ${newOrder.id}\n` +
      `*(Note: Ye order website database me securely save ho chuka hai)*\n\n` +
      `*Customer:* ${newOrder.customerName}\n` +
      `*Phone:* ${newOrder.customerPhone}\n` +
      `*Address:* ${newOrder.customerAddress}\n` +
      `*Distance:* ${customerDistanceKm} km (${distanceZoneLabel})\n` +
      `*Live GPS Route:* ${googleMapsUrl}\n\n` +
      `*Items Ordered:*\n${itemsList}\n\n` +
      `*Product Total:* ₹${rawSubtotalPrice}\n` +
      `${totalProductDiscount > 0 ? `*Offer Discount:* -₹${totalProductDiscount}\n` : ''}` +
      `*Eligible Amount:* ₹${newOrder.totalAmount}\n` +
      `*Delivery Charge:* ${newOrder.deliveryCharge === 0 ? 'FREE (₹0)' : '₹' + newOrder.deliveryCharge}\n` +
      `${newOrder.coinsUsed > 0 ? `*Loyalty Coins Used:* -₹${newOrder.coinsUsed}\n` : ''}` +
      `*Final Payable Amount:* ₹${newOrder.finalAmount}\n` +
      `*Payment Mode:* ${paymentNote}`;
      `*Payment Mode:* ${paymentNote}`;

    const waLink = `https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_INTL}&text=${encodeURIComponent(waText)}`;
    window.open(waLink, '_blank');
    return newOrder;
  };

  const confirmDelivery = (orderId, nextStatus = 'delivered') => {
    const updated = orders.map(order =>
      order.id === orderId
        ? { ...order, status: nextStatus, deliveryDate: new Date().toISOString() }
        : order
    );
    setOrders(updated);
    localStorage.setItem('ankush_orders', JSON.stringify(updated));

    fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});
  };

  const saveOffers = (newOffers) => {
    setOffers(newOffers);
    localStorage.setItem('ankush_offers', JSON.stringify(newOffers));
  };

  const addOffer = (offerData) => saveOffers([{ ...offerData, id: Date.now() }, ...offers]);
  const toggleOffer = (id) => saveOffers(offers.map(o => (o.id === id ? { ...o, is_active: !o.is_active } : o)));
  const removeOffer = (id) => saveOffers(offers.filter(o => o.id !== id));

  // Store Categories Management
  const [storeCategories, setStoreCategories] = useState(() => {
    const saved = localStorage.getItem('ankush_store_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_STORE_CATEGORIES;
  });

  const saveStoreCategories = (newList) => {
    setStoreCategories(newList);
    localStorage.setItem('ankush_store_categories', JSON.stringify(newList));
  };

  const addStoreCategory = (catData) => {
    const newCat = {
      ...catData,
      id: `cat-${Date.now()}`,
      order: storeCategories.length + 1,
      isActive: true
    };
    const next = [...storeCategories, newCat];
    saveStoreCategories(next);
  };

  const updateStoreCategory = (catId, updatedFields) => {
    const next = storeCategories.map(c => c.id === catId ? { ...c, ...updatedFields } : c);
    saveStoreCategories(next);
  };

  const deleteStoreCategory = (catId) => {
    const next = storeCategories.filter(c => c.id !== catId);
    saveStoreCategories(next);
  };

  const toggleStoreCategory = (catId) => {
    const next = storeCategories.map(c => c.id === catId ? { ...c, isActive: !c.isActive } : c);
    saveStoreCategories(next);
  };

  // Store Banners Management
  const [storeBanners, setStoreBanners] = useState(() => {
    const saved = localStorage.getItem('ankush_store_banners');
    if (saved) {
      try { return { ...DEFAULT_STORE_BANNERS, ...JSON.parse(saved) }; } catch (e) {}
    }
    return DEFAULT_STORE_BANNERS;
  });

  const updateStoreBanner = (bannerKey, updatedFields) => {
    setStoreBanners(prev => {
      const current = prev[bannerKey] || (bannerKey === 'freshFruits' ? prev.bottomFruits : bannerKey === 'premiumVegetables' ? prev.bottomVeg : null) || DEFAULT_STORE_BANNERS[bannerKey] || {};
      const updated = { ...current, ...updatedFields };
      const next = {
        ...prev,
        [bannerKey]: updated
      };
      if (bannerKey === 'freshFruits') next.bottomFruits = updated;
      if (bannerKey === 'premiumVegetables') next.bottomVeg = updated;
      localStorage.setItem('ankush_store_banners', JSON.stringify(next));
      return next;
    });
  };

  const toggleStoreBanner = (bannerKey) => {
    setStoreBanners(prev => {
      const current = prev[bannerKey] || (bannerKey === 'freshFruits' ? prev.bottomFruits : bannerKey === 'premiumVegetables' ? prev.bottomVeg : null) || DEFAULT_STORE_BANNERS[bannerKey] || {};
      const currentlyActive = current.isActive !== false;
      const nextActive = !currentlyActive;
      const next = {
        ...prev,
        [bannerKey]: { ...current, isActive: nextActive }
      };
      if (bannerKey === 'freshFruits') next.bottomFruits = { ...current, isActive: nextActive };
      if (bannerKey === 'premiumVegetables') next.bottomVeg = { ...current, isActive: nextActive };
      localStorage.setItem('ankush_store_banners', JSON.stringify(next));
      return next;
    });
  };

  // Smart Recommendations and Best Sellers
  const recommendedProducts = useMemo(() => {
    return getSmartRecommendations(detailedCartItems, products, 6);
  }, [detailedCartItems, products]);

  const bestSellersProducts = useMemo(() => {
    return getBestSellersList(products, 4);
  }, [products]);

  // Daily Deals Configuration & Product Mapping
  const [dailyDealsConfig, setDailyDealsConfig] = useState(() => {
    const saved = localStorage.getItem('ankush_daily_deals_config');
    if (saved) {
      try { return { ...DEFAULT_DAILY_DEALS_CONFIG, ...JSON.parse(saved) }; } catch (e) {}
    }
    return DEFAULT_DAILY_DEALS_CONFIG;
  });

  const updateDailyDealsConfig = (newFields) => {
    setDailyDealsConfig(prev => {
      const next = { ...prev, ...newFields };
      localStorage.setItem('ankush_daily_deals_config', JSON.stringify(next));
      return next;
    });
  };

  const toggleDailyDealProduct = (productId, discountPercent = 20) => {
    setDailyDealsConfig(prev => {
      const existing = prev.productDeals || [];
      const numId = Number(productId);
      const exists = existing.some(d => Number(d.productId) === numId);
      let updated;
      if (exists) {
        updated = existing.filter(d => Number(d.productId) !== numId);
      } else {
        updated = [...existing, { productId: numId, discountPercent, badge: `${discountPercent}% OFF` }];
      }
      const next = { ...prev, productDeals: updated };
      localStorage.setItem('ankush_daily_deals_config', JSON.stringify(next));
      return next;
    });
  };

  return (
    <StoreContext.Provider value={{
      currentView, setCurrentView,
      isAdminAuth, setIsAdminAuth,
      isLoginModalOpen, setIsLoginModalOpen,
      loginModalInitialTab, setLoginModalInitialTab,
      themeMode, setThemeMode, toggleThemeMode,
      coinFlight, triggerCoinFlyAnimation, walletPulse,
      rashanList, saveRashanList, addFullRashanListToCart,
      watchlistIds, toggleWatchlistProduct,
      storeSettings, updateStoreSettings,
      products, addProduct, updateProduct, deleteProduct, updateProductDiscount, addProductReview,
      activePackageModalProduct, setActivePackageModalProduct,
      customers, currentUser, registerCustomer, loginCustomer, logoutCustomer,
      updateCustomerData, acknowledgeCoinReward, updateCustomerProfile,
      offers: Array.isArray(offers) ? offers : [],
      activeOffers: Array.isArray(offers) ? offers.filter(o => o && o.is_active) : [],
      addOffer, toggleOffer, removeOffer,
      orders: Array.isArray(orders) ? orders : [],
      addOrder, confirmDelivery, fetchOrders,
      getPendingOrders: () => (Array.isArray(orders) ? orders.filter(o => o && (o.status === 'pending' || o.status === 'processing' || o.status === 'packed')) : []),
      getDeliveredOrders: () => (Array.isArray(orders) ? orders.filter(o => o && o.status === 'delivered') : []),
      searchOrdersByName: (q) => (!Array.isArray(orders) ? [] : (!q.trim() ? orders : orders.filter(o => o && (o.customerName?.toLowerCase().includes(q.toLowerCase()) || o.id?.toLowerCase().includes(q.toLowerCase()))))),
      getOrdersByDate: (d) => (Array.isArray(orders) ? orders.filter(o => o && o.orderDate && new Date(o.orderDate).toISOString().split('T')[0] === d) : []),
      getTotalSales: () => (Array.isArray(orders) ? orders.reduce((s, o) => s + (Number(o?.finalAmount) || 0), 0) : 0),
      getSalesByDate: (d) => (Array.isArray(orders) ? orders.filter(o => o && o.orderDate && new Date(o.orderDate).toISOString().split('T')[0] === d).reduce((s, o) => s + (Number(o?.finalAmount) || 0), 0) : 0),
      cartItems: detailedCartItems, addToCart, removeFromCart, updateQuantity, clearCart, repeatLastOrder,
      totalItems, rawSubtotalPrice, totalProductDiscount, totalPrice, deliveryCharge, finalAmount, totalSavings,
      isMinOrderMet, isDistanceEligible, isWithinFreeDeliveryRange,
      amountNeededForMinOrder, amountNeededForFreeDelivery,
      customerDistanceKm, setCustomerDistanceKm, distanceZoneLabel, setDistanceZoneLabel,
      useCoins, setUseCoins, coinsDiscount, coinsEarnedOnOrder, cartBounce,
      isCartOpen, setIsCartOpen, paymentMethod, setPaymentMethod,
      customerName, setCustomerName, customerPhone, setCustomerPhone,
      customerAddress, setCustomerAddress, isCheckoutOpen, setIsCheckoutOpen,
      isReceiptOpen, setIsReceiptOpen, lastOrder, setLastOrder,
      storeCategories, saveStoreCategories, addStoreCategory, updateStoreCategory, deleteStoreCategory, toggleStoreCategory,
      storeBanners, updateStoreBanner, toggleStoreBanner,
      recommendedProducts, bestSellersProducts,
      flyingCartItem, triggerFlyToCart
    }}>
      {children}

      {/* Global Flying Add-To-Cart Item Animation */}
      <AnimatePresence>
        {flyingCartItem && (
          <motion.div
            key={flyingCartItem.id}
            initial={{
              position: 'fixed',
              left: flyingCartItem.startX - 24,
              top: flyingCartItem.startY - 24,
              scale: 1,
              opacity: 1,
              zIndex: 9999
            }}
            animate={{
              left: typeof window !== 'undefined' ? window.innerWidth - 75 : 300,
              top: 24,
              scale: 0.2,
              opacity: 0.2
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-12 h-12 rounded-2xl bg-white shadow-2xl border-2 border-emerald-500 pointer-events-none flex items-center justify-center p-1.5 overflow-hidden"
          >
            {flyingCartItem.img && (flyingCartItem.img.startsWith('http') || flyingCartItem.img.startsWith('data:') || flyingCartItem.img.startsWith('/') || flyingCartItem.img.startsWith('blob:')) ? (
              <img src={flyingCartItem.img} alt="Product" className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl">{flyingCartItem.img || '🛒'}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global 3D Flying Gold Coins Celebration Overlay */}
      <AnimatePresence>
        {coinFlight && (
          <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, idx) => {
              const startX = (idx - 6) * 28;
              const startY = 120 + (idx % 3) * 30;
              return (
                <motion.div
                  key={`${coinFlight.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.3, x: startX, y: startY, rotateY: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.4, 1.25, 0.9, 0.4],
                    x: [startX, startX * 0.4, 260],
                    y: [startY, -40, -320],
                    rotateY: [0, 360, 720]
                  }}
                  transition={{ duration: 1.55, delay: idx * 0.06, ease: "easeInOut" }}
                  className="absolute"
                >
                  <RealGoldCoinIcon size="lg" />
                </motion.div>
              );
            })}

            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.85 }}
              className="bg-slate-950/90 border-2 border-amber-400 text-white px-6 py-3.5 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center gap-3 backdrop-blur-xl"
            >
              <RealGoldCoinIcon size="md" animateSpin={true} />
              <div>
                <p className="text-sm font-black text-amber-300">+{coinFlight.amount} Ankush Gold Coins!</p>
                <p className="text-[11px] text-slate-300 font-semibold">{coinFlight.reason}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StoreContext.Provider>
  );
}