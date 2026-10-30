import React from 'react';
import { useStore, STORE_ADDRESS_TEXT, SHOP_WHATSAPP_NUMBER, SHOP_WHATSAPP_INTL } from './StoreContext';

export default function Footer() {
  const { setCurrentView, storeSettings } = useStore();

  return (
    <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Store Brand & Info */}
          <div className="space-y-3 md:col-span-1">
            <div 
              onClick={() => setCurrentView('home')} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                🏪
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                  {storeSettings?.storeName || 'Ankush General Store'}
                </h3>
                <p className="text-[11px] text-emerald-400/90 font-medium">Khorma, Pratappur</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Surajpur aur Pratappur ka sabse bharosemand online grocery superstore. Taaza rashan, cold drinks aur gharelu saman seedhe aapke ghar tak.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ₹1,500+ par FREE Home Delivery (2 km)
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🏠</span> Store Homepage
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('account'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>👤</span> Customer VIP Dashboard & Coins
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>⚙️</span> Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Timings & Location */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Store Timings & Address
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 text-sm">📍</span>
                <span className="text-slate-300 font-medium leading-relaxed">
                  {STORE_ADDRESS_TEXT}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-sm">⏰</span>
                <span className="text-slate-300 font-medium">
                  Subah 7:00 AM se Raat 9:30 PM tak (Rozana)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-sm">🚚</span>
                <span className="text-slate-300 font-medium">
                  Surajpur & Pratappur Fast Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: WhatsApp & Phone Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Contact & Order Support
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Koi bhi sawal ya saman ki parchi seedhe WhatsApp par bhejne ke liye:
            </p>
            <div className="space-y-2">
              <a
                href={`https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_INTL}&text=${encodeURIComponent('Namaste Ankush General Store! Mujhe saman order karna hai.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <span>💬</span> WhatsApp Order / Chat
              </a>
              <a
                href={`tel:${SHOP_WHATSAPP_NUMBER}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>📞</span> Call: {SHOP_WHATSAPP_NUMBER}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ankush General Store. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Asli Saman Guarantee</span>
            <span>•</span>
            <span>Secure UPI Payments</span>
            <span>•</span>
            <span>VIP Loyalty Program</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
