import React from 'react';
import { useStore } from '../../StoreContext';

export default function DualOfferBanners({ onSelectCategory }) {
  const { storeBanners } = useStore();
  const fruits = storeBanners?.freshFruits || storeBanners?.bottomFruits;
  const veg = storeBanners?.premiumVegetables || storeBanners?.bottomVeg;

  const showFruits = Boolean(fruits && fruits.isActive !== false);
  const showVeg = Boolean(veg && veg.isActive !== false);

  if (!showFruits && !showVeg) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Banner 1: Fresh Fruits (Warm Orange Theme or Full Poster Image) */}
        {showFruits && (
          <div
            className={`${
              !showVeg ? 'md:col-span-2' : ''
            } relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] shadow-md group`}
          >
            {fruits.fullBannerImage && (fruits.fullBannerImageUrl || fruits.imageUrl) ? (
              <div
                onClick={() => onSelectCategory && onSelectCategory(fruits.categoryLink || 'Groceries')}
                className="w-full h-48 sm:h-56 relative cursor-pointer overflow-hidden"
              >
                <img
                  src={fruits.fullBannerImageUrl || fruits.imageUrl}
                  alt={fruits.title || 'Fresh Fruits'}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {fruits.discountBadge && (
                  <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-300 px-3 py-1 rounded-full shadow-md">
                    {fruits.discountBadge}
                  </span>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-white flex items-center justify-between gap-4">
                <div className="space-y-3 z-10 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-300 px-3 py-1 rounded-full inline-block shadow-sm">
                    {fruits.discountBadge || 'UP TO 25% OFF'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {fruits.title || 'Fresh Fruits for a Brighter You'}
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium">
                    {fruits.subtitle || 'Sweet seasonal fruits & pure nourishment'}
                  </p>
                  <button
                    onClick={() => onSelectCategory(fruits.categoryLink || 'Groceries')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-white text-orange-900 hover:bg-orange-50 font-black text-xs transition-colors cursor-pointer shadow inline-flex items-center gap-1"
                  >
                    <span>{fruits.buttonText || 'Shop More →'}</span>
                  </button>
                </div>

                {/* Visual */}
                <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden bg-white/15 p-1 shadow-inner">
                  <img
                    src={fruits.imageUrl || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80'}
                    alt="Fresh Fruits"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banner 2: Premium Vegetables (Fresh Green Theme or Full Poster Image) */}
        {showVeg && (
          <div
            className={`${
              !showFruits ? 'md:col-span-2' : ''
            } relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] shadow-md group`}
          >
            {veg.fullBannerImage && (veg.fullBannerImageUrl || veg.imageUrl) ? (
              <div
                onClick={() => onSelectCategory && onSelectCategory(veg.categoryLink || 'Groceries')}
                className="w-full h-48 sm:h-56 relative cursor-pointer overflow-hidden"
              >
                <img
                  src={veg.fullBannerImageUrl || veg.imageUrl}
                  alt={veg.title || 'Premium Vegetables'}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {veg.discountBadge && (
                  <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200 px-3 py-1 rounded-full shadow-md">
                    {veg.discountBadge}
                  </span>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-white flex items-center justify-between gap-4">
                <div className="space-y-3 z-10 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200 px-3 py-1 rounded-full inline-block shadow-sm">
                    {veg.discountBadge || 'UP TO 30% OFF'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {veg.title || 'Premium Vegetables Naturally Better'}
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                    {veg.subtitle || 'Direct farm harvested morning fresh picks'}
                  </p>
                  <button
                    onClick={() => onSelectCategory(veg.categoryLink || 'Groceries')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs transition-colors cursor-pointer shadow inline-flex items-center gap-1"
                  >
                    <span>{veg.buttonText || 'Shop More →'}</span>
                  </button>
                </div>

                {/* Visual */}
                <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden bg-white/15 p-1 shadow-inner">
                  <img
                    src={veg.imageUrl || 'https://images.unsplash.com/photo-1597362076708-5162a0c4400d?auto=format&fit=crop&w=600&q=80'}
                    alt="Premium Vegetables"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
