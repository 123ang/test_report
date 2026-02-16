import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: HomeIcon },
  { to: '/projects', labelKey: 'nav.projects', icon: FolderIcon },
  { to: '/csv-import', labelKey: 'nav.import', icon: UploadIcon },
];

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, changeLang, t } = useLang();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top bar: logo, nav links, lang, user, logout */}
      <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-2 sm:gap-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden -ml-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <img src="/logo.png" alt="Test Report" className="w-8 h-8 flex-shrink-0 object-contain" />
          <span className="font-semibold text-slate-900 hidden sm:block truncate">Test Report</span>
        </Link>

        {/* Top nav: Dashboard, Projects, Import CSV */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 ml-2" aria-label="Main">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            const label = item.labelKey ? t(item.labelKey) : item.label;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-slate-900/20 md:hidden" onClick={closeMenu} aria-hidden="true" />
            <div className="fixed top-14 left-4 right-4 z-40 md:hidden bg-white rounded-xl border border-slate-200 shadow-lg py-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                const label = item.labelKey ? t(item.labelKey) : item.label;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => changeLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLang('ja')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'ja' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              JA
            </button>
          </div>
          <div className="hidden sm:block text-right min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]" title={user?.name}>{user?.name}</p>
            <p className="text-xs text-slate-500 truncate max-w-[120px]" title={user?.email}>{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            title={t('nav.logout')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content - full width */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
