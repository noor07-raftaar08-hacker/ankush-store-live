import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StoreProvider, useStore } from './StoreContext';
import PublicStore from './PublicStore';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import CustomerLoginModal from './CustomerLoginModal';
import { User, Lock, Eye, EyeOff } from './components/Icons';

// Admin Authentication Screen
function AdminLoginView({ onLoginSuccess, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === 'AnkushStore' && password === 'AGenStore@071') {
      localStorage.setItem('ankush_admin_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Galat Credentials! Sirf shop owner access kar sakte hain.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white mb-6 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Back to Store
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-block mb-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-black text-white">Ankush Store Admin</h1>
          <p className="text-slate-400 text-xs mt-1">
            Store Owner & Executive Management Portal
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-5 text-center"
          >
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-xl font-black text-xs shadow-lg shadow-amber-900/40 hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer mt-2"
          >
            🚀 Authenticate & Open Dashboard
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// Master Content Switcher
function AppContent() {
  const { currentView, setCurrentView, isAdminAuth, setIsAdminAuth } = useStore();

  return (
    <div
      className={`min-h-screen font-sans ${
        currentView === 'admin'
          ? 'text-slate-100'
          : 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white'
      }`}
      style={currentView === 'admin' ? { backgroundColor: 'var(--bg, #0b0720)' } : {}}
    >
      {/* Main View Router */}
      {currentView === 'admin' ? (
        isAdminAuth ? (
          <AdminDashboard />
        ) : (
          <AdminLoginView
            onLoginSuccess={() => setIsAdminAuth(true)}
            onBack={() => setCurrentView('home')}
          />
        )
      ) : currentView === 'account' ? (
        <CustomerDashboard />
      ) : (
        <PublicStore />
      )}

      {/* Unified Global Customer & Admin Login Modal */}
      <CustomerLoginModal />
    </div>
  );
}

// Root Application with Unified Central Context
export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
