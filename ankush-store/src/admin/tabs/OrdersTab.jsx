import React, { useState, useMemo } from 'react';
import { useStore, SHOP_WHATSAPP_INTL } from '../../StoreContext';
import GlassButton from '../components/GlassButton';
import { ShoppingCart, CheckCircle2, Clock, Eye, Copy, Check } from '../../components/Icons';

export default function OrdersTab({ mode = 'pending', onInspectOrder, onToast }) {
  const {
    orders,
    confirmDelivery,
    getPendingOrders,
    getDeliveredOrders
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const pendingOrders = useMemo(() => {
    try {
      const res = getPendingOrders ? getPendingOrders() : [];
      return Array.isArray(res) ? res : [];
    } catch (e) {
      return [];
    }
  }, [orders, getPendingOrders]);

  const deliveredOrders = useMemo(() => {
    try {
      const res = getDeliveredOrders ? getDeliveredOrders() : [];
      return Array.isArray(res) ? res : [];
    } catch (e) {
      return [];
    }
  }, [orders, getDeliveredOrders]);

  const handleSendWhatsAppOrderUpdate = (order, statusType) => {
    const statusNote = statusType === 'delivered'
      ? 'Aapka saman safely deliver ho chuka hai! Dhanyawad.'
      : 'Aapka order pack ho chuka hai aur delivery ke liye nikalne wala hai!';

    const text =
      `🏪 *Ankush General Store Update*\n` +
      `🧾 *Order ID:* ${order.id}\n` +
      `👤 *Customer:* ${order.customerName}\n` +
      `📦 *Status:* ${statusType.toUpperCase()}\n` +
      `💬 *Note:* ${statusNote}\n\n` +
      `Koi bhi sawal ho toh hume yahin WhatsApp karein!`;

    window.open(`https://api.whatsapp.com/send?phone=91${order.customerPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Delivered Orders
  const filteredDeliveredOrders = useMemo(() => {
    return deliveredOrders.filter(o => {
      if (!o) return false;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q));

      const matchesDate = !selectedDate || (() => {
        try {
          if (!o.orderDate) return false;
          const dt = new Date(o.orderDate);
          return !isNaN(dt.getTime()) && dt.toISOString().split('T')[0] === selectedDate;
        } catch (e) {
          return false;
        }
      })();
      return matchesSearch && matchesDate;
    });
  }, [deliveredOrders, searchQuery, selectedDate]);

  const deliveredDateTotal = useMemo(() => {
    return filteredDeliveredOrders.reduce((acc, o) => acc + (Number(o.finalAmount) || 0), 0);
  }, [filteredDeliveredOrders]);

  if (mode === 'pending') {
    return (
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Pending Orders ({pendingOrders.length})</span>
            </h2>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Confirm deliveries, track ₹200 cash advances & send WhatsApp customer updates
            </p>
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-16 text-[#A5B4CC] bg-white/[0.02] rounded-2xl border border-white/5">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-semibold text-white">All caught up!</p>
            <p className="text-xs mt-1">Abhi koi pending order nahi hai. All customer orders are delivered!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="liquid-glass-card rounded-2xl p-5 space-y-3.5 border border-white/10 hover:border-violet-400/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30">
                        {order.id}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <p className="text-white font-bold text-base mt-2">{order.customerName}</p>
                    <p className="text-xs text-[#A5B4CC]">📱 {order.customerPhone} • 📍 {order.customerAddress}</p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-emerald-300 font-black text-xl tabular-nums">
                      ₹{Number(order.finalAmount).toFixed(2)}
                    </p>
                    {order.paymentMethod === 'cash' && (
                      <p className="text-[11px] text-amber-300 font-semibold">
                        Advance Paid: ₹200 • Balance Due: ₹{Math.max(0, Number(order.finalAmount) - 200).toFixed(0)}
                      </p>
                    )}
                    <p className="text-[11px] text-[#A5B4CC] mt-0.5">
                      {new Date(order.orderDate).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="bg-black/25 p-3.5 rounded-xl border border-white/[0.06] space-y-1 text-xs">
                  <p className="text-[11px] font-bold text-violet-300 uppercase tracking-wider mb-1">Ordered Items:</p>
                  <div className="space-y-1 text-slate-300">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {it.name} ×{it.quantity} {it.freeQuantity > 0 ? `(+${it.freeQuantity} Free)` : ''}</span>
                        <span className="font-semibold text-white">₹{it.finalItemTotal || (it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInspectOrder && onInspectOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Inspect Bill</span>
                    </button>
                    <button
                      onClick={() => handleSendWhatsAppOrderUpdate(order, 'packed')}
                      className="px-3.5 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-400/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>WhatsApp Update</span>
                    </button>
                  </div>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={Check}
                    onClick={() => {
                      confirmDelivery(order.id || order._id, 'delivered');
                      if (onToast) onToast('Order Delivered', `${order.id || 'Order'} marked as Delivered.`);
                    }}
                  >
                    Confirm Delivery
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Delivered Orders View
  return (
    <div className="liquid-glass-panel rounded-[28px] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Delivered Orders & Daily Sales Ledger</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Archived sales history, customer receipts & date-wise billing summaries
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Search customer name, phone, or Order ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-xs sm:text-sm text-white outline-none focus:border-violet-400"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-xs sm:text-sm text-white outline-none focus:border-violet-400"
        />
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-between text-xs sm:text-sm">
        <span className="text-slate-200">
          Showing Orders for <b>{selectedDate || 'All Dates'}</b>:
        </span>
        <span className="text-emerald-300 font-black text-base sm:text-lg tabular-nums">
          Total Sales: ₹{deliveredDateTotal.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        {filteredDeliveredOrders.length === 0 ? (
          <p className="text-[#A5B4CC] text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5 text-xs">
            No delivered orders found for this search or date filter.
          </p>
        ) : (
          filteredDeliveredOrders.map(order => (
            <div
              key={order.id}
              className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-3 text-xs border border-white/10"
            >
              <div>
                <span className="font-mono text-violet-300 font-bold">{order.id}</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {order.customerName} ({order.customerPhone})
                </p>
                <p className="text-[#A5B4CC] mt-0.5">{order.customerAddress}</p>
                <div className="mt-2 text-slate-300 flex flex-wrap gap-2">
                  {(order.items || []).map((it, i) => (
                    <span key={i} className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                      {it.name} ×{it.quantity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                <p className="text-emerald-300 font-black text-base tabular-nums">
                  ₹{Number(order.finalAmount).toFixed(2)}
                </p>
                <button
                  onClick={() => onInspectOrder && onInspectOrder(order)}
                  className="text-cyan-300 hover:underline mt-2 cursor-pointer font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View / Print Bill →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
