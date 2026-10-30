import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, SHOP_WHATSAPP_NUMBER, STORE_ADDRESS_TEXT } from '../../StoreContext';

export default function FreshFooter({ onOpenTrackOrder, onSelectCategory }) {
  const { setCurrentView, storeCategories } = useStore();
  const [guidelinesModal, setGuidelinesModal] = useState(null); // 'delivery' | 'cod' | null

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    const el = document.getElementById('main-products-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeCategories = storeCategories
    .filter(c => c.isActive !== false)
    .slice(0, 6);

  return (
    <footer className="bg-[#033424] text-slate-300 pt-12 pb-8 border-t border-emerald-800/40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-emerald-800/50">
          
          {/* Column 1: Store Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white text-xl shadow-md">
                🥬
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Ankush <span className="text-emerald-400">General Store</span>
              </span>
            </div>

            <p className="text-xs text-emerald-200/80 max-w-sm leading-relaxed font-medium">
              Fresh groceries, shudh atta, taaza rashan and household essentials.
              Proudly serving families in Khorma, Pratappur, District Surajpur.
            </p>

            <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
              <span>📍</span>
              <span>{STORE_ADDRESS_TEXT}</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/91${SHOP_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors text-sm shadow-sm"
                title="WhatsApp Direct"
              >
                💬
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors text-sm shadow-sm"
                title="Facebook"
              >
                📘
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors text-sm shadow-sm"
                title="Instagram"
              >
                📷
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors text-sm shadow-sm"
                title="YouTube"
              >
                ▶️
              </a>
            </div>
          </div>

          {/* Column 2: Active Categories with Real Filter Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80 font-medium">
              <li>
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  🛒 All Grocery Products
                </button>
              </li>
              {activeCategories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug || cat.name)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80 font-medium">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  📦 Track Your Order
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/91${SHOP_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors text-left block"
                >
                  💬 WhatsApp Support (8817425506)
                </a>
              </li>
              <li>
                <button
                  onClick={() => setGuidelinesModal('cod')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  💵 Cash on Delivery Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => setGuidelinesModal('delivery')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  🚚 Free Delivery Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  ⚙️ Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Order & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Direct Helpline & WhatsApp
            </h4>
            <p className="text-xs text-emerald-200/80">
              Kisi bhi rashan order ya inquiry ke liye seedha call ya message karein:
            </p>
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/50 space-y-1">
              <span className="text-[11px] text-emerald-400 font-bold block">Store Helpline</span>
              <a
                href={`tel:${SHOP_WHATSAPP_NUMBER}`}
                className="text-base font-black text-white hover:text-emerald-300 block"
              >
                +91 {SHOP_WHATSAPP_NUMBER}
              </a>
              <span className="text-[10px] text-emerald-300/70 block">
                Subah 7:00 AM se Raat 9:30 PM tak (Rozana)
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Tagline */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300/70 gap-3">
          <p>© 2026 Ankush General Store • Khorma, Pratappur, Surajpur. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>100% Shudh Groceries</span>
            <span>•</span>
            <span>Superfast Delivery</span>
            <span>•</span>
            <span>VIP Coins Rewards</span>
          </div>
          <p className="text-emerald-400 font-semibold">Khorma Ka Apna Grocery Store 💚</p>
        </div>

      </div>

      {/* DELIVERY & COD GUIDELINES MODAL */}
      <AnimatePresence>
        {guidelinesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 border border-slate-200"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <span>{guidelinesModal === 'delivery' ? '🚚 Free Home Delivery Guidelines' : '💵 Cash on Delivery (COD) Rules'}</span>
                </h3>
                <button
                  onClick={() => setGuidelinesModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {guidelinesModal === 'delivery' ? (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
                    <p className="font-bold text-emerald-900 mb-1">🎉 100% Free Delivery:</p>
                    Aapka order agar <b>₹1,500 ya usse adhik</b> ka hai aur distance <b>2 km ke andar</b> hai, to delivery charge bilkul <b>₹0 (FREE)</b> hai!
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                    <p>• <b>Minimum Order:</b> Ghar baithe mangwane ke liye minimum ₹700 ka order anivarya hai.</p>
                    <p>• <b>Standard Delivery:</b> ₹700 se ₹1,499 ke orders par sirf ₹30 standard delivery shulk lagta hai.</p>
                    <p>• <b>Delivery Area:</b> Khorma, Pratappur Bazaar aur aas-paas ke 3 km ke ilake me turant delivery.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                    <p className="font-bold text-amber-900 mb-1">💵 Cash on Delivery (COD) Policy:</p>
                    COD par order confirm karne ke liye <b>₹200 advance payment</b> UPI se dena hota hai, baki bacha amount samaan milne par Cash ya UPI se de sakte hain.
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                    <p>• Ye suvidha fake orders aur cancellation rokne ke liye rakhi gayi hai.</p>
                    <p>• Full UPI payment par koi advance ki jhanjhat nahi rehti aur order turant pack ho jata hai.</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setGuidelinesModal(null)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Samajh Gaya (Close)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}
