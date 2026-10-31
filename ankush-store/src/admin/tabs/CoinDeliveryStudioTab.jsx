import React, { useState } from 'react';
import { useStore } from '../../StoreContext';
import GlassButton from '../components/GlassButton';
import { Sparkles, MapPin, Check, Plus, Trash2 } from '../../components/Icons';

export default function CoinDeliveryStudioTab({ onToast }) {
  const { storeSettings, updateStoreSettings } = useStore();

  // Coin Earning Rules State
  const [coinRulesEnabled, setCoinRulesEnabled] = useState(storeSettings.coinRules?.isEnabled !== false);
  const [spendPerCoin, setSpendPerCoin] = useState(storeSettings.coinRules?.spendPerCoin || 100);
  const [coinsPerSpend, setCoinsPerSpend] = useState(storeSettings.coinRules?.coinsEarnedPerSpend || 2);
  const [minOrderToEarn, setMinOrderToEarn] = useState(storeSettings.coinRules?.minOrderToEarn || 200);

  // Monthly 3-Bar Ranking Milestones State
  const defaultBars = [
    {
      id: 1,
      title: "Silver Milestone",
      targetSpend: 2000,
      rewardCoins: 50,
      themeName: "Emerald Mint",
      gradient: "from-emerald-500 via-teal-500 to-green-400",
      accentBg: "bg-emerald-500",
      icon: "🥈"
    },
    {
      id: 2,
      title: "Gold VIP Milestone",
      targetSpend: 5000,
      rewardCoins: 150,
      themeName: "Royal Gold",
      gradient: "from-amber-500 via-orange-500 to-yellow-400",
      accentBg: "bg-amber-500",
      icon: "🥇"
    },
    {
      id: 3,
      title: "Diamond Royal Milestone",
      targetSpend: 10000,
      rewardCoins: 300,
      themeName: "Cosmic Diamond",
      gradient: "from-fuchsia-600 via-purple-600 to-indigo-500",
      accentBg: "bg-fuchsia-600",
      icon: "💎"
    }
  ];

  const [rankingBars, setRankingBars] = useState(storeSettings.monthlyRankingBars || defaultBars);

  // Delivery KM Zones State
  const defaultDelivery = {
    maxRadiusKm: 15,
    freeDeliveryMinOrder: 1500,
    slabs: [
      { id: 1, maxKm: 2, charge: 20, minOrderForFree: 500, label: "Up to 2 km" },
      { id: 2, maxKm: 5, charge: 40, minOrderForFree: 1000, label: "2 to 5 km" },
      { id: 3, maxKm: 10, charge: 70, minOrderForFree: 1500, label: "5 to 10 km" },
      { id: 4, maxKm: 15, charge: 120, minOrderForFree: 2000, label: "10 to 15 km" }
    ]
  };

  const [deliveryConfig, setDeliveryConfig] = useState(() => {
    const cfg = storeSettings.deliveryDistanceConfig || defaultDelivery;
    const slabs = (cfg.slabs && cfg.slabs.length > 0 ? cfg.slabs : defaultDelivery.slabs).map(s => ({
      ...s,
      maxKm: Number(s.maxKm),
      charge: Number(s.charge),
      minOrderForFree: s.minOrderForFree !== undefined ? Number(s.minOrderForFree) : (Number(s.maxKm) <= 2 ? 1500 : 0),
      label: s.label || `Up to ${s.maxKm} km`
    }));
    return { ...cfg, slabs };
  });
  const [newSlabMaxKm, setNewSlabMaxKm] = useState('');
  const [newSlabCharge, setNewSlabCharge] = useState('');
  const [newSlabMinOrderForFree, setNewSlabMinOrderForFree] = useState('');
  const [newSlabLabel, setNewSlabLabel] = useState('');

  // Handle Save Coin Rules
  const handleSaveCoinRules = async () => {
    const updated = {
      ...storeSettings,
      coinRules: {
        isEnabled: coinRulesEnabled,
        spendPerCoin: Number(spendPerCoin) || 100,
        coinsEarnedPerSpend: Number(coinsPerSpend) || 2,
        minOrderToEarn: Number(minOrderToEarn) || 200
      },
      monthlyRankingBars: rankingBars
    };
    await updateStoreSettings(updated);
    if (onToast) onToast('Coin Rules Saved', 'VIP loyalty settings & monthly ranking bars updated.');
  };

  // Handle Save Delivery Config
  const handleSaveDeliveryConfig = async () => {
    const updated = {
      ...storeSettings,
      deliveryDistanceConfig: deliveryConfig
    };
    await updateStoreSettings(updated);
    if (onToast) onToast('Delivery Zones Saved', 'KM radius slabs and charges updated live.');
  };

  // Add New Delivery Slab
  const handleAddSlab = () => {
    if (!newSlabMaxKm || newSlabCharge === '') return;
    const kmNum = Number(newSlabMaxKm);
    const chargeNum = Number(newSlabCharge);
    const freeNum = newSlabMinOrderForFree !== '' ? Number(newSlabMinOrderForFree) : 0;
    const newSlab = {
      id: Date.now(),
      maxKm: kmNum,
      charge: chargeNum,
      minOrderForFree: freeNum,
      label: newSlabLabel.trim() || `Up to ${kmNum} km`
    };
    const updatedSlabs = [...(deliveryConfig.slabs || []), newSlab].sort((a, b) => a.maxKm - b.maxKm);
    setDeliveryConfig({ ...deliveryConfig, slabs: updatedSlabs });
    setNewSlabMaxKm('');
    setNewSlabCharge('');
    setNewSlabMinOrderForFree('');
    setNewSlabLabel('');
  };

  const handleRemoveSlab = (slabId) => {
    const updatedSlabs = (deliveryConfig.slabs || []).filter(s => s.id !== slabId);
    setDeliveryConfig({ ...deliveryConfig, slabs: updatedSlabs });
  };

  return (
    <div className="space-y-6">
      {/* =================================================================
          1. COIN EARNING RULES & CONTROLS
      ================================================================= */}
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-5 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Coin Earning & Loyalty Rules Studio</span>
            </h2>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Control automatic coin rewards on store purchases, earning ratio, and enable/disable switch
            </p>
          </div>

          <button
            onClick={() => setCoinRulesEnabled(!coinRulesEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-2 ${
              coinRulesEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            <span>{coinRulesEnabled ? '✓ Coin Earning: ACTIVE (ON)' : '✕ Coin Earning: DISABLED (OFF)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0A0E1E] p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-bold text-[#A5B4CC] uppercase block">
              Every ₹ Spend (Base Amount)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={spendPerCoin}
                onChange={e => setSpendPerCoin(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xl text-white font-mono font-bold text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400">e.g. ₹100 kharch karne par</p>
          </div>

          <div className="bg-[#0A0E1E] p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-bold text-[#A5B4CC] uppercase block">
              Coins Given to Customer
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm">🪙</span>
              <input
                type="number"
                value={coinsPerSpend}
                onChange={e => setCoinsPerSpend(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xl text-amber-300 font-mono font-bold text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400">e.g. 2 Coins (1 Coin = ₹1 Bachat)</p>
          </div>

          <div className="bg-[#0A0E1E] p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-bold text-[#A5B4CC] uppercase block">
              Minimum Order To Earn Coins
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={minOrderToEarn}
                onChange={e => setMinOrderToEarn(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xl text-white font-mono font-bold text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400">Is order amount ke upar coins milenge</p>
          </div>
        </div>

        {/* =================================================================
            2. MONTHLY 3-BAR RANKING MILESTONES (ADMIN CONTROLLED)
        ================================================================= */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏆 Monthly 3-Bar Ranking Milestones (Auto-Resets Every Month)</span>
            </h3>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Customers progress through these 3 progressive milestone bars each month. When Bar 1 finishes, Bar 2 unlocks with a new color, then Bar 3!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankingBars.map((bar, idx) => (
              <div
                key={bar.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 space-y-3 relative overflow-hidden"
              >
                <div className={`h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r ${bar.gradient}`} />
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{bar.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                    Bar {idx + 1}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#A5B4CC] font-bold">Bar Title</label>
                  <input
                    type="text"
                    value={bar.title}
                    onChange={e => {
                      const updated = rankingBars.map(b => b.id === bar.id ? { ...b, title: e.target.value } : b);
                      setRankingBars(updated);
                    }}
                    className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#A5B4CC] font-bold">Target Spend (₹)</label>
                    <input
                      type="number"
                      value={bar.targetSpend}
                      onChange={e => {
                        const updated = rankingBars.map(b => b.id === bar.id ? { ...b, targetSpend: Number(e.target.value) } : b);
                        setRankingBars(updated);
                      }}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#A5B4CC] font-bold">Bonus Reward (🪙)</label>
                    <input
                      type="number"
                      value={bar.rewardCoins}
                      onChange={e => {
                        const updated = rankingBars.map(b => b.id === bar.id ? { ...b, rewardCoins: Number(e.target.value) } : b);
                        setRankingBars(updated);
                      }}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Theme: {bar.themeName}</span>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${bar.gradient}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <GlassButton
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSaveCoinRules}
            >
              Save Coin Rules & Ranking Milestones
            </GlassButton>
          </div>
        </div>
      </div>

      {/* =================================================================
          3. DELIVERY KM ZONES & CUSTOM CHARGES STUDIO
      ================================================================= */}
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Delivery KM Radius & Dynamic Pricing Manager</span>
            </h2>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Set maximum delivery boundary from Khorma Store and configure charges per KM slab (automatically calculated in bill)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0A0E1E] p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-bold text-[#A5B4CC] uppercase block">
              Max Delivery Radius (Boundary)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={deliveryConfig.maxRadiusKm}
                onChange={e => setDeliveryConfig({ ...deliveryConfig, maxRadiusKm: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xl text-white font-mono font-bold text-sm"
              />
              <span className="text-sm font-bold text-slate-400">km</span>
            </div>
            <p className="text-[10px] text-slate-400">Is boundary ke bahar order reject hoga</p>
          </div>

          <div className="bg-[#0A0E1E] p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-bold text-[#A5B4CC] uppercase block">
              Free Delivery Minimum Order Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={deliveryConfig.freeDeliveryMinOrder}
                onChange={e => setDeliveryConfig({ ...deliveryConfig, freeDeliveryMinOrder: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xl text-emerald-400 font-mono font-bold text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400">Is amount ke upar under 2 km delivery ₹0 FREE hogi</p>
          </div>
        </div>

        {/* Existing Slabs Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Delivery Slabs & Rates
              </h4>
              <p className="text-[11px] text-[#A5B4CC] mt-0.5">
                Har KM slab ka distance, delivery charge, aur free delivery amount threshold aap yahan se direct control kar sakte hain.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              {(deliveryConfig.slabs || []).length} Active Slabs
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0A0E1E] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Distance (KM)</th>
                  <th className="p-3">Delivery Charge (₹)</th>
                  <th className="p-3">Free Delivery Order Min (₹)</th>
                  <th className="p-3">Zone Description / Label</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(deliveryConfig.slabs || []).map((slab) => (
                  <tr key={slab.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono font-bold text-white">
                        <span>≤</span>
                        <input
                          type="number"
                          value={slab.maxKm}
                          onChange={e => {
                            const updated = deliveryConfig.slabs.map(s => s.id === slab.id ? { ...s, maxKm: Number(e.target.value) } : s);
                            setDeliveryConfig({ ...deliveryConfig, slabs: updated });
                          }}
                          className="w-16 bg-black/40 border border-white/10 px-2 py-1 rounded text-xs text-white font-bold"
                        />
                        <span>km</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                        <span>₹</span>
                        <input
                          type="number"
                          value={slab.charge}
                          onChange={e => {
                            const updated = deliveryConfig.slabs.map(s => s.id === slab.id ? { ...s, charge: Number(e.target.value) } : s);
                            setDeliveryConfig({ ...deliveryConfig, slabs: updated });
                          }}
                          className="w-20 bg-black/40 border border-white/10 px-2 py-1 rounded text-xs text-emerald-400 font-bold"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
                        <span>₹</span>
                        <input
                          type="number"
                          placeholder="0 (No Free)"
                          value={slab.minOrderForFree !== undefined ? slab.minOrderForFree : ''}
                          onChange={e => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            const updated = deliveryConfig.slabs.map(s => s.id === slab.id ? { ...s, minOrderForFree: val } : s);
                            setDeliveryConfig({ ...deliveryConfig, slabs: updated });
                          }}
                          className="w-24 bg-black/40 border border-white/10 px-2 py-1 rounded text-xs text-amber-300 font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {slab.minOrderForFree > 0 ? `₹${slab.minOrderForFree}+ par ₹0 FREE` : 'No Free Delivery'}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={slab.label || ''}
                        onChange={e => {
                          const updated = deliveryConfig.slabs.map(s => s.id === slab.id ? { ...s, label: e.target.value } : s);
                          setDeliveryConfig({ ...deliveryConfig, slabs: updated });
                        }}
                        className="bg-black/30 border border-white/10 px-2 py-1 rounded text-xs text-slate-200 w-full max-w-xs"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveSlab(slab.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:text-white hover:bg-rose-500/40 transition-colors cursor-pointer"
                        title="Delete Slab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Slab Form */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <p className="text-[11px] font-bold text-emerald-300 uppercase">+ Add New KM Distance Slab:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Max Distance (KM) *</label>
              <input
                type="number"
                placeholder="e.g. 7"
                value={newSlabMaxKm}
                onChange={e => setNewSlabMaxKm(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Delivery Charge (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={newSlabCharge}
                onChange={e => setNewSlabCharge(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500 (0 = No Free)"
                value={newSlabMinOrderForFree}
                onChange={e => setNewSlabMinOrderForFree(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Zone Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Up to 7 km"
                value={newSlabLabel}
                onChange={e => setNewSlabLabel(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleAddSlab}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add KM Slab to Table</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton
            variant="primary"
            size="md"
            icon={Check}
            onClick={handleSaveDeliveryConfig}
          >
            Save Delivery Radius & KM Charges
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
