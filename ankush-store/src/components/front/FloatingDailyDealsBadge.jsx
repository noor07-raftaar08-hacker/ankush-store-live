import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../StoreContext';

export default function FloatingDailyDealsBadge() {
  const { dailyDealsConfig } = useStore();
  const [isVisible, setIsVisible] = useState(true);

  const initialHours = Number(dailyDealsConfig?.hours) || 12;
  const initialMinutes = Number(dailyDealsConfig?.minutes) || 30;
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: initialMinutes
  });

  useEffect(() => {
    setTimeLeft({
      hours: Number(dailyDealsConfig?.hours) || 12,
      minutes: Number(dailyDealsConfig?.minutes) || 30
    });
  }, [dailyDealsConfig?.hours, dailyDealsConfig?.minutes]);

  const scrollToDeals = () => {
    const elements = document.querySelectorAll('#daily-deals-section');
    for (const el of elements) {
      if (el.offsetParent !== null || el.getClientRects().length > 0) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    const fallback = document.getElementById('daily-deals-section');
    if (fallback) fallback.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Daily Deals announcement" className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 select-none">
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative group"
      >
        {/* Pulsating Ambient Backlight */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

        {/* Main Floating Pill */}
        <div
          onClick={scrollToDeals}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDeals(); } }}
          className="relative flex items-center gap-2.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl border border-rose-500/40 cursor-pointer hover:border-rose-400 hover:scale-105 transition-all"
        >
          {/* Animated Flame Icon */}
          <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-sm shadow-inner shrink-0">
            🔥
          </span>

          {/* Text Information */}
          <div className="text-left leading-tight pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-rose-400 tracking-wide uppercase">
                Daily Deals
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            </div>
            <p className="text-[10px] font-bold text-slate-300">
              Up to <span className="text-amber-300 font-black">30% OFF</span> • Tap Here ⚡
            </p>
          </div>

          {/* Close / Dismiss '✕' */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors ml-1"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </aside>
  );
}
