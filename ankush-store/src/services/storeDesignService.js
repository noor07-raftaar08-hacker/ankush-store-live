// Store Design, Banners, Categories & Smart Pairing Engine

export const DEFAULT_STORE_CATEGORIES = [
  {
    id: 'cat-fruits-veg',
    name: 'Fruits & Vegetables',
    slug: 'Fruits & Vegetables',
    itemCount: '35+ Fresh Items',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80',
    order: 1,
    isActive: true
  },
  {
    id: 'cat-dairy-eggs',
    name: 'Dairy & Eggs',
    slug: 'Dairy & Eggs',
    itemCount: '20+ Items',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
    order: 2,
    isActive: true
  },
  {
    id: 'cat-bakery',
    name: 'Bakery',
    slug: 'Bakery',
    itemCount: '15+ Breads & Buns',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    order: 3,
    isActive: true
  },
  {
    id: 'cat-meat-seafood',
    name: 'Meat & Seafood',
    slug: 'Meat & Seafood',
    itemCount: '10+ Fresh Cuts',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=300&q=80',
    order: 4,
    isActive: true
  },
  {
    id: 'cat-pantry-staples',
    name: 'Pantry & Staples',
    slug: 'Groceries',
    itemCount: 'Rice, Oils, Atta & Dal',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    order: 5,
    isActive: true
  },
  {
    id: 'cat-snacks-choc',
    name: 'Snacks & Chocolates',
    slug: 'Snacks',
    itemCount: 'Biscuits, Namkeen & Chips',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
    order: 6,
    isActive: true
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'Cold Drinks',
    itemCount: 'Juices, Sodas & Water',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80',
    order: 7,
    isActive: true
  },
  {
    id: 'cat-household',
    name: 'Household Essentials',
    slug: 'Household',
    itemCount: 'Soaps, Cleaners & Care',
    imageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=300&q=80',
    order: 8,
    isActive: true
  }
];

export const DEFAULT_STORE_BANNERS = {
  hero: {
    id: 'hero-1',
    title: 'Freshness Delivered Daily',
    subtitle: 'Farm-fresh groceries for a healthier, happier you.',
    badge: 'FRESH FOOD BRIGHTER DAYS',
    buttonText: 'Shop Now →',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    fullBannerImage: false,
    fullBannerImageUrl: '',
    isActive: true
  },
  seasonalBest: {
    id: 'season-1',
    title: "Season's Best Fresh & Healthy",
    subtitle: 'Farm to your home with 100% purity guaranteed.',
    buttonText: 'Shop More →',
    discountBadge: 'UP TO 30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    categoryLink: 'Groceries',
    fullBannerImage: false,
    isActive: true
  },
  healthyChoices: {
    id: 'healthy-1',
    title: 'Healthy Choices Happier Families',
    subtitle: 'Nutritious fruits, avocado & fresh cold refreshments.',
    buttonText: 'Shop More →',
    discountBadge: 'HEALTHY ESSENTIALS',
    imageUrl: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
    categoryLink: 'Cold Drinks',
    fullBannerImage: false,
    isActive: true
  },
  freshFruits: {
    id: 'fruits-banner',
    title: 'Fresh Fruits for a Brighter You',
    subtitle: 'Sweet seasonal fruits & pure refreshment.',
    buttonText: 'Shop More →',
    discountBadge: 'UP TO 25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
    categoryLink: 'Groceries',
    fullBannerImage: false,
    isActive: true
  },
  premiumVegetables: {
    id: 'veg-banner',
    title: 'Premium Vegetables Naturally Better',
    subtitle: 'Daily morning fresh farm harvests for your kitchen.',
    buttonText: 'Shop More →',
    discountBadge: 'UP TO 30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1597362076708-5162a0c4400d?auto=format&fit=crop&w=800&q=80',
    categoryLink: 'Groceries',
    fullBannerImage: false,
    isActive: true
  }
};

