import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStore,
  SHOP_WHATSAPP_NUMBER,
  SHOP_WHATSAPP_INTL,
  SHOP_UPI_ID,
  STORE_ADDRESS_TEXT,
  STORE_COORDS,
  calculateItemOfferDetails
} from './StoreContext';

// New Frontend Components
import TopAnnouncementBar from './components/front/TopAnnouncementBar';
import FreshNavbar from './components/front/FreshNavbar';
import CategoryNavStrip from './components/front/CategoryNavStrip';
import FreshHeroBanner from './components/front/FreshHeroBanner';
import ShopByCategory from './components/front/ShopByCategory';
import MiddleBanners from './components/front/MiddleBanners';
import DailyDeals from './components/front/DailyDeals';
import DualOfferBanners from './components/front/DualOfferBanners';
import RecommendedAndBestSellers from './components/front/RecommendedAndBestSellers';
import TrustBadges from './components/front/TrustBadges';
import MainProductsCatalog from './components/front/MainProductsCatalog';
import FloatingDailyDealsBadge from './components/front/FloatingDailyDealsBadge';
import FreshFooter from './components/front/FreshFooter';
import MobileStoreView from './components/front/MobileStoreView';
import TrackOrderModal from './components/TrackOrderModal';
import OrderReceiptModal from './components/OrderReceiptModal';

// Shared Icons
import { ShoppingCart, Check, X } from './components/Icons';

