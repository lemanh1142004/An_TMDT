import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Activity } from 'lucide-react';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <span>FASHION STORE</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Foundation Ready
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Fashion Store Platform. Modular Architecture.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Gateway: 8081
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Backend: 8080
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
