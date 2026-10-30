import React from 'react';
import { useStore } from '../../StoreContext';
import { Menu } from '../../components/Icons';

export default function CategoryNavStrip({
  selectedCategory,
  onCategorySelect,
  onOpenOffers
}) {
  const { storeCategories } = useStore();

  const activeCategories = storeCategories
    .filter(c => c.isActive !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <div className="bg-white border-b border-slate-200/80 hidden md:block select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-xs py-2 gap-4">
          
          {/* Horizontally Scrollable Category Pills */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
            <button
              onClick={() => onCategorySelect('All')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🛒 All Products
            </button>

            {activeCategories.map(cat => {
              const isSelected = selectedCategory === (cat.slug || cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.slug || cat.name)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Right Offers & Deals Link */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenOffers}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>🔥</span>
              <span>Daily Deals</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
