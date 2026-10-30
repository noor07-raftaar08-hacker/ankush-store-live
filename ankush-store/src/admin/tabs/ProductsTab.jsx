import React, { useState, useMemo } from 'react';
import { useStore, createDefaultPackagesForProduct } from '../../StoreContext';
import GlassButton from '../components/GlassButton';
import ProductThumbnail from '../../components/ProductThumbnail';
import { Package, Plus, Trash2, Edit3, Search } from '../../components/Icons';

export default function ProductsTab({ onToast }) {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    storeCategories
  } = useStore();

  const [editingProductId, setEditingProductId] = useState(null);
  const [adminProdSearch, setAdminProdSearch] = useState('');
  const [stockFilterMode, setStockFilterMode] = useState('ALL');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Groceries',
    price: '',
    unit: 'kg',
    stock_quantity: '100',
    stockStatus: 'Full Stock',
    image_url: '📦',
    packages: []
  });

  const [pkgNameInput, setPkgNameInput] = useState('');
  const [pkgWeightInput, setPkgWeightInput] = useState('');
  const [pkgPriceInput, setPkgPriceInput] = useState('');
  const [pkgStockInput, setPkgStockInput] = useState('Full Stock');
  const [editingPkgId, setEditingPkgId] = useState(null);

  // Inline Quick Edit State
  const [inlinePriceMap, setInlinePriceMap] = useState({});

  const handleSaveProductForm = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const basePrice = Number(newProduct.price) || 50;
    const resolvedPackages = (newProduct.packages && newProduct.packages.length > 0)
      ? newProduct.packages
      : createDefaultPackagesForProduct({ ...newProduct, price: basePrice });

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: basePrice,
        unit: newProduct.unit,
        stock_quantity: Number(newProduct.stock_quantity) || 100,
        stockStatus: newProduct.stockStatus,
        image_url: newProduct.image_url || '📦',
        packages: resolvedPackages
      });
      if (onToast) onToast('Product Updated', `${newProduct.name} saved successfully.`);
      setEditingProductId(null);
    } else {
      addProduct({
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: basePrice,
        unit: newProduct.unit,
        stock_quantity: Number(newProduct.stock_quantity) || 100,
        stockStatus: newProduct.stockStatus,
        image_url: newProduct.image_url || '📦',
        packages: resolvedPackages
      });
      if (onToast) onToast('Product Added', `${newProduct.name} added to inventory.`);
    }

    setNewProduct({
      name: '',
      category: 'Groceries',
      price: '',
      unit: 'kg',
      stock_quantity: '100',
      stockStatus: 'Full Stock',
      image_url: '📦',
      packages: []
    });
  };

  const startEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setNewProduct({
      name: prod.name,
      category: prod.category || 'Groceries',
      price: String(prod.price),
      unit: prod.unit || 'kg',
      stock_quantity: String(prod.stock_quantity || 100),
      stockStatus: prod.stockStatus || 'Full Stock',
      image_url: prod.image_url || '📦',
      packages: prod.packages || createDefaultPackagesForProduct(prod)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdatePackage = () => {
    if (!pkgWeightInput.trim() || !pkgPriceInput) return;
    const pkgs = [...(newProduct.packages || [])];
    if (editingPkgId) {
      const idx = pkgs.findIndex(p => p.packageId === editingPkgId);
      if (idx !== -1) {
        pkgs[idx] = {
          ...pkgs[idx],
          packageName: pkgNameInput.trim() || pkgWeightInput.trim(),
          weight: pkgWeightInput.trim(),
          price: Number(pkgPriceInput),
          stockStatus: pkgStockInput
        };
      }
      setEditingPkgId(null);
    } else {
      pkgs.push({
        packageId: `pkg-${Date.now()}`,
        packageName: pkgNameInput.trim() || `${pkgWeightInput.trim()} Pack`,
        weight: pkgWeightInput.trim(),
        price: Number(pkgPriceInput),
        stockStatus: pkgStockInput,
        isAvailable: true
      });
    }
    setNewProduct({ ...newProduct, packages: pkgs });
    setPkgNameInput('');
    setPkgWeightInput('');
    setPkgPriceInput('');
    setPkgStockInput('Full Stock');
  };

  const handleRemovePackage = (pkgId) => {
    setNewProduct({
      ...newProduct,
      packages: (newProduct.packages || []).filter(p => p.packageId !== pkgId)
    });
  };

  const handleQuickPriceSave = (productId) => {
    const newP = inlinePriceMap[productId];
    if (newP !== undefined && newP !== '') {
      updateProduct(productId, { price: Number(newP) });
      if (onToast) onToast('Price Updated', `Quick price set to ₹${newP}.`);
      setInlinePriceMap(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !adminProdSearch ||
        p.name.toLowerCase().includes(adminProdSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(adminProdSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (stockFilterMode === 'LOW') return p.stockStatus === 'Few Available' || p.stockStatus === 'Out of Stock';
      if (stockFilterMode === 'FAST') return (p.soldCount || 0) > 30;
      if (stockFilterMode === 'SLOW') return (p.soldCount || 0) <= 30;
      return true;
    });
  }, [products, adminProdSearch, stockFilterMode]);

  return (
    <div className="space-y-6">
      {/* Add / Edit Product Form Panel */}
      <div className="liquid-glass-panel rounded-[28px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-violet-400" />
            <span>{editingProductId ? '✏️ Edit Product & Custom Packages' : '➕ Add New Product & Dynamic Packages'}</span>
          </h2>
          {editingProductId && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingProductId(null);
                setNewProduct({ name: '', category: 'Groceries', price: '', unit: 'kg', stock_quantity: '100', stockStatus: 'Full Stock', image_url: '📦', packages: [] });
              }}
            >
              Cancel Edit
            </GlassButton>
          )}
        </div>

        <form onSubmit={handleSaveProductForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Basmati Rice, Surf Excel"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">
                Store Category *
              </label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-emerald-400"
              >
                {(storeCategories || []).map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-[#0A0E1E] text-white">
                    🏷️ {cat.name}
                  </option>
                ))}
                <option value="Groceries" className="bg-[#0A0E1E] text-white">🌾 Groceries (Taaza Rashan)</option>
                <option value="Cold Drinks" className="bg-[#0A0E1E] text-white">🥤 Cold Drinks & Juices</option>
                <option value="Household" className="bg-[#0A0E1E] text-white">🧼 Household & Cleaning</option>
                <option value="Snacks & Dairy" className="bg-[#0A0E1E] text-white">🍪 Snacks & Dairy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Base Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 90"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Unit of Measurement</label>
              <select
                value={newProduct.unit}
                onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-violet-400 font-bold"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="packet">Packet (pkt)</option>
                <option value="piece">Piece (pc)</option>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Stock Status</label>
              <select
                value={newProduct.stockStatus}
                onChange={e => setNewProduct({ ...newProduct, stockStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-violet-400"
              >
                <option value="Full Stock">🟢 Full Stock</option>
                <option value="Few Available">🟡 Few Available</option>
                <option value="Out of Stock">🔴 Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newProduct.stock_quantity}
                onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A0E1E]/85 border border-white/12 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A5B4CC] mb-1">Product Photo / Upload Image</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0A0E1E] border border-white/12 hover:border-violet-400 rounded-2xl cursor-pointer text-xs text-violet-300 font-bold transition-all shadow-inner">
                  <span>📁 Select Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          setNewProduct(prev => ({ ...prev, image_url: re.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {newProduct.image_url && (
                  <button
                    type="button"
                    onClick={() => setNewProduct(prev => ({ ...prev, image_url: '' }))}
                    className="px-2.5 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                    title="Remove Image"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Preview & Quick Emoji Helpers */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-xs overflow-hidden">
                  {newProduct.image_url?.startsWith('http') || newProduct.image_url?.startsWith('data:') ? (
                    <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl">{newProduct.image_url || '📦'}</span>
                  )}
                </div>
                <div className="flex gap-1 overflow-x-auto text-base py-0.5">
                  {['🌾', '🍚', '🫘', '🍬', '🫒', '🧂', '🥤', '🧴', '🧼', '🧹', '📦'].map(emo => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewProduct(prev => ({ ...prev, image_url: emo }))}
                      className="px-1.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-sm cursor-pointer"
                      title="Use Emoji"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Package Builder Sub-form */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">
              📦 Custom Weight / Size Packages for this product:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                placeholder="Package Name (e.g. Family Pack)"
                value={pkgNameInput}
                onChange={e => setPkgNameInput(e.target.value)}
                className="px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                placeholder={`Weight/Size (e.g. 5 ${newProduct.unit})`}
                value={pkgWeightInput}
                onChange={e => setPkgWeightInput(e.target.value)}
                className="px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={pkgPriceInput}
                onChange={e => setPkgPriceInput(e.target.value)}
                className="px-3 py-2 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddOrUpdatePackage}
                className="py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {editingPkgId ? 'Update Pack' : '+ Add Package'}
              </button>
            </div>

            {/* List of configured packages */}
            {(newProduct.packages || []).length > 0 && (
              <div className="space-y-1.5 pt-2">
                {newProduct.packages.map(pkg => (
                  <div key={pkg.packageId} className="flex items-center justify-between bg-[#0A0E1E] px-3 py-2 rounded-xl text-xs">
                    <span>
                      <b>{pkg.packageName || pkg.weight}</b> ({pkg.weight}) — <span className="text-emerald-300 font-bold">₹{pkg.price}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(pkg.packageId)}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <GlassButton type="submit" variant="primary" size="md">
            {editingProductId ? '💾 Save Product Changes' : '✨ Add Product to Store'}
          </GlassButton>
        </form>
      </div>

      {/* Inventory & Quick Edit Table Panel */}
      <div className="liquid-glass-panel rounded-[28px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Live Store Inventory ({products.length})</h3>
            <p className="text-xs text-[#A5B4CC]">Inline quick price updates, stock management & package view</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={adminProdSearch}
                onChange={e => setAdminProdSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0A0E1E] border border-white/10 rounded-xl text-xs text-white w-40 sm:w-48"
              />
            </div>

            <div className="flex items-center p-1 rounded-xl bg-[#0A0E1E] border border-white/10 text-[11px]">
              {['ALL', 'LOW', 'FAST', 'SLOW'].map(f => (
                <button
                  key={f}
                  onClick={() => setStockFilterMode(f)}
                  className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    stockFilterMode === f ? 'bg-violet-600 text-white' : 'text-[#A5B4CC] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/10 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <ProductThumbnail src={prod.image_url} alt={prod.name} className="w-12 h-12 bg-white/10 p-1 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{prod.name}</h4>
                  <p className="text-[11px] text-[#A5B4CC]">{prod.category} • Unit: <b className="text-cyan-300 uppercase">{prod.unit}</b></p>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    prod.stockStatus === 'Full Stock' ? 'bg-emerald-500/20 text-emerald-300' :
                    prod.stockStatus === 'Few Available' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {prod.stockStatus}
                  </span>
                </div>
              </div>

              {/* Inline Quick Price Update */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Price:</span>
                  <input
                    type="number"
                    defaultValue={prod.price}
                    onChange={e => setInlinePriceMap({ ...inlinePriceMap, [prod.id]: e.target.value })}
                    className="w-16 px-2 py-1 bg-[#0A0E1E] border border-white/15 rounded-lg text-white font-bold text-center text-xs"
                  />
                  {inlinePriceMap[prod.id] !== undefined && (
                    <button
                      onClick={() => handleQuickPriceSave(prod.id)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <GlassButton variant="secondary" size="sm" icon={Edit3} onClick={() => startEditProduct(prod)} />
                  <GlassButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => {
                      if (window.confirm(`Delete ${prod.name}?`)) {
                        deleteProduct(prod.id);
                        if (onToast) onToast('Product Deleted', `${prod.name} removed.`);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
