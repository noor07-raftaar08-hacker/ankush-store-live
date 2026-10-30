import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, RealGoldCoinIcon, SHOP_WHATSAPP_NUMBER } from '../../StoreContext';
import { Search, ShoppingCart, User, Menu } from '../../components/Icons';

export default function MobileStoreView({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onInspectProduct
}) {
  const {
    products,
    cartItems,
    addToCart,
    updateQuantity,
    triggerFlyToCart,
    totalItems,
    finalAmount,
    setIsCartOpen,
    storeCategories,
    storeBanners,
    currentUser,
    setIsLoginModalOpen,
    setLoginModalInitialTab,
    setCurrentView
  } = useStore();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const activeCategories = storeCategories
    .filter(c => c.isActive !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  // Filter products by selectedCategory & searchQuery
  const filteredProducts = products.filter(p => {
    const matchCat =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      (selectedCategory === 'Groceries' && p.category === 'Groceries') ||
      (selectedCategory === 'Cold Drinks' && p.category === 'Cold Drinks') ||
      (selectedCategory === 'Household' && p.category === 'Household');

    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q));

    return matchCat && matchQ;
  });

  return (
    <div className="md:hidden min-h-screen bg-[#f8faf9] pb-24 text-slate-900 select-none">
      
      {/* 1. COMPACT MOBILE APP HEADER (Matching Image 2) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-base shadow">
              🥬
            </div>
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight leading-none">
                Ankush <span className="text-emerald-600">General Store</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-700 block leading-none">
                Khorma, Pratappur • Taaza Rashan
              </span>
            </div>
          </div>

          {/* Right: Coins / Login + Cart Badge */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => setCurrentView('account')}
                className="px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-black text-[11px] flex items-center gap-1"
              >
                <RealGoldCoinIcon size="sm" />
                <span>{currentUser.coins || 0}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginModalInitialTab('customer');
                  setIsLoginModalOpen(true);
                }}
                className="p-1.5 rounded-xl text-slate-600 hover:text-emerald-600"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-emerald-600 text-white shadow"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Input (Matching Image 2) */}
        <div className="mt-2.5">
          <div className="flex items-center bg-slate-100/90 border border-slate-200/90 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-emerald-600 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search for grocery, staples, cold drinks..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full text-xs text-slate-800 bg-transparent placeholder-slate-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL HERO BANNER (Matching Image 2) */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#eef9f2] via-[#e2f5e9] to-[#d6f0df] border border-emerald-100 p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-600/15 px-2 py-0.5 rounded-full inline-block">
              Daily Offers
            </span>
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              Promotional banner fresh vegetables
            </h3>
            <button
              onClick={() => onCategoryChange('Groceries')}
              className="text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-xl shadow-xs inline-flex items-center gap-1"
            >
              <span>Shop now →</span>
            </button>
          </div>

          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/70 p-1 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80"
              alt="Fresh vegetables"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-1.5 pt-2">
          <div className="w-5 h-1.5 rounded-full bg-emerald-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* 3. CATEGORIES CAPSULES HORIZONTAL SCROLL (Matching Image 2) */}
      <div className="pt-3 pb-2">
        <div className="px-4 flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-black text-slate-900">Categories</h3>
          <button
            onClick={() => onCategoryChange('All')}
            className="text-[11px] font-bold text-emerald-600"
          >
            View All
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto px-4 no-scrollbar pb-1">
          <button
            onClick={() => onCategoryChange('All')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl shrink-0 min-w-[70px] border transition-all ${
              selectedCategory === 'All'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg mb-1">
              ✨
            </div>
            <span className="text-[10px] text-center font-bold">All</span>
          </button>

          {activeCategories.map(cat => {
            const isSel = selectedCategory === (cat.slug || cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.slug || cat.name)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl shrink-0 min-w-[72px] border transition-all ${
                  isSel
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-1 mb-1 overflow-hidden">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-center font-bold truncate max-w-[68px]">
                  {cat.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 2-COLUMN CLEAN SQUARE PRODUCT GRID (Matching Image 2 - Top 10 + Show More) */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-black text-slate-900">
            {selectedCategory === 'All' ? 'Popular Items' : selectedCategory} ({filteredProducts.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(isMobileExpanded ? filteredProducts : filteredProducts.slice(0, 10)).map(prod => {
            const matchingCartItems = cartItems.filter(it => 
              String(it.productId || it.id?.split('__')?.[0]) === String(prod.id)
            );
            const qty = matchingCartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
            const primaryCartItem = matchingCartItems[0];
            const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;

            const handleMobileAdd = (e) => {
              if (hasMultiplePacks && onInspectProduct) {
                onInspectProduct(prod);
              } else {
                if (e && triggerFlyToCart) {
                  const rect = e.currentTarget?.getBoundingClientRect();
                  if (rect) triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
                }
                addToCart(prod, null, 1);
              }
            };

            // Real Live Offer / Discount Badge
            const dc = prod.discountConfig;
            const isOfferActive = dc && dc.isActive;
            let offerBadgeText = '';
            let offerBadgeStyle = 'bg-rose-500 text-white';

            if (isOfferActive) {
              if (dc.offerType === 'BOGO') {
                offerBadgeText = '🔥 BOGO';
                offerBadgeStyle = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
              } else if (dc.offerType === 'QUANTITY_BASED') {
                offerBadgeText = dc.badgeText || '⚡ DEAL';
                offerBadgeStyle = 'bg-emerald-600 text-white';
              } else if (dc.offerType === 'CUSTOM') {
                offerBadgeText = dc.percentDiscount > 0 ? `${dc.percentDiscount}% OFF` : `₹${dc.flatDiscountAmount} OFF`;
                offerBadgeStyle = 'bg-purple-600 text-white';
              } else if (dc.badgeText) {
                offerBadgeText = dc.badgeText;
              }
            } else if (prod.mrp && prod.mrp > prod.price) {
              const calcPct = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
              if (calcPct > 0) {
                offerBadgeText = `-${calcPct}%`;
                offerBadgeStyle = 'bg-rose-500 text-white';
              }
            }

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between relative"
              >
                {/* Offer Badge */}
                {offerBadgeText && (
                  <div className={`absolute top-2 left-2 z-10 ${offerBadgeStyle} text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs max-w-[85px] truncate`}>
                    {offerBadgeText}
                  </div>
                )}

                {/* Product Thumbnail on White Background */}
                <div
                  onClick={() => onInspectProduct && onInspectProduct(prod)}
                  className="w-full h-28 rounded-xl bg-white flex items-center justify-center p-2 cursor-pointer overflow-hidden"
                >
                  {typeof prod.image_url === 'string' && (prod.image_url.startsWith('http') || prod.image_url.startsWith('data:') || prod.image_url.startsWith('/') || prod.image_url.startsWith('blob:')) ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-4xl">{prod.image_url || '🛒'}</span>
                  )}
                </div>

                {/* Name & Pack Weight */}
                <div className="pt-2">
                  <h4
                    onClick={() => onInspectProduct && onInspectProduct(prod)}
                    className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight"
                  >
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {hasMultiplePacks
                      ? `${prod.packages.length} packs`
                      : (prod.unit ? `1 ${prod.unit}` : 'Standard pack')}
                  </p>
                </div>

                {/* Price and Square Green Add Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    ₹{prod.price}
                  </span>

                  {qty > 0 ? (
                    <div className="flex items-center bg-emerald-600 text-white rounded-xl px-1.5 py-1 text-xs font-black">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (primaryCartItem) updateQuantity(primaryCartItem.id, qty - 1);
                        }}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-1.5 tabular-nums">{qty}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (primaryCartItem) {
                            if (triggerFlyToCart) {
                              const rect = e.currentTarget?.getBoundingClientRect();
                              if (rect) triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
                            }
                            updateQuantity(primaryCartItem.id, qty + 1);
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMobileAdd}
                      className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm active:scale-90 transition-transform cursor-pointer"
                      title="Add"
                    >
                      +
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Mobile Show More / Show Less Button */}
        {filteredProducts.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className="w-full py-2.5 rounded-xl bg-white border border-emerald-600/30 text-emerald-800 font-bold text-xs shadow-xs"
            >
              {isMobileExpanded
                ? 'Show Less ↑'
                : `Show More Products (${filteredProducts.length - 10} aur saman) ↓`}
            </button>
          </div>
        )}
      </div>

      {/* 5. STICKY FLOATING CART BAR AT BOTTOM (If Cart Has Items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                {totalItems} items in cart
              </span>
              <span className="text-base font-black text-slate-900 tabular-nums">
                ₹{Number(finalAmount).toFixed(0)}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-700/30 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>View Cart & Checkout →</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
