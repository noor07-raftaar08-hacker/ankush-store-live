import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, SHOP_WHATSAPP_NUMBER } from '../StoreContext';
import { Search, X, CheckCircle2, Clock } from './Icons';

export default function TrackOrderModal({ isOpen, onClose }) {
  const { orders } = useStore();
  const [query, setQuery] = useState('');
  const [matchedOrder, setMatchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const found = orders.find(o =>
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q))
    );

    setMatchedOrder(found || null);
    setSearched(true);
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 cursor-default"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Track Your Order</h3>
              <p className="text-xs text-slate-500">Khorma & Pratappur Live Delivery Status</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white">
              <input
                type="text"
                placeholder="Enter Order ID or 10-digit Phone..."
                value={query}
                onChange={e => { setQuery(e.target.value); setSearched(false); }}
                className="flex-1 px-4 py-2.5 text-xs text-slate-800 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2.5 font-bold text-xs cursor-pointer hover:bg-emerald-500"
              >
                Track
              </button>
            </div>
          </form>

          {/* Search Result */}
          {searched && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {matchedOrder ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-900 font-bold">#{matchedOrder.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      matchedOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-amber-950'
                    }`}>
                      {matchedOrder.status === 'delivered' ? '✓ Delivered' : '⏳ In Processing'}
                    </span>
                  </div>

                  <p className="text-slate-700"><b>Customer:</b> {matchedOrder.customerName}</p>
                  <p className="text-slate-700"><b>Amount:</b> ₹{Number(matchedOrder.finalAmount).toFixed(0)}</p>
                  <p className="text-slate-500 text-[11px]"><b>Address:</b> {matchedOrder.customerAddress}</p>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/91${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Namaste Ankush Store, mera Order ID #${matchedOrder.id} ka status check karna hai.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      💬 WhatsApp Store for Live Location
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                  <p>Koi order nahi mila. Kripya sahi Order ID ya registered phone number daalein.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
