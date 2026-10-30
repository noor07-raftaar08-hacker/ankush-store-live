import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../StoreContext';
import { Palette, BarChart3, Search, X, Check } from '../../components/Icons';

// --- MATH & MONOTONE HERMITE SPLINE INTERPOLATION (FROM USER'S CODE) ---
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYF = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtN = n => Math.round(Number(n) || 0).toLocaleString('en-IN');
function fmtMoney(v) {
  v = Math.round(Number(v) || 0);
  if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr';
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2) + ' L';
  return '₹' + v.toLocaleString('en-IN');
}
const fmtExact = (v, m) => m === 'ord' ? fmtN(v) + ' orders' : '₹' + fmtN(v);
function fmtAxis(v, m) {
  if (m === 'ord') return fmtN(v);
  if (v >= 1e5) return +(v / 1e5).toFixed(1) + 'L';
  if (v >= 1e3) return +(v / 1e3).toFixed(1) + 'k';
  return '' + Math.round(v);
}
export function calcComparison(c, p) {
  const cur = Number(c) || 0;
  const prv = Number(p) || 0;
  if (prv === 0 && cur === 0) {
    return { cls: 'na', symbol: '', text: '0.0%', pct: 0 };
  }
  if (prv === 0 && cur > 0) {
    return { cls: 'up', symbol: '▲ ', text: '+100%', pct: 100 };
  }
  if (prv > 0 && cur === 0) {
    return { cls: 'dn', symbol: '▼ ', text: '-100%', pct: -100 };
  }
  const diff = ((cur - prv) / prv) * 100;
  if (diff >= 0) {
    return { cls: 'up', symbol: '▲ ', text: `+${diff.toFixed(1)}%`, pct: diff };
  } else {
    return { cls: 'dn', symbol: '▼ ', text: `${diff.toFixed(1)}%`, pct: diff };
  }
}

const dlt = (c, p) => {
  const comp = calcComparison(c, p);
  return comp.pct;
};

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

