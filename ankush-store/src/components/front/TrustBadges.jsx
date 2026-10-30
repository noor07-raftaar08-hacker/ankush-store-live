import React from 'react';

export default function TrustBadges() {
  const badges = [
    {
      icon: '🚚',
      title: 'Fast & Reliable Delivery',
      subtitle: 'At your doorstep in Khorma & Pratappur'
    },
    {
      icon: '🥬',
      title: '100% Fresh Guarantee',
      subtitle: 'Pure quality & genuine store brands'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      subtitle: 'UPI QR scan & COD with confidence'
    },
    {
      icon: '🔄',
      title: 'Easy Returns & Support',
      subtitle: 'Hassle-free direct WhatsApp assistance'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {b.icon}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                {b.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {b.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
