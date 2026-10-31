import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './StoreContext';
import Footer from './Footer';
import OrderReceiptModal from './components/OrderReceiptModal';
import GlassButton from './admin/components/GlassButton';

// Modular Admin Tabs
import OverviewTab from './admin/tabs/OverviewTab';
import AnalyticsHubTab from './admin/tabs/AnalyticsHubTab';
import OrdersTab from './admin/tabs/OrdersTab';
import ProductsTab from './admin/tabs/ProductsTab';
import DiscountPanelTab from './admin/tabs/DiscountPanelTab';
import BannerOffersTab from './admin/tabs/BannerOffersTab';
import CustomersTab from './admin/tabs/CustomersTab';
import StoreSettingsTab from './admin/tabs/StoreSettingsTab';

// Shared Icons
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  CheckCircle2,
  Package,
  Sparkles,
  Layers,
  Users,
  Palette,
  FileText,
  Globe,
  ShieldCheck,
  Boxes,
  Search,
  Menu,
  X
} from './components/Icons';

// Exact Dashboard Themes matching User's Analytics Design System
export const DASHBOARD_THEMES = [
  {
    id: 'neon',
    name: 'Neon Night',
    sw: ['#ff2e93', '#00e5ff', '#b6ff3b'],
    bg: '#0b0720',
    bg2: '#2a0f5c',
    bg3: '#003a52',
    card: 'rgba(24, 16, 58, 0.74)',
    text: '#f6f2ff',
    muted: '#a9a1d0',
    c1: '#ff2e93',
    c2: '#00e5ff',
    c3: '#b6ff3b',
    c4: '#ffd400',
    c5: '#8a5cff',
    c6: '#ff7a00'
  },
  {
    id: 'sunset',
    name: 'Sunset Reel',
    sw: ['#ff5e62', '#ff9966', '#ffd166'],
    bg: '#1b0828',
    bg2: '#5a1450',
    bg3: '#7a2a1a',
    card: 'rgba(52, 16, 54, 0.72)',
    text: '#fff3ee',
    muted: '#e0b4c4',
    c1: '#ff5e62',
    c2: '#ff9966',
    c3: '#ffd166',
    c4: '#f72585',
    c5: '#b5179e',
    c6: '#4cc9f0'
  },
  {
    id: 'mint',
    name: 'Mint Glass',
    sw: ['#2cffc6', '#00c2ff', '#f9f871'],
    bg: '#031f20',
    bg2: '#06504b',
    bg3: '#0a3a66',
    card: 'rgba(8, 48, 50, 0.68)',
    text: '#eafff8',
    muted: '#8fd0c2',
    c1: '#2cffc6',
    c2: '#00c2ff',
    c3: '#7cf5a5',
    c4: '#f9f871',
    c5: '#ff8fab',
    c6: '#a0c4ff'
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    sw: ['#f5c26b', '#e8833d', '#8ecae6'],
    bg: '#0d1017',
    bg2: '#2b2310',
    bg3: '#102a3a',
    card: 'rgba(26, 28, 36, 0.80)',
    text: '#fff8e8',
    muted: '#b9b09a',
    c1: '#f5c26b',
    c2: '#e8833d',
    c3: '#8ecae6',
    c4: '#cdb4db',
    c5: '#ffafcc',
    c6: '#b7e4c7'
  },
  {
    id: 'candy',
    name: 'Candy Pop',
    sw: ['#ff3d8b', '#6c5ce7', '#00b894'],
    bg: '#190d24',
    bg2: '#42163b',
    bg3: '#261c4a',
    card: 'rgba(38, 20, 52, 0.78)',
    text: '#fdf4ff',
    muted: '#d8b4fe',
    c1: '#ff3d8b',
    c2: '#6c5ce7',
    c3: '#00b894',
    c4: '#f9a825',
    c5: '#0984e3',
    c6: '#e17055'
  },
  {
    id: 'pro',
    name: 'Clean Pro',
    sw: ['#2563eb', '#0ea5a4', '#f59e0b'],
    bg: '#091326',
    bg2: '#132a52',
    bg3: '#0d3330',
    card: 'rgba(17, 30, 56, 0.78)',
    text: '#f1f5f9',
    muted: '#94a3b8',
    c1: '#3b82f6',
    c2: '#14b8a6',
    c3: '#f59e0b',
    c4: '#8b5cf6',
    c5: '#ec4899',
    c6: '#64748b'
  },
  {
    id: 'aether',
    name: 'Aether Liquid Glass',
    sw: ['#8B5CF6', '#67E8F9', '#34D399'],
    bg: '#080B16',
    bg2: '#1E1B4B',
    bg3: '#083344',
    card: 'rgba(20, 27, 52, 0.72)',
    text: '#F8FAFC',
    muted: '#A5B4CC',
    c1: '#8B5CF6',
    c2: '#67E8F9',
    c3: '#34D399',
    c4: '#C4B5FD',
    c5: '#FBBF24',
    c6: '#FB7185'
  }
];

