import React, { useState } from 'react';
import { useStore, STORE_ADDRESS_TEXT, SHOP_WHATSAPP_NUMBER, SHOP_WHATSAPP_INTL } from '../../StoreContext';
import GlassButton from '../components/GlassButton';
import { Palette, ShieldCheck, FileText, Globe, Boxes, Check, Plus, Trash2 } from '../../components/Icons';

export default function StoreSettingsTab({ activeSubView = 'logo-management', onToast }) {
  const {
    storeSettings,
    updateStoreSettings
  } = useStore();

  // Store Open / Closed State
  const [closureMsg, setClosureMsg] = useState(
    storeSettings.closureMessage || "Aaj Hamari Dukaan Band Hai. Kripya thodi der baad ya kal subah dobara padharein. Dhanyawad!"
  );

  // About Content State
  const [aboutTitle, setAboutTitle] = useState(storeSettings.aboutContent?.title || "Welcome to Ankush General Store");
  const [aboutSubtitle, setAboutSubtitle] = useState(storeSettings.aboutContent?.subtitle || "Khorma, Pratappur, District Surajpur ka sabse bharosemand online grocery store.");
  const [aboutDesc, setAboutDesc] = useState(storeSettings.aboutContent?.description || "");
  const [aboutTimings, setAboutTimings] = useState(storeSettings.aboutContent?.storeTimings || "Subah 7:00 AM se Raat 9:30 PM tak (Rozana)");

  // Brand Logo Studio State
  const [logoInputUrl, setLogoInputUrl] = useState(storeSettings.logoUrl || '');

  // Store Address & Live Map State
  const [storeAddressInput, setStoreAddressInput] = useState(storeSettings.storeAddress || STORE_ADDRESS_TEXT);
  const [mapLocationUrlInput, setMapLocationUrlInput] = useState(storeSettings.mapLocationUrl || 'https://www.google.com/maps/search/?api=1&query=23.4865,83.2085');

  // 3D Carousel Studio State
  const [carouselList, setCarouselList] = useState(storeSettings.carouselImages || []);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideTag, setNewSlideTag] = useState('');

  // 1. Brand Logo Studio
  if (activeSubView === 'logo-management') {
    return (
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            <span>Multi-Logo & Brand Identity Studio</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Configure header store logo, favicon and brand watermark for Ankush General Store
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-dashed border-violet-400/40 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            {logoInputUrl ? (
              <img src={logoInputUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🏪</span>
            )}
          </div>
          <div className="flex-1 w-full space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase">Store Logo / Brand Icon</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0E1E] border border-white/12 hover:border-violet-400 rounded-xl cursor-pointer text-xs text-violet-300 font-bold transition-all shadow-inner">
                <span>📁 Upload Logo Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        setLogoInputUrl(re.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => {
                  updateStoreSettings({ logoUrl: logoInputUrl.trim() });
                  if (onToast) onToast('Logo Updated', 'Brand logo saved across store headers.');
                }}
              >
                Save Logo
              </GlassButton>
              {logoInputUrl && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLogoInputUrl('');
                    updateStoreSettings({ logoUrl: '' });
                  }}
                >
                  Reset to Default Icon
                </GlassButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Store Open / Closed Switch
  if (activeSubView === 'store-status') {
    return (
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Store Operational Status (Open / Closed Toggle)</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Turn store ordering on/off in real-time and display a custom closure banner to customers
          </p>
        </div>

        <div className={`p-6 rounded-2xl border transition-all ${
          storeSettings.isStoreOpen
            ? 'bg-emerald-500/10 border-emerald-400/30'
            : 'bg-rose-500/10 border-rose-400/30'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                storeSettings.isStoreOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {storeSettings.isStoreOpen ? '🟢 STORE IS CURRENTLY OPEN & ACCEPTING ORDERS' : '🔴 STORE IS CURRENTLY CLOSED'}
              </span>
              <p className="text-xs text-slate-300 mt-2">
                {storeSettings.isStoreOpen
                  ? 'Grahak website par saman cart me add karke seedhe checkout kar sakte hain.'
                  : 'Customer ko homepage par Dukaan Band hone ka notice dikhega aur cart order disabled rahega.'}
              </p>
            </div>

            <button
              onClick={() => {
                const nextState = !storeSettings.isStoreOpen;
                updateStoreSettings({ isStoreOpen: nextState });
                if (onToast) onToast('Store Status Changed', nextState ? 'Dukaan ab OPEN hai.' : 'Dukaan ab CLOSED hai.');
              }}
              className={`px-6 py-3 rounded-2xl font-black text-xs cursor-pointer transition-all shadow-lg ${
                storeSettings.isStoreOpen
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              }`}
            >
              {storeSettings.isStoreOpen ? '🛑 Turn OFF (Dukaan Band Karein)' : '🚀 Turn ON (Dukaan Kholein)'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase">
            Custom Message When Store is Closed
          </label>
          <textarea
            rows={3}
            value={closureMsg}
            onChange={e => setClosureMsg(e.target.value)}
            className="w-full p-4 bg-[#0A0E1E] border border-white/12 rounded-2xl text-xs sm:text-sm text-white"
            placeholder="Kripya kal subah 7 baje dobara aayen..."
          />
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => {
              updateStoreSettings({ closureMessage: closureMsg.trim() });
              if (onToast) onToast('Closure Message Saved', 'Message updated on storefront.');
            }}
          >
            Save Closure Message
          </GlassButton>
        </div>
      </div>
    );
  }

  // 3. About Page Content Editor
  if (activeSubView === 'about-content') {
    return (
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Dedicated About Page Content Editor</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Update store background story, delivery guarantees & owner note on the public About page
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Headline Title</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={e => setAboutTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0E1E] border border-white/12 rounded-2xl text-xs sm:text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Subtitle</label>
            <input
              type="text"
              value={aboutSubtitle}
              onChange={e => setAboutSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0E1E] border border-white/12 rounded-2xl text-xs sm:text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Store Description Story</label>
            <textarea
              rows={4}
              value={aboutDesc}
              onChange={e => setAboutDesc(e.target.value)}
              className="w-full p-4 bg-[#0A0E1E] border border-white/12 rounded-2xl text-xs sm:text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Store Operational Timings</label>
            <input
              type="text"
              value={aboutTimings}
              onChange={e => setAboutTimings(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0E1E] border border-white/12 rounded-2xl text-xs sm:text-sm text-white"
            />
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={() => {
              updateStoreSettings({
                aboutContent: {
                  ...storeSettings.aboutContent,
                  title: aboutTitle.trim(),
                  subtitle: aboutSubtitle.trim(),
                  description: aboutDesc.trim(),
                  storeTimings: aboutTimings.trim()
                }
              });
              if (onToast) onToast('About Content Saved', 'Updated live on About storefront.');
            }}
          >
            Save About Content
          </GlassButton>
        </div>
      </div>
    );
  }

  // 4. Social & Contact Settings
  if (activeSubView === 'social-media') {
    return (
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>Store Contact, Location & WhatsApp Helpline Settings</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Manage your store address and Google Maps location opened when customers tap the map pin in the header.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">📍 Store Physical Address</label>
              <input
                type="text"
                value={storeAddressInput}
                onChange={e => setStoreAddressInput(e.target.value)}
                placeholder="Khorma, Pratappur, District Surajpur"
                className="w-full px-3.5 py-2.5 bg-[#0A0E1E] border border-white/12 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">🗺️ Live Google Maps Location URL</label>
              <input
                type="text"
                value={mapLocationUrlInput}
                onChange={e => setMapLocationUrlInput(e.target.value)}
                placeholder="https://www.google.com/maps/search/?api=1&query=23.4865,83.2085"
                className="w-full px-3.5 py-2.5 bg-[#0A0E1E] border border-white/12 rounded-xl text-white text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Grahak jab header me Location pin dabayenge, seedhe Google Maps me aapki dukaan ka live location khulega.
              </p>
            </div>

            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => {
                updateStoreSettings({
                  storeAddress: storeAddressInput.trim(),
                  mapLocationUrl: mapLocationUrlInput.trim()
                });
                if (onToast) onToast('Location Saved', 'Store address and map link updated live on website.');
              }}
            >
              Save Location & Map Link
            </GlassButton>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
            <p className="text-slate-300"><b>Primary WhatsApp Helpline:</b> +{SHOP_WHATSAPP_INTL}</p>
            <p className="text-slate-300"><b>Direct Phone Calling:</b> {SHOP_WHATSAPP_NUMBER}</p>
            <p className="text-slate-300"><b>UPI Merchant VPA:</b> 8817425506@axl</p>
          </div>
          <p className="text-xs text-[#A5B4CC]">
            Ye saare contacts aapki poori website (Header, Footer, WhatsApp Direct Checkout aur PDF Bills) par verified connect hain.
          </p>
        </div>
      </div>
    );
  }

  // 5. 3D Carousel Studio
  return (
    <div className="liquid-glass-panel rounded-[28px] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-violet-400" />
            <span>3D Hero Carousel Studio</span>
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5">
            Manage top sliding visual banners on the customer storefront
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <h4 className="text-xs font-bold text-violet-300 uppercase">Add Slide to Hero Carousel</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Slide Image URL (Unsplash or image link)"
            value={newSlideUrl}
            onChange={e => setNewSlideUrl(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
          />
          <input
            type="text"
            placeholder="Slide Badge Tag (e.g. 🚚 Free Delivery Zone)"
            value={newSlideTag}
            onChange={e => setNewSlideTag(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
          />
          <input
            type="text"
            placeholder="Slide Headline"
            value={newSlideTitle}
            onChange={e => setNewSlideTitle(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
          />
          <input
            type="text"
            placeholder="Slide Subtitle"
            value={newSlideSubtitle}
            onChange={e => setNewSlideSubtitle(e.target.value)}
            className="px-3.5 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
          />
        </div>
        <button
          onClick={() => {
            if (!newSlideUrl.trim()) return;
            const updated = [
              ...carouselList,
              {
                id: `slide-${Date.now()}`,
                url: newSlideUrl.trim(),
                title: newSlideTitle.trim() || 'Ankush Superstore',
                subtitle: newSlideSubtitle.trim(),
                tag: newSlideTag.trim() || 'Special',
                order: carouselList.length + 1,
                isActive: true
              }
            ];
            setCarouselList(updated);
            updateStoreSettings({ carouselImages: updated });
            setNewSlideUrl('');
            setNewSlideTitle('');
            setNewSlideSubtitle('');
            setNewSlideTag('');
            if (onToast) onToast('Slide Added', 'New slide active in hero carousel.');
          }}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          + Add Slide to Carousel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {carouselList.map((slide, idx) => (
          <div key={slide.id || idx} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden space-y-2">
            <div className="h-32 bg-slate-900 relative">
              <img src={slide.url} alt="Slide" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  const updated = carouselList.filter((_, i) => i !== idx);
                  setCarouselList(updated);
                  updateStoreSettings({ carouselImages: updated });
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-rose-300 hover:text-white cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3">
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold">
                {slide.tag}
              </span>
              <h5 className="text-xs font-bold text-white mt-1">{slide.title}</h5>
              <p className="text-[11px] text-[#A5B4CC] truncate">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
