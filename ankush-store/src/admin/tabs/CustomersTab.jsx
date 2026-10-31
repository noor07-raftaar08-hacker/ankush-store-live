import React, { useState } from 'react';
import { useStore, RealGoldCoinIcon } from '../../StoreContext';
import { Users, Search, Plus, Check } from '../../components/Icons';

export default function CustomersTab({ onToast }) {
  const {
    customers,
    updateCustomerData
  } = useStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [awardCoinsMap, setAwardCoinsMap] = useState({});
  const [awardReasonMap, setAwardReasonMap] = useState({});
  const [resetPinMap, setResetPinMap] = useState({});

  const handleSendBonusCoins = (phone) => {
    const amount = Number(awardCoinsMap[phone]);
    if (!amount || amount <= 0) return;
    const reason = awardReasonMap[phone] || 'Special VIP Reward from Store Admin';

    updateCustomerData(phone, amount, null, reason);
    if (onToast) onToast('Bonus Coins Awarded', `+${amount} Coins sent to ${phone}.`);

    setAwardCoinsMap(prev => ({ ...prev, [phone]: '' }));
    setAwardReasonMap(prev => ({ ...prev, [phone]: '' }));
  };

  const handleResetPin = (phone) => {
    const pin = resetPinMap[phone];
    if (!pin || pin.length !== 4) {
      alert("PIN bilkul 4-digit ka hona chahiye!");
      return;
    }
    updateCustomerData(phone, 0, pin, 'PIN reset by Store Admin');
    if (onToast) onToast('PIN Reset', `New PIN saved for ${phone}.`);
    setResetPinMap(prev => ({ ...prev, [phone]: '' }));
  };

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter(c =>
    !customerSearch ||
    (c && c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c && c.phone && c.phone.includes(customerSearch))
  );

  return (
    <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>VIP Loyalty Customers & Khata Manager ({(customers || []).length})</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Manage customer 4-digit PINs, wallet coin balances & send instant promotional bonus rewards
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white w-48 sm:w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <div
            key={customer.phone}
            className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{customer.name}</h4>
                <p className="text-xs text-[#A5B4CC] font-mono mt-0.5">📱 {customer.phone}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px]">
                  📍 {customer.address || 'Local Customer'}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
                  <RealGoldCoinIcon size="sm" />
                  <span>{customer.coins || 0}</span>
                </div>
                <p className="text-[10px] text-[#A5B4CC] mt-1 font-mono">PIN: {customer.pin || '1234'}</p>
              </div>
            </div>

            {/* Send Bonus Coins Widget */}
            <div className="bg-[#0A0E1E]/80 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-amber-300 uppercase">Award Bonus Coins & Message:</p>
                <div className="flex gap-1 text-xs">
                  {['🎉', '🎁', '🪙', '👑', '⭐', '🥳'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        const current = awardReasonMap[customer.phone] || '';
                        setAwardReasonMap({ ...awardReasonMap, [customer.phone]: `${current} ${emoji}`.trim() });
                      }}
                      className="hover:scale-125 transition-transform cursor-pointer"
                      title="Add Emoji"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Coins (e.g. 50)"
                    value={awardCoinsMap[customer.phone] || ''}
                    onChange={e => setAwardCoinsMap({ ...awardCoinsMap, [customer.phone]: e.target.value })}
                    className="w-1/3 px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="VIP Message (e.g. 🎉 Diwali Special Bonus!)"
                    value={awardReasonMap[customer.phone] || ''}
                    onChange={e => setAwardReasonMap({ ...awardReasonMap, [customer.phone]: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => handleSendBonusCoins(customer.phone)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black rounded-lg text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <RealGoldCoinIcon size="sm" />
                  <span>Send Coins & VIP Notification Message</span>
                </button>
              </div>
            </div>

            {/* Quick PIN Reset */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-xs">
              <input
                type="text"
                maxLength={4}
                placeholder="New 4-digit PIN"
                value={resetPinMap[customer.phone] || ''}
                onChange={e => setResetPinMap({ ...resetPinMap, [customer.phone]: e.target.value })}
                className="w-28 px-2.5 py-1 bg-[#0A0E1E] border border-white/10 rounded-lg text-xs text-white text-center font-mono"
              />
              <button
                onClick={() => handleResetPin(customer.phone)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Reset PIN
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
