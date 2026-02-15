import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

/**
 * Shared layout for legal pages (Privacy Policy, Terms).
 * Sticky footer: main has flex-1 so footer stays at bottom when content is short.
 */
export function LegalLayout({ title, lastUpdated, children }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col bg-atmosphere">
      <header className="sticky top-0 z-20 w-full border-b border-brand-navy/8 bg-brand-bg/95 backdrop-blur-sm shrink-0">
        <nav className="w-full max-w-5xl mx-auto px-6 md:px-10 py-5 md:py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-navy/70 hover:text-brand-accent rounded-lg hover:bg-brand-accent/5 transition-colors"
              aria-label={t('legal.backToHome')}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('legal.backToHome')}
            </Link>
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="" className="h-7 w-7 shrink-0 object-contain" aria-hidden />
              <span className="text-sm font-semibold text-brand-navy tracking-tight">Test Report</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-brand-navy/50 text-sm mb-10">
          {t('legal.lastUpdated')}: {lastUpdated}
        </p>
        {children}
      </main>

      <footer className="bg-section-depth-clean border-t border-brand-navy/10 shrink-0">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-7 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 text-sm text-brand-navy/60">
            <p>© {new Date().getFullYear()} Sun Tzu Technologies. {t('landing.allRightsReserved')}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <a
                href="mailto:suntzutechnologies@gmail.com"
                className="hover:text-brand-accent transition-colors"
              >
                suntzutechnologies@gmail.com
              </a>
              <Link to="/privacy-policy" className="hover:text-brand-accent transition-colors">
                {t('legal.privacyPolicy')}
              </Link>
              <Link to="/terms" className="hover:text-brand-accent transition-colors">
                {t('legal.terms')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