// --- PACKAGE SELECTION MODAL ---
function PackageSelectionModal() {
  const { activePackageModalProduct, setActivePackageModalProduct, addToCart, triggerFlyToCart } = useStore();
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [packetCount, setPacketCount] = useState(1);

  // Reset selected package & count when opening a new product
  useEffect(() => {
    if (activePackageModalProduct) {
      const pkgs = (Array.isArray(activePackageModalProduct.packages) && activePackageModalProduct.packages.length > 0)
        ? activePackageModalProduct.packages
        : [{
            packageId: `${activePackageModalProduct.id}-default`,
            packageName: `Standard Pack (1 ${activePackageModalProduct.unit || 'unit'})`,
            weight: activePackageModalProduct.unit ? `1 ${activePackageModalProduct.unit}` : 'Standard',
            price: activePackageModalProduct.price || 0,
            stockStatus: activePackageModalProduct.stockStatus || 'Full Stock',
            isAvailable: true
          }];
      const firstAvailable = pkgs.find(p => p.stockStatus !== 'Out of Stock') || pkgs[0];
      setSelectedPkgId(firstAvailable?.packageId || null);
      setPacketCount(1);
    }
  }, [activePackageModalProduct?.id]);

  if (!activePackageModalProduct) return null;

  const product = activePackageModalProduct;
  const packages = (Array.isArray(product.packages) && product.packages.length > 0)
    ? product.packages
    : [{
        packageId: `${product.id}-default`,
        packageName: `Standard Pack (1 ${product.unit || 'unit'})`,
        weight: product.unit ? `1 ${product.unit}` : 'Standard',
        price: product.price || 0,
        stockStatus: product.stockStatus || 'Full Stock',
        isAvailable: true
      }];
  const currentPkg = packages.find(p => p.packageId === selectedPkgId) || packages[0];

  const previewCalc = calculateItemOfferDetails(
    { price: currentPkg?.price || product.price, quantity: packetCount, unit: product.unit },
    product
  );

  const handleConfirmAddToCart = (e) => {
    if (currentPkg) {
      const rect = e?.currentTarget?.getBoundingClientRect();
      if (rect && triggerFlyToCart) {
        triggerFlyToCart(rect.left + rect.width / 2, rect.top, product.image_url);
      }
      addToCart(product, currentPkg, packetCount);
      setActivePackageModalProduct(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200"
      >
        <button
          onClick={() => setActivePackageModalProduct(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shadow-sm shrink-0">
            {typeof product.image_url === 'string' && (product.image_url.startsWith('http') || product.image_url.startsWith('data:') || product.image_url.startsWith('/') || product.image_url.startsWith('blob:')) ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl">{product.image_url || '🛒'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-slate-900 leading-tight truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 font-medium">Select pack size & quantity</p>
          </div>
        </div>

        {/* Active Product Offer Notice Banner */}
        {previewCalc.appliedOfferText ? (
          <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 flex items-center justify-between text-xs font-black shadow-xs">
            <span className="flex items-center gap-1.5 truncate">
              <span>🔥</span>
              <span className="truncate">{previewCalc.appliedOfferText}</span>
            </span>
            {previewCalc.discountAmount > 0 && (
              <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-md text-[11px] font-extrabold shrink-0 border border-emerald-200">
                -₹{previewCalc.discountAmount}
              </span>
            )}
          </div>
        ) : product.discountConfig?.isActive ? (
          <div className="mb-3 p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5">
            <span>🏷️</span>
            <span>{product.discountConfig.badgeText || 'Special Offer Active on this product!'}</span>
          </div>
        ) : null}

        {/* Packages List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {packages.map(pkg => {
            const isSelected = (currentPkg?.packageId === pkg.packageId);
            return (
              <div
                key={pkg.packageId}
                onClick={() => setSelectedPkgId(pkg.packageId)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{pkg.packageName}</span>
                  <span className="text-[11px] text-slate-500">{pkg.weight}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">₹{pkg.price}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{pkg.stockStatus || 'In Stock'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700">Number of Packs:</span>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setPacketCount(Math.max(1, packetCount - 1))}
              className="w-7 h-7 rounded-lg bg-white shadow-xs font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="px-2 font-black text-xs tabular-nums">{packetCount}</span>
            <button
              onClick={() => setPacketCount(packetCount + 1)}
              className="w-7 h-7 rounded-lg bg-white shadow-xs font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleConfirmAddToCart}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Add to Cart</span>
            <span>—</span>
            <span>₹{previewCalc.finalItemTotal}</span>
            {previewCalc.freeQuantity > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                +{previewCalc.freeQuantity} FREE
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- CART DRAWER & CHECKOUT MODAL ---
function CartAndCheckoutModals() {
  const {
    cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart,
    rawSubtotalPrice, totalProductDiscount, totalPrice, totalItems, deliveryCharge, finalAmount, totalSavings,
    isMinOrderMet, isDistanceEligible, isFreeDeliveryApplied, amountNeededForMinOrder, amountNeededForFreeDelivery,
    customerDistanceKm, setCustomerDistanceKm, distanceZoneLabel, setDistanceZoneLabel,
    paymentMethod, setPaymentMethod, customerName, setCustomerName, customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress, isCheckoutOpen, setIsCheckoutOpen,
    isReceiptOpen, setIsReceiptOpen, lastOrder, setLastOrder,
    currentUser, useCoins, setUseCoins, coinsDiscount, coinsEarnedOnOrder,
    addOrder, storeSettings
  } = useStore();

  const [error, setError] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [customerCoords, setCustomerCoords] = useState(null);

  const canOrder = isMinOrderMet && (customerDistanceKm !== null ? isDistanceEligible : true);
  const activeMerchantUpi = storeSettings?.merchantUpiId || SHOP_UPI_ID;
  const upiUri = `upi://pay?pa=${activeMerchantUpi}&pn=Ankush%20General%20Store&am=${finalAmount}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const handleDetectLocationDistance = () => {
    if (!navigator.geolocation) {
      setError('Browser me GPS support nahi hai. Kripya niche diye gaye list se distance chunein.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomerCoords({ lat: latitude, lng: longitude });
        const R = 6371;
        const dLat = ((latitude - STORE_COORDS.lat) * Math.PI) / 180;
        const dLon = ((longitude - STORE_COORDS.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((STORE_COORDS.lat * Math.PI) / 180) * Math.cos((latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const calcDist = Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
        const slabs = storeSettings?.deliveryDistanceConfig?.slabs || [];
        const sorted = [...slabs].sort((x, y) => Number(x.maxKm) - Number(y.maxKm));
        const matched = sorted.find(s => calcDist <= Number(s.maxKm)) || sorted[sorted.length - 1];
        setCustomerDistanceKm(matched ? matched.maxKm : calcDist);
        setDistanceZoneLabel(matched?.label || `Up to ${calcDist} km`);
        setDetectingGps(false);
        setError('');
      },
      () => {
        setDetectingGps(false);
        setError('GPS permission allow nahi hui. Kripya niche diye gaye list se distance chunein.');
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError('Kripya Apna Naam, Phone Number aur Delivery Address bharein.');
      return;
    }
    if (customerDistanceKm === null || customerDistanceKm === undefined) {
      setError('⚠️ Kripya niche diye gaye options me se apna Delivery Distance (KM) select karein — ye zaroori hai!');
      return;
    }
    if (!isDistanceEligible) {
      setError(`Delivery radius limit maximum ${storeSettings?.deliveryDistanceConfig?.maxRadiusKm || 15} km tak hai.`);
      return;
    }
    if (!isMinOrderMet) {
      setError('Minimum order amount ₹700 hona zaroori hai.');
      return;
    }
    const created = await addOrder({
      items: cartItems,
      totalAmount: totalPrice,
      deliveryCharge,
      coinsUsed: coinsDiscount || 0,
      coinsEarned: coinsEarnedOnOrder || 0,
      finalAmount,
      paymentMethod,
      advancePaid: paymentMethod === 'cash' ? 0 : finalAmount,
      balanceDue: paymentMethod === 'cash' ? finalAmount : 0,
      coords: customerCoords,
      customerName,
      customerPhone,
      customerAddress: `${customerAddress} [${distanceZoneLabel}]`
    });
    if (created) {
      setLastOrder(created);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
    }
  };

  return (
    <>
      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="bg-[#0b4834] p-4 text-white flex items-center justify-between">
                <h2 className="font-extrabold text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-300" />
                  <span>Your Cart ({totalItems})</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-white font-bold text-lg cursor-pointer">✕</button>
              </div>

              {cartItems.length > 0 && (
                <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 text-xs font-bold">
                  {!isMinOrderMet ? (
                    <span className="text-orange-800">⚠️ Min Order ₹700: Add ₹{amountNeededForMinOrder.toFixed(0)} more for delivery!</span>
                  ) : totalPrice < 1500 ? (
                    <span className="text-emerald-900">🚚 Free delivery ke liye ₹{amountNeededForFreeDelivery.toFixed(0)} aur jodein!</span>
                  ) : (
                    <span className="text-green-800">🎉 Congratulations! Aapki delivery FREE ho gayi hai!</span>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-center text-slate-400 py-16">Your cart is empty</p>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-xs truncate">{item.baseProductName || item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.packageName} • ₹{item.price}</p>
                        {item.appliedOfferText && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md mt-0.5 max-w-full truncate">
                            🏷️ {item.appliedOfferText}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-700 font-extrabold text-xs">₹{item.finalItemTotal}</span>
                          {item.itemDiscount > 0 && (
                            <span className="text-pink-600 font-bold text-[10px]">
                              (Saved ₹{item.itemDiscount.toFixed(0)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 font-bold cursor-pointer">−</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 font-bold cursor-pointer">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs font-bold cursor-pointer">✕</button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 bg-slate-50 border-t space-y-2.5">
                  {totalSavings > 0 && (
                    <div className="bg-green-100 text-green-800 text-xs font-extrabold py-1.5 px-3 rounded-xl text-center">
                      🥳 Total Savings: ₹{totalSavings.toFixed(0)} on this order!
                    </div>
                  )}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Product Amount</span><span>₹{rawSubtotalPrice.toFixed(2)}</span></div>
                    {totalProductDiscount > 0 && (
                      <div className="flex justify-between text-pink-600 font-bold"><span>Offer Discount</span><span>-₹{totalProductDiscount.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span>Delivery Charge {distanceZoneLabel ? `(${distanceZoneLabel})` : ''}</span>
                      <span>
                        {customerDistanceKm === null ? (
                          <span className="text-slate-400 font-medium">Select KM at checkout</span>
                        ) : deliveryCharge === 0 ? (
                          <span className="text-emerald-700 font-black">FREE (₹0) 🎉</span>
                        ) : (
                          <span className="font-bold">₹{deliveryCharge}</span>
                        )}
                      </span>
                    </div>
                    {currentUser && currentUser.coins > 0 && (
                      <div className="flex items-center justify-between py-1 bg-amber-50 px-2 rounded-lg border border-amber-200">
                        <label className="flex items-center gap-1.5 cursor-pointer text-amber-950 font-bold text-[11px]">
                          <input
                            type="checkbox"
                            checked={useCoins}
                            onChange={e => setUseCoins(e.target.checked)}
                            className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                          />
                          <span>Redeem VIP Coins ({currentUser.coins})</span>
                        </label>
                        {useCoins && <span className="text-emerald-700 font-black">-₹{coinsDiscount.toFixed(2)}</span>}
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-emerald-800 border-t pt-1">
                      <span>Final Total</span><span>₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    disabled={!isMinOrderMet}
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className={`w-full py-3 rounded-xl font-extrabold text-white shadow-lg ${
                      isMinOrderMet ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {isMinOrderMet ? 'Proceed to Checkout →' : `Min Order ₹700 Required`}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Checkout & Delivery Details</h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-500 font-bold cursor-pointer">✕</button>
              </div>

              {error && <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">{error}</div>}

              {/* Customer Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setError(''); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    value={customerPhone}
                    onChange={e => { setCustomerPhone(e.target.value); setError(''); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address (House No, Mohalla, Landmark) *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ghar ka pata, gali number, landmark"
                    value={customerAddress}
                    onChange={e => { setCustomerAddress(e.target.value); setError(''); }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Delivery Distance (KM) Selection - DYNAMIC & COMPULSORY */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>Delivery Distance (KM) *</span>
                      <span className="text-[10px] text-rose-600 font-bold">(Compulsory)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocationDistance}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <span>🛰️</span>
                      <span>{detectingGps ? 'Detecting GPS...' : 'Detect GPS'}</span>
                    </button>
                  </div>

                  {/* Dynamic Admin Distance Slabs */}
                  <div className="grid grid-cols-2 gap-2">
                    {(storeSettings?.deliveryDistanceConfig?.slabs || []).map((slab) => {
                      const isSelected = customerDistanceKm === slab.maxKm;
                      const isFree = slab.minOrderForFree > 0 && totalPrice >= slab.minOrderForFree;
                      return (
                        <div
                          key={slab.id}
                          onClick={() => {
                            setCustomerDistanceKm(slab.maxKm);
                            setDistanceZoneLabel(slab.label || `Up to ${slab.maxKm} km`);
                            setError('');
                          }}
                          className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-100/70 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-emerald-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900">
                              Up to {slab.maxKm} km
                            </span>
                            {isSelected && <span className="text-emerald-700 font-black text-xs">✓ Selected</span>}
                          </div>

                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {slab.label || `${slab.maxKm} km zone`}
                          </p>

                          <div className="mt-1.5 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold">Charge:</span>
                            {isFree ? (
                              <span className="text-emerald-700 font-black text-xs bg-emerald-100 px-1.5 py-0.5 rounded">
                                FREE (₹0) 🎉
                              </span>
                            ) : (
                              <span className="font-black text-slate-900">₹{slab.charge}</span>
                            )}
                          </div>

                          {slab.minOrderForFree > 0 && !isFree && (
                            <p className="text-[9px] text-amber-700 font-bold mt-0.5">
                              Free on ₹{slab.minOrderForFree}+ order
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {customerDistanceKm === null ? (
                    <p className="text-[10px] text-rose-500 font-bold">
                      ⚠️ Kripya upar diye gaye km slabs me se apna delivery distance chunein.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                      <span>Selected Zone: {distanceZoneLabel || `Up to ${customerDistanceKm} km`}</span>
                      <span>{deliveryCharge === 0 ? 'FREE DELIVERY (₹0) 🎉' : `₹${deliveryCharge} Delivery`}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Bill Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold">₹{totalPrice.toFixed(0)}</span>
                </div>
                {totalProductDiscount > 0 && (
                  <div className="flex justify-between text-pink-600 font-bold">
                    <span>Special Offer Discount:</span>
                    <span>-₹{totalProductDiscount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({distanceZoneLabel || (customerDistanceKm ? `${customerDistanceKm} km` : 'Not selected')}):</span>
                  <span className="font-bold tabular-nums">
                    {customerDistanceKm === null ? (
                      <span className="text-rose-500 font-bold">Select distance above</span>
                    ) : deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-black">FREE (₹0) 🎉</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                {coinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>VIP Coins Redeemed:</span>
                    <span className="font-bold">-₹{coinsDiscount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700 text-base">₹{finalAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border-2 text-xs font-extrabold cursor-pointer transition-all ${
                    paymentMethod === 'cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  💵 Cash on Delivery (Pay on Arrival)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border-2 text-xs font-extrabold cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  📱 Full UPI QR Scan
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="text-center bg-blue-50 p-3 rounded-2xl border border-blue-200">
                  <img src={qrImageUrl} alt="UPI QR" className="w-36 h-36 mx-auto rounded-xl bg-white p-2" />
                  <p className="text-[11px] font-bold text-blue-900 mt-1">Scan to Pay ₹{finalAmount.toFixed(2)} ({activeMerchantUpi})</p>
                </div>
              )}

              <button
                disabled={!isMinOrderMet}
                onClick={handlePlaceOrder}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-white shadow-lg transition-all ${
                  isMinOrderMet ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-emerald-600/30' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {!isMinOrderMet
                  ? 'Min Order ₹700 Required'
                  : customerDistanceKm === null
                    ? '⚠️ Select Delivery Distance Above (KM) *'
                    : `Confirm Order (₹${finalAmount.toFixed(0)}) & Send to WhatsApp`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL TAX-INVOICE & ITEMIZED PRINT BILL MODAL */}
      {isReceiptOpen && lastOrder && (
        <OrderReceiptModal
          order={lastOrder}
          onClose={() => {
            clearCart();
            setIsReceiptOpen(false);
          }}
        />
      )}
    </>
  );
}

// --- MAIN PUBLIC STORE CONTAINER ---
export default function PublicStore() {
  const {
    currentView,
    setActivePackageModalProduct
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (title, desc) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#f9fbf9] flex flex-col justify-between font-sans">
      
      {/* 1. DESKTOP / TABLET FRESH VIEW (Matching Image 1) */}
      <div className="hidden md:block">
        {/* Top Green Notice Bar */}
        <TopAnnouncementBar
          onOpenTrackOrder={() => setTrackOrderOpen(true)}
          onOpenHelp={() => window.open(`https://wa.me/91${SHOP_WHATSAPP_NUMBER}`, '_blank')}
        />

        {/* Clean FreshCart Navbar */}
        <FreshNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Horizontal Category Nav Strip */}
        <CategoryNavStrip
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onOpenOffers={() => window.scrollTo({ top: 850, behavior: 'smooth' })}
        />

        {/* Hero Banner Section */}
        <FreshHeroBanner
          onShopClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
        />

        {/* Shop by Category Section (Circular Cards Slider) */}
        <ShopByCategory
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Products Catalog (Top 10 + Show More) - Placed directly below ShopByCategory & above Daily Deals */}
        <MainProductsCatalog
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          onInspectProduct={prod => setActivePackageModalProduct(prod)}
        />

        {/* Middle Promotional Banners (Season's Best & Healthy Choices) */}
        <MiddleBanners
          onSelectCategory={setSelectedCategory}
        />

        {/* Daily Deals Section with Live Countdown Timer */}
        <DailyDeals
          onInspectProduct={prod => setActivePackageModalProduct(prod)}
        />

        {/* Dual Secondary Banners (Fresh Fruits & Premium Vegetables) */}
        <DualOfferBanners
          onSelectCategory={setSelectedCategory}
        />

        {/* Split Section: Recommended for You (Smart Jodi) + Best Sellers Ranked List */}
        <RecommendedAndBestSellers
          onInspectProduct={prod => setActivePackageModalProduct(prod)}
        />

        {/* 4 Trust Badges */}
        <TrustBadges />

        {/* Deep Green Footer */}
        <FreshFooter
          onOpenTrackOrder={() => setTrackOrderOpen(true)}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* 2. MOBILE APP VIEW (Matching Image 2) */}
      <div className="md:hidden">
        <MobileStoreView
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onInspectProduct={prod => setActivePackageModalProduct(prod)}
          onOpenTrackOrder={() => setTrackOrderOpen(true)}
        />
      </div>

      {/* Floating Animated Daily Deals Corner Widget */}
      <FloatingDailyDealsBadge />

      {/* 3. CORE MODALS & DIALOGS */}
      <PackageSelectionModal />
      <CartAndCheckoutModals />
      <TrackOrderModal
        isOpen={trackOrderOpen}
        onClose={() => setTrackOrderOpen(false)}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-2.5 text-xs font-bold"
          >
            <span className="text-emerald-400">✓</span>
            <div>
              <p className="font-black">{toastMsg.title}</p>
              {toastMsg.desc && <p className="text-[11px] text-slate-300 font-normal">{toastMsg.desc}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
