import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../StoreContext';
import GlassButton from '../components/GlassButton';
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  Package,
  Users,
  Search,
  Eye,
  Copy,
  Check,
  MoreHorizontal,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from '../../components/Icons';

// Monotone Cubic Hermite Spline (Exact formula from User Code)
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

function niceScale(max) {
  const target = (max > 0 ? max : 1) * 1.06;
  const raw = target / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const s = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  return { step: s, top: Math.ceil(target / s - 1e-9) * s };
}

export default function OverviewTab({
  onNavigateTab,
  onInspectOrder,
  onToast,
  activeChartColors = ['#8B5CF6', '#67E8F9', '#34D399', '#C4B5FD', '#FBBF24', '#FB7185']
}) {
  const {
    products,
    customers,
    orders,
    confirmDelivery,
    getPendingOrders,
    getDeliveredOrders,
    storeSettings
  } = useStore();

  const [timeframe, setTimeframe] = useState('30D');
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('All');
  const [hoveredPointIdx, setHoveredPointIdx] = useState(null);

  const pendingOrders = useMemo(() => getPendingOrders(), [orders]);
  const deliveredOrders = useMemo(() => getDeliveredOrders(), [orders]);

  const storeGrandRevenue = useMemo(() => {
    return orders.reduce((s, o) => s + (Number(o.finalAmount) || 0), 0);
  }, [orders]);

  // Analytics by Timeframe - Real Data Engine from Actual Store Orders
  const storeAnalytics = useMemo(() => {
    const now = new Date();

    const calcRealStats = (labels, filterFn, bucketIdxFn) => {
      const n = labels.length;
      const rawValues = Array(n).fill(0);
      const counts = Array(n).fill(0);
      let total = 0;

      orders.forEach(o => {
        const oTime = Date.parse(o.orderDate || o.createdAt || now.toISOString());
        if (filterFn(oTime, now)) {
          const bIdx = bucketIdxFn(oTime, now, n);
          if (bIdx >= 0 && bIdx < n) {
            const amt = Number(o.finalAmount) || 0;
            rawValues[bIdx] += amt;
            counts[bIdx] += 1;
            total += amt;
          }
        }
      });

      return {
        totalAmountNum: total,
        totalRevenue: `₹${total.toLocaleString('en-IN')}`,
        delta: total > 0 ? `+${counts.reduce((a, b) => a + b, 0)} orders` : 'Synced',
        labels,
        rawValues,
        orderCounts: counts
      };
    };

    return {
      '24H': calcRealStats(
        ['8 AM', '10 AM', '12 PM', '3 PM', '5 PM', '7 PM', '9 PM'],
        (t, n) => (n.getTime() - t) <= 86400000,
        (t) => {
          const hr = new Date(t).getHours();
          if (hr < 9) return 0;
          if (hr < 11) return 1;
          if (hr < 14) return 2;
          if (hr < 16) return 3;
          if (hr < 18) return 4;
          if (hr < 20) return 5;
          return 6;
        }
      ),
      '7D': calcRealStats(
        ['Som', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani', 'Ravi'],
        (t, n) => (n.getTime() - t) <= 7 * 86400000,
        (t) => (new Date(t).getDay() + 6) % 7
      ),
      '30D': calcRealStats(
        ['W1', 'W2', 'W3', 'W4', 'W5', 'Recent', 'Today'],
        (t, n) => (n.getTime() - t) <= 30 * 86400000,
        (t, n) => Math.min(6, Math.max(0, Math.floor(((n.getTime() - t) / (30 * 86400000)) * 7)))
      ),
      '90D': calcRealStats(
        ['M1-A', 'M1-B', 'M2-A', 'M2-B', 'M3-A', 'M3-B', 'Latest'],
        (t, n) => (n.getTime() - t) <= 90 * 86400000,
        (t, n) => Math.min(6, Math.max(0, Math.floor(((n.getTime() - t) / (90 * 86400000)) * 7)))
      ),
      '1Y': calcRealStats(
        ['Q1', 'Q2', 'Q3', 'Q4', 'Festive', 'Prev Mo', 'This Mo'],
        (t, n) => (n.getTime() - t) <= 365 * 86400000,
        (t, n) => Math.min(6, Math.max(0, Math.floor(((n.getTime() - t) / (365 * 86400000)) * 7)))
      )
    };
  }, [orders]);

  const currentAnalytics = storeAnalytics[timeframe] || storeAnalytics['30D'];

  // Smooth Monotone Hermite Spline Path
  const chartPath = useMemo(() => {
    const vals = currentAnalytics.rawValues;
    const width = 640;
    const height = 180;
    const paddingX = 28;
    const paddingY = 22;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const n = vals.length;
    const maxVal = Math.max(...vals, 10);
    const sc = niceScale(maxVal);

    const X = i => n === 1 ? paddingX + usableW / 2 : paddingX + (i / Math.max(1, n - 1)) * usableW;
    const Y = v => paddingY + (1 - (Number(v) || 0) / sc.top) * usableH;

    const points = vals.map((v, i) => [X(i), Y(v)]);
    const line = mono(points);
    const area = n > 1 ? `${line} L ${X(n - 1)} ${height} L ${X(0)} ${height} Z` : '';

    return { line, area, points, top: sc.top, X, Y };
  }, [currentAnalytics]);

  // Fluid Progress Counter for Overview Revenue
  const [ovAnimProgress, setOvAnimProgress] = useState(1);
  useEffect(() => {
    let start = null;
    const duration = 850;
    let animId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const easeVal = 1 - Math.pow(1 - progress, 3);
      setOvAnimProgress(easeVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    setOvAnimProgress(0);
    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [timeframe, orders.length]);

  // Store Activity Stream
  const recentActivities = useMemo(() => {
    const acts = [];
    if (orders.length > 0) {
      orders.slice(0, 3).forEach((o) => {
        acts.push({
          id: `act-${o.id}`,
          title: `${o.customerName} placed Order ${o.id}`,
          description: `${(o.items || []).length} items • ${o.customerAddress}`,
          timestamp: new Date(o.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: o.status === 'delivered' ? 'emerald' : 'cyan',
          badge: `₹${Number(o.finalAmount).toFixed(0)}`,
          icon: o.status === 'delivered' ? ShieldCheck : ShoppingCart
        });
      });
    }
    acts.push(
      {
        id: 'act-disc',
        title: `${products.filter(p => p.discountConfig?.isActive).length} Product Offers Active`,
        description: 'Dynamic quantity rules & BOGO configured on storefront.',
        timestamp: 'Active',
        status: 'violet',
        badge: 'Offers Active',
        icon: Zap
      },
      {
        id: 'act-vip',
        title: `${customers.length} VIP Loyalty Accounts`,
        description: '4-digit PIN authentication & coin rewards enabled.',
        timestamp: 'Active',
        status: 'amber',
        badge: 'VIP Club',
        icon: Users
      }
    );
    return acts.slice(0, 5);
  }, [orders, products, customers.length]);

  // Filtered Overview Orders
  const overviewFilteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const statusMatch =
        txStatusFilter === 'All' ||
        (txStatusFilter === 'Completed' && ord.status === 'delivered') ||
        (txStatusFilter === 'Processing' && ord.status !== 'delivered');
      const q = txSearch.toLowerCase().trim();
      const queryMatch =
        !q ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.id && ord.id.toLowerCase().includes(q)) ||
        (ord.customerPhone && ord.customerPhone.includes(q));
      return statusMatch && queryMatch;
    });
  }, [orders, txStatusFilter, txSearch]);

  return (
    <div className="space-y-6">
      {/* 1. TOP KPI METRICS ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Store Sales */}
        <div className="liquid-glass-card rounded-[24px] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A5B4CC] uppercase tracking-wider">Total Sales</span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tabular-nums">
              ₹{Math.round(storeGrandRevenue * ovAnimProgress).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span>{orders.length > 0 ? `● ${orders.length} Orders` : '● 0 Orders'}</span>
              <span className="text-slate-400 font-normal">{orders.length > 0 ? 'Store Database' : 'Awaiting first order'}</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Pending Orders */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('pending')}
          className="liquid-glass-card rounded-[24px] p-5 relative overflow-hidden group cursor-pointer hover:border-amber-400/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A5B4CC] uppercase tracking-wider">Pending Orders</span>
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-300">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-300 tabular-nums">
              {pendingOrders.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Requires confirmation</p>
          </div>
        </div>

        {/* KPI 3: Store Products */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('add-product')}
          className="liquid-glass-card rounded-[24px] p-5 relative overflow-hidden group cursor-pointer hover:border-violet-400/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A5B4CC] uppercase tracking-wider">Active Inventory</span>
            <span className="p-2 rounded-xl bg-violet-500/15 text-violet-300">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tabular-nums">
              {products.length} Products
            </h3>
            <p className="text-xs text-violet-300 font-medium mt-1">Custom Packs Configured</p>
          </div>
        </div>

        {/* KPI 4: VIP Customers */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('customers')}
          className="liquid-glass-card rounded-[24px] p-5 relative overflow-hidden group cursor-pointer hover:border-cyan-400/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A5B4CC] uppercase tracking-wider">VIP Loyalty Accounts</span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tabular-nums">
              {customers.length} Members
            </h3>
            <p className="text-xs text-cyan-300 font-medium mt-1">4-Digit PIN Protected</p>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW CHART & TIMEFRAME TELEMETRY */}
      <section className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              <span>Revenue Trend & Order Velocity</span>
            </h3>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Aggregated across store orders, delivery completions & coin redemptions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[#0A0E1E] border border-white/10 text-xs">
              {['24H', '7D', '30D', '90D', '1Y'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[#A5B4CC] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab && onNavigateTab('analytics-hub')}
            >
              Full Screen Analytics →
            </GlassButton>
          </div>
        </div>

        {/* Monotone Cubic Hermite Spline Line Chart with Water-Flow Animation */}
        <div className="relative pt-2">
          <div className="flex items-center justify-between text-xs text-[#A5B4CC] mb-2">
            <span className="text-emerald-300 font-black text-base tabular-nums">
              ₹{Math.round(currentAnalytics.totalAmountNum * ovAnimProgress).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              {currentAnalytics.delta}
            </span>
          </div>

          <svg viewBox="0 0 640 180" className="chart-canvas w-full h-44 sm:h-52 overflow-visible select-none">
            <defs>
              <linearGradient id="ovCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeChartColors[0]} stopOpacity="0.38" />
                <stop offset="100%" stopColor={activeChartColors[0]} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Area with Water-Flow Fade */}
            <path
              key={`ov-area-${timeframe}-${orders.length}`}
              d={chartPath.area}
              fill="url(#ovCurveGrad)"
              style={{
                animation: 'chartAreaFadeIn 1s ease 0.5s forwards',
                opacity: 0
              }}
            />

            {/* Hermite Spline Curve with Water-Flow Drawing */}
            <path
              key={`ov-line-${timeframe}-${orders.length}`}
              d={chartPath.line}
              fill="none"
              stroke={activeChartColors[0]}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 2000,
                strokeDashoffset: 2000,
                animation: 'chartWaterFlow 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }}
            />

            {/* Points on Spline */}
            {chartPath.points.map((pt, idx) => (
              <circle
                key={`ov-pt-${timeframe}-${idx}`}
                cx={pt[0]}
                cy={pt[1]}
                r={hoveredPointIdx === idx ? 6.5 : 4.5}
                fill={activeChartColors[1]}
                stroke="#080B16"
                strokeWidth="2.5"
                className="cursor-pointer transition-all duration-200"
                style={{
                  animation: `chartDotPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.2 + (idx / Math.max(1, chartPath.points.length - 1)) * 1.0}s both`
                }}
                onMouseEnter={() => setHoveredPointIdx(idx)}
                onMouseLeave={() => setHoveredPointIdx(null)}
              />
            ))}
          </svg>

          {/* Labels Row */}
          <div className="flex justify-between text-[11px] text-[#A5B4CC] mt-2 font-mono">
            {currentAnalytics.labels.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STORE ACTIVITY STREAM & RECENT ORDERS TABLE */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Store Activity Feed */}
        <div className="xl:col-span-4 liquid-glass-panel rounded-[28px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Store Activity Feed</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-3">
            {recentActivities.map(act => (
              <div key={act.id} className="p-3 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/5 space-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{act.title}</span>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{act.badge}</span>
                </div>
                <p className="text-[11px] text-[#A5B4CC] leading-tight">{act.description}</p>
                <span className="text-[10px] text-slate-500 block pt-1">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Orders Table */}
        <div className="xl:col-span-8 liquid-glass-panel rounded-[28px] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Customer Orders ({orders.length})
            </h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter customer / Order ID..."
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                className="px-3 py-1.5 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white w-44"
              />
              <div className="flex bg-[#0A0E1E] p-1 rounded-xl border border-white/10 text-[11px]">
                {['All', 'Completed', 'Processing'].map(st => (
                  <button
                    key={st}
                    onClick={() => setTxStatusFilter(st)}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      txStatusFilter === st ? 'bg-violet-600 text-white' : 'text-[#A5B4CC] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#A5B4CC]">
                  <th className="py-2.5 px-2">Order ID</th>
                  <th className="py-2.5 px-2">Customer</th>
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Amount</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {overviewFilteredOrders.slice(0, 8).map(ord => {
                  const isDelivered = ord.status === 'delivered';
                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.025]">
                      <td className="py-3 px-2 font-mono text-violet-300 font-bold">{ord.id}</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-white">{ord.customerName}</p>
                        <p className="text-[10px] text-[#A5B4CC]">📱 {ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-2 text-[#A5B4CC]">
                        {new Date(ord.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-2 font-bold text-emerald-300 tabular-nums">
                        ₹{Number(ord.finalAmount).toFixed(0)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isDelivered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => onInspectOrder && onInspectOrder(ord)}
                          className="text-cyan-300 hover:underline font-semibold cursor-pointer"
                        >
                          Bill →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
