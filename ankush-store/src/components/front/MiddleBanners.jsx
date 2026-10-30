import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../StoreContext';

export default function MiddleBanners({ onSelectCategory }) {
  const { storeBanners } = useStore();
  const left = storeBanners?.seasonalBest;
  const right = storeBanners?.healthyChoices;

  const showLeft = left && left.isActive !== false;
  const showRight = right && right.isActive !== false;

  if (!showLeft && !showRight) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Banner 1: Season's Best Fresh & Healthy */}
        {showLeft && (
          <div
            className={`${
              showRight ? 'md:col-span-8' : 'md:col-span-12'
            } relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#175239] via-[#1a6245] to-[#257d59] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-600/30 group`}
          >
            <div className="space-y-3 z-10 text-center sm:text-left flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-100">
                🌱 Farm to Kitchen
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {left.title || "Season's Best Fresh & Healthy"}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                {left.subtitle || "Farm to your home with 100% purity guaranteed."}
              </p>
              <button
                onClick={() => onSelectCategory(left.categoryLink || 'Groceries')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs transition-colors cursor-pointer shadow inline-flex items-center gap-1.5"
              >
                <span>{left.buttonText || 'Shop More →'}</span>
              </button>
            </div>

            {/* Visual with Circular Discount Badge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-48 h-36 sm:w-56 sm:h-44 rounded-2xl overflow-hidden bg-white/10 p-1">
                <img
                  src={left.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                  alt="Season's Best"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {left.discountBadge && (
                <div className="absolute -top-3 -right-3 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-amber-400 text-amber-950 p-1 flex flex-col items-center justify-center font-black text-center shadow-lg border-2 border-white leading-none rotate-12">
                  <span className="text-[9px] uppercase font-bold">UP TO</span>
                  <span className="text-sm font-black">30%</span>
                  <span className="text-[9px] uppercase">OFF</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner 2: Healthy Choices Happier Families */}
        {showRight && (
          <div
            className={`${
              showLeft ? 'md:col-span-4' : 'md:col-span-12'
            } relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#fbe3d5] via-[#f8d4c0] to-[#f4c6ad] p-6 sm:p-7 text-amber-950 shadow-md flex flex-col justify-between border border-amber-200/60 group`}
          >
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-white/60 px-2.5 py-0.5 rounded-full inline-block">
                {right.discountBadge || 'Healthy Choices'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 leading-tight">
                {right.title || 'Healthy Choices Happier Families'}
              </h3>
              <p className="text-amber-900/80 text-xs font-semibold">
                {right.subtitle || 'Nutritious fruits & drinks'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => onSelectCategory(right.categoryLink || 'Cold Drinks')}
                className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs transition-colors cursor-pointer shadow"
              >
                {right.buttonText || 'Shop More →'}
              </button>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white p-1 shadow-sm">
                <img
                  src={right.imageUrl || 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=400&q=80'}
                  alt="Healthy Choices"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
