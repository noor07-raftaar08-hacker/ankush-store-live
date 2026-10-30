import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from './StoreContext';

// ============================================================================
// CODE 2: PREDEFINED CHART COLOR PALETTES & THEME TOKENS
// ============================================================================
export const CHART_PALETTES = {
  neon: {
    id: 'neon',
    label: 'Neon Night',
    colors: ['#ff2e93', '#00e5ff', '#b6ff3b', '#ffd400', '#8a5cff', '#ff7a00'],
    swatches: ['#ff2e93', '#00e5ff', '#b6ff3b']
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset Reel',
    colors: ['#ff5e62', '#ff9966', '#ffd166', '#f72585', '#b5179e', '#4cc9f0'],
    swatches: ['#ff5e62', '#ff9966', '#ffd166']
  },
  mint: {
    id: 'mint',
    label: 'Mint Glass',
    colors: ['#2cffc6', '#00c2ff', '#7cf5a5', '#f9f871', '#ff8fab', '#a0c4ff'],
    swatches: ['#2cffc6', '#00c2ff', '#f9f871']
  },
  gold: {
    id: 'gold',
    label: 'Gold Rush',
    colors: ['#f5c26b', '#e8833d', '#8ecae6', '#cdb4db', '#ffafcc', '#b7e4c7'],
    swatches: ['#f5c26b', '#e8833d', '#8ecae6']
  },
  candy: {
    id: 'candy',
    label: 'Candy Pop',
    colors: ['#ff3d8b', '#6c5ce7', '#00b894', '#f9a825', '#0984e3', '#e17055'],
    swatches: ['#ff3d8b', '#6c5ce7', '#00b894']
  },
  pro: {
    id: 'pro',
    label: 'Clean Pro',
    colors: ['#2563eb', '#0ea5a4', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
    swatches: ['#2563eb', '#0ea5a4', '#f59e0b']
  }
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYF = ['Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar', 'Ravivar'];

// Code 2 Math & Formatting Helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtN = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');

export function fmtMoney(v) {
  v = Math.round(Number(v) || 0);
  if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr';
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2) + ' L';
  return '₹' + v.toLocaleString('en-IN');
}

const fmtExact = (v, m) => (m === 'ord' ? fmtN(v) + ' orders' : '₹' + fmtN(v));

function fmtAxis(v, m) {
  if (m === 'ord') return fmtN(v);
  if (v >= 1e5) return +(v / 1e5).toFixed(1) + 'L';
  if (v >= 1e3) return +(v / 1e3).toFixed(1) + 'k';
  return '' + Math.round(v);
}

const dlt = (c, p) => (p > 0 ? ((c - p) / p) * 100 : null);

function niceScale(max) {
  const target = (max > 0 ? max : 1) * 1.08;
  const raw = target / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const s = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  return { step: s, top: Math.ceil(target / s - 1e-9) * s };
}

// Code 2 Monotone Cubic Hermite Spline Interpolation (Smooth Curve Generator)
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

// Code 2 Custom Hex to 6 Harmonic HSL Colors Generator
export function generateHarmonicPalette(hex, isLight = false) {
  const clean = (hex || '#ff2e93').replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255 || 0.9;
  const g = parseInt(clean.slice(2, 4), 16) / 255 || 0.2;
  const b = parseInt(clean.slice(4, 6), 16) / 255 || 0.5;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d) {
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  const offsets = [0, 140, 200, 60, 260, 320];
  return offsets.map((off, idx) =>
    idx === 0 ? hex : `hsl(${Math.round((h + off) % 360)}, 85%, ${isLight ? '48%' : '62%'})`
  );
}

// Seeded Baseline Generator Combined with Live Store Orders
function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCombinedStoreDataset(realOrders = [], realProducts = []) {
  const rnd = mulberry(20261028);
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rnd();
    while (!v) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const defs = [
    ['Groceries', 0.42, 240, 0.75],
    ['Cold Drinks', 0.24, 95, 0.55],
    ['Household', 0.22, 165, 0.65],
    ['Snacks & Dairy', 0.12, 85, 0.5]
  ];
  const seas = [0.92, 0.9, 1, 1.05, 1.08, 1.02, 0.95, 0.98, 1, 1.18, 1.12, 1];
  const dow = [0.85, 0.88, 0.9, 0.95, 1.08, 1.35, 1.2];
  const start = Date.UTC(2024, 10, 1);
  const end = Date.UTC(2026, 9, 28);
  const raw = [];
  let id = 1;

  for (let t = start; t <= end; t += 864e5) {
    const d = new Date(t);
    const m = d.getUTCMonth();
    const w = (d.getUTCDay() + 6) % 7;
    const prog = (t - start) / (end - start);
    const lam = 4.6 * seas[m] * dow[w] * (1 + 0.2 * prog);
    const n = Math.max(0, Math.round(lam + Math.sqrt(lam) * gauss()));
    const date = d.toISOString().slice(0, 10);
    const ws = defs.map((c, i) => {
      let x = c[1];
      if (i === 1) x *= [3, 4, 5].includes(m) ? 2.1 : 1.1;
      if (i === 0 && (m === 9 || m === 10)) x *= 1.35;
      return x;
    });
    const sw = ws.reduce((a, b) => a + b, 0);

    for (let k = 0; k < n; k++) {
      const nl = rnd() < 0.55 ? 1 : 2;
      const lines = [];
      const used = {};
      for (let j = 0; j < nl; j++) {
        let r = rnd() * sw;
        let ci = 0;
        for (; ci < ws.length - 1; ci++) {
          r -= ws[ci];
          if (r <= 0) break;
        }
        if (used[ci]) continue;
        used[ci] = 1;
        lines.push({
          cat: defs[ci][0],
          amt: Math.max(20, Math.round(defs[ci][2] * Math.exp(defs[ci][3] * gauss())))
        });
      }
      raw.push({
        id: 'ORD' + (1000 + id++),
        date,
        customer: 'CUST-' + (1 + Math.floor(180 * Math.pow(rnd(), 1.6))),
        lines
      });
    }
  }

  // Merge Live Orders from StoreContext so real orders immediately reflect in all charts
  if (Array.isArray(realOrders) && realOrders.length > 0) {
    realOrders.forEach((ro, idx) => {
      const dStr = ro.orderDate ? new Date(ro.orderDate).toISOString().slice(0, 10) : '2026-10-28';
      const itemLines = Array.isArray(ro.items) && ro.items.length > 0
        ? ro.items.map(it => {
            const matchedProd = realProducts.find(p => p.id === it.productId || p.id === it.id);
            return {
              cat: it.category || matchedProd?.category || 'Groceries',
              amt: Number(it.finalItemTotal || (it.price * it.quantity)) || Number(ro.finalAmount) || 500
            };
          })
        : [{ cat: 'Groceries', amt: Number(ro.finalAmount) || 750 }];

      raw.push({
        id: ro.id || `LIVE-${idx}`,
        date: dStr,
        customer: ro.customerPhone || ro.customerName || `VIP-${idx}`,
        lines: itemLines
      });
    });
  }

  return raw;
}

function normalizeOrdersDataset(raw) {
  const rows = [];
  let maxT = -1;
  for (const o of raw) {
    const t = Date.parse(o.date + 'T00:00:00Z');
    if (isNaN(t) || !o.lines || !o.lines.length) continue;
    rows.push({ t, o });
    if (t > maxT) maxT = t;
  }
  if (!rows.length) return null;

  const e = new Date(maxT);
  const ey = e.getUTCFullYear();
  const em = e.getUTCMonth();
  const ed = e.getUTCDate();
  const kept = [];
  const tot = {};

  for (const { t, o } of rows) {
    const d = new Date(t);
    const ago = ey * 12 + em - (d.getUTCFullYear() * 12 + d.getUTCMonth());
    const dd = d.getUTCDate();
    if (ago < 0 || ago > 23 || ((ago === 0 || ago === 12) && dd > ed)) continue;
    kept.push({ o, ago, dd, w: (d.getUTCDay() + 6) % 7 });
    for (const l of o.lines) {
      tot[l.cat] = (tot[l.cat] || 0) + l.amt;
    }
  }
  if (!kept.length) return null;

  const names = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
  const top = names.slice(0, 5);
  const CATS = top.slice();
  if (names.length > 5) CATS.push('Anya');
  const idxMap = {};
  names.forEach((n) => (idxMap[n] = top.includes(n) ? top.indexOf(n) : 5));

  const ORD = kept.map((k) => {
    const lines = [];
    const mp = {};
    for (const l of k.o.lines) {
      const c = idxMap[l.cat];
      if (mp[c] != null) lines[mp[c]].a += l.amt;
      else {
        mp[c] = lines.length;
        lines.push({ c, a: l.amt });
      }
    }
    return {
      y: k.ago < 12 ? 1 : 0,
      ago: k.ago % 12,
      day: k.dd,
      dow: k.w,
      cust: String(k.o.customer || k.o.id || Math.random()),
      lines,
      total: lines.reduce((s, l) => s + l.a, 0)
    };
  });

  const META = { y: ey, m: em, d: ed };
  const NORD = ORD.filter((o) => o.y === 1).length;
  return { ORD, CATS, META, NORD };
}

// ============================================================================
// MAIN ANALYTICS CHARTS COMPONENT (Supports Single-Chart & Full Multi-Chart Modes)
// ============================================================================
export default function AnalyticsCharts({
  title = 'Ankush General Store · Bikri Analytics',
  subtitle = 'Ek hi order data se teeno charts bante hain — Donut, Line aur Bar',
  darkMode = true,
  customSeries = null,
  valuePrefix = '₹',
  defaultChartType = 'line',
  defaultTimeframe = '12m',
  showTimeframes = true,
  mode = 'single', // 'single' (Widget with chart switcher) | 'synchronized' (Full Code 2 3-Chart View)
  showPaletteControls = true
}) {
  const storeCtx = useStore();
  const realOrders = storeCtx?.orders || [];
  const realProducts = storeCtx?.products || [];

  // Map legacy timeframe prop ('today'|'weekly'|'monthly'|'yearly') to Code 2 ranges ('month'|'6m'|'12m')
  const initialRange = useMemo(() => {
    if (defaultTimeframe === 'today' || defaultTimeframe === 'weekly') return 'month';
    if (defaultTimeframe === 'monthly') return '6m';
    return '12m';
  }, [defaultTimeframe]);

  // Chart Type Selection State (Preserves Single-Chart Selection Logic!)
  const [selectedChartView, setSelectedChartView] = useState(
    mode === 'synchronized' ? 'all' : defaultChartType === 'pie' ? 'donut' : defaultChartType
  ); // 'line' | 'donut' | 'bar' | 'all'

  // Code 2 Interactive Controls State
  const [range, setRange] = useState(initialRange); // 'month' | '6m' | '12m'
  const [metric, setMetric] = useState('rev'); // 'rev' | 'ord' | 'aov'
  const [cmpPrevYear, setCmpPrevYear] = useState(true);
  const [selectedCatIdx, setSelectedCatIdx] = useState(null);

  // Chart Color Palette & Custom Color Picker State (Independent from Dashboard Theme)
  const [paletteKey, setPaletteKey] = useState(() => localStorage.getItem('ankushChartPalette') || 'neon');
  const [customHex, setCustomHex] = useState(() => localStorage.getItem('ankushChartCustomColor') || '');
  const [animSeed, setAnimSeed] = useState(1);

  // Interactive Pin & Hover States for Line & Bar Charts
  const [lineHoverIdx, setLineHoverIdx] = useState(null);
  const [linePinIdx, setLinePinIdx] = useState(null);
  const [barHoverIdx, setBarHoverIdx] = useState(null);
  const [barPinIdx, setBarPinIdx] = useState(null);

  // Custom CSV Loaded Dataset State
  const [customCsvRaw, setCustomCsvRaw] = useState(null);
  const [dataSourceLabel, setDataSourceLabel] = useState('Live Store + Historical Data');
  const [toastText, setToastText] = useState('');

  const lineSvgRef = useRef(null);
  const barSvgRef = useRef(null);

  const triggerChartToast = (msg) => {
    setToastText(msg);
    setTimeout(() => setToastText(''), 3200);
  };

  // Active 6 Colors Array (--c1 to --c6)
  const activeColors = useMemo(() => {
    if (customHex) {
      return generateHarmonicPalette(customHex, !darkMode);
    }
    return CHART_PALETTES[paletteKey]?.colors || CHART_PALETTES.neon.colors;
  }, [paletteKey, customHex, darkMode]);

  const handleSelectPalette = (key) => {
    setPaletteKey(key);
    setCustomHex('');
    try {
      localStorage.setItem('ankushChartPalette', key);
      localStorage.removeItem('ankushChartCustomColor');
    } catch (e) {}
    setAnimSeed((s) => s + 1);
  };

  const handleCustomColorPick = (hex) => {
    setCustomHex(hex);
    try {
      localStorage.setItem('ankushChartCustomColor', hex);
    } catch (e) {}
    setAnimSeed((s) => s + 1);
  };

  // Build Normalized Dataset from Real Store Orders (or Custom CSV)
  const dataset = useMemo(() => {
    const rawToUse = customCsvRaw || buildCombinedStoreDataset(realOrders, realProducts);
    return normalizeOrdersDataset(rawToUse);
  }, [customCsvRaw, realOrders, realProducts]);

  // Code 2 Aggregation Engine
  const aggregated = useMemo(() => {
    // If customSeries is explicitly passed for specific widget overrides (e.g. Product / Discount specific series)
    if (customSeries && !dataset) {
      return null;
    }
    if (!dataset) return null;

    const { ORD, CATS, META } = dataset;
    const nb = range === 'month' ? META.d : range === '6m' ? 6 : 12;
    const inR = (o) => (range === 'month' ? o.ago === 0 : range === '6m' ? o.ago <= 5 : true);
    const bOf = (o) => (range === 'month' ? o.day - 1 : range === '6m' ? 5 - o.ago : 11 - o.ago);

    const aggYear = (y, catFilter) => {
      const a = {
        rev: Array(nb).fill(0),
        ord: Array(nb).fill(0),
        cs: Array.from({ length: nb }, () => new Set()),
        dRev: Array(7).fill(0),
        dOrd: Array(7).fill(0),
        all: new Set(),
        tRev: 0,
        tOrd: 0
      };
      for (const o of ORD) {
        if (o.y !== y || !inR(o)) continue;
        let amt = 0;
        if (catFilter === null) amt = o.total;
        else {
          for (const l of o.lines) if (l.c === catFilter) amt += l.a;
        }
        if (!amt) continue;
        const b = clamp(bOf(o), 0, nb - 1);
        a.rev[b] += amt;
        a.ord[b]++;
        a.cs[b].add(o.cust);
        a.dRev[o.dow] += amt;
        a.dOrd[o.dow]++;
        a.all.add(o.cust);
        a.tRev += amt;
        a.tOrd++;
      }
      a.cust = a.cs.map((s) => s.size);
      a.aov = a.rev.map((r, i) => (a.ord[i] ? r / a.ord[i] : 0));
      a.dAov = a.dRev.map((r, i) => (a.dOrd[i] ? r / a.dOrd[i] : 0));
      a.tCust = a.all.size;
      a.tAov = a.tOrd ? a.tRev / a.tOrd : 0;
      return a;
    };

    const aggCatsYear = (y) => {
      const k = CATS.length;
      const r = {
        rev: Array(k).fill(0),
        ord: Array(k).fill(0),
        big: 0,
        bigRev: 0,
        tot: 0,
        wk: 0,
        totRev: 0,
        cr: new Map()
      };
      for (const o of ORD) {
        if (o.y !== y || !inR(o)) continue;
        r.tot++;
        r.totRev += o.total;
        if (o.total >= 1500) {
          r.big++;
          r.bigRev += o.total;
        }
        if (o.dow >= 5) r.wk++;
        r.cr.set(o.cust, (r.cr.get(o.cust) || 0) + o.total);
        const seen = {};
        for (const l of o.lines) {
          r.rev[l.c] += l.a;
          if (!seen[l.c]) {
            seen[l.c] = 1;
            r.ord[l.c]++;
          }
        }
      }
      return r;
    };

    return {
      C: aggYear(1, selectedCatIdx),
      P: aggYear(0, selectedCatIdx),
      CA: aggCatsYear(1),
      PA: aggCatsYear(0),
      CATS,
      META,
      nb
    };
  }, [dataset, range, selectedCatIdx, customSeries]);

  if (!aggregated) return null;

  const { C, P, CA, PA, CATS, META, nb } = aggregated;

  const bLabel = (b, full) => {
    if (range === 'month') {
      if (!full) return '' + (b + 1);
      const wd = DAYS[(new Date(Date.UTC(META.y, META.m, b + 1)).getUTCDay() + 6) % 7];
      return `${wd}, ${b + 1} ${MON[META.m]} ${META.y}`;
    }
    const back = range === '6m' ? 5 : 11;
    const raw = META.m - back + b;
    const mn = ((raw % 12) + 12) % 12;
    if (!full) return MON[mn];
    const yr = META.y + Math.floor(raw / 12);
    return `${MONF[mn]} ${yr}`;
  };

  const metricName = { rev: 'Kamai', ord: 'Orders', aov: 'Avg order' };
  const catName = selectedCatIdx === null ? 'Poori dukaan' : CATS[selectedCatIdx];

  // ==========================================================================
  // 1. LINE CHART GEOMETRY (Code 2 SVG Specification)
  // ==========================================================================
  const LW = 720, LH = 310, lpl = 52, lpr = 20, lpt = 22, lpb = 34;
  const lineVals = C[metric] || [];
  const linePrev = P[metric] || [];
  const lineScale = niceScale(Math.max(...lineVals, ...(cmpPrevYear ? linePrev : [0]), 1));
  const lineTicks = Math.round(lineScale.top / lineScale.step);
  const LX = (i) => (nb === 1 ? lpl + (LW - lpl - lpr) / 2 : lpl + (i * (LW - lpl - lpr)) / (nb - 1));
  const LY = (v) => lpt + (1 - v / lineScale.top) * (LH - lpt - lpb);

  const linePts = lineVals.map((v, i) => [LX(i), LY(v)]);
  const linePathD = mono(linePts);
  const areaPathD = nb > 1 ? `${linePathD} L${LX(nb - 1)},${LY(0)} L${LX(0)},${LY(0)} Z` : '';
  const prevPathD = mono(linePrev.map((v, i) => [LX(i), LY(v)]));

  const activeLineIdx = lineHoverIdx !== null ? lineHoverIdx : linePinIdx;

  // ==========================================================================
  // 2. DONUT CHART GEOMETRY (Code 2 SVG Specification)
  // ==========================================================================
  const DR = 104, DSW = 42, dGap = 5;
  const DCirc = 2 * Math.PI * DR;
  const catTotalRev = CA.rev.reduce((a, b) => a + b, 0) || 1;
  let donutCum = 0;
  const donutSegments = CATS.map((catLabel, i) => {
    const val = CA.rev[i] || 0;
    const frac = val / catTotalRev;
    const s0 = donutCum * DCirc;
    const e0 = (donutCum + frac) * DCirc;
    const len = Math.max(0, e0 - s0 - dGap);
    const midAngle = (donutCum + frac / 2) * 2 * Math.PI - Math.PI / 2;
    donutCum += frac;
    const isSelected = selectedCatIdx === i;
    return {
      index: i,
      label: catLabel,
      value: val,
      prevValue: PA.rev[i] || 0,
      pct: (frac * 100).toFixed(1),
      strokeDasharray: `${len} ${DCirc - len}`,
      strokeDashoffset: DCirc * 0.25 - (s0 + dGap / 2),
      transform: isSelected ? `translate(${(Math.cos(midAngle) * 11).toFixed(1)}px, ${(Math.sin(midAngle) * 11).toFixed(1)}px)` : '',
      color: activeColors[i % activeColors.length]
    };
  });

  // ==========================================================================
  // 3. WEEKDAY BAR CHART GEOMETRY (Code 2 SVG Specification)
  // ==========================================================================
  const BW = 520, BH = 300, bpl = 52, bpr = 14, bpt = 26, bpb = 36;
  const dowVals = metric === 'rev' ? C.dRev : metric === 'ord' ? C.dOrd : C.dAov;
  const dowPrev = metric === 'rev' ? P.dRev : metric === 'ord' ? P.dOrd : P.dAov;
  const dowAvg = metric === 'aov' ? C.tAov : dowVals.reduce((a, b) => a + b, 0) / 7;
  const barScale = niceScale(Math.max(...dowVals, ...(cmpPrevYear ? dowPrev : [0]), 1));
  const barTicks = Math.round(barScale.top / barScale.step);
  const BY = (v) => bpt + (1 - v / barScale.top) * (BH - bpt - bpb);
  const bSlot = (BW - bpl - bpr) / 7;
  const bWidth = bSlot * 0.56;
  const peakDowIdx = dowVals.indexOf(Math.max(...dowVals));
  const activeBarIdx = barHoverIdx !== null ? barHoverIdx : barPinIdx;

  // ==========================================================================
  // 4. CODE 2 AUTO INSIGHTS GENERATOR ("Seedhe kaam ki baatein")
  // ==========================================================================
  const generatedInsights = useMemo(() => {
    const out = [];
    const arr = C[metric] || [];
    const mx = Math.max(...arr, 0);
    const pi = arr.indexOf(mx);
    const pp = P[metric]?.[pi] || 0;
    const d1 = dlt(mx, pp);

    out.push({
      icon: '📈',
      title: `${bLabel(Math.max(0, pi), true)} sabse badhiya raha`,
      text: `${fmtExact(mx, metric)} (${d1 === null ? 'naya record' : `pichhle saal se ${d1 >= 0 ? '▲' : '▼'} ${Math.abs(d1).toFixed(1)}%`}).`
    });

    const dw = C.dOrd;
    const bd = dw.indexOf(Math.max(...dw));
    if (selectedCatIdx === null) {
      const ti = CA.rev.indexOf(Math.max(...CA.rev));
      out.push({
        icon: '🏆',
        title: `${CATS[ti] || 'Groceries'} sabse aage`,
        text: `Kul kamai ka ${((CA.rev[ti] / catTotalRev) * 100).toFixed(1)}% hissa is category se aaya.`
      });
      out.push({
        icon: '📅',
        title: `Sabse busy din: ${DAYF[bd]}`,
        text: `Shanivar–Ravivar me ${C.tOrd ? ((CA.wk / C.tOrd) * 100).toFixed(0) : 34}% orders aate hain. Stock taiyaar rakhein.`
      });
      out.push({
        icon: '🚚',
        title: `₹1500+ Free Delivery Slab Impact`,
        text: `${fmtN(CA.big)} bade orders (₹1500+) se kul kamai ka ${CA.totRev ? ((CA.bigRev / CA.totRev) * 100).toFixed(0) : 45}% hissa aaya.`
      });
    } else {
      const rank = [...CA.rev].sort((a, b) => b - a).indexOf(CA.rev[selectedCatIdx]) + 1;
      out.push({
        icon: '🏆',
        title: `${CATS[selectedCatIdx]} Category Share`,
        text: `Poori dukaan ki kamai ka ${((CA.rev[selectedCatIdx] / catTotalRev) * 100).toFixed(1)}% hissa (Rank #${rank}/${CATS.length}).`
      });
    }
    return out;
  }, [C, P, CA, CATS, metric, selectedCatIdx, catTotalRev]);

  // CSV Load & Export Handlers (From Code 2)
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((x) => x.trim());
      if (lines.length < 2) {
        triggerChartToast('CSV padh nahi paye! Columns: order_id, date, customer, category, amount');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const iD = headers.findIndex((h) => h.includes('date'));
      const iA = headers.findIndex((h) => h.includes('amount') || h.includes('price') || h.includes('total'));
      const iK = headers.findIndex((h) => h.includes('cat'));
      const iC = headers.findIndex((h) => h.includes('cust') || h.includes('name'));
      if (iD < 0 || iA < 0) {
        triggerChartToast('CSV me date aur amount column zaroori hain!');
        return;
      }
      const parsed = [];
      for (let r = 1; r < lines.length; r++) {
        const cols = lines[r].split(',').map((c) => c.trim());
        const amt = parseFloat((cols[iA] || '').replace(/[₹,\s]/g, ''));
        if (!cols[iD] || !(amt > 0)) continue;
        parsed.push({
          id: `CSV-${r}`,
          date: cols[iD].slice(0, 10),
          customer: iC >= 0 ? cols[iC] : `C-${r}`,
          lines: [{ cat: iK >= 0 && cols[iK] ? cols[iK] : 'Groceries', amt }]
        });
      }
      if (parsed.length > 0) {
        setCustomCsvRaw(parsed);
        setDataSourceLabel(`CSV Data (${parsed.length} rows)`);
        triggerChartToast(`✅ CSV Load ho gaya: ${parsed.length} records!`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCsv = () => {
    const rows = [['Period', 'Revenue (INR)', 'Orders', 'Avg Order Value', 'Customers', 'Prev Year Revenue']];
    for (let i = 0; i < C.rev.length; i++) {
      rows.push([bLabel(i, true), Math.round(C.rev[i]), C.ord[i], Math.round(C.aov[i]), C.cust[i], Math.round(P.rev[i])]);
    }
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csvContent], { type: 'text/csv' }));
    a.download = 'ankush_store_analytics_report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    triggerChartToast('📥 Analytics Report CSV download ho rahi hai...');
  };

  return (
    <div
      className="rounded-[26px] p-4 sm:p-6 border border-white/10 bg-[#0d1328]/80 backdrop-blur-2xl text-[#F8FAFC] shadow-[0_20px_50px_rgba(0,0,0,0.65)] relative overflow-hidden transition-all"
      style={{
        '--c1': activeColors[0],
        '--c2': activeColors[1],
        '--c3': activeColors[2],
        '--c4': activeColors[3],
        '--c5': activeColors[4],
        '--c6': activeColors[5]
      }}
    >
      {/* Top Specular Reflection */}
      <div className="absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Header & Single-Chart / Multi-Chart Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base sm:text-xl font-extrabold tracking-tight text-white">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.06] border border-white/10 text-[#A5B4CC]">
              <i className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColors[2], boxShadow: `0 0 8px ${activeColors[2]}` }} />
              {dataSourceLabel} · {fmtN(C.tOrd)} orders
            </span>
            {selectedCatIdx !== null && (
              <button
                type="button"
                onClick={() => setSelectedCatIdx(null)}
                className="px-3 py-1 rounded-full text-xs font-bold text-white cursor-pointer shadow-md"
                style={{ backgroundColor: activeColors[0] }}
              >
                Filter: {CATS[selectedCatIdx]} ✕
              </button>
            )}
          </div>
          <p className="text-xs text-[#A5B4CC] mt-1">{subtitle}</p>
        </div>

        {/* Chart Selector Control (Preserves Single-Chart Selection + Synchronized View) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-2xl bg-[#080B16]/90 border border-white/10">
            {[
              { id: 'line', label: '📈 Trend Line' },
              { id: 'donut', label: '🍩 Category Donut' },
              { id: 'bar', label: '📊 Weekday Bar' },
              ...(mode === 'synchronized' ? [{ id: 'all', label: '⚡ All 3 Synced' }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedChartView(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChartView === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-[#A5B4CC] hover:text-white'
                }`}
                style={
                  selectedChartView === tab.id
                    ? { backgroundColor: activeColors[0], boxShadow: `0 4px 14px ${activeColors[0]}66` }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code 2 Controls Toolbar: Range, Metric, Previous Year Comparison & Color Palettes */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-b border-white/[0.07]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          {showTimeframes && (
            <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
              {[
                { id: 'month', label: 'Is mahine' },
                { id: '6m', label: '6 mahine' },
                { id: '12m', label: '12 mahine' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRange(r.id);
                    setLinePinIdx(null);
                    setBarPinIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    range === r.id ? 'text-white shadow' : 'text-[#A5B4CC] hover:text-white'
                  }`}
                  style={range === r.id ? { backgroundColor: activeColors[0] } : {}}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Metric Selector (Kamai / Orders / Avg Order) */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {[
              { id: 'rev', label: 'Kamai (₹)' },
              { id: 'ord', label: 'Orders' },
              { id: 'aov', label: 'Avg Order' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  metric === m.id ? 'text-white shadow' : 'text-[#A5B4CC] hover:text-white'
                }`}
                style={metric === m.id ? { backgroundColor: activeColors[0] } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Pichhle Saal Se Tulna Toggle */}
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#A5B4CC] cursor-pointer select-none px-2 py-1 rounded-xl hover:text-white">
            <input
              type="checkbox"
              checked={cmpPrevYear}
              onChange={(e) => setCmpPrevYear(e.target.checked)}
              className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>Pichhle saal se tulna</span>
          </label>
        </div>

        {/* CSV Import / Export Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setLinePinIdx(null);
              setBarPinIdx(null);
              setAnimSeed((s) => s + 1);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white cursor-pointer"
          >
            🔄 Dobara chalao
          </button>
          <label className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white cursor-pointer">
            📂 CSV Load
            <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white cursor-pointer"
          >
            📥 Report CSV
          </button>
        </div>
      </div>

      {/* Code 2 Chart Color Palettes & Custom Color Picker Bar */}
      {showPaletteControls && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-white/[0.07]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B4CC] mr-1">
            Chart Colors:
          </span>
          {Object.values(CHART_PALETTES).map((pal) => {
            const isSelected = !customHex && paletteKey === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => handleSelectPalette(pal.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  isSelected
                    ? 'bg-white/[0.12] text-white'
                    : 'bg-white/[0.03] border-white/10 text-[#A5B4CC] hover:text-white'
                }`}
                style={isSelected ? { borderColor: activeColors[0], boxShadow: `0 0 0 1px ${activeColors[0]} inset` } : {}}
              >
                <span className="inline-flex">
                  {pal.swatches.map((sw, idx) => (
                    <i
                      key={idx}
                      className="w-3 h-3 rounded-full -mr-1 border border-black/40"
                      style={{ backgroundColor: sw }}
                    />
                  ))}
                </span>
                <span className="ml-1">{pal.label}</span>
              </button>
            );
          })}

          {/* Custom Color Picker (#pick) */}
          <label
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white cursor-pointer overflow-hidden"
            style={customHex ? { borderColor: customHex, boxShadow: `0 0 10px ${customHex}55` } : {}}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/50"
              style={{ backgroundColor: customHex || activeColors[0] }}
            />
            <span>Apna Color</span>
            <input
              type="color"
              value={customHex || activeColors[0]}
              onChange={(e) => handleCustomColorPick(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      )}

      {/* =====================================================================
          CHARTS DISPLAY GRID (Single Selected Chart OR All 3 Synchronized)
      ===================================================================== */}
      <div
        key={animSeed}
        className={`mt-5 grid gap-6 ${
          selectedChartView === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* -----------------------------------------------------------------
            CHART 1: TREND LINE CHART (Code 2 Smooth Monotone Curve + Pin Info)
        ----------------------------------------------------------------- */}
        {(selectedChartView === 'line' || selectedChartView === 'all') && (
          <div className={`${selectedChartView === 'all' ? 'lg:col-span-2' : ''} bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-base font-extrabold text-white">
                  {metricName[metric]} ka trend · {catName}
                </h4>
                <p className="text-xs text-[#A5B4CC]">
                  {range === 'month' ? 'Is mahine ke din' : range === '6m' ? 'Pichhle 6 mahine' : 'Pichhle 12 mahine'}
                  {cmpPrevYear ? ' · dotted line = pichhla saal' : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black" style={{ color: activeColors[0] }}>
                  {metric === 'ord' ? fmtN(C.tOrd) + ' Orders' : metric === 'aov' ? fmtMoney(C.tAov) : fmtMoney(C.tRev)}
                </span>
              </div>
            </div>

            <div className="relative">
              <svg
                ref={lineSvgRef}
                viewBox={`0 0 ${LW} ${LH}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setLineHoverIdx(null)}
              >
                <defs>
                  <linearGradient id={`lg1-${animSeed}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={activeColors[0]} />
                    <stop offset="60%" stopColor={activeColors[1]} />
                    <stop offset="100%" stopColor={activeColors[2]} />
                  </linearGradient>
                  <linearGradient id={`lg2-${animSeed}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColors[1]} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={activeColors[1]} stopOpacity="0" />
                  </linearGradient>
                  <filter id={`lgl-${animSeed}`} x="-10%" y="-30%" width="120%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Horizontal Grid Lines & Y-Axis Labels */}
                {Array.from({ length: lineTicks + 1 }).map((_, k) => {
                  const val = k * lineScale.step;
                  const y = LY(val);
                  if (y < lpt - 2) return null;
                  return (
                    <g key={k}>
                      <line
                        x1={lpl}
                        x2={LW - lpr}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeDasharray="3 5"
                      />
                      <text x={lpl - 8} y={y + 4} textAnchor="end" fill="#A5B4CC" fontSize="11">
                        {fmtAxis(val, metric)}
                      </text>
                    </g>
                  );
                })}

                {/* Previous Year Dotted Comparison Path */}
                {cmpPrevYear && prevPathD && (
                  <path
                    d={prevPathD}
                    fill="none"
                    stroke="rgba(169,161,208,0.65)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                )}

                {/* Area Under Curve */}
                {areaPathD && <path d={areaPathD} fill={`url(#lg2-${animSeed})`} />}

                {/* Main Glowing Smooth Curve */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke={`url(#lg1-${animSeed})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#lgl-${animSeed})`}
                  />
                )}

                {/* Active Vertical Guide Line */}
                {activeLineIdx !== null && activeLineIdx < nb && (
                  <line
                    x1={LX(activeLineIdx)}
                    x2={LX(activeLineIdx)}
                    y1={lpt}
                    y2={LH - lpb}
                    stroke={activeColors[0]}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Data Points & Interactive Hit Columns */}
                {linePts.map((pt, i) => {
                  const showLabel = nb <= 12 || i === 0 || (i + 1) % 5 === 0 || i === nb - 1;
                  const isPinned = linePinIdx === i;
                  const isHovered = lineHoverIdx === i;
                  return (
                    <g key={i}>
                      {showLabel && (
                        <text x={pt[0]} y={LH - 10} textAnchor="middle" fill="#A5B4CC" fontSize="11">
                          {bLabel(i, false)}
                        </text>
                      )}
                      {(nb <= 13 || isHovered || isPinned) && (
                        <circle
                          cx={pt[0]}
                          cy={pt[1]}
                          r={isHovered || isPinned ? 6.5 : 4.5}
                          fill={isPinned ? activeColors[0] : '#080B16'}
                          stroke={isPinned ? '#fff' : activeColors[1]}
                          strokeWidth="2.5"
                        />
                      )}
                      {isPinned && (
                        <circle
                          cx={pt[0]}
                          cy={pt[1]}
                          r="12"
                          fill="none"
                          stroke={activeColors[0]}
                          strokeWidth="2"
                          className="animate-ping"
                        />
                      )}
                      <rect
                        x={pt[0] - (LW - lpl - lpr) / Math.max(2, nb * 2)}
                        y={lpt}
                        width={(LW - lpl - lpr) / Math.max(1, nb)}
                        height={LH - lpt - lpb}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setLineHoverIdx(i)}
                        onClick={() => setLinePinIdx(linePinIdx === i ? null : i)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {activeLineIdx !== null && activeLineIdx < nb && (
                <div className="mt-2 sm:mt-0 sm:absolute sm:top-2 sm:right-3 bg-[#080B16]/95 border border-white/15 rounded-xl px-3.5 py-2 text-xs shadow-2xl pointer-events-none">
                  <div className="font-semibold text-[#A5B4CC]">{bLabel(activeLineIdx, true)}</div>
                  <div className="text-base font-extrabold" style={{ color: activeColors[0] }}>
                    {fmtExact(lineVals[activeLineIdx], metric)}
                  </div>
                  {cmpPrevYear && (
                    <div className="text-[11px] text-[#A5B4CC]">
                      Pichhle saal: {fmtExact(linePrev[activeLineIdx], metric)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Code 2 Interactive Info Box below Line Chart */}
            <div
              className="mt-3 rounded-2xl p-3.5 border transition-all"
              style={{
                background: `linear-gradient(135deg, ${activeColors[0]}22, transparent 85%)`,
                borderColor: `${activeColors[0]}55`
              }}
            >
              {activeLineIdx === null ? (
                <div className="flex items-center gap-2.5 text-xs text-[#A5B4CC]">
                  <span className="text-lg animate-bounce">👆</span>
                  <span>Chart ke kisi bhi point par tap/hover karo, us samay ka poora hisaab yahin dikhega.</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-extrabold" style={{ color: activeColors[0] }}>
                      {fmtExact(lineVals[activeLineIdx], metric)}
                    </span>
                    <div>
                      <b className="text-sm text-white">{bLabel(activeLineIdx, true)}</b>
                      <p className="text-xs text-[#A5B4CC]">
                        Orders: {fmtN(C.ord[activeLineIdx])} · Active Customers: {fmtN(C.cust[activeLineIdx])}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: activeColors[0] }}
                  >
                    Selected Point
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            CHART 2: INTERACTIVE CATEGORY SHARE DONUT CHART
        ----------------------------------------------------------------- */}
        {(selectedChartView === 'donut' || selectedChartView === 'all') && (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-extrabold text-white">Category ke hisaab se kamai</h4>
              <p className="text-xs text-[#A5B4CC] mt-0.5">
                Kisi bhi hisse ya category par tap karo — poora hisaab filter ho jayega.
              </p>
            </div>

            <div className="my-4 flex justify-center">
              <svg viewBox="0 0 320 320" className="w-60 h-60 sm:w-64 sm:h-64 overflow-visible">
                <circle
                  cx="160"
                  cy="160"
                  r={DR}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={DSW}
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.index}
                    cx="160"
                    cy="160"
                    r={DR}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={DSW}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    style={{
                      transform: seg.transform,
                      opacity: selectedCatIdx !== null && selectedCatIdx !== seg.index ? 0.35 : 1,
                      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s'
                    }}
                    className="cursor-pointer"
                    onClick={() => setSelectedCatIdx(selectedCatIdx === seg.index ? null : seg.index)}
                  />
                ))}
                <text
                  x="160"
                  y="162"
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="24"
                  fontWeight="800"
                >
                  {selectedCatIdx === null
                    ? fmtMoney(catTotalRev)
                    : `${donutSegments[selectedCatIdx]?.pct}%`}
                </text>
                <text x="160" y="185" textAnchor="middle" fill="#A5B4CC" fontSize="12">
                  {selectedCatIdx === null ? 'kul kamai' : CATS[selectedCatIdx]}
                </text>
              </svg>
            </div>

            {/* Interactive Category Legend Rows with Animated Share Bars */}
            <div className="space-y-1.5">
              {donutSegments.map((seg) => {
                const isSel = selectedCatIdx === seg.index;
                const dCat = dlt(seg.value, seg.prevValue);
                return (
                  <button
                    key={seg.index}
                    type="button"
                    onClick={() => setSelectedCatIdx(isSel ? null : seg.index)}
                    className={`w-full grid grid-cols-12 items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSel
                        ? 'bg-white/[0.1] border-white/30'
                        : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{seg.label}</div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-bold text-white">
                      {fmtMoney(seg.value)}
                    </div>
                    <div className="col-span-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dCat === null || dCat >= 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {dCat === null ? `${seg.pct}%` : `${dCat >= 0 ? '▲' : '▼'} ${Math.abs(dCat).toFixed(1)}%`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            CHART 3: WEEKDAY PATTERN BAR CHART (Mon–Sun + Avg Line + Info Box)
        ----------------------------------------------------------------- */}
        {(selectedChartView === 'bar' || selectedChartView === 'all') && (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-extrabold text-white">
                Hafte ke din ka pattern · {catName}
              </h4>
              <p className="text-xs text-[#A5B4CC] mt-0.5">
                {metricName[metric]} · {cmpPrevYear ? 'safed nishaan = pichhla saal' : 'Mon to Sun'}
              </p>
            </div>

            <div className="relative my-2">
              <svg
                ref={barSvgRef}
                viewBox={`0 0 ${BW} ${BH}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setBarHoverIdx(null)}
              >
                <defs>
                  <linearGradient id={`bg1-${animSeed}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColors[0]} />
                    <stop offset="100%" stopColor={activeColors[1]} stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id={`bg2-${animSeed}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColors[2]} />
                    <stop offset="100%" stopColor={activeColors[3]} stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {Array.from({ length: barTicks + 1 }).map((_, k) => {
                  const val = k * barScale.step;
                  const y = BY(val);
                  if (y < bpt - 2) return null;
                  return (
                    <g key={k}>
                      <line
                        x1={bpl}
                        x2={BW - bpr}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeDasharray="3 5"
                      />
                      <text x={bpl - 8} y={y + 4} textAnchor="end" fill="#A5B4CC" fontSize="11">
                        {fmtAxis(val, metric)}
                      </text>
                    </g>
                  );
                })}

                {/* Dashed Average Line */}
                <line
                  x1={bpl}
                  x2={BW - bpr}
                  y1={BY(dowAvg)}
                  y2={BY(dowAvg)}
                  stroke="#F8FAFC"
                  strokeWidth="1.4"
                  strokeDasharray="6 6"
                  opacity="0.7"
                />
                <text x={BW - bpr} y={BY(dowAvg) - 6} textAnchor="end" fill="#F8FAFC" fontSize="10.5">
                  average {fmtAxis(dowAvg, metric)}
                </text>

                {/* 7 Weekday Bars */}
                {dowVals.map((val, i) => {
                  const x = bpl + i * bSlot + (bSlot - bWidth) / 2;
                  const y = BY(val);
                  const h = Math.max(0, BH - bpb - y);
                  const py = BY(dowPrev[i] || 0);
                  const isPeak = i === peakDowIdx;
                  const isSelected = activeBarIdx === i;
                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setBarHoverIdx(i)}
                      onClick={() => setBarPinIdx(barPinIdx === i ? null : i)}
                      style={{
                        opacity: activeBarIdx !== null && !isSelected ? 0.45 : 1,
                        transition: 'opacity 0.25s'
                      }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={bWidth}
                        height={h}
                        rx={Math.min(10, h / 2)}
                        fill={isPeak ? `url(#bg2-${animSeed})` : `url(#bg1-${animSeed})`}
                      />
                      {val > 0 && (
                        <text
                          x={x + bWidth / 2}
                          y={y - 7}
                          textAnchor="middle"
                          fill="#F8FAFC"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {fmtAxis(val, metric)}
                        </text>
                      )}
                      {cmpPrevYear && (
                        <line
                          x1={x - 4}
                          x2={x + bWidth + 4}
                          y1={py}
                          y2={py}
                          stroke="#F8FAFC"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      )}
                      <text x={x + bWidth / 2} y={BH - 10} textAnchor="middle" fill="#A5B4CC" fontSize="11">
                        {DAYS[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Code 2 Interactive Info Box below Bar Chart */}
            <div
              className="mt-2 rounded-2xl p-3.5 border transition-all"
              style={{
                background: `linear-gradient(135deg, ${activeColors[0]}22, transparent 85%)`,
                borderColor: `${activeColors[0]}55`
              }}
            >
              {activeBarIdx === null ? (
                <div className="flex items-center gap-2.5 text-xs text-[#A5B4CC]">
                  <span className="text-lg animate-bounce">👆</span>
                  <span>Kisi bhi bar par tap karo, us din ka poora hisaab dikhega.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xl font-extrabold mr-3" style={{ color: activeColors[0] }}>
                      {fmtExact(dowVals[activeBarIdx], metric)}
                    </span>
                    <b className="text-sm text-white">{DAYF[activeBarIdx]}</b>
                    <p className="text-xs text-[#A5B4CC] mt-0.5">
                      Pichhle saal: {fmtExact(dowPrev[activeBarIdx], metric)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: activeColors[0] }}
                  >
                    {activeBarIdx === peakDowIdx ? 'Sabse Busy Din' : DAYS[activeBarIdx]}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Code 2 Auto Insights ("Seedhe kaam ki baatein") when in Synchronized Mode */}
      {selectedChartView === 'all' && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <h4 className="text-sm font-extrabold text-white mb-3">
            💡 Seedhe kaam ki baatein (Auto Store Insights)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedInsights.map((ins, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs"
              >
                <span className="text-xl">{ins.icon}</span>
                <div>
                  <b className="text-white block">{ins.title}</b>
                  <span className="text-[#A5B4CC]">{ins.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastText && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#080B16] text-white border border-white/20 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl">
          {toastText}
        </div>
      )}
    </div>
  );
}