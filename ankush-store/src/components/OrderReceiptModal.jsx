import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_ADDRESS_TEXT, SHOP_WHATSAPP_NUMBER } from '../StoreContext';
import { X, Printer } from './Icons';

export default function OrderReceiptModal({ order, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const itemsText = (order.items || [])
      .map(it => `• ${it.name} x${it.quantity} = ₹${it.finalItemTotal || (it.price * it.quantity)}`)
      .join('\n');

    const msg =
      `🏪 *Ankush General Store — Order Bill*\n` +
      `🧾 *Order ID:* ${order.id}\n` +
      `👤 *Customer:* ${order.customerName} (${order.customerPhone})\n` +
      `📍 *Address:* ${order.customerAddress || STORE_ADDRESS_TEXT}\n\n` +
      `*Saman List:*\n${itemsText}\n\n` +
      `💰 *Total Bill:* ₹${order.finalAmount}\n` +
      `💳 *Payment:* ${order.paymentMethod === 'cash' ? 'Cash on Delivery (₹200 Advance Paid)' : 'Full UPI Payment Verified'}\n\n` +
      `🙏 *Dhanyawad! Ankush General Store, Khorma, Pratappur.*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none print:p-4 my-8 cursor-default"
        >
          {/* Top Floating Absolute Close Button (Always visible on any screen) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center font-bold text-base transition-colors cursor-pointer print:hidden shadow-sm border border-slate-200"
            title="Band Karein / Close"
          >
            ✕
          </button>

          {/* Close & Action Buttons Bar (Hidden when printing) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5 print:hidden pr-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Official Tax Invoice / Pakki Parchi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Store Header */}
          <div className="text-center pb-5 border-b border-dashed border-slate-300">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Ankush General Store</h2>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">Khorma, Pratappur, District Surajpur (C.G.)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Phone / WhatsApp: {SHOP_WHATSAPP_NUMBER}</p>
            <div className="mt-3 inline-block font-mono text-xs font-bold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              Order ID: #{order.id}
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-dashed border-slate-300">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Billed To</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">📱 {order.customerPhone}</p>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-tight">{order.customerAddress || STORE_ADDRESS_TEXT}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[10px] uppercase font-bold">Order Date</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-slate-600 text-[11px]">
                {new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                ● {order.status === 'delivered' ? 'Delivered' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-dashed border-slate-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 text-[10px] uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(order.items || []).map((it, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2 font-medium">
                      {it.name}
                      {it.freeQuantity > 0 && (
                        <span className="block text-[10px] font-bold text-emerald-600">
                          + {it.freeQuantity} FREE (BOGO Offer)
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center font-bold">{it.quantity}</td>
                    <td className="py-2 text-right text-slate-500">₹{it.price}</td>
                    <td className="py-2 text-right font-bold tabular-nums">
                      ₹{it.finalItemTotal || (it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="py-4 space-y-1.5 text-xs border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold tabular-nums">₹{order.rawSubtotal || order.totalPrice || order.finalAmount}</span>
            </div>

            {order.totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Offer Savings:</span>
                <span className="font-bold tabular-nums">-₹{order.totalDiscount}</span>
              </div>
            )}

            {order.coinsUsed > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>VIP Coins Redeemed ({order.coinsUsed} 🪙):</span>
                <span className="font-bold tabular-nums">-₹{order.coinsUsed}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Home Delivery ({order.distanceZoneLabel || 'Local'}):</span>
              <span className="font-bold tabular-nums">
                {order.deliveryCharge === 0 || order.isFreeDeliveryApplied ? (
                  <span className="text-emerald-600 font-black">FREE (₹0)</span>
                ) : (
                  `₹${order.deliveryCharge || 30}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Bill Amount:</span>
              <span className="text-emerald-700 text-lg tabular-nums">₹{order.finalAmount}</span>
            </div>

            {/* Cash / UPI Payment Note */}
            {order.paymentMethod === 'cash' ? (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Payment Mode:</span>
                  <span>Cash on Delivery (₹0 Advance)</span>
                </div>
                <div className="flex justify-between font-black text-emerald-950">
                  <span>Amount to Pay on Arrival:</span>
                  <span className="text-emerald-700 font-extrabold text-sm">₹{Number(order.finalAmount).toFixed(0)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center justify-between">
                <span>Payment Mode: Full UPI QR Payment</span>
                <span className="text-emerald-700 font-black">✓ VERIFIED</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Aapke vishwas ke liye shukriya!</p>
            <p className="mt-0.5">Koi bhi dikkat ho toh turant call/WhatsApp karein: {SHOP_WHATSAPP_NUMBER}</p>
          </div>

          {/* Print, Share & Prominent Close Actions (Hidden on Print) */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" /> Band Karein
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