export default function AnalyticsHubTab({ onOpenDesignSystem, onToast }) {
  const { orders, storeCategories, products } = useStore();

  // Control States
  const [rangeMode, setRangeMode] = useState('month'); // 'today' | 'week' | 'month' | '6m' | '12m' | 'custom'
  const [metricMode, setMetricMode] = useState('rev'); // 'rev' | 'ord' | 'aov'
  const [compareLastYear, setCompareLastYear] = useState(true);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(null);
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  // Line Chart Interactive Hover & Pin States
  const lineSvgRef = useRef(null);
  const [lineHovIdx, setLineHovIdx] = useState(null);
  const [linePinIdx, setLinePinIdx] = useState(null);
  const [lineTipPos, setLineTipPos] = useState({ x: 0, y: 0, visible: false });

  // Bar Chart Interactive Hover & Pin States
  const barSvgRef = useRef(null);
  const [barPinIdx, setBarPinIdx] = useState(null);
  const [barHovIdx, setBarHovIdx] = useState(null);
  const [barTipPos, setBarTipPos] = useState({ x: 0, y: 0, visible: false, dayIdx: null });

  // Unique trigger key for fluid water-flow animation on ANY selection change
  const animKey = useMemo(() => {
    return `${metricMode}-${rangeMode}-${selectedCategoryIdx !== null ? selectedCategoryIdx : 'all'}-${compareLastYear}-${customFromDate}-${customToDate}-${orders.length}`;
  }, [metricMode, rangeMode, selectedCategoryIdx, compareLastYear, customFromDate, customToDate, orders.length]);

  // Fluid Progress Counter (0 to 1 over 850ms) with Ease-Out
  const [animProgress, setAnimProgress] = useState(1);
  useEffect(() => {
    let start = null;
    const duration = 850;
    let animId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic: 1 - (1 - t)^3
      const easeVal = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(easeVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    setAnimProgress(0);
    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [animKey]);

  // 1. Raw Orders Source - 100% Real Store Orders Directly from StoreContext
  const rawOrders = useMemo(() => {
    return orders.map(o => {
      const d = o.orderDate ? new Date(o.orderDate) : new Date();
      const dStr = d.toISOString().slice(0, 10);
      const hour = d.getHours();
      const lines = (o.items && o.items.length > 0)
        ? o.items.map(it => {
            const matchedProd = products.find(p => p.id === it.productId || p.id === it.id);
            return {
              cat: it.category || matchedProd?.category || 'Groceries',
              amt: Number(it.finalItemTotal) || (Number(it.price) * (Number(it.quantity) || 1)) || 0
            };
          })
        : [{ cat: 'Groceries', amt: Number(o.finalAmount) || 0 }];

      return {
        id: o.id || `ORD-${Date.now()}`,
        date: dStr,
        hour,
        customer: o.customerPhone || o.customerName || 'Customer',
        lines
      };
    });
  }, [orders, products]);

  // 2. Normalized Processed Orders & Real Store Categories
  const { normalizedOrders, categories, meta, totalOrdersCurrentYear } = useMemo(() => {
    const rows = [];
    let maxT = -1;

    for (const o of rawOrders) {
      const t = Date.parse(o.date + 'T00:00:00Z');
      if (isNaN(t) || !o.lines || !o.lines.length) continue;
      rows.push({ t, o });
      if (t > maxT) maxT = t;
    }

    const now = new Date();
    const nowTime = now.getTime();
    const storeCatNames = (storeCategories || []).map(c => c.name);
    const prodCatNames = (products || []).map(p => p.category).filter(Boolean);
    const fallbackCats = ['Fruits & Vegetables', 'Dairy & Eggs', 'Groceries', 'Cold Drinks', 'Household Essentials', 'Bakery', 'Snacks'];
    const allStoreCategories = Array.from(new Set([...storeCatNames, ...prodCatNames, ...fallbackCats])).filter(Boolean);

    if (!rows.length) {
      return {
        normalizedOrders: [],
        categories: allStoreCategories.slice(0, 8),
        meta: { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() },
        totalOrdersCurrentYear: 0
      };
    }

    const e = new Date(Math.max(maxT, nowTime));
    const ey = e.getUTCFullYear();
    const em = e.getUTCMonth();
    const ed = e.getUTCDate();
    const kept = [];
    const tot = {};

    for (const { t, o } of rows) {
      const d = new Date(t);
      const ago = (ey * 12 + em) - (d.getUTCFullYear() * 12 + d.getUTCMonth());
      const dd = d.getUTCDate();
      const daysAgo = Math.max(0, Math.floor((e.getTime() - t) / 864e5));
      kept.push({ o, ago, dd, w: (d.getUTCDay() + 6) % 7, t, daysAgo, hour: o.hour !== undefined ? o.hour : 12 });
      for (const l of o.lines) {
        tot[l.cat] = (tot[l.cat] || 0) + l.amt;
      }
    }

    // Active categories with revenue first, then remaining real store categories
    const orderedSalesCats = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
    const finalCats = Array.from(new Set([...orderedSalesCats, ...allStoreCategories])).filter(Boolean).slice(0, 8);

    const idx = {};
    finalCats.forEach((n, i) => { idx[n] = i; });

    const norm = kept.map(k => {
      const lines = [];
      const mp = {};
      for (const l of k.o.lines) {
        const c = idx[l.cat] !== undefined ? idx[l.cat] : (finalCats.length - 1);
        if (mp[c] != null) {
          lines[mp[c]].a += l.amt;
        } else {
          mp[c] = lines.length;
          lines.push({ c, a: l.amt });
        }
      }
      return {
        y: k.ago < 12 ? 1 : 0,
        ago: k.ago % 12,
        daysAgo: k.daysAgo,
        day: k.dd,
        dow: k.w,
        hour: k.hour,
        t: k.t,
        cust: String(k.o.customer || k.o.id || Math.random()),
        lines,
        total: lines.reduce((s, l) => s + l.a, 0)
      };
    });

    const currentYearOrders = norm.filter(o => o.y === 1).length;

    return {
      normalizedOrders: norm,
      categories: finalCats,
      meta: { y: ey, m: em, d: ed },
      totalOrdersCurrentYear: currentYearOrders
    };
  }, [rawOrders, storeCategories, products]);

  // 3. Bucket and Filter Configuration
  const numBuckets = useMemo(() => {
    if (rangeMode === 'today') return 12; // 12 two-hour intervals (00:00 to 24:00)
    if (rangeMode === 'week') return 7; // 7 days of the week (Mon to Sun)
    if (rangeMode === 'month') return meta.d || 28;
    if (rangeMode === '6m') return 6;
    if (rangeMode === 'custom' && customFromDate && customToDate) {
      const from = Date.parse(customFromDate + 'T00:00:00Z');
      const to = Date.parse(customToDate + 'T00:00:00Z');
      return Math.min(366, Math.max(1, Math.floor((to - from) / 864e5) + 1));
    }
    return 12; // 12 months default
  }, [rangeMode, meta.d, customFromDate, customToDate]);

  const inRange = (o, y) => {
    if (rangeMode === 'today') {
      return y === 1 ? o.daysAgo === 0 : o.daysAgo === 1;
    }
    if (rangeMode === 'week') {
      return y === 1 ? o.daysAgo <= 6 : (o.daysAgo >= 7 && o.daysAgo <= 13);
    }
    if (rangeMode === 'month') {
      return y === 1 ? o.ago === 0 : o.ago === 1;
    }
    if (rangeMode === '6m') {
      return y === 1 ? o.ago <= 5 : (o.ago >= 6 && o.ago <= 11);
    }
    if (rangeMode === 'custom' && customFromDate && customToDate) {
      const from = Date.parse(customFromDate + 'T00:00:00Z');
      const to = Date.parse(customToDate + 'T23:59:59Z');
      const duration = to - from;
      if (y === 1) return o.t >= from && o.t <= to;
      return o.t >= (from - duration) && o.t < from;
    }
    // 12m default
    return y === 1 ? o.ago <= 11 : (o.ago >= 12 && o.ago <= 23);
  };

  const bucketOf = (o) => {
    if (rangeMode === 'today') return Math.max(0, Math.min(11, Math.floor((o.hour || 12) / 2)));
    if (rangeMode === 'week') return Math.max(0, Math.min(6, o.dow !== undefined ? o.dow : 0));
    if (rangeMode === 'month') return Math.max(0, Math.min(numBuckets - 1, o.day - 1));
    if (rangeMode === '6m') return Math.max(0, Math.min(numBuckets - 1, 5 - (o.ago % 6)));
    if (rangeMode === 'custom' && customFromDate) {
      const from = Date.parse(customFromDate + 'T00:00:00Z');
      return Math.max(0, Math.min(numBuckets - 1, Math.floor((o.t - from) / 864e5)));
    }
    return Math.max(0, Math.min(numBuckets - 1, 11 - (o.ago % 12)));
  };

  // 4. Aggregation Engines for Year 1 (current) and Year 0 (previous)
  const dataset = useMemo(() => {
    const agg = (y, cat) => {
      const nb = numBuckets;
      const rev = Array(nb).fill(0);
      const ord = Array(nb).fill(0);
      const cs = Array.from({ length: nb }, () => new Set());
      const dRev = Array(7).fill(0);
      const dOrd = Array(7).fill(0);
      const all = new Set();
      let tRev = 0;
      let tOrd = 0;

      for (const o of normalizedOrders) {
        if (!inRange(o, y)) continue;
        let amt = 0;
        if (cat === null) {
          amt = o.total;
        } else {
          for (const l of o.lines) {
            if (l.c === cat) amt += l.a;
          }
        }
        if (!amt) continue;

        const b = bucketOf(o);
        rev[b] += amt;
        ord[b]++;
        cs[b].add(o.cust);
        dRev[o.dow] += amt;
        dOrd[o.dow]++;
        all.add(o.cust);
        tRev += amt;
        tOrd++;
      }

      return {
        rev,
        ord,
        cust: cs.map(s => s.size),
        aov: rev.map((r, i) => ord[i] ? r / ord[i] : 0),
        dRev,
        dOrd,
        dAov: dRev.map((r, i) => dOrd[i] ? r / dOrd[i] : 0),
        tRev,
        tOrd,
        tCust: all.size,
        tAov: tOrd ? tRev / tOrd : 0
      };
    };

    const aggCats = (y) => {
      const k = categories.length;
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

      for (const o of normalizedOrders) {
        if (!inRange(o, y)) continue;
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
          r.rev[l.c] = (r.rev[l.c] || 0) + l.a;
          if (!seen[l.c]) {
            seen[l.c] = 1;
            r.ord[l.c] = (r.ord[l.c] || 0) + 1;
          }
        }
      }
      return r;
    };

    return {
      C: agg(1, selectedCategoryIdx),
      P: agg(0, selectedCategoryIdx),
      CA: aggCats(1),
      PA: aggCats(0)
    };
  }, [normalizedOrders, numBuckets, selectedCategoryIdx, rangeMode, customFromDate, customToDate, categories.length]);

  // Bucket Label Helper
  const getBucketLabel = (b, full) => {
    if (rangeMode === 'today') {
      const hStart = b * 2;
      return `${String(hStart).padStart(2, '0')}:00`;
    }
    if (rangeMode === 'week') {
      return full ? DAYF[b] : DAYS[b];
    }
    if (rangeMode === 'custom' && customFromDate) {
      const d = new Date(Date.parse(customFromDate + 'T00:00:00Z') + b * 864e5);
      if (!full) return d.getUTCDate() + '/' + (d.getUTCMonth() + 1);
      return DAYS[(d.getUTCDay() + 6) % 7] + ', ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    }
    if (rangeMode === 'month') {
      if (!full) return '' + (b + 1);
      const wd = DAYS[(new Date(Date.UTC(meta.y, meta.m, b + 1)).getUTCDay() + 6) % 7];
      return wd + ', ' + (b + 1) + ' ' + MON[meta.m] + ' ' + meta.y;
    }
    const back = rangeMode === '6m' ? 5 : 11;
    const raw = meta.m - back + b;
    const mn = ((raw % 12) + 12) % 12;
    if (!full) return MON[mn];
    const yr = meta.y + Math.floor(raw / 12);
    const dim = new Date(Date.UTC(meta.y, meta.m + 1, 0)).getUTCDate();
    return MONF[mn] + ' ' + yr + (b === numBuckets - 1 && meta.d < dim ? ' (' + meta.d + ' din tak)' : '');
  };

  // 5. Line Chart Series and Spline Curve
  const lineSeries = useMemo(() => {
    const m = metricMode;
    const cur = dataset.C[m];
    const prev = dataset.P[m];
    const maxVal = Math.max(...cur, ...(compareLastYear ? prev : [0]), 10);
    const sc = niceScale(maxVal);

    const W = 720;
    const H = 340;
    const pl = 52;
    const pr = 20;
    const pt = 22;
    const pb = 34;
    const n = numBuckets;

    const X = i => n === 1 ? pl + (W - pl - pr) / 2 : pl + i * (W - pl - pr) / Math.max(1, n - 1);
    const Y = v => pt + (1 - (Number(v) || 0) / sc.top) * (H - pt - pb);

    const pts = cur.map((v, i) => [X(i), Y(v)]);
    const linePath = mono(pts);
    const areaPath = n > 1 ? `${linePath} L${X(n - 1)},${Y(0)} L${X(0)},${Y(0)} Z` : '';
    const prevPath = mono(prev.map((v, i) => [X(i), Y(v)]));

    return {
      W, H, pl, pr, pt, pb, X, Y, pts, linePath, areaPath, prevPath,
      cur, prev, top: sc.top, step: sc.step, ticks: Math.round(sc.top / sc.step)
    };
  }, [dataset, metricMode, compareLastYear, numBuckets]);

  // Handle Line Pointer Move for Tracking Guide
  const handleLinePointerMove = (e) => {
    if (!lineSvgRef.current) return;
    const rc = lineSvgRef.current.getBoundingClientRect();
    const px = (e.clientX - rc.left) * lineSeries.W / rc.width;
    let b = 0, bd = 1e9;
    for (let i = 0; i < numBuckets; i++) {
      const d = Math.abs(lineSeries.X(i) - px);
      if (d < bd) {
        bd = d;
        b = i;
      }
    }
    setLineHovIdx(b);

    const x = lineSeries.X(b);
    const y = lineSeries.Y(lineSeries.cur[b]);
    const tipLeft = clamp(x * rc.width / lineSeries.W, 70, rc.width - 70);
    const tipTop = y * rc.height / lineSeries.H;
    setLineTipPos({ x: tipLeft, y: tipTop, visible: true });
  };

  const handleLinePointerLeave = () => {
    setLineHovIdx(null);
    setLineTipPos(prev => ({ ...prev, visible: false }));
  };

  const handleLineClick = (e) => {
    if (!lineSvgRef.current) return;
    const rc = lineSvgRef.current.getBoundingClientRect();
    const px = (e.clientX - rc.left) * lineSeries.W / rc.width;
    let b = 0, bd = 1e9;
    for (let i = 0; i < numBuckets; i++) {
      const d = Math.abs(lineSeries.X(i) - px);
      if (d < bd) {
        bd = d;
        b = i;
      }
    }
    setLinePinIdx(prev => prev === b ? null : b);
  };

  // 6. Donut Slices Calculations with Animated Sweep
  const donutData = useMemo(() => {
    const R = 108;
    const C = 2 * Math.PI * R;
    const tot = dataset.CA.rev.reduce((a, b) => a + b, 0) || 1;
    let cum = 0;
    const gap = 5;

    const slices = categories.map((catName, i) => {
      const amt = dataset.CA.rev[i] || 0;
      const f = amt / tot;
      const s0 = cum * C;
      const e0 = (cum + f) * C;
      const vis = Math.min(e0, animProgress * C);
      const len = Math.max(0, vis - s0 - gap);
      const isSel = selectedCategoryIdx === i;
      const mid = (cum + f / 2) * 2 * Math.PI - Math.PI / 2;
      const shiftX = isSel ? Math.cos(mid) * 12 : 0;
      const shiftY = isSel ? Math.sin(mid) * 12 : 0;
      cum += f;

      return {
        idx: i,
        name: catName,
        amt,
        pct: (f * 100).toFixed(1),
        color: `var(--c${i + 1})`,
        strokeDasharray: `${len} ${C - len}`,
        strokeDashoffset: C * 0.25 - (s0 + gap / 2),
        isSel,
        shiftX,
        shiftY
      };
    });

    return { R, C, tot, slices };
  }, [dataset.CA.rev, categories, selectedCategoryIdx, animProgress]);

  // 7. Weekday Bars Calculations
  const weekdaySeries = useMemo(() => {
    const m = metricMode;
    const cur = m === 'rev' ? dataset.C.dRev : m === 'ord' ? dataset.C.dOrd : dataset.C.dAov;
    const prev = m === 'rev' ? dataset.P.dRev : m === 'ord' ? dataset.P.dOrd : dataset.P.dAov;
    const avg = m === 'aov' ? dataset.C.tAov : cur.reduce((a, b) => a + b, 0) / 7;
    const maxVal = Math.max(...cur, ...(compareLastYear ? prev : [0]), 10);
    const sc = niceScale(maxVal);

    const W = 520;
    const H = 320;
    const pl = 52;
    const pr = 14;
    const pt = 26;
    const pb = 36;
    const slot = (W - pl - pr) / 7;
    const bw = slot * 0.56;
    const Y = v => pt + (1 - (Number(v) || 0) / sc.top) * (H - pt - pb);
    const peakIdx = cur.indexOf(Math.max(...cur));

    const bars = cur.map((v, i) => {
      const x = pl + i * slot + (slot - bw) / 2;
      const y = Y(v);
      const h = Math.max(0, H - pb - y);
      const isPeak = i === peakIdx;
      const isPin = barPinIdx === i;
      const prevY = Y(prev[i]);

      return {
        idx: i,
        day: DAYS[i],
        dayFull: DAYF[i],
        v,
        prevV: prev[i],
        x,
        y,
        h,
        bw,
        isPeak,
        isPin,
        prevY
      };
    });

    return {
      W, H, pl, pr, pt, pb, slot, bw, Y, cur, prev, avg, top: sc.top, step: sc.step,
      ticks: Math.round(sc.top / sc.step), avgY: Y(avg), bars
    };
  }, [dataset, metricMode, compareLastYear, barPinIdx]);

  const handleBarHover = (i, on) => {
    if (!on) {
      setBarHovIdx(null);
      setBarTipPos(prev => ({ ...prev, visible: false }));
      return;
    }
    setBarHovIdx(i);
    if (!barSvgRef.current) return;
    const rc = barSvgRef.current.getBoundingClientRect();
    const bar = weekdaySeries.bars[i];
    const tipLeft = clamp((bar.x + bar.bw / 2) * rc.width / weekdaySeries.W, 70, rc.width - 70);
    const tipTop = (bar.y * rc.height / weekdaySeries.H) - 14;
    setBarTipPos({ x: tipLeft, y: tipTop, visible: true, dayIdx: i });
  };

  // 8. Key Insights Generator (Exact from User Code)
  const insightsList = useMemo(() => {
    const list = [];
    const m = metricMode;
    const arr = dataset.C[m];
    const mx = Math.max(...arr);
    const pi = arr.indexOf(mx);
    const pp = dataset.P[m][pi];

    if (!dataset.C.tOrd) {
      return [
        { icon: '🔎', text: 'Store me orders place hote hi trends aur category insights auto populate ho jayenge.' }
      ];
    }

    const dw = dataset.C.dOrd;
    const bd = dw.indexOf(Math.max(...dw));
    const dtot = dw.reduce((a, b) => a + b, 0);

    // 1. Best period
    list.push({
      icon: '📈',
      text: `<b>${getBucketLabel(pi, true)}</b> was the best period: <b>${fmtExact(mx, m)}</b> (${dlt(mx, pp) === null ? 'no previous-period data' : 'vs previous period ' + (dlt(mx, pp) >= 0 ? '▲ ' : '▼ ') + Math.abs(dlt(mx, pp)).toFixed(1) + '%'}).`
    });

    if (selectedCategoryIdx === null) {
      const tot = dataset.CA.rev.reduce((a, b) => a + b, 0) || 1;
      const ti = dataset.CA.rev.indexOf(Math.max(...dataset.CA.rev));
      let gi = -1, gv = -1e9;
      categories.forEach((c, i) => {
        const g = dlt(dataset.CA.rev[i], dataset.PA.rev[i]);
        if (g !== null && dataset.PA.rev[i] > 0 && g > gv) {
          gv = g;
          gi = i;
        }
      });

      // 2. Lead Category
      list.push({
        icon: '🏆',
        text: `<b>${categories[ti]}</b> leads with <b>${(dataset.CA.rev[ti] / tot * 100).toFixed(1)}%</b>.${gi >= 0 ? ` The fastest-growing category is <b>${categories[gi]}</b> (${gv >= 0 ? '+' : ''}${gv.toFixed(1)}%).` : ''}`
      });

      // 3. Weekend Peak
      list.push({
        icon: '📅',
        text: `<b>${(dataset.CA.tot ? dataset.CA.wk / dataset.CA.tot * 100 : 0).toFixed(0)}% of orders arrived on weekends.</b> The busiest day is <b>${DAYF[bd]}</b>; keep stock and delivery ready for that day.`
      });

      // 4. ₹1500+ Free Delivery Threshold
      list.push({
        icon: '🚚',
        text: `<b>${fmtN(dataset.CA.big)}</b> orders were ₹1,500 or above (${(dataset.CA.tot ? dataset.CA.big / dataset.CA.tot * 100 : 0).toFixed(1)}%) and contributed <b>${(dataset.CA.totRev ? dataset.CA.bigRev / dataset.CA.totRev * 100 : 0).toFixed(0)}%</b> of total revenue. This is a useful basis for setting the free-delivery threshold.`
      });

      // 5. Top 10% VIP Customers
      const cr = [...dataset.CA.cr.values()].sort((a, b) => b - a);
      const k = Math.max(1, Math.ceil(cr.length * 0.1));
      const topS = cr.slice(0, k).reduce((a, b) => a + b, 0);
      list.push({
        icon: '🪙',
        text: `The top 10% of customers (<b>${k} VIP members</b>) contributed <b>${(dataset.CA.totRev ? topS / dataset.CA.totRev * 100 : 0).toFixed(0)}%</b> of revenue. Prioritise coins and offers for these customers.`
      });
    } else {
      const tot = dataset.CA.rev.reduce((a, b) => a + b, 0) || 1;
      const rank = [...dataset.CA.rev].sort((a, b) => b - a).indexOf(dataset.CA.rev[selectedCategoryIdx]) + 1;
      list.push({
        icon: '🏆',
        text: `<b>${categories[selectedCategoryIdx]}</b> contributes <b>${(tot ? dataset.CA.rev[selectedCategoryIdx] / tot * 100 : 0).toFixed(1)}%</b> (category rank ${rank}/${categories.length}).`
      });
      list.push({
        icon: '📊',
        text: `Compared with previous period, revenue ${dlt(dataset.C.tRev, dataset.P.tRev) >= 0 ? '▲' : '▼'} ${Math.abs(dlt(dataset.C.tRev, dataset.P.tRev) || 0).toFixed(1)}% and orders ${dlt(dataset.C.tOrd, dataset.P.tOrd) >= 0 ? '▲' : '▼'} ${Math.abs(dlt(dataset.C.tOrd, dataset.P.tOrd) || 0).toFixed(1)}%.`
      });
      list.push({
        icon: '📅',
        text: `The busiest day for this category is <b>${DAYF[bd]}</b> (${(dtot ? dw[bd] / dtot * 100 : 0).toFixed(0)}% of orders).`
      });
      list.push({
        icon: '👥',
        text: `<b>${fmtN(dataset.C.tCust)}</b> customers purchased this category, with an average order value of <b>₹${fmtN(dataset.C.tAov)}</b>.`
      });
    }

    return list;
  }, [dataset, metricMode, categories, selectedCategoryIdx, numBuckets]);

  const activeLineIdx = lineHovIdx !== null ? lineHovIdx : linePinIdx;

  return (
    <div className="analytics-chart-hub space-y-6 text-[var(--text)] font-sans">
      
      {/* 1. TOP HEADER & ORDER COUNT BADGE */}
      <header className="top">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ankush General Store · Sales Analytics
          </h1>
          <p className="lead">
            Interactive sales performance and category intelligence. Tap any category slice to filter trends, weekday patterns, and metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="badge">
            <i />
            <span>Store Orders · {orders.length} Recorded</span>
          </div>
        </div>
      </header>

      {/* 2. TOOLBAR & CONTROLS */}
      <div className="toolbar">
        {/* Quick Date Range Segments */}
        <div className="seg" role="group" aria-label="Date Range">
          <button
            type="button"
            onClick={() => setRangeMode('today')}
            className={rangeMode === 'today' ? 'on' : ''}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setRangeMode('week')}
            className={rangeMode === 'week' ? 'on' : ''}
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setRangeMode('month')}
            className={rangeMode === 'month' ? 'on' : ''}
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setRangeMode('6m')}
            className={rangeMode === '6m' ? 'on' : ''}
          >
            6 months
          </button>
          <button
            type="button"
            onClick={() => setRangeMode('12m')}
            className={rangeMode === '12m' ? 'on' : ''}
          >
            12 months
          </button>
        </div>

        {/* Settings Menu Dropdown */}
        <div className="menu">
          <button
            onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
            className="chip cursor-pointer"
          >
            ⚙️ Custom Dates ▾
          </button>

          {settingsMenuOpen && (
            <div className="menu-panel">
              <div className="menu-sec">
                <div className="menu-title">Select Custom Date Range</div>
                <div className="custom-range">
                  <label>
                    From <input type="date" value={customFromDate} onChange={e => setCustomFromDate(e.target.value)} />
                  </label>
                  <label>
                    To <input type="date" value={customToDate} onChange={e => setCustomToDate(e.target.value)} />
                  </label>
                  <button
                    className="chip"
                    onClick={() => {
                      if (!customFromDate || !customToDate) {
                        alert('Kripya dono dates chunein.');
                        return;
                      }
                      setRangeMode('custom');
                      setSettingsMenuOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="menu-sec">
                <div className="menu-title">Theme Colors</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={onOpenDesignSystem} className="chip">
                    🎨 Open Theme Studio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Metric Segments */}
        <div className="seg" role="group" aria-label="What to view">
          <button
            onClick={() => setMetricMode('rev')}
            className={metricMode === 'rev' ? 'on' : ''}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetricMode('ord')}
            className={metricMode === 'ord' ? 'on' : ''}
          >
            Orders
          </button>
          <button
            onClick={() => setMetricMode('aov')}
            className={metricMode === 'aov' ? 'on' : ''}
          >
            Avg order
          </button>
        </div>

        {/* Compare Toggle */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={compareLastYear}
            onChange={e => setCompareLastYear(e.target.checked)}
          />
          <span>Compare with previous period</span>
        </label>

        {/* Filter Chip */}
        {selectedCategoryIdx !== null && (
          <button
            onClick={() => setSelectedCategoryIdx(null)}
            className="chip fill cursor-pointer"
          >
            Filter: {categories[selectedCategoryIdx]} ✕
          </button>
        )}
      </div>

      {/* 3. 4 KPI METRIC CARDS WITH ANIMATED WATER-FLOW COUNTERS */}
      <section className="kpis">
        {/* KPI 1: Revenue */}
        <div className="kpi">
          <div className="kl">Total revenue</div>
          <div className="kv tabular-nums">{fmtMoney(dataset.C.tRev * animProgress)}</div>
          <div className="kd">
            {(() => {
              const comp = calcComparison(dataset.C.tRev, dataset.P.tRev);
              return <span className={`dp ${comp.cls}`}>{comp.text}</span>;
            })()}
            <span>vs previous period</span>
          </div>
          <svg className="spark" viewBox="0 0 84 30">
            <path
              key={`spark-rev-${animKey}`}
              d={mono(dataset.C.rev.map((v, i) => [i * 84 / Math.max(1, numBuckets - 1), 27 - (v / (Math.max(...dataset.C.rev, 1))) * 24]))}
              style={{
                strokeDasharray: 300,
                strokeDashoffset: 300,
                animation: 'chartSparkFlow 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }}
            />
          </svg>
        </div>

        {/* KPI 2: Orders */}
        <div className="kpi">
          <div className="kl">Orders</div>
          <div className="kv tabular-nums">{fmtN(dataset.C.tOrd * animProgress)}</div>
          <div className="kd">
            {(() => {
              const comp = calcComparison(dataset.C.tOrd, dataset.P.tOrd);
              return <span className={`dp ${comp.cls}`}>{comp.text}</span>;
            })()}
            <span>vs previous period</span>
          </div>
          <svg className="spark" viewBox="0 0 84 30">
            <path
              key={`spark-ord-${animKey}`}
              d={mono(dataset.C.ord.map((v, i) => [i * 84 / Math.max(1, numBuckets - 1), 27 - (v / (Math.max(...dataset.C.ord, 1))) * 24]))}
              style={{
                strokeDasharray: 300,
                strokeDashoffset: 300,
                animation: 'chartSparkFlow 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }}
            />
          </svg>
        </div>

        {/* KPI 3: Avg Order Value */}
        <div className="kpi">
          <div className="kl">Avg order value</div>
          <div className="kv tabular-nums">₹{fmtN(dataset.C.tAov * animProgress)}</div>
          <div className="kd">
            {(() => {
              const comp = calcComparison(dataset.C.tAov, dataset.P.tAov);
              return <span className={`dp ${comp.cls}`}>{comp.text}</span>;
            })()}
            <span>vs previous period</span>
          </div>
          <svg className="spark" viewBox="0 0 84 30">
            <path
              key={`spark-aov-${animKey}`}
              d={mono(dataset.C.aov.map((v, i) => [i * 84 / Math.max(1, numBuckets - 1), 27 - (v / (Math.max(...dataset.C.aov, 1))) * 24]))}
              style={{
                strokeDasharray: 300,
                strokeDashoffset: 300,
                animation: 'chartSparkFlow 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }}
            />
          </svg>
        </div>

        {/* KPI 4: Active Customers */}
        <div className="kpi">
          <div className="kl">Active customers</div>
          <div className="kv tabular-nums">{fmtN(dataset.C.tCust * animProgress)}</div>
          <div className="kd">
            {(() => {
              const comp = calcComparison(dataset.C.tCust, dataset.P.tCust);
              return <span className={`dp ${comp.cls}`}>{comp.text}</span>;
            })()}
            <span>vs previous period</span>
          </div>
          <svg className="spark" viewBox="0 0 84 30">
            <path
              key={`spark-cust-${animKey}`}
              d={mono(dataset.C.cust.map((v, i) => [i * 84 / Math.max(1, numBuckets - 1), 27 - (v / (Math.max(...dataset.C.cust, 1))) * 24]))}
              style={{
                strokeDasharray: 300,
                strokeDashoffset: 300,
                animation: 'chartSparkFlow 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards'
              }}
            />
          </svg>
        </div>
      </section>

      {/* 4. MAIN CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LINE CHART: REVENUE TREND (Wide) */}
        <section className="analytics-card lg:col-span-2">
          <h2>
            {metricMode === 'rev' ? 'Revenue' : metricMode === 'ord' ? 'Orders' : 'Avg order'} ka trend · {selectedCategoryIdx !== null ? categories[selectedCategoryIdx] : 'Entire store'}
          </h2>
          <div className="sub">
            {rangeMode === 'month' ? 'Daily view for this month' : rangeMode === '6m' ? 'Last 6 months' : rangeMode === 'custom' ? 'Custom date range' : 'Last 12 months'}
            {compareLastYear ? ', dotted line = previous period' : ''}
          </div>

          <div className="cw">
            <svg
              ref={lineSvgRef}
              className="chart-canvas"
              viewBox={`0 0 ${lineSeries.W} ${lineSeries.H}`}
              onPointerMove={handleLinePointerMove}
              onPointerLeave={handleLinePointerLeave}
              onClick={handleLineClick}
              tabIndex={0}
              role="img"
              aria-label="Trend line chart"
            >
              <defs>
                <linearGradient id="chartLg1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--c1)" />
                  <stop offset="60%" stopColor="var(--c2)" />
                  <stop offset="100%" stopColor="var(--c3)" />
                </linearGradient>
                <linearGradient id="chartLg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--c2)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--c2)" stopOpacity="0" />
                </linearGradient>
                <filter id="chartFilter" x="-10%" y="-30%" width="120%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines & Ticks */}
              {Array.from({ length: 8 }).map((_, k) => {
                const on = k <= lineSeries.ticks;
                const y = lineSeries.Y(k * lineSeries.step);
                const vis = on && y >= lineSeries.pt - 1;
                return (
                  <g key={k} style={{ opacity: vis ? 1 : 0 }}>
                    <line
                      x1={lineSeries.pl}
                      x2={lineSeries.W - lineSeries.pr}
                      y1={y}
                      y2={y}
                      style={{ stroke: 'var(--line)', strokeDasharray: '3 5' }}
                    />
                    <text x={lineSeries.pl - 8} y={y + 4} textAnchor="end">
                      {fmtAxis(k * lineSeries.step, metricMode)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {Array.from({ length: numBuckets }).map((_, i) => {
                const show = numBuckets <= 12 || i === 0 || (i + 1) % 5 === 0 || i === numBuckets - 1;
                return show ? (
                  <text key={i} x={lineSeries.X(i)} y={lineSeries.H - 12} textAnchor="middle">
                    {getBucketLabel(i, false)}
                  </text>
                ) : null;
              })}

              {/* Comparative Dotted Line */}
              {compareLastYear && (
                <path d={lineSeries.prevPath} className="prevp" />
              )}

              {/* Gradient Area with Water-Flow Fade */}
              <path
                key={`area-${animKey}`}
                d={lineSeries.areaPath}
                fill="url(#chartLg2)"
                style={{
                  animation: 'chartAreaFadeIn 1s ease 0.5s forwards',
                  opacity: 0
                }}
              />

              {/* Spline Curve with Water-Flow Drawing Animation */}
              <path
                key={`line-${animKey}`}
                d={lineSeries.linePath}
                fill="none"
                stroke="url(#chartLg1)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#chartFilter)"
                style={{
                  strokeDasharray: 2400,
                  strokeDashoffset: 2400,
                  animation: 'chartWaterFlow 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards'
                }}
              />

              {/* Point Circles with Staggered Entrance */}
              {numBuckets <= 13 && lineSeries.pts.map((pt, i) => (
                <circle
                  key={`dot-${animKey}-${i}`}
                  cx={pt[0]}
                  cy={pt[1]}
                  r={4.8}
                  className="dot"
                  style={{
                    animation: `chartDotPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.2 + (i / Math.max(1, numBuckets - 1)) * 1.1}s both`
                  }}
                />
              ))}

              {/* Interactive Dashed Guide Line */}
              {activeLineIdx !== null && (
                <line
                  className="gl on"
                  x1={lineSeries.X(activeLineIdx)}
                  x2={lineSeries.X(activeLineIdx)}
                  y1={lineSeries.pt}
                  y2={lineSeries.H - lineSeries.pb}
                />
              )}

              {/* Interactive Pointer Marker */}
              {activeLineIdx !== null && activeLineIdx !== linePinIdx && (
                <circle
                  className="mk on"
                  cx={lineSeries.X(activeLineIdx)}
                  cy={lineSeries.Y(lineSeries.cur[activeLineIdx])}
                  r={6}
                />
              )}

              {/* Pinned Target with Ping Pulse Ring */}
              {linePinIdx !== null && (
                <g
                  className="pmg"
                  style={{
                    transform: `translate(${lineSeries.X(linePinIdx)}px, ${lineSeries.Y(lineSeries.cur[linePinIdx])}px)`,
                    opacity: 1
                  }}
                >
                  <circle className="ring" r={11} />
                  <circle className="pdot" r={6} />
                </g>
              )}
            </svg>

            {/* Dynamic Tooltip */}
            {lineTipPos.visible && activeLineIdx !== null && (
              <div
                className="tip on"
                style={{ left: `${lineTipPos.x}px`, top: `${lineTipPos.y}px` }}
              >
                <b>{getBucketLabel(activeLineIdx, true)}</b>
                <span className="tv">{fmtExact(lineSeries.cur[activeLineIdx], metricMode)}</span>
                {compareLastYear && (
                  <>
                    <br />
                    <span>
                      Previous: {fmtExact(lineSeries.prev[activeLineIdx], metricMode)}{' '}
                      <span className={`dp ${dlt(lineSeries.cur[activeLineIdx], lineSeries.prev[activeLineIdx]) >= 0 ? 'up' : 'dn'}`}>
                        {dlt(lineSeries.cur[activeLineIdx], lineSeries.prev[activeLineIdx]) >= 0 ? '▲ ' : '▼ '}
                        {Math.abs(dlt(lineSeries.cur[activeLineIdx], lineSeries.prev[activeLineIdx]) || 0).toFixed(1)}%
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interactive Info Box Below Line Chart */}
          <div className="info" aria-live="polite">
            {linePinIdx !== null ? (
              (() => {
                const i = linePinIdx;
                const m = metricMode;
                const v = dataset.C[m][i];
                const p = dataset.P[m][i];
                const arr = dataset.C[m];
                const mx = Math.max(...arr);
                const mn = Math.min(...arr);
                const rank = [...arr].sort((a, b) => b - a).indexOf(v) + 1;
                const badge = v === mx ? 'Highest' : v === mn && arr.length > 2 ? 'Lowest' : `Rank ${rank}/${arr.length}`;

                return (
                  <div className="ib">
                    <span className="bigv">{m === 'ord' ? fmtN(v) : '₹' + fmtN(v)}</span>
                    <div>
                      <b>{getBucketLabel(i, true)}</b>
                      <em>{badge}</em>
                      <p>
                        Same period previous: {fmtExact(p, m)}{' '}
                        {(() => {
                          const c = calcComparison(v, p);
                          return <span className={`dp ${c.cls}`}>{c.text}</span>;
                        })()}
                        <br />
                        {m !== 'aov'
                          ? `Share of this period: ${(dataset.C.tRev ? (v / (m === 'rev' ? dataset.C.tRev : dataset.C.tOrd) * 100) : 0).toFixed(1)}% · ${dataset.C.cust[i]} customers`
                          : `${fmtN(dataset.C.ord[i])} orders · ${dataset.C.cust[i]} customers`}
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="hint">
                <span style={{ fontSize: '22px', animation: 'float 1.6s infinite' }}>👆</span>
                <span>Tap any point (or hover) to see its full details here.</span>
              </div>
            )}
          </div>
        </section>

        {/* DONUT CHART: REVENUE BY CATEGORY */}
        <section className="analytics-card">
          <h2>Revenue by category</h2>
          <div className="sub">Tap a segment to filter the other charts by that category.</div>

          <svg
            viewBox="0 0 320 320"
            role="img"
            aria-label="Category share donut"
            className="chart-canvas"
            style={{ maxWidth: '320px', margin: '0 auto' }}
          >
            <circle
              cx="160"
              cy="160"
              r={donutData.R}
              fill="none"
              strokeWidth={46}
              style={{ stroke: 'var(--line)' }}
            />
            {donutData.slices.map(s => (
              <circle
                key={`donut-slice-${animKey}-${s.idx}`}
                cx={160}
                cy={160}
                r={donutData.R}
                fill="none"
                strokeWidth={46}
                className={`seg-c ${donutData.slices.some(x => x.isSel) && !s.isSel ? 'dimmed' : ''}`}
                style={{
                  stroke: s.color,
                  strokeDasharray: s.strokeDasharray,
                  strokeDashoffset: s.strokeDashoffset,
                  transform: s.isSel ? `translate(${s.shiftX}px, ${s.shiftY}px)` : ''
                }}
                onClick={() => setSelectedCategoryIdx(selectedCategoryIdx === s.idx ? null : s.idx)}
              />
            ))}

            {/* Donut Center Text */}
            <text
              x="160"
              y="166"
              textAnchor="middle"
              style={{ fontSize: '27px', fontWeight: 800, fill: 'var(--text)' }}
            >
              {selectedCategoryIdx !== null
                ? `${(Number(donutData.slices[selectedCategoryIdx]?.pct || 0) * animProgress).toFixed(1)}%`
                : fmtMoney(donutData.tot * animProgress)}
            </text>
            <text
              x="160"
              y="190"
              textAnchor="middle"
              style={{ fontSize: '12px', fill: 'var(--muted)' }}
            >
              {selectedCategoryIdx !== null ? categories[selectedCategoryIdx] : 'total revenue'}
            </text>
          </svg>

          {/* Interactive Legend Rows with Animated Progress Bars */}
          <div className="lg">
            {donutData.slices.map(s => (
              <button
                key={s.idx}
                onClick={() => setSelectedCategoryIdx(selectedCategoryIdx === s.idx ? null : s.idx)}
                className={`lrow cursor-pointer ${s.isSel ? 'on' : ''} ${selectedCategoryIdx !== null && !s.isSel ? 'off' : ''}`}
                style={{ '--c': s.color }}
              >
                <i />
                <span className="nm">
                  <span>{s.name}</span>
                  <span className="mb">
                    <s style={{ width: `${s.pct * animProgress}%` }} />
                  </span>
                </span>
                <span className="am">{fmtMoney(s.amt * animProgress)}</span>
                <span className="dd">
                  {(() => {
                    const comp = calcComparison(s.amt, dataset.PA.rev[s.idx]);
                    return (
                      <span className={`dp ${comp.cls}`}>
                        {comp.text}
                      </span>
                    );
                  })()}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* WEEKDAY PATTERN BAR CHART */}
        <section className="analytics-card">
          <h2>Weekday pattern</h2>
          <div className="sub">
            {metricMode === 'rev' ? 'Revenue' : metricMode === 'ord' ? 'Orders' : 'Avg order'} · {selectedCategoryIdx !== null ? categories[selectedCategoryIdx] : 'Entire store'}
            {compareLastYear ? ' · marker = previous period' : ''}
          </div>

          <div className="cw">
            <svg
              ref={barSvgRef}
              viewBox={`0 0 ${weekdaySeries.W} ${weekdaySeries.H}`}
              role="img"
              aria-label="Weekday bar chart"
              className={`chart-canvas ${barPinIdx !== null ? 'bsel' : ''}`}
            >
              <defs>
                <linearGradient id="barBg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--c1)" />
                  <stop offset="100%" stopColor="var(--c2)" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="barBg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--c3)" />
                  <stop offset="100%" stopColor="var(--c4)" stopOpacity="0.55" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {Array.from({ length: 8 }).map((_, k) => {
                const vis = k <= weekdaySeries.ticks;
                const y = weekdaySeries.Y(k * weekdaySeries.step);
                const ok = vis && y >= weekdaySeries.pt - 1;
                return (
                  <g key={k} style={{ opacity: ok ? 1 : 0 }}>
                    <line
                      x1={weekdaySeries.pl}
                      x2={weekdaySeries.W - weekdaySeries.pr}
                      y1={y}
                      y2={y}
                      style={{ stroke: 'var(--line)', strokeDasharray: '3 5' }}
                    />
                    <text x={weekdaySeries.pl - 8} y={y + 4} textAnchor="end">
                      {fmtAxis(k * weekdaySeries.step, metricMode)}
                    </text>
                  </g>
                );
              })}

              {/* Average Dashed Benchmark Line */}
              <line
                x1={weekdaySeries.pl}
                x2={weekdaySeries.W - weekdaySeries.pr}
                y1={weekdaySeries.avgY}
                y2={weekdaySeries.avgY}
                style={{ stroke: 'var(--text)', strokeWidth: '1.4', strokeDasharray: '6 6', opacity: 0.7 }}
              />
              <text
                x={weekdaySeries.W - weekdaySeries.pr}
                y={weekdaySeries.avgY - 6}
                textAnchor="end"
                style={{ fill: 'var(--text)' }}
              >
                average {fmtAxis(weekdaySeries.avg, metricMode)}
              </text>

              {/* Bars and Values with Spring Bounce */}
              {weekdaySeries.bars.map((b) => (
                <g key={b.idx}>
                  <rect
                    key={`bar-rect-${animKey}-${b.idx}`}
                    x={b.x}
                    y={b.y}
                    width={b.bw}
                    height={b.h}
                    rx={Math.min(10, b.h / 2)}
                    className={`bar ${b.isPin ? 'sel' : ''}`}
                    style={{
                      transformOrigin: `${b.x + b.bw / 2}px ${weekdaySeries.H - weekdaySeries.pb}px`,
                      animation: `chartBarGrow 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${b.idx * 0.06}s both`,
                      fill: b.isPeak ? 'url(#barBg2)' : 'url(#barBg1)'
                    }}
                    onClick={() => setBarPinIdx(barPinIdx === b.idx ? null : b.idx)}
                    onPointerEnter={(e) => { if (e.pointerType !== 'touch') handleBarHover(b.idx, true); }}
                    onPointerLeave={() => handleBarHover(b.idx, false)}
                  />
                  {b.v > 0 && b.h > 3 && (
                    <text
                      x={b.x + b.bw / 2}
                      y={b.y - 7}
                      textAnchor="middle"
                      style={{ fontWeight: 700, fill: 'var(--text)', fontSize: '11.5px' }}
                    >
                      {fmtAxis(b.v, metricMode)}
                    </text>
                  )}
                  {compareLastYear && (
                    <line
                      x1={b.x - 4}
                      x2={b.x + b.bw + 4}
                      y1={b.prevY}
                      y2={b.prevY}
                      style={{ stroke: 'var(--text)', strokeWidth: '2.2', strokeLinecap: 'round', opacity: 0.85 }}
                    />
                  )}
                  <text
                    x={b.x + b.bw / 2}
                    y={weekdaySeries.H - 12}
                    textAnchor="middle"
                  >
                    {b.day}
                  </text>
                </g>
              ))}
            </svg>

            {/* Bar Tooltip */}
            {barTipPos.visible && barTipPos.dayIdx !== null && (
              <div
                className="tip on"
                style={{ left: `${barTipPos.x}px`, top: `${barTipPos.y}px` }}
              >
                <b>{DAYF[barTipPos.dayIdx]}</b>
                <span className="tv">{fmtExact(weekdaySeries.bars[barTipPos.dayIdx].v, metricMode)}</span>
                {compareLastYear && (
                  <>
                    <br />
                    <span>
                      Previous: {fmtExact(weekdaySeries.bars[barTipPos.dayIdx].prevV, metricMode)}{' '}
                      <span className={`dp ${dlt(weekdaySeries.bars[barTipPos.dayIdx].v, weekdaySeries.bars[barTipPos.dayIdx].prevV) >= 0 ? 'up' : 'dn'}`}>
                        {dlt(weekdaySeries.bars[barTipPos.dayIdx].v, weekdaySeries.bars[barTipPos.dayIdx].prevV) >= 0 ? '▲ ' : '▼ '}
                        {Math.abs(dlt(weekdaySeries.bars[barTipPos.dayIdx].v, weekdaySeries.bars[barTipPos.dayIdx].prevV) || 0).toFixed(1)}%
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interactive Bar Info Box Below */}
          <div className="info" aria-live="polite">
            {barPinIdx !== null ? (
              (() => {
                const i = barPinIdx;
                const m = metricMode;
                const v = weekdaySeries.bars[i].v;
                const p = weekdaySeries.bars[i].prevV;
                const diff = weekdaySeries.avg ? (v - weekdaySeries.avg) / weekdaySeries.avg * 100 : 0;
                const tot = weekdaySeries.cur.reduce((a, b) => a + b, 0);
                const rank = [...weekdaySeries.cur].sort((a, b) => b - a).indexOf(v) + 1;
                const badge = rank === 1 ? 'Busiest day' : rank === 7 ? 'Quietest day' : `Rank ${rank}/7`;

                return (
                  <div className="ib">
                    <span className="bigv">{m === 'ord' ? fmtN(v) : '₹' + fmtN(v)}</span>
                    <div>
                      <b>{DAYF[i]}</b>
                      <em>{badge}</em>
                      <p>
                        Vs average: {diff >= 0 ? '▲ ' : '▼ '}{Math.abs(diff).toFixed(0)}% {diff >= 0 ? 'higher' : 'lower'}
                        <br />
                        Previous period: {fmtExact(p, m)}{' '}
                        {(() => {
                          const c = calcComparison(v, p);
                          return <span className={`dp ${c.cls}`}>{c.text}</span>;
                        })()}
                        {m !== 'aov' && ` · Share of the week: ${(tot ? v / tot * 100 : 0).toFixed(1)}%`}
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="hint">
                <span style={{ fontSize: '22px', animation: 'float 1.6s infinite' }}>👆</span>
                <span>Tap any bar to see the full details for that day.</span>
              </div>
            )}
          </div>
        </section>

        {/* KEY INSIGHTS (Wide) */}
        <section className="analytics-card lg:col-span-2">
          <h2>Key insights</h2>
          <div className="sub">Automated performance intelligence derived from recorded customer orders.</div>

          <div className="ins">
            {insightsList.map((item, idx) => (
              <div key={idx} className="in">
                <span className="ic">{item.icon}</span>
                <div dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
        </section>

      </div>

      <p className="foot">
        Ankush General Store · Sales & Revenue Analytics Hub
      </p>
    </div>
  );
}
