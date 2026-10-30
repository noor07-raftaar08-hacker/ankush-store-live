import React, { useRef } from 'react';
import { useStore } from '../../StoreContext';

export default function ShopByCategory({ selectedCategory, onSelectCategory }) {
  const { storeCategories } = useStore();
  const scrollContainerRef = useRef(null);

  const activeCategories = storeCategories
    .filter(c => c.isActive !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectCat = (slugOrName) => {
    onSelectCategory(slugOrName);
    const catalogEl = document.getElementById('main-products-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      {/* Section Header with Left/Right Slider Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop by Category</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Slide horizontally to explore all fresh categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Slider Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll categories left"
          >
            ‹
          </button>

          {/* Slider Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll categories right"
          >
            ›
          </button>

          <button
            onClick={() => handleSelectCat('All')}
            className="ml-2 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 group"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Horizontal Sliding Category Strip (Single Row with Smooth Scroll) */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 scroll-smooth"
      >
        {activeCategories.map(cat => {
          const isSelected = selectedCategory === (cat.slug || cat.name);
          return (
            <div
              key={cat.id}
              onClick={() => handleSelectCat(cat.slug || cat.name)}
              className="flex flex-col items-center text-center group cursor-pointer shrink-0"
            >
              {/* White Circular Card with Soft Shadow */}
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-white flex items-center justify-center p-3 shadow-sm hover:shadow-md border transition-all duration-300 group-hover:-translate-y-1 ${
                  isSelected
                    ? 'border-emerald-600 ring-4 ring-emerald-500/20 shadow-emerald-500/10'
                    : 'border-slate-200/90 group-hover:border-emerald-400'
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Category Name Label Below */}
              <span
                className={`text-[11px] sm:text-xs font-bold mt-2 max-w-[96px] truncate leading-tight transition-colors ${
                  isSelected ? 'text-emerald-700 font-black' : 'text-slate-800 group-hover:text-emerald-600'
                }`}
                title={cat.name}
              >
                {cat.name}
              </span>

              {cat.itemCount && (
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px] block mt-0.5">
                  {cat.itemCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
