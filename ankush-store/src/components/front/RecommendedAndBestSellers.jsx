import React from 'react';
import { useStore } from '../../StoreContext';
import { ShoppingCart } from '../../components/Icons';

export default function RecommendedAndBestSellers({ onInspectProduct }) {
  const {
    products,
    recommendedProducts,
    bestSellersProducts,
    cartItems,
    addToCart,
    updateQuantity,
    triggerFlyToCart
  } = useStore();

  const recommendations = (recommendedProducts && recommendedProducts.length > 0)
    ? recommendedProducts
    : products.slice(0, 6);

  const bestSellers = (bestSellersProducts && bestSellersProducts.length > 0)
    ? bestSellersProducts
    : products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* LEFT COLUMN: Recommended for You (Smart "Jodi" Engine) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Recommended for You</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Smart Pair
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Popular companion items tailored to your grocery list
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('main-products-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          {/* Grid of Recommended Products (Matching Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {recommendations.map(prod => {
              const matchingCartItems = cartItems.filter(it => 
                String(it.productId || it.id?.split('__')?.[0]) === String(prod.id)
              );
              const cartQty = matchingCartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
              const primaryCartItem = matchingCartItems[0];
              const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;

              const handleItemAdd = (e) => {
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

              // Admin live offer badge
              const dc = prod.discountConfig;
              const isOfferActive = dc && dc.isActive;
              let offerBadgeText = '';
              if (isOfferActive) {
                offerBadgeText = dc.offerType === 'BOGO' ? '🔥 BOGO' : (dc.badgeText || 'SPECIAL');
              } else if (prod.mrp && prod.mrp > prod.price) {
                const calcPct = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
                if (calcPct > 0) offerBadgeText = `-${calcPct}%`;
              }

              return (
                <div
                  key={prod.id}
                  className="bg-slate-50/70 hover:bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  {offerBadgeText && (
                    <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      {offerBadgeText}
                    </div>
                  )}

                  {/* Image with Pure White Backdrop */}
                  <div
                    onClick={() => onInspectProduct && onInspectProduct(prod)}
                    className="w-full h-28 sm:h-32 rounded-xl bg-white flex items-center justify-center p-2 cursor-pointer overflow-hidden border border-slate-100"
                  >
                    {typeof prod.image_url === 'string' && (prod.image_url.startsWith('http') || prod.image_url.startsWith('data:') || prod.image_url.startsWith('/') || prod.image_url.startsWith('blob:')) ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {prod.image_url || '🛒'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="pt-2">
                    <h3
                      onClick={() => onInspectProduct && onInspectProduct(prod)}
                      className="font-bold text-xs text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {prod.unit ? `1 ${prod.unit}` : '1 pack'}
                    </p>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      ₹{prod.price}
                    </p>
                  </div>

                  {/* Green Cart Icon Button */}
                  <div className="pt-2.5">
                    {cartQty > 0 ? (
                      <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl px-2 py-1 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => {
                            if (primaryCartItem) updateQuantity(primaryCartItem.id, cartQty - 1);
                          }}
                          className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span>{cartQty}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            if (primaryCartItem) {
                              if (triggerFlyToCart) {
                                const rect = e.currentTarget?.getBoundingClientRect();
                                if (rect) triggerFlyToCart(rect.left + rect.width / 2, rect.top, prod.image_url);
                              }
                              updateQuantity(primaryCartItem.id, cartQty + 1);
                            }
                          }}
                          className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleItemAdd}
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        title="Add to cart"
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
        </div>

        {/* RIGHT COLUMN: Best Sellers Ranked List (#1, #2, #3, #4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Best Sellers
            </h2>
            <button
              onClick={() => {
                const el = document.getElementById('main-products-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          {/* Ranked List Matching Image 1 */}
          <div className="space-y-3">
            {bestSellers.map((prod, idx) => {
              const matchingCartItems = cartItems.filter(item => 
                String(item.productId || item.id?.split('__')?.[0]) === String(prod.id)
              );
              const cartQty = matchingCartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
              const hasMultiplePacks = Array.isArray(prod.packages) && prod.packages.length > 1;

              const handleItemAdd = (e) => {
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
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Number Badge (#1, #2, #3, #4) */}
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    {/* Small Thumbnail on White */}
                    <div
                      onClick={() => onInspectProduct && onInspectProduct(prod)}
                      className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                    >
                      {typeof prod.image_url === 'string' && (prod.image_url.startsWith('http') || prod.image_url.startsWith('data:') || prod.image_url.startsWith('/') || prod.image_url.startsWith('blob:')) ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-2xl">{prod.image_url || '🛒'}</span>
                      )}
                    </div>

                    {/* Product Name & Price */}
                    <div className="min-w-0">
                      <h4
                        onClick={() => onInspectProduct && onInspectProduct(prod)}
                        className="font-bold text-xs text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {prod.unit ? `1 ${prod.unit}` : 'Standard'}
                      </p>
                      <p className="text-xs font-black text-slate-900">
                        ₹{prod.price}
                      </p>
                    </div>
                  </div>

                  {/* Green Cart Icon Button */}
                  <div className="shrink-0 ml-2">
                    {cartQty > 0 ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[11px]">
                        {cartQty} in cart
                      </span>
                    ) : (
                      <button
                        onClick={handleItemAdd}
                        className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