export const DEFAULT_DAILY_DEALS_CONFIG = {
  isActive: true,
  hours: 12,
  minutes: 30,
  seconds: 0,
  targetEndTime: null, // ISO string or null
  productDeals: [
    { productId: 1, discountPercent: 20, badge: '20% OFF' },
    { productId: 2, discountPercent: 25, badge: '25% OFF' },
    { productId: 3, discountPercent: 15, badge: '15% OFF' },
    { productId: 5, discountPercent: 30, badge: '30% OFF' },
    { productId: 11, discountPercent: 25, badge: '25% OFF' },
    { productId: 15, discountPercent: 20, badge: '20% OFF' }
  ]
};

// Customer Testimonials (Matching Image 1)
export const DEFAULT_CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: 'Ayesha K.',
    city: 'Pratappur',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    quote: 'Great quality and super fast delivery! Ankush Store makes grocery shopping so easy and reliable.'
  },
  {
    id: 2,
    name: 'Bilal S.',
    city: 'Khorma',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    quote: 'Fresh fruits and vegetables every time. Sahi daam aur turant WhatsApp delivery notification aati hai!'
  },
  {
    id: 3,
    name: 'Sara M.',
    city: 'Surajpur',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    quote: 'Amazing service and fresh products. My go-to grocery store in the whole area. Highly recommended!'
  }
];

// Smart Pairing Association Rules
const PAIR_ASSOCIATIONS = {
  rice: ['dal', 'oil', 'haldi', 'salt'],
  chawal: ['dal', 'oil', 'haldi'],
  atta: ['oil', 'salt', 'ghee'],
  dal: ['rice', 'oil', 'chilli', 'turmeric'],
  sugar: ['tea', 'chai', 'milk', 'biscuits'],
  tea: ['sugar', 'milk', 'biscuits'],
  chai: ['sugar', 'milk', 'biscuits'],
  oil: ['atta', 'dal', 'rice', 'spices'],
  surf: ['vim', 'dettol', 'soap'],
  soap: ['shampoo', 'toothpaste'],
  coke: ['chips', 'namkeen', 'snacks'],
  pepsi: ['chips', 'namkeen', 'snacks'],
  sprite: ['chips', 'namkeen'],
  juice: ['water', 'biscuits'],
  biscuits: ['tea', 'chai', 'milk']
};

/**
 * Intelligent Smart Recommendation / "Jodi" Engine
 * Returns natural companions for products in cart or browsed.
 */
export function getSmartRecommendations(cartItems = [], allProducts = [], limit = 6) {
  if (!allProducts || allProducts.length === 0) return [];

  const cartProductIds = new Set(cartItems.map(item => Number(item.id)));
  const cartNames = cartItems.map(item => (item.name || '').toLowerCase());
  const scoredProducts = [];

  // Find paired keywords
  const targetKeywords = new Set();
  cartNames.forEach(name => {
    Object.entries(PAIR_ASSOCIATIONS).forEach(([key, companions]) => {
      if (name.includes(key)) {
        companions.forEach(c => targetKeywords.add(c));
      }
    });
  });

  allProducts.forEach(prod => {
    if (cartProductIds.has(Number(prod.id))) return; // Already in cart

    let score = (Number(prod.soldCount) || 10) * 0.1; // Baseline popularity
    const pName = (prod.name || '').toLowerCase();
    const pCat = (prod.category || '').toLowerCase();

    // Check keyword pairings
    for (const kw of targetKeywords) {
      if (pName.includes(kw)) {
        score += 50;
      }
    }

    // Category affinity
    if (cartItems.some(it => it.category === prod.category)) {
      score += 15;
    }

    scoredProducts.push({ prod, score });
  });

  // Sort by recommendation score descending
  scoredProducts.sort((a, b) => b.score - a.score);

  // Return top products
  const results = scoredProducts.slice(0, limit).map(item => item.prod);

  // If results are fewer than limit, fill with popular items not in cart
  if (results.length < limit) {
    const existingIds = new Set(results.map(p => p.id));
    const fallback = allProducts
      .filter(p => !cartProductIds.has(Number(p.id)) && !existingIds.has(p.id))
      .sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0));
    results.push(...fallback.slice(0, limit - results.length));
  }

  return results;
}

/**
 * Best Sellers calculation: Sorted strictly by soldCount and order frequency
 */
export function getBestSellersList(allProducts = [], limit = 4) {
  if (!allProducts || allProducts.length === 0) return [];
  return [...allProducts]
    .sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0))
    .slice(0, limit);
}
