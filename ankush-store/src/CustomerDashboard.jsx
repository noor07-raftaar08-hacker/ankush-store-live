import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStore,
  STORE_ADDRESS_TEXT,
  SHOP_WHATSAPP_NUMBER,
  SHOP_WHATSAPP_INTL,
  RealGoldCoinIcon
} from './StoreContext';
import Footer from './Footer';
import OrderReceiptModal from './components/OrderReceiptModal';

export default function CustomerDashboard() {
  const {
    currentUser,
    logoutCustomer,
    updateCustomerProfile,
    setCurrentView,
    storeSettings,
    orders,
    products,
    activeOffers,
    rashanList,
    saveRashanList,
    watchlistIds,
    toggleWatchlistProduct,
    addToCart,
    cartItems,
    useCoins,
    setUseCoins,
    setIsCartOpen,
    customerDistanceKm,
    setCustomerDistanceKm,
    distanceZoneLabel,
    setDistanceZoneLabel
  } = useStore();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'rashan' | 'wallet' | 'offers' | 'profile' | 'support'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');
  const [toastBanner, setToastBanner] = useState(null);

  // Monthly Rashan List Search & Selection States
  const [rashanSearchQuery, setRashanSearchQuery] = useState('');
  const [selectedRashanProdId, setSelectedRashanProdId] = useState(() => products[0]?.id || '');
  const [selectedRashanQty, setSelectedRashanQty] = useState(1);

  // Watchlist Search State
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');

  // Wallet Coin Converter Slider State
  const [coinSliderVal, setCoinSliderVal] = useState(currentUser?.coins || 50);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePin, setProfilePin] = useState(currentUser?.pin || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [showProfilePin, setShowProfilePin] = useState(false);

  // Support & Custom Parchi States
  const [parchiText, setParchiText] = useState('');
  const [issueOrderId, setIssueOrderId] = useState('');
  const [issueType, setIssueType] = useState('Missing Item');
  const [issueDescription, setIssueDescription] = useState('');

  // Quick Toast Helper
  const showToast = (msg, openShoppingAfter = false) => {
    setToastBanner({ id: Date.now(), msg, openShoppingAfter });
    setTimeout(() => {
      setToastBanner(null);
    }, 3200);
  };

  // Universal Safe Image / Emoji Renderer (Fixes Base64 Text Spill Bug 100%)
  const renderProductThumb = (imgVal, sizeClass = "w-12 h-12", textClass = "text-2xl") => {
    const raw = String(imgVal || '').trim();
    const isImageUri =
      raw.startsWith('data:image') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('/') ||
      raw.startsWith('blob:');

    if (isImageUri) {
      return (
        <img
          src={raw}
          alt="Product"
          className={`${sizeClass} rounded-2xl object-cover bg-white border border-slate-700/40 shrink-0 shadow-sm`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      );
    }

    // If string is suspiciously long (corrupted base64 without prefix), show fallback icon
    const safeEmoji = raw.length > 12 || raw.length === 0 ? '🛍️' : raw;
    return (
      <div
        className={`${sizeClass} rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center ${textClass} shrink-0 shadow-sm select-none`}
      >
        {safeEmoji}
      </div>
    );
  };

  // =========================================================================
  // SMART CART, REPEAT ORDER & REDEEM HANDLERS (100% Working with Store View)
  // =========================================================================

  // 1. Add Single Product to Cart (Works from Quick Buy, Rashan List & Watchlist)
  const handleSmartAddToCart = (prod, qty = 1, goToStoreCart = false) => {
    if (!prod) return;
    const validPkg =
      Array.isArray(prod.packages) && prod.packages.length > 0
        ? prod.packages.find(pk => pk.stockStatus !== 'Out of Stock' && pk.isAvailable !== false) || prod.packages[0]
        : null;

    addToCart(prod, validPkg, Number(qty) || 1);

    if (goToStoreCart) {
      setCurrentView('home');
      setTimeout(() => setIsCartOpen(true), 120);
    } else {
      showToast(`✅ "${prod.name}" (×${qty}) Cart me add ho gaya!`, true);
    }
  };

  // 2. Smart Repeat Order (Matches Live Products or Falls Back to Order Items & Opens Cart)
  const handleSmartRepeatOrder = (targetOrder = null) => {
    const orderToUse = targetOrder || myOrders[0];
    if (!orderToUse || !Array.isArray(orderToUse.items) || orderToUse.items.length === 0) {
      alert("⚠️ Repeat karne ke liye abhi aapka koi pichhla order nahi mila! Chaliye pehla order banate hain.");
      setCurrentView('home');
      return;
    }

    let addedCount = 0;
    orderToUse.items.forEach(oldItem => {
      const cleanBaseName = String(oldItem.baseProductName || oldItem.name || '')
        .split('(')[0]
        .trim()
        .toLowerCase();

      const matchedProd = products.find(
        p =>
          String(p.id) === String(oldItem.productId) ||
          String(p.id) === String(oldItem.id) ||
          String(p.name || '').toLowerCase() === cleanBaseName
      );

      if (matchedProd) {
        const matchedPkg =
          (matchedProd.packages || []).find(
            pk => pk.packageId === oldItem.packageId || pk.weight === oldItem.weight
          ) || null;
        addToCart(matchedProd, matchedPkg, Number(oldItem.quantity) || 1);
        addedCount++;
      } else {
        // Fallback: construct product object directly from saved order item
        const fallbackProd = {
          id: oldItem.productId || oldItem.id || Date.now(),
          name: oldItem.baseProductName || oldItem.name || 'Grocery Item',
          price: Number(oldItem.price) || 50,
          unit: oldItem.unit || 'pc',
          image_url: oldItem.image_url || '🛍️',
          stockStatus: 'Full Stock'
        };
        addToCart(fallbackProd, null, Number(oldItem.quantity) || 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      // Switch to Store Homepage & Open Cart Drawer immediately so user sees items
      setCurrentView('home');
      setTimeout(() => {
        setIsCartOpen(true);
      }, 150);
    }
  };

  // 3. Smart Redeem Coins Handler (Activates Coin Discount & Opens Store Cart)
  const handleSmartRedeemCoins = () => {
    if (!currentUser || Number(currentUser.coins) <= 0) {
      alert("🪙 Aapke wallet me abhi 0 Coins hain. Shopping karke har ₹100 par +2 Coins kamaayein!");
      return;
    }
    setUseCoins(true);
    setCurrentView('home');
    setTimeout(() => {
      setIsCartOpen(true);
    }, 150);
  };

  // 4. Add Full Monthly Rashan List to Cart & Open Cart Drawer
  const handleSmartAddFullRashanList = () => {
    if (!rashanList || rashanList.length === 0) {
      alert("⚠️ Aapki Monthly Rashan List abhi khali hai! Pehle list me saman jodein.");
      return;
    }

    let count = 0;
    rashanList.forEach(entry => {
      const prod =
        products.find(p => String(p.id) === String(entry.productId)) || entry.productSnapshot;
      if (prod && prod.stockStatus !== 'Out of Stock') {
        const validPkg =
          Array.isArray(prod.packages) && prod.packages.length > 0 ? prod.packages[0] : null;
        addToCart(prod, validPkg, Number(entry.qty) || 1);
        count++;
      }
    });

    if (count > 0) {
      setCurrentView('home');
      setTimeout(() => {
        setIsCartOpen(true);
      }, 150);
    } else {
      alert("⚠️ Rashan list ke items abhi Out of Stock hain!");
    }
  };

  // =========================================================================
  // DATA COMPUTATIONS
  // =========================================================================

  // 1. Customer's Own Orders
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => String(o.customerPhone) === String(currentUser.phone));
  }, [orders, currentUser]);

  const filteredMyOrders = useMemo(() => {
    if (orderFilterStatus === 'ALL') return myOrders;
    if (orderFilterStatus === 'pending') {
      return myOrders.filter(o => o.status !== 'delivered');
    }
    return myOrders.filter(o => o.status === 'delivered');
  }, [myOrders, orderFilterStatus]);

  const currentActiveOrder = useMemo(() => {
    return myOrders.find(o => o.status !== 'delivered') || myOrders[0] || null;
  }, [myOrders]);

  // 2. Financial & Khata Passbook Summary
  const financialSummary = useMemo(() => {
    let totalSpent = 0;
    let totalOrderValue = 0;
    let discountSaved = 0;
    let cashTotal = 0;
    let upiTotal = 0;

    myOrders.forEach(o => {
      const finalAmt = Number(o.finalAmount) || 0;
      const rawAmt = Number(o.rawSubtotal) || finalAmt;
      const discAmt = (Number(o.totalDiscount) || 0) + (Number(o.coinsUsed) || 0);

      totalOrderValue += rawAmt;
      discountSaved += discAmt;
      totalSpent += finalAmt;

      if (o.paymentMethod === 'cash') {
        cashTotal += finalAmt;
      } else {
        upiTotal += finalAmt;
      }
    });

    return {
      totalSpent,
      discountSaved,
      totalOrders: myOrders.length,
      orderValue: totalOrderValue,
      cashTotal,
      upiTotal,
      coins: currentUser?.coins || 0
    };
  }, [myOrders, currentUser]);

  // 3. VIP Tier Badge Calculation
  const vipTierInfo = useMemo(() => {
    const count = myOrders.length;
    if (count >= 15) {
      return {
        tier: 'Platinum VIP',
        badge: '💎 Platinum Royal VIP',
        color: 'from-cyan-400 via-sky-500 to-blue-600',
        perk: 'Priority 30-Min Delivery + Special Festival Gift Box'
      };
    }
    if (count >= 6) {
      return {
        tier: 'Gold VIP',
        badge: '🥇 Gold VIP Member',
        color: 'from-amber-300 via-yellow-500 to-orange-500',
        perk: 'Priority Fast Delivery + Extra Bonus Coins on Bulk Orders'
      };
    }
    return {
      tier: 'Silver VIP',
      badge: '🥈 Silver Verified Member',
      color: 'from-emerald-400 to-teal-600',
      perk: 'Verified Pratappur Member + 2 Coins per ₹100 spent'
    };
  }, [myOrders.length]);

  // 4. Frequently Bought Products ("Quick Buy Again")
  const frequentlyBoughtProducts = useMemo(() => {
    const counts = {};
    myOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const pid = String(it.productId || it.id).split('__')[0];
        counts[pid] = (counts[pid] || 0) + (Number(it.quantity) || 1);
      });
    });

    const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const matched = sortedIds
      .map(id => products.find(p => String(p.id) === String(id)))
      .filter(Boolean);

    if (matched.length >= 4) {
      return matched.slice(0, 6);
    }
    // Fill remaining slots with top store products so Quick Buy is always rich & functional
    const combined = [...matched];
    products.forEach(p => {
      if (combined.length < 6 && !combined.some(x => String(x.id) === String(p.id))) {
        combined.push(p);
      }
    });
    return combined;
  }, [myOrders, products]);

  // 5. Filtered Products for Monthly Rashan Search Bar
  const rashanSearchResults = useMemo(() => {
    const q = rashanSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        p =>
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.category || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, rashanSearchQuery]);

  // 6. Resolved Monthly Rashan List Items (Matches by ID or Name so all products fetch cleanly)
  const resolvedRashanItems = useMemo(() => {
    return (rashanList || [])
      .map(entry => {
        const found = products.find(p => String(p.id) === String(entry.productId));
        return {
          ...entry,
          product: found || entry.productSnapshot || null
        };
      })
      .filter(item => item.product !== null);
  }, [rashanList, products]);

  const rashanEstimatedTotal = useMemo(() => {
    return resolvedRashanItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) || 0) * (Number(item.qty) || 1);
    }, 0);
  }, [resolvedRashanItems]);

  // 7. Resolved Watchlist Products + Discounted Store Products
  const resolvedWatchlistProducts = useMemo(() => {
    const directMatches = products.filter(p =>
      (watchlistIds || []).some(wid => String(wid) === String(p.id))
    );
    if (directMatches.length > 0) return directMatches;
    // Fallback: if IDs changed, show products with active offers or top 4 products
    const offerProds = products.filter(
      p => p.discountConfig?.isActive && p.discountConfig?.offerType !== 'NONE'
    );
    return offerProds.length > 0 ? offerProds.slice(0, 6) : products.slice(0, 4);
  }, [products, watchlistIds]);

  const watchlistSearchMatches = useMemo(() => {
    const q = watchlistSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p => String(p.name || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [products, watchlistSearchQuery]);

  // =========================================================================
  // FORM HANDLERS
  // =========================================================================

  const handleAddProductToRashan = (prodObj = null, customQty = null) => {
    const targetProd =
      prodObj ||
      products.find(p => String(p.id) === String(selectedRashanProdId)) ||
      products[0];

    if (!targetProd) return;
    const qtyToAdd = Math.max(1, Number(customQty ?? selectedRashanQty) || 1);

    const exists = rashanList.find(item => String(item.productId) === String(targetProd.id));
    if (exists) {
      saveRashanList(
        rashanList.map(item =>
          String(item.productId) === String(targetProd.id)
            ? { ...item, qty: Number(item.qty) + qtyToAdd, productSnapshot: targetProd }
            : item
        )
      );
    } else {
      saveRashanList([
        ...rashanList,
        { productId: targetProd.id, qty: qtyToAdd, productSnapshot: targetProd }
      ]);
    }
    setRashanSearchQuery('');
    showToast(`📋 "${targetProd.name}" aapki Monthly Rashan List me jud gaya!`);
  };

  const handleUpdateRashanQty = (pid, nextQty) => {
    if (nextQty <= 0) {
      saveRashanList(rashanList.filter(item => String(item.productId) !== String(pid)));
      return;
    }
    saveRashanList(
      rashanList.map(item =>
        String(item.productId) === String(pid) ? { ...item, qty: nextQty } : item
      )
    );
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (profilePin.length !== 4 || !/^\d{4}$/.test(profilePin)) {
      alert("⚠️ Secret PIN bilkul 4 digit (numbers) ka hona chahiye!");
      return;
    }
    updateCustomerProfile(currentUser.phone, {
      name: profileName.trim(),
      pin: profilePin.trim(),
      address: profileAddress.trim()
    });
    showToast("✅ Aapka Profile, PIN aur Delivery Address save ho gaya!");
  };

  const handleSendCustomParchi = (e) => {
    e.preventDefault();
    if (!parchiText.trim()) {
      alert("Kripya parchi me saman ka naam likhein!");
      return;
    }
    const msg =
      `🏪 *Ankush General Store — Custom Parchi Request*\n` +
      `👤 *VIP Customer:* ${currentUser.name}\n` +
      `📱 *Phone:* ${currentUser.phone}\n` +
      `📍 *Address:* ${currentUser.address || STORE_ADDRESS_TEXT}\n\n` +
      `📝 *Meri Saman List / Special Request:*\n${parchiText.trim()}`;
    window.open(
      `https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_INTL}&text=${encodeURIComponent(msg)}`,
      '_blank'
    );
    setParchiText('');
  };

  const handleReportOrderIssue = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      alert("Kripya apni samasya (issue) ke baare me thoda likhein!");
      return;
    }
    const targetOrd = issueOrderId || myOrders[0]?.id || 'Recent Order';
    const msg =
      `🛠️ *Order Support Ticket — Ankush General Store*\n` +
      `👤 *Customer:* ${currentUser.name} (${currentUser.phone})\n` +
      `📦 *Order ID:* ${targetOrd}\n` +
      `⚠️ *Issue Type:* ${issueType}\n` +
      `💬 *Details:* ${issueDescription.trim()}`;
    window.open(
      `https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_INTL}&text=${encodeURIComponent(msg)}`,
      '_blank'
    );
    setIssueDescription('');
  };

  const handleReferFriendWhatsApp = () => {
    const shareText =
      `🎉 *Ankush General Store (${STORE_ADDRESS_TEXT})* se ghar baithe fresh rashan aur groceries mangwayein!\n\n` +
      `🎁 Mere VIP Referral Code *AGS-${currentUser.phone.slice(-4)}* se Sign Up karein aur paayein *+20 FREE Ankush Gold Coins*!\n` +
      `🚚 ₹1,500+ ke order par 2 km ke andar 100% FREE Home Delivery!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#071318] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="text-6xl mb-2">🔒</div>
        <h2 className="text-2xl font-black">Customer Login Required</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Apna VIP Customer Dashboard kholne ke liye kripya login karein.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs cursor-pointer shadow-lg"
        >
          ← Back to Store Homepage
        </button>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'orders', label: 'My Orders & Bills', icon: '📦', badge: myOrders.length },
    { id: 'rashan', label: 'Monthly Rashan List', icon: '📋', badge: resolvedRashanItems.length },
    { id: 'wallet', label: 'My Wallet & Coins', icon: '🪙' },
    { id: 'offers', label: 'Coupons & Watchlist', icon: '🎟️', badge: resolvedWatchlistProducts.length },
    { id: 'profile', label: 'My Profile & Address', icon: '👤' },
    { id: 'support', label: 'Support / Help', icon: '🎧' }
  ];

  const getOrderStepIndex = (status) => {
    if (!status) return 1;
    const s = status.toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'on the way' || s === 'out_for_delivery') return 2;
    if (s === 'packed' || s === 'processing') return 1;
    return 0;
  };

  const activeStepIdx = getOrderStepIndex(currentActiveOrder?.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071c21] via-[#0b1528] to-[#070d19] text-white flex flex-col justify-between pb-20 lg:pb-0 font-sans">
      {/* LIVE FLOATING ACTION TOAST BANNER */}
      <AnimatePresence>
        {toastBanner && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border-2 border-emerald-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl max-w-[92vw]"
          >
            <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
              {toastBanner.msg}
            </span>
            {toastBanner.openShoppingAfter && (
              <button
                onClick={() => {
                  setToastBanner(null);
                  setCurrentView('home');
                  setTimeout(() => setIsCartOpen(true), 120);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1 rounded-xl cursor-pointer shrink-0"
              >
                View Cart ({cartItems.length}) →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          1. MOBILE SLIDE-IN HAMBURGER MENU DRAWER
      ===================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="relative w-72 max-w-[82vw] bg-gradient-to-b from-[#0d2238] via-[#0a2e36] to-[#083838] text-white h-full z-10 p-5 flex flex-col justify-between shadow-2xl border-r border-teal-500/30"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                        🧑🏽
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white leading-tight">
                        {currentUser.name}
                      </h3>
                      <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                        Customer • ✓ Verified
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 space-y-1.5">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded-full font-extrabold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-amber-300 hover:bg-white/10"
                  >
                    <span>🛍️</span>
                    <span>Back to Store Shopping</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/15">
                <div className="border border-teal-400/30 bg-white/5 rounded-2xl py-2.5 px-4 text-center italic text-xs text-teal-100">
                  Shop Smart, Save More
                </div>
                <button
                  onClick={logoutCustomer}
                  className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-400/30 text-xs font-extrabold"
                >
                  🚪 Logout Account
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          2. STICKY APP-STYLE HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0b253a] via-[#0c3b38] to-[#0f4c45] backdrop-blur-xl border-b border-teal-400/20 shadow-xl px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white text-lg shrink-0 cursor-pointer"
            >
              ☰
            </button>
            <div
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 cursor-pointer truncate"
            >
              {storeSettings?.logoUrl ? (
                <img
                  src={storeSettings.logoUrl}
                  alt="Logo"
                  className="w-10 h-10 rounded-xl bg-white p-0.5 object-contain shrink-0 hidden sm:block"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shrink-0 hidden sm:flex">
                  🏪
                </div>
              )}
              <div className="truncate">
                <h1 className="font-extrabold text-sm sm:text-lg text-white leading-tight truncate">
                  {storeSettings?.storeName || 'Ankush General Store'}
                </h1>
                <p className="text-[11px] text-teal-200 flex items-center gap-1 truncate">
                  <span className="text-rose-400">📍</span>
                  <span className="truncate">{storeSettings?.storeAddress || 'Khorma, Pratappur'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-teal-950/70 hover:bg-teal-900 border border-amber-400/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-inner cursor-pointer"
            >
              <RealGoldCoinIcon size="sm" />
              <span className="font-black text-amber-300 text-xs sm:text-sm">
                {currentUser.coins}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('home');
                setTimeout(() => setIsCartOpen(true), 120);
              }}
              className="relative bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-xs font-black cursor-pointer"
              title="Open Shopping Cart"
            >
              <span>🛒</span>
              <span>{cartItems.length}</span>
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer"
            >
              <span>🛍️</span>
              <span>Shop Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          3. MAIN WORKSPACE: DESKTOP SIDEBAR + DYNAMIC CONTENT
      ===================================================================== */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex gap-6 p-3 sm:p-6">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-64 bg-gradient-to-b from-[#0d2238]/95 via-[#0a2e36]/95 to-[#083838]/95 border border-teal-500/30 rounded-3xl p-4 shrink-0 shadow-2xl h-fit sticky top-20">
          <div className="space-y-4">
            <div className="bg-black/25 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                  🧑🏽
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-emerald-300 font-semibold">Customer • ✓ Verified</p>
                <span className="inline-block mt-1 text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {vipTierInfo.tier}
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-4 mt-6 border-t border-white/15 space-y-2.5">
            <div className="border border-teal-400/30 bg-white/5 rounded-2xl py-2 px-3 text-center italic text-xs text-teal-100">
              Shop Smart, Save More
            </div>
            <button
              onClick={logoutCustomer}
              className="w-full py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              🚪 Logout Account
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* =================================================================
              TAB 1: DASHBOARD HOME (NO CHARTS — CLEAN & FAST)
          ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Top Section: Greeting Card + Ankush Coins Balance Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-6 bg-gradient-to-br from-[#e6f4f1] to-[#d5ece7] text-slate-900 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-lg border border-teal-200"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md flex items-center justify-center text-3xl shrink-0">
                      🧑🏽
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                        Hello, {currentUser.name}
                      </h2>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">Welcome back!</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="bg-emerald-600/15 text-emerald-800 border border-emerald-600/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                          ✓ Verified User
                        </span>
                        <span className="bg-amber-500/20 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {vipTierInfo.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="md:col-span-6 bg-gradient-to-r from-[#0d4a42] via-[#0f5c52] to-[#126b5f] text-white rounded-3xl p-5 flex items-center justify-between shadow-xl border border-teal-400/30"
                >
                  <div>
                    <p className="text-xs text-teal-100 font-semibold">Ankush Coins Balance</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {currentUser.coins}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">Coins</span>
                    </div>
                    <p className="text-xs text-teal-100/90 mt-1 font-medium">
                      = ₹{currentUser.coins} off on next order
                    </p>
                  </div>

                  <button
                    onClick={handleSmartRedeemCoins}
                    className="bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg cursor-pointer shrink-0"
                  >
                    Redeem
                  </button>
                </motion.div>
              </div>

              {/* 2x2 Compact Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#e8f6f0] text-slate-900 rounded-3xl p-4 shadow-md border border-emerald-200">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm mb-2.5">
                    ₹
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Total Spent</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₹{financialSummary.totalSpent.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-[#f3eafd] text-slate-900 rounded-3xl p-4 shadow-md border border-purple-200">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-sm mb-2.5">
                    %
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Discount Saved</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₹{financialSummary.discountSaved.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-[#fdf2e4] text-slate-900 rounded-3xl p-4 shadow-md border border-amber-200">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm mb-2.5">
                    📦
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {financialSummary.totalOrders}
                  </p>
                </div>

                <div className="bg-[#e9effd] text-slate-900 rounded-3xl p-4 shadow-md border border-blue-200">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm mb-2.5">
                    🛍️
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Order Value</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₹{financialSummary.orderValue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* 4 Quick Action Icons Row */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
                {[
                  { label: 'Track', icon: '📦', action: () => setActiveTab('orders') },
                  { label: 'Reorder', icon: '↻', action: () => handleSmartRepeatOrder() },
                  { label: 'Offers', icon: '🏷️', action: () => setActiveTab('offers') },
                  { label: 'Help', icon: '🎧', action: () => setActiveTab('support') }
                ].map(qa => (
                  <button
                    key={qa.label}
                    onClick={qa.action}
                    className="bg-white/95 hover:bg-white text-slate-800 rounded-2xl py-3 px-2 flex flex-col items-center justify-center gap-1.5 shadow-md border border-slate-200 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span className="text-xl sm:text-2xl">{qa.icon}</span>
                    <span className="text-xs font-extrabold text-slate-700">{qa.label}</span>
                  </button>
                ))}
              </div>

              {/* Live Current Order Progress Tracker */}
              <div className="bg-white text-slate-900 rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Current order
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentActiveOrder
                        ? `${currentActiveOrder.id} • ${(currentActiveOrder.items || []).length} items • ₹${Number(currentActiveOrder.finalAmount).toFixed(0)}`
                        : 'No active order right now — Ready for your next order!'}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 font-extrabold text-xs px-3 py-1 rounded-full">
                    {currentActiveOrder
                      ? currentActiveOrder.status === 'delivered'
                        ? 'Delivered ✓'
                        : currentActiveOrder.status
                      : 'Store Open'}
                  </span>
                </div>

                <div className="mt-4 pt-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 right-0 top-3 h-1 bg-slate-200 z-0" />
                    <div
                      className="absolute left-0 top-3 h-1 bg-emerald-600 z-0 transition-all duration-500"
                      style={{ width: `${(activeStepIdx / 3) * 100}%` }}
                    />
                    {['Placed', 'Packed', 'On the way', 'Delivered'].map((stepLabel, idx) => {
                      const isDone = idx <= activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      return (
                        <div key={stepLabel} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-white border-blue-600 text-blue-600'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}
                          >
                            {isDone ? '✓' : ''}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 mt-1.5">
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Monthly Rashan Quick Preview Grid (Replaced Chart with Useful Rashan Card) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Recent Orders Cards */}
                <div className="lg:col-span-6 bg-white text-slate-900 rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
                    >
                      View all →
                    </button>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
                      <p className="text-xs text-slate-600 font-semibold">
                        Aapne abhi tak koi order place nahi kiya hai.
                      </p>
                      <button
                        onClick={() => setCurrentView('home')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                      >
                        🛍️ Place Your First Order
                      </button>
                    </div>
                  ) : (
                    myOrders.slice(0, 3).map((ord, i) => {
                      const isDeliv = ord.status === 'delivered';
                      return (
                        <div key={ord.id || i} className="border border-slate-200 rounded-2xl p-3.5 space-y-3 bg-slate-50/60">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                                {i % 2 === 0 ? '🧃' : '🛍️'}
                              </div>
                              <div>
                                <p className="font-extrabold text-sm text-slate-900">{ord.id}</p>
                                <p className="text-[11px] text-slate-500">
                                  {new Date(ord.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {(ord.items || []).length} items
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-base text-slate-900">
                                ₹{Number(ord.finalAmount).toFixed(0)}
                              </p>
                              <span
                                className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  isDeliv
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isDeliv ? 'Delivered' : 'Processing'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-extrabold text-xs cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleSmartRepeatOrder(ord)}
                              className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow cursor-pointer"
                            >
                              Repeat Order
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right: Monthly Rashan Quick Card + Free Delivery Strip */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-lg border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          📋 Monthly Rashan Shortcut
                        </h3>
                        <p className="text-xs text-slate-500">
                          {resolvedRashanItems.length} saved items • Est. ₹{rashanEstimatedTotal}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('rashan')}
                        className="text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Manage List →
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {resolvedRashanItems.slice(0, 5).map(item => (
                        <span
                          key={item.product.id}
                          className="bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-xl"
                        >
                          {item.product.name} ×{item.qty}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleSmartAddFullRashanList}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                    >
                      🛒 1-Click Add Full Rashan List to Cart
                    </button>
                  </div>

                  {/* Minimum Order & Free Delivery Strip */}
                  <div className="bg-gradient-to-r from-[#dff7ef] to-[#c7f0e2] text-slate-900 rounded-2xl p-4 flex items-center justify-between border border-emerald-300 shadow">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚚</span>
                      <div>
                        <p className="text-[11px] text-slate-600 font-semibold">Minimum order</p>
                        <p className="text-base font-black text-slate-900">₹700</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-700 font-semibold">₹1500+ order par</p>
                      <p className="text-base font-black text-emerald-900">Free Delivery</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Buy Again (Fixed Base64 Image & Working Add + Buy Now Buttons) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      ⚡ Quick Buy Again (Aapke Pasandida Saman)
                    </h3>
                    <p className="text-xs text-slate-400">
                      + Add dabayein ya Buy Now se seedha Cart me jayein
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('rashan')}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Open Rashan List →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {frequentlyBoughtProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between items-center text-center gap-2"
                    >
                      {renderProductThumb(prod.image_url, "w-14 h-14", "text-3xl")}
                      <div className="w-full">
                        <p className="font-bold text-xs text-white truncate">{prod.name}</p>
                        <p className="text-[11px] text-emerald-400 font-extrabold">
                          ₹{prod.price} / {prod.unit}
                        </p>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleSmartAddToCart(prod, 1, false)}
                          className="py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-extrabold cursor-pointer"
                        >
                          + Add
                        </button>
                        <button
                          onClick={() => handleSmartAddToCart(prod, 1, true)}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-extrabold cursor-pointer"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* =================================================================
              TAB 2: MY ORDERS, DIGITAL BILLS & MONTHLY KHATA PASSBOOK
          ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Monthly Khata Passbook Summary Strip */}
              <div className="bg-gradient-to-r from-[#0f2942] via-[#0d3b3e] to-[#0f2942] border border-teal-500/30 rounded-3xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <span>🧾</span>
                      <span>My Orders & Monthly Khata Passbook</span>
                    </h2>
                    <p className="text-xs text-teal-200 mt-0.5">
                      Har order ki pakki parchi print karein ya 1-Click me purana order repeat karein (Seedha Cart me khulega)
                    </p>
                  </div>
                  <button
                    onClick={() => handleSmartRepeatOrder()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer shrink-0"
                  >
                    🔄 Repeat Last Order →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
                    <p className="text-slate-400">Total Bill Value</p>
                    <p className="text-base sm:text-lg font-black text-white mt-0.5">
                      ₹{financialSummary.orderValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
                    <p className="text-slate-400">Total Savings</p>
                    <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                      - ₹{financialSummary.discountSaved.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
                    <p className="text-slate-400">Cash on Delivery</p>
                    <p className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                      ₹{financialSummary.cashTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
                    <p className="text-slate-400">UPI Online Paid</p>
                    <p className="text-base sm:text-lg font-black text-cyan-300 mt-0.5">
                      ₹{financialSummary.upiTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  {[
                    { id: 'ALL', label: `All Orders (${myOrders.length})` },
                    { id: 'pending', label: '🕒 In Progress' },
                    { id: 'delivered', label: '✅ Delivered' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilterStatus(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        orderFilterStatus === tab.id
                          ? 'bg-emerald-500 text-slate-950 shadow-lg'
                          : 'bg-[#0f172a] text-slate-300 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredMyOrders.length === 0 ? (
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                  <div className="text-5xl">📦</div>
                  <h3 className="text-base font-extrabold text-white">Is category me abhi koi order nahi hai</h3>
                  <p className="text-xs text-slate-400">Store par jakar apna pasandida rashan order karein!</p>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    🛍️ Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredMyOrders.map(order => {
                    const isDelivered = order.status === 'delivered';
                    return (
                      <div
                        key={order.id}
                        className="bg-[#0f172a] border border-slate-800 hover:border-teal-500/40 rounded-3xl p-4 sm:p-5 space-y-3 transition-all shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm sm:text-base text-amber-300 font-mono">
                                {order.id}
                              </span>
                              <span
                                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  isDelivered
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {isDelivered ? '✓ Delivered' : `🕒 ${order.status || 'Processing'}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              📅 {new Date(order.orderDate).toLocaleString('en-IN')} • 📍 {order.customerAddress}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-xs text-slate-400">Final Payable</p>
                            <p className="text-xl font-black text-emerald-400">
                              ₹{Number(order.finalAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Ordered Items Pills */}
                        <div className="flex flex-wrap gap-2">
                          {(order.items || []).map((it, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-semibold"
                            >
                              {it.name} <b className="text-emerald-400">×{it.quantity}</b> — ₹{it.finalItemTotal || it.price * it.quantity}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                          <button
                            onClick={() => {
                              setIssueOrderId(order.id);
                              setActiveTab('support');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                          >
                            🛠️ Report Issue
                          </button>
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-extrabold cursor-pointer"
                          >
                            🖨️ View / Print Pakki Parchi
                          </button>
                          <button
                            onClick={() => handleSmartRepeatOrder(order)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow cursor-pointer"
                          >
                            🔄 Repeat Order (Open Cart)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 3: MONTHLY RASHAN LIST BUILDER + LIVE SEARCH + 1-CLICK CART
          ================================================================= */}
          {activeTab === 'rashan' && (
            <div className="space-y-5">
              {/* Top Banner & 1-Click Add Full List Button */}
              <div className="bg-gradient-to-r from-[#0d3b38] via-[#115048] to-[#0f3443] border border-teal-400/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    Smart Family Feature
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                    📋 Meri Mahine Ki Rashan List
                  </h2>
                  <p className="text-xs text-teal-100 mt-1">
                    Apne ghar ke mahine bhar ka fix rashan search karke jodein aur 1-Click me Cart me mangwayein!
                  </p>
                </div>

                <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 space-y-2">
                  <p className="text-xs text-teal-200">
                    List Total ({resolvedRashanItems.length} items):{' '}
                    <b className="text-amber-300 text-base">₹{rashanEstimatedTotal}</b>
                  </p>
                  <button
                    onClick={handleSmartAddFullRashanList}
                    className="w-full bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg cursor-pointer"
                  >
                    🛒 1-Click Add Full List & Open Cart
                  </button>
                </div>
              </div>

              {/* Free Delivery Progress Meter for Rashan List */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    🚚 Free Delivery Target (₹1,500 within 2 km):
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {rashanEstimatedTotal >= 1500
                      ? '🎉 100% Eligible for FREE Delivery!'
                      : `Add ₹${1500 - rashanEstimatedTotal} more for FREE Delivery`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((rashanEstimatedTotal / 1500) * 100))}%` }}
                  />
                </div>
              </div>

              {/* NEW: Live Search Bar + Clean Dropdown Selector (No Base64 Mess!) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  🔍 Search & Add Products to Your Monthly List
                </h3>

                {/* Live Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search any item (e.g. Basmati Rice, Atta, Surf Excel, Oil, Sugar)..."
                    value={rashanSearchQuery}
                    onChange={e => setRashanSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white outline-none"
                  />
                  {rashanSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRashanSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {/* Live Search Results Grid */}
                {rashanSearchResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/90 p-3 rounded-2xl border border-emerald-500/30">
                    {rashanSearchResults.map(prod => (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderProductThumb(prod.image_url, "w-10 h-10", "text-xl")}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{prod.name}</p>
                            <p className="text-[11px] text-emerald-400 font-bold">
                              ₹{prod.price} / {prod.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddProductToRashan(prod, 1)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            + List
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSmartAddToCart(prod, 1, false)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            + Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clean Dropdown Selector (All Store Products without Base64 Strings) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2 border-t border-slate-800/80">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      Or Pick from All Store Products ({products.length} items available)
                    </label>
                    <select
                      value={selectedRashanProdId}
                      onChange={e => setSelectedRashanProdId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) — ₹{p.price} / {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={selectedRashanQty}
                      onChange={e => setSelectedRashanQty(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProductToRashan(null, selectedRashanQty)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shrink-0"
                  >
                    + Add to Rashan List
                  </button>
                </div>
              </div>

              {/* Saved Rashan Items List */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-2.5">
                {resolvedRashanItems.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-xs">
                    Aapki Monthly Rashan List abhi khali hai. Upar search bar ya dropdown se saman add karein!
                  </p>
                ) : (
                  resolvedRashanItems.map(entry => {
                    const prod = entry.product;
                    return (
                      <div
                        key={prod.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          {renderProductThumb(prod.image_url, "w-12 h-12", "text-2xl")}
                          <div>
                            <p className="font-extrabold text-sm text-white">{prod.name}</p>
                            <p className="text-xs text-emerald-400 font-bold">
                              ₹{prod.price} / {prod.unit} • Subtotal: ₹{Number(prod.price) * Number(entry.qty)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5">
                          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdateRashanQty(prod.id, Number(entry.qty) - 1)}
                              className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 font-black text-xs cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-3 py-1.5 text-xs font-extrabold text-white">
                              {entry.qty} {prod.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRashanQty(prod.id, Number(entry.qty) + 1)}
                              className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 font-black text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSmartAddToCart(prod, entry.qty, false)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl cursor-pointer"
                          >
                            + Add to Cart
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSmartAddToCart(prod, entry.qty, true)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Buy Now
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateRashanQty(prod.id, 0)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 cursor-pointer"
                            title="Remove from List"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 4: MY WALLET, COIN CASH-CONVERTER & REFER A FRIEND
          ================================================================= */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              {/* Top Gold Wallet Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-slate-950 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <RealGoldCoinIcon size="lg" animateSpin={true} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-amber-950">
                      Ankush VIP Gold Wallet
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black mt-0.5">
                      {currentUser.coins} Gold Coins
                    </h2>
                    <p className="text-xs font-extrabold text-amber-950 mt-0.5">
                      1 Ankush Coin = ₹1 Instant Cash Discount on Orders!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSmartRedeemCoins}
                  className="bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs px-5 py-3.5 rounded-2xl shadow-xl cursor-pointer shrink-0"
                >
                  🪙 Redeem Coins on Shopping Cart →
                </button>
              </div>

              {/* Interactive Coin Cash-Converter Calculator */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      🧮 Interactive Coin Cash-Converter
                    </h3>
                    <p className="text-xs text-slate-400">
                      Slide karke dekhein aapke coins se kitne rupaye ki bachat hogi
                    </p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-xs px-3 py-1 rounded-full">
                    {coinSliderVal} Coins = ₹{coinSliderVal} OFF
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max={Math.max(200, currentUser.coins || 100)}
                  value={coinSliderVal}
                  onChange={e => setCoinSliderVal(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>10 Coins (₹10)</span>
                  <span className="text-emerald-400 font-bold">
                    Har ₹100 ki shopping par +2 Coins milte hain!
                  </span>
                  <span>{Math.max(200, currentUser.coins || 100)} Coins</span>
                </div>
              </div>

              {/* Refer a Friend / Padosi Card */}
              <div className="bg-gradient-to-r from-[#102a45] to-[#0f3838] border border-cyan-500/30 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="bg-cyan-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    Refer & Earn +25 Coins
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    🤝 Apne Padosi ya Dost ko Invite Karein!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Pratappur aur Khorma me apne dosto ko WhatsApp par invite bhejein. Unke pehle order par aapko milenge +25 Bonus Coins!
                  </p>
                </div>
                <button
                  onClick={handleReferFriendWhatsApp}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg cursor-pointer shrink-0"
                >
                  📲 Share on WhatsApp
                </button>
              </div>

              {/* Coin Passbook History */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3">
                <h3 className="font-extrabold text-base text-white">📜 Coin Passbook History</h3>
                <div className="space-y-2">
                  {(currentUser.coinHistory && currentUser.coinHistory.length > 0
                    ? currentUser.coinHistory
                    : [
                        { id: 1, note: 'Welcome VIP Signup Bonus', amount: 20, date: currentUser.joinedAt || new Date().toISOString() }
                      ]
                  ).map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{entry.note}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(entry.date).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span
                        className={`font-black text-sm ${
                          Number(entry.amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {Number(entry.amount) >= 0 ? `+${entry.amount}` : entry.amount} Coins
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 5: COUPONS, LIVE OFFERS & PRICE/STOCK WATCHLIST (EXPLAINED & WORKING)
          ================================================================= */}
          {activeTab === 'offers' && (
            <div className="space-y-5">
              {/* Live Store Offers */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  🎟️ Store Coupons & Live Festival Deals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(activeOffers || []).map(of => (
                    <div
                      key={of.id}
                      className="bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {of.highlight || 'SPECIAL DEAL'}
                        </span>
                        <h3 className="font-extrabold text-sm text-white mt-2">{of.title}</h3>
                        <p className="text-xs text-slate-300 mt-1">{of.description}</p>
                      </div>
                      <button
                        onClick={() => setCurrentView('home')}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        Shop Offer on Store →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Drop & Back-in-Stock Watchlist (Clear Hindi Explanation + Search + Working Buy) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      🔔 My Price-Drop & Stock Alert Watchlist
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <b>Kaise kaam karta hai:</b> Apne pasandida mehnge saman (jaise Oil, Ghee, Surf Excel) ko yahan jod kar rakhein. Jab bhi Admin unka daam ghatayega ya unpar Special Discount/BOGO Offer lagayega, aapko yahan <b>🔥 OFFER ACTIVE</b> badge dikhega aur aap turant <b>Buy Now</b> kar sakte hain!
                    </p>
                  </div>
                </div>

                {/* Search to Add Any Product to Watchlist */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="🔍 Search any product to add in your Watchlist (e.g. Mustard Oil, Rice, Soap)..."
                    value={watchlistSearchQuery}
                    onChange={e => setWatchlistSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white outline-none"
                  />

                  {watchlistSearchMatches.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
                      {watchlistSearchMatches.map(prod => {
                        const isWatched = watchlistIds.some(id => String(id) === String(prod.id));
                        return (
                          <div
                            key={prod.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderProductThumb(prod.image_url, "w-9 h-9", "text-lg")}
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-white truncate">{prod.name}</p>
                                <p className="text-[11px] text-emerald-400 font-bold">
                                  ₹{prod.price} / {prod.unit}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                toggleWatchlistProduct(prod.id);
                                setWatchlistSearchQuery('');
                                showToast(
                                  isWatched
                                    ? `Removed "${prod.name}" from Watchlist`
                                    : `🔔 "${prod.name}" added to Watchlist!`
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                                isWatched
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-amber-400 text-slate-950'
                              }`}
                            >
                              {isWatched ? '✓ In Watchlist' : '+ Watch Product'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Watchlist Products Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resolvedWatchlistProducts.map(prod => {
                    const hasOffer =
                      prod.discountConfig?.isActive && prod.discountConfig?.offerType !== 'NONE';
                    const mrpSavings = Math.max(0, (Number(prod.mrp) || prod.price) - Number(prod.price));

                    return (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {renderProductThumb(prod.image_url, "w-14 h-14", "text-3xl")}
                          <div className="min-w-0">
                            <p className="font-extrabold text-sm text-white truncate">{prod.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-emerald-400 font-black">
                                ₹{prod.price} / {prod.unit}
                              </span>
                              {mrpSavings > 0 && (
                                <span className="text-[11px] text-slate-500 line-through">
                                  ₹{prod.mrp}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  prod.stockStatus === 'Out of Stock'
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-emerald-500/15 text-emerald-300'
                                }`}
                              >
                                {prod.stockStatus || 'Full Stock'}
                              </span>
                              {hasOffer && (
                                <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  🔥 {prod.discountConfig.badgeText || 'Special Offer'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSmartAddToCart(prod, 1, false)}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            + Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSmartAddToCart(prod, 1, true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow cursor-pointer"
                          >
                            Buy Now
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWatchlistProduct(prod.id)}
                            className="text-slate-500 hover:text-red-400 text-xs px-1.5 py-1 cursor-pointer"
                            title="Remove from Watchlist"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 6: MY PROFILE, SECRET PIN & DELIVERY ADDRESS
          ================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-extrabold text-white">
                  👤 My Profile, Secret PIN & Delivery Address
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Apna naam, 4-digit login PIN aur Pratappur/Khorma ka delivery address yahan se update karein
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registered Mobile Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.phone}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    4-Digit Secret Login PIN *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showProfilePin ? 'text' : 'password'}
                      maxLength={4}
                      required
                      value={profilePin}
                      onChange={e => setProfilePin(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-amber-300 font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePin(!showProfilePin)}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {showProfilePin ? '🙈 Hide' : '👁️ Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Delivery Distance Zone (From Khorma Store)
                  </label>
                  <select
                    value={customerDistanceKm}
                    onChange={e => {
                      const km = Number(e.target.value);
                      setCustomerDistanceKm(km);
                      setDistanceZoneLabel(
                        km <= 2.0
                          ? 'Khorma / Pratappur Town (Under 2 km — Free Delivery over ₹1500)'
                          : 'Nearby Village Zone (2 to 3 km)'
                      );
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  >
                    <option value={1.2}>📍 Khorma / Pratappur Town (Under 2 km — Eligible for Free Delivery)</option>
                    <option value={2.5}>🛵 Nearby Area (2 km - 3 km — ₹30 Standard Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Complete Delivery Address (Mohalla / Landmark) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Ward No. 4, Near Main Chowk, Khorma, Pratappur"
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  💾 Save Profile & Delivery Address
                </button>
              </form>
            </div>
          )}

          {/* =================================================================
              TAB 7: SUPPORT, CUSTOM PARCHI REQUEST & ORDER ISSUE TICKET
          ================================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${SHOP_WHATSAPP_NUMBER}`}
                  className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/40 rounded-3xl p-5 flex items-center gap-4 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl shrink-0">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 font-bold">Direct Store Call Helpline</p>
                    <h3 className="text-lg font-black text-white">+91 {SHOP_WHATSAPP_NUMBER}</h3>
                    <p className="text-[11px] text-slate-300">Subah 7:00 AM se Raat 9:30 PM tak</p>
                  </div>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_INTL}&text=${encodeURIComponent(
                    `Namaste Ankush General Store! Mera VIP Account (${currentUser.name} - ${currentUser.phone}) hai.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/40 rounded-3xl p-5 flex items-center gap-4 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0">
                    💬
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200 font-bold">Instant WhatsApp Support</p>
                    <h3 className="text-lg font-black text-white">Chat with Store Owner</h3>
                    <p className="text-[11px] text-slate-300">Fast reply for delivery & billing queries</p>
                  </div>
                </a>
              </div>

              <form
                onSubmit={handleSendCustomParchi}
                className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-3"
              >
                <h3 className="font-extrabold text-base text-white">
                  📝 Send Kagaz Ki Parchi / Special Item Request
                </h3>
                <p className="text-xs text-slate-400">
                  Agar koi saman aapko list me nahi mil raha hai, toh yahan naam aur quantity likh dein — hum aapke order ke sath bhej denge!
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Bhaiya 2 packet Maggi, 1 chhota Nihar Oil aur ₹10 wali 4 Dairy Milk bhi bhej dena..."
                  value={parchiText}
                  onChange={e => setParchiText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  📲 Send Parchi on Store WhatsApp
                </button>
              </form>

              <form
                onSubmit={handleReportOrderIssue}
                className="bg-[#0f172a] border border-rose-500/30 rounded-3xl p-5 space-y-3"
              >
                <h3 className="font-extrabold text-base text-rose-300">
                  🛠️ Report Order Issue / Replacement Request
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Order ID</label>
                    <input
                      type="text"
                      placeholder="e.g. AGS-1001"
                      value={issueOrderId}
                      onChange={e => setIssueOrderId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Issue Category</label>
                    <select
                      value={issueType}
                      onChange={e => setIssueType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Missing Item">Missing Item in Bag</option>
                      <option value="Wrong Package Weight">Wrong Package / Weight</option>
                      <option value="Exchange / Return">Item Exchange / Return</option>
                      <option value="Billing / Coin Query">Billing or Coin Query</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Apni samasya yahan likhein..."
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  🚀 Submit Support Ticket on WhatsApp
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          4. PAKKI PARCHI DIGITAL BILL MODAL (PRINT / SAVE PDF)
      ===================================================================== */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-black text-xl text-slate-900">
                  {storeSettings?.storeName || 'Ankush General Store'}
                </h3>
                <p className="text-xs text-slate-500">{STORE_ADDRESS_TEXT}</p>
                <p className="text-[11px] font-extrabold text-emerald-700 mt-1">
                  ✓ Official Verified Pakki Dukaan Parchi
                </p>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p><b>Order ID:</b> {selectedOrderDetails.id}</p>
                <p><b>Customer:</b> {selectedOrderDetails.customerName || currentUser.name}</p>
                <p><b>Phone:</b> {selectedOrderDetails.customerPhone || currentUser.phone}</p>
                <p><b>Address:</b> {selectedOrderDetails.customerAddress || currentUser.address}</p>
                <p><b>Date:</b> {new Date(selectedOrderDetails.orderDate).toLocaleString('en-IN')}</p>
              </div>

              <div className="border-t border-b border-slate-200 py-2.5 space-y-1.5 text-xs max-h-44 overflow-y-auto">
                {(selectedOrderDetails.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>
                      {it.name} <b>×{it.quantity}</b>
                    </span>
                    <span className="font-extrabold">
                      ₹{it.finalItemTotal || it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-base font-black text-emerald-800">
                <span>Grand Total Paid:</span>
                <span>₹{Number(selectedOrderDetails.finalAmount).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    handleSmartRepeatOrder(ord);
                  }}
                  className="py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  🔄 Repeat Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          5. MOBILE FIXED BOTTOM NAVIGATION BAR
      ===================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white text-slate-700 border-t border-slate-200 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Home', icon: '🏠' },
          { id: 'orders', label: 'Orders', icon: '📦' },
          { id: 'rashan', label: 'Rashan', icon: '📋' },
          { id: 'wallet', label: 'Wallet', icon: '🪙' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map(tab => {
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isAct ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 font-semibold'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] mt-1">{tab.label}</span>
              {isAct && <span className="w-4 h-0.5 bg-emerald-600 rounded-full mt-0.5" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
}