export default function AdminDashboard() {
  const {
    setCurrentView,
    setIsAdminAuth,
    storeSettings,
    products,
    customers,
    orders,
    getPendingOrders
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Theme Management
  const [dashboardTheme, setDashboardTheme] = useState(() => localStorage.getItem('ankushAdminTheme') || 'neon');

  // Modals & Popovers
  const [commandOpen, setCommandOpen] = useState(false);
  const [designSystemOpen, setDesignSystemOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const pendingOrders = useMemo(() => getPendingOrders(), [orders]);

  const activeThemeObj = useMemo(
    () => DASHBOARD_THEMES.find(t => t.id === dashboardTheme) || DASHBOARD_THEMES[0],
    [dashboardTheme]
  );

  // Set document body data-theme and background whenever theme changes
  useEffect(() => {
    document.body.dataset.theme = dashboardTheme;
    document.body.style.backgroundColor = activeThemeObj.bg;
    return () => {
      document.body.dataset.theme = '';
      document.body.style.backgroundColor = '';
    };
  }, [dashboardTheme, activeThemeObj.bg]);

  const handleApplyTheme = (themeId) => {
    setDashboardTheme(themeId);
    localStorage.setItem('ankushAdminTheme', themeId);
    localStorage.setItem('ankushTheme', themeId);
    document.body.dataset.theme = themeId;
    const found = DASHBOARD_THEMES.find(t => t.id === themeId) || DASHBOARD_THEMES[0];
    document.body.style.backgroundColor = found.bg;
    triggerToast('Theme Updated', `Switched to ${themeId.toUpperCase()} Liquid Glass.`);
  };

  const triggerToast = (title, subtitle = 'Store telemetry updated live.') => {
    setToastMessage({ title, subtitle });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Keyboard shortcut Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setDesignSystemOpen(false);
        setInspectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogoutAdmin = () => {
    localStorage.removeItem('ankush_admin_auth');
    setIsAdminAuth(false);
    setCurrentView('home');
  };

  // 13 Navigation Items
  const NAVIGATION_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'analytics-hub', label: 'Analytics Hub', icon: BarChart3, badge: 'Live' },
    { id: 'pending', label: 'Pending Orders', icon: ShoppingCart, badge: pendingOrders.length > 0 ? String(pendingOrders.length) : null },
    { id: 'delivered', label: 'Delivered Orders', icon: CheckCircle2, badge: null },
    { id: 'add-product', label: 'Products & Packs', icon: Package, badge: String(products.length) },
    { id: 'discount-panel', label: 'Discount Panel', icon: Sparkles, badge: null },
    { id: 'offers', label: 'Banners & Categories', icon: Layers, badge: 'Design' },
    { id: 'customers', label: 'VIP Customers', icon: Users, badge: String(customers.length) },
    { id: 'logo-management', label: 'Brand & Logo Studio', icon: Palette, badge: null },
    { id: 'about-content', label: 'About Content', icon: FileText, badge: null },
    { id: 'social-media', label: 'Social & Contact', icon: Globe, badge: null },
    { id: 'store-status', label: 'Store Open / Closed', icon: ShieldCheck, badge: storeSettings.isStoreOpen ? 'ON' : 'OFF' }
  ];

  return (
    <div
      data-theme={dashboardTheme}
      style={{
        backgroundColor: activeThemeObj.bg,
        color: activeThemeObj.text,
        '--bg': activeThemeObj.bg,
        '--bg2': activeThemeObj.bg2,
        '--bg3': activeThemeObj.bg3,
        '--card': activeThemeObj.card,
        '--text': activeThemeObj.text,
        '--muted': activeThemeObj.muted,
        '--c1': activeThemeObj.c1,
        '--c2': activeThemeObj.c2,
        '--c3': activeThemeObj.c3,
        '--c4': activeThemeObj.c4,
        '--c5': activeThemeObj.c5,
        '--c6': activeThemeObj.c6,
      }}
      className="min-h-screen relative overflow-x-hidden transition-colors duration-500 font-sans"
    >
      {/* Dynamic Radial Gradient Mesh Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(900px 500px at 10% -10%, var(--bg2) 0%, transparent 70%),
                       radial-gradient(800px 500px at 100% 5%, var(--bg3) 0%, transparent 70%),
                       var(--bg)`
        }}
      />

      {/* Ambient Pulsing Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-25 animate-pulse"
          style={{ background: activeThemeObj.c1 }}
        />
        <div
          className="absolute top-[40%] -right-[15%] w-[45vw] h-[45vw] rounded-full blur-[160px] opacity-20"
          style={{ background: activeThemeObj.c2 }}
        />
      </div>

      {/* =====================================================================
          SIDEBAR NAVIGATION (Desktop & Drawer)
      ===================================================================== */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-500 hidden lg:flex flex-col justify-between p-4 ${
          sidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div
          style={{ backgroundColor: activeThemeObj.card }}
          className="rounded-3xl p-4 h-full flex flex-col justify-between overflow-hidden border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          {/* Brand Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-3 cursor-pointer group overflow-hidden"
              >
                <div
                  style={{ background: `linear-gradient(135deg, ${activeThemeObj.c1}, ${activeThemeObj.c2})` }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform"
                >
                  🏪
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white truncate">Ankush Store</h2>
                    <p className="text-[10px] font-bold text-cyan-300 truncate">Admin Portal</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            </div>

            {/* Nav Items List */}
            <nav className="mt-4 space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'text-white shadow-lg border border-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                    style={isActive ? {
                      background: `linear-gradient(90deg, ${activeThemeObj.c1}, ${activeThemeObj.c2})`,
                      boxShadow: `0 4px 14px color-mix(in srgb, ${activeThemeObj.c1} 45%, transparent)`
                    } : {}}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.id === 'pending'
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Controls */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => setCurrentView('home')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>🏠</span>
                <span>Open Storefront</span>
              </button>
            )}
            <button
              onClick={handleLogoutAdmin}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>🚪</span>
              {!sidebarCollapsed && <span>Logout Admin</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MOBILE SIDEBAR DRAWER (Sliding Navigation matching Portal Design)
      ===================================================================== */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Dark Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Slide-out Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[300px] max-w-[85vw] p-3 sm:p-4 flex flex-col lg:hidden"
            >
              <div
                style={{ backgroundColor: activeThemeObj.card }}
                className="rounded-3xl p-4 h-full flex flex-col justify-between overflow-hidden border border-white/10 backdrop-blur-2xl shadow-2xl"
              >
                {/* Brand Header with Close ✕ Button */}
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div
                      onClick={() => {
                        setActiveTab('dashboard');
                        setMobileDrawerOpen(false);
                      }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        style={{ background: `linear-gradient(135deg, ${activeThemeObj.c1}, ${activeThemeObj.c2})` }}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg"
                      >
                        🏪
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-black text-white truncate">Ankush Store</h2>
                        <p className="text-[10px] font-bold text-cyan-300 truncate">Admin Portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close Sidebar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Nav Items List */}
                  <nav className="mt-4 space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    {NAVIGATION_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileDrawerOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'text-white shadow-lg border border-white/20'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                          style={isActive ? {
                            background: `linear-gradient(90deg, ${activeThemeObj.c1}, ${activeThemeObj.c2})`,
                            boxShadow: `0 4px 14px color-mix(in srgb, ${activeThemeObj.c1} 45%, transparent)`
                          } : {}}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.id === 'pending'
                                ? 'bg-amber-400 text-amber-950 font-black'
                                : 'bg-white/10 text-slate-300'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Controls */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>🏠</span>
                    <span>Open Storefront</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      handleLogoutAdmin();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Logout Admin</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MAIN CONTENT AREA
      ===================================================================== */}
      <div className={`relative z-10 transition-all duration-500 ${sidebarCollapsed ? 'lg:pl-28' : 'lg:pl-80'} p-4 sm:p-6 lg:p-8`}>
        {/* Top Header Bar */}
        <header
          style={{ backgroundColor: activeThemeObj.card }}
          className="rounded-3xl p-4 mb-6 flex items-center justify-between gap-4 border border-white/10 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-[11px] text-cyan-300 hidden sm:block">
                Khorma, Pratappur • Real-Time Synchronization Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Studio Button */}
            <GlassButton
              variant="secondary"
              size="sm"
              icon={Palette}
              title="Change Dashboard Colors"
              onClick={() => setDesignSystemOpen(true)}
            >
              Theme Studio
            </GlassButton>

            {/* Storefront Link */}
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setCurrentView('home')}
            >
              Store Home
            </GlassButton>
          </div>
        </header>

        {/* ===================================================================
            DYNAMIC TAB CONTENT
        =================================================================== */}
        <main className="space-y-6">
          {activeTab === 'dashboard' && (
            <OverviewTab
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onInspectOrder={(ord) => setInspectedOrder(ord)}
              onToast={triggerToast}
              activeChartColors={[activeThemeObj.c1, activeThemeObj.c2, activeThemeObj.c3, activeThemeObj.c4, activeThemeObj.c5, activeThemeObj.c6]}
            />
          )}

          {activeTab === 'analytics-hub' && (
            <AnalyticsHubTab
              onOpenDesignSystem={() => setDesignSystemOpen(true)}
              onToast={triggerToast}
            />
          )}

          {(activeTab === 'pending' || activeTab === 'delivered') && (
            <OrdersTab
              mode={activeTab}
              onInspectOrder={(ord) => setInspectedOrder(ord)}
              onToast={triggerToast}
            />
          )}

          {activeTab === 'add-product' && (
            <ProductsTab onToast={triggerToast} />
          )}

          {activeTab === 'discount-panel' && (
            <DiscountPanelTab onToast={triggerToast} />
          )}

          {activeTab === 'offers' && (
            <BannerOffersTab onToast={triggerToast} />
          )}

          {activeTab === 'customers' && (
            <CustomersTab onToast={triggerToast} />
          )}

          {(activeTab === 'logo-management' ||
            activeTab === 'store-status' ||
            activeTab === 'about-content' ||
            activeTab === 'social-media') && (
            <StoreSettingsTab activeSubView={activeTab} onToast={triggerToast} />
          )}
        </main>

        {/* Footer */}
        <div className="mt-12">
          <Footer />
        </div>
      </div>

      {/* =====================================================================
          GLOBAL MODALS (Bill Inspector, Design System, Toast)
      ===================================================================== */}

      {/* 1. Unified Tax Invoice / Bill Inspector Modal */}
      {inspectedOrder && (
        <OrderReceiptModal
          order={inspectedOrder}
          onClose={() => setInspectedOrder(null)}
        />
      )}

      {/* 2. Liquid Glass Theme Customizer Modal */}
      {designSystemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
            <button
              onClick={() => setDesignSystemOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-400" />
              <span>Theme Studio & Color Surface</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select one of the 7 predefined glass aesthetics for your admin portal:
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {DASHBOARD_THEMES.map(th => (
                <div
                  key={th.id}
                  onClick={() => handleApplyTheme(th.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    dashboardTheme === th.id
                      ? 'border-violet-400 ring-2 ring-violet-500/40 bg-white/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex gap-1.5 mb-2">
                    {th.sw.map((color, idx) => (
                      <span key={idx} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-white">{th.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-violet-400/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-black text-white">{toastMessage.title}</p>
              <p className="text-[11px] text-slate-400">{toastMessage.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
