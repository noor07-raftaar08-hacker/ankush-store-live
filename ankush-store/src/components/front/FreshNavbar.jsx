import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, RealGoldCoinIcon, SHOP_WHATSAPP_NUMBER } from '../../StoreContext';
import { Search, ShoppingCart, User, MapPin } from '../../components/Icons';

export default function FreshNavbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) {
  const {
    currentView,
    setCurrentView,
    currentUser,
    setIsLoginModalOpen,
    setLoginModalInitialTab,
    totalItems,
    finalAmount,
    setIsCartOpen,
    cartBounce,
    storeCategories,
    storeSettings
  } = useStore();

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const activeCategories = storeCategories.filter(c => c.isActive !== false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* 1. BRAND LOGO (Ankush General Store) */}
          <div
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🥬</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  Ankush <span className="text-emerald-600">General Store</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 tracking-wide mt-0.5 leading-none">
                Khorma, Pratappur • Taaza Rashan & Daily Groceries
              </p>
            </div>
          </div>

          {/* 2. REAL-TIME SEARCH BAR (Desktop & Tablet - No Category Dropdown Inside) */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center relative">
            <div className="w-full flex items-center bg-slate-50 border-2 border-emerald-600/30 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-inner">
              
              {/* Search Icon Prefix */}
              <div className="pl-3.5 text-slate-400">
                <Search className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                placeholder="Search products by name (e.g. Atta, Dal, Cold Drink, Surf, Oil, Maggi)..."
                value={searchQuery}
                onChange={e => {
                  onSearchChange(e.target.value);
                  const el = document.getElementById('main-products-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 px-3 py-2.5 text-xs text-slate-800 bg-transparent placeholder-slate-400 outline-none"
              />

              {/* Clear button if text exists */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="px-2 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}

              {/* Search Button */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('main-products-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold gap-1"
                aria-label="Search"
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* 3. RIGHT CONTROLS: Location + Account + Cart */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Live Location Pill (Clickable -> Opens Google Maps Location) */}
            <div
              onClick={() => {
                const mapUrl = storeSettings?.mapLocationUrl || 'https://www.google.com/maps/search/?api=1&query=23.4865,83.2085';
                window.open(mapUrl, '_blank');
              }}
              title="Click to open Ankush General Store location on Google Maps"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 cursor-pointer p-2 rounded-xl hover:bg-emerald-50 border border-slate-200/80 transition-all group"
            >
              <span className="text-base text-emerald-600 group-hover:scale-110 transition-transform">📍</span>
              <div className="leading-tight text-left">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Live Store Map ↗</span>
                <span className="font-extrabold text-slate-800 text-[11px] group-hover:text-emerald-700">
                  {storeSettings?.storeAddress ? storeSettings.storeAddress.split(',')[0] + ', Surajpur' : 'Khorma, Surajpur'}
                </span>
              </div>
            </div>

            {/* VIP Customer Login / Account Pill */}
            {currentUser ? (
              <button
                onClick={() => { setCurrentView('account'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <span className="text-[10px] text-slate-400 block font-bold">VIP Account</span>
                  <span className="font-bold text-slate-900 text-xs truncate max-w-[100px] block">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>
                <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-sm">
                  <RealGoldCoinIcon size="sm" />
                  {currentUser.coins || 0}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginModalInitialTab('customer');
                  setIsLoginModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 p-2 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Sign In / VIP</span>
              </button>
            )}

            {/* Cart Pill with Total Amount */}
            <motion.button
              animate={cartBounce ? { scale: [1, 1.15, 0.95, 1] } : {}}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-emerald-700 shadow">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
              <span className="hidden sm:inline text-emerald-200">|</span>
              <span className="tabular-nums font-black text-amber-200">
                ₹{Number(finalAmount || 0).toFixed(0)}
              </span>
            </motion.button>

            {/* Admin Switcher Icon */}
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Open Admin Portal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
            >
              ⚙️
            </button>
          </div>

        </div>

        {/* Mobile Search Bar (Rendered only on small screens) */}
        <div className="mt-2.5 md:hidden">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white">
            <input
              type="text"
              placeholder="Search grocery, cold drinks, snacks..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs text-slate-800 bg-transparent placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              className="bg-emerald-600 text-white px-3 py-2 flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}
