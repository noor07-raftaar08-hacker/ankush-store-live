import React, { useState } from 'react';

export default function CommunityNewsletter({ onToast }) {
  const [contactInput, setContactInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setSubscribed(true);
    setContactInput('');
    if (onToast) onToast('Subscribed!', 'Welcome to Ankush Fresh Community. Deals will be sent directly to your WhatsApp!');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-[#e8f5ec] border border-emerald-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        
        {/* Left Headline */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
            ✉️
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Join Our Fresh Community
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Get exclusive offers, seasonal discount alerts, and healthy cooking tips directly on WhatsApp!
            </p>
          </div>
        </div>

        {/* Right Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-auto flex items-center max-w-md gap-2">
          {subscribed ? (
            <div className="bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow">
              <span>✓ Subscribed to Fresh Community!</span>
            </div>
          ) : (
            <>
              <input
                type="text"
                required
                value={contactInput}
                onChange={e => setContactInput(e.target.value)}
                placeholder="Enter your WhatsApp or phone number"
                className="w-full sm:w-72 px-4 py-3 rounded-2xl bg-white border border-emerald-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition-colors shrink-0 shadow-md cursor-pointer"
              >
                Subscribe
              </button>
            </>
          )}
        </form>

      </div>
    </section>
  );
}
