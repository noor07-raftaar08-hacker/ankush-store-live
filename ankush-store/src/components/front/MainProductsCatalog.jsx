import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../StoreContext';
import { ShoppingCart } from '../../components/Icons';

export default function MainProductsCatalog({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onInspectProduct
}) {
  const {
    products,
    cartItems,
    addToCart,
    updateQuantity,
    triggerFlyToCart
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [addedToastId, setAddedToastId] = useState(null);

  // Filter products by selectedCategory & searchQuery
  const filteredProducts = products.filter(prod => {
    // Category Match
    let matchCat = true;
    if (selectedCategory && selectedCategory !== 'All') {
      const sCat = selectedCategory.toLowerCase();
      const pCat = (prod.category || '').toLowerCase();
      matchCat = pCat.includes(sCat) || sCat.includes(pCat);
    }

    // Search Query Match
    let matchSearch = true;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const pName = (prod.name || '').toLowerCase();
      const pCat = (prod.category || '').toLowerCase();
      matchSearch = pName.includes(q) || pCat.includes(q);
    }

    return matchCat && matchSearch;
  });

  // Sort by popular / bestseller first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.bestseller && !b.bestseller) return -1;
    if (!a.bestseller && b.bestseller) return 1;
    return (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0);
  });

  // Top 10 limit unless expanded
  const displayedProducts = isExpanded ? sortedProducts : sortedProducts.slice(0, 10);
  const totalCount = sortedProducts.length;
  const remainingCount = Math.max(0, totalCount - 10);

  const handleAdd = (prod, e) => {
    const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;
    if (hasMultiplePacks && onInspectProduct) {
      onInspectProduct(prod);
    } else {
      if (e) {
        const rect = e.currentTarget?.getBoundingClientRect();
        if (rect && triggerFlyToCart) {
          triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
        }
      }
      addToCart(prod, null, 1);
      setAddedToastId(prod.id);
      setTimeout(() => setAddedToastId(null), 1200);
    }
  };

  return (
    <section id="main-products-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Taaza Groceries & Daily Essentials' : `${selectedCategory}`}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {totalCount} Items Available
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1">
            {searchQuery
              ? `Showing matching grocery items from Ankush Store`
              : selectedCategory === 'All'
              ? `Top selling groceries, taaza atta, dal, masale aur cold drinks`
              : `Showing all items in ${selectedCategory}`}
          </p>
        </div>

        {/* Clear Filters if Active */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Clear Search ✕
              </button>
            )}
            {selectedCategory !== 'All' && (
              <button
                onClick={() => onSelectCategory('All')}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                All Products ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalCount === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <span className="text-5xl block">🔍</span>
          <h3 className="text-lg font-bold text-slate-800">Koi saman nahi mila</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aapne jo search kiya wo abhi uplabdh nahi hai. Kripya doosra naam search karein ya All Products dekhein.
          </p>
          <button
            onClick={() => {
              if (onClearSearch) onClearSearch();
              onSelectCategory('All');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <>
          {/* Products Grid (5-column Desktop / 2-column Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {displayedProducts.map(prod => {
              const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;

              // Strictly isolated matching cart items for this product only
              const matchingCartItems = cartItems.filter(it => 
                String(it.productId || it.id?.split('__')?.[0]) === String(prod.id)
              );
              const inCartQty = matchingCartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
              const primaryCartItem = matchingCartItems[0];

              // Admin configured offer detection
              const dc = prod.discountConfig;
              const isOfferActive = dc && dc.isActive;
              let offerBadgeText = '';
              let offerBadgeStyle = 'bg-rose-500 text-white';

              if (isOfferActive) {
                if (dc.offerType === 'BOGO') {
                  const bQ = dc.bogoConfig?.buyQty || 1;
                  const gQ = dc.bogoConfig?.getFreeQty || 1;
                  offerBadgeText = `🔥 BUY ${bQ} GET ${gQ} FREE`;
                  offerBadgeStyle = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs';
                } else if (dc.offerType === 'QUANTITY_BASED') {
                  offerBadgeText = `⚡ ${dc.badgeText || 'COMBO OFFER'}`;
                  offerBadgeStyle = 'bg-emerald-600 text-white shadow-xs';
                } else if (dc.offerType === 'CUSTOM') {
                  if (Number(dc.percentDiscount) > 0) {
                    offerBadgeText = `💥 ${dc.percentDiscount}% OFF`;
                  } else if (Number(dc.flatDiscountAmount) > 0) {
                    offerBadgeText = `💥 ₹${dc.flatDiscountAmount} OFF`;
                  } else {
                    offerBadgeText = dc.badgeText || 'SPECIAL OFFER';
                  }
                  offerBadgeStyle = 'bg-purple-600 text-white shadow-xs';
                } else if (dc.badgeText) {
                  offerBadgeText = dc.badgeText;
                  offerBadgeStyle = 'bg-rose-600 text-white shadow-xs';
                }
              } else if (prod.mrp && prod.mrp > prod.price) {
                const calcPct = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
                if (calcPct > 0) {
                  offerBadgeText = `-${calcPct}%`;
                  offerBadgeStyle = 'bg-rose-500 text-white';
                }
              }

              const mrpVal = prod.mrp && prod.mrp > prod.price ? prod.mrp : null;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg shadow-xs transition-all duration-200 flex flex-col justify-between relative group"
                >
                  {/* Real Live Offer / Discount Badge */}
                  {offerBadgeText && (
                    <div className={`absolute top-2.5 left-2.5 z-10 ${offerBadgeStyle} text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1`}>
                      <span>{offerBadgeText}</span>
                    </div>
                  )}

                  {/* Added Flash Toast */}
                  {addedToastId === prod.id && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs animate-bounce">
                      ✓ Added!
                    </div>
                  )}

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

                  {/* Product Details */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {prod.category || 'Grocery'}
                    </span>
                    <h3
                      onClick={(e) => handleAdd(prod, e)}
                      className="font-bold text-xs sm:text-sm text-slate-900 truncate hover:text-emerald-700 cursor-pointer mt-0.5"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {hasMultiplePacks
                        ? `${prod.packages.length} Pack Options`
                        : (prod.unit ? `1 ${prod.unit}` : 'Standard Pack')}
                    </p>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        ₹{prod.price}
                      </span>
                      {mrpVal && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{mrpVal}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action / Stepper */}
                  <div className="pt-3">
                    {inCartQty > 0 ? (
                      <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl px-2.5 py-1.5 text-xs font-black shadow-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (primaryCartItem) updateQuantity(primaryCartItem.id, inCartQty - 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer font-extrabold text-sm"
                        >
                          −
                        </button>
                        <span className="tabular-nums font-black">{inCartQty} in cart</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (primaryCartItem) {
                              const rect = e.currentTarget?.getBoundingClientRect();
                              if (rect && triggerFlyToCart) {
                                triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
                              }
                              updateQuantity(primaryCartItem.id, inCartQty + 1);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-emerald-700 rounded-lg cursor-pointer font-extrabold text-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAdd(prod, e)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{hasMultiplePacks ? 'Choose Pack' : 'Add to Cart'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less Toggle Button */}
          {totalCount > 10 && (
            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  if (isExpanded) {
                    const el = document.getElementById('main-products-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-3 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-emerald-600/30 hover:border-emerald-600 text-emerald-800 font-black text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isExpanded ? (
                  <>
                    <span>Show Less ↑ (Collapse to Top 10)</span>
                  </>
                ) : (
                  <>
                    <span>Show More Products ({remainingCount} aur saman) ↓</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </>
      )}

    </section>
  );
}
