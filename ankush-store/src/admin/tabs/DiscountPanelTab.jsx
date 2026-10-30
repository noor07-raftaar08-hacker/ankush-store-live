import React, { useState, useMemo } from 'react';
import { useStore } from '../../StoreContext';
import { Sparkles, Check, Trash2 } from '../../components/Icons';

// Monotone Spline Generator (Same as Analytics Hub)
function mono(p) {
  const n = p.length;
  if (n < 2) return n ? 'M' + p[0][0] + ',' + p[0][1] : '';
  const s = [];
  const t = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    const dx = p[i + 1][0] - p[i][0] || 1;
    s.push((p[i + 1][1] - p[i][1]) / dx);
  }
  t[0] = s[0];
  t[n - 1] = s[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = s[i - 1] * s[i] <= 0 ? 0 : (s[i - 1] + s[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
    } else {
      const a = t[i] / s[i];
      const b = t[i + 1] / s[i];
      const h = a * a + b * b;
      if (h > 9) {
        const k = 3 / Math.sqrt(h);
        t[i] = k * a * s[i];
        t[i + 1] = k * b * s[i];
      }
    }
  }
  let d = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1);
  for (let i = 0; i < n - 1; i++) {
    const dx = (p[i + 1][0] - p[i][0]) / 3;
    const c1x = (p[i][0] + dx).toFixed(1);
    const c1y = (p[i][1] + t[i] * dx).toFixed(1);
    const c2x = (p[i + 1][0] - dx).toFixed(1);
    const c2y = (p[i + 1][1] - t[i + 1] * dx).toFixed(1);
    const ex = p[i + 1][0].toFixed(1);
    const ey = p[i + 1][1].toFixed(1);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
  }
  return d;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DiscountPanelTab({ onToast }) {
  const {
    products,
    orders,
    updateProductDiscount
  } = useStore();

  const [discountSearch, setDiscountSearch] = useState('');
  const [selectedDiscountProductId, setSelectedDiscountProductId] = useState(() => products[0]?.id || 1);
  const [discountCelebration, setDiscountCelebration] = useState(false);
  const [timeView, setTimeView] = useState('7d'); // '7d' | '30d'
  const [hoveredChartIdx, setHoveredChartIdx] = useState(null);

  const selectedDiscountProduct = products.find(p => p.id === selectedDiscountProductId) || products[0];
  const selectedProdUnit = selectedDiscountProduct?.unit || 'kg';

  const [discountForm, setDiscountForm] = useState(() => selectedDiscountProduct?.discountConfig || {
    isActive: true,
    badgeText: 'Special Offer',
    badgeColor: 'red',
    offerType: 'QUANTITY_BASED',
    productUnit: selectedProdUnit,
    quantityRules: [
      { minQty: 3, discountAmount: 10, unitLabel: selectedProdUnit, label: `3 ${selectedProdUnit} par ₹10 Discount` },
      { minQty: 5, discountAmount: 25, unitLabel: selectedProdUnit, label: `5 ${selectedProdUnit} par ₹25 Discount` }
    ],
    bogoConfig: { buyQty: 1, getFreeQty: 1, applicablePackageWeight: 'ALL', conditionText: `Buy 1 ${selectedProdUnit} Get 1 ${selectedProdUnit} Free` },
    flatDiscountAmount: 0,
    percentDiscount: 0,
    customConditionText: ''
  });

  const [ruleMinQty, setRuleMinQty] = useState('');
  const [ruleDiscAmt, setRuleDiscAmt] = useState('');

  // When selected product changes, reset discountForm
  const handleSelectProduct = (prod) => {
    setSelectedDiscountProductId(prod.id);
    const u = prod.unit || 'kg';
    setDiscountForm(prod.discountConfig || {
      isActive: true,
      badgeText: 'Special Offer',
      badgeColor: 'red',
      offerType: 'QUANTITY_BASED',
      productUnit: u,
      quantityRules: [
        { minQty: 3, discountAmount: 10, unitLabel: u, label: `3 ${u} par ₹10 Discount` }
      ],
      bogoConfig: { buyQty: 1, getFreeQty: 1, applicablePackageWeight: 'ALL', conditionText: `Buy 1 ${u} Get 1 ${u} Free` },
      flatDiscountAmount: 0,
      percentDiscount: 0,
      customConditionText: ''
    });
  };

  const handleAddQuantityRule = () => {
    if (!ruleMinQty || !ruleDiscAmt) return;
    const minQ = Number(ruleMinQty);
    const discA = Number(ruleDiscAmt);
    const rules = [...(discountForm.quantityRules || [])];
    rules.push({
      minQty: minQ,
      discountAmount: discA,
      unitLabel: selectedProdUnit,
      label: `${minQ} ${selectedProdUnit.toUpperCase()} par ₹${discA} Discount`
    });
    setDiscountForm({ ...discountForm, quantityRules: rules });
    setRuleMinQty('');
    setRuleDiscAmt('');
  };

  const handleSaveDiscountConfig = (e) => {
    e.preventDefault();
    if (!selectedDiscountProduct) return;

    const finalConfig = {
      ...discountForm,
      productUnit: selectedProdUnit
    };

    updateProductDiscount(selectedDiscountProduct.id, finalConfig);
    setDiscountCelebration(true);
    setTimeout(() => setDiscountCelebration(false), 2400);
    if (onToast) onToast('Discount Configured', `Rules active for ${selectedDiscountProduct.name}.`);
  };

  // 100% REAL DISCOUNT IMPACT ENGINE FROM ACTUAL ORDERS
  const discountStats = useMemo(() => {
    let totalDiscountGiven = 0;
    let ordersWithDiscount = 0;
    const now = new Date();

    const weekdayDiscounts = Array(7).fill(0);
    const weekdayOrders = Array(7).fill(0);

    orders.forEach(o => {
      const disc = Number(o.totalDiscount) || 0;
      if (disc > 0) {
        totalDiscountGiven += disc;
        ordersWithDiscount += 1;
      }
      const oDate = new Date(o.orderDate || now);
      const dow = (oDate.getDay() + 6) % 7; // Mon = 0
      weekdayDiscounts[dow] += disc;
      weekdayOrders[dow] += (disc > 0 ? 1 : 0);
    });

    const maxDow = Math.max(...weekdayDiscounts, 10);
    const W = 620;
    const H = 220;
    const pl = 44;
    const pr = 16;
    const pt = 20;
    const pb = 32;

    const X = i => pl + i * (W - pl - pr) / 6;
    const Y = v => pt + (1 - (v / maxDow)) * (H - pt - pb);

    const pts = weekdayDiscounts.map((v, i) => [X(i), Y(v)]);
    const linePath = mono(pts);
    const areaPath = `${linePath} L${X(6)},${Y(0)} L${X(0)},${Y(0)} Z`;

    return {
      totalDiscountGiven,
      ordersWithDiscount,
      avgDiscount: ordersWithDiscount > 0 ? Math.round(totalDiscountGiven / ordersWithDiscount) : 0,
      weekdayDiscounts,
      weekdayOrders,
      W, H, pl, pr, pt, pb, X, Y, pts, linePath, areaPath, maxDow
    };
  }, [orders]);

  return (
    <div className="space-y-6 text-[var(--text,#f6f2ff)] font-sans">
      
      {/* Top 3 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customer Discount</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-300 mt-1 tabular-nums">
            ₹{discountStats.totalDiscountGiven.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Deducted from customer orders</p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discounted Orders</p>
          <h3 className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1 tabular-nums">
            {discountStats.ordersWithDiscount} Orders
          </h3>
          <p className="text-xs text-slate-400 mt-1">Benefited from active offers</p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Discount / Order</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 tabular-nums">
            ₹{discountStats.avgDiscount.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Customer savings per order</p>
        </div>
      </div>

      {/* Discount Velocity Spline Curve (Matches Analytics Hub Style) */}
      <div className="liquid-glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Offer Savings & Discount Velocity</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekday discount deductions across customer purchases (Mon - Sun)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Total ₹{discountStats.totalDiscountGiven.toLocaleString('en-IN')} Saved
            </span>
          </div>
        </div>

        {/* Spline Chart Canvas */}
        <div className="relative pt-2">
          <svg viewBox={`0 0 ${discountStats.W} ${discountStats.H}`} className="chart-canvas w-full h-48 sm:h-56 overflow-visible select-none">
            <defs>
              <linearGradient id="discLg1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--c1, #ff2e93)" />
                <stop offset="60%" stopColor="var(--c2, #00e5ff)" />
                <stop offset="100%" stopColor="var(--c3, #b6ff3b)" />
              </linearGradient>
              <linearGradient id="discLg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c1, #ff2e93)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--c1, #ff2e93)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = discountStats.pt + pct * (discountStats.H - discountStats.pt - discountStats.pb);
              const val = Math.round(discountStats.maxDow * (1 - pct));
              return (
                <g key={idx}>
                  <line
                    x1={discountStats.pl}
                    x2={discountStats.W - discountStats.pr}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="3 5"
                  />
                  <text x={discountStats.pl - 8} y={y + 4} textAnchor="end" fill="var(--muted, #a9a1d0)" fontSize="10">
                    ₹{val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={discountStats.areaPath} fill="url(#discLg2)" />

            {/* Spline Curve */}
            <path
              d={discountStats.linePath}
              fill="none"
              stroke="url(#discLg1)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Weekday Data Points */}
            {discountStats.pts.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={hoveredChartIdx === i ? 6 : 4}
                  fill="var(--c1, #ff2e93)"
                  stroke="#0b0720"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredChartIdx(i)}
                  onMouseLeave={() => setHoveredChartIdx(null)}
                />
                <text
                  x={pt[0]}
                  y={discountStats.H - 12}
                  textAnchor="middle"
                  fill="var(--muted, #a9a1d0)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {DAYS[i]}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Info Strip */}
          <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            {hoveredChartIdx !== null ? (
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">{DAYS[hoveredChartIdx]}:</span>
                <span className="text-rose-300 font-black">₹{discountStats.weekdayDiscounts[hoveredChartIdx]} discount</span>
                <span className="text-slate-400">({discountStats.weekdayOrders[hoveredChartIdx]} orders)</span>
              </div>
            ) : (
              <p className="text-slate-400">
                👆 Chart ke kisi bhi din par hover karein us din ka discount impact dekhne ke liye.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Discount Form & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selector */}
        <div className="lg:col-span-5 liquid-glass-panel rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-cyan-300">1. Select Product for Discount</h3>
          <input
            type="text"
            placeholder="🔍 Search product..."
            value={discountSearch}
            onChange={e => setDiscountSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {products
              .filter(p => p.name.toLowerCase().includes(discountSearch.toLowerCase()))
              .map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    prod.id === selectedDiscountProductId
                      ? 'bg-violet-500/20 border-violet-400 shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-400">Base Price: ₹{prod.price} / {prod.unit}</p>
                  </div>
                  {prod.discountConfig?.isActive && prod.discountConfig?.offerType !== 'NONE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Offer Active
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right: Configure Rule Form */}
        <div className="lg:col-span-7 liquid-glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                2. Configure Offer for: <span className="text-cyan-300">{selectedDiscountProduct?.name}</span>
              </h3>
              <p className="text-xs text-slate-400">Unit: {selectedProdUnit}</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={discountForm.isActive}
                onChange={e => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span>Offer Active</span>
            </label>
          </div>

          <form onSubmit={handleSaveDiscountConfig} className="space-y-4">
            {/* Offer Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Offer Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'NONE', label: 'No Offer' },
                  { id: 'PERCENT', label: '% Discount' },
                  { id: 'CUSTOM', label: '₹ Flat Discount' },
                  { id: 'QUANTITY_BASED', label: 'Unit / Combo' },
                  { id: 'BOGO', label: 'Buy 1 Get 1' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      const updates = { offerType: t.id };
                      if (t.id === 'PERCENT' && !discountForm.percentDiscount) {
                        updates.percentDiscount = 15;
                        updates.badgeText = '15% OFF';
                      }
                      setDiscountForm({ ...discountForm, ...updates });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      discountForm.offerType === t.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Text & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={discountForm.badgeText}
                  onChange={e => setDiscountForm({ ...discountForm, badgeText: e.target.value })}
                  placeholder="e.g. Special Offer, Extra Savings"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Badge Color
                </label>
                <select
                  value={discountForm.badgeColor}
                  onChange={e => setDiscountForm({ ...discountForm, badgeColor: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="red">Red</option>
                  <option value="purple">Purple</option>
                  <option value="amber">Amber / Gold</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Blue</option>
                </select>
              </div>
            </div>

            {/* Conditional Type Configs */}
            {discountForm.offerType === 'QUANTITY_BASED' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <p className="text-xs font-bold text-white">Quantity Rules (e.g. 3 {selectedProdUnit} par ₹10 discount):</p>
                <div className="space-y-2">
                  {(discountForm.quantityRules || []).map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                      <span>{rule.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextRules = discountForm.quantityRules.filter((_, i) => i !== idx);
                          setDiscountForm({ ...discountForm, quantityRules: nextRules });
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="number"
                    placeholder={`Min ${selectedProdUnit}`}
                    value={ruleMinQty}
                    onChange={e => setRuleMinQty(e.target.value)}
                    className="w-1/3 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="₹ Discount"
                    value={ruleDiscAmt}
                    onChange={e => setRuleDiscAmt(e.target.value)}
                    className="w-1/3 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuantityRule}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    + Add Rule
                  </button>
                </div>
              </div>
            )}

            {discountForm.offerType === 'BOGO' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">Buy 1 Get 1 Free Rule:</p>
                <input
                  type="text"
                  value={discountForm.bogoConfig?.conditionText || `Buy 1 ${selectedProdUnit} Get 1 Free`}
                  onChange={e => setDiscountForm({
                    ...discountForm,
                    bogoConfig: { ...discountForm.bogoConfig, conditionText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
            )}

            {discountForm.offerType === 'PERCENT' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <p className="text-xs font-bold text-white">Percentage Discount (% OFF):</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    placeholder="e.g. 15, 20"
                    value={discountForm.percentDiscount || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0;
                      setDiscountForm({
                        ...discountForm,
                        percentDiscount: val,
                        badgeText: val > 0 ? `${val}% OFF` : discountForm.badgeText
                      });
                    }}
                    className="w-36 px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                  />
                  <span className="text-xs font-bold text-rose-300">
                    {discountForm.percentDiscount > 0 ? `${discountForm.percentDiscount}% discount calculated on each purchase` : 'Enter discount %'}
                  </span>
                </div>
              </div>
            )}

            {discountForm.offerType === 'CUSTOM' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <p className="text-xs font-bold text-white">Flat Discount Amount (₹ OFF):</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="₹ Flat Discount"
                    value={discountForm.flatDiscountAmount || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0;
                      setDiscountForm({
                        ...discountForm,
                        flatDiscountAmount: val,
                        badgeText: val > 0 ? `₹${val} OFF` : discountForm.badgeText
                      });
                    }}
                    className="flex-1 px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-lg shadow-violet-900/40 hover:opacity-95 transition-all cursor-pointer"
            >
              {discountCelebration ? '✓ Offer Saved Live!' : 'Save & Activate Offer'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
