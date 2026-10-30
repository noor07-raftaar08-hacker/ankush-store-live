import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../StoreContext';

export default function FreshHeroBanner({ onShopClick }) {
  const { storeBanners } = useStore();
  const hero = storeBanners?.hero || {};

  if (hero.isActive === false) return null;

  const handleAction = () => {
    if (onShopClick) {
      onShopClick();
    } else {
      const el = document.getElementById('main-products-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. FULL BANNER IMAGE MODE (If Admin chooses to show full custom banner graphic)
  if (hero.fullBannerImage && (hero.fullBannerImageUrl || hero.imageUrl)) {
    const bannerSrc = hero.fullBannerImageUrl || hero.imageUrl;
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div
          onClick={handleAction}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-emerald-200/70 shadow-sm cursor-pointer group"
        >
          <img
            src={bannerSrc}
            alt={hero.title || 'Store Banner'}
            className="w-full h-auto min-h-[180px] max-h-[380px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
          />
          {hero.buttonText && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(); }}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
              >
                {hero.buttonText || 'Shop Now →'}
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 2. STANDARD EDITABLE HERO BANNER WITH BADGE & IMAGE
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-[#eef9f2] via-[#e2f5e9] to-[#d6f0df] border border-emerald-100 shadow-sm p-6 sm:p-10 md:p-12">
        
        {/* Soft Ambient Glow Elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text Content */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6 text-center md:text-left">
            
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-600/15 text-emerald-800 border border-emerald-600/20 text-xs font-black uppercase tracking-wider">
              <span>🌱 100% Farm Fresh & Daily Quality</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              {hero.title || 'Freshness Delivered Daily'}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
              {hero.subtitle || 'Farm-fresh groceries, taaza atta, dal, cold drinks aur gharelu saman for a healthier, happier you.'}
            </p>

            {/* Action Button */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAction}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-700/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{hero.buttonText || 'Shop Now →'}</span>
              </motion.button>

              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                • Fast Delivery in Khorma & Pratappur
              </span>
            </div>

            {/* 3 Pills Below */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span>🥬</span> Fresh Quality
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span>💰</span> Great Prices
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span>🚚</span> Fast Delivery
              </span>
            </div>

          </div>

          {/* Right Visual Image with Fresh Food Badge */}
          <div className="md:col-span-5 flex items-center justify-center relative">
            <div className="relative max-w-md w-full">
              
              {/* Product Visual Container with Clean White Backdrop */}
              <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-white p-3 shadow-xl border border-emerald-100 flex items-center justify-center overflow-hidden">
                <img
                  src={hero.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                  alt="Fresh groceries bag"
                  className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Round Badge: FRESH FOOD BRIGHTER DAYS */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-700 to-green-500 p-1 text-white shadow-xl flex flex-col items-center justify-center text-center font-black leading-tight border-2 border-white select-none rotate-6">
                <span className="text-[10px] sm:text-xs tracking-wider uppercase">FRESH</span>
                <span className="text-xs sm:text-sm text-yellow-300">FOOD</span>
                <span className="text-[9px] sm:text-[10px] tracking-widest text-emerald-100">BRIGHTER</span>
                <span className="text-[9px] sm:text-[10px]">DAYS</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
