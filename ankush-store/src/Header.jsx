import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, RealGoldCoinIcon, SHOP_WHATSAPP_NUMBER } from './StoreContext';

const SvgIcon = ({ children, className = "w-5 h-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

const StoreIcon = (props) => (
  <SvgIcon {...props}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </SvgIcon>
);

const ShoppingCartIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </SvgIcon>
);

const UserIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgIcon>
);

const MenuIcon = (props) => (
  <SvgIcon {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </SvgIcon>
);

const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIcon>
);

const SunIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </SvgIcon>
);

const MoonIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </SvgIcon>
);

export default function Header() {
  const {
    currentView,
    setCurrentView,
    currentUser,
    setIsLoginModalOpen,
    setLoginModalInitialTab,
    totalItems,
    setIsCartOpen,
    cartBounce,
    themeMode,
    toggleThemeMode,
    storeSettings
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 shadow-xl border-b border-emerald-600/30 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <div
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all"
            >
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                <StoreIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
              )}
            </motion.div>
            <div>
              <h1 className="text-white font-black text-base sm:text-xl tracking-tight leading-tight flex items-center gap-1.5">
                {storeSettings?.storeName || 'Ankush General Store'}
                <span className="hidden sm:inline-block text-[10px] bg-amber-400 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Khorma
                </span>
              </h1>
              <p className="text-emerald-200/90 text-xs hidden sm:block font-medium">
                Pratappur, Surajpur • Fast Local Delivery
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            
            {/* Home Link */}
            <button
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              🏠 Store Home
            </button>

            {/* Customer VIP Account / Login Button */}
            {currentUser ? (
              <button
                onClick={() => { setCurrentView('account'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'account'
                    ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/15'
                }`}
              >
                <span>👋 {currentUser.name ? currentUser.name.split(' ')[0] : 'My Account'}</span>
                <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1">
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
                className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Customer Login / Coins</span>
              </button>
            )}

            {/* Admin Portal Button */}
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-emerald-400 shadow-inner'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚙️ Admin Portal
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleThemeMode}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              {themeMode === 'dark' ? <SunIcon className="w-4 h-4 text-amber-300" /> : <MoonIcon className="w-4 h-4 text-emerald-200" />}
            </button>

            {/* Cart Button */}
            <motion.button
              animate={cartBounce ? { scale: [1, 1.25, 0.95, 1] } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative bg-amber-400 hover:bg-amber-300 text-amber-950 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-colors cursor-pointer ml-1"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              <span>Cart</span>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md border-2 border-emerald-800"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </nav>

          {/* Mobile Right Controls */}
          <div className="lg:hidden flex items-center gap-2">
            
            {/* Quick Coin Pill or Login */}
            {currentUser ? (
              <button
                onClick={() => setCurrentView('account')}
                className="bg-white/15 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 border border-white/15 cursor-pointer"
              >
                <RealGoldCoinIcon size="sm" />
                <span className="text-amber-300 font-black">{currentUser.coins || 0}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginModalInitialTab('customer');
                  setIsLoginModalOpen(true);
                }}
                className="bg-amber-400 text-amber-950 text-xs px-2.5 py-1.5 rounded-xl font-black cursor-pointer shadow"
              >
                Login
              </button>
            )}

            {/* Mobile Cart Button */}
            <motion.button
              animate={cartBounce ? { scale: [1, 1.2, 1] } : {}}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative bg-amber-400 text-amber-950 p-2 rounded-xl cursor-pointer shadow-md"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-emerald-800">
                  {totalItems}
                </span>
              )}
            </motion.button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4 border-t border-emerald-600/40 mt-2 pt-3 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    currentView === 'home' ? 'bg-white/20 text-white' : 'text-emerald-100 hover:bg-white/10'
                  }`}
                >
                  🏠 Store Home
                </button>

                {currentUser ? (
                  <button
                    onClick={() => {
                      setCurrentView('account');
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      currentView === 'account' ? 'bg-amber-400 text-amber-950 font-black' : 'text-amber-300 hover:bg-white/10'
                    }`}
                  >
                    <span>👤 My VIP Account ({currentUser.name})</span>
                    <span className="bg-amber-950/20 px-2 py-0.5 rounded-full text-[11px] font-black">
                      🪙 {currentUser.coins || 0} Coins
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLoginModalInitialTab('customer');
                      setIsLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-xs font-bold text-amber-300 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Customer VIP Login / Sign Up (+20 Coins)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    currentView === 'admin' ? 'bg-slate-900 text-emerald-400 font-black' : 'text-emerald-100 hover:bg-white/10'
                  }`}
                >
                  ⚙️ Admin Dashboard
                </button>

                <div className="flex items-center justify-between px-3 py-2 mt-1 border-t border-emerald-600/30 text-xs text-emerald-200">
                  <span>Theme: {themeMode === 'dark' ? 'Dark' : 'Light'}</span>
                  <button
                    onClick={toggleThemeMode}
                    className="px-3 py-1 rounded-lg bg-white/15 text-white font-bold text-[11px] cursor-pointer"
                  >
                    {themeMode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
