import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

/**
 * Header for public pages (landing, login, register).
 * @param {boolean} hideLogin - When true, do not show the Login link (e.g. on Login page).
 * @param {boolean} hideGetStarted - When true, do not show the Get Started link (e.g. on Register page).
 */
export function PublicHeader({ hideLogin = false, hideGetStarted = false }) {
  const { lang, changeLang, t } = useLang();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-brand-navy/8 bg-brand-bg/95 backdrop-blur-sm">
      <nav className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-5 md:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 object-contain" aria-hidden />
            <span className="text-lg font-semibold text-brand-navy tracking-tight truncate">Test Report</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center bg-brand-navy/5 rounded-lg p-0.5" role="group" aria-label={t('landing.langSwitch') || 'Language'}>
              <button
                type="button"
                onClick={() => changeLang('en')}
                className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${lang === 'en' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy/70 hover:text-brand-navy'}`}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => changeLang('ja')}
                className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${lang === 'ja' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy/70 hover:text-brand-navy'}`}
                aria-pressed={lang === 'ja'}
              >
                日本語
              </button>
            </div>
            {!hideLogin && (
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-medium text-brand-navy/70 hover:text-brand-navy rounded-lg hover:bg-brand-navy/5 transition-colors"
              >
                {t('auth.login')}
              </Link>
            )}
            {!hideGetStarted && (
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-navy hover:bg-brand-navy-light rounded-lg transition-colors"
              >
                {t('landing.getStarted')}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
