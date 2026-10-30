import React from 'react';
import { DEFAULT_CUSTOMER_REVIEWS } from '../../services/storeDesignService';

export default function CustomerReviews() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real feedback from local families in Khorma & Pratappur
          </p>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
          className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 group"
        >
          <span>View All Reviews</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Testimonials Grid (Matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {DEFAULT_CUSTOMER_REVIEWS.map(rev => (
          <div
            key={rev.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* 5 Stars */}
              <div className="flex text-amber-400 text-sm mb-3">
                ★★★★★
              </div>
              {/* Quote */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                "{rev.quote}"
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4">
              <img
                src={rev.avatar}
                alt={rev.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {rev.name}
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {rev.city}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
