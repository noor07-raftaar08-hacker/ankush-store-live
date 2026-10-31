import React, { useState, useRef } from 'react';
import { useStore } from '../../StoreContext';
import { Layers, Plus, Trash2, Image, Search, MapPin } from '../../components/Icons';

export default function BannerOffersTab({ onToast }) {
  const {
    storeCategories,
    addStoreCategory,
    deleteStoreCategory,
    toggleStoreCategory,
    storeBanners,
    updateStoreBanner,
    toggleStoreBanner,
    products,
    dailyDealsConfig,
    updateDailyDealsConfig,
    toggleDailyDealProduct,
    updateDailyDealDiscount,
    storeSettings,
    updateStoreSettings
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState('categories'); // 'categories' | 'banners' | 'deals' | 'location'

  // Add Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCount, setNewCatCount] = useState('20+ Items');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Daily Deals Manager Filter
  const [dealSearch, setDealSearch] = useState('');
  const [dealTimerHours, setDealTimerHours] = useState(dailyDealsConfig?.hours || 12);
  const [dealTimerMinutes, setDealTimerMinutes] = useState(dailyDealsConfig?.minutes || 30);

  // Store Maps Location State
  const [mapUrlInput, setMapUrlInput] = useState(
    storeSettings?.mapLocationUrl || 'https://www.google.com/maps/search/?api=1&query=23.4865,83.2085'
  );
  const [storeAddressInput, setStoreAddressInput] = useState(
    storeSettings?.storeAddress || 'Khorma, Pratappur, District Surajpur'
  );

  // File Upload Helper
  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) callback(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const img = newCatImageUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

    addStoreCategory({
      name: newCatName.trim(),
      slug: newCatName.trim(),
      itemCount: newCatCount.trim(),
      imageUrl: img
    });

    setNewCatName('');
    setNewCatCount('20+ Items');
    setNewCatImageUrl('');
    if (onToast) onToast('Category Added!', `"${newCatName}" is now active in Shop by Category.`);
  };

  const handleSaveTimer = () => {
    const h = Number(dealTimerHours) || 12;
    const m = Number(dealTimerMinutes) || 0;
    const target = Date.now() + ((h * 3600) + (m * 60)) * 1000;
    if (typeof window !== 'undefined') localStorage.setItem('ankush_deals_target_end', String(target));
    updateDailyDealsConfig({
      hours: h,
      minutes: m,
      targetEndTime: target
    });
    if (onToast) onToast('Deal Clock Saved', `Daily deal countdown updated to ${h}h ${m}m.`);
  };

  const handleSaveLocation = () => {
    updateStoreSettings({
      mapLocationUrl: mapUrlInput.trim(),
      storeAddress: storeAddressInput.trim()
    });
    if (onToast) onToast('Map Location Saved', 'Google Maps link for Ankush Store is updated.');
  };

  const banners = storeBanners || {};

  return (
    <div className="space-y-6 text-white font-sans">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Storefront Banners, Deals & Category Studio</span>
            </h2>
            <p className="text-xs text-[#A5B4CC] mt-0.5">
              Control category slider, promotional image banners, countdown deals, and store map location.
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex flex-wrap bg-[#0A0E1E] p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'categories' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#A5B4CC] hover:text-white'
              }`}
            >
              🏷️ Categories ({storeCategories.length})
            </button>
            <button
              onClick={() => setActiveSubTab('banners')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'banners' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#A5B4CC] hover:text-white'
              }`}
            >
              🖼️ Promotional Banners (5)
            </button>
            <button
              onClick={() => setActiveSubTab('deals')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'deals' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#A5B4CC] hover:text-white'
              }`}
            >
              ⏰ Daily Deals Manager
            </button>
            <button
              onClick={() => setActiveSubTab('location')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'location' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#A5B4CC] hover:text-white'
              }`}
            >
              📍 Store Location & Map
            </button>
          </div>
        </div>
      </div>

      {/* ================= 1. CATEGORIES MANAGEMENT ================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Card */}
          <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add New Category Icon</span>
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B4CC] mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dry Fruits & Nuts"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B4CC] mb-1">Item Count Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. 15+ Fresh Items"
                    value={newCatCount}
                    onChange={e => setNewCatCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B4CC] mb-1">Select PNG Icon / Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={e => handleImageFileUpload(e, setNewCatImageUrl)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-inner"
                    >
                      📁 Upload Category Image File
                    </button>
                    {newCatImageUrl && (
                      <button
                        type="button"
                        onClick={() => setNewCatImageUrl('')}
                        className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {newCatImageUrl && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-14 h-14 rounded-full bg-white p-2 flex items-center justify-center shadow">
                    <img src={newCatImageUrl} alt="Preview" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Preview on Storefront Circle:</span>
                    <p className="text-[11px] text-emerald-300">Clean white circular backdrop with smooth hover effect.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Category</span>
              </button>
            </form>
          </div>

          {/* Existing Categories */}
          <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Existing Categories ({storeCategories.length})</h3>
            <p className="text-xs text-[#A5B4CC]">
              Categories scroll smoothly horizontally in the "Shop by Category" strip.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storeCategories.map(cat => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    cat.isActive !== false ? 'bg-white/[0.04] border-white/10' : 'bg-black/30 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white p-1.5 flex items-center justify-center shadow shrink-0">
                      <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400">{cat.itemCount || 'Items'}</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                        cat.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {cat.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
                    <button
                      onClick={() => toggleStoreCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                        cat.isActive !== false ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {cat.isActive !== false ? 'Turn OFF' : 'Turn ON'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Category "${cat.name}" ko delete karein?`)) deleteStoreCategory(cat.id);
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. PROMOTIONAL BANNERS ================= */}
      {activeSubTab === 'banners' && (
        <div className="space-y-6">
          <BannerEditorCard
            title="1. Main Hero Banner"
            sectionName="Top Hero Card (Custom Graphic or Text Mode)"
            bannerData={banners.hero || {}}
            onUpdate={(fields) => updateStoreBanner('hero', fields)}
            onToggle={() => toggleStoreBanner('hero')}
            onToast={onToast}
            allowFullImage={true}
          />
          <BannerEditorCard
            title="2. Season's Best Fresh & Healthy"
            sectionName="Middle Row (Left Wide Card)"
            bannerData={banners.seasonalBest || {}}
            onUpdate={(fields) => updateStoreBanner('seasonalBest', fields)}
            onToggle={() => toggleStoreBanner('seasonalBest')}
            onToast={onToast}
            allowFullImage={true}
          />
          <BannerEditorCard
            title="3. Healthy Choices Happier Families"
            sectionName="Middle Row (Right Card)"
            bannerData={banners.healthyChoices || {}}
            onUpdate={(fields) => updateStoreBanner('healthyChoices', fields)}
            onToggle={() => toggleStoreBanner('healthyChoices')}
            onToast={onToast}
            allowFullImage={true}
          />
          <BannerEditorCard
            title="4. Fresh Fruits Offer Card"
            sectionName="Bottom Dual Row (Left Card)"
            bannerData={banners.freshFruits || banners.bottomFruits || {}}
            onUpdate={(fields) => updateStoreBanner('freshFruits', fields)}
            onToggle={() => toggleStoreBanner('freshFruits')}
            onToast={onToast}
            allowFullImage={true}
          />
          <BannerEditorCard
            title="5. Premium Vegetables Offer Card"
            sectionName="Bottom Dual Row (Right Card)"
            bannerData={banners.premiumVegetables || banners.bottomVeg || {}}
            onUpdate={(fields) => updateStoreBanner('premiumVegetables', fields)}
            onToggle={() => toggleStoreBanner('premiumVegetables')}
            onToast={onToast}
            allowFullImage={true}
          />
        </div>
      )}

      {/* ================= 3. DAILY DEALS MANAGER ================= */}
      {activeSubTab === 'deals' && (
        <div className="space-y-6">
          {/* Deal Timer Settings */}
          <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>⏰ Daily Deals Countdown Clock Setting</span>
            </h3>
            <p className="text-xs text-[#A5B4CC]">
              Landing page par clock live ulti ginti karti hai. Yahan se aap duration tay kar sakte hain.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Hours (Ghante)</label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={dealTimerHours}
                  onChange={e => setDealTimerHours(e.target.value)}
                  className="w-24 px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={dealTimerMinutes}
                  onChange={e => setDealTimerMinutes(e.target.value)}
                  className="w-24 px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div className="self-end">
                <button
                  type="button"
                  onClick={handleSaveTimer}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
                >
                  ✓ Save Deal Timer
                </button>
              </div>
            </div>
          </div>

          {/* Product Deal Selector */}
          <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Products for Daily Deal</h3>
                <p className="text-xs text-[#A5B4CC]">
                  Jis product ko Daily Deal me dalna ho uska switch ON karein aur Discount % set karein.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search product..."
                  value={dealSearch}
                  onChange={e => setDealSearch(e.target.value)}
                  className="px-3.5 py-1.5 pr-8 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto max-h-[460px] overflow-y-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0A0E1E] text-slate-400 uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Original Price</th>
                    <th className="p-3">Deal Status</th>
                    <th className="p-3">Discount %</th>
                    <th className="p-3">Final Deal Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products
                    .filter(p => !dealSearch || p.name.toLowerCase().includes(dealSearch.toLowerCase()))
                    .map(prod => {
                      const dealList = dailyDealsConfig?.productDeals || [];
                      const dealCfg = dealList.find(d => Number(d.productId) === Number(prod.id));
                      const isInDeal = Boolean(dealCfg);
                      const discountVal = dealCfg ? dealCfg.discountPercent : 20;
                      const discountedPrice = Math.round(prod.price * (1 - discountVal / 100));

                      return (
                        <tr key={prod.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span>{prod.image_url?.startsWith('http') ? '📦' : prod.image_url}</span>
                            <span className="truncate max-w-[180px]">{prod.name}</span>
                          </td>
                          <td className="p-3 text-slate-400">{prod.category}</td>
                          <td className="p-3 font-bold text-slate-300">₹{prod.price}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => {
                                toggleDailyDealProduct(prod.id, discountVal);
                                if (onToast) onToast('Deal Toggled', `Status updated for ${prod.name}`);
                              }}
                              className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                                isInDeal
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isInDeal ? '🔥 IN DEAL' : '+ Add to Deal'}
                            </button>
                          </td>
                          <td className="p-3">
                            {isInDeal ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="5"
                                  max="85"
                                  value={discountVal}
                                  onChange={e => {
                                    const val = Math.max(1, Math.min(90, Number(e.target.value) || 10));
                                    updateDailyDealDiscount(prod.id, val);
                                  }}
                                  className="w-16 px-2 py-1 bg-[#0A0E1E] border border-white/20 rounded-lg text-white font-bold text-center"
                                />
                                <span className="text-slate-400 font-bold">%</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-3 font-black text-emerald-400">
                            {isInDeal ? (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={prod.price}
                                  value={discountedPrice}
                                  onChange={e => {
                                    const customPrice = Math.max(1, Number(e.target.value) || 1);
                                    const calculatedPct = prod.price > 0
                                      ? Math.max(1, Math.min(90, Math.round(((prod.price - customPrice) / prod.price) * 100)))
                                      : 10;
                                    updateDailyDealDiscount(prod.id, calculatedPct);
                                  }}
                                  className="w-20 px-2 py-1 bg-[#0A0E1E] border border-emerald-500/40 rounded-lg text-emerald-300 font-bold text-center"
                                />
                              </div>
                            ) : (
                              `₹${prod.price}`
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. STORE LOCATION & MAPS ================= */}
      {activeSubTab === 'location' && (
        <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Store Google Maps Live Location URL</span>
          </h3>
          <p className="text-xs text-[#A5B4CC]">
            Jab customer header me "Live Store Map ↗" par click karega to seedha ye Google Maps link open hoga.
          </p>

          <div className="space-y-4 max-w-2xl pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store Google Maps URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://maps.google.com/?q=..."
                value={mapUrlInput}
                onChange={e => setMapUrlInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0E1E] border border-white/15 rounded-xl text-xs text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Current default is set to Ankush Store coordinates in Khorma, Surajpur.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store Address Text (Navbar & Footer)
              </label>
              <input
                type="text"
                value={storeAddressInput}
                onChange={e => setStoreAddressInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0E1E] border border-white/15 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveLocation}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
              >
                ✓ Save Location Settings
              </button>

              <a
                href={mapUrlInput}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <span>↗ Test Map Link</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Banner Editor Card with Full Image Mode Support
function BannerEditorCard({ title, sectionName, bannerData, onUpdate, onToggle, onToast, allowFullImage }) {
  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(bannerData.title || '');
  const [tempSubtitle, setTempSubtitle] = useState(bannerData.subtitle || '');
  const [tempBadge, setTempBadge] = useState(bannerData.discountBadge || bannerData.badgeText || '');
  const [tempBtnText, setTempBtnText] = useState(bannerData.buttonText || 'Shop More →');
  const [tempImg, setTempImg] = useState(bannerData.imageUrl || '');
  const [isFullImage, setIsFullImage] = useState(Boolean(bannerData.fullBannerImage));
  const fileRef = useRef(null);

  const handleSave = () => {
    onUpdate({
      title: tempTitle,
      subtitle: tempSubtitle,
      discountBadge: tempBadge,
      badgeText: tempBadge,
      buttonText: tempBtnText,
      imageUrl: tempImg,
      fullBannerImage: isFullImage,
      fullBannerImageUrl: tempImg
    });
    setEditing(false);
    if (onToast) onToast('Banner Updated', `${title} changes saved.`);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) {
        setTempImg(dataUrl);
        onUpdate({ imageUrl: dataUrl, fullBannerImageUrl: dataUrl });
        if (onToast) onToast('Image Uploaded', `New banner visual applied.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const isActive = bannerData.isActive !== false;

  return (
    <div className={`liquid-glass-panel rounded-[28px] p-6 border transition-all ${
      isActive ? 'border-white/10' : 'border-white/5 opacity-60'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
            {sectionName}
          </span>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onToggle();
              if (onToast) onToast('Banner Toggled', `${title} is now ${isActive ? 'OFF' : 'ON'}.`);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors shadow ${
              isActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isActive ? '✓ Banner is ON' : '✕ Banner is OFF'}
          </button>

          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
          >
            {editing ? 'Close' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-4">
        <div className="md:col-span-4 h-36 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group">
          <img
            src={tempImg || bannerData.imageUrl}
            alt={tempTitle || bannerData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-black cursor-pointer shadow"
            >
              📷 Change Image
            </button>
          </div>
        </div>

        <div className="md:col-span-8 space-y-2">
          {bannerData.discountBadge && (
            <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full inline-block">
              {bannerData.discountBadge}
            </span>
          )}
          <h4 className="text-lg font-black text-white">{bannerData.title}</h4>
          <p className="text-xs text-[#A5B4CC]">{bannerData.subtitle}</p>
          <p className="text-[11px] text-emerald-400 font-bold">Button: {bannerData.buttonText || 'Shop More →'}</p>
          {bannerData.fullBannerImage && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-block">
              Full Banner Graphic Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Inline Editing Form */}
      {editing && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 bg-black/30 p-4 rounded-2xl">
          {allowFullImage && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <input
                type="checkbox"
                id={`full-img-${title}`}
                checked={isFullImage}
                onChange={e => setIsFullImage(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor={`full-img-${title}`} className="text-xs font-bold text-white cursor-pointer">
                🖼️ Full Image Banner Mode (Show full uploaded banner graphic across the card)
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Headline Text</label>
              <input
                type="text"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Badge Tag</label>
              <input
                type="text"
                value={tempBadge}
                onChange={e => setTempBadge(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subtitle</label>
              <input
                type="text"
                value={tempSubtitle}
                onChange={e => setTempSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Button Text</label>
              <input
                type="text"
                value={tempBtnText}
                onChange={e => setTempBtnText(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Or Paste Image URL</label>
            <input
              type="url"
              value={tempImg}
              onChange={e => setTempImg(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
          >
            ✓ Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
