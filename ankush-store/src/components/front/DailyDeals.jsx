import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../StoreContext';
import { ShoppingCart } from '../../components/Icons';

export default function DailyDeals({ onInspectProduct }) {
  const {
    products,
    cartItems,
    addToCart,
    updateQuantity,
    dailyDealsConfig,
    triggerFlyToCart
  } = useStore();

  const [showAllDealsModal, setShowAllDealsModal] = useState(false);

  // Persistent countdown timer linked to dailyDealsConfig and localStorage
  const [timeLeft, setTimeLeft] = useState(() => {
    let targetEnd = dailyDealsConfig?.targetEndTime || (typeof window !== 'undefined' ? localStorage.getItem('ankush_deals_target_end') : null);
    const now = Date.now();
    if (!targetEnd || Number(targetEnd) <= now) {
      const h = Number(dailyDealsConfig?.hours) || 12;
      const m = Number(dailyDealsConfig?.minutes) || 30;
      targetEnd = now + ((h * 3600) + (m * 60)) * 1000;
      if (typeof window !== 'undefined') localStorage.setItem('ankush_deals_target_end', String(targetEnd));
    }
    const diff = Math.max(0, Number(targetEnd) - now);
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      let targetEnd = dailyDealsConfig?.targetEndTime || (typeof window !== 'undefined' ? localStorage.getItem('ankush_deals_target_end') : null);
      const now = Date.now();
      if (!targetEnd || Number(targetEnd) <= now) {
        const h = Number(dailyDealsConfig?.hours) || 12;
        const m = Number(dailyDealsConfig?.minutes) || 30;
        targetEnd = now + ((h * 3600) + (m * 60)) * 1000;
        if (typeof window !== 'undefined') localStorage.setItem('ankush_deals_target_end', String(targetEnd));
      }
      const diff = Math.max(0, Number(targetEnd) - now);
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dailyDealsConfig?.hours, dailyDealsConfig?.minutes, dailyDealsConfig?.targetEndTime]);

  // Compute products that have daily deals configured by Admin
  const configuredDeals = dailyDealsConfig?.productDeals || [];
  const dealProductsMap = new Map();
  configuredDeals.forEach(d => {
    dealProductsMap.set(Number(d.productId), d);
  });

  const dealProducts = products
    .filter(p => dealProductsMap.has(Number(p.id)) || p.discountConfig?.is_active)
    .map(p => {
      const cfg = dealProductsMap.get(Number(p.id));
      const discountPct = cfg ? cfg.discountPercent : 20;
      const dealPrice = Math.round(p.price * (1 - discountPct / 100));
      return {
        ...p,
        dealDiscountPercent: discountPct,
        dealPrice: dealPrice > 0 ? dealPrice : p.price,
        dealBadge: cfg?.badge || `${discountPct}% OFF`
      };
    });

  // Fallback to top 6 products if no custom deals set
  const finalDealProducts = dealProducts.length > 0
    ? dealProducts
    : products.slice(0, 6).map((p, idx) => {
        const discountPct = 20 + ((idx * 5) % 20);
        return {
          ...p,
          dealDiscountPercent: discountPct,
          dealPrice: Math.round(p.price * (1 - discountPct / 100)),
          dealBadge: `${discountPct}% OFF`
        };
      });

  const handleAdd = (prod, e) => {
    const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;
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

  return (
    <section id="daily-deals-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-24">
      
      {/* Deals Header with Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daily Deals</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Limited Time
            </span>
          </h2>
          
          {/* Red Timer Badge (Ends in HH : MM : SS) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black shadow-xs">
            <span>⏰</span>
            <span>Ends in</span>
            <span className="font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded text-[11px] font-black">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded text-[11px] font-black">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded text-[11px] font-black">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* View All Deals Button */}
        <button
          onClick={() => setShowAllDealsModal(true)}
          className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 group"
        >
          <span>View All Deals ({finalDealProducts.length})</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* 6-Column Product Cards Grid (Matching Image 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {finalDealProducts.slice(0, 6).map((prod) => {
          const discountPct = prod.dealDiscountPercent || 20;
          const matchingCartItems = cartItems.filter(it => 
            String(it.productId || it.id?.split('__')?.[0]) === String(prod.id)
          );
          const inCartQty = matchingCartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
          const primaryCartItem = matchingCartItems[0];
          const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between relative group"
            >
              {/* Discount Pill Top-Left */}
              <div className="absolute top-2.5 left-2.5 z-10 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                -{discountPct}%
              </div>

              {/* Product Image on Pure White Background */}
              <div
                onClick={(e) => handleAdd(prod, e)}
                className="w-full h-32 sm:h-36 rounded-xl bg-white flex items-center justify-center p-2 cursor-pointer overflow-hidden"
              >
                {typeof prod.image_url === 'string' && (prod.image_url.startsWith('http') || prod.image_url.startsWith('data:') || prod.image_url.startsWith('/') || prod.image_url.startsWith('blob:')) ? (
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
                    {prod.image_url || '🛒'}
                  </span>
                )}
              </div>

              {/* Details & Pricing */}
              <div className="pt-2">
                <h3
                  onClick={(e) => handleAdd(prod, e)}
                  className="font-bold text-xs text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                  title={prod.name}
                >
                  {prod.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {prod.unit ? `1 ${prod.unit}` : 'Standard Pack'}
                </p>

                {/* Price: Bold Discounted + Strikethrough Base Price */}
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-sm font-black text-slate-900">
                    ₹{prod.dealPrice || prod.price}
                  </span>
                  <span className="text-[11px] text-slate-400 line-through">
                    ₹{prod.price}
                  </span>
                </div>
              </div>

              {/* Add / Stepper Button */}
              <div className="pt-2.5">
                {inCartQty > 0 ? (
                  <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl px-2 py-1 text-xs font-black shadow-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (primaryCartItem) updateQuantity(primaryCartItem.id, inCartQty - 1);
                      }}
                      className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded cursor-pointer font-bold"
                    >
                      −
                    </button>
                    <span>{inCartQty}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (primaryCartItem) {
                          if (triggerFlyToCart) {
                            const rect = e.currentTarget?.getBoundingClientRect();
                            if (rect) triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
                          }
                          updateQuantity(primaryCartItem.id, inCartQty + 1);
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleAdd(prod, e)}
                    className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{hasMultiplePacks ? 'Pack' : 'Add'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ALL DEALS SHOWCASE MODAL (Opened from View All) */}
      <AnimatePresence>
        {showAllDealsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Top Bar */}
              <div className="bg-[#0b4834] text-white p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    <span>🔥 Daily Deals & Special Discounts</span>
                    <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Ends in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                </div>

                <button
                  onClick={() => setShowAllDealsModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>← Back to Store</span>
                </button>
              </div>

              {/* Modal Grid of All Deal Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {finalDealProducts.map((prod) => {
                    const cartEntry = cartItems.find(it => Number(it.productId || it.id) === Number(prod.id));
                    const inCartQty = cartEntry ? cartEntry.quantity : 0;
                    const discountPct = prod.dealDiscountPercent || 20;

                    return (
                      <div
                        key={prod.id}
                        className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200 hover:border-emerald-400 flex flex-col justify-between"
                      >
                        <div className="relative">
                          <span className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                            -{discountPct}%
                          </span>
                          <div className="w-full h-28 bg-white rounded-xl p-2 flex items-center justify-center">
                            {prod.image_url?.startsWith('http') ? (
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-4xl">{prod.image_url || '🛒'}</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{prod.name}</h4>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-black text-slate-900">₹{prod.dealPrice || prod.price}</span>
                            <span className="text-[11px] text-slate-400 line-through">₹{prod.price}</span>
                          </div>
                        </div>

                        <div className="pt-2.5">
                          {inCartQty > 0 ? (
                            <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl px-2 py-1 text-xs font-black">
                              <button onClick={() => updateQuantity(cartEntry.id, inCartQty - 1)} className="w-5 h-5 font-bold cursor-pointer">−</button>
                              <span>{inCartQty} in cart</span>
                              <button onClick={() => updateQuantity(cartEntry.id, inCartQty + 1)} className="w-5 h-5 font-bold cursor-pointer">+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAdd(prod)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Deals are limited to current stock availability in Khorma Store.
                </span>
                <button
                  onClick={() => setShowAllDealsModal(false)}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Done (Continue Shopping)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
