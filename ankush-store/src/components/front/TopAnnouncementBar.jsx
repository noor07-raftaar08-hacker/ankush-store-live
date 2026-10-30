import React from 'react';
import { useStore, SHOP_WHATSAPP_NUMBER } from '../../StoreContext';

export default function TopAnnouncementBar({ onOpenTrackOrder, onOpenHelp }) {
  const { storeSettings } = useStore();

  return (
    <div className="bg-[#0b4834] text-emerald-100 text-[11px] sm:text-xs py-2 px-4 select-none border-b border-emerald-700/40 font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        {/* Left Notice with Leaf Icon */}
        <div className="flex items-center gap-1.5 font-semibold text-white truncate">
          <span className="text-emerald-300">🌿</span>
          <span>Fresh Food, Brighter Days!</span>
          <span className="hidden md:inline text-emerald-200/90 font-normal">
            Free delivery on orders over ₹1,500 in Khorma & Pratappur
          </span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 text-emerald-200/90 text-[11px] ml-auto">
          <button
            onClick={onOpenTrackOrder}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>📦</span> Track Order
          </button>
          <span className="text-emerald-600/60">•</span>
          <button
            onClick={onOpenHelp}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>💬</span> Help
          </button>
          <span className="text-emerald-600/60 hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-white font-bold">
            🇮🇳 INR ₹
          </span>
        </div>
      </div>
    </div>
  );
}
