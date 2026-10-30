import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, RealGoldCoinIcon } from './StoreContext';

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

const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIcon>
);

const EyeIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIcon>
);

const EyeOffIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </SvgIcon>
);

const LockIcon = (props) => (
  <SvgIcon {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIcon>
);

const UserIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgIcon>
);

export default function CustomerLoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginModalInitialTab,
    loginCustomer,
    registerCustomer,
    setIsAdminAuth,
    setCurrentView
  } = useStore();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'admin'
  const [customerMode, setCustomerMode] = useState('login'); // 'login' | 'signup'

  // Customer Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [address, setAddress] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [customerMsg, setCustomerMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    if (loginModalInitialTab) {
      setActiveTab(loginModalInitialTab);
    }
  }, [loginModalInitialTab, isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setCustomerMsg('');
    setAdminMsg('');
    setIsLoginModalOpen(false);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setCustomerMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setCustomerMsg("Kripya 10-digit ka sahi mobile number dalein!");
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setCustomerMsg("Secret PIN bilkul 4-digit numbers (jaise 1234) ka hona chahiye!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (customerMode === 'login') {
        const res = await loginCustomer(cleanPhone, pin);
        if (!res.success) {
          setCustomerMsg(res.message || "Galat Mobile Number ya PIN!");
        } else {
          handleClose();
          setCurrentView('account');
        }
      } else {
        if (!name.trim()) {
          setCustomerMsg("Kripya apna poora naam likhein!");
          setIsSubmitting(false);
          return;
        }
        const res = await registerCustomer(name.trim(), cleanPhone, pin, address.trim());
        if (!res.success) {
          setCustomerMsg(res.message || "Account banane me dikkat aayi!");
        } else {
          handleClose();
          setCurrentView('account');
        }
      }
    } catch (err) {
      setCustomerMsg("Server connection me samasya aayi. Dobara koshish karein.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminMsg('');

    if (adminUsername.trim() === 'AnkushStore' && adminPassword === 'AGenStore@071') {
      localStorage.setItem('ankush_admin_auth', 'true');
      setIsAdminAuth(true);
      handleClose();
      setCurrentView('admin');
    } else {
      setAdminMsg("Galat Username ya Password! Sirf shop owner access kar sakte hain.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-slate-100 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {/* Top Main Tabs (Customer vs Admin) */}
          <div className="flex bg-slate-950 p-1 rounded-2xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('customer'); setCustomerMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👤</span> Customer VIP Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setAdminMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚙️</span> Admin Portal
            </button>
          </div>

          {/* TAB 1: CUSTOMER VIP LOGIN / SIGN UP */}
          {activeTab === 'customer' && (
            <div>
              <div className="text-center mb-5">
                <div className="inline-flex p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl mb-2 text-amber-400 shadow-inner">
                  <RealGoldCoinIcon size="lg" animateSpin={true} />
                </div>
                <h2 className="text-xl font-black text-white">
                  {customerMode === 'login' ? 'Customer VIP Login' : 'Create VIP Loyalty Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Har kharidi par Loyalty Coins jeetein aur direct discount payein!
                </p>
              </div>

              {/* Sub-tabs: Login vs Sign Up */}
              <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4 border border-slate-700">
                <button
                  type="button"
                  onClick={() => { setCustomerMode('login'); setCustomerMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerMode === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Existing Login
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomerMode('signup'); setCustomerMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    customerMode === 'signup' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  New Sign Up (+20 🪙)
                </button>
              </div>

              {customerMsg && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl mb-4 text-center font-semibold">
                  {customerMsg}
                </div>
              )}

              <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                {customerMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Apna Poora Naam"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    4-Digit Secret PIN *
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={4}
                      placeholder="•••• (e.g. 1234)"
                      required
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none tracking-widest text-center font-mono font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPin ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {customerMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Delivery Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Bus Stand, Khorma, Pratappur"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-500 cursor-pointer transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting
                    ? 'Checking...'
                    : customerMode === 'login'
                    ? '🔐 Verify PIN & Login'
                    : '🎁 Create Account & Claim +20 Coins'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ADMIN PORTAL LOGIN */}
          {activeTab === 'admin' && (
            <div>
              <div className="text-center mb-5">
                <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-2 text-amber-400">
                  <LockIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white">Owner & Admin Login</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Only shop owner access for Ankush General Store
                </p>
              </div>

              {adminMsg && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl mb-4 text-center font-semibold">
                  {adminMsg}
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter Admin Username"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="Enter Admin Password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl font-black text-xs shadow-lg shadow-amber-900/40 hover:from-amber-500 hover:to-orange-500 cursor-pointer transition-all mt-2"
                >
                  🚀 Login to Admin Portal
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